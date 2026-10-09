"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

// A hero sticker that lifts off the page on hover, following Motion's tilt-card pattern
// (motion.dev/ui/components/tilt-card):
// - the CSI entrance runs on an outer element, the tilt on an inner one, so the two
//   never fight over `transform`;
// - the tilt follows the pointer through motion values and springs (no React re-renders);
// - on hover it rises toward the viewer and grows, and a separate soft shadow underneath
//   spreads and darkens, which sells the "coming out of the screen" depth;
// - only transform and opacity animate, so it stays on the compositor.
// Stickers are links only on laptops (wide screen with a real hover pointer); on phones
// and tablets they stay plain decoration.
// Where the sticker sits comes from the shared loop progress (see StickerOrbit): its
// centre rides the dashed orbit, it tilts more as the curve climbs, and it fades as it
// reaches either wall.

const LAPTOP = "(min-width: 900px) and (hover: hover) and (pointer: fine)";

function useIsLaptop() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(LAPTOP);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(LAPTOP).matches,
    () => false,
  );
}

// Soft, well-damped springs: the sticker eases into place instead of snapping or wobbling.
const SPRING = { stiffness: 120, damping: 20, mass: 0.8 };
/** Largest tilt toward the pointer, in degrees. Small angles look polished. */
const MAX_TILT = 12;
/** Share of its own width a sticker slides into a wall before it has fully faded. */
const FADE = 0.35;

// The dashed orbit in the hero is the curve M 2 81 Q 55 80 98 30 in a 100x100 box.
// For a centre x, solve x(s) = 2 + 106s - 10s² for s, then y(s) = 81 - 2s - 49s².
// Past the ends the same parabola carries on, so stickers keep climbing behind the walls.
function orbitAt(x: number) {
  const s = (106 - Math.sqrt(106 * 106 + 40 * (2 - x))) / 20;
  const y = 81 - 2 * s - 49 * s * s;
  // The sticker sits a little lower on the steep part, so the line runs through its body.
  return { s, bottom: 100 - y - (3 + 11 * s * s * s) };
}

export function HeroSticker({
  src,
  width,
  height,
  href,
  label,
  size,
  progress,
  phase,
  start,
  span,
  delay,
  onHoverChange,
}: {
  src: string;
  width: number;
  height: number;
  href: string;
  label: string;
  /** Width, in % of the sticker box. */
  size: number;
  /** Shared loop position, 0..1. */
  progress: MotionValue<number>;
  /** This sticker's place in the loop, 0..1. */
  phase: number;
  /** Where centres start and how far they travel, in % of the box. */
  start: number;
  span: number;
  /** Entrance start time in seconds (CSI's --d). */
  delay: number;
  onHoverChange: (hovered: boolean) => void;
}) {
  const laptop = useIsLaptop();
  const reduced = useReducedMotion();
  const interactive = laptop && !reduced;

  // Pointer position over the sticker, -0.5..0.5 on each axis.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]), SPRING);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]), SPRING);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onPointerLeave = () => {
    px.set(0);
    py.set(0);
  };

  // Centre x along the loop, then everything else from it.
  const x = useTransform(progress, (p) => start + span * ((p + phase) % 1));
  const left = useTransform(x, (c) => `${c - size / 2}%`);
  const bottom = useTransform(x, (c) => `${orbitAt(c).bottom}%`);
  // Leans back on the flat start of the curve and forward as it climbs (-10° to 16°).
  const rotate = useTransform(x, (c) => -10 + ((c - 9.5) * 26) / 80);
  // Fades as it slides behind a wall: whole while it is clear of both walls, gone once
  // a third of it has passed one, so the wall's clean edge is never seen slicing it.
  const opacity = useTransform(x, (c) => {
    const past = Math.max(start - (c - size / 2), c + size / 2 - (start + span), 0);
    return Math.max(0, 1 - past / (size * FADE));
  });

  const art = (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      sizes="(min-width: 768px) 160px, 20vw"
      draggable={false}
      className="relative h-auto w-full drop-shadow-[0_6px_10px_rgb(0_0_0/0.14)] select-none"
    />
  );

  return (
    // The entrance animation owns this element's transform and opacity, so only its
    // position moves here; tilt and fade live on the layer inside.
    <motion.div
      className={cn("intro-float absolute", !interactive && "pointer-events-none")}
      style={{ "--d": `${delay}s`, width: `${size}%`, left, bottom } as unknown as CSSProperties}
    >
      {interactive ? (
        <motion.div style={{ rotate, opacity }} className="[perspective:900px]">
          <Link
            href={href}
            aria-label={label}
            className="group block rounded-[24px] outline-none focus-visible:ring-3 focus-visible:ring-black/40 focus-visible:ring-offset-4"
            onPointerMove={onPointerMove}
            onPointerEnter={() => onHoverChange(true)}
            onPointerLeave={() => {
              onPointerLeave();
              onHoverChange(false);
            }}
          >
            <motion.div
              className="relative [transform-style:preserve-3d]"
              style={{ rotateX, rotateY }}
              initial={false}
              whileHover={{ scale: 1.14, y: -14, z: 40 }}
              whileTap={{ scale: 1.06, y: -6 }}
              transition={{ type: "spring", stiffness: 140, damping: 22, mass: 0.9 }}
            >
              {/* Shadow on its own layer: it spreads and darkens as the sticker lifts. */}
              <span
                aria-hidden
                className="absolute inset-x-[12%] -bottom-[10%] h-[22%] rounded-[50%] bg-black/0 blur-md transition-all duration-500 ease-[var(--ease-editorial)] group-hover:-bottom-[18%] group-hover:bg-black/30 group-hover:blur-xl"
              />
              {art}
            </motion.div>
          </Link>
        </motion.div>
      ) : (
        <motion.div style={{ rotate, opacity }} aria-hidden>
          {art}
        </motion.div>
      )}
    </motion.div>
  );
}
