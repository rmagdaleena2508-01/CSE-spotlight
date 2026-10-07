import type { NextRequest } from "next/server";
import { zipSync } from "fflate";
import { loadReport, photoFileNames } from "@/lib/report/data";
import { download, facultyOrNull, fileName } from "@/lib/report/guard";
import { readReportParams } from "@/lib/report/params";
import { photoUrl } from "@/lib/photos";

// All photos of the verified posts, named so they match the PDF and CSV entry numbers.
export async function GET(request: NextRequest) {
  if (!(await facultyOrNull())) return new Response("Faculty only", { status: 403 });
  const params = readReportParams((k) => request.nextUrl.searchParams.get(k));
  const rows = await loadReport(params);

  const wanted = rows.flatMap((r, i) => photoFileNames(r, i + 1));
  const files: Record<string, Uint8Array> = {};
  // A few at a time, so a big semester does not open hundreds of connections at once.
  for (let i = 0; i < wanted.length; i += 6) {
    await Promise.all(
      wanted.slice(i, i + 6).map(async ({ path, name }) => {
        const res = await fetch(photoUrl(path));
        if (res.ok) files[name] = new Uint8Array(await res.arrayBuffer());
      }),
    );
  }
  if (Object.keys(files).length === 0) files["no-photos.txt"] = new TextEncoder().encode("No photos for this period.\n");

  // Photos are already compressed, so store them as-is (level 0) to keep this fast.
  const zip = zipSync(files, { level: 0 });
  return download(new Uint8Array(zip), "application/zip", fileName(params.label, "zip"));
}
