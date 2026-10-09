"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Progressive blur at the top, behind the floating glass header: content softens more
// the closer it gets to the top edge.
// Built from stacked backdrop-blur layers, each masked to its own band, so the blur
// grows in steps (strongest at the top, none at the bottom edge).
// It only shows once the page has been scrolled; at the very top there is no blur.
const LAYERS = [
  { blur: "backdrop-blur-[1px]", mask: "[mask-image:linear-gradient(to_top,transparent_0%,black_12.5%,black_25%,transparent_37.5%)]" },
  { blur: "backdrop-blur-[2px]", mask: "[mask-image:linear-gradient(to_top,transparent_12.5%,black_25%,black_37.5%,transparent_50%)]" },
  { blur: "backdrop-blur-[4px]", mask: "[mask-image:linear-gradient(to_top,transparent_25%,black_37.5%,black_50%,transparent_62.5%)]" },
  { blur: "backdrop-blur-[8px]", mask: "[mask-image:linear-gradient(to_top,transparent_37.5%,black_50%,black_62.5%,transparent_75%)]" },
  { blur: "backdrop-blur-[16px]", mask: "[mask-image:linear-gradient(to_top,transparent_50%,black_62.5%,black_75%,transparent_87.5%)]" },
  { blur: "backdrop-blur-[32px]", mask: "[mask-image:linear-gradient(to_top,transparent_62.5%,black_75%,black_100%)]" },
];

export function ScrollBlur() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-40 h-24 [view-transition-name:scroll-blur] transition-opacity duration-200 sm:h-28",
        scrolled ? "opacity-100" : "opacity-0",
      )}
    >
      {LAYERS.map((l) => (
        <div key={l.blur} className={cn("absolute inset-0", l.blur, l.mask)} />
      ))}
    </div>
  );
}
