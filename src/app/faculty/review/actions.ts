"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireFaculty } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

const id = z.uuid();

function refresh(postId: string) {
  revalidatePath("/faculty/review");
  revalidatePath(`/faculty/review/${postId}`);
  revalidatePath(`/achievements/${postId}`);
  revalidatePath("/achievements");
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
