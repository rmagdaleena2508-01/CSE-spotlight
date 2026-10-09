import Link from "next/link";
import type { CSSProperties } from "react";
import { StickerOrbit, type OrbitSticker } from "@/components/sticker-orbit";
import { cn } from "@/lib/utils";

// Five stickers on one curved path, like planets along an orbit: low on the left,
// rising to the right. Order: scroll, cap, trophy, palette, football, medal.
// They live in a small centred box (max 800px wide), so the group stays tight and
// centred on every screen. Widths are percentages of that box.
// They drift along the orbit in a loop between two invisible walls (see StickerOrbit).
// On laptops each one is a link that lifts off the page on hover (see HeroSticker).
const STICKERS: OrbitSticker[] = [
  {
    src: "/stickers/scroll.webp",
    w: 640,
    h: 593,
    size: 19,
    href: "/achievements?category=non_technical",
    label: "Non-technical achievements",
  },
  {
    src: "/stickers/cap.webp",
    w: 640,
    h: 604,
    size: 20,
    href: "/achievements?category=technical",
    label: "Technical achievements",
  },
  {
    src: "/stickers/trophy.webp",
    w: 624,
    h: 640,
    size: 16,
    href: "/achievements?result=award",
    label: "Wins and awards",
  },
  {
    src: "/stickers/palette.webp",
    w: 640,
    h: 610,
    size: 18,
    href: "/achievements?category=arts",
    label: "Arts achievements",
  },
  {
    src: "/stickers/football.webp",
    w: 640,
    h: 556,
    size: 19,
    href: "/achievements?category=sports",
    label: "Sports achievements",
  },
  {
    // Follows the football round the loop, filling what was a wide empty gap.
    src: "/stickers/medal.webp",
    w: 615,
    h: 640,
    size: 17,
    href: "/achievements",
    label: "All achievements",
  },
];

// Tailwind needs these as whole class names, so they are written out in full.
const OUTER_GRID =
  "[background-image:linear-gradient(rgb(0_0_0/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.06)_1px,transparent_1px)] [background-size:48px_48px] [background-position:center]";
const CARD_GRID =
  "[background-image:linear-gradient(rgb(0_0_0/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(0_0_0/0.05)_1px,transparent_1px)] [background-size:56px_56px] [background-position:center]";

// Hero buttons: on hover they rise toward the viewer and a soft shadow spreads beneath,
// eased over half a second on CSI's editorial curve so it never snaps. Pressing sinks
// them back a touch. Off for people who reduce motion.
const LIFT =
  "inline-flex h-11 items-center rounded-full px-6 text-[15px] font-medium will-change-transform " +
  "shadow-[0_2px_6px_-2px_rgb(0_0_0/0.2)] transition-[translate,scale,box-shadow] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] " +
  "hover:-translate-y-1 hover:scale-[1.04] hover:shadow-[0_18px_32px_-12px_rgb(0_0_0/0.45)] " +
  "active:translate-y-0 active:scale-[0.98] active:duration-150 " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100";

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
          cse &&
            "font-[family-name:var(--font-cse)] font-semibold italic [font-variation-settings:'SOFT'_100,'WONK'_1]",
        )}
        style={{ "--i": i } as CSSProperties}
      >
        {text}
      </span>{" "}
    </>
  );
}

export function Hero() {
  return (
    // Outer layer: white with a faint grid.
    <div
      className={cn(
        "relative isolate overflow-hidden -mt-[76px] bg-white px-3 pt-[100px] pb-10 sm:-mt-[84px] sm:px-6 sm:max-[899px]:pt-[116px] sm:max-[899px]:pb-14",
        // Laptops: the whole hero is exactly one screen tall, so nothing needs scrolling.
        "min-[900px]:flex min-[900px]:h-[100svh] min-[900px]:flex-col min-[900px]:pt-[96px] min-[900px]:pb-5",
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
          "intro-sky relative mx-auto w-full max-w-[1392px] overflow-hidden rounded-[28px] bg-white min-[900px]:min-h-0 min-[900px]:flex-1",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_0_60px_8px_rgb(255_200_87/0.45),0_0_140px_40px_rgb(255_221_128/0.35)]",
          CARD_GRID,
        )}
      >
        <div className="relative z-10 mx-auto flex max-w-[1100px] flex-col items-center px-5 pt-14 pb-12 text-center sm:max-[899px]:pt-28 sm:max-[899px]:pb-20 min-[900px]:h-full min-[900px]:pt-[clamp(1.25rem,6vh,4.5rem)] min-[900px]:pb-[clamp(0.75rem,3vh,2rem)]">
          {/* No date label: students add wins as they happen, so the hero is not tied to a term. */}
          <h1 className="font-[family-name:var(--font-headline)] text-[clamp(2.25rem,5.2vw,4.5rem)] leading-[1.04] min-[900px]:text-[clamp(2rem,min(5.2vw,8.5vh),4.5rem)] tracking-[-0.02em] text-balance text-black">
            {LINE_ONE.map((w, i) => (
              <Word key={w} text={w} i={i} />
            ))}
            <br className="hidden sm:block" />
            {LINE_TWO.map((w, i) => (
              <Word key={w} text={w} i={LINE_ONE.length + i} />
            ))}
          </h1>
          <p
            className="intro-rise mt-5 max-w-[560px] text-base leading-7 text-black/70 sm:text-lg sm:leading-[1.6] min-[900px]:mt-[clamp(0.5rem,2vh,1.25rem)]"
            style={{ "--d": "0.8s" } as CSSProperties}
          >
            Wins and events from the Dept. Of Computer Science &amp; Engineering,
            SRMIST VDP, posted by students and checked by faculty.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3 min-[900px]:mt-[clamp(0.75rem,3vh,1.75rem)]">
            {/* The entrance runs on the wrapper, the hover lift on the button: a CSS animation's
                end state would otherwise override the hover transform. */}
            <span className="intro-rise inline-flex" style={{ "--d": "0.95s" } as CSSProperties}>
              <Link href="/achievements" className={cn(LIFT, "bg-black text-white")}>
                Explore achievements
              </Link>
            </span>
            <span className="intro-rise inline-flex" style={{ "--d": "1.05s" } as CSSProperties}>
              <Link href="/submit" className={cn(LIFT, "bg-primary text-black")}>
                Add your win
              </Link>
            </span>
          </div>

          {/* Sticker orbit: a tight centred group under the buttons. */}
          {/* On laptops this area takes whatever height is left in the card, and the sticker
              box inside shrinks to fit it, so the stickers are never cut off. */}
          <div className="relative mt-12 w-full sm:max-[899px]:mt-16 min-[900px]:mt-[clamp(0.5rem,3vh,2rem)] min-[900px]:min-h-0 min-[900px]:flex-1 min-[900px]:[container-type:size]">
            {/* The box's left and right edges are the invisible walls: anything past them is
                clipped, while the top and bottom stay open for the hover lift. It is also the
                container the stickers measure their moves against (cqw). */}
            <div className="relative mx-auto aspect-[800/300] w-full max-w-[800px] [container-type:inline-size] [clip-path:inset(-60%_0_-30%_0)] min-[900px]:absolute min-[900px]:bottom-0 min-[900px]:left-1/2 min-[900px]:w-[min(100cqw,800px,calc(100cqh*8/3))] min-[900px]:-translate-x-1/2">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="intro-rise pointer-events-none absolute inset-0 size-full overflow-visible"
                style={{ "--d": "1.1s" } as CSSProperties}
                aria-hidden
              >
                <path
                  d="M 2 81 Q 55 80 98 30"
                  fill="none"
                  stroke="rgb(0 0 0 / 0.18)"
                  strokeWidth="1.5"
                  strokeDasharray="6 7"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <StickerOrbit stickers={STICKERS} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
