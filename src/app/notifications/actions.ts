"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStudent } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

const id = z.uuid();

// Marks one notification read, then opens the post it is about.
// The database only lets people change their own notifications.
export async function openNotification(form: FormData) {
  await requireStudent();
  const parsed = id.safeParse(form.get("id"));
  if (!parsed.success) redirect("/notifications");

  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", parsed.data)
    .is("read_at", null)
    .select("achievement_id")
    .maybeSingle();

  let postId = data?.achievement_id;
  if (!data) {
    // Already read: still open its post.
    const { data: n } = await supabase.from("notifications").select("achievement_id").eq("id", parsed.data).maybeSingle();
    postId = n?.achievement_id;
  }
  revalidatePath("/", "layout");
  redirect(postId ? `/achievements/${postId}` : "/dashboard");
}

export async function markAllRead() {
  await requireStudent();
  const supabase = await createClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
  revalidatePath("/", "layout");
}
