import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Sticker pile laid out like the HackerRank Campus Crew hero: a round sticker hugging
// the bottom-left corner, one big tilted centrepiece, smaller ones overlapping it, and
// a tall one and a wide one on the right that run off the edge. Left/width are
// percentages of the card; the card's rounded corners crop whatever hangs off.
const STICKERS = [
  // Round sticker in the bottom-left corner (the vinyl record's spot).
  { src: "/stickers/football.webp", w: 640, h: 556, className: "left-[-3%] bottom-[-7%] w-[34%] sm:left-[-1%] sm:bottom-[-8%] sm:w-[25%] -rotate-6" },
  // Big tilted centrepiece (the retro console's spot).
  { src: "/stickers/cap.webp", w: 640, h: 604, className: "left-[24%] bottom-[2%] w-[46%] sm:left-[19%] sm:bottom-[-2%] sm:w-[35%] rotate-[16deg]" },
  // Small square tile overlapping the centrepiece (the logo tile's spot).
  { src: "/stickers/medal.webp", w: 615, h: 640, className: "hidden sm:block left-[38%] bottom-[-14%] w-[21%] -rotate-[27deg]" },
  // Round badge (the globe badge's spot).
  { src: "/stickers/scroll.webp", w: 640, h: 593, className: "hidden sm:block left-[54%] bottom-[-9%] w-[21%] -rotate-[30deg]" },
  // Tall sticker on the right (the Game Boy's spot).
  { src: "/stickers/trophy.webp", w: 624, h: 640, className: "right-[16%] bottom-[-2%] w-[30%] sm:right-auto sm:left-[65%] sm:bottom-[-2%] sm:w-[22%] -rotate-12" },
  // Wide sticker running off the right edge (the Host/Coach/Build tags' spot).
  { src: "/stickers/palette.webp", w: 640, h: 610, className: "right-[-10%] bottom-[-8%] w-[32%] sm:right-[-3%] sm:bottom-[-10%] sm:w-[24%] -rotate-[15deg]" },
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
          {STICKERS.map((s) => (
            <Image
              key={s.src}
              src={s.src}
              alt=""
              width={s.w}
              height={s.h}
              sizes="(min-width: 640px) 30vw, 46vw"
              className={cn("absolute h-auto drop-shadow-[0_10px_18px_rgb(0_0_0/0.18)] select-none", s.className)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
