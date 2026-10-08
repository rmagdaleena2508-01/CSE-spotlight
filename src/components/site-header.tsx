import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { logout } from "@/app/login/actions";
import { getViewer } from "@/lib/session";
import { cn } from "@/lib/utils";

// Campus Crew style: dark bar, plain white links, one white pill button on the right.
const link =
  "rounded-lg px-3 py-2 text-sm font-medium tracking-[-0.02em] text-white/90 transition-colors hover:bg-white/10 hover:text-white";
const pill =
  "inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium tracking-[-0.02em] text-[#080809] transition-colors hover:bg-white/85";

export async function SiteHeader() {
  const viewer = await getViewer();

  return (
    <header className="sticky top-0 z-50 bg-[#141419]">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-2 px-4 sm:px-6">
        <Link href="/" className="mr-4 shrink-0 text-lg font-bold tracking-[-0.02em] whitespace-nowrap text-white">
          CSE <span className="text-primary">Spotlight</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <Link href="/achievements" className={link}>Achievements</Link>
          <Link href="/achievements?period=past" className={link}>Past</Link>
          {viewer?.kind === "student" && <Link href="/dashboard" className={link}>My posts</Link>}
          {viewer?.kind === "faculty" && (
            <>
              <Link href="/faculty/review" className={link}>Review</Link>
              <Link href="/faculty/report" className={link}>Report</Link>
              <Link href="/faculty/roster" className={link}>Class list</Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {/* Small screens: the most useful links stay visible. */}
          <Link href="/achievements" className={cn(link, "md:hidden")}>Browse</Link>
          {viewer?.kind === "faculty" && <Link href="/faculty/review" className={cn(link, "md:hidden")}>Review</Link>}
          {viewer?.kind === "student" && <Link href="/dashboard" className={cn(link, "md:hidden")}>Mine</Link>}
          {viewer ? (
            <>
              <form action={logout}>
                <button type="submit" className={link}>Log out</button>
              </form>
              {viewer.kind === "student" && (
                <Link href="/submit" className={pill}>
                  Add a win <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
            </>
          ) : (
            <Link href="/login" className={pill}>
              Log in <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
