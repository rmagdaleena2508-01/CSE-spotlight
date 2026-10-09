import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Five stickers on one curved path, like planets along an orbit: low on the left,
// rising to the right. Order: scroll, cap, trophy, palette, football.
// They live in a small centred box (max 720px wide), so the group stays tight and
// centred on every screen. Left/bottom/width are percentages of that box. Static.
const STICKERS = [
  { src: "/stickers/scroll.webp", w: 640, h: 593, className: "left-[0%] bottom-[0%] w-[19%] -rotate-[10deg]" },
  { src: "/stickers/cap.webp", w: 640, h: 604, className: "left-[19%] bottom-[9%] w-[20%] -rotate-[4deg]" },
  { src: "/stickers/trophy.webp", w: 624, h: 640, className: "left-[41%] bottom-[20%] w-[16%] rotate-[4deg]" },
  { src: "/stickers/palette.webp", w: 640, h: 610, className: "left-[59%] bottom-[33%] w-[18%] rotate-[10deg]" },
  { src: "/stickers/football.webp", w: 640, h: 556, className: "left-[80%] bottom-[48%] w-[19%] rotate-[16deg]" },
];

// Tailwind needs these as whole class names, so they are written out in full.
const OUTER_GRID =
  "[background-image:linear-gradient(rgb(0_0_0/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.06)_1px,transparent_1px)] [background-size:48px_48px] [background-position:center]";
const CARD_GRID =
  "[background-image:linear-gradient(rgb(0_0_0/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.05)_1px,transparent_1px)] [background-size:56px_56px] [background-position:center]";

export function Hero({ semesterLabel }: { semesterLabel: string }) {
  return (
    // Outer layer: white with a faint grid.
    <div className={cn("relative isolate overflow-hidden -mt-[76px] bg-white px-3 pt-[100px] pb-10 sm:-mt-[84px] sm:px-8 sm:pt-[124px] sm:pb-16", OUTER_GRID)}>
      {/* Sunshine around the card: warm, blurred light pooling at the corners and edges. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute top-[-12%] left-[-6%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgb(255_214_102/0.75),rgb(255_183_77/0.35)_45%,transparent)] blur-3xl" />
        <div className="absolute top-[-6%] right-[-8%] h-[60%] w-[50%] rounded-full bg-[radial-gradient(closest-side,rgb(255_236_153/0.8),rgb(255_200_87/0.3)_50%,transparent)] blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] h-[45%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgb(255_221_128/0.55),transparent)] blur-3xl" />
        {/* Soft rays fanning down from the top-left, like light through a window. */}
        <div className="absolute inset-0 bg-[repeating-conic-gradient(from_200deg_at_0%_0%,rgb(255_230_150/0.18)_0deg,transparent_6deg,transparent_14deg)] [mask-image:radial-gradient(80%_80%_at_0%_0%,black,transparent_75%)]" />
      </div>

      {/* The card: white, its own fine grid, a warm halo around it. */}
      <section
        className={cn(
          "relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] bg-white",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_0_60px_8px_rgb(255_200_87/0.45),0_0_140px_40px_rgb(255_221_128/0.35)]",
          CARD_GRID,
        )}
      >
        <div className="relative z-10 mx-auto flex max-w-[1060px] flex-col items-center px-5 pt-14 pb-10 text-center sm:pt-24 sm:pb-14">
          <p className="text-[11px] font-medium tracking-[0.18em] text-black/55 uppercase sm:text-xs">{semesterLabel}</p>
          <h1 className="mt-4 font-[family-name:var(--font-headline)] text-[clamp(2.25rem,5.2vw,4.5rem)] leading-[1.04] tracking-[-0.02em] text-balance text-black">
            What{" "}
            <span className="font-[family-name:var(--font-cse)] font-semibold italic [font-variation-settings:'SOFT'_100,'WONK'_1]">
              CSE
            </span>{" "}
            students did <br className="hidden sm:block" />
            this semester.
          </h1>
          <p className="mt-5 max-w-[460px] text-base leading-7 text-black/70 sm:text-lg sm:leading-[1.6]">
            Wins and events from our department, posted by students and checked by faculty.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/achievements"
              className="inline-flex h-11 items-center rounded-full bg-black px-6 text-[15px] font-medium text-white transition-colors hover:bg-black/85"
            >
              Explore achievements
            </Link>
            <Link
              href="/submit"
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-[15px] font-medium text-black transition-colors hover:bg-primary/85"
            >
              Add your win
            </Link>
          </div>

          {/* Sticker orbit: a tight centred group under the buttons. */}
          <div className="pointer-events-none relative mt-12 aspect-[720/270] w-full max-w-[720px] sm:mt-16" aria-hidden>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
              <path
                d="M 2 96 Q 55 92 98 30"
                fill="none"
                stroke="rgb(0 0 0 / 0.18)"
                strokeWidth="1.5"
                strokeDasharray="6 7"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {STICKERS.map((s) => (
              <Image
                key={s.src}
                src={s.src}
                alt=""
                width={s.w}
                height={s.h}
                sizes="(min-width: 768px) 144px, 20vw"
                className={cn("absolute h-auto drop-shadow-[0_8px_14px_rgb(0_0_0/0.16)] select-none", s.className)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
