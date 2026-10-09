import "server-only";
import { PUBLIC_CARD_COLUMNS, type PublicCard } from "@/lib/published";
import { loadReactionInfo, type ReactionInfo } from "@/lib/reactions/load";
import { createClient } from "@/lib/supabase/server";

// Posts for the Student Spotlight row: public fields only, newest first.

export type SpotlightPost = PublicCard & {
  organizer: string;
  level: string;
  description: string;
  created_at: string;
};

const SPOTLIGHT_COLUMNS = `${PUBLIC_CARD_COLUMNS}, organizer, level, description, created_at`;

export async function loadSpotlight({ category, limit }: { category?: string; limit: number }): Promise<{
  posts: SpotlightPost[];
  cheers: ReactionInfo;
}> {
  const supabase = await createClient();
  let query = supabase.from("published_achievements").select(SPOTLIGHT_COLUMNS);
  if (category) query = query.eq("category", category);
  const { data } = await query
    .order("created_at", { ascending: false })
    .order("id")
    .limit(limit)
    .overrideTypes<SpotlightPost[], { merge: false }>();
  const posts = data ?? [];
  return { posts, cheers: await loadReactionInfo(posts.map((p) => p.id)) };
}
