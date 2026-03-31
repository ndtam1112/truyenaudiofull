import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-surface/85 backdrop-blur">
      <div className="page-shell flex items-center justify-between py-4">
        <Link href="/" className="text-sm font-semibold tracking-[0.24em] uppercase">
          Story Architecture
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted">
          <Link href="/">Home</Link>
          <a href="#stories">Stories</a>
        </nav>
      </div>
    </header>
  );
}
