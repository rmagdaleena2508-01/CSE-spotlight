"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
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

export function HeroSticker({
  src,
  width,
  height,
  href,
  label,
  className,
  rotate,
  delay,
}: {
  src: string;
  width: number;
  height: number;
  href: string;
  label: string;
  /** Position and size inside the sticker box. */
  className: string;
  /** Resting tilt in degrees. */
  rotate: number;
  /** Entrance start time in seconds (CSI's --d). */
  delay: number;
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
    <div
      className={cn("intro-float absolute", className, !interactive && "pointer-events-none")}
      style={{ "--d": `${delay}s` } as CSSProperties}
    >
      {interactive ? (
        <motion.div style={{ rotate }} className="[perspective:900px]">
          <Link
            href={href}
            aria-label={label}
            className="group block rounded-[24px] outline-none focus-visible:ring-3 focus-visible:ring-black/40 focus-visible:ring-offset-4"
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
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
        <div style={{ rotate: `${rotate}deg` }} aria-hidden>
          {art}
        </div>
      )}
    </div>
  );
}
