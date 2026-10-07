import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ReportParams } from "./params";

export type ReportRow = {
  id: string;
  roll_no: string;
  student_name: string;
  year_of_study: string;
  section: string;
  achievement_type: string;
  event_name: string;
  work_title: string | null;
  organizer: string;
  venue: string;
  event_date: string;
  end_date: string | null;
  category: string;
  level: string;
  result_type: string;
  rank: number | null;
  award_title: string | null;
  cash_prize: number | null;
  participation_type: string;
  team_name: string | null;
  team_members: { name: string; roll_no: string }[];
  mentor: string | null;
  description: string;
  photo_paths: string[];
  verified_at: string;
};

const CATEGORY_ORDER = ["technical", "non_technical", "arts", "sports"];

// Verified posts only, grouped by category, oldest event first (newsletter order).
// Runs as the signed-in faculty member, so row level security still applies.
export async function loadReport(p: ReportParams): Promise<ReportRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("achievements")
    .select(
      "id, roll_no, student_name, year_of_study, section, achievement_type, event_name, work_title, organizer, venue, event_date, end_date, category, level, result_type, rank, award_title, cash_prize, participation_type, team_name, team_members, mentor, description, photo_paths, verified_at",
    )
    .eq("status", "verified")
    .gte("event_date", p.from)
    .lte("event_date", p.to)
    .order("event_date")
    .order("id")
    .limit(2000);
  if (p.category) query = query.eq("category", p.category);
  const { data, error } = await query;
  if (error) throw new Error("Could not load the report.");
  return (data as ReportRow[]).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  );
}

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "event";
}

// File names inside the photo ZIP. Entry numbers match the PDF and CSV.
// Only paths in the shape the upload form makes ("<user id>/<random id>.<ext>").
const PHOTO_PATH = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function photoFileNames(row: ReportRow, entry: number) {
  const base = `${String(entry).padStart(2, "0")}-${row.roll_no}-${slug(row.event_name)}`;
  return row.photo_paths.filter((p) => PHOTO_PATH.test(p)).map((p, i) => {
    const ext = p.split(".").pop() ?? "jpg";
    return { path: p, name: i === 0 ? `${base}-main.${ext}` : `${base}-${i + 1}.${ext}` };
  });
}
