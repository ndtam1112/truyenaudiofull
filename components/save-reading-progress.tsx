"use client";

import { useEffect } from "react";

type SaveReadingProgressProps = {
  storySlug: string;
  storyTitle: string;
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
};

type ReadingProgress = {
  storySlug: string;
  storyTitle: string;
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  progress: number;
  updatedAt: string;
};

const STORAGE_KEY = "story-progress";

function readEntries() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [] as ReadingProgress[];
    }

    const parsed = JSON.parse(raw) as ReadingProgress[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as ReadingProgress[];
  }
}

export function SaveReadingProgress({
  storySlug,
  storyTitle,
  chapterId,
  chapterOrder,
  chapterTitle,
}: SaveReadingProgressProps) {
  useEffect(() => {
    const save = () => {
      const root = document.documentElement;
      const maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
      const progress = Math.min(100, Math.max(0, Math.round((window.scrollY / maxScroll) * 100)));

      const next: ReadingProgress = {
        storySlug,
        storyTitle,
        chapterId,
        chapterOrder,
        chapterTitle,
        progress,
        updatedAt: new Date().toISOString(),
      };

      const entries = readEntries().filter((entry) => entry.storySlug !== storySlug);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...entries].slice(0, 10)));
    };

    save();
    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("beforeunload", save);

    return () => {
      save();
      window.removeEventListener("scroll", save);
      window.removeEventListener("beforeunload", save);
    };
  }, [chapterId, chapterOrder, chapterTitle, storySlug, storyTitle]);

  return null;
}
