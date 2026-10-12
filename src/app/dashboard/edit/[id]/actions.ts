"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { buildEdit, readEditForm, studentCanEdit, type EditState } from "@/lib/post-edit";
import { requireStudent } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

const id = z.uuid();

// A student changes their own post. Only while faculty have not checked it yet,
// and only for 2 months after posting, so old records cannot be changed later.
// The database checks the same rules again (see migration 0008).
export async function editMyPost(prev: EditState, form: FormData): Promise<EditState> {
  const student = await requireStudent();
  const postId = String(form.get("id") ?? "");
  if (!id.safeParse(postId).success) return { error: "Unknown post." };

  const values = readEditForm(form);
  const back = { values, tries: (prev?.tries ?? 0) + 1 };

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", postId)
    .eq("roll_no", student.rollNo)
    .maybeSingle();
  if (!post) return { error: "This post no longer exists." };
  if (!studentCanEdit(post)) {
    return { ...back, error: "This post can no longer be edited. Ask a faculty member if something is wrong." };
  }

  const edit = buildEdit(values, post);
  if ("error" in edit) return { ...back, error: edit.error };

  const { data: saved, error } = await supabase
    .from("achievements")
    .update(edit.update)
    .eq("id", postId)
    .select("id");
  if (error || !saved?.length) return { ...back, error: "Could not save. Check the details and try again." };

  revalidatePath(`/achievements/${postId}`);
  revalidatePath("/achievements");
  revalidatePath("/spotlight");
  revalidatePath("/faculty/review");
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect("/dashboard?edited=1");
}
