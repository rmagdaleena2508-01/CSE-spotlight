"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStudent } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const id = z.uuid();

// A student deletes one of their own posts, with its certificate and photos.
//
// Safety: the post is first looked up with the student's own login, so the
// database's own rules only show their posts, and the roll number is checked
// again here. Only then is it deleted (with the admin key, since students
// cannot delete rows directly). Only files inside the student's own folder
// are removed. Cheers on the post and its public copy are removed with it.
export async function deleteMyPost(postId: string): Promise<{ error?: string }> {
  const student = await requireStudent();
  if (!id.safeParse(postId).success) return { error: "Unknown post." };

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("achievements")
    .select("id, roll_no, certificate_paths, photo_paths")
    .eq("id", postId)
    .eq("roll_no", student.rollNo)
    .maybeSingle();
  if (!post || post.roll_no !== student.rollNo) return { error: "You can only delete your own posts." };

  const admin = createAdminClient();
  const { error } = await admin.from("achievements").delete().eq("id", post.id).eq("roll_no", student.rollNo);
  if (error) return { error: "Could not delete it. Reload and try again." };

  const own = (paths: string[] | null) => (paths ?? []).filter((p) => p.startsWith(`${student.userId}/`));
  const certificates = own(post.certificate_paths);
  const photos = own(post.photo_paths);
  // The post is already gone; a file that fails to delete here is only left over, never shown.
  if (certificates.length) await admin.storage.from("certificates").remove(certificates);
  if (photos.length) await admin.storage.from("photos").remove(photos);

  revalidatePath("/dashboard");
  revalidatePath(`/achievements/${post.id}`);
  revalidatePath("/achievements");
  revalidatePath("/spotlight");
  revalidatePath("/faculty/review");
  revalidatePath("/");
  return {};
}
