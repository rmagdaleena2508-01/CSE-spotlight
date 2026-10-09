// Shared by the server and the browser.

export const REACTION_KINDS = ["celebrate", "heart"] as const;
export type ReactionKind = (typeof REACTION_KINDS)[number];

export type Reactor = { name: string; kind: ReactionKind; isFaculty: boolean };

/** Names are stored in capitals ("R PRIYA"); show them as "R Priya". Mixed-case names stay as typed. */
export function displayName(name: string) {
  if (name !== name.toUpperCase()) return name;
  return name
    .toLowerCase()
    .replace(/(^|[\s.'-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}
