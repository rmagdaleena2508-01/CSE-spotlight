"use client";

import { useEffect, useRef } from "react";
import { useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";
import { HeroSticker } from "@/components/hero-sticker";

// The hero stickers travel along the orbit in an endless loop, left to right.
// - Invisible walls: the sticker box clips them at its left and right edges (see Hero).
//   A sticker slides fully behind the right wall, then comes back out of the left wall
//   and climbs again. No fading: the wall simply hides it.
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
/** Where the centres travel, in % of the box: from fully behind the left wall to fully
 *  behind the right one (the widest sticker is 20% wide), so the jump back to the start
 *  always happens out of sight. */
const START = -10.5;
const SPAN = 121;
/** Opening layout: centres at 10, 30, 50, 70 and 90, all five whole. The train then
 *  keeps those gaps, with one wider gap where it wraps round. */
const OPENING_GAP = 20;
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
    // Settle fully once nearly stopped, so a hovered sticker does not creep.
    if (target === 0 && speed.current < 0.02) {
      speed.current = 0;
      return;
    }
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
      phase={(OPENING_GAP / 2 + OPENING_GAP * i - START) / SPAN}
      start={START}
      span={SPAN}
      delay={1.15 + i * 0.08}
      onHoverChange={(on) => (hovered.current = on)}
    />
  ));
}
