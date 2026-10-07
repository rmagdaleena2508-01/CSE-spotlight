import { z } from "zod";
import { ROLL_PATTERN, normalizeRoll } from "@/lib/roster";

export const rollNo = z
  .string()
  .transform(normalizeRoll)
  .pipe(z.string().regex(ROLL_PATTERN, "Roll number looks like RA2511003040001"));

export const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters");

export const CATEGORIES = [
  { value: "technical", label: "Technical" },
  { value: "non_technical", label: "Non-Technical" },
  { value: "arts", label: "Arts" },
  { value: "sports", label: "Sports" },
] as const;

export const LEVELS = [
  { value: "intra_college", label: "Intra-college" },
  { value: "inter_college", label: "Inter-college" },
  { value: "state", label: "State" },
  { value: "national", label: "National" },
  { value: "international", label: "International" },
] as const;

export const ACHIEVEMENT_TYPES = [
  { value: "competition", label: "Competition" },
  { value: "hackathon", label: "Hackathon" },
  { value: "paper", label: "Paper presentation / publication" },
  { value: "certification", label: "Certification / course" },
  { value: "talk", label: "Talk or workshop given" },
  { value: "sports", label: "Sports" },
  { value: "project", label: "Project" },
  { value: "other", label: "Other" },
] as const;

export const YEARS = ["I", "II", "III", "IV"] as const;

// Types where the title of the paper, project or talk matters.
export const NEEDS_WORK_TITLE = ["paper", "project", "talk"] as const;

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} needs at least ${min} characters`)
    .max(max, `${label} can have at most ${max} characters`);

export function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export const achievementSchema = z
  .object({
    event_name: trimmed(3, 150, "Event name"),
    organizer: trimmed(3, 150, "Organizer"),
    year_of_study: z.enum(YEARS, { error: "Pick your year" }),
    section: trimmed(1, 20, "Section"),
    achievement_type: z.enum(
      ["competition", "hackathon", "paper", "certification", "talk", "sports", "project", "other"],
      { error: "Pick what kind of achievement this is" },
    ),
    venue: trimmed(3, 150, "Venue"),
    event_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick the event date")
      .refine((d) => d <= todayInIndia(), "Event date cannot be in the future"),
    end_date: z
      .string()
      .refine((d) => d === "" || /^\d{4}-\d{2}-\d{2}$/.test(d), "Pick a valid date")
      .refine((d) => d === "" || d <= todayInIndia(), "End date cannot be in the future")
      .optional(),
    cash_prize: z
      .string()
      .trim()
      .refine((v) => v === "" || /^[1-9]\d{0,7}$/.test(v), "Write the amount in rupees, numbers only, like 2000")
      .optional(),
    work_title: z.string().trim().max(250, "Keep the title under 250 characters").optional(),
    mentor: z.string().trim().max(120, "Keep the name under 120 characters").optional(),
    proof_url: z
      .string()
      .trim()
      .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "Paste a full link starting with https://")
      .optional(),
    category: z.enum(["technical", "non_technical", "arts", "sports"], { error: "Pick a category" }),
    level: z.enum(["intra_college", "inter_college", "state", "national", "international"], {
      error: "Pick a level",
    }),
    result_type: z.enum(["participation", "award"]),
    rank: z.string().trim().optional(),
    award_title: z.string().trim().max(100, "Award title can have at most 100 characters").optional(),
    participation_type: z.enum(["individual", "team"]),
    team_name: z.string().trim().max(100).optional(),
    team_members: z
      .array(
        z.object({
          name: trimmed(1, 120, "Member name"),
          roll_no: z.union([z.literal(""), rollNo]),
        }),
      )
      .max(20, "A team can have at most 20 members"),
    description: trimmed(30, 1500, "Description"),
  })
  .superRefine((v, ctx) => {
    if (v.end_date && v.end_date < v.event_date) {
      ctx.addIssue({ code: "custom", path: ["end_date"], message: "End date cannot be before the start date" });
    }
    if ((NEEDS_WORK_TITLE as readonly string[]).includes(v.achievement_type) && (v.work_title ?? "").length < 3) {
      ctx.addIssue({ code: "custom", path: ["work_title"], message: "Give the title of your paper, project or talk" });
    }
    if (v.mentor && v.mentor.length < 3) {
      ctx.addIssue({ code: "custom", path: ["mentor"], message: "Write the full name of your guide" });
    }
    if (v.result_type !== "award") return;
    const hasRank = !!v.rank && /^[1-9]\d*$/.test(v.rank);
    const hasTitle = !!v.award_title && v.award_title.length >= 2;
    if (v.rank && !/^[1-9]\d*$/.test(v.rank)) {
      ctx.addIssue({ code: "custom", path: ["rank"], message: "Rank must be a whole number like 1, 2 or 3" });
    } else if (!hasRank && !hasTitle) {
      ctx.addIssue({ code: "custom", path: ["award_title"], message: "Give a rank or an award title" });
    }
  });

export type AchievementInput = z.input<typeof achievementSchema>;

export const FILE_RULES = {
  certificates: {
    max: 1,
    maxBytes: 10 * 1024 * 1024,
    types: ["application/pdf", "image/jpeg", "image/png"],
    label: "PDF, JPG or PNG, up to 10 MB",
  },
  photos: {
    max: 5,
    maxBytes: 5 * 1024 * 1024,
    types: ["image/jpeg", "image/png", "image/webp"],
    label: "JPG, PNG or WebP, up to 5 MB each",
  },
} as const;
