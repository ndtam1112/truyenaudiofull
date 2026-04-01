import axios from "axios";
import * as cheerio from "cheerio";
import { PrismaClient } from "@prisma/client";

const BASE_URL = "https://yeutruyen.me";
const prisma = new PrismaClient();

const crawlerClient = axios.create({
  timeout: 20_000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  },
});

function toAbsoluteUrl(link) {
  if (!link) return undefined;
  return link.startsWith("http") ? link : `${BASE_URL}${link}`;
}

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function crawlStoryList(page = 1) {
  const url = `${BASE_URL}/ngon-tinh?page=${page}`;
  const { data } = await crawlerClient.get(url);
  const $ = cheerio.load(data);
  const stories = [];
  const seenLinks = new Set();

  $("article, .item, .story-item").each((_, el) => {
    const aTag = $(el).find("a").first();
    const title = aTag.attr("title") || normalizeText(aTag.text());
    const link = toAbsoluteUrl(aTag.attr("href"));
    const cover = toAbsoluteUrl($(el).find("img").attr("src"));

    if (!link || !title || seenLinks.has(link)) return;

    seenLinks.add(link);
    stories.push({ title, link, cover });
  });

  return stories;
}

async function crawlStoryDetail(url) {
  const { data } = await crawlerClient.get(url);
  const $ = cheerio.load(data);

  return {
    title: normalizeText($("h1").first().text()),
    description:
      normalizeText($(".desc").first().text()) ||
      normalizeText($(".content").first().text()),
    cover:
      toAbsoluteUrl($(".book img").attr("src")) ||
      toAbsoluteUrl($("img").first().attr("src")),
  };
}

async function crawlChapters(url) {
  const { data } = await crawlerClient.get(url);
  const $ = cheerio.load(data);
  const chapters = [];
  const seenLinks = new Set();

  $("a[href*='/chuong-']").each((index, el) => {
    const link = toAbsoluteUrl($(el).attr("href"));
    const title = normalizeText($(el).text());

    if (!link || !title || seenLinks.has(link)) return;

    seenLinks.add(link);
    chapters.push({
      title,
      link,
      chapterNumber: index + 1,
    });
  });

  return chapters;
}

async function crawlChapterContent(url) {
  const { data } = await crawlerClient.get(url);
  const $ = cheerio.load(data);

  let content =
    $("#chapter-content").html() ||
    $(".article-content").html() ||
    $(".content").html();

  if (!content) return "";

  content = content
    .replace(/<script.*?>.*?<\/script>/gis, "")
    .replace(/quảng cáo/gi, "")
    .replace(/quang cao/gi, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return content;
}

async function saveStory(detail) {
  const slug = slugify(detail.title);

  return prisma.story.upsert({
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
}

async function crawlOneStory() {
  const list = await crawlStoryList(1);
  const story = list[0];

  if (!story) {
    throw new Error("No stories found.");
  }

  const detail = await crawlStoryDetail(story.link);
  const savedStory = await saveStory(detail);
  const chapters = await crawlChapters(story.link);
  const savedChapters = [];

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
        where: { id: existingChapter.id },
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

    savedChapters.push({
      ...chap,
      content,
    });

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  return {
    story: {
      ...detail,
      link: story.link,
      savedStoryId: savedStory.id,
    },
    chapters: savedChapters,
  };
}

try {
  const result = await crawlOneStory();
  console.log(JSON.stringify(result, null, 2));
} finally {
  await prisma.$disconnect();
}
