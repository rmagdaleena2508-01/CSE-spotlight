import Link from "next/link";
import type { CSSProperties } from "react";
import { HeroSticker } from "@/components/hero-sticker";
import { cn } from "@/lib/utils";

// Five stickers on one curved path, like planets along an orbit: low on the left,
// rising to the right. Order: scroll, cap, trophy, palette, football.
// They live in a small centred box (max 800px wide), so the group stays tight and
// centred on every screen. Left/bottom/width are percentages of that box.
// On laptops each one is a link that lifts off the page on hover (see HeroSticker).
const STICKERS = [
  {
    src: "/stickers/scroll.webp", w: 640, h: 593, rotate: -10,
    className: "left-[0%] bottom-[0%] w-[19%]",
    href: "/achievements?category=non_technical", label: "Non-technical achievements",
  },
  {
    src: "/stickers/cap.webp", w: 640, h: 604, rotate: -4,
    className: "left-[19%] bottom-[9%] w-[20%]",
    href: "/achievements?category=technical", label: "Technical achievements",
  },
  {
    src: "/stickers/trophy.webp", w: 624, h: 640, rotate: 4,
    className: "left-[41%] bottom-[20%] w-[16%]",
    href: "/achievements?result=award", label: "Wins and awards",
  },
  {
    src: "/stickers/palette.webp", w: 640, h: 610, rotate: 10,
    className: "left-[59%] bottom-[33%] w-[18%]",
    href: "/achievements?category=arts", label: "Arts achievements",
  },
  {
    src: "/stickers/football.webp", w: 640, h: 556, rotate: 16,
    className: "left-[80%] bottom-[48%] w-[19%]",
    href: "/achievements?category=sports", label: "Sports achievements",
  },
];

// Tailwind needs these as whole class names, so they are written out in full.
const OUTER_GRID =
  "[background-image:linear-gradient(rgb(0_0_0/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.06)_1px,transparent_1px)] [background-size:48px_48px] [background-position:center]";
const CARD_GRID =
  "[background-image:linear-gradient(rgb(0_0_0/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.05)_1px,transparent_1px)] [background-size:56px_56px] [background-position:center]";

// Headline words rise in one after another (CSI's word-rise); --i staggers them.
const LINE_ONE = ["What", "CSE", "students", "did"];
const LINE_TWO = ["this", "semester."];

function Word({ text, i }: { text: string; i: number }) {
  const cse = text === "CSE";
  return (
    <>
      <span
        className={cn(
          "word-rise",
          cse && "font-[family-name:var(--font-cse)] font-semibold italic [font-variation-settings:'SOFT'_100,'WONK'_1]",
        )}
        style={{ "--i": i } as CSSProperties}
      >
        {text}
      </span>{" "}
    </>
  );
}

export function Hero({ semesterLabel }: { semesterLabel: string }) {
  return (
    // Outer layer: white with a faint grid.
    <div
      className={cn(
        "relative isolate overflow-hidden -mt-[76px] bg-white px-3 pt-[100px] pb-10 sm:-mt-[84px] sm:px-6 sm:pt-[116px] sm:pb-14",
        OUTER_GRID,
      )}
    >
      {/* Sunshine around the card: warm, blurred light pooling at the corners and edges. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute top-[-12%] left-[-6%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgb(255_214_102/0.75),rgb(255_183_77/0.35)_45%,transparent)] blur-3xl" />
        <div className="absolute top-[-6%] right-[-8%] h-[60%] w-[50%] rounded-full bg-[radial-gradient(closest-side,rgb(255_236_153/0.8),rgb(255_200_87/0.3)_50%,transparent)] blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] h-[45%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgb(255_221_128/0.55),transparent)] blur-3xl" />
        {/* Soft rays fanning down from the top-left, like light through a window. */}
        <div className="absolute inset-0 bg-[repeating-conic-gradient(from_200deg_at_0%_0%,rgb(255_230_150/0.18)_0deg,transparent_6deg,transparent_14deg)] [mask-image:radial-gradient(80%_80%_at_0%_0%,black,transparent_75%)]" />
      </div>

      {/* The card: white, its own fine grid, a warm halo around it. It fades up from a
          slight zoom when the page opens (CSI's intro-sky). Wider than tall on laptops. */}
      <section
        className={cn(
          "intro-sky relative mx-auto max-w-[1392px] overflow-hidden rounded-[28px] bg-white",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_0_60px_8px_rgb(255_200_87/0.45),0_0_140px_40px_rgb(255_221_128/0.35)]",
          CARD_GRID,
        )}
      >
        <div className="relative z-10 mx-auto flex max-w-[1100px] flex-col items-center px-5 pt-14 pb-12 text-center sm:pt-28 sm:pb-20">
          <p
            className="intro-rise text-[11px] font-medium tracking-[0.18em] text-black/55 uppercase sm:text-xs"
            style={{ "--d": "0.1s" } as CSSProperties}
          >
            {semesterLabel}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-headline)] text-[clamp(2.25rem,5.2vw,4.5rem)] leading-[1.04] tracking-[-0.02em] text-balance text-black">
            {LINE_ONE.map((w, i) => (
              <Word key={w} text={w} i={i} />
            ))}
            <br className="hidden sm:block" />
            {LINE_TWO.map((w, i) => (
              <Word key={w} text={w} i={LINE_ONE.length + i} />
            ))}
          </h1>
          <p
            className="intro-rise mt-5 max-w-[460px] text-base leading-7 text-black/70 sm:text-lg sm:leading-[1.6]"
            style={{ "--d": "0.8s" } as CSSProperties}
          >
            Wins and events from our department, posted by students and checked by faculty.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/achievements"
              className="intro-rise inline-flex h-11 items-center rounded-full bg-black px-6 text-[15px] font-medium text-white transition-colors hover:bg-black/85"
              style={{ "--d": "0.95s" } as CSSProperties}
            >
              Explore achievements
            </Link>
            <Link
              href="/submit"
              className="intro-rise inline-flex h-11 items-center rounded-full bg-primary px-6 text-[15px] font-medium text-black transition-colors hover:bg-primary/85"
              style={{ "--d": "1.05s" } as CSSProperties}
            >
              Add your win
            </Link>
          </div>

          {/* Sticker orbit: a tight centred group under the buttons. */}
          <div className="relative mt-12 aspect-[800/300] w-full max-w-[800px] sm:mt-16">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="intro-rise pointer-events-none absolute inset-0 size-full overflow-visible"
              style={{ "--d": "1.1s" } as CSSProperties}
              aria-hidden
            >
              <path
                d="M 2 96 Q 55 92 98 30"
                fill="none"
                stroke="rgb(0 0 0 / 0.18)"
                strokeWidth="1.5"
                strokeDasharray="6 7"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {STICKERS.map((s, i) => (
              <HeroSticker
                key={s.src}
                src={s.src}
                width={s.w}
                height={s.h}
                href={s.href}
                label={s.label}
                rotate={s.rotate}
                className={s.className}
                delay={1.15 + i * 0.08}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
