import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { buildMetadata } from "@/lib/metadata";
import { getChapterDetail } from "@/lib/stories";

type ChapterDetailPageProps = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: ChapterDetailPageProps): Promise<Metadata> {
  const { slug, id } = await params;
  const result = await getChapterDetail(slug, id);

  if (!result) {
    return buildMetadata({
      title: "Chapter Not Found",
      description: "The requested chapter could not be found.",
      path: `/truyen/${slug}/chuong/${id}`,
    });
  }

  return buildMetadata({
    title: `${result.chapter.title} - ${result.story.title}`,
    description: result.chapter.excerpt,
    path: `/truyen/${result.story.slug}/chuong/${result.chapter.id}`,
  });
}

export default async function ChapterDetailPage({
  params,
}: ChapterDetailPageProps) {
  const { slug, id } = await params;
  const content = await getChapterDetail(slug, id);

  if (!content) {
    notFound();
  }

  const { story, chapter, previousChapter, nextChapter } = content;

  return (
    <div className="grid-lines min-h-screen">
      <AppHeader />
      <main className="page-shell py-12 md:py-20">
        <article className="rounded-[2rem] border border-border bg-surface p-8 shadow-[0_24px_80px_rgba(31,41,55,0.08)] md:p-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href={`/truyen/${story.slug}`}>{story.title}</Link>
            <span>/</span>
            <span>{chapter.title}</span>
          </div>

          <div className="mt-10 max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.24em] text-accent uppercase">
              Chapter {chapter.order}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              {chapter.title}
            </h1>
            <p className="mt-4 text-sm text-muted">
              {story.title} | {chapter.readingTime}
            </p>
          </div>

          <div className="prose-copy mt-10 max-w-3xl space-y-6 text-lg">
            {chapter.content.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <footer className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border bg-surface-strong p-6">
              <p className="text-xs font-semibold tracking-[0.24em] text-muted uppercase">
                Previous
              </p>
              {previousChapter ? (
                <Link
                  href={`/truyen/${story.slug}/chuong/${previousChapter.id}`}
                  className="mt-3 inline-block text-xl font-semibold tracking-tight"
                >
                  {previousChapter.title}
                </Link>
              ) : (
                <p className="mt-3 text-muted">This is the first chapter.</p>
              )}
            </div>
            <div className="rounded-[1.5rem] border border-border bg-surface-strong p-6">
              <p className="text-xs font-semibold tracking-[0.24em] text-muted uppercase">
                Next
              </p>
              {nextChapter ? (
                <Link
                  href={`/truyen/${story.slug}/chuong/${nextChapter.id}`}
                  className="mt-3 inline-block text-xl font-semibold tracking-tight"
                >
                  {nextChapter.title}
                </Link>
              ) : (
                <p className="mt-3 text-muted">You reached the end of the sample.</p>
              )}
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
