"use client";

import { useEffect } from "react";

type SaveReadingProgressProps = {
  storySlug: string;
  storyTitle: string;
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
};

const STORAGE_KEY = "story-progress";

export function SaveReadingProgress({
  storySlug,
  storyTitle,
  chapterId,
  chapterOrder,
  chapterTitle,
}: SaveReadingProgressProps) {
  useEffect(() => {
    try {
      const existingRaw = window.localStorage.getItem(STORAGE_KEY);
      let progress: any[] = [];
      
      if (existingRaw) {
        progress = JSON.parse(existingRaw);
      }
      
      // Remove previous entry for this story if exists
      progress = progress.filter((p) => p.storySlug !== storySlug);
      
      // Calculate scroll progress (simplified as we just entered the chapter)
      // A more complex implementation would use a scroll listener
      const entry = {
        storySlug,
        storyTitle,
        chapterId,
        chapterOrder,
        chapterTitle,
        progress: 0, // Placeholder
        updatedAt: new Date().toISOString(),
      };
      
      progress.unshift(entry);
      
      // Limit to 20 stories
      progress = progress.slice(0, 20);
      
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to save reading progress", e);
    }
  }, [storySlug, storyTitle, chapterId, chapterOrder, chapterTitle]);

  return null;
}
