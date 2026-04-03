import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1.5 backdrop-blur-lg md:hidden shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
      <div className="mx-auto grid max-w-sm grid-cols-4 gap-1">
        <Link
          href="/"
          className="flex flex-col items-center justify-center rounded-xl p-1.5 text-[10px] font-black text-accent transition active:scale-95"
        >
          <svg className="w-[22px] h-[22px] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span className="truncate w-full text-center">Trang chủ</span>
        </Link>
        <a
          href="#quick-search"
          className="flex flex-col items-center justify-center rounded-xl p-1.5 text-[10px] font-bold text-muted transition active:scale-95 hover:text-accent"
        >
          <svg className="w-[22px] h-[22px] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <span className="truncate w-full text-center tracking-wide">Tìm kiếm</span>
        </a>
        <a
          href="#continue-reading"
          className="flex flex-col items-center justify-center rounded-xl p-1.5 text-[10px] font-bold text-muted transition active:scale-95 hover:text-accent"
        >
          <svg className="w-[22px] h-[22px] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253"/></svg>
          <span className="truncate w-full text-center tracking-wide">Tủ sách</span>
        </a>
        <a
          href="#top"
          className="flex flex-col items-center justify-center rounded-xl p-1.5 text-[10px] font-bold text-muted transition active:scale-95 hover:text-accent"
        >
          <svg className="w-[22px] h-[22px] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <span className="truncate w-full text-center tracking-wide">Cá nhân</span>
        </a>
      </div>
    </nav>
  );
}
