"use server";

import { revalidatePath } from "next/cache";
import { parseRoster, type ParsedRoster, type RosterRow } from "@/lib/parse-roster";
import { ROLL_PATTERN } from "@/lib/roster";
import { requireFaculty } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PreviewState = { error?: string; preview?: ParsedRoster; fileName?: string } | undefined;
export type ImportResult = { error?: string; added?: number; updated?: number; invalid?: number };

const MAX_BYTES = 2 * 1024 * 1024;

export async function previewRoster(_: PreviewState, form: FormData): Promise<PreviewState> {
  await requireFaculty();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an Excel file." };
  if (file.size > MAX_BYTES) return { error: "That file is over 2 MB. Is it the right sheet?" };
  if (!/\.(xlsx|xls)$/i.test(file.name)) return { error: "Use an .xlsx or .xls file." };
  try {
    const preview = parseRoster(await file.arrayBuffer());
    if (!preview.rows.length) return { error: "No students found in that file." };
    return { preview, fileName: file.name };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not read that file." };
  }
}

export async function importRoster(rows: RosterRow[]): Promise<ImportResult> {
  await requireFaculty();
  const clean = rows.filter((r) => ROLL_PATTERN.test(r.roll_no) && r.name.trim()).slice(0, 5000);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("import_roster", { p_rows: clean });
  if (error) return { error: "Could not save the class list. Try again." };
  revalidatePath("/faculty/roster");
  return data as ImportResult;
}

// Lets a student set a new password: unlink the roll number and delete the old login.
export async function resetStudent(rollNo: string): Promise<{ error?: string }> {
  await requireFaculty();
  const supabase = await createClient();
  const { data: oldUser, error } = await supabase.rpc("reset_student", { p_roll_no: rollNo });
  if (error) return { error: "Could not reset that student." };
  if (oldUser) await createAdminClient().auth.admin.deleteUser(oldUser as string);
  revalidatePath("/faculty/roster");
  return {};
}
