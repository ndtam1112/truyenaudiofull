"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type SearchBarProps = {
  genres: string[];
  initialQuery?: string;
  initialGenre?: string;
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M10.5 4a6.5 6.5 0 1 0 3.993 11.63l4.438 4.439 1.414-1.415-4.438-4.438A6.5 6.5 0 0 0 10.5 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SearchBar({
  genres,
  initialQuery = "",
  initialGenre = "",
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(() => initialQuery);
  const [genre, setGenre] = useState(() => initialGenre);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }

      if (genre) {
        params.set("genre", genre);
      } else {
        params.delete("genre");
      }

      params.delete("page");

      startTransition(() => {
        router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, {
          scroll: false,
        });
      });
    }, 400);

    return () => window.clearTimeout(handle);
  }, [genre, pathname, query, router, searchParams]);

  return (
    <div
      id="search"
      className="sticky top-[110px] z-20 rounded-[1.75rem] border border-border/80 bg-surface/95 p-3 shadow-[0_12px_40px_rgba(31,41,55,0.06)] backdrop-blur md:top-[138px]"
    >
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tim theo ten truyen..."
            className="min-h-11 w-full rounded-full border border-border bg-surface-strong px-11 py-3 text-sm outline-none transition focus:border-accent"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 inline-flex h-9 min-w-9 -translate-y-1/2 items-center justify-center rounded-full text-sm text-muted transition hover:bg-surface"
            >
              ×
            </button>
          ) : null}
        </label>

        <select
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
          className="search-select min-h-11 rounded-full border border-border bg-surface-strong px-4 py-3 text-sm outline-none transition focus:border-accent md:w-60"
        >
          <option value="">Tat ca the loai</option>
          {genres.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>Loc server-side, tu dong cap nhat sau khi ngung go.</span>
        {isPending ? <span className="text-accent">Dang loc...</span> : null}
      </div>
    </div>
  );
}
