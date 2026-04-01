"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HeaderProps = {
  genres: string[];
  initialQuery?: string;
};

export function Header({ genres, initialQuery = "" }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white/95 shadow-sm backdrop-blur-md py-2" : "bg-white py-4"
      } border-b border-border`}
    >
      <div className="page-shell">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold text-xl">
                N
              </span>
              <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
                NeuralStudio
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold text-muted hover:text-accent transition-colors">
                Trang chủ
              </Link>
              <div className="relative group">
                <button className="text-sm font-semibold text-muted hover:text-accent transition-colors flex items-center gap-1">
                  Thể loại
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-4 grid grid-cols-2 gap-2">
                  {genres.slice(0, 10).map((genre) => (
                    <Link 
                      key={genre} 
                      href={`/?genre=${genre}`}
                      className="text-xs font-medium p-2 rounded-lg hover:bg-surface-strong hover:text-accent transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 mr-2 rounded-full hover:bg-surface-strong transition-colors text-muted"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link 
              href="/author/login" 
              className="text-sm font-bold text-accent px-4 py-2 rounded-full border border-accent/20 hover:bg-accent/5 transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
        </div>

        {isSearchOpen && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <form action="/" className="relative">
              <input 
                name="q"
                defaultValue={initialQuery}
                placeholder="Tìm kiếm truyện, tác giả..."
                className="w-full bg-surface-strong border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                autoFocus
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
