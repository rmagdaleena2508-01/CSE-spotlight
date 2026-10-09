import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SpotlightCarousel } from "@/components/spotlight/spotlight-carousel";
import { CATEGORIES } from "@/lib/schemas";
import { loadSpotlight } from "@/lib/spotlight";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Student Spotlight · CSE Spotlight",
  description: "Wins from the Dept. Of Computer Science & Engineering, SRMIST VDP. Celebrate them.",
};

// The Spotlight page has its own navigation: a bar of category links that stays at the
// top while you scroll. "All" shows one row per category; a category shows a longer row.
export default async function SpotlightPage({ searchParams }: PageProps<"/spotlight">) {
  const { category: raw } = await searchParams;
  const category = CATEGORIES.find((c) => c.value === raw)?.value;

  const rows = category
    ? [{ value: category, label: CATEGORIES.find((c) => c.value === category)!.label, ...(await loadSpotlight({ category, limit: 40 })) }]
    : await Promise.all(CATEGORIES.map(async (c) => ({ ...c, ...(await loadSpotlight({ category: c.value, limit: 12 })) })));

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <header className="pt-8 sm:pt-12">
        <h1 className="text-4xl sm:text-6xl">Student Spotlight</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Every win from our department, sorted by category. Swipe through, tap a card for the story, and celebrate the
          ones that inspire you.
        </p>
      </header>

      <nav
        aria-label="Spotlight categories"
        className="sticky top-[76px] z-30 -mx-4 mt-6 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:top-[84px]"
      >
        <ul className="flex w-max gap-2 rounded-full bg-white/80 p-1.5 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_10px_30px_-18px_rgb(0_0_0/0.4)] backdrop-blur-xl">
          {[{ value: "", label: "All" }, ...CATEGORIES].map((c) => {
            const active = (category ?? "") === c.value;
            return (
              <li key={c.value || "all"}>
                <Link
                  href={c.value ? `/spotlight?category=${c.value}` : "/spotlight"}
                  aria-current={active ? "page" : undefined}
                  scroll={false}
                  className={cn(
                    "lift inline-flex h-9 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap",
                    active ? "bg-[#0b0a0a] text-white" : "text-foreground/75 hover:bg-black/5 hover:text-foreground",
                  )}
                >
                  {c.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {rows.map((row) => (
        <section key={row.value} aria-labelledby={`row-${row.value}`} className="mt-10 sm:mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id={`row-${row.value}`} className="text-3xl sm:text-4xl">
              {row.label}
            </h2>
            <Link
              href={`/achievements?category=${row.value}`}
              className="inline-flex items-center gap-1 text-sm font-medium underline decoration-black/25 underline-offset-4 hover:decoration-black"
            >
              Every {row.label.toLowerCase()} post <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <SpotlightCarousel posts={row.posts} cheers={row.cheers} showTabs={false} label={`${row.label} wins`} />
        </section>
      ))}
    </main>
  );
}
