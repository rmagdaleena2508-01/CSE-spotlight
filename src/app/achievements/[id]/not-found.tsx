import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">This achievement is not available</h1>
      <p className="mt-2 text-muted-foreground">It may have been taken down, or the link is wrong.</p>
      <Link href="/achievements" className={buttonVariants({ className: "mt-6" })}>
        Browse achievements
      </Link>
    </main>
  );
}
