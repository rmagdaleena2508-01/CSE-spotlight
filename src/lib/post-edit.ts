import { achievementSchema } from "@/lib/schemas";

// Shared by the faculty Edit page and the student Edit page.

// The fields that can be edited, with the names people see in notifications.
export const EDIT_FIELDS = {
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
export type EditField = keyof typeof EDIT_FIELDS;

export type EditState = { error?: string; values?: Record<string, string>; tries?: number } | undefined;

/** How long after posting a student may still edit their post. */
export const STUDENT_EDIT_MONTHS = 2;

/** True while a student may still edit this post: not checked yet, and posted under 2 months ago. */
export function studentCanEdit(post: { status: string; created_at: string }, now = new Date()) {
  const until = new Date(post.created_at);
  until.setMonth(until.getMonth() + STUDENT_EDIT_MONTHS);
  return post.status === "live" && now < until;
}

/** The post's current values as form strings, to fill the edit form. */
export function editValues(post: Record<string, unknown>) {
  return Object.fromEntries(
    (Object.keys(EDIT_FIELDS) as EditField[]).map((k) => [k, post[k] === null || post[k] === undefined ? "" : String(post[k])]),
  );
}

export function readEditForm(form: FormData) {
  return Object.fromEntries((Object.keys(EDIT_FIELDS) as EditField[]).map((k) => [k, String(form.get(k) ?? "")]));
}

const optional = (v?: string) => (v && v.trim() ? v.trim() : null);

// Checks the new values with the same rules as the Add a win form and works
// out which fields really changed. Team details are not edited here, so they
// are checked as they already are.
export function buildEdit(values: Record<string, string>, post: Record<string, unknown>) {
  const parsed = achievementSchema.safeParse({
    ...values,
    participation_type: post.participation_type,
    team_name: post.team_name ?? "",
    team_members: post.team_members ?? [],
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
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
  const changed = (Object.keys(update) as EditField[]).filter((k) => !same(update[k], post[k]));
  if (!changed.length) return { error: "Nothing was changed." } as const;
  return { update, changed } as const;
}
