import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { Hero } from "@/components/hero";
import { SpotlightMarquee } from "@/components/spotlight/spotlight-marquee";
import { loadSpotlight } from "@/lib/spotlight";

export default async function Home() {
  const { posts, cheers } = await loadSpotlight({ limit: 24 });
  const signedIn = cheers.signedIn;

  return (
    <>
      <Hero />
      <main className="pb-24 max-[899px]:pb-0">
        {/* On phones this section also fills a whole screen, centred, so it never starts
            half-way up the first screen or ends early into the footer. */}
        <section
          id="spotlight"
          aria-labelledby="spotlight-title"
          className="scroll-mt-28 pt-16 sm:pt-20 max-[899px]:flex max-[899px]:min-h-[100svh] max-[899px]:flex-col max-[899px]:justify-center max-[899px]:py-12"
        >
          <div className="mx-auto w-full max-w-6xl px-4 text-center">
            <h2 id="spotlight-title" className="text-4xl sm:text-5xl">
              Student Spotlight
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Fresh wins from our department, rolling by.{" "}
              <span className="[@media(hover:none)]:hidden">Point at a row to pause it.</span>
              <span className="[@media(hover:hover)]:hidden">Tap a card to open it.</span>
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="mx-auto mt-8 w-full max-w-[1392px] px-4">
              <SpotlightMarquee posts={posts} signedIn={signedIn} />
            </div>
          ) : (
            <p className="mx-auto mt-8 max-w-md px-4 text-center text-muted-foreground">
              No wins in the spotlight yet. Won something? Be the first to shine here.
            </p>
          )}

          <div className="mx-auto mt-8 flex w-full max-w-6xl flex-col items-center gap-3 px-4 text-center">
            {signedIn ? (
              <Link
                href="/spotlight"
                className="lift inline-flex h-12 items-center gap-2 rounded-full bg-[#0b0a0a] px-6 text-[15px] font-medium text-white"
              >
                Open Student Spotlight <ArrowRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Want the full story behind every win?</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/login?reason=more&next=%2Fspotlight"
                    className="lift inline-flex h-12 items-center gap-2 rounded-full bg-[#0b0a0a] px-6 text-[15px] font-medium text-white"
                  >
                    <LogIn className="size-4" aria-hidden /> Log in to see every post
                  </Link>
                  <Link
                    href="/login?reason=more&signup=1&next=%2Fspotlight"
                    className="lift inline-flex h-12 items-center rounded-full bg-white px-6 text-[15px] font-medium shadow-[inset_0_0_0_1px_rgb(0_0_0/0.18)]"
                  >
                    New here? Sign up
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
