import "server-only";
import ExcelJS from "exceljs";

export type RosterRow = { roll_no: string; name: string; claimed_at: string | null };

const YELLOW = "FFFFFF00";

// The class list as an Excel file, laid out like the sheet faculty upload
// (S. no / Reg no / Student name), plus whether each student has registered.
// The student who just signed up is highlighted yellow so faculty can check them.
export async function buildClassListExcel(rows: RosterRow[], newRoll: string) {
  const book = new ExcelJS.Workbook();
  book.creator = "CSE Spotlight";
  const sheet = book.addWorksheet("Class list", { views: [{ state: "frozen", ySplit: 2 }] });

  sheet.columns = [
    { key: "sno", width: 7 },
    { key: "roll", width: 20 },
    { key: "name", width: 32 },
    { key: "status", width: 14 },
    { key: "when", width: 20 },
  ];

  const newcomer = rows.find((r) => r.roll_no === newRoll);
  const title = sheet.addRow([
    `New sign-up: ${newcomer?.name ?? ""} (${newRoll}). Highlighted in yellow below.`,
  ]);
  sheet.mergeCells(title.number, 1, title.number, 5);
  title.font = { bold: true };

  const header = sheet.addRow(["S. no", "Reg no", "Student name", "Registered", "Registered on"]);
  header.font = { bold: true };
  header.eachCell((c) => {
    c.border = { bottom: { style: "thin" } };
  });

  rows.forEach((r, i) => {
    const row = sheet.addRow([
      i + 1,
      r.roll_no,
      r.name,
      r.claimed_at ? "Yes" : "Not yet",
      r.claimed_at
        ? new Date(r.claimed_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })
        : "",
    ]);
    if (r.roll_no === newRoll) {
      row.eachCell({ includeEmpty: true }, (c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: YELLOW } };
      });
      row.font = { bold: true };
    }
  });

  return Buffer.from(await book.xlsx.writeBuffer());
}
