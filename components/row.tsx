"use client";

import { ReactNode } from "react";
import Link from "next/link";

type RowProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  href?: string;
  children: ReactNode;
  variant?: "grid" | "list";
};

export function Row({ 
  title, 
  eyebrow, 
  description, 
  href, 
  children, 
  variant = "grid" 
}: RowProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between border-b border-border pb-4">
        <div className="space-y-1">
          {eyebrow && (
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display novel-title text-2xl md:text-3xl text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-xs font-medium text-muted mt-1">
              {description}
            </p>
          )}
        </div>
        {href && (
          <Link 
            href={href}
            className="text-xs font-bold text-accent hover:underline uppercase tracking-wider mb-1"
          >
            Xem tất cả →
          </Link>
        )}
      </div>

      {variant === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {children}
        </div>
      ) : (
        <div className="flex flex-col">
          {children}
        </div>
      )}
    </section>
  );
}
