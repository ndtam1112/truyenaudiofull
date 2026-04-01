"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Story } from "@/lib/stories";
import { Row } from "@/components/row";

type ReadingProgress = {
  storySlug: string;
  storyTitle: string;
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  progress: number;
  updatedAt: string;
};

type ContinueReadingRowProps = {
  stories: Story[];
};

const STORAGE_KEY = "story-progress";

export function ContinueReadingRow({ stories }: ContinueReadingRowProps) {
  const [entries, setEntries] = useState<ReadingProgress[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ReadingProgress[];
        if (Array.isArray(parsed)) {
          setEntries(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load reading progress", e);
    }
  }, []);

  const items = useMemo(() => {
    return entries
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .map((entry) => {
        const story = stories.find((candidate) => candidate.slug === entry.storySlug);
        if (!story) {
          return null;
        }

        return { entry, story };
      })
      .filter(Boolean)
      .slice(0, 10) as Array<{ entry: ReadingProgress; story: Story }>;
  }, [entries, stories]);

  if (!items.length) {
    return null;
  }

  return (
    <div id="continue-reading">
      <Row
        eyebrow="Dang doc do"
        title="Tiếp tục đọc"
        description="Quay lai dung chuong dang doc do va tiep tuc ngay khong can tim lai."
      >
        {items.map(({ entry, story }) => (
          <article
            key={`${entry.storySlug}-${entry.chapterId}`}
            className="min-w-[236px] snap-start overflow-hidden rounded-[1.7rem] border border-border bg-surface-strong shadow-[0_16px_40px_rgba(31,41,55,0.1)] xl:min-w-[336px]"
          >
            <div className="grid gap-0 xl:grid-cols-[132px_minmax(0,1fr)]">
              <div
                className="aspect-[2.2/1] p-4 xl:aspect-auto xl:min-h-full"
                style={{
                  backgroundImage: story.cover
                    ? `url(${story.cover})`
                    : `linear-gradient(135deg, ${story.coverAccentFrom}, ${story.coverAccentTo})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                <div className="flex h-full items-end">
                  <div className="rounded-2xl bg-black/24 px-3 py-2 text-sm font-semibold text-white">
                    {story.coverLabel}
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-4 text-foreground xl:flex xl:flex-col xl:justify-between">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
                    Tiep tuc doc
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-base font-semibold xl:text-[1.15rem]">
                    {story.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted xl:text-sm">
                    Chapter {entry.chapterOrder} | {entry.chapterTitle}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Reading progress</span>
                    <span>{entry.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border/80">
                    <div
                      className="h-full rounded-full bg-accent transition-[width] duration-500"
                      style={{ width: `${entry.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted">
                    Quay lai dung doan dang doc de giu nhip cau chuyen.
                  </p>
                </div>
                  <Link
                    href={`/truyen/${story.slug}/chuong/${entry.chapterId}`}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 active:scale-[0.99]"
                  >
                    Đọc tiếp
                  </Link>
              </div>
            </div>
          </article>
        ))}
      </Row>
    </div>
  );
}
