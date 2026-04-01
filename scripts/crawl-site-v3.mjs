import axios from "axios";
import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

export const BASE_URL = "https://yeutruyen.me";
export const POPULAR_URL = `${BASE_URL}/xem-nhieu/`;
export const prisma = new PrismaClient();
const CRAWL_STATE_PATH = path.join(process.cwd(), ".crawler-state", "popular-v3.json");
const isCloudinaryReady = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (isCloudinaryReady) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const crawlerClient = axios.create({
  timeout: 20_000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function randomDelay(minMs = 700, maxMs = 1800) {
  const jitter = Math.floor(Math.random() * (maxMs - minMs + 1));
  return sleep(minMs + jitter);
}

async function withRetry(taskName, fn, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }

      console.warn(`[retry:${attempt}/${retries}] ${taskName}`);
      await randomDelay(1200, 2600);
    }
  }

  throw lastError;
}

async function ensureStateDir() {
  await mkdir(path.dirname(CRAWL_STATE_PATH), { recursive: true });
}

async function readCrawlerState() {
  try {
    const raw = await readFile(CRAWL_STATE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      lastPageCrawled: 0,
      lastStoryUrl: null,
      completed: false,
      updatedAt: null,
    };
  }
}

async function writeCrawlerState(partialState) {
  await ensureStateDir();
  const current = await readCrawlerState();
  const nextState = {
    ...current,
    ...partialState,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(CRAWL_STATE_PATH, JSON.stringify(nextState, null, 2));
}

async function clearCrawlerState() {
  try {
    await rm(CRAWL_STATE_PATH, { force: true });
  } catch {}
}

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[\u0111\u0110]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toAbsoluteUrl(link) {
  if (!link) {
    return undefined;
  }

  return link.startsWith("http") ? link : `${BASE_URL}${link}`;
}

function parseChapterNumber(title, fallback) {
  const match = normalizeText(title).match(/(?:chuong|chương)\s*(\d+)/iu);
  return match ? Number(match[1]) : fallback;
}

function normalizeChapterTitle(chapterNumber) {
  return `Chương ${chapterNumber || 1}`;
}

function hashContent(value) {
  return createHash("sha256").update(value).digest("hex");
}

function resolveStoryCover($) {
  return (
    toAbsoluteUrl($("meta[property='og:image']").attr("content")) ||
    toAbsoluteUrl($("meta[name='twitter:image']").attr("content")) ||
    toAbsoluteUrl($(".image-truyen img").first().attr("data-src")) ||
    toAbsoluteUrl($(".image-truyen img").first().attr("src")) ||
    toAbsoluteUrl($(".book img").first().attr("data-src")) ||
    toAbsoluteUrl($(".book img").first().attr("src"))
  );
}

async function uploadCoverToCloudinary(sourceUrl, slug) {
  if (!sourceUrl || !isCloudinaryReady) {
    return undefined;
  }

  const response = await crawlerClient.get(sourceUrl, {
    responseType: "arraybuffer",
  });
  const mimeType = response.headers["content-type"]?.toString() || "image/jpeg";

  const uploaded = await cloudinary.uploader.upload(
    `data:${mimeType};base64,${Buffer.from(response.data).toString("base64")}`,
    {
      folder: "truyenaudiofull/covers",
      public_id: slug,
      overwrite: true,
      resource_type: "image",
    },
  );

  return uploaded.secure_url;
}

export async function fetchWithRetry(url, retries = 3) {
  for (let index = 0; index < retries; index += 1) {
    try {
      const response = await crawlerClient.get(url);
      return response.data;
    } catch (error) {
      if (index === retries - 1) {
        throw error;
      }

      await sleep(1_000);
    }
  }

  throw new Error(`Failed to fetch ${url}`);
}

export async function getPopularPageCount() {
  const html = await fetchWithRetry(POPULAR_URL);
  const $ = cheerio.load(html);
  let maxPage = 1;

  $(".pagination a[data-page]").each((_, element) => {
    const value = Number($(element).attr("data-page"));
    if (Number.isFinite(value) && value > maxPage) {
      maxPage = value;
    }
  });

  return maxPage;
}

export async function crawlStoryList(listUrl, page = 1) {
  const normalizedListUrl = listUrl.endsWith("/") ? listUrl : `${listUrl}/`;
  const url = page <= 1 ? normalizedListUrl : `${normalizedListUrl}page/${page}/`;
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);
  const stories = [];
  const seen = new Set();

  $("#page-moi").each((_, element) => {
    const card = $(element);
    const storyAnchor = card.find("a.uk-position-cover[href]").first();
    const storyLink = toAbsoluteUrl(storyAnchor.attr("href"));
    const titleNode = card.find("h3.de-cu-title").first().clone();
    titleNode.find(".chap-title").remove();

    const title = normalizeText(titleNode.text());
    const cover = toAbsoluteUrl(
      card.find("img").first().attr("data-src") || card.find("img").first().attr("src"),
    );
    const latestChapterTitle = normalizeText(card.find(".chap-title a").first().text());

    if (!storyLink || !title || seen.has(storyLink)) {
      return;
    }

    seen.add(storyLink);
    stories.push({
      title,
      link: storyLink,
      cover,
      latestChapterTitle: latestChapterTitle || undefined,
    });
  });

  return stories;
}

export async function crawlPopularStories(page = 1) {
  return crawlStoryList(POPULAR_URL, page);
}

export async function crawlStoryDetail(url) {
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);

  const title = normalizeText($("h1").first().text());
  const description =
    normalizeText($(".desc").first().text()) ||
    normalizeText($("meta[name='description']").attr("content"));
  const cover = resolveStoryCover($);

  const genres = new Set();
  $(".info-truyen a[rel='category tag'], .info-truyen a[href]").each((_, element) => {
    const text = normalizeText($(element).text());
    if (text) {
      genres.add(text);
    }
  });

  return {
    title,
    sourceUrl: url,
    description,
    cover,
    genres: Array.from(genres),
  };
}

export async function crawlChapters(url) {
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);
  const chapters = [];
  const seen = new Set();

  const firstChapterLink = toAbsoluteUrl($("#first_chap").attr("href"));
  if (firstChapterLink) {
    seen.add(firstChapterLink);
    chapters.push({
      title: "Chương 1",
      link: firstChapterLink,
      chapterNumber: 1,
    });
  }

  $(".list a.chap-title[href]").each((index, element) => {
    const link = toAbsoluteUrl($(element).attr("href"));
    const rawTitle =
      normalizeText($(element).attr("title")) || normalizeText($(element).text());

    if (!link || !rawTitle || seen.has(link)) {
      return;
    }

    const chapterNumber = parseChapterNumber(rawTitle, index + 1);
    seen.add(link);
    chapters.push({
      title: normalizeChapterTitle(chapterNumber),
      link,
      chapterNumber,
    });
  });

  return chapters.sort((left, right) => left.chapterNumber - right.chapterNumber);
}

export function cleanChapterHtml(rawHtml) {
  const $ = cheerio.load(`<div id="root">${rawHtml}</div>`);
  const root = $("#root");

  root.find("script, style, noscript, iframe").remove();
  root.find("#chuong_2_popup_content, #chuong_4_popup_content").remove();
  root.find("a").each((_, element) => {
    $(element).replaceWith($(element).text());
  });
  root.find("br").replaceWith("\n");
  root.find("div, p, li, h1, h2, h3, h4, h5, h6").each((_, element) => {
    const text = normalizeText($(element).text());
    if (/quảng cáo|quang cao|mở ứng dụng shopee|mở ứng dụng lazada|lưu ý:/iu.test(text)) {
      $(element).remove();
      return;
    }

    $(element).append("\n");
  });

  return root
    .text()
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function crawlChapterContent(url) {
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);

  const content =
    $(".reading").first().html() ||
    $("#chapter-content").html() ||
    $(".article-content").html() ||
    $(".content").html();

  if (!content) {
    return "";
  }

  return cleanChapterHtml(content);
}

export async function saveStory(detail) {
  const slug = slugify(detail.title);
  const cloudinaryCover = await uploadCoverToCloudinary(detail.cover, slug);
  const finalCover = cloudinaryCover || detail.cover;

  const storyBySource = detail.sourceUrl
    ? await prisma.story.findUnique({
        where: { sourceUrl: detail.sourceUrl },
        select: { id: true, slug: true },
      })
    : null;

  const storyExisted = Boolean(storyBySource);
  const savedStory = storyBySource
    ? await prisma.story.update({
        where: { id: storyBySource.id },
        data: {
          title: detail.title,
          slug,
          sourceUrl: detail.sourceUrl,
          description: detail.description,
          cover: finalCover,
        },
      })
    : await prisma.story.upsert({
        where: { slug },
        update: {
          title: detail.title,
          sourceUrl: detail.sourceUrl,
          description: detail.description,
          cover: finalCover,
        },
        create: {
          title: detail.title,
          slug,
          sourceUrl: detail.sourceUrl,
          description: detail.description,
          cover: finalCover,
        },
      });

  for (const genreName of detail.genres.filter(Boolean)) {
    const savedGenre = await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName },
    });

    const existingLink = await prisma.storyGenre.findUnique({
      where: {
        storyId_genreId: {
          storyId: savedStory.id,
          genreId: savedGenre.id,
        },
      },
    });

    if (!existingLink) {
      await prisma.storyGenre.create({
        data: {
          storyId: savedStory.id,
          genreId: savedGenre.id,
        },
      });
    }
  }

  return {
    savedStory,
    action: storyExisted ? "updated" : "created",
  };
}

export async function crawlFullStory(url, chapterLimit) {
  const detail = await crawlStoryDetail(url);
  const { savedStory, action: storyAction } = await saveStory(detail);
  const chapters = await crawlChapters(url);
  const targetChapters =
    typeof chapterLimit === "number" ? chapters.slice(0, chapterLimit) : chapters;
  const savedChapters = [];
  const stats = {
    story: storyAction,
    chapters: {
      created: 0,
      updated: 0,
      skipped: 0,
    },
  };

  for (const chapter of targetChapters) {
    const content = await crawlChapterContent(chapter.link);
    const contentHash = hashContent(content);

    const existing = await prisma.chapter.findUnique({
      where: {
        storyId_chapterNumber: {
          storyId: savedStory.id,
          chapterNumber: chapter.chapterNumber,
        },
      },
      select: {
        id: true,
        contentHash: true,
      },
    });

    if (existing) {
      if (existing.contentHash !== contentHash || existing.contentHash === null) {
        await prisma.chapter.update({
          where: { id: existing.id },
          data: {
            sourceUrl: chapter.link,
            title: chapter.title,
            content,
            contentHash,
          },
        });
        stats.chapters.updated += 1;
      } else {
        stats.chapters.skipped += 1;
      }
    } else {
      await prisma.chapter.create({
        data: {
          storyId: savedStory.id,
          sourceUrl: chapter.link,
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
          content,
          contentHash,
        },
      });
      stats.chapters.created += 1;
    }

    savedChapters.push({
      ...chapter,
      content,
    });

    await sleep(800);
  }

  return {
    story: {
      ...detail,
      link: url,
      slug: savedStory.slug,
      cover: savedStory.cover ?? detail.cover,
    },
    chapters: savedChapters,
    stats,
  };
}

export async function runCrawler(options = {}) {
  const results = [];
  const summary = {
    stories: {
      created: 0,
      updated: 0,
      errors: 0,
    },
    chapters: {
      created: 0,
      updated: 0,
      skipped: 0,
    },
  };
  const resumeEnabled = options.resume !== false;
  const crawlerState = resumeEnabled ? await readCrawlerState() : null;
  const maxPages = options.pageLimit ?? (await getPopularPageCount());
  let startPage = 1;

  if (
    resumeEnabled &&
    crawlerState &&
    crawlerState.completed !== true &&
    Number.isFinite(crawlerState.lastPageCrawled) &&
    crawlerState.lastPageCrawled >= 1
  ) {
    startPage = crawlerState.lastPageCrawled;
  }

  console.log(`Crawling /xem-nhieu/ pages: ${startPage} -> ${maxPages}`);

  for (let page = startPage; page <= maxPages; page += 1) {
    const stories = await withRetry(
      `popular-page:${page}`,
      () => crawlPopularStories(page),
      options.pageRetries ?? 3,
    );
    if (stories.length === 0) {
      break;
    }

    console.log(`Popular page ${page}: ${stories.length} stories`);
    const resumeStoryUrl =
      resumeEnabled && page === crawlerState?.lastPageCrawled
        ? crawlerState?.lastStoryUrl
        : null;
    let shouldSkipUntilResumeStory = Boolean(resumeStoryUrl);

    for (const story of stories.slice(0, options.storyLimitPerPage ?? stories.length)) {
      if (shouldSkipUntilResumeStory) {
        if (story.link === resumeStoryUrl) {
          shouldSkipUntilResumeStory = false;
        } else {
          continue;
        }
      }

      try {
        await writeCrawlerState({
          lastPageCrawled: page,
          lastStoryUrl: story.link,
          completed: false,
        });
        console.log(`Crawling: ${story.title}`);
        const result = await withRetry(
          `story:${story.link}`,
          () => crawlFullStory(story.link, options.chapterLimitPerStory),
          options.storyRetries ?? 3,
        );
        results.push(result);
        summary.stories[result.stats.story] += 1;
        summary.chapters.created += result.stats.chapters.created;
        summary.chapters.updated += result.stats.chapters.updated;
        summary.chapters.skipped += result.stats.chapters.skipped;
        console.log(
          `[story:${result.stats.story}] ${result.story.slug} | chapters c/u/s = ${result.stats.chapters.created}/${result.stats.chapters.updated}/${result.stats.chapters.skipped}`,
        );
      } catch (error) {
        console.error("Crawler error:", story.link, error);
        summary.stories.errors += 1;
      }

      await randomDelay(
        options.minDelayMs ?? 900,
        options.maxDelayMs ?? 2200,
      );
    }

    await writeCrawlerState({
      lastPageCrawled: page + 1,
      lastStoryUrl: null,
      completed: false,
    });
    await randomDelay(1800, 3200);
  }

  if (resumeEnabled) {
    await writeCrawlerState({
      lastPageCrawled: maxPages,
      lastStoryUrl: null,
      completed: true,
    });
  }

  return { results, summary };
}

function parseCliArgs(argv) {
  const parsed = {};

  for (const arg of argv) {
    if (!arg.startsWith("--")) {
      continue;
    }

    const [rawKey, rawValue] = arg.slice(2).split("=");
    if (!rawKey || rawValue === undefined) {
      continue;
    }

    const value = Number(rawValue);
    parsed[rawKey] = Number.isFinite(value) ? value : rawValue;
  }

  return parsed;
}

async function main() {
  const cliOptions = parseCliArgs(process.argv.slice(2));
  if (cliOptions.resetState === 1) {
    await clearCrawlerState();
  }

  const result = await runCrawler({
    pageLimit: cliOptions.pageLimit,
    storyLimitPerPage: cliOptions.storyLimitPerPage,
    chapterLimitPerStory: cliOptions.chapterLimitPerStory,
    pageRetries: cliOptions.pageRetries,
    storyRetries: cliOptions.storyRetries,
    minDelayMs: cliOptions.minDelayMs,
    maxDelayMs: cliOptions.maxDelayMs,
    resume: cliOptions.resume !== 0,
  });

  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
