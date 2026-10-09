import "server-only";
import nodemailer from "nodemailer";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildClassListExcel, type RosterRow } from "./class-list-excel";

// When a student signs up, email the developer and faculty the class list as an
// Excel file with the new student highlighted, so they can confirm the student
// really is in the CSE department.
//
// Sent through a Gmail account using an app password (set in .env.local):
//   GMAIL_USER          the Gmail address that sends the email
//   GMAIL_APP_PASSWORD  a 16-character Google app password (not the normal password)
//   SIGNUP_NOTIFY_TO    who receives it: comma-separated emails (developer, faculty)
// If any of these are missing the email is skipped; sign-up itself still works.

export async function sendSignupEmail(rollNo: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = (process.env.SIGNUP_NOTIFY_TO ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!user || !pass || to.length === 0) {
    console.warn("[signup-email] Skipped: set GMAIL_USER, GMAIL_APP_PASSWORD and SIGNUP_NOTIFY_TO in .env.local");
    return;
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("students").select("roll_no, name, claimed_at").order("roll_no");
  if (error || !data) {
    console.error("[signup-email] Could not read the class list:", error?.message);
    return;
  }
  const rows = data as RosterRow[];
  const student = rows.find((r) => r.roll_no === rollNo);
  const excel = await buildClassListExcel(rows, rollNo);
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const registered = rows.filter((r) => r.claimed_at).length;

  const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  await transport.sendMail({
    from: `CSE Spotlight <${user}>`,
    to,
    subject: `New sign-up: ${student?.name ?? rollNo} (${rollNo})`,
    text: [
      `${student?.name ?? "A student"} (${rollNo}) just signed up on CSE Spotlight.`,
      "",
      "Please check that they are part of the CSE department. The full class list is attached,",
      "with this student's row highlighted in yellow.",
      "",
      `${registered} of ${rows.length} students have registered so far.`,
      "",
      "If this sign-up looks wrong, reset the student's login from the Class list page.",
    ].join("\n"),
    attachments: [
      {
        filename: `cse-class-list-${day}.xlsx`,
        content: excel,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ],
  });
}
