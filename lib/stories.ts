import { prisma } from "@/lib/prisma";

export type Chapter = {
  id: string;
  slug: string;
  title: string;
  order: number;
  readingTime: string;
  excerpt: string;
  content: string[];
};

export type Story = {
  id: string;
  slug: string;
  title: string;
  author: string;
  genre: string;
  summary: string;
  coverLabel: string;
  coverAccentFrom: string;
  coverAccentTo: string;
  chapters: Chapter[];
};

function buildCoverLabel(title: string) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function buildReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

function buildExcerpt(content: string) {
  return content.length > 140 ? `${content.slice(0, 140)}...` : content;
}

function mapChapter(chapter: {
  id: number;
  chapterNumber: number;
  title: string;
  content: string;
}): Chapter {
  return {
    id: String(chapter.id),
    slug: String(chapter.id),
    title: chapter.title,
    order: chapter.chapterNumber,
    readingTime: buildReadingTime(chapter.content),
    excerpt: buildExcerpt(chapter.content),
    content: chapter.content
      .split(/\r?\n\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
  };
}

function mapStory(story: {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  description: string | null;
  chapters: Array<{
    id: number;
    chapterNumber: number;
    title: string;
    content: string;
  }>;
  genres: Array<{
    genre: {
      name: string;
    };
  }>;
}): Story {
  return {
    id: String(story.id),
    slug: story.slug,
    title: story.title,
    author: story.author ?? "Unknown Author",
    genre:
      story.genres.map((item) => item.genre.name).join(" / ") || "Uncategorized",
    summary: story.description ?? "Chua co mo ta cho truyen nay.",
    coverLabel: buildCoverLabel(story.title),
    coverAccentFrom: "#ef4444",
    coverAccentTo: "#7c2d12",
    chapters: story.chapters.map(mapChapter),
  };
}

export async function getHomePage() {
  const stories = await prisma.story.findMany({
    include: {
      chapters: {
        select: {
          id: true,
          chapterNumber: true,
          title: true,
          content: true,
        },
        orderBy: {
          chapterNumber: "asc",
        },
      },
      genres: {
        include: {
          genre: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const mappedStories = stories.map(mapStory);

  return {
    featuredStory: mappedStories[0],
    stories: mappedStories,
  };
}

export async function getStoryDetail(slug: string) {
  const story = await prisma.story.findUnique({
    where: {
      slug,
    },
    include: {
      chapters: {
        select: {
          id: true,
          chapterNumber: true,
          title: true,
          content: true,
        },
        orderBy: {
          chapterNumber: "asc",
        },
      },
      genres: {
        include: {
          genre: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!story) {
    return null;
  }

  const mappedStory = mapStory(story);

  return {
    story: mappedStory,
    chapters: mappedStory.chapters,
  };
}

export async function getChapterDetail(slug: string, id: string) {
  const chapterId = Number(id);

  if (Number.isNaN(chapterId)) {
    return null;
  }

  const story = await prisma.story.findUnique({
    where: {
      slug,
    },
    include: {
      chapters: {
        select: {
          id: true,
          chapterNumber: true,
          title: true,
          content: true,
        },
        orderBy: {
          chapterNumber: "asc",
        },
      },
      genres: {
        include: {
          genre: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!story) {
    return null;
  }

  const mappedStory = mapStory(story);
  const chapter = mappedStory.chapters.find((item) => item.id === id) ?? null;

  if (!chapter) {
    return null;
  }

  return {
    story: mappedStory,
    chapter,
    previousChapter:
      mappedStory.chapters.find((item) => item.order === chapter.order - 1) ?? null,
    nextChapter:
      mappedStory.chapters.find((item) => item.order === chapter.order + 1) ?? null,
  };
}
