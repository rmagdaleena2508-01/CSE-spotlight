import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Footer: an illustrated park and city skyline under an open blue sky, laid over the
// page's grid. The top of the picture melts into the grid, so the page flows into the
// sky; the links are written straight onto the sky, and the park fills the bottom.
// Each link draws a line under itself on hover, on keyboard focus and on a tap on phones.

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/spotlight", label: "Student Spotlight" },
      { href: "/achievements", label: "All achievements" },
    ],
  },
  {
    title: "Students",
    links: [
      { href: "/submit", label: "Add your win" },
      { href: "/dashboard", label: "My posts" },
      { href: "/login", label: "Log in or sign up" },
    ],
  },
  {
    title: "College",
    links: [
      { href: "https://srmistvdp.edu.in/", label: "SRMIST Vadapalani", external: true },
      { href: "/login?as=faculty", label: "Faculty log in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative isolate mt-16 overflow-hidden text-white">
      {/* The picture. Its top fades out so the grid above shows through into the sky. */}
      <div className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_22%)]" aria-hidden>
        <Image
          src="/footer/park.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[50%_78%]"
        />
        {/* A little extra blue behind the text keeps it easy to read. */}
        <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-sky-700/10 via-sky-700/25 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[46rem] max-w-6xl flex-col px-4 pt-40 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:min-h-[52rem] sm:pt-48 lg:min-h-[58rem]">
        <div className="[text-shadow:0_1px_12px_rgb(0_40_90/0.35)]">
          <div className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-[1.4fr_repeat(3,1fr)] md:gap-8">
            <div className="col-span-2 md:col-span-1">
              <p className="font-[family-name:var(--font-headline)] text-3xl leading-tight sm:text-4xl">CSE Spotlight</p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/85">
                Wins and events from the Dept. Of Computer Science &amp; Engineering, SRMIST VDP. Posted by students,
                checked by faculty.
              </p>
            </div>
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="text-xs font-semibold tracking-[0.14em] text-white/70 uppercase">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      {"external" in l && l.external ? (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline-grow inline-flex items-center gap-1 text-[15px] font-medium"
                        >
                          {l.label} <ArrowUpRight className="size-4" aria-hidden />
                        </a>
                      ) : (
                        <Link href={l.href} className="underline-grow inline-block text-[15px] font-medium">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center justify-between gap-1 border-t border-white/40 pt-4 text-center text-xs text-white [text-shadow:0_1px_8px_rgb(0_0_0/0.45)] sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Dept. Of Computer Science &amp; Engineering, SRMIST VDP</p>
          <p>Made by students, for students.</p>
        </div>
      </div>
    </footer>
  );
}
