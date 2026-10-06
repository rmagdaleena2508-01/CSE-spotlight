import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel, formatDate, resultLabel } from "@/lib/labels";

// Day 1 placeholder. Day 2 replaces this with the four category shelves.
export default async function Home() {
  const supabase = await createClient();
  const { data: latest } = await supabase
    .from("published_achievements")
    .select("id, student_name, event_name, event_date, category, result_type, rank, award_title, is_verified")
    .order("event_date", { ascending: false })
    .order("id")
    .limit(12);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">What CSE students did this term</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Wins and events from our class, posted by students and checked by faculty.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/submit" className={buttonVariants({ size: "lg" })}>Add your achievement</Link>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Latest</h2>
      {!latest?.length ? (
        <p className="mt-3 text-muted-foreground">Nothing posted yet. Be the first to add one.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((a) => (
            <li key={a.id} className="rounded-xl border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {categoryLabel(a.category)} · {formatDate(a.event_date)}
              </p>
              <p className="mt-1 font-medium">{a.event_name}</p>
              <p className="text-sm text-muted-foreground">{a.student_name}</p>
              <p className="mt-2 text-sm">
                {resultLabel(a)}
                {a.is_verified && <span className="ml-2 text-primary">✓ Faculty verified</span>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
