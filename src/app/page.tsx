import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { SpotlightCarousel } from "@/components/spotlight/spotlight-carousel";
import { loadSpotlight } from "@/lib/spotlight";

export default async function Home() {
  // The newest wins from every category; the tabs above the row sort them on the spot.
  const { posts, cheers } = await loadSpotlight({ limit: 24 });

  return (
    <>
      <Hero />
      <main className="mx-auto max-w-6xl px-4 pb-24">
        <section id="spotlight" aria-labelledby="spotlight-title" className="scroll-mt-28 pt-16 sm:pt-20">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <h2 id="spotlight-title" className="text-4xl sm:text-5xl">
                Student Spotlight
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Fresh wins from our department. Tap a card to read the story, then celebrate it.
              </p>
            </div>
            <Link
              href="/spotlight"
              className="lift inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium shadow-[inset_0_0_0_1px_rgb(0_0_0/0.14)]"
            >
              Open Spotlight <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-6">
            <SpotlightCarousel posts={posts} cheers={cheers} />
          </div>
        </section>
      </main>
    </>
  );
}
