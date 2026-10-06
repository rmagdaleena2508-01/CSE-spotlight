// Shared rules for roll numbers and names. The database has the same rules
// (see public.name_key in supabase/migrations), so both sides agree.

export const ROLL_PATTERN = /^RA\d{13}$/;

export function normalizeRoll(raw: string) {
  return raw.replace(/\s+/g, "").toUpperCase();
}

// "PRIYAN .A .M", "Priyan A M" and "A M Priyan" all become ["A", "M", "PRIYAN"].
export function nameWords(raw: string) {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .sort();
}

export function namesMatch(typed: string, roster: string) {
  const a = nameWords(typed);
  const b = nameWords(roster);
  return a.length > 0 && a.length === b.length && a.every((w, i) => w === b[i]);
}

// Students and faculty sign in through Supabase Auth with a hidden email.
// No mail is ever sent to these addresses.
export const studentEmail = (roll: string) => `${roll.toLowerCase()}@students.cse-spotlight.app`;
export const facultyEmail = (username: string) => `${username.toLowerCase()}@faculty.cse-spotlight.app`;
