import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { categoryLabel, formatDate, resultLabel } from "@/lib/labels";
import { requireStudent } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My posts · CSE Spotlight" };

const STATUS = {
  live: { label: "Live, waiting for faculty", variant: "secondary" },
  verified: { label: "Faculty verified", variant: "default" },
  removed: { label: "Removed", variant: "destructive" },
} as const;

export default async function Dashboard({ searchParams }: PageProps<"/dashboard">) {
  const student = await requireStudent();
  const { posted } = await searchParams;
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("achievements")
    .select("id, event_name, event_date, category, result_type, rank, award_title, status, remove_reason")
    .eq("roll_no", student.rollNo)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Hi, {student.name}</h1>
      <p className="mt-1 text-muted-foreground">{student.rollNo}</p>

      {posted && (
        <p role="status" className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
          Posted. It is live now. Faculty will check it soon.
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold">My posts</h2>
        <Link href="/submit" className={buttonVariants()}>Add a win</Link>
      </div>

      {!posts?.length ? (
        <p className="mt-4 text-muted-foreground">You have not posted anything yet.</p>
      ) : (
        <ul className="mt-4 divide-y rounded-xl border bg-card">
          {posts.map((p) => {
            const s = STATUS[p.status as keyof typeof STATUS];
            return (
              <li key={p.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{p.event_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {categoryLabel(p.category)} · {resultLabel(p)} · {formatDate(p.event_date)}
                  </p>
                  {p.status === "removed" && p.remove_reason && (
                    <p className="mt-1 text-sm text-destructive">Reason: {p.remove_reason}</p>
                  )}
                </div>
                <Badge variant={s.variant}>{s.label}</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
