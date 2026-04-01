import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "./prisma";

const BASE_URL = "https://yeutruyen.me";

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
};

export type CrawledStoryDetail = {
  title: string;
  description: string;
  cover?: string;
};

export type CrawledChapterListItem = {
  title: string;
  link: string;
  chapterNumber: number;
};

export type CrawledStoryPayload = {
  story: CrawledStoryDetail & {
    link: string;
  };
  chapters: Array<
    CrawledChapterListItem & {
      content: string;
    }
  >;
};

function toAbsoluteUrl(link?: string | null) {
  if (!link) {
    return undefined;
  }

  return link.startsWith("http") ? link : `${BASE_URL}${link}`;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function crawlStoryList(page = 1): Promise<CrawledStoryListItem[]> {
  const url = `${BASE_URL}/ngon-tinh?page=${page}`;
  const { data } = await crawlerClient.get(url);
  const $ = cheerio.load(data);

  const stories: CrawledStoryListItem[] = [];
  const seenLinks = new Set<string>();

  $("article, .item, .story-item").each((_, el) => {
    const aTag = $(el).find("a").first();
    const title = aTag.attr("title") || normalizeText(aTag.text());
    const link = toAbsoluteUrl(aTag.attr("href"));
    const cover = toAbsoluteUrl($(el).find("img").attr("src"));

    if (!link || !title || seenLinks.has(link)) {
      return;
    }

    seenLinks.add(link);
    stories.push({ title, link, cover });
  });

  return stories;
}

export async function crawlStoryDetail(
  url: string,
): Promise<CrawledStoryDetail> {
  const { data } = await crawlerClient.get(url);
  const $ = cheerio.load(data);

  const title = normalizeText($("h1").first().text());
  const description =
    normalizeText($(".desc").first().text()) ||
    normalizeText($(".content").first().text());
  const cover =
    toAbsoluteUrl($(".book img").attr("src")) ||
    toAbsoluteUrl($("img").first().attr("src"));

  return {
    title,
    description,
    cover,
  };
}

export async function crawlChapters(
  url: string,
): Promise<CrawledChapterListItem[]> {
  const { data } = await crawlerClient.get(url);
  const $ = cheerio.load(data);

  const chapters: CrawledChapterListItem[] = [];
  const seenLinks = new Set<string>();

  $("a[href*='/chuong-']").each((index, el) => {
    const link = toAbsoluteUrl($(el).attr("href"));
    const title = normalizeText($(el).text());

    if (!link || !title || seenLinks.has(link)) {
      return;
    }

    seenLinks.add(link);
    chapters.push({
      title,
      link,
      chapterNumber: index + 1,
    });
  });

  return chapters;
}

export function cleanChapterHtml(rawHtml: string) {
  const $ = cheerio.load(rawHtml);

  $("script, style, noscript, iframe, ads, .ads, .banner, .quangcao").remove();

  const textNodesToStrip = [/quang cao/gi, /quảng cáo/gi, /ads by/gi];
  const html = $.root().html() ?? "";

  return textNodesToStrip
    .reduce((value, pattern) => value.replace(pattern, ""), html)
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function crawlChapterContent(url: string): Promise<string> {
  const { data } = await crawlerClient.get(url);
  const $ = cheerio.load(data);

  const content =
    $("#chapter-content").html() ||
    $(".article-content").html() ||
    $(".content").html();

  if (!content) {
    return "";
  }

  return cleanChapterHtml(content);
}

export async function crawlStoryJson(url: string): Promise<CrawledStoryPayload> {
  const detail = await crawlStoryDetail(url);
  const chapters = await crawlChapters(url);

  const chaptersWithContent = await Promise.all(
    chapters.map(async (chapter) => ({
      ...chapter,
      content: await crawlChapterContent(chapter.link),
    })),
  );

  return {
    story: {
      ...detail,
      link: url,
    },
    chapters: chaptersWithContent,
  };
}

export async function saveStory(detail: CrawledStoryDetail) {
  const slug = slugify(detail.title);

  return prisma.story.upsert({
    where: {
      slug,
    },
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
}

export async function crawlOneStory() {
  const list = await crawlStoryList(1);
  const story = list[0];

  if (!story) {
    throw new Error("No stories found on the source page.");
  }

  const detail = await crawlStoryDetail(story.link);
  const savedStory = await saveStory(detail);
  const chapters = await crawlChapters(story.link);

  for (const chap of chapters.slice(0, 5)) {
    const content = await crawlChapterContent(chap.link);
    const existingChapter = await prisma.chapter.findFirst({
      where: {
        storyId: savedStory.id,
        chapterNumber: chap.chapterNumber,
      },
      select: {
        id: true,
      },
    });

    if (existingChapter) {
      await prisma.chapter.update({
        where: {
          id: existingChapter.id,
        },
        data: {
          title: chap.title,
          content,
        },
      });
    } else {
      await prisma.chapter.create({
        data: {
          storyId: savedStory.id,
          chapterNumber: chap.chapterNumber,
          title: chap.title,
          content,
        },
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  return {
    story: {
      ...detail,
      link: story.link,
      savedStoryId: savedStory.id,
    },
    chapters: chapters.slice(0, 5),
  };
}
