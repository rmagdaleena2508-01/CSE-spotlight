import "server-only";
import { getViewer } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { ReactionKind } from "./kinds";

export type ReactionInfo = {
  /** The signed-in person's own reaction to each post. */
  mine: Record<string, ReactionKind>;
  /** The most recent person to react to each post, for "Priya and 12 others". */
  latest: Record<string, string>;
  signedIn: boolean;
};

/** Everything the reaction bars on a page need, in two small queries. */
export async function loadReactionInfo(ids: string[]): Promise<ReactionInfo> {
  const viewer = await getViewer();
  const info: ReactionInfo = { mine: {}, latest: {}, signedIn: !!viewer };
  if (ids.length === 0) return info;

  const supabase = await createClient();
  const [latest, mine] = await Promise.all([
    supabase.rpc("latest_reactors", { p_ids: ids }),
    viewer
      ? supabase.from("reactions").select("achievement_id, kind").eq("user_id", viewer.userId).in("achievement_id", ids)
      : Promise.resolve({ data: [] as { achievement_id: string; kind: ReactionKind }[] }),
  ]);
  for (const r of (latest.data ?? []) as { achievement_id: string; name: string }[]) info.latest[r.achievement_id] = r.name;
  for (const r of (mine.data ?? []) as { achievement_id: string; kind: ReactionKind }[]) info.mine[r.achievement_id] = r.kind;
  return info;
}
