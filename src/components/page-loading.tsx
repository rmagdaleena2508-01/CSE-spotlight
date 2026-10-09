import { ViewTransition } from "react";

// Shown while a page's data loads (each route's loading.tsx renders this), so a tap on a
// slow phone connection gets an answer straight away instead of a frozen screen.
// Grey blocks in the rough shape of a page: a title, a line of text, then cards.
// When the real page arrives, the blocks fade out instead of vanishing.
export function PageLoading({ label = "Loading" }: { label?: string }) {
  return (
    <ViewTransition exit="skeleton-out" default="none">
      <div
        role="status"
        aria-live="polite"
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
      >
        <span className="sr-only">{label}…</span>
        <div aria-hidden className="motion-safe:animate-pulse">
          <div className="h-8 w-2/3 max-w-xs rounded-lg bg-white/10" />
          <div className="mt-3 h-4 w-5/6 max-w-md rounded bg-white/[0.07]" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
              >
                <div className="aspect-[4/3] bg-white/[0.06]" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-white/10" />
                  <div className="h-3 w-1/2 rounded bg-white/[0.07]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ViewTransition>
  );
}
