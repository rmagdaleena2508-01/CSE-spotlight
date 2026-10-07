import { categoryLabel, levelLabel, resultLabel, typeLabel } from "@/lib/labels";
import { photoFileNames, type ReportRow } from "./data";

// Quote every cell, and stop spreadsheet apps from running text as a formula.
function cell(v: string | number | null | undefined) {
  let t = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
}

const HEADERS = [
  "No", "Roll number", "Name", "Year", "Section", "Category", "Type", "Event", "Title", "Result", "Rank",
  "Award title", "Cash prize (Rs.)", "Start date", "End date", "Organized by", "Held at", "Level",
  "Team name", "Team members", "Guide", "Description", "Main photo file", "Verified on",
];

export function reportCsv(rows: ReportRow[]) {
  const lines = rows.map((r, i) => {
    const photos = photoFileNames(r, i + 1);
    return [
      i + 1, r.roll_no, r.student_name, r.year_of_study, r.section, categoryLabel(r.category),
      typeLabel(r.achievement_type), r.event_name, r.work_title, resultLabel(r), r.rank, r.award_title,
      r.cash_prize, r.event_date, r.end_date, r.organizer, r.venue, levelLabel(r.level), r.team_name,
      r.team_members.map((m) => (m.roll_no ? `${m.name} (${m.roll_no})` : m.name)).join("; "),
      r.mentor, r.description, photos[0]?.name ?? "", r.verified_at?.slice(0, 10),
    ].map(cell).join(",");
  });
  // Byte order mark so Excel reads names with special letters correctly.
  return "﻿" + [HEADERS.map(cell).join(","), ...lines].join("\r\n");
}
