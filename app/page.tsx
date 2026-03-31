import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { StoryCard } from "@/components/story-card";
import { buildMetadata } from "@/lib/metadata";
import { getHomePage } from "@/lib/stories";

export const metadata: Metadata = buildMetadata({
  title: "Story Library",
  description:
    "Explore featured stories, latest chapters, and a route structure prepared for scalable content products.",
  path: "/",
});

export default async function HomePage() {
  const { featuredStory, stories } = await getHomePage();

  return (
    <div className="grid-lines min-h-screen">
      <AppHeader />
      <main className="page-shell py-12 md:py-20">
        <section className="grid gap-8 rounded-[2rem] border border-border bg-surface p-8 shadow-[0_24px_80px_rgba(31,41,55,0.08)] md:grid-cols-[1.3fr_0.7fr] md:p-12">
          <div>
            <p className="text-sm font-semibold tracking-[0.28em] text-accent uppercase">
              App Router + Clean Architecture
            </p>
            <h1 className="mt-5 max-w-2xl text-5xl font-semibold tracking-tight text-balance md:text-6xl">
              A scalable story platform starter for Next.js 14+.
            </h1>
            <p className="prose-copy mt-6 max-w-xl text-lg">
              The route layer stays in `app/`, domain and use-case code live in
              feature modules, and SEO is prepared with the Metadata API from
              day one.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/truyen/${featuredStory.slug}`}
                className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                Open featured story
              </Link>
              <a
                href="#stories"
                className="rounded-full border border-border px-5 py-3 text-sm font-semibold"
              >
                Browse structure
              </a>
            </div>
          </div>
          <aside className="rounded-[1.5rem] bg-foreground p-6 text-background">
            <p className="text-sm tracking-[0.24em] uppercase text-white/70">
              Featured
            </p>
            <h2 className="mt-3 text-3xl font-semibold">{featuredStory.title}</h2>
            <p className="mt-4 text-sm leading-7 text-white/75">
              {featuredStory.summary}
            </p>
            <div className="mt-8 space-y-3 text-sm text-white/75">
              <div className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
                <span>Genre</span>
                <span>{featuredStory.genre}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3">
                <span>Chapters</span>
                <span>{featuredStory.chapters.length}</span>
              </div>
            </div>
          </aside>
        </section>

        <section id="stories" className="mt-16 md:mt-24">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-accent uppercase">
                Example Pages
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Home, story detail, and chapter detail are already wired.
              </h2>
            </div>
            <p className="max-w-md text-sm text-muted">
              Each card routes into dynamic segments backed by use cases and a
              repository boundary.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
