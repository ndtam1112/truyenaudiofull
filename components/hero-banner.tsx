"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Story } from "@/lib/stories";

type HeroBannerProps = {
  story: Story;
  topStories?: Story[];
};

export function HeroBanner({ story, topStories = [] }: HeroBannerProps) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <section className="relative w-full rounded-[2.5rem] bg-white border border-border/60 overflow-hidden shadow-2xl shadow-black/[0.02]">
      
      {/* Dynamic Ambient Glow Behind the Cover (Very Subtle) */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 md:p-16 lg:p-20 xl:p-24 gap-8 md:gap-12 lg:gap-20 z-10 w-full min-h-[480px]">
        
        {/* Left: The Attraction (Cover Image) */}
        {/* Sizes: ~240px mobile, ~300px tablet, ~380px desktop. Prominent, but perfectly contained. */}
        <div className="w-[220px] sm:w-[260px] md:w-[300px] lg:w-[380px] shrink-0 group perspective-[1000px] mx-auto md:mx-0">
           
           <div className="relative w-full aspect-[3/4.2] rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transform transition-transform duration-700 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.2)]">
              {story.cover ? (
                 <Image 
                   src={story.cover} 
                   alt={story.title} 
                   fill 
                   priority
                   sizes="(max-width: 768px) 260px, (max-width: 1024px) 300px, 400px"
                   className="object-cover transition-transform duration-[10s] ease-out group-hover:scale-105"
                 />
              ) : (
                 <div className="w-full h-full bg-surface-strong flex text-center items-center justify-center font-display text-4xl text-muted p-4">
                   {story.title}
                 </div>
              )}
              {/* Overlay styling for extra polish */}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[1.5rem] lg:rounded-[2rem] pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent pointer-events-none mix-blend-multiply opacity-50" />
           </div>

           {/* Floating aesthetic tags */}
           <div className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 scale-90 sm:scale-100 z-20">
              <span className="px-5 py-2.5 bg-white backdrop-blur-xl rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-accent shadow-2xl border border-border/40 inline-block rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500">
                Tiêu Điểm
              </span>
           </div>
           
           <div className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 scale-90 sm:scale-100 z-20">
              <span className="flex items-center justify-center w-14 h-14 bg-foreground rounded-full text-white font-black text-lg shadow-2xl border-4 border-white rotate-[10deg] group-hover:rotate-0 transition-transform duration-500">
                #1
              </span>
           </div>
        </div>

        {/* Right: Typography & Actions */}
        <div className="flex-1 flex flex-col justify-center text-center md:text-left w-full">
           
           {/* Genre Tag */}
           <div className="mb-4 opacity-70 flex items-center justify-center md:justify-start gap-2">
              <span className="w-6 h-[1px] bg-accent" />
              <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">{story.genre}</p>
           </div>

           <h1 className="font-display text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] text-foreground mb-6 line-clamp-3">
             {story.title}
           </h1>
           
           {/* Secondary Metadata */}
           <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-6 mb-8 bg-surface-strong border border-border/60 py-2.5 px-4 rounded-full max-w-max mx-auto md:mx-0 shadow-sm">
              <div className="flex items-center gap-2">
                 <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                 <span className="text-[10px] sm:text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-[200px]">{story.author}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-2">
                 <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                 <span className="text-[10px] sm:text-xs font-bold text-foreground">{story.chapterCount} Chương</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-border md:block hidden" />
              <div className="hidden md:flex items-center gap-2">
                 <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <span className="text-[10px] sm:text-xs font-bold text-foreground">{story.totalReadingTime}</span>
              </div>
           </div>

           <p className="text-sm md:text-base text-muted/80 leading-relaxed mb-10 line-clamp-3 max-w-xl mx-auto md:mx-0 font-medium md:pl-4 md:border-l-2 md:border-accent/40">
             {story.summary || "Một kiệt tác văn học được hệ thống tuyển chọn gắt gao. Hãy chuẩn bị bước vào một cuộc hành trình dài đầy thú vị."}
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 w-full">
             <Link 
               href={`/truyen/${story.slug}`}
               className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-foreground hover:bg-black text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl shadow-black/10 active:scale-95 text-center flex items-center justify-center gap-3"
             >
               Bắt Đầu Đọc
               <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
             </Link>
             <button 
               onClick={() => setIsSaved(!isSaved)}
               className="w-full sm:w-auto px-8 py-4 sm:py-5 bg-white hover:bg-gray-50 text-foreground border border-border/80 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-[0_4px_10px_rgba(0,0,0,0.02)] active:scale-95 flex items-center justify-center gap-3"
             >
               <svg className={`w-4 h-4 ${isSaved ? 'fill-accent text-accent' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
               </svg>
               {isSaved ? "Đã Lưu" : "Thêm Tủ Sách"}
             </button>
           </div>
        </div>

      </div>
    </section>
  );
}
