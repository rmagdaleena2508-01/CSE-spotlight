import type { NextRequest } from "next/server";
import { reportCsv } from "@/lib/report/csv";
import { loadReport } from "@/lib/report/data";
import { download, facultyOrNull, fileName } from "@/lib/report/guard";
import { readReportParams } from "@/lib/report/params";

export async function GET(request: NextRequest) {
  if (!(await facultyOrNull())) return new Response("Faculty only", { status: 403 });
  const params = readReportParams((k) => request.nextUrl.searchParams.get(k));
  const rows = await loadReport(params);
  return download(reportCsv(rows), "text/csv; charset=utf-8", fileName(params.label, "csv"));
}
