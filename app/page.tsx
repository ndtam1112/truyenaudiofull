export { metadata, default } from "./home-page-view";
/*
import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { SearchBar } from "@/components/search-bar";
import { Section } from "@/components/section";
import { StoryCard } from "@/components/story-card";
import { buildMetadata } from "@/lib/metadata";
import { getHomePage, getStoriesPage } from "@/lib/stories";

export const metadata: Metadata = buildMetadata({
  title: "Thu vien truyen",
  description:
    "Trang chu doc truyen voi featured story, latest, popular, category sections va bo loc server-side.",
  path: "/",
});

type HomePageProps = {
  searchParams?: Promise<{
    q?: string;
    genre?: string;
    page?: string;
  }>;
};

function buildPageHref(page: number, q?: string, genre?: string) {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }
  if (genre) {
    params.set("genre", genre);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  return `/${params.toString() ? `?${params.toString()}` : ""}`;
}
*/
/*
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : {};
  const currentPage = Math.max(1, Number(params.page ?? "1") || 1);
  const { featuredStory, latestStories, popularStories, categorySections, genres } =
    await getHomePage();
  const filtered = await getStoriesPage({
    q: params.q,
    genre: params.genre,
    page: currentPage,
    pageSize: 20,
  });
  const showResults = Boolean(params.q?.trim() || params.genre?.trim());

  return (
    <div className="grid-lines min-h-screen">
      <AppHeader genres={genres} activeGenre={params.genre} />
      <main className="page-shell space-y-8 py-6 md:space-y-10 md:py-10">
        <SearchBar
          key={`home:${params.q ?? ""}:${params.genre ?? ""}`}
          genres={genres}
          initialQuery={params.q ?? ""}
          initialGenre={params.genre ?? ""}
        />

        {featuredStory ? (
          <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_24px_80px_rgba(31,41,55,0.08)]">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div
                className="relative min-h-[360px] p-8 text-white md:min-h-[430px] md:p-12"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${featuredStory.coverAccentFrom}, ${featuredStory.coverAccentTo})`,
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.82))]" />
                <div className="relative z-10 flex h-full flex-col justify-end">
                  <p className="text-xs font-semibold tracking-[0.28em] uppercase text-white/72">
                    Featured Story
                  </p>
                  <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
                    {featuredStory.title}
                  </h1>
                  <p className="mt-4 max-w-xl text-base text-white/85">{featuredStory.description}</p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/85">
                    <span className="rounded-full bg-white/10 px-4 py-2">
                      {featuredStory.genre}
                    </span>
                    <span className="rounded-full bg-white/10 px-4 py-2">
                      {featuredStory.chapterCount} chuong
                    </span>
                    <span className="rounded-full bg-white/10 px-4 py-2">
                      🔥 {featuredStory.viewsLabel}
                    </span>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/truyen/${featuredStory.slug}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 active:scale-[0.99]"
                    >
                      Doc ngay
                    </Link>
                    <a
                      href="#latest"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Tim truyen
                    </a>
                  </div>
                </div>
              </div>
              <aside className="space-y-4 bg-surface p-8 md:p-10">
                <div className="rounded-[1.5rem] border border-border bg-surface-strong p-5">
                  <p className="text-xs font-semibold tracking-[0.24em] text-accent uppercase">
                    Hook
                  </p>
                  <p className="mt-3 text-lg leading-8">
                    Bat dau tu mot truyen noi bat, sau do luot ngang qua nhung list duoc sap xep de cham vao doc ngay.
                  </p>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between rounded-[1.25rem] border border-border bg-surface-strong px-4 py-4">
                    <span className="text-muted">Tac gia</span>
                    <span className="font-semibold">{featuredStory.author}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[1.25rem] border border-border bg-surface-strong px-4 py-4">
                    <span className="text-muted">Trang thai</span>
                    <span className="font-semibold">{featuredStory.status}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[1.25rem] border border-border bg-surface-strong px-4 py-4">
                    <span className="text-muted">Toc do doc</span>
                    <span className="font-semibold">{featuredStory.chapters[0]?.readingTime ?? "1 min"}</span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {showResults ? (
          <Section
            eyebrow="Search Results"
            title="Ket qua tim truyen"
            description={`Tim thay ${filtered.totalItems} truyen phu hop voi bo loc hien tai.`}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {filtered.items.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 pt-2">
              {filtered.page > 1 ? (
                <Link
                  href={buildPageHref(filtered.page - 1, params.q, params.genre)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold"
                >
                  Previous
                </Link>
              ) : (
                <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-border/60 px-5 py-3 text-sm text-muted">
                  Previous
                </span>
              )}
              <span className="text-sm text-muted">
                Trang {filtered.page}/{filtered.totalPages}
              </span>
              {filtered.page < filtered.totalPages ? (
                <Link
                  href={buildPageHref(filtered.page + 1, params.q, params.genre)}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white"
                >
                  Next
                </Link>
              ) : (
                <span className="inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background">
                  Het trang
                </span>
              )}
            </div>
          </Section>
        ) : (
          <>
            <Section
              eyebrow="Latest Stories"
              title="Moi cap nhat"
              description="Nhung truyen vua len trang de ban luot nhanh va vao doc ngay."
            >
              <div
                id="latest"
                className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-4"
              >
                {latestStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </Section>

            <Section
              eyebrow="Popular Stories"
              title="Dang duoc mo nhieu"
              description="Cac truyen co do day chuong tot, hop voi kieu luot TikTok roi cham vao doc."
            >
              <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-4">
                {popularStories.map((story) => (
                  <StoryCard key={`${story.id}-popular`} story={story} />
                ))}
              </div>
            </Section>

            {categorySections.map((section) => (
              <Section
                key={section.slug}
                eyebrow="By Category"
                title={section.name}
                description={`8 truyện đầu thuộc ${section.name} để người dùng vào nhanh ngay từ homepage.`}
                href={`/the-loai/${section.slug}`}
              >
                <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-4">
                  {section.stories.map((story) => (
                    <StoryCard key={`${section.slug}-${story.id}`} story={story} />
                  ))}
                </div>
              </Section>
            ))}
          </>
        )}
      </main>
    </div>
  );
}
*/
