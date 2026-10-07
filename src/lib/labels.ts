import { ACHIEVEMENT_TYPES, CATEGORIES, LEVELS } from "@/lib/schemas";

export const categoryLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label ?? v;
export const levelLabel = (v: string) => LEVELS.find((l) => l.value === v)?.label ?? v;

export function resultLabel(a: { result_type: string; rank: number | null; award_title: string | null }) {
  if (a.result_type === "participation") return "Participation";
  if (a.award_title) return a.award_title;
  return a.rank ? `Rank ${a.rank}` : "Award";
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const typeLabel = (v: string) => ACHIEVEMENT_TYPES.find((t) => t.value === v)?.label ?? v;

export function dateRange(start: string, end: string | null) {
  return end && end !== start ? `${formatDate(start)} to ${formatDate(end)}` : formatDate(start);
}

export function classLabel(year: string, section: string) {
  return [year && `${year} year`, section].filter(Boolean).join(" · ");
}

export const rupees = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;
