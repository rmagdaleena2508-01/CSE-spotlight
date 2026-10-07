import type { Metadata } from "next";
import Link from "next/link";
import { AchievementCard } from "@/components/achievement-card";
import { buttonVariants } from "@/components/ui/button";
import { PAGE_SIZE, filtersToSearch, readFilters, safeSearchTerm } from "@/lib/filters";
import { PUBLIC_CARD_COLUMNS, type PublicCard } from "@/lib/published";
import { currentSemester } from "@/lib/semester";
import { createClient } from "@/lib/supabase/server";
import { FilterBar } from "./filter-bar";

export const metadata: Metadata = { title: "Achievements · CSE Spotlight" };

function lastDayOfMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`;
}

export default async function AchievementsPage({ searchParams }: PageProps<"/achievements">) {
  const f = readFilters(await searchParams);
  const semester = currentSemester();
  const supabase = await createClient();

  let query = supabase
    .from("published_achievements")
    .select(PUBLIC_CARD_COLUMNS, { count: "exact" })
    .order("event_date", { ascending: false })
    .order("id");

  if (f.period === "current") query = query.gte("event_date", semester.start);
  if (f.period === "past") query = query.lt("event_date", semester.start);
  if (f.category) query = query.eq("category", f.category);
  if (f.result) query = query.eq("result_type", f.result);
  if (f.level) query = query.eq("level", f.level);
  if (f.month) query = query.gte("event_date", `${f.month}-01`).lte("event_date", lastDayOfMonth(f.month));
  const term = safeSearchTerm(f.q);
  if (term) {
    const like = `%${term}%`;
    query = query.or(
      ["event_name", "organizer", "description", "student_name", "team_name"].map((c) => `${c}.ilike.${like}`).join(","),
    );
  }

  const from = (f.page - 1) * PAGE_SIZE;
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1).overrideTypes<PublicCard[], { merge: false }>();
  const posts = data ?? [];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = !!(f.q || f.category || f.result || f.level || f.month || f.period !== "all");

  const heading =
    f.period === "past" ? "Past achievements" : f.period === "current" ? `This semester (${semester.label})` : "All achievements";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
      {f.period === "past" && (
        <p className="mt-1 text-muted-foreground">Everything from before {semester.label}.</p>
      )}

      <FilterBar key={filtersToSearch({ ...f, q: "", page: 1 })} filters={f} />

      <p className="mt-6 text-sm text-muted-foreground" role="status" aria-live="polite">
        {total === 1 ? "1 achievement" : `${total} achievements`}
        {pages > 1 && ` · page ${Math.min(f.page, pages)} of ${pages}`}
      </p>

      {posts.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed bg-card p-8 text-center">
          {hasFilters ? (
            <>
              <p className="font-medium">Nothing matches these filters.</p>
              <Link href="/achievements" className={buttonVariants({ variant: "outline", className: "mt-3" })}>
                Clear filters
              </Link>
            </>
          ) : (
            <>
              <p className="font-medium">No achievements posted yet.</p>
              <Link href="/submit" className={buttonVariants({ className: "mt-3" })}>
                Add the first one
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((a) => (
            <li key={a.id}>
              <AchievementCard a={a} className="h-full" />
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="mt-8 flex items-center justify-center gap-2">
          {f.page > 1 ? (
            <Link href={`/achievements${filtersToSearch({ ...f, page: f.page - 1 })}`} className={buttonVariants({ variant: "outline" })}>
              Previous
            </Link>
          ) : (
            <span className={buttonVariants({ variant: "outline", className: "pointer-events-none opacity-50" })} aria-disabled>
              Previous
            </span>
          )}
          <span className="px-2 text-sm text-muted-foreground">
            {Math.min(f.page, pages)} / {pages}
          </span>
          {f.page < pages ? (
            <Link href={`/achievements${filtersToSearch({ ...f, page: f.page + 1 })}`} className={buttonVariants({ variant: "outline" })}>
              Next
            </Link>
          ) : (
            <span className={buttonVariants({ variant: "outline", className: "pointer-events-none opacity-50" })} aria-disabled>
              Next
            </span>
          )}
        </nav>
      )}
    </main>
  );
}
