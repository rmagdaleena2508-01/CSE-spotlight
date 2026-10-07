"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// One row of cards. Arrow buttons on wider screens, swipe on phones, no auto-scroll.
export function CategoryShelf({
  title,
  viewAllHref,
  empty,
  children,
}: {
  title: string;
  viewAllHref: string;
  empty: boolean;
  children: ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const headingId = `shelf-${title.toLowerCase().replace(/\W+/g, "-")}`;

  function scroll(direction: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section aria-labelledby={headingId} className="mt-10">
      <div className="flex items-center gap-2">
        <h2 id={headingId} className="text-xl font-semibold">
          {title}
        </h2>
        <div className="ml-auto flex items-center gap-1">
          {!empty && (
            <div className="hidden gap-1 sm:flex">
              <Button variant="outline" size="icon" aria-label={`Scroll ${title} left`} onClick={() => scroll(-1)}>
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="icon" aria-label={`Scroll ${title} right`} onClick={() => scroll(1)}>
                <ChevronRight />
              </Button>
            </div>
          )}
          <Link
            href={viewAllHref}
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-primary hover:bg-muted"
          >
            View all <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
      {empty ? (
        <p className="mt-3 rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
          No {title} posts this semester yet.
        </p>
      ) : (
        <ul
          ref={track}
          className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 motion-reduce:scroll-auto [scrollbar-width:thin]"
        >
          {children}
        </ul>
      )}
    </section>
  );
}
