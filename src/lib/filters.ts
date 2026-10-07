import { CATEGORIES, LEVELS } from "@/lib/schemas";

export const PAGE_SIZE = 12;

export type Filters = {
  q: string;
  category: string;
  result: string;
  level: string;
  month: string;
  period: "current" | "past" | "all";
  page: number;
};

const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// Read filters from the page address. Anything unknown is ignored, so a
// hand-edited link can never break the query.
export function readFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const category = pick(sp.category);
  const result = pick(sp.result);
  const level = pick(sp.level);
  const month = pick(sp.month);
  const period = pick(sp.period);
  const page = Number.parseInt(pick(sp.page), 10);
  return {
    q: pick(sp.q).trim().slice(0, 80),
    category: CATEGORIES.some((c) => c.value === category) ? category : "",
    result: result === "award" || result === "participation" ? result : "",
    level: LEVELS.some((l) => l.value === level) ? level : "",
    month: /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : "",
    period: period === "current" || period === "past" ? period : "all",
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 500) : 1,
  };
}

export function filtersToSearch(f: Partial<Filters>) {
  const params = new URLSearchParams();
  if (f.period && f.period !== "all") params.set("period", f.period);
  if (f.category) params.set("category", f.category);
  if (f.result) params.set("result", f.result);
  if (f.level) params.set("level", f.level);
  if (f.month) params.set("month", f.month);
  if (f.q) params.set("q", f.q);
  if (f.page && f.page > 1) params.set("page", String(f.page));
  const s = params.toString();
  return s ? `?${s}` : "";
}

// Characters that would change the meaning of a PostgREST "or" filter.
export function safeSearchTerm(q: string) {
  return q.replace(/[,()*%\\:"']/g, " ").replace(/\s+/g, " ").trim();
}
