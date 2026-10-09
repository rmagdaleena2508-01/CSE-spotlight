"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Ported from the CSI Student Chapter site (csi-vdp/components/layout/CollegeCard.tsx).
// The college seal in the navigation opens this card. It grows out of the seal with a
// macOS-style zoom, and closing it breaks the card into pixels that sweep away
// diagonally, starting at the top-left corner (after React Bits' Pixel Transition).

const COLLEGE_URL = "https://srmistvdp.edu.in/";

/** Columns in the dissolve grid; rows follow from the card's shape. */
const COLS = 12;
/** Seconds for the pixel front to sweep from the top-left corner to the bottom-right.
 *  The whole close takes about 1.2s: a little slower than the CSI original, so it reads calmly. */
const SWEEP = 0.63;
/** Longest random delay added to a single pixel, so rows break up unevenly. */
const JITTER = 0.09;
/** How long a pixel stays solid before it starts to fade. */
const HOLD = 0.1;
const FADE = 0.29;
const TOTAL_MS = (SWEEP + JITTER * 2 + HOLD + FADE) * 1000;

type Pixel = { row: number; col: number; tint: boolean; jitterIn: number; jitterOut: number };

export function CollegeCard({
  open,
  onClose,
  origin,
}: {
  open: boolean;
  onClose: () => void;
  /** The seal button the card grows out of. */
  origin?: React.RefObject<HTMLElement | null>;
}) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  // Set when a close starts; the grid it holds is what the dissolve draws.
  const [grid, setGrid] = useState<{ rows: number; pixels: Pixel[] } | null>(null);
  const dissolving = grid !== null;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const requestClose = useCallback(() => {
    if (reduced) {
      onClose();
      return;
    }
    if (timer.current) return;
    const box = cardRef.current?.getBoundingClientRect();
    const rows = box ? Math.max(1, Math.round(box.height / (box.width / COLS))) : 14;
    // Random values are drawn once, here, so a re-render mid-dissolve does not reshuffle the pixels.
    const pixels: Pixel[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < COLS; col++) {
        pixels.push({
          row,
          col,
          tint: Math.random() < 0.14,
          jitterIn: Math.random() * JITTER,
          jitterOut: Math.random() * JITTER,
        });
      }
    }
    setGrid({ rows, pixels });
    timer.current = window.setTimeout(() => {
      timer.current = 0;
      // One render: the dialog unmounts in the same frame the grid clears, so the card never flashes back.
      onClose();
      setGrid(null);
    }, TOTAL_MS);
  }, [reduced, onClose]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && requestClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, requestClose]);

  // The scroll lock is released once the exit has finished, not when close is clicked.
  useEffect(
    () => () => {
      document.documentElement.style.overflow = "";
    },
    [],
  );

  const ease = [0.32, 0.72, 0, 1] as const;
  // Closing uses an in-out curve so the page eases back into focus instead of snapping.
  const exitEase = [0.45, 0, 0.2, 1] as const;

  // Where the card starts: shrunk onto the seal, measured at the moment of the click.
  // Only transform and opacity animate, so the first frame is drawn straight away.
  const from = (() => {
    const el = origin?.current;
    if (!el || typeof window === "undefined") return { x: 0, y: 0, scale: 0.9 };
    const r = el.getBoundingClientRect();
    const cardWidth = Math.min(384, window.innerWidth - 40);
    return {
      x: r.left + r.width / 2 - window.innerWidth / 2,
      y: r.top + r.height / 2 - window.innerHeight / 2,
      scale: Math.max(0.08, r.width / cardWidth),
    };
  })();

  // A critically damped spring: leaves the seal small and faint, grows as it travels, settles without bounce.
  const cardMotion = reduced
    ? {}
    : {
        initial: { opacity: 0, ...from },
        animate: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: {
            type: "spring" as const,
            stiffness: 420,
            damping: 40,
            mass: 0.9,
            opacity: { duration: 0.12, ease: "linear" as const },
          },
        },
        exit: { opacity: 0, transition: { duration: 0 } },
      };

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.overflow = "";
      }}
    >
      {open ? (
        <div className="fixed inset-0 z-[100] grid place-items-center px-5">
          {/* The blur never animates (that repaints the whole page each frame); only the layer's opacity moves. */}
          <motion.div
            className="absolute inset-0 bg-[rgba(11,10,10,0.45)] backdrop-blur-[8px]"
            onClick={requestClose}
            aria-hidden
            initial={reduced ? undefined : { opacity: 0 }}
            animate={
              reduced
                ? undefined
                : dissolving
                  ? { opacity: 0, transition: { duration: TOTAL_MS / 1000 - 0.15, delay: 0.15, ease: exitEase } }
                  : { opacity: 1, transition: { duration: 0.28, ease } }
            }
            exit={reduced ? undefined : { opacity: 0, transition: { duration: 0 } }}
          />

          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-label="SRMIST Vadapalani"
            className="relative w-full max-w-sm will-change-transform"
            {...cardMotion}
            // Lock the page once the card has arrived, not on the click, so the first frame is not dropped.
            onAnimationComplete={() => {
              if (open && !dissolving) document.documentElement.style.overflow = "hidden";
            }}
          >
            {/* The shadow sits on its own layer: the clip that eats the card would cut a box-shadow off. */}
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-[2rem] shadow-[0_44px_90px_-34px_rgba(10,10,12,0.7),0_0_0_1px_rgba(10,10,12,0.14)]"
              animate={{ opacity: dissolving ? 0 : 1 }}
              transition={{ duration: SWEEP + JITTER, ease: "linear" }}
            />

            <motion.div
              className="relative rounded-[2rem] p-[5px]"
              initial={{ "--wipe": "-15%" } as Record<string, string>}
              // A diagonal mask wipes the card away from the top-left corner, trailing the
              // arriving pixels by the jitter so content is only cut once squares cover it.
              // Motion tweens one CSS variable (a single percentage) smoothly.
              animate={{ "--wipe": dissolving ? "115%" : "-15%" } as Record<string, string>}
              transition={dissolving ? { duration: SWEEP, delay: JITTER, ease: "linear" } : { duration: 0 }}
              style={{
                maskImage: "linear-gradient(135deg, transparent var(--wipe), black calc(var(--wipe) + 12%))",
                WebkitMaskImage: "linear-gradient(135deg, transparent var(--wipe), black calc(var(--wipe) + 12%))",
                // Brushed-metal rim: a conic sweep so light appears to travel around the edge.
                background:
                  "conic-gradient(from 210deg at 50% 50%, #f8fbff 0deg, #2b52a8 38deg, #d8e9fa 76deg, #12265c 128deg, #9fd0f5 172deg, #1b3a86 218deg, #eaf4ff 262deg, #2b52a8 308deg, #f8fbff 360deg)",
              }}
            >
              <div className="relative overflow-hidden rounded-[calc(2rem-5px)] bg-[#fcf9f4] px-8 pt-10 pb-9 ring-1 ring-white/70">
                {/* Specular sheen across the top of the card face. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/85 to-transparent"
                />

                <button
                  ref={closeRef}
                  type="button"
                  onClick={requestClose}
                  aria-label="Close"
                  className="absolute top-4 right-4 z-10 grid size-8 place-items-center rounded-full bg-black/6 text-black/70 transition-colors duration-300 hover:bg-black/12 hover:text-black"
                >
                  <X size={16} strokeWidth={1.8} aria-hidden />
                </button>

                <div className="relative flex flex-col items-center gap-7 text-center">
                  <Image
                    src="/brand/srmist-seal.png"
                    alt="SRM Institute of Science and Technology"
                    width={244}
                    height={238}
                    className="size-28 object-contain drop-shadow-[0_10px_24px_rgba(10,10,12,0.22)]"
                  />
                  <a
                    href={COLLEGE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-[1.0625rem] tracking-[-0.015em] text-[#0b0a0a]"
                  >
                    <span className="underline decoration-black/25 underline-offset-4 transition-colors group-hover:decoration-black">
                      Visit our College site
                    </span>
                    <ArrowUpRight
                      size={18}
                      strokeWidth={1.7}
                      aria-hidden
                      className="transition-transform duration-300 ease-[var(--ease-editorial)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </div>
              </div>
            </motion.div>

            {grid ? (
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
                {grid.pixels.map((p) => {
                  // Distance from the top-left corner (0 at that corner, 1 at the bottom-right),
                  // so the pixels arrive in a diagonal front.
                  const corner = (p.row / Math.max(1, grid.rows - 1) + p.col / (COLS - 1)) / 2;
                  const arrive = corner * SWEEP + p.jitterIn;
                  return (
                    <motion.span
                      key={`${p.row}-${p.col}`}
                      className={`absolute ${p.tint ? "bg-sky-100" : "bg-[#fcf9f4]"}`}
                      style={{
                        left: `${(p.col / COLS) * 100}%`,
                        top: `${(p.row / grid.rows) * 100}%`,
                        // A hair of overlap hides seams between squares.
                        width: `calc(${100 / COLS}% + 1px)`,
                        height: `calc(${100 / grid.rows}% + 1px)`,
                      }}
                      initial={{ opacity: 0, y: 0, scale: 1 }}
                      animate={{ opacity: [0, 1, 1, 0], y: [0, 0, 0, 10], scale: [1, 1, 1, 0.55] }}
                      transition={{
                        delay: arrive,
                        duration: HOLD + JITTER + FADE,
                        times: [0, 0.01, (HOLD + p.jitterOut) / (HOLD + JITTER + FADE), 1],
                        ease: "easeIn",
                      }}
                    />
                  );
                })}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
