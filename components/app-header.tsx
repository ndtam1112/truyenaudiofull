import Link from "next/link";
import { slugifyGenre } from "@/lib/stories";

type AppHeaderProps = {
  genres?: string[];
  activeGenre?: string;
};

export function AppHeader({ genres = [], activeGenre }: AppHeaderProps) {
  return (
    <header className="glass sticky top-0 z-30 border-b border-border/50">
      <div className="page-shell py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <Link 
              href="/" 
              className="font-display text-lg font-bold tracking-tight text-foreground transition-colors hover:text-accent"
            >
              StoryArc.
            </Link>
            <p className="mt-0.5 text-xs font-medium text-muted/80">
              Thu vien truyen toi uu cho doc gia.
            </p>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-muted md:flex">
            <Link href="/" className="transition-colors hover:text-accent">Trang chu</Link>
            <a href="#search" className="transition-colors hover:text-accent">Tim truyen</a>
          </nav>
        </div>

        {genres.length ? (
          <div className="no-scrollbar mt-6 flex gap-2.5 overflow-x-auto pb-1">
            <Link
              href="/"
              className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-5 py-2 text-xs font-bold tracking-wide uppercase transition-all hover-lift ${
                !activeGenre
                  ? "border-accent bg-accent text-white shadow-lg shadow-accent/20"
                  : "border-border bg-surface text-muted hover:border-accent/30 hover:text-accent"
              }`}
            >
              Tat ca
            </Link>
            {genres.map((genre) => {
              const active =
                activeGenre === genre || activeGenre === slugifyGenre(genre);

              return (
                <Link
                  key={genre}
                  href={`/the-loai/${slugifyGenre(genre)}`}
                  className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-5 py-2 text-xs font-bold tracking-wide uppercase transition-all hover-lift ${
                    active
                      ? "border-accent bg-accent text-white shadow-lg shadow-accent/20"
                      : "border-border bg-surface text-muted hover:border-accent/30 hover:text-accent"
                  }`}
                >
                  {genre}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </header>
  );
}
