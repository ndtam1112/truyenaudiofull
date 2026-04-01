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
  genres: string[];
  summary: string;
  cover: string | null;
  coverLabel: string;
  coverAccentFrom: string;
  coverAccentTo: string;
  chapterCount: number;
  viewsLabel: string;
  status: string;
  chapters: Chapter[];
};

export type StoryQuery = {
  q?: string;
  genre?: string;
  page?: number;
  pageSize?: number;
};

export type StoryPage = {
  items: Story[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  query: StoryQuery;
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

function buildViewsLabel(id: number, chapterCount: number) {
  const value = 12 + ((id * 11 + chapterCount * 7) % 220) / 10;
  return `${value.toFixed(1)}k`;
}

export function slugifyGenre(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/d/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  cover: string | null;
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
  const genres = story.genres.map((item) => item.genre.name).filter(Boolean);
  const chapterCount = story.chapters.length;

  return {
    id: String(story.id),
    slug: story.slug,
    title: story.title,
    author: story.author ?? "Unknown Author",
    genre: genres[0] ?? "Uncategorized",
    genres,
    summary: story.description ?? "Chua co mo ta cho truyen nay.",
    cover: story.cover,
    coverLabel: buildCoverLabel(story.title),
    coverAccentFrom: "#ef4444",
    coverAccentTo: "#7c2d12",
    chapterCount,
    viewsLabel: buildViewsLabel(story.id, chapterCount),
    status: chapterCount > 24 ? "Full" : "New",
    chapters: story.chapters.map(mapChapter),
  };
}

async function fetchStories() {
  const stories = await prisma.story.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      description: true,
      cover: true,
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

  return stories.map(mapStory);
}

function filterStories(stories: Story[], query: StoryQuery = {}) {
  const q = query.q?.trim().toLowerCase() ?? "";
  const genre = query.genre?.trim().toLowerCase() ?? "";

  return stories.filter((story) => {
    const matchesQuery =
      !q ||
      story.title.toLowerCase().includes(q) ||
      story.summary.toLowerCase().includes(q) ||
      story.author.toLowerCase().includes(q);

    const matchesGenre =
      !genre ||
      story.genres.some((item) => item.toLowerCase() === genre || slugifyGenre(item) === genre);

    return matchesQuery && matchesGenre;
  });
}

function paginateStories(stories: Story[], query: StoryQuery = {}): StoryPage {
  const pageSize = query.pageSize ?? 20;
  const page = Math.max(1, query.page ?? 1);
  const totalItems = stories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: stories.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    query,
  };
}

export async function getHomePage() {
  const mappedStories = await fetchStories();
  const genres = Array.from(new Set(mappedStories.flatMap((story) => story.genres))).filter(Boolean);
  const categorySections = genres.slice(0, 3).map((genre) => ({
    name: genre,
    slug: slugifyGenre(genre),
    stories: mappedStories.filter((story) => story.genres.includes(genre)).slice(0, 8),
  }));
  const popularStories = [...mappedStories]
    .sort((left, right) => right.chapterCount - left.chapterCount || right.title.localeCompare(left.title))
    .slice(0, 8);

  return {
    featuredStory: mappedStories[0] ?? null,
    stories: mappedStories,
    latestStories: mappedStories.slice(0, 10),
    popularStories,
    categorySections,
    genres,
  };
}

export async function getStoriesPage(query: StoryQuery = {}) {
  const stories = await fetchStories();
  return paginateStories(filterStories(stories, query), query);
}

export async function getGenres() {
  const stories = await fetchStories();
  return Array.from(new Set(stories.flatMap((story) => story.genres))).filter(Boolean);
}

export async function getStoriesByGenreSlug(genreSlug: string, query: Omit<StoryQuery, "genre"> = {}) {
  const genres = await getGenres();
  const genre = genres.find((item) => slugifyGenre(item) === genreSlug) ?? null;

  if (!genre) {
    return null;
  }

  const page = await getStoriesPage({
    ...query,
    genre,
  });

  return {
    genre,
    genreSlug,
    page,
  };
}

export async function getStoryDetail(slug: string) {
  const story = await prisma.story.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      description: true,
      cover: true,
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
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      description: true,
      cover: true,
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
