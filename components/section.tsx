import Link from "next/link";
import type { ReactNode } from "react";

type SectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  children: ReactNode;
};

export function Section({
  eyebrow,
  title,
  description,
  href,
  children,
}: SectionProps) {
  return (
    <section className="space-y-5 md:space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
            {eyebrow}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
          {description ? <p className="max-w-2xl text-sm text-muted">{description}</p> : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium md:inline-flex"
          >
            Xem them
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
