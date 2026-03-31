import Link from "next/link";
import type { Story } from "@/lib/stories";

type StoryCardProps = {
  story: Story;
};

export function StoryCard({ story }: StoryCardProps) {
  return (
    <article className="rounded-[2rem] border border-border bg-surface-strong p-6 shadow-[0_18px_60px_rgba(31,41,55,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-white">
          {story.coverLabel}
        </span>
        <span className="text-xs font-semibold tracking-[0.24em] text-muted uppercase">
          {story.genre}
        </span>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">{story.title}</h2>
      <p className="mt-3 prose-copy">{story.summary}</p>
      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-muted">{story.chapters.length} chapter(s)</span>
        <Link
          href={`/truyen/${story.slug}`}
          className="rounded-full bg-foreground px-4 py-2 font-medium text-background transition-transform hover:-translate-y-0.5"
        >
          Read detail
        </Link>
      </div>
    </article>
  );
}
