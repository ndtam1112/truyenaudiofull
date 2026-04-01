"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Story } from "@/lib/stories";
import { StoryCard } from "./story-card";

type HeroBannerProps = {
  story: Story;
  topStories?: Story[];
};

export function HeroBanner({ story, topStories = [] }: HeroBannerProps) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <section className="grid lg:grid-cols-[1fr_320px] gap-8">
      {/* Featured Story */}
      <div className="relative overflow-hidden group rounded-2xl bg-white border border-border shadow-md transition-all duration-300 hover:shadow-xl p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="relative w-full md:w-56 aspect-[3/4] shrink-0 overflow-hidden rounded-xl shadow-lg shadow-black/5">
            {story.cover ? (
               <Image 
                src={story.cover} 
                alt={story.title} 
                fill 
                priority
                sizes="(max-width: 768px) 100vw, 224px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="h-full w-full bg-surface-strong" />
            )}
            <div className="absolute top-3 left-3">
               <span className="badge badge-ongoing bg-accent text-white shadow-lg border-none animate-bounce">
                  Hot
               </span>
            </div>
          </div>
          
          <div className="flex flex-col h-full flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex h-6 items-center px-3 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest">
                Đề cử
              </span>
              <span className="text-xs font-bold text-muted/60">• {story.genre}</span>
            </div>
            
            <h1 className="font-display novel-title text-3xl md:text-4xl text-foreground group-hover:text-accent transition-colors duration-300">
              {story.title}
            </h1>
            
            <p className="mt-3 text-sm font-bold text-muted">
              Tác giả: {story.author}
            </p>
            
            <p className="mt-5 text-sm md:text-base leading-relaxed text-muted line-clamp-3 md:line-clamp-4">
              {story.summary || "Một câu chuyện hấp dẫn đang chờ bạn khám phá. Hãy bắt đầu hành trình ngay hôm nay để trải nghiệm những cung bậc cảm xúc tuyệt vời nhất."}
            </p>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <Link 
                href={`/truyen/${story.slug}`}
                className="inline-flex items-center justify-center bg-accent text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:brightness-105 transition-all active:scale-95"
              >
                Đọc Ngay
              </Link>
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className="inline-flex items-center justify-center bg-surface-strong text-foreground px-6 py-3 rounded-xl font-bold text-sm hover:bg-white border border-transparent hover:border-border transition-all active:scale-95"
              >
                {isSaved ? "✓ Đã Lưu" : "+ Thêm Kệ Sách"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Ranking Sidebar */}
      <aside className="hidden lg:block bg-surface p-6 rounded-2xl border border-border">
        <h2 className="text-lg font-black novel-title mb-6 flex items-center justify-between">
          Truyện Hot Tuần
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </h2>
        <div className="space-y-2">
          {topStories.slice(0, 5).map((story, index) => (
            <StoryCard 
              key={`rank-${story.id}`} 
              story={story} 
              variant="ranking" 
              rank={index + 1} 
            />
          ))}
        </div>
        <Link 
          href="/rankings"
          className="mt-6 block text-center text-xs font-bold text-accent hover:underline uppercase tracking-wider"
        >
          Xem tất cả bảng xếp hạng →
        </Link>
      </aside>
    </section>
  );
}
