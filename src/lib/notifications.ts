import "server-only";
import { createClient } from "@/lib/supabase/server";

/** How many notifications this person has not read yet. The database only counts their own. */
export async function unreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);
  return count ?? 0;
}
