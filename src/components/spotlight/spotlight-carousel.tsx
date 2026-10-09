"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, Layers, MapPin, X } from "lucide-react";
import { ReactionBar } from "@/components/reaction-bar";
import { CATEGORY_STICKER } from "@/lib/category-stickers";
import { categoryLabel, formatDate, levelLabel, resultLabel } from "@/lib/labels";
import { photoUrl } from "@/lib/photos";
import { displayName } from "@/lib/reactions/kinds";
import type { ReactionInfo } from "@/lib/reactions/load";
import { CATEGORIES } from "@/lib/schemas";
import type { SpotlightPost } from "@/lib/spotlight";
import { cn } from "@/lib/utils";

// Student Spotlight: tall photo cards in a sideways row, after Apple's product cards
// (and Aceternity's "Apple Cards Carousel"). Swipe or use the arrows to move; tap a card
// and it grows into the full story. Celebrate and Heart sit under every card.

const TONE: Record<string, string> = {
  technical: "from-sky-200 via-blue-100 to-indigo-200",
  non_technical: "from-violet-200 via-fuchsia-100 to-purple-200",
  arts: "from-rose-200 via-orange-100 to-amber-200",
  sports: "from-emerald-200 via-lime-100 to-teal-200",
};

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function SpotlightCarousel({
  posts,
  cheers,
  showTabs = true,
  label = "Student Spotlight",
}: {
  posts: SpotlightPost[];
  cheers: ReactionInfo;
  /** Category tabs above the row (the home section); the Spotlight page has its own. */
  showTabs?: boolean;
  label?: string;
}) {
  const [category, setCategory] = useState("all");
  // Kept as an id, so the open card shows fresh counts after someone reacts.
  const [openId, setOpenId] = useState<string | null>(null);
  const open = posts.find((p) => p.id === openId) ?? null;
  const close = useCallback(() => setOpenId(null), []);
  const shown = category === "all" ? posts : posts.filter((p) => p.category === category);

  return (
    <div>
      {showTabs && (
        <div role="tablist" aria-label="Pick a category" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {[{ value: "all", label: "All" }, ...CATEGORIES].map((c) => {
            const count = c.value === "all" ? posts.length : posts.filter((p) => p.category === c.value).length;
            const active = category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(c.value)}
                className={cn(
                  "lift inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium",
                  active ? "bg-[#0b0a0a] text-white" : "bg-white text-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]",
                )}
              >
                {c.label}
                <span className={cn("text-xs tabular-nums", active ? "text-white/60" : "text-muted-foreground")}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <Row key={category} posts={shown} cheers={cheers} onOpen={(p) => setOpenId(p.id)} label={label} />

      <AnimatePresence>
        {open && <Expanded post={open} cheers={cheers} onClose={close} />}
      </AnimatePresence>
    </div>
  );
}

function Row({
  posts,
  cheers,
  onOpen,
  label,
}: {
  posts: SpotlightPost[];
  cheers: ReactionInfo;
  onOpen: (p: SpotlightPost) => void;
  label: string;
}) {
  const scroller = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const reduced = useReducedMotion();

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const move = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 280), behavior: reduced ? "auto" : "smooth" });
  };

  if (posts.length === 0) {
    return (
      <div className="mt-6 grid place-items-center rounded-3xl border border-dashed border-black/15 bg-white/70 px-6 py-16 text-center">
        <p className="text-lg font-medium">No wins in this spotlight yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">Won something? Be the first to shine here.</p>
        <Link href="/submit" className="lift mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground">
          Add your win
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <ul
        ref={scroller}
        onScroll={measure}
        aria-label={label}
        className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pt-2 pb-6 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((p, i) => (
          <motion.li
            key={p.id}
            id={`post-${p.id}`}
            className="flex w-[15.5rem] shrink-0 snap-start flex-col gap-3 sm:w-[18rem] md:w-[21rem]"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: EASE, delay: Math.min(i, 5) * 0.06 }}
          >
            <Tile post={p} onOpen={() => onOpen(p)} />
            <ReactionBar
              key={`${cheers.mine[p.id] ?? ""}-${p.celebrate_count}-${p.heart_count}`}
              id={p.id}
              studentName={p.student_name}
              counts={{ celebrate: p.celebrate_count, heart: p.heart_count }}
              mine={cheers.mine[p.id] ?? null}
              latest={cheers.latest[p.id] ?? null}
              signedIn={cheers.signedIn}
              className="px-1"
            />
          </motion.li>
        ))}
      </ul>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={!edges.left}
          aria-label="Previous wins"
          className="lift grid size-11 place-items-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)] disabled:pointer-events-none disabled:opacity-35"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={!edges.right}
          aria-label="More wins"
          className="lift grid size-11 place-items-center rounded-full bg-[#0b0a0a] text-white disabled:pointer-events-none disabled:opacity-35"
        >
          <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** The picture side of a card (photo, or the category sticker on a soft gradient). */
function Cover({ post, sizes, priority }: { post: SpotlightPost; sizes: string; priority?: boolean }) {
  const photo = post.photo_paths[0];
  if (photo) {
    return <Image src={photoUrl(photo)} alt="" fill sizes={sizes} priority={priority} className="object-cover" />;
  }
  const sticker = CATEGORY_STICKER[post.category];
  return (
    <div className={cn("absolute inset-0 grid place-items-center bg-gradient-to-br", TONE[post.category] ?? TONE.technical)}>
      {sticker && (
        <Image src={sticker.src} alt="" width={sticker.w} height={sticker.h} className="w-1/2 max-w-48 -rotate-6 drop-shadow-[0_14px_18px_rgb(0_0_0/0.18)]" />
      )}
    </div>
  );
}

function Tile({ post, onOpen }: { post: SpotlightPost; onOpen: () => void }) {
  const isAward = post.result_type === "award";
  return (
    <motion.button
      type="button"
      layoutId={`spotlight-${post.id}`}
      onClick={onOpen}
      aria-label={`Read about ${post.event_name} by ${displayName(post.student_name)}`}
      className="group relative isolate aspect-[3/4] w-full overflow-hidden rounded-[28px] bg-neutral-100 text-left shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_18px_40px_-22px_rgb(0_0_0/0.45)] transition-[translate,scale] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:-translate-y-1 hover:scale-[1.015] focus-visible:ring-3 focus-visible:ring-black/40 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:transform-none"
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none">
        <Cover post={post} sizes="(min-width: 768px) 336px, 248px" />
      </div>
      {/* Shade at the top so white text stays readable on any photo. */}
      <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-black/70 via-black/25 to-transparent" aria-hidden />
      <div className="relative flex h-full flex-col p-5 text-white">
        <p className="text-xs font-semibold tracking-[0.12em] uppercase opacity-85">{categoryLabel(post.category)}</p>
        <p className="mt-2 line-clamp-3 font-[family-name:var(--font-headline)] text-[1.45rem] leading-[1.15] text-balance md:text-[1.7rem]">
          {post.event_name}
        </p>
        <p className="mt-2 text-sm font-medium opacity-90">{displayName(post.student_name)}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-bold",
              isAward ? "bg-[#fbbf24] text-[#080809]" : "bg-white/90 text-[#080809]",
            )}
          >
            {resultLabel(post)}
          </span>
          {post.is_verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              <BadgeCheck className="size-3.5" aria-hidden /> Verified
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

/** A card grown into the full story, with Celebrate and Heart. */
function Expanded({ post, cheers, onClose }: { post: SpotlightPost; cheers: ReactionInfo; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [onClose]);

  const name = displayName(post.student_name);
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto px-3 py-6 sm:px-6 sm:py-12">
      <motion.div
        className="fixed inset-0 bg-[rgb(11_10_10/0.5)] backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.article
        layoutId={`spotlight-${post.id}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${post.event_name}, ${name}`}
        className="relative mx-auto max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-[0_40px_120px_-30px_rgb(0_0_0/0.6)]"
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
      >
        <div className="relative h-64 sm:h-96">
          <Cover post={post} sizes="(min-width: 768px) 768px, 100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" aria-hidden />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="lift absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white/90 text-black"
          >
            <X className="size-5" aria-hidden />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-xs font-semibold tracking-[0.12em] uppercase opacity-85">{categoryLabel(post.category)}</p>
            <h3 className="mt-2 font-[family-name:var(--font-headline)] text-3xl leading-tight text-balance sm:text-4xl">
              {post.event_name}
            </h3>
          </div>
        </div>

        <motion.div
          className="p-6 sm:p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.4, ease: EASE } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
        >
          <p className="text-lg font-semibold">
            {name}
            {post.participation_type === "team" && (
              <span className="font-normal text-muted-foreground">{post.team_name ? ` · Team ${post.team_name}` : " · Team"}</span>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className={cn("rounded-full px-3 py-1 font-semibold", post.result_type === "award" ? "bg-amber-100 text-amber-800" : "bg-muted")}>
              {resultLabel(post)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
              <CalendarDays className="size-4" aria-hidden /> {formatDate(post.event_date)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
              <Layers className="size-4" aria-hidden /> {levelLabel(post.level)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
              <MapPin className="size-4" aria-hidden /> {post.organizer}
            </span>
            {post.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground">
                <BadgeCheck className="size-4" aria-hidden /> Faculty verified
              </span>
            )}
          </div>
          <p className="mt-5 leading-7 whitespace-pre-line text-foreground/85">{post.description}</p>

          <div className="mt-6 border-t pt-5">
            <ReactionBar
              key={`${cheers.mine[post.id] ?? ""}-${post.celebrate_count}-${post.heart_count}`}
              id={post.id}
              studentName={post.student_name}
              counts={{ celebrate: post.celebrate_count, heart: post.heart_count }}
              mine={cheers.mine[post.id] ?? null}
              latest={cheers.latest[post.id] ?? null}
              signedIn={cheers.signedIn}
            />
          </div>
          <Link
            href={`/achievements/${post.id}`}
            className="lift mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#0b0a0a] px-5 text-sm font-medium text-white"
          >
            Open the full post <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </motion.div>
      </motion.article>
    </div>
  );
}
