import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/96 px-3 pb-[calc(env(safe-area-inset-bottom)+0.8rem)] pt-3 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-2">
        <Link
          href="/"
          className="flex min-h-11 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium text-foreground transition hover:bg-surface-strong"
        >
          <span>H</span>
          <span className="mt-1">Home</span>
        </Link>
        <a
          href="#quick-search"
          className="flex min-h-11 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium text-foreground transition hover:bg-surface-strong"
        >
          <span>S</span>
          <span className="mt-1">Search</span>
        </a>
        <a
          href="#continue-reading"
          className="flex min-h-11 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium text-foreground transition hover:bg-surface-strong"
        >
          <span>L</span>
          <span className="mt-1">Library</span>
        </a>
        <a
          href="#top"
          className="flex min-h-11 flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-medium text-foreground transition hover:bg-surface-strong"
        >
          <span>P</span>
          <span className="mt-1">Profile</span>
        </a>
      </div>
    </nav>
  );
}
