"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filtersToSearch, type Filters } from "@/lib/filters";
import { CATEGORIES, LEVELS } from "@/lib/schemas";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// Every change rewrites the page address, so the filtered view can be shared,
// refreshed or reached again with the Back button.
export function FilterBar({ filters }: { filters: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(filters.q);

  function apply(next: Partial<Filters>) {
    const url = `${pathname}${filtersToSearch({ ...filters, ...next, page: 1 })}`;
    startTransition(() => router.replace(url, { scroll: false }));
  }

  // Wait for a pause in typing before searching.
  useEffect(() => {
    if (q.trim() === filters.q) return;
    const t = setTimeout(() => apply({ q: q.trim() }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = filters.q || filters.category || filters.result || filters.level || filters.month || filters.period !== "all";

  return (
    <div className="mt-6 space-y-3 rounded-xl border bg-card p-4" aria-busy={pending}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          aria-label="Search achievements"
          placeholder="Search events, names, organizers…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-9 pl-9"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          When
          <select className={selectClass} value={filters.period} onChange={(e) => apply({ period: e.target.value as Filters["period"] })}>
            <option value="all">All time</option>
            <option value="current">This semester</option>
            <option value="past">Past semesters</option>
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Category
          <select className={selectClass} value={filters.category} onChange={(e) => apply({ category: e.target.value })}>
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Result
          <select className={selectClass} value={filters.result} onChange={(e) => apply({ result: e.target.value })}>
            <option value="">All</option>
            <option value="award">Won / award</option>
            <option value="participation">Took part</option>
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Level
          <select className={selectClass} value={filters.level} onChange={(e) => apply({ level: e.target.value })}>
            <option value="">All</option>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-muted-foreground">
          Month
          <Input type="month" className="h-9" value={filters.month} onChange={(e) => apply({ month: e.target.value })} />
        </label>
      </div>
      <div className="flex min-h-8 items-center justify-between">
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {pending ? "Updating…" : ""}
        </span>
        {active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
          >
            <X aria-hidden /> Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
