import Link from "next/link";
import { logout } from "@/app/login/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { getViewer } from "@/lib/session";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const viewer = await getViewer();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link href="/" className="shrink-0 font-semibold tracking-tight whitespace-nowrap">
          CSE <span className="text-primary">Spotlight</span>
        </Link>
        <nav className="ml-auto flex min-w-0 items-center gap-0.5 text-sm">
          <Link href="/achievements" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>Achievements</Link>
          {viewer?.kind === "student" && (
            <>
              <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>My posts</Link>
              <Link href="/submit" className={buttonVariants({ size: "sm" })}>Add a win</Link>
            </>
          )}
          {viewer?.kind === "faculty" && (
            <>
              <Link href="/faculty/review" className={buttonVariants({ variant: "ghost", size: "sm" })}>Review</Link>
              <Link href="/faculty/report" className={buttonVariants({ variant: "ghost", size: "sm" })}>Report</Link>
              <Link href="/faculty/roster" className={buttonVariants({ variant: "ghost", size: "sm" })}>Class list</Link>
            </>
          )}
          {viewer ? (
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">Log out</Button>
            </form>
          ) : (
            <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
