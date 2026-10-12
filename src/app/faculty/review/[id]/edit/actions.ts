"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { achievementSchema } from "@/lib/schemas";
import { requireFaculty } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// The fields faculty can fix, with the names the student sees in the notification.
const FIELDS = {
  year_of_study: "Year",
  section: "Section",
  achievement_type: "Kind of achievement",
  event_name: "Event name",
  organizer: "Organizer",
  venue: "Venue",
  event_date: "Event date",
  end_date: "End date",
  category: "Category",
  level: "Level",
  result_type: "Result",
  rank: "Rank",
  award_title: "Award title",
  cash_prize: "Cash prize",
  work_title: "Title of the work",
  mentor: "Guide",
  description: "Description",
  proof_url: "Proof link",
} as const;
type Field = keyof typeof FIELDS;

export type EditState = { error?: string; values?: Record<string, string>; tries?: number } | undefined;

const id = z.uuid();
const optional = (v?: string) => (v && v.trim() ? v.trim() : null);

// A faculty member fixes a mistake in a student's post. The same rules as the
// Add a win form are checked, the post is saved, and the student gets a
// notification that lists what changed (and the faculty member's note).
export async function editPost(prev: EditState, form: FormData): Promise<EditState> {
  const faculty = await requireFaculty();
  const postId = String(form.get("id") ?? "");
  if (!id.safeParse(postId).success) return { error: "Unknown post." };

  const values = Object.fromEntries((Object.keys(FIELDS) as Field[]).map((k) => [k, String(form.get(k) ?? "")]));
  const note = String(form.get("note") ?? "").trim();
  const back = { values: { ...values, note }, tries: (prev?.tries ?? 0) + 1 };
  if (note.length > 500) return { ...back, error: "Keep the note under 500 characters." };

  const supabase = await createClient();
  const { data: post } = await supabase.from("achievements").select("*").eq("id", postId).maybeSingle();
  if (!post) return { error: "This post no longer exists." };

  // Team details are not edited here, so they are checked as they already are.
  const parsed = achievementSchema.safeParse({
    ...values,
    participation_type: post.participation_type,
    team_name: post.team_name ?? "",
    team_members: post.team_members ?? [],
  });
  if (!parsed.success) return { ...back, error: parsed.error.issues[0].message };
  const v = parsed.data;

  const isAward = v.result_type === "award";
  const update = {
    year_of_study: v.year_of_study,
    section: v.section,
    achievement_type: v.achievement_type,
    event_name: v.event_name,
    organizer: v.organizer,
    venue: v.venue,
    event_date: v.event_date,
    end_date: optional(v.end_date),
    category: v.category,
    level: v.level,
    result_type: v.result_type,
    rank: isAward && v.rank ? Number(v.rank) : null,
    award_title: isAward && v.award_title ? v.award_title : null,
    cash_prize: optional(v.cash_prize) ? Number(v.cash_prize) : null,
    work_title: optional(v.work_title),
    mentor: optional(v.mentor),
    description: v.description,
    proof_url: optional(v.proof_url),
  };

  const same = (a: unknown, b: unknown) => String(a ?? "") === String(b ?? "");
  const changed = (Object.keys(update) as Field[]).filter((k) => !same(update[k], post[k]));
  if (!changed.length) return { ...back, error: "Nothing was changed." };

  const admin = createAdminClient();
  const { error } = await admin.from("achievements").update(update).eq("id", postId);
  if (error) return { ...back, error: "Could not save. Check the details and try again." };

  // Tell the student, in their notifications under the bell.
  const { data: student } = await admin.from("students").select("auth_user_id").eq("roll_no", post.roll_no).maybeSingle();
  if (student?.auth_user_id) {
    const list = changed.map((k) => FIELDS[k]).join(", ");
    await admin.from("notifications").insert({
      user_id: student.auth_user_id,
      achievement_id: postId,
      kind: "faculty_edit",
      title: `Faculty edited your post "${update.event_name}"`.slice(0, 200),
      body: `${faculty.name} fixed: ${list}.${note ? `\nNote: ${note}` : ""}`.slice(0, 2000),
    });
  }

  revalidatePath(`/faculty/review/${postId}`);
  revalidatePath("/faculty/review");
  revalidatePath(`/achievements/${postId}`);
  revalidatePath("/achievements");
  revalidatePath("/spotlight");
  revalidatePath("/dashboard");
  revalidatePath("/");
  redirect(`/faculty/review/${postId}?edited=1`);
}
