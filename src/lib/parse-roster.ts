import "server-only";
import * as XLSX from "xlsx";
import { ROLL_PATTERN, normalizeRoll } from "@/lib/roster";

export type RosterRow = { roll_no: string; name: string };
export type ParsedRoster = {
  rows: RosterRow[];
  invalid: { line: number; value: string }[];
  duplicates: string[];
};

// Reads the class Excel. The header row can be anywhere near the top; we look
// for a "Reg no" / "Roll no" column and a "name" column.
export function parseRoster(buffer: ArrayBuffer): ParsedRoster {
  const book = XLSX.read(buffer, { type: "array" });
  const sheet = book.Sheets[book.SheetNames[0]];
  if (!sheet) throw new Error("The file has no sheets.");
  const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: "" });

  let headerRow = -1;
  let rollCol = -1;
  let nameCol = -1;
  for (let r = 0; r < Math.min(grid.length, 20) && headerRow < 0; r++) {
    const cells = grid[r].map((c) => String(c).trim().toLowerCase());
    const roll = cells.findIndex((c) => /^(reg(istration)?|roll)\s*\.?\s*(no|number)?\.?$/.test(c));
    const name = cells.findIndex((c) => c.includes("name"));
    if (roll >= 0 && name >= 0) {
      headerRow = r;
      rollCol = roll;
      nameCol = name;
    }
  }
  if (headerRow < 0) throw new Error('Could not find the "Reg no" and "Student name" columns.');

  const seen = new Set<string>();
  const result: ParsedRoster = { rows: [], invalid: [], duplicates: [] };
  for (let r = headerRow + 1; r < grid.length; r++) {
    const rawRoll = String(grid[r][rollCol] ?? "");
    const name = String(grid[r][nameCol] ?? "").replace(/\s+/g, " ").trim();
    if (!rawRoll.trim() && !name) continue;
    const roll = normalizeRoll(rawRoll);
    if (!ROLL_PATTERN.test(roll) || !name) {
      result.invalid.push({ line: r + 1, value: rawRoll || "(empty)" });
      continue;
    }
    if (seen.has(roll)) {
      result.duplicates.push(roll);
      continue;
    }
    seen.add(roll);
    result.rows.push({ roll_no: roll, name });
  }
  return result;
}
