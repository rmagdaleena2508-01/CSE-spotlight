import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { categoryLabel, formatDate, resultLabel } from "@/lib/labels";
import { CATEGORIES } from "@/lib/schemas";
import { requireFaculty } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Review posts · CSE Spotlight" };

const TABS = [
  { value: "live", label: "Waiting" },
  { value: "verified", label: "Verified" },
  { value: "removed", label: "Removed" },
] as const;

export default async function ReviewPage({ searchParams }: PageProps<"/faculty/review">) {
  await requireFaculty();
  const sp = await searchParams;
  const status = TABS.some((t) => t.value === sp.status) ? (sp.status as string) : "live";
  const category = CATEGORIES.some((c) => c.value === sp.category) ? (sp.category as string) : "";

  const supabase = await createClient();
  let query = supabase
    .from("achievements")
    .select("id, roll_no, student_name, event_name, event_date, category, result_type, rank, award_title, certificate_paths, photo_paths, created_at")
    .eq("status", status)
    .order("created_at", { ascending: status !== "live" ? false : true })
    .limit(200);
  if (category) query = query.eq("category", category);
  const { data: posts } = await query;

  const counts = await Promise.all(
    TABS.map(async (t) => {
      const { count } = await supabase.from("achievements").select("id", { count: "exact", head: true }).eq("status", t.value);
      return count ?? 0;
    }),
  );

  const link = (next: { status?: string; category?: string }) => {
    const p = new URLSearchParams();
    const s = next.status ?? status;
    const c = next.category ?? category;
    if (s !== "live") p.set("status", s);
    if (c) p.set("category", c);
    const q = p.toString();
    return `/faculty/review${q ? `?${q}` : ""}`;
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Review posts</h1>
      <p className="mt-2 text-muted-foreground">
        Posts are live as soon as students add them. Check the proof, then verify or remove.
      </p>

      <nav aria-label="Post status" className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <Link
            key={t.value}
            href={link({ status: t.value })}
            aria-current={status === t.value ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              status === t.value ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
            )}
          >
            {t.label} ({counts[i]})
          </Link>
        ))}
      </nav>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <Link href={link({ category: "" })} className={cn("rounded-md px-2 py-1", !category ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}>
          All categories
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={link({ category: c.value })}
            className={cn("rounded-md px-2 py-1", category === c.value ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {!posts?.length ? (
        <p className="mt-6 rounded-xl border border-dashed bg-card p-8 text-center text-muted-foreground">
          {status === "live" ? "Nothing waiting. All caught up." : "No posts here."}
        </p>
      ) : (
        <ul className="mt-6 divide-y rounded-xl border bg-card">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/faculty/review/${p.id}`} className="flex flex-col gap-1 p-4 hover:bg-muted sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{p.event_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.student_name} · <span className="font-mono text-xs">{p.roll_no}</span>
                  </p>
                </div>
                <div className="text-sm text-muted-foreground sm:text-right">
                  <p>
                    {categoryLabel(p.category)} · {resultLabel(p)} · {formatDate(p.event_date)}
                  </p>
                  <p>
                    {p.certificate_paths.length} certificate{p.certificate_paths.length === 1 ? "" : "s"}, {p.photo_paths.length} photo
                    {p.photo_paths.length === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
