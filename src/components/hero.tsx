import Link from "next/link";
import { History } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Full-width lake scene. Phones get the tall picture, laptops the wide one.
// In dark mode the photo is hidden and the hero is plain black, like the rest of the site.
export function Hero({ semesterLabel }: { semesterLabel: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-black">
      <picture>
        <source media="(max-width: 767px)" srcSet="/hero/day-mobile.webp" type="image/webp" />
        <img
          src="/hero/day-desktop.webp"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 -z-10 size-full object-cover object-[center_40%] dark:hidden"
        />
      </picture>
      {/* Soft fade so white text stays readable on the bright sky. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/45 via-slate-900/15 to-transparent dark:hidden" aria-hidden />

      <div className="mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-start px-4 pt-16 pb-24 sm:min-h-[72vh] sm:pt-24">
        <p className="text-sm font-medium text-white/90 [text-shadow:0_1px_2px_rgb(0_0_0/0.4)]">{semesterLabel}</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.35)] sm:text-5xl">
          What CSE students did this semester
        </h1>
        <p className="mt-3 max-w-xl text-lg text-white/90 [text-shadow:0_1px_6px_rgb(0_0_0/0.4)]">
          Wins and events from our class, posted by students and checked by faculty.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/achievements" className={buttonVariants({ size: "lg" })}>
            Explore achievements
          </Link>
          <Link href="/submit" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-white/60 bg-white/90 text-stone-900 hover:bg-white hover:text-stone-900 dark:border-white/30 dark:bg-transparent dark:text-white dark:hover:bg-white/10 dark:hover:text-white")}>
            Add your achievement
          </Link>
          <Link
            href="/achievements?period=past"
            className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "text-white hover:bg-white/15 hover:text-white")}
          >
            <History aria-hidden /> Past achievements
          </Link>
        </div>
      </div>
    </section>
  );
}
