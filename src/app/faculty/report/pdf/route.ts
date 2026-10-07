import type { NextRequest } from "next/server";
import { loadReport } from "@/lib/report/data";
import { download, facultyOrNull, fileName } from "@/lib/report/guard";
import { readReportParams } from "@/lib/report/params";
import { renderReportPdf } from "@/lib/report/pdf";

export async function GET(request: NextRequest) {
  const faculty = await facultyOrNull();
  if (!faculty) return new Response("Faculty only", { status: 403 });
  const params = readReportParams((k) => request.nextUrl.searchParams.get(k));
  const rows = await loadReport(params);
  const pdf = await renderReportPdf(rows, params, faculty.name);
  return download(new Uint8Array(pdf), "application/pdf", fileName(params.label, "pdf"));
}
