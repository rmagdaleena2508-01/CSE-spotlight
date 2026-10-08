import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Sticker pile along the bottom of the hero card, in the style of a laptop lid:
// each one tilted a different way, overlapping, and cut off by the card edges.
// Positions are percentages of the card so the pile scales with the screen.
const STICKERS = [
  { src: "/stickers/football.webp", w: 640, h: 556, className: "left-[-5%] bottom-[1%] sm:bottom-[-9%] w-[30%] sm:w-[18%] -rotate-12" },
  { src: "/stickers/scroll.webp", w: 640, h: 593, className: "hidden sm:block left-[11%] bottom-[5%] w-[16%] rotate-[14deg]" },
  { src: "/stickers/trophy.webp", w: 624, h: 640, className: "left-[21%] sm:left-[25%] bottom-[-3%] sm:bottom-[-13%] w-[30%] sm:w-[16%] -rotate-[8deg]" },
  { src: "/stickers/cap.webp", w: 640, h: 604, className: "left-[44%] sm:left-[40%] bottom-[7%] sm:bottom-[-2%] w-[34%] sm:w-[22%] rotate-[10deg]" },
  { src: "/stickers/medal.webp", w: 615, h: 640, className: "hidden sm:block left-[61%] bottom-[-12%] w-[14%] -rotate-[16deg]" },
  { src: "/stickers/palette.webp", w: 640, h: 610, className: "right-[-8%] sm:right-[-4%] bottom-[11%] sm:bottom-[2%] w-[30%] sm:w-[21%] rotate-[18deg]" },
];

// Round badge with text running around the edge. Only the text ring spins.
function SpinBadge({ className }: { className?: string }) {
  return (
    <div className={cn("absolute aspect-square", className)}>
      <svg viewBox="0 0 200 200" className="size-full drop-shadow-[0_8px_16px_rgb(0_0_0/0.35)]">
        <circle cx="100" cy="100" r="96" fill="#ffffff" />
        <circle cx="100" cy="100" r="88" fill="#1d4ed8" stroke="#111111" strokeWidth="3" />
        <circle cx="100" cy="100" r="44" fill="#111111" />
        <circle cx="100" cy="100" r="38" fill="#aef96c" />
        <text x="100" y="114" textAnchor="middle" fontSize="40" fontWeight="700" fill="#080809" fontFamily="var(--font-sans)">
          &lt;/&gt;
        </text>
      </svg>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full animate-crew-spin">
        <defs>
          <path id="badge-ring" d="M100,100 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0" />
        </defs>
        <text fontSize="17" fill="#ffffff" letterSpacing="3.2" fontFamily="var(--font-pixel)">
          <textPath href="#badge-ring">CSE SPOTLIGHT · DCSE · SRM VDP ·</textPath>
        </text>
      </svg>
    </div>
  );
}

export function Hero({ semesterLabel }: { semesterLabel: string }) {
  return (
    <div className="relative px-2 pt-2 sm:px-5 sm:pt-5">
      {/* Soft lime glow behind the card. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(60%_60%_at_50%_0%,rgb(174_249_108/0.14),transparent_70%)]"
        aria-hidden
      />
      <section className="relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[20px] bg-black">
        {/* Faint square grid, like Campus Crew. */}
        <div
          className="absolute inset-0 -z-10 [background-image:linear-gradient(rgb(255_255_255/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.07)_1px,transparent_1px)] [background-position:center] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[86svh] max-w-4xl flex-col items-center px-5 pt-16 pb-[44vw] text-center sm:min-h-[88vh] sm:pt-24 sm:pb-[22vw] lg:pb-[18vw]">
          <p className="text-sm font-medium tracking-[0.2em] text-primary uppercase">{semesterLabel}</p>
          <h1 className="font-display mt-5 text-[clamp(1.9rem,4.6vw,4.4rem)] leading-[1.15] tracking-[0.13em] text-balance text-white uppercase">
            What CSE students did this semester
          </h1>
          <p className="mt-6 max-w-[795px] text-lg leading-8 text-white/90 sm:text-2xl sm:leading-9">
            Wins and events from our class, posted by students and checked by faculty.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/achievements"
              className="inline-flex h-[60px] items-center rounded-md bg-primary px-8 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/85 sm:text-xl"
            >
              Explore achievements
            </Link>
            <Link
              href="/submit"
              className="inline-flex h-[60px] items-center rounded-md px-8 text-lg font-bold text-primary shadow-[inset_0_0_0_1px_var(--primary)] transition-colors hover:bg-primary/10 sm:text-xl"
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
              sizes="(min-width: 640px) 22vw, 34vw"
              className={cn("absolute h-auto drop-shadow-[0_8px_16px_rgb(0_0_0/0.35)] select-none", s.className)}
            />
          ))}
          <SpinBadge className="right-[14%] bottom-[16%] hidden w-[12%] -rotate-12 sm:block" />
        </div>
      </section>
    </div>
  );
}
