import Link from "next/link";
import { logout } from "@/app/login/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { getViewer } from "@/lib/session";

export async function SiteHeader() {
  const viewer = await getViewer();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          CSE <span className="text-primary">Spotlight</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          {viewer?.kind === "student" && (
            <>
              <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>My posts</Link>
              <Link href="/submit" className={buttonVariants({ size: "sm" })}>Add a win</Link>
            </>
          )}
          {viewer?.kind === "faculty" && (
            <Link href="/faculty/roster" className={buttonVariants({ variant: "ghost", size: "sm" })}>Class list</Link>
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
