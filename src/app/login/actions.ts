"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { namesMatch, studentEmail, facultyEmail } from "@/lib/roster";
import { password, rollNo } from "@/lib/schemas";

export type FormState = { error?: string; step?: "password"; rollNo?: string; name?: string } | undefined;

const WINDOW_MINUTES = 15;
const MAX_FAILED = 5;

async function tooManyAttempts(key: string) {
  const admin = createAdminClient();
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await admin
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("roll_no", key)
    .gte("created_at", since);
  return (count ?? 0) >= MAX_FAILED;
}

async function recordFailure(key: string) {
  await createAdminClient().from("login_attempts").insert({ roll_no: key });
}

const BLOCKED = `Too many wrong tries. Wait ${WINDOW_MINUTES} minutes and try again.`;
const NO_MATCH = "That roll number and name do not match the class list. Check the spelling or ask your faculty.";

type RosterCheck =
  | { ok: true; roll: string; rosterName: string }
  | { ok: false; error: string };

async function checkRoster(rawRoll: string, rawName: string): Promise<RosterCheck> {
  const parsed = z.object({ roll: rollNo, name: z.string().trim().min(1, "Enter your name") }).safeParse({
    roll: rawRoll,
    name: rawName,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { roll, name } = parsed.data;

  if (await tooManyAttempts(roll)) return { ok: false, error: BLOCKED };

  const { data: student } = await createAdminClient()
    .from("students")
    .select("name, active, auth_user_id")
    .eq("roll_no", roll)
    .maybeSingle();

  if (!student || !student.active || !namesMatch(name, student.name)) {
    await recordFailure(roll);
    return { ok: false, error: NO_MATCH };
  }
  if (student.auth_user_id) {
    return {
      ok: false,
      error: "This roll number already has a password. Log in instead, or ask your faculty to reset it.",
    };
  }
  return { ok: true, roll, rosterName: student.name };
}

// First visit. Step 1 checks roll number + name; step 2 (with a password) creates the account.
export async function firstLogin(prev: FormState, form: FormData): Promise<FormState> {
  return form.has("password") ? claimAccount(prev, form) : checkFirstLogin(form);
}

async function checkFirstLogin(form: FormData): Promise<FormState> {
  const result = await checkRoster(String(form.get("roll_no") ?? ""), String(form.get("name") ?? ""));
  if (!result.ok) return { error: result.error };
  return { step: "password", rollNo: result.roll, name: String(form.get("name")) };
}

// Checks the roster again so step 2 cannot be called on its own.
async function claimAccount(_: FormState, form: FormData): Promise<FormState> {
  const rawRoll = String(form.get("roll_no") ?? "");
  const rawName = String(form.get("name") ?? "");
  const back = { step: "password" as const, rollNo: rawRoll, name: rawName };

  const pw = password.safeParse(form.get("password"));
  if (!pw.success) return { ...back, error: pw.error.issues[0].message };
  if (form.get("password") !== form.get("confirm")) return { ...back, error: "The two passwords do not match." };

  const result = await checkRoster(rawRoll, rawName);
  if (!result.ok) return { error: result.error };

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: studentEmail(result.roll),
    password: pw.data,
    email_confirm: true,
    app_metadata: { role: "student", roll_no: result.roll },
  });
  if (createError || !created.user) {
    return { error: "Could not create your account. Try again, or ask your faculty to reset your roll number." };
  }

  // Only link if nobody else claimed it in the meantime.
  const { data: linked } = await admin
    .from("students")
    .update({ auth_user_id: created.user.id, claimed_at: new Date().toISOString() })
    .eq("roll_no", result.roll)
    .is("auth_user_id", null)
    .select("roll_no");
  if (!linked?.length) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "This roll number was just claimed. Ask your faculty to reset it if this was not you." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: studentEmail(result.roll), password: pw.data });
  if (error) return { error: "Account created. Please log in with your new password." };
  redirect("/dashboard");
}

export async function studentLogin(_: FormState, form: FormData): Promise<FormState> {
  const roll = rollNo.safeParse(form.get("roll_no") ?? "");
  if (!roll.success) return { error: roll.error.issues[0].message };
  const pw = String(form.get("password") ?? "");
  if (!pw) return { error: "Enter your password" };

  if (await tooManyAttempts(roll.data)) return { error: BLOCKED };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: studentEmail(roll.data), password: pw });
  if (error) {
    await recordFailure(roll.data);
    return { error: "Wrong roll number or password. First time here? Use the First time tab." };
  }
  redirect("/dashboard");
}

export async function facultyLogin(_: FormState, form: FormData): Promise<FormState> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const pw = String(form.get("password") ?? "");
  if (!/^[a-z0-9._-]{3,40}$/.test(username) || !pw) return { error: "Enter your username and password" };

  const key = `faculty:${username}`;
  if (await tooManyAttempts(key)) return { error: BLOCKED };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: facultyEmail(username), password: pw });
  if (error) {
    await recordFailure(key);
    return { error: "Wrong username or password." };
  }
  redirect("/faculty/roster");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
