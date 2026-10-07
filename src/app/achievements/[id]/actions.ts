"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getViewer } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

const input = z.object({ id: z.uuid(), kind: z.enum(["like", "heart", "fire"]) });

// Pick a reaction. Picking the same one again takes it back.
export async function react(id: string, kind: string): Promise<{ error?: string }> {
  const parsed = input.safeParse({ id, kind });
  if (!parsed.success) return { error: "Something went wrong." };
  const viewer = await getViewer();
  if (viewer?.kind !== "student") return { error: "Log in as a student to react." };

  const supabase = await createClient();
  const { data: mine } = await supabase
    .from("reactions")
    .select("kind")
    .eq("achievement_id", parsed.data.id)
    .eq("user_id", viewer.userId)
    .maybeSingle();

  let error;
  if (mine?.kind === parsed.data.kind) {
    ({ error } = await supabase.from("reactions").delete().eq("achievement_id", parsed.data.id).eq("user_id", viewer.userId));
  } else if (mine) {
    ({ error } = await supabase
      .from("reactions")
      .update({ kind: parsed.data.kind })
      .eq("achievement_id", parsed.data.id)
      .eq("user_id", viewer.userId));
  } else {
    ({ error } = await supabase
      .from("reactions")
      .insert({ achievement_id: parsed.data.id, user_id: viewer.userId, kind: parsed.data.kind }));
  }
  if (error) return { error: "Could not save your reaction. Try again." };

  revalidatePath(`/achievements/${parsed.data.id}`);
  return {};
}
