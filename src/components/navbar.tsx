"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight, LogOut, Menu, X } from "lucide-react";
import { logout } from "@/app/login/actions";
import { CollegeCard } from "@/components/college-card";
import { cn } from "@/lib/utils";

// Navigation built the same way as the CSI Student Chapter site
// (csi-vdp/components/layout/Navbar.tsx): three floating liquid-glass pieces
// over a transparent header, glass that thickens once the page scrolls, and a
// mobile menu that unfolds like a strip of folded paper.

export type NavViewer = { kind: "student" | "faculty"; name: string } | null;

type Item = { href: string; label: string };

function itemsFor(viewer: NavViewer): Item[] {
  const base: Item[] = [
    { href: "/", label: "Home" },
    { href: "/achievements", label: "Achievements" },
  ];
  if (viewer?.kind === "student") return [...base, { href: "/dashboard", label: "My posts" }];
  if (viewer?.kind === "faculty")
    return [
      ...base,
      { href: "/faculty/review", label: "Review" },
      { href: "/faculty/report", label: "Report" },
      { href: "/faculty/roster", label: "Class list" },
    ];
  return base;
}

/** Seconds between one row unfolding and the next. */
const FOLD_STAGGER = 0.065;
/** Seconds for the folded rows to close back up, bottom row first. */
const CLOSE_STAGGER = 0.04;

// The glass sheet hangs from its top edge, tipped back a little, and falls
// forward to flat while its lower edge travels down with the rows. The lower
// edge is a CSS variable inside the clip-path, because Motion tweens a single
// percentage smoothly where it would snap between two clip-path strings.
function sheetVariants(rows: number): Variants {
  const close = rows * CLOSE_STAGGER + 0.2;
  return {
    folded: {
      "--sheet-edge": "100%",
      rotateX: -28,
      opacity: 0,
      transition: {
        "--sheet-edge": { duration: close, ease: [0.55, 0, 0.45, 1] },
        rotateX: { duration: close, ease: [0.55, 0, 0.45, 1] },
        opacity: { duration: 0.14, delay: close - 0.14, ease: "linear" },
        staggerChildren: CLOSE_STAGGER,
        staggerDirection: -1,
      },
    },
    open: {
      "--sheet-edge": "0%",
      rotateX: 0,
      opacity: 1,
      transition: {
        "--sheet-edge": { duration: rows * FOLD_STAGGER + 0.26, ease: [0.25, 0.8, 0.3, 1] },
        rotateX: { type: "spring", stiffness: 170, damping: 20, mass: 0.9 },
        opacity: { duration: 0.1, ease: "linear" },
        staggerChildren: FOLD_STAGGER,
        delayChildren: 0.03,
      },
    },
  };
}

const fold: Variants = {
  folded: { rotateX: -90, opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
  open: {
    rotateX: 0,
    opacity: 1,
    // A touch under-damped, so each row lands like paper flopping flat.
    transition: {
      rotateX: { type: "spring", stiffness: 240, damping: 17, mass: 0.8 },
      opacity: { duration: 0.12 },
    },
  },
};

const crease: Variants = {
  folded: { opacity: 1 },
  open: { opacity: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/** One panel of the folded strip, hinged on its top edge. */
function Fold({ index, reduced, children }: { index: number; reduced: boolean | null; children: ReactNode }) {
  if (reduced) return <div>{children}</div>;
  // Zigzag lighting: a fold tipping away is in shadow, the next one catches light.
  const shade =
    index % 2 === 0
      ? "linear-gradient(180deg, rgba(10,10,12,0.28), rgba(10,10,12,0.05))"
      : "linear-gradient(0deg, rgba(255,255,255,0.75), rgba(255,255,255,0))";
  return (
    <motion.div variants={fold} className="relative" style={{ transformOrigin: "50% 0%", transformPerspective: 700 }}>
      {children}
      <motion.span
        aria-hidden
        variants={crease}
        className="pointer-events-none absolute inset-0 rounded-[14px]"
        style={{ background: shade }}
      />
    </motion.div>
  );
}

const GLASS = "glass backdrop-blur-2xl backdrop-saturate-150";

export function Navbar({ viewer }: { viewer: NavViewer }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [collegeOpen, setCollegeOpen] = useState(false);
  const sealRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const items = itemsFor(viewer);
  const rows = items.length + 1;

  // One passive listener; state is only written when the page crosses the 24px line,
  // so scrolling does not re-render the navbar on every event.
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24;
      setScrolled((prev) => (next === prev ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the menu; without motion there is no landing to wait for, so lock scroll now.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    if (reduced) document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, reduced]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const cta =
    viewer?.kind === "student"
      ? { href: "/submit", label: "Add a win" }
      : viewer
        ? null
        : { href: "/login", label: "Log in" };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="intro-drop mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-3 py-4 sm:px-6 sm:py-5">
        {/* Wordmark. The whole pill (seal and name) is one button that opens the college
            card, which grows out of the pill like a macOS window. Home stays in the nav. */}
        <button
          type="button"
          onClick={() => setCollegeOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={collegeOpen}
          aria-label="About SRMIST Vadapalani"
          className={cn(
            GLASS,
            "group flex items-center gap-2.5 rounded-full p-1.5 text-left transition-[scale,background-color,border-color,box-shadow] duration-500 ease-[var(--ease-editorial)] hover:scale-[1.02] active:scale-[0.985] active:duration-200 sm:pr-4 motion-reduce:hover:scale-100",
            scrolled && "glass-solid",
          )}
        >
          {/* The card zooms out of this seal (not the whole pill), as on the CSI site: starting
              from a small target gives the macOS window its full, unhurried travel. */}
          <span ref={sealRef} className="grid size-9 place-items-center rounded-full bg-white/90 ring-1 ring-black/8">
            <Image src="/brand/srmist-seal.png" alt="" width={244} height={238} priority className="size-7 object-contain" />
          </span>
          <span className="hidden text-[0.9375rem] leading-tight font-medium tracking-[-0.02em] text-[#0b0a0a] sm:block">
            CSE Spotlight
            <span className="block text-[0.6875rem] font-normal tracking-[0.08em] text-black/55 uppercase">
              SRMIST Vadapalani
            </span>
          </span>
        </button>

        {/* Desktop pill navigation */}
        <nav
          aria-label="Primary"
          className={cn(GLASS, "hidden items-center gap-1 rounded-full p-1 lg:flex", scrolled && "glass-solid")}
        >
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-[0.875rem] tracking-[-0.01em] transition-colors duration-300",
                  active ? "bg-[#0b0a0a] text-[#fcf9f4]" : "text-black/75 hover:bg-black/6 hover:text-black",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action + mobile trigger */}
        <div className="flex items-center gap-1.5">
          {viewer && (
            <form action={logout} className="hidden lg:block">
              <button
                type="submit"
                className={cn(
                  GLASS,
                  "inline-flex h-11 items-center gap-2 rounded-full px-4 text-[0.875rem] tracking-[-0.01em] text-[#0b0a0a]",
                  scrolled && "glass-solid",
                )}
              >
                <LogOut className="size-4" strokeWidth={1.7} aria-hidden /> Log out
              </button>
            </form>
          )}
          {cta && (
            <Link
              href={cta.href}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0b0a0a] px-4 text-[0.875rem] font-medium tracking-[-0.01em] whitespace-nowrap text-[#fcf9f4] ring-1 ring-white/25 shadow-[0_1px_2px_rgb(10_10_12/0.06),0_8px_24px_-12px_rgb(10_10_12/0.5)] transition-colors duration-300 hover:bg-black/80 sm:px-5"
            >
              {cta.label}
              <ArrowRight className="hidden size-4 sm:block" strokeWidth={1.7} aria-hidden />
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              GLASS,
              "glass-orb grid size-11 place-items-center rounded-full text-[#0b0a0a] transition-[scale,background-color,border-color,box-shadow] duration-500 ease-[var(--ease-editorial)] active:scale-95 active:duration-200 lg:hidden",
              scrolled && "glass-solid",
            )}
          >
            {open ? <X size={19} strokeWidth={1.6} aria-hidden /> : <Menu size={19} strokeWidth={1.6} aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile panel: unfolds like a folded paper strip, one row after another. */}
      <AnimatePresence>
        {open ? (
          <div id="mobile-nav" className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:hidden">
            <motion.nav
              aria-label="Primary mobile"
              className="glass-panel mt-1 flex flex-col rounded-[2rem] p-3 backdrop-blur-3xl backdrop-saturate-[180%]"
              style={
                reduced
                  ? undefined
                  : ({
                      clipPath: "inset(-1px -1px var(--sheet-edge) -1px round 2rem)",
                      transformOrigin: "50% 0%",
                      transformPerspective: 900,
                    } as React.CSSProperties)
              }
              variants={reduced ? undefined : sheetVariants(rows)}
              // Lock scroll once the sheet has landed; locking on the tap makes the opening lurch.
              onAnimationComplete={(definition) => {
                if (definition === "open") document.documentElement.style.overflow = "hidden";
              }}
              initial={reduced ? false : "folded"}
              animate="open"
              exit={reduced ? undefined : "folded"}
            >
              {items.map((item, i) => (
                <Fold key={item.href} index={i} reduced={reduced}>
                  <Link
                    href={item.href}
                    // Close after the click finishes, so the navigation is not dropped.
                    onClick={() => requestAnimationFrame(() => setOpen(false))}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "block rounded-[14px] px-4 py-3.5 text-xl tracking-[-0.02em] transition-colors",
                      isActive(item.href) ? "bg-[#0b0a0a] text-[#fcf9f4]" : "text-[#0b0a0a] hover:bg-white/45",
                    )}
                  >
                    {item.label}
                  </Link>
                </Fold>
              ))}
              <Fold index={items.length} reduced={reduced}>
                <div className="mt-2 flex gap-2 border-t border-white/50 pt-3">
                  {viewer ? (
                    <form action={logout} className="flex-1">
                      <button
                        type="submit"
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-white/45 px-4 text-[0.9375rem] text-[#0b0a0a] ring-1 ring-white/60 transition-colors hover:bg-white/70"
                      >
                        <LogOut size={16} strokeWidth={1.6} aria-hidden /> Log out
                      </button>
                    </form>
                  ) : (
                    <Link
                      href="/login?as=faculty"
                      onClick={() => requestAnimationFrame(() => setOpen(false))}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-white/45 px-4 text-[0.9375rem] text-[#0b0a0a] ring-1 ring-white/60 transition-colors hover:bg-white/70"
                    >
                      Faculty log in
                    </Link>
                  )}
                </div>
              </Fold>
            </motion.nav>
          </div>
        ) : null}
      </AnimatePresence>
      <CollegeCard open={collegeOpen} onClose={() => setCollegeOpen(false)} origin={sealRef} />
    </header>
  );
}
