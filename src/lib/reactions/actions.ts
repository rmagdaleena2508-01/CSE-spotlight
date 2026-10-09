"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getViewer } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { REACTION_KINDS, type ReactionKind, type Reactor } from "./kinds";

const reactInput = z.object({ id: z.uuid(), kind: z.enum(REACTION_KINDS) });

/**
 * Celebrate or Heart a post, LinkedIn style: one reaction per person per post.
 * Picking a different one switches it; picking the same one again takes it back.
 * Students and faculty can react; visitors must log in first.
 */
export async function react(id: string, kind: ReactionKind): Promise<{ error?: string; mine?: ReactionKind | null }> {
  const parsed = reactInput.safeParse({ id, kind });
  if (!parsed.success) return { error: "Something went wrong." };
  const viewer = await getViewer();
  if (!viewer) return { error: "Log in to react." };

  const supabase = await createClient();
  const where = { achievement_id: parsed.data.id, user_id: viewer.userId };
  const { data: current } = await supabase.from("reactions").select("kind").match(where).maybeSingle();

  let error;
  let mine: ReactionKind | null = parsed.data.kind;
  if (current?.kind === parsed.data.kind) {
    ({ error } = await supabase.from("reactions").delete().match(where));
    mine = null;
  } else if (current) {
    ({ error } = await supabase.from("reactions").update({ kind: parsed.data.kind }).match(where));
  } else {
    ({ error } = await supabase.from("reactions").insert({ ...where, kind: parsed.data.kind }));
  }
  if (error) return { error: "Could not save your reaction. Try again." };

  revalidatePath("/");
  revalidatePath("/spotlight");
  revalidatePath(`/achievements/${parsed.data.id}`);
  return { mine };
}

/** Everyone who reacted to a post, newest first (names only). */
export async function listReactors(id: string): Promise<Reactor[]> {
  if (!z.uuid().safeParse(id).success) return [];
  const supabase = await createClient();
  const { data } = await supabase.rpc("post_reactors", { p_id: id, p_limit: 200 });
  return (data ?? []).map((r: { name: string; kind: ReactionKind; is_faculty: boolean }) => ({
    name: r.name,
    kind: r.kind,
    isFaculty: r.is_faculty,
  }));
}
