"use client";

import Image from "next/image";
import Link from "next/link";
import type { Story } from "@/lib/stories";

type StoryCardProps = {
  story: Story;
  variant?: "default" | "compact" | "ranking";
  rank?: number;
};

export function StoryCard({ story, variant = "default", rank }: StoryCardProps) {
  if (variant === "compact") {
    return (
      <Link 
        href={`/truyen/${story.slug}`}
        className="flex gap-4 group py-3 border-b border-border/50 last:border-none"
      >
        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md shadow-sm">
          {story.cover ? (
             <Image 
              src={story.cover} 
              alt={story.title} 
              fill 
              sizes="56px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full bg-surface-strong" />
          )}
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <h3 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-accent transition-colors">
            {story.title}
          </h3>
          <p className="mt-1 text-[11px] font-medium text-muted line-clamp-1">
            {story.author} • {story.genre}
          </p>
          <p className="mt-1 text-[10px] text-accent font-bold uppercase tracking-wider">
            {story.status === "Completed" ? "Đã hoàn thành" : "Đang cập nhật"}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "ranking") {
    return (
       <Link 
        href={`/truyen/${story.slug}`}
        className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-strong transition-colors group"
      >
        <span className={`text-2xl font-black italic ${rank && rank <= 3 ? "text-accent" : "text-muted/30"}`}>
          {rank}
        </span>
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-accent transition-colors">
            {story.title}
          </h3>
          <p className="text-[11px] font-medium text-muted">{story.genre}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      href={`/truyen/${story.slug}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-surface-strong shadow-md card-hover">
        {story.cover ? (
          <Image 
            src={story.cover} 
            alt={story.title} 
            fill 
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center">
             <span className="text-xs font-bold text-muted/40 uppercase tracking-tighter leading-tight">
               {story.title}
             </span>
          </div>
        )}
        <div className="absolute top-2 left-2">
           <span className={`badge ${story.status === 'Completed' ? 'badge-completed' : 'badge-ongoing'} scale-75 origin-left shadow-sm`}>
             {story.status === 'Completed' ? 'Full' : 'Mới'}
           </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
           <p className="text-[10px] font-bold text-white uppercase tracking-widest">
             Xem chi tiết →
           </p>
        </div>
      </div>
      <div className="mt-3 px-1">
        <h3 className="line-clamp-2 text-sm font-extrabold text-foreground leading-snug group-hover:text-accent transition-colors">
          {story.title}
        </h3>
        <p className="mt-1 text-[11px] font-semibold text-muted">
          {story.author}
        </p>
        <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-muted/60">
           <span>{story.genre}</span>
           <span>•</span>
           <span>{story.viewsLabel} lượt xem</span>
        </div>
      </div>
    </Link>
  );
}
