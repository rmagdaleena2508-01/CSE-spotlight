import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Counts wrong password tries, so nobody can keep guessing. After 5 wrong
// tries in 15 minutes, that key is blocked until the window passes.
// (The same rule the login page uses.)
export const WINDOW_MINUTES = 15;
const MAX_FAILED = 5;

export async function tooManyAttempts(key: string) {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await createAdminClient()
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("roll_no", key)
    .gte("created_at", since);
  return (count ?? 0) >= MAX_FAILED;
}

export async function recordFailure(key: string) {
  await createAdminClient().from("login_attempts").insert({ roll_no: key });
}
