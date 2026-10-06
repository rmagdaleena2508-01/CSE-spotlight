import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Viewer =
  | { kind: "student"; userId: string; rollNo: string; name: string }
  | { kind: "faculty"; userId: string; name: string };

// Who is signed in, looked up once per request.
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: faculty } = await supabase
    .from("faculty")
    .select("name")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (faculty) return { kind: "faculty", userId, name: faculty.name };

  const { data: student } = await supabase
    .from("students")
    .select("roll_no, name")
    .eq("auth_user_id", userId)
    .eq("active", true)
    .maybeSingle();
  if (student) return { kind: "student", userId, rollNo: student.roll_no, name: student.name };

  return null;
});

export async function requireStudent() {
  const viewer = await getViewer();
  if (viewer?.kind !== "student") redirect("/login");
  return viewer;
}

export async function requireFaculty() {
  const viewer = await getViewer();
  if (viewer?.kind !== "faculty") redirect("/login?as=faculty");
  return viewer;
}
