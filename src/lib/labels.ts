import { CATEGORIES, LEVELS } from "@/lib/schemas";

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
