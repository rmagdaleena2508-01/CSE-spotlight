// Columns safe for anyone to see. Kept in one place so every page asks for the same set.
export const PUBLIC_CARD_COLUMNS =
  "id, student_name, event_name, event_date, category, result_type, rank, award_title, participation_type, team_name, photo_paths, is_verified, like_count, heart_count, fire_count";

export type PublicCard = {
  id: string;
  student_name: string;
  event_name: string;
  event_date: string;
  category: string;
  result_type: string;
  rank: number | null;
  award_title: string | null;
  participation_type: string;
  team_name: string | null;
  photo_paths: string[];
  is_verified: boolean;
  like_count: number;
  heart_count: number;
  fire_count: number;
};
