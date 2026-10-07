import { CATEGORIES, todayInIndia } from "@/lib/schemas";

// Report periods follow the newsletter: one per semester (Jan–Jun, Jul–Dec).
export type ReportParams = { from: string; to: string; category: string; label: string; key: string };

function semester(year: number, half: 1 | 2) {
  return half === 1
    ? { key: `${year}-1`, from: `${year}-01-01`, to: `${year}-06-30`, label: `JAN - JUN ${year}` }
    : { key: `${year}-2`, from: `${year}-07-01`, to: `${year}-12-31`, label: `JUL - DEC ${year}` };
}

// The current semester first, then the five before it.
export function recentSemesters(count = 6) {
  const [y, m] = todayInIndia().split("-").map(Number);
  let year = y;
  let half: 1 | 2 = m >= 7 ? 2 : 1;
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push(semester(year, half));
    if (half === 2) half = 1;
    else {
      half = 2;
      year -= 1;
    }
  }
  return list;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const pick = (v: string | string[] | null | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function readReportParams(get: (k: string) => string | string[] | null | undefined): ReportParams {
  const category = CATEGORIES.some((c) => c.value === pick(get("category"))) ? pick(get("category")) : "";
  const sem = pick(get("semester"));
  const match = /^(\d{4})-([12])$/.exec(sem);
  if (match) {
    const s = semester(Number(match[1]), Number(match[2]) as 1 | 2);
    return { ...s, category };
  }
  const from = pick(get("from"));
  const to = pick(get("to"));
  if (DATE.test(from) && DATE.test(to) && from <= to) {
    return { key: "custom", from, to, category, label: `${from} TO ${to}` };
  }
  return { ...recentSemesters(1)[0], category };
}

export function reportQuery(p: ReportParams) {
  const q = new URLSearchParams(p.key === "custom" ? { from: p.from, to: p.to } : { semester: p.key });
  if (p.category) q.set("category", p.category);
  return q.toString();
}
