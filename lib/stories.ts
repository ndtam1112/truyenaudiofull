import { prisma } from "@/lib/prisma";

export type Chapter = {
  id: string;
  slug: string;
  title: string;
  order: number;
  readingTime: string;
  excerpt: string;
  content: string[];
  audioUrl?: string | null;
  videoUrl?: string | null;
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
  totalReadingTime: string;
  viewsCount: number;
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
  const minutes = Math.max(1, Math.ceil(words / 250));
  return `${minutes} phút`;
}

function buildExcerpt(content: string) {
  return content.length > 140 ? `${content.slice(0, 140)}...` : content;
}

function buildViews(id: number, chapterCount: number) {
  const seed = (id * 9301 + chapterCount * 49297) % 233280;
  const rand = seed / 233280;
  const baseViews = 5000 + (chapterCount * 2500); 
  let totalViews = Math.floor(baseViews * (0.5 + rand * 2.5));

  if (chapterCount > 200 && rand > 0.7) {
     totalViews = Math.floor(totalViews * (1.5 + rand * 3));
  }

  let label = totalViews.toLocaleString('vi-VN');
  if (totalViews >= 1000000) {
    label = `${(totalViews / 1000000).toFixed(1)}M`;
  } else if (totalViews >= 1000) {
    label = `${(totalViews / 1000).toFixed(1)}K`;
  }
  
  return { count: totalViews, label };
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
  content?: string | string[];
}): Chapter {
  const content = chapter.content 
    ? (Array.isArray(chapter.content) 
      ? chapter.content 
      : (chapter.content || "").split(/\r?\n\r?\n/).map(p => p.trim()).filter(Boolean))
    : [];

  return {
    id: String(chapter.id),
    slug: String(chapter.id),
    title: chapter.title,
    order: chapter.chapterNumber,
    readingTime: content.length > 0 ? buildReadingTime(content.join(" ")) : "",
    excerpt: content.length > 0 ? buildExcerpt(content.join(" ")) : "",
    content: content,
  };
}

function mapStory(story: any): Story {
  const genres = story.genres?.map((item: any) => item.genre.name).filter(Boolean) || [];
  const chapterCount = story._count?.chapters ?? story.chapters?.length ?? 0;

  const totalReadingTime = story.chapters?.length 
    ? `${Math.max(1, Math.round(story.chapters.reduce((acc: number, ch: any) => {
        const words = (typeof ch.content === 'string' ? ch.content : Array.isArray(ch.content) ? ch.content.join(" ") : "").split(/\s+/).length;
        return acc + (words / 250);
      }, 0)))} phút`
    : `${Math.round(chapterCount * 3.5)} phút`;

  const views = buildViews(story.id || 1, chapterCount);

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
    totalReadingTime,
    viewsCount: views.count,
    viewsLabel: views.label,
    status: chapterCount > 24 ? "Full" : "New",
    chapters: story.chapters ? story.chapters.map(mapChapter) : [],
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
      _count: {
        select: {
          chapters: true,
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
  
  const popularStories = [...mappedStories]
    .sort((left, right) => right.viewsCount - left.viewsCount)
    .slice(0, 10);

  return {
    featuredStory: mappedStories[0] ?? null,
    latestStories: mappedStories.slice(0, 12),
    popularStories: popularStories,
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

  // Fetch the actual content for THIS chapter
  const contentData = await prisma.chapter.findUnique({
    where: { id: Number(id) },
    select: { content: true, audioUrl: true, videoUrl: true }
  });

  if (contentData) {
    chapter.content = contentData.content.split(/\r?\n\r?\n/).map(p => p.trim()).filter(Boolean);
    const textStr = chapter.content.join(" ");
    chapter.readingTime = buildReadingTime(textStr);
    chapter.excerpt = buildExcerpt(textStr);
    chapter.audioUrl = contentData.audioUrl;
    chapter.videoUrl = contentData.videoUrl;
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
