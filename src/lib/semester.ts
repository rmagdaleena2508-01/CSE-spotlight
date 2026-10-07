import { todayInIndia } from "@/lib/schemas";

// Semesters run July–December and January–June. "Current" means event dates in
// the semester we are in now (India time); anything earlier is "past".
export function currentSemester(today = todayInIndia()) {
  const [year, month] = today.split("-").map(Number);
  const odd = month >= 7;
  return {
    start: odd ? `${year}-07-01` : `${year}-01-01`,
    label: odd ? `July–December ${year}` : `January–June ${year}`,
  };
}
