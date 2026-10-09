"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// One row of cards. Arrow buttons on wider screens, swipe on phones, no auto-scroll.
export function CategoryShelf({
  title,
  sticker,
  viewAllHref,
  empty,
  children,
}: {
  title: string;
  sticker?: { src: string; w: number; h: number };
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
    <section aria-labelledby={headingId} className="mt-20">
      <div className="flex items-center gap-3">
        {sticker && (
          <Image src={sticker.src} alt="" width={sticker.w} height={sticker.h} sizes="56px" className="h-auto w-12 -rotate-12 sm:w-14" />
        )}
        <h2 id={headingId} className="font-display text-3xl text-foreground sm:text-4xl">
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
            className="lift inline-flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground"
          >
            View all <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
      {empty ? (
        <p className="mt-5 rounded-[20px] border border-dashed border-black/15 p-8 text-center text-muted-foreground">
          No {title} posts this semester yet.
        </p>
      ) : (
        <ul
          ref={track}
          className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 motion-reduce:scroll-auto [scrollbar-width:thin]"
        >
          {children}
        </ul>
      )}
    </section>
  );
}
