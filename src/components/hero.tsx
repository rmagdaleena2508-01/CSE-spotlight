import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Five stickers sitting on one curved path, like planets along an orbit: low on the
// left and rising to the right. Order: scroll, cap, trophy, palette, football.
// Left/bottom/width are percentages of the card, so the curve scales with the screen.
// Everything stays fully inside the card and nothing moves.
const STICKERS = [
  { src: "/stickers/scroll.webp", w: 640, h: 593, className: "left-[3%] bottom-[4%] w-[19%] sm:left-[4%] sm:bottom-[4%] sm:w-[17%] -rotate-[10deg]" },
  { src: "/stickers/cap.webp", w: 640, h: 604, className: "left-[20%] bottom-[5%] w-[21%] sm:left-[22%] sm:bottom-[8%] sm:w-[18%] -rotate-[4deg]" },
  { src: "/stickers/trophy.webp", w: 624, h: 640, className: "left-[40%] bottom-[8%] w-[18%] sm:left-[42%] sm:bottom-[12%] sm:w-[14%] rotate-[4deg]" },
  { src: "/stickers/palette.webp", w: 640, h: 610, className: "left-[59%] bottom-[12%] w-[19%] sm:left-[60%] sm:bottom-[18%] sm:w-[16%] rotate-[10deg]" },
  { src: "/stickers/football.webp", w: 640, h: 556, className: "left-[79%] bottom-[18%] w-[19%] sm:left-[79%] sm:bottom-[27%] sm:w-[16%] rotate-[16deg]" },
];

// Tailwind needs these as whole class names, so they are written out in full.
const OUTER_GRID =
  "[background-image:linear-gradient(rgb(0_0_0/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.06)_1px,transparent_1px)] [background-size:48px_48px] [background-position:center]";
const CARD_GRID =
  "[background-image:linear-gradient(rgb(0_0_0/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.05)_1px,transparent_1px)] [background-size:56px_56px] [background-position:center]";

export function Hero({ semesterLabel }: { semesterLabel: string }) {
  return (
    // Outer layer: white with a faint grid.
    <div className={cn("relative isolate overflow-hidden bg-white px-3 pt-6 pb-10 sm:px-[9%] sm:pt-12 sm:pb-16", OUTER_GRID)}>
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
          "relative mx-auto max-w-[1640px] overflow-hidden rounded-[28px] bg-white",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_0_60px_8px_rgb(255_200_87/0.45),0_0_140px_40px_rgb(255_221_128/0.35)]",
          CARD_GRID,
        )}
      >
        <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-5xl flex-col items-center px-5 pt-16 pb-[52vw] text-center sm:min-h-[86vh] sm:pt-28 sm:pb-[25vw] lg:pb-[22vw]">
          <p className="text-xs font-medium tracking-[0.25em] text-black/60 uppercase sm:text-sm">{semesterLabel}</p>
          <h1 className="mt-5 font-[family-name:var(--font-headline)] text-[clamp(1.8rem,3vw,3.6rem)] leading-[1.15] tracking-[0.03em] text-black uppercase lg:whitespace-nowrap">
            What{" "}
            <span className="font-[family-name:var(--font-cse)] font-semibold normal-case tracking-normal [font-variation-settings:'SOFT'_100,'WONK'_1]">
              CSE
            </span>{" "}
            students did
            <br className="lg:hidden" /> this semester
          </h1>
          <p className="mt-7 max-w-[900px] text-lg leading-8 text-black/80 sm:text-2xl sm:leading-10">
            Wins and events from our department, posted by students and checked by faculty.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/achievements"
              className="inline-flex h-[60px] items-center rounded-md bg-primary px-8 text-lg font-bold text-black transition-colors hover:bg-primary/85 sm:text-xl"
            >
              Explore achievements
            </Link>
            <Link
              href="/submit"
              className="inline-flex h-[60px] items-center rounded-md px-8 text-lg font-bold text-black shadow-[inset_0_0_0_1.5px_rgb(0_0_0)] transition-colors hover:bg-black/5 sm:text-xl"
            >
              Add your win
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          {/* Faint dashed orbit the stickers sit on. */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 h-[40%] w-full sm:h-[45%]"
          >
            <path
              d="M -2 92 Q 55 88 102 22"
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
              sizes="(min-width: 640px) 18vw, 21vw"
              className={cn("absolute h-auto drop-shadow-[0_10px_18px_rgb(0_0_0/0.18)] select-none", s.className)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
