"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { buildEdit, EDIT_FIELDS, readEditForm, type EditState } from "@/lib/post-edit";
import { requireFaculty } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const id = z.uuid();

// A faculty member fixes a mistake in a student's post. The same rules as the
// Add a win form are checked, the post is saved, and the student gets a
// notification that lists what changed (and the faculty member's note).
export async function editPost(prev: EditState, form: FormData): Promise<EditState> {
  const faculty = await requireFaculty();
  const postId = String(form.get("id") ?? "");
  if (!id.safeParse(postId).success) return { error: "Unknown post." };

  const values = readEditForm(form);
  const note = String(form.get("note") ?? "").trim();
  const back = { values: { ...values, note }, tries: (prev?.tries ?? 0) + 1 };
  if (note.length > 500) return { ...back, error: "Keep the note under 500 characters." };

  const supabase = await createClient();
  const { data: post } = await supabase.from("achievements").select("*").eq("id", postId).maybeSingle();
  if (!post) return { error: "This post no longer exists." };

  const edit = buildEdit(values, post);
  if ("error" in edit) return { ...back, error: edit.error };
  const { update, changed } = edit;

  const admin = createAdminClient();
  const { error } = await admin.from("achievements").update(update).eq("id", postId);
  if (error) return { ...back, error: "Could not save. Check the details and try again." };

  // Tell the student, in their notifications under the bell.
  const { data: student } = await admin.from("students").select("auth_user_id").eq("roll_no", post.roll_no).maybeSingle();
  if (student?.auth_user_id) {
    const list = changed.map((k) => EDIT_FIELDS[k]).join(", ");
    await admin.from("notifications").insert({
      user_id: student.auth_user_id,
      achievement_id: postId,
      kind: "faculty_edit",
      title: `Faculty edited your post "${update.event_name}"`.slice(0, 200),
      body: `${faculty.name} fixed: ${list}.${note ? `\nNote: ${note}` : ""}`.slice(0, 2000),
    });
  }

  revalidatePath(`/faculty/review/${postId}`);
  revalidatePath("/faculty/review");
  revalidatePath(`/achievements/${postId}`);
  revalidatePath("/achievements");
  revalidatePath("/spotlight");
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect(`/faculty/review/${postId}?edited=1`);
}
