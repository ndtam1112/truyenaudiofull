import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { buildMetadata } from "@/lib/metadata";
import { getStoryDetail } from "@/lib/stories";

type StoryDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: StoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getStoryDetail(slug);

  if (!result) {
    return buildMetadata({
      title: "Story Not Found",
      description: "The requested story could not be found.",
      path: `/truyen/${slug}`,
    });
  }

  return buildMetadata({
    title: result.story.title,
    description: result.story.summary,
    path: `/truyen/${result.story.slug}`,
  });
}

export default async function StoryDetailPage({
  params,
}: StoryDetailPageProps) {
  const { slug } = await params;
  const content = await getStoryDetail(slug);

  if (!content) {
    notFound();
  }

  const { story, chapters } = content;
  const firstChapter = chapters[0] ?? null;

  return (
    <div className="grid-lines min-h-screen">
      <AppHeader />
      <main className="page-shell py-12 md:py-20">
        <section className="rounded-[2rem] border border-border bg-surface p-8 shadow-[0_24px_80px_rgba(31,41,55,0.08)] md:p-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Stories</span>
            <span>/</span>
            <span>{story.title}</span>
          </div>

          <div className="mt-8 grid gap-10 md:grid-cols-[0.75fr_1.25fr]">
            <aside className="rounded-[1.5rem] bg-foreground p-8 text-background">
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.24em] uppercase text-white/75">
                {story.genre}
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight">
                {story.title}
              </h1>
              <p className="mt-2 text-sm text-white/70">{story.author}</p>
              <p className="mt-4 text-sm leading-7 text-white/75">
                {story.summary}
              </p>
              <p className="mt-8 text-sm text-white/60">
                Prepared for SEO with route-level metadata and canonical URLs.
              </p>
              {firstChapter ? (
                <Link
                  href={`/truyen/${story.slug}/chuong/${firstChapter.id}`}
                  className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5"
                >
                  Read from chapter 1
                </Link>
              ) : null}
            </aside>

            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-accent uppercase">
                Chapter Index
              </p>
              <div className="mt-5 space-y-4">
                {chapters.map((chapter) => (
                  <article
                    key={chapter.id}
                    className="rounded-[1.5rem] border border-border bg-surface-strong p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.24em] text-muted uppercase">
                          Chapter {chapter.order}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                          {chapter.title}
                        </h2>
                      </div>
                      <span className="text-sm text-muted">
                        {chapter.readingTime}
                      </span>
                    </div>
                    <p className="prose-copy mt-4">{chapter.excerpt}</p>
                    <Link
                      href={`/truyen/${story.slug}/chuong/${chapter.id}`}
                      className="mt-5 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                    >
                      Open chapter
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
