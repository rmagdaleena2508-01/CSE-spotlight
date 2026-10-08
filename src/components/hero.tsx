import Image from "next/image";
import Link from "next/link";
import { History } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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

export function Hero({ semesterLabel }: { semesterLabel: string }) {
  return (
    <div className="px-2 pt-2 sm:px-4 sm:pt-4">
      <section className="relative isolate overflow-hidden rounded-[20px] bg-black">
        {/* Light mode: the lake photo. Dark mode: plain black with a faint grid. */}
        <picture>
          <source media="(max-width: 767px)" srcSet="/hero/day-mobile.webp" type="image/webp" />
          <img
            src="/hero/day-desktop.webp"
            alt=""
            fetchPriority="high"
            className="absolute inset-0 -z-10 size-full object-cover object-[center_40%] dark:hidden"
          />
        </picture>
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/45 via-slate-900/10 to-transparent dark:hidden"
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 hidden [background-image:linear-gradient(rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.06)_1px,transparent_1px)] [background-size:56px_56px] dark:block"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[86svh] max-w-3xl flex-col items-center px-5 pt-14 pb-[42vw] text-center sm:min-h-[88vh] sm:pt-20 sm:pb-[22vw] lg:pb-[19vw]">
          <p className="text-sm font-medium tracking-wide text-white/90 [text-shadow:0_1px_2px_rgb(0_0_0/0.4)]">
            {semesterLabel}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.35)] sm:text-6xl">
            What CSE students did this semester
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90 [text-shadow:0_1px_6px_rgb(0_0_0/0.4)] sm:text-xl">
            Wins and events from our class, posted by students and checked by faculty.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/achievements" className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-base font-semibold")}>
              Explore achievements
            </Link>
            <Link
              href="/submit"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 border-transparent bg-white/90 px-6 text-base font-semibold text-stone-900 hover:bg-white hover:text-stone-900",
                "dark:bg-transparent dark:text-white dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.5)] dark:hover:bg-white/10 dark:hover:text-white",
              )}
            >
              Add your achievement
            </Link>
          </div>
          <Link
            href="/achievements?period=past"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/90 underline-offset-4 hover:underline"
          >
            <History className="size-4" aria-hidden /> Past achievements
          </Link>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-full" aria-hidden>
          {STICKERS.map((s) => (
            <Image
              key={s.src}
              src={s.src}
              alt=""
              width={s.w}
              height={s.h}
              sizes="(min-width: 640px) 20vw, 32vw"
              className={cn(
                "absolute h-auto drop-shadow-[0_8px_16px_rgb(0_0_0/0.25)] select-none",
                s.className,
              )}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
