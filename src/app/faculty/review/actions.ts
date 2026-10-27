"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireFaculty } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const id = z.uuid();

function refresh(postId: string) {
  revalidatePath("/faculty/review");
  revalidatePath(`/faculty/review/${postId}`);
  revalidatePath(`/achievements/${postId}`);
  revalidatePath("/achievements");
  revalidatePath("/spotlight");
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function verifyPost(postId: string): Promise<{ error?: string }> {
  await requireFaculty();
  if (!id.safeParse(postId).success) return { error: "Unknown post." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("verify_achievement", { p_id: postId });
  if (error) return { error: "Could not verify. Someone may have changed it; reload and try again." };
  refresh(postId);
  return {};
}

export async function removePost(postId: string, reason: string): Promise<{ error?: string }> {
  await requireFaculty();
  if (!id.safeParse(postId).success) return { error: "Unknown post." };
  const clean = reason.trim();
  if (clean.length < 3) return { error: "Write a short reason so the student knows what to fix." };
  if (clean.length > 500) return { error: "Keep the reason under 500 characters." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_achievement", { p_id: postId, p_reason: clean });
  if (error) return { error: "Could not remove. It may already be removed; reload and try again." };
  refresh(postId);
  return {};
}

// Faculty delete a post for good, at any time, whatever its status or age
// (students can only edit for 2 months, but faculty can always delete). Its
// certificate, photos and cheers go with it, and the student gets a
// notification with the reason.
export async function deletePostForGood(postId: string, reason: string): Promise<{ error?: string }> {
  const faculty = await requireFaculty();
  if (!id.safeParse(postId).success) return { error: "Unknown post." };
  const clean = reason.trim();
  if (clean.length < 3) return { error: "Write a short reason so the student knows why." };
  if (clean.length > 500) return { error: "Keep the reason under 500 characters." };

  const admin = createAdminClient();
  const { data: post } = await admin
    .from("achievements")
    .select("id, roll_no, event_name, certificate_paths, photo_paths, thumb_path")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return { error: "This post is already gone." };

  const { error } = await admin.from("achievements").delete().eq("id", post.id);
  if (error) return { error: "Could not delete it. Reload and try again." };

  // The post is already gone; a file that fails to delete here is only left over, never shown.
  if (post.certificate_paths?.length) await admin.storage.from("certificates").remove(post.certificate_paths);
  const photos = [...(post.photo_paths ?? []), ...(post.thumb_path ? [post.thumb_path] : [])];
  if (photos.length) await admin.storage.from("photos").remove(photos);

  const { data: student } = await admin.from("students").select("auth_user_id").eq("roll_no", post.roll_no).maybeSingle();
  if (student?.auth_user_id) {
    await admin.from("notifications").insert({
      user_id: student.auth_user_id,
      achievement_id: null,
      kind: "faculty_delete",
      title: `Faculty deleted your post "${post.event_name}"`.slice(0, 200),
      body: `${faculty.name} deleted it.\nReason: ${clean}`.slice(0, 2000),
    });
  }

  refresh(postId);
  return {};
}
