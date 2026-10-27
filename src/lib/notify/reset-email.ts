import "server-only";
import nodemailer from "nodemailer";

// When a student resets a forgotten password, tell the developer and faculty, so a
// reset the student did not ask for (a classmate guessing their roll number and name)
// is noticed and can be undone from the Class list page. Same Gmail settings as the
// sign-up email (GMAIL_USER, GMAIL_APP_PASSWORD, SIGNUP_NOTIFY_TO); skipped if unset.

export async function sendResetEmail(rollNo: string, name: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = (process.env.SIGNUP_NOTIFY_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!user || !pass || to.length === 0) {
    console.warn("[reset-email] Skipped: set GMAIL_USER, GMAIL_APP_PASSWORD and SIGNUP_NOTIFY_TO");
    return;
  }
  const when = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(
    new Date(),
  );
  const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transport.sendMail({
    from: `CSE Spotlight <${user}>`,
    to,
    subject: `Password reset: ${name} (${rollNo})`,
    text: [
      `${name} (${rollNo}) reset their CSE Spotlight password on ${when}, using "Forgot password".`,
      "",
      "If the student did not do this, someone else may have used their roll number and name.",
      "Reset the student's login from the Class list page, and ask the student to sign up again.",
    ].join("\n"),
  });
}
