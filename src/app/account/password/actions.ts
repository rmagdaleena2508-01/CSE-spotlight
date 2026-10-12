"use server";

import { createClient as createPlainClient } from "@supabase/supabase-js";
import { password } from "@/lib/schemas";
import { getViewer } from "@/lib/session";
import { recordFailure, tooManyAttempts, WINDOW_MINUTES } from "@/lib/attempts";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Never holds a password: only a message goes back to the page.
export type PasswordState = { error?: string; done?: boolean } | undefined;

// Changing a password, kept safe:
// - You must type your current password, so someone who finds your laptop
//   logged in cannot lock you out.
// - Wrong current passwords count towards the same 5 tries in 15 minutes as
//   the login page.
// - Passwords travel only inside the form post (never in the web address),
//   are never written to the logs, and are never sent back to the page.
//   Supabase stores only a scrambled form (a hash), never the password itself.
// - After the change, every other device that was logged in is logged out.
export async function changePassword(_: PasswordState, form: FormData): Promise<PasswordState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Please log in again." };

  const current = String(form.get("current") ?? "");
  const next = password.safeParse(form.get("password"));
  if (!current) return { error: "Type your current password." };
  if (!next.success) return { error: next.error.issues[0].message };
  if (form.get("password") !== form.get("confirm")) return { error: "The two new passwords do not match." };
  if (next.data === current) return { error: "Pick a new password that is different from the current one." };

  const key = `password:${viewer.userId}`;
  if (await tooManyAttempts(key)) {
    return { error: `Too many wrong tries. Wait ${WINDOW_MINUTES} minutes and try again.` };
  }

  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const email = user.user?.email;
  if (!email || user.user?.id !== viewer.userId) return { error: "Please log in again." };

  // Check the current password on a separate, throwaway connection, so the
  // check does not touch the session you are logged in with.
  const checker = createPlainClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: wrong } = await checker.auth.signInWithPassword({ email, password: current });
  if (wrong) {
    await recordFailure(key);
    return { error: "Your current password is not right." };
  }
  await checker.auth.signOut({ scope: "local" });

  const { error } = await createAdminClient().auth.admin.updateUserById(viewer.userId, { password: next.data });
  if (error) return { error: "Could not change your password. Try again." };

  // Log out every other device. This one stays logged in.
  await supabase.auth.signOut({ scope: "others" });
  return { done: true };
}
