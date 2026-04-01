import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "./prisma";
import { cloudinary, isCloudinaryConfigured } from "./cloudinary";

const BASE_URL = "https://yeutruyen.me";
const POPULAR_URL = `${BASE_URL}/xem-nhieu/`;

const crawlerClient = axios.create({
  timeout: 20_000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  },
});

export type CrawledStoryListItem = {
  title: string;
  link: string;
  cover?: string;
  latestChapterTitle?: string;
};

export type CrawledStoryDetail = {
  title: string;
  sourceUrl: string;
  description: string;
  cover?: string;
  genres: string[];
};

export type CrawledChapterListItem = {
  title: string;
  link: string;
  chapterNumber: number;
};

export type CrawledChapterPayload = CrawledChapterListItem & {
  content: string;
};

export type CrawledStoryPayload = {
  story: CrawledStoryDetail & {
    link: string;
    slug: string;
  };
  chapters: CrawledChapterPayload[];
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function normalizeText(value?: string | null) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value
    .replace(/[\u0111\u0110]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toAbsoluteUrl(link?: string | null) {
  if (!link) {
    return undefined;
  }

  return link.startsWith("http") ? link : `${BASE_URL}${link}`;
}

function parseChapterNumber(title: string, fallback: number) {
  const match = normalizeText(title).match(/(?:chuong|chương)\s*(\d+)/iu);
  return match ? Number(match[1]) : fallback;
}

function normalizeChapterTitle(chapterNumber: number) {
  return `Chương ${chapterNumber || 1}`;
}

function resolveStoryCover($: cheerio.CheerioAPI) {
  return (
    toAbsoluteUrl($("meta[property='og:image']").attr("content")) ||
    toAbsoluteUrl($("meta[name='twitter:image']").attr("content")) ||
    toAbsoluteUrl($(".image-truyen img").first().attr("data-src")) ||
    toAbsoluteUrl($(".image-truyen img").first().attr("src")) ||
    toAbsoluteUrl($(".book img").first().attr("data-src")) ||
    toAbsoluteUrl($(".book img").first().attr("src"))
  );
}

async function downloadCoverToLocal(sourceUrl: string | undefined, slug: string) {
  if (!sourceUrl || !isCloudinaryConfigured()) {
    return undefined;
  }

  const response = await crawlerClient.get<ArrayBuffer>(sourceUrl, {
    responseType: "arraybuffer",
  });
  const mimeType =
    response.headers["content-type"]?.toString() || "image/jpeg";

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

export async function fetchWithRetry(url: string, retries = 3) {
  for (let index = 0; index < retries; index += 1) {
    try {
      const response = await crawlerClient.get(url);
      return response.data as string;
    } catch (error) {
      if (index === retries - 1) {
        throw error;
      }

      await sleep(1_000);
    }
  }

  throw new Error(`Failed to fetch ${url}`);
}

export async function crawlStoryList(
  listUrl: string,
  page = 1,
): Promise<CrawledStoryListItem[]> {
  const normalizedListUrl = listUrl.endsWith("/") ? listUrl : `${listUrl}/`;
  const url = page <= 1 ? normalizedListUrl : `${normalizedListUrl}page/${page}/`;
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);
  const stories: CrawledStoryListItem[] = [];
  const seen = new Set<string>();

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

export async function crawlStoryDetail(url: string): Promise<CrawledStoryDetail> {
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);

  const title = normalizeText($("h1").first().text());
  const description =
    normalizeText($(".desc").first().text()) ||
    normalizeText($("meta[name='description']").attr("content"));
  const cover = resolveStoryCover($);

  const genres = new Set<string>();
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

export async function crawlChapters(url: string): Promise<CrawledChapterListItem[]> {
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);
  const chapters: CrawledChapterListItem[] = [];
  const seen = new Set<string>();

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

export function cleanChapterHtml(rawHtml: string) {
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

export async function crawlChapterContent(url: string): Promise<string> {
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

export async function saveStory(detail: CrawledStoryDetail) {
  const slug = slugify(detail.title);
  const localCover = await downloadCoverToLocal(detail.cover, slug);
  const finalCover = localCover || detail.cover;

  const savedStory = await prisma.story.upsert({
    where: { slug },
    update: {
      title: detail.title,
      description: detail.description,
      cover: finalCover,
    },
    create: {
      title: detail.title,
      slug,
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

  return savedStory;
}

export async function crawlFullStory(url: string, chapterLimit?: number) {
  const detail = await crawlStoryDetail(url);
  const savedStory = await saveStory(detail);
  const chapters = await crawlChapters(url);
  const targetChapters =
    typeof chapterLimit === "number" ? chapters.slice(0, chapterLimit) : chapters;
  const savedChapters: CrawledChapterPayload[] = [];

  for (const chapter of targetChapters) {
    const content = await crawlChapterContent(chapter.link);

    const existing = await prisma.chapter.findFirst({
      where: {
        storyId: savedStory.id,
        chapterNumber: chapter.chapterNumber,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      await prisma.chapter.update({
        where: { id: existing.id },
        data: {
          title: chapter.title,
          content,
        },
      });
    } else {
      await prisma.chapter.create({
        data: {
          storyId: savedStory.id,
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
          content,
        },
      });
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
  };
}

export async function runPopularCrawler(options?: {
  pageLimit?: number;
  storyLimitPerPage?: number;
  chapterLimitPerStory?: number;
}) {
  const results: CrawledStoryPayload[] = [];

  for (let page = 1; page <= (options?.pageLimit ?? 3); page += 1) {
    const stories = await crawlPopularStories(page);
    if (stories.length === 0) {
      break;
    }

    for (const story of stories.slice(0, options?.storyLimitPerPage ?? stories.length)) {
      try {
        const result = await crawlFullStory(story.link, options?.chapterLimitPerStory);
        results.push(result);
      } catch (error) {
        console.error("Crawler error:", story.link, error);
      }
    }

    await sleep(2_000);
  }

  return results;
}
