"use client";

import { useEffect, useRef } from "react";
import { useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";
import { HeroSticker } from "@/components/hero-sticker";

// The hero stickers travel along the orbit in an endless loop, left to right.
// - Invisible walls: the sticker box clips them at its left and right edges (see Hero),
//   and each one fades as it reaches a wall, so it slips behind the wall, then comes
//   back out of the left wall and climbs again.
// - They hold still for 1 second once the page has finished opening, then glide off,
//   easing up to speed instead of jerking.
// - Hovering any sticker (laptops) eases the whole loop to a stop; moving the mouse away
//   eases it back up, in the same direction.
// - People who reduce motion get the still layout.

export type OrbitSticker = {
  src: string;
  w: number;
  h: number;
  /** Width, in % of the sticker box. */
  size: number;
  href: string;
  label: string;
};

/** Seconds for one sticker to travel the whole loop. Slow enough to read as calm drift. */
const LOOP_SECONDS = 45;
/** Where the centres travel, in % of the box: wall to wall. A sticker fades out as its
 *  centre nears a wall, so it is gone by the time it wraps round, and the opening layout
 *  (centres at 10, 30, 50, 70 and 90) shows all five stickers whole. */
const START = 0;
const SPAN = 100;
/** Seconds of stillness after the page has opened, before the loop starts. */
const HOLD = 1;
/** How long the opening animation takes (the last sticker lands at about 2.4s). */
const ENTRANCE = 2.4;

export function StickerOrbit({ stickers }: { stickers: OrbitSticker[] }) {
  const reduced = useReducedMotion();
  // 0..1, how far round the loop the first sticker is. The rest follow at even gaps.
  const progress = useMotionValue(0);
  const speed = useRef(0);
  const running = useRef(false);
  const hovered = useRef(false);

  useEffect(() => {
    if (reduced) return;
    // A return visit skips the opening animation, so only the 1 second hold is left.
    const arrived = document.documentElement.dataset.arrived !== undefined;
    const t = window.setTimeout(() => (running.current = true), ((arrived ? 0 : ENTRANCE) + HOLD) * 1000);
    return () => window.clearTimeout(t);
  }, [reduced]);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    // A hidden tab pauses frames; clamp the gap so the loop does not leap on return.
    const dt = Math.min(delta, 50) / 1000;
    const target = running.current && !hovered.current ? 1 : 0;
    // Ease toward the target speed: stop in about a quarter second, start in about half.
    const ease = target === 0 ? 0.25 : 0.5;
    speed.current += (target - speed.current) * Math.min(1, dt / ease);
    if (speed.current < 0.0005 && target === 0) return;
    progress.set((progress.get() + (dt / LOOP_SECONDS) * speed.current) % 1);
  });

  return stickers.map((s, i) => (
    <HeroSticker
      key={s.src}
      src={s.src}
      width={s.w}
      height={s.h}
      href={s.href}
      label={s.label}
      size={s.size}
      progress={progress}
      // Even gaps, placed so the opening layout shows all five on the curve.
      phase={(i + 0.5) / stickers.length}
      start={START}
      span={SPAN}
      delay={1.15 + i * 0.08}
      onHoverChange={(on) => (hovered.current = on)}
    />
  ));
}
