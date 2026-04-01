import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SearchBar } from "@/components/search-bar";
import { Section } from "@/components/section";
import { StoryCard } from "@/components/story-card";
import { buildMetadata } from "@/lib/metadata";
import { getGenres, getStoriesByGenreSlug } from "@/lib/stories";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    page?: string;
    q?: string;
  }>;
};

function buildCategoryHref(slug: string, page: number, q?: string) {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  return `/the-loai/${slug}${params.toString() ? `?${params.toString()}` : ""}`;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getStoriesByGenreSlug(slug, {
    page: 1,
    pageSize: 20,
  });

  if (!result) {
    return buildMetadata({
      title: "The loai khong ton tai",
      description: "Khong tim thay the loai truyen nay.",
      path: `/the-loai/${slug}`,
    });
  }

  return buildMetadata({
    title: `The loai ${result.genre}`,
    description: `Doc truyen thuoc the loai ${result.genre} voi phan trang SEO-friendly.`,
    path: `/the-loai/${slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const genres = await getGenres();
  const result = await getStoriesByGenreSlug(slug, {
    q: query.q,
    page: Math.max(1, Number(query.page ?? "1") || 1),
    pageSize: 20,
  });

  if (!result) {
    notFound();
  }

  return (
    <div className="grid-lines min-h-screen">
      <AppHeader genres={genres} activeGenre={slug} />
      <main className="page-shell space-y-8 py-6 md:space-y-10 md:py-10">
        <SearchBar
          key={`genre:${slug}:${query.q ?? ""}`}
          genres={[result.genre]}
          initialQuery={query.q ?? ""}
          initialGenre={result.genre}
        />

        <Section
          eyebrow="Category Page"
          title={result.genre}
          description={`Dang hien thi ${result.page.totalItems} truyen trong the loai ${result.genre}.`}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {result.page.items.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {result.page.page > 1 ? (
              <Link
                href={buildCategoryHref(slug, result.page.page - 1, query.q)}
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
              Trang {result.page.page}/{result.page.totalPages}
            </span>
            {result.page.page < result.page.totalPages ? (
              <Link
                href={buildCategoryHref(slug, result.page.page + 1, query.q)}
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
      </main>
    </div>
  );
}
