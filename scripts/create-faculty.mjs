// Creates (or resets the password of) a faculty login.
// Usage: npm run create-faculty -- <username> "<Full Name>"
// The password is read from the FACULTY_PASSWORD env var, or prompted for.
import { createInterface } from "node:readline/promises";
import { createClient } from "@supabase/supabase-js";

const [username, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ").trim();
if (!username || !/^[a-z0-9._-]{3,40}$/i.test(username) || !name) {
  console.error('Usage: npm run create-faculty -- <username> "<Full Name>"');
  process.exit(1);
}

let password = process.env.FACULTY_PASSWORD;
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question("Password (at least 8 characters): ");
  rl.close();
}
if (!password || password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const email = `${username.toLowerCase()}@faculty.cse-spotlight.app`;

const { data: existing } = await admin.from("faculty").select("auth_user_id").eq("username", username.toLowerCase()).maybeSingle();

let userId = existing?.auth_user_id;
if (userId) {
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) throw error;
  console.log(`Updated the password for ${username}.`);
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "faculty" },
  });
  if (error) throw error;
  userId = data.user.id;
  const { error: insertError } = await admin.from("faculty").insert({ auth_user_id: userId, username: username.toLowerCase(), name });
  if (insertError) {
    await admin.auth.admin.deleteUser(userId);
    throw insertError;
  }
  console.log(`Created faculty login "${username}" for ${name}.`);
}
