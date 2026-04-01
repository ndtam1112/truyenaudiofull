import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "./prisma";

const BASE_URL = "https://yeutruyen.me";
const POPULAR_URL = `${BASE_URL}/xem-nhieu/`;

const crawlerClient = axios.create({
  timeout: 20_000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
});

export type CrawledCategory = {
  name: string;
  slug: string;
  link: string;
};

export type CrawledStoryListItem = {
  title: string;
  link: string;
  cover?: string;
  latestChapterTitle?: string;
};

export type CrawledStoryDetail = {
  title: string;
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
  category?: CrawledCategory;
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
    .replace(/[đĐ]/g, "d")
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

function isCategoryPath(pathname: string) {
  const ignored = new Set([
    "",
    "/",
    "/de-cu",
    "/xem-nhieu",
    "/moi-cap-nhat",
    "/moi-nhat",
    "/dang-ky",
    "/dang-nhap",
    "/tai-khoan",
    "/full",
  ]);

  if (ignored.has(pathname) || pathname.includes("/chuong-")) {
    return false;
  }

  return pathname.split("/").filter(Boolean).length === 1;
}

function parseChapterNumber(title: string, fallback: number) {
  const match = title.match(/(?:chuong|chương)\s*(\d+)/iu);
  return match ? Number(match[1]) : fallback;
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

export async function crawlPopularStories(
  page = 1,
): Promise<CrawledStoryListItem[]> {
  return crawlStoryList(POPULAR_URL, page);
}

export async function crawlStoryDetail(
  url: string,
  category?: CrawledCategory,
): Promise<CrawledStoryDetail> {
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);

  const title = normalizeText($("h1").first().text());
  const description =
    normalizeText($(".desc").first().text()) ||
    normalizeText($(".content").first().text()) ||
    normalizeText($("meta[name='description']").attr("content") ?? "");
  const cover =
    toAbsoluteUrl($(".book img").attr("src")) ||
    toAbsoluteUrl($("img").first().attr("src"));

  const genreSet = new Set<string>();
  if (category?.name) {
    genreSet.add(category.name);
  }

  $("a[href]").each((_, element) => {
    const href = toAbsoluteUrl($(element).attr("href"));
    const text = normalizeText($(element).text());

    if (!href || !text) {
      return;
    }

    const pathname = new URL(href).pathname.replace(/\/+$/, "");
    if (isCategoryPath(pathname) && text.length > 1 && text.length < 30) {
      genreSet.add(text);
    }
  });

  return {
    title,
    description,
    cover,
    genres: Array.from(genreSet),
  };
}

export async function crawlChapters(
  url: string,
): Promise<CrawledChapterListItem[]> {
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);
  const chapters: CrawledChapterListItem[] = [];
  const seen = new Set<string>();

  const firstChapterLink = toAbsoluteUrl($("#first_chap").attr("href"));
  if (firstChapterLink) {
    seen.add(firstChapterLink);
    chapters.push({
      title: "Chuong 1",
      link: firstChapterLink,
      chapterNumber: 1,
    });
  }

  $(".list a.chap-title[href]").each((index, element) => {
    const link = toAbsoluteUrl($(element).attr("href"));
    const title =
      normalizeText($(element).attr("title")) || normalizeText($(element).text());

    if (!link || !title || seen.has(link)) {
      return;
    }

    seen.add(link);
    chapters.push({
      title,
      link,
      chapterNumber: parseChapterNumber(title, index + 1),
    });
  });

  return chapters.sort((left, right) => left.chapterNumber - right.chapterNumber);
}

export function cleanChapterHtml(rawHtml: string) {
  const $ = cheerio.load(`<div id="root">${rawHtml}</div>`);
  const root = $("#root");

  root.find("script, style, noscript, iframe").remove();
  root.find("div, p, span").each((_, element) => {
    const text = normalizeText($(element).text());
    if (/quảng cáo|quang cao|mở ứng dụng shopee|mở ứng dụng lazada|lưu ý:/iu.test(text)) {
      $(element).remove();
    }
  });

  return (root.html() ?? "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/quảng cáo/giu, "")
    .replace(/quang cao/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function crawlChapterContent(url: string): Promise<string> {
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);

  const content =
    $("#chapter-content").html() ||
    $(".article-content").html() ||
    $(".content").html();

  if (!content) {
    return "";
  }

  return cleanChapterHtml(content);
}

export async function crawlStoryJson(
  url: string,
  category?: CrawledCategory,
): Promise<CrawledStoryPayload> {
  const detail = await crawlStoryDetail(url, category);
  const chapters = await crawlChapters(url);

  const chaptersWithContent = await Promise.all(
    chapters.map(async (chapter): Promise<CrawledChapterPayload> => ({
      ...chapter,
      content: await crawlChapterContent(chapter.link),
    })),
  );

  return {
    category,
    story: {
      ...detail,
      link: url,
      slug: slugify(detail.title),
    },
    chapters: chaptersWithContent,
  };
}

export async function saveStory(
  detail: CrawledStoryDetail,
  category?: CrawledCategory,
) {
  const slug = slugify(detail.title);
  const genreNames = Array.from(
    new Set([...(detail.genres ?? []), ...(category?.name ? [category.name] : [])]),
  ).filter(Boolean);

  const savedStory = await prisma.story.upsert({
    where: { slug },
    update: {
      title: detail.title,
      description: detail.description,
      cover: detail.cover,
    },
    create: {
      title: detail.title,
      slug,
      description: detail.description,
      cover: detail.cover,
    },
  });

  for (const genreName of genreNames) {
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

export async function crawlFullStory(
  url: string,
  category?: CrawledCategory,
  chapterLimit?: number,
) {
  const detail = await crawlStoryDetail(url, category);
  const savedStory = await saveStory(detail, category);
  const chapters = await crawlChapters(url);
  const targetChapters =
    typeof chapterLimit === "number" ? chapters.slice(0, chapterLimit) : chapters;
  const savedChapters: CrawledChapterPayload[] = [];

  for (const chap of targetChapters) {
    const existing = await prisma.chapter.findFirst({
      where: {
        storyId: savedStory.id,
        chapterNumber: chap.chapterNumber,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      continue;
    }

    const content = await crawlChapterContent(chap.link);

    await prisma.chapter.create({
      data: {
        storyId: savedStory.id,
        chapterNumber: chap.chapterNumber,
        title: chap.title,
        content,
      },
    });

    savedChapters.push({
      ...chap,
      content,
    });

    await sleep(800);
  }

  return {
    category,
    story: {
      ...detail,
      link: url,
      slug: savedStory.slug,
    },
    chapters: savedChapters,
  };
}

export async function crawlOneStory() {
  const list = await crawlPopularStories(1);
  const story = list[0];

  if (!story) {
    throw new Error("No stories found on the popular page.");
  }

  return crawlFullStory(story.link, undefined, 5);
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
        const result = await crawlFullStory(
          story.link,
          undefined,
          options?.chapterLimitPerStory,
        );
        results.push(result);
      } catch (error) {
        console.error("Crawler error:", story.link, error);
      }
    }

    await sleep(2_000);
  }

  return results;
}
