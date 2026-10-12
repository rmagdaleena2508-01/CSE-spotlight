// The fixed choices for a post (category, level, kind of win). Kept apart from the form
// rules in schemas.ts, so pages that only show labels do not download the form checker.

export const CATEGORIES = [
  { value: "technical", label: "Technical" },
  { value: "non_technical", label: "Non-Technical" },
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
