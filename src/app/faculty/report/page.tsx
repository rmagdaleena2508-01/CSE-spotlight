import type { Metadata } from "next";
import Link from "next/link";
import { FileDown, FileSpreadsheet, FileText, Images } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { categoryLabel, dateRange, resultLabel } from "@/lib/labels";
import { loadReport } from "@/lib/report/data";
import { readReportParams, recentSemesters, reportQuery } from "@/lib/report/params";
import { CATEGORIES } from "@/lib/schemas";
import { requireFaculty } from "@/lib/session";

export const metadata: Metadata = { title: "Newsletter report · CSE Spotlight" };

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default async function ReportPage({ searchParams }: PageProps<"/faculty/report">) {
  await requireFaculty();
  const sp = await searchParams;
  const params = readReportParams((k) => sp[k]);
  const rows = await loadReport(params);
  const q = reportQuery(params);
  const semesters = recentSemesters();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">Newsletter report</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Faculty-verified achievements for the design team: a PDF list, a spreadsheet, and a ZIP of photos. Entry numbers
        match across all three.
      </p>

      <form method="get" className="mt-6 grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="space-y-1 text-sm font-medium">
          Semester
          <select name="semester" defaultValue={params.key} className={selectClass}>
            {semesters.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          Category
          <select name="category" defaultValue={params.category} className={selectClass}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>
        <button type="submit" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Show
        </button>
      </form>

      <section className="mt-6 flex flex-wrap items-center gap-2" aria-label="Downloads">
        <a href={`/faculty/report/pdf?${q}`} className={buttonVariants({ size: "lg" })} download>
          <FileText aria-hidden /> Download PDF
        </a>
        <a href={`/faculty/report/csv?${q}`} className={buttonVariants({ size: "lg", variant: "outline" })} download>
          <FileSpreadsheet aria-hidden /> Download spreadsheet (CSV)
        </a>
        <a href={`/faculty/report/photos?${q}`} className={buttonVariants({ size: "lg", variant: "outline" })} download>
          <Images aria-hidden /> Download photos (ZIP)
        </a>
      </section>

      <h2 className="mt-8 flex items-center gap-2 text-2xl">
        <FileDown className="size-5 text-muted-foreground" aria-hidden />
        {params.label}
        {params.category && ` · ${categoryLabel(params.category)}`}
        <span className="text-base font-normal text-muted-foreground">
          · {rows.length === 1 ? "1 verified achievement" : `${rows.length} verified achievements`}
        </span>
      </h2>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed bg-card p-8 text-center text-muted-foreground">
          No verified achievements in this period yet. Verify posts on the{" "}
          <Link href="/faculty/review" className="text-primary underline-offset-4 hover:underline">
            review page
          </Link>{" "}
          first.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">No</th>
                <th className="px-3 py-2 font-medium">Student</th>
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Result</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Photos</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-2">
                    {r.student_name}
                    <span className="block font-mono text-xs text-muted-foreground">{r.roll_no}</span>
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/faculty/review/${r.id}`} className="hover:underline">{r.event_name}</Link>
                  </td>
                  <td className="px-3 py-2">{categoryLabel(r.category)}</td>
                  <td className="px-3 py-2">{resultLabel(r)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{dateRange(r.event_date, r.end_date)}</td>
                  <td className="px-3 py-2">{r.photo_paths.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
