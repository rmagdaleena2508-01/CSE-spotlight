import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { categoryLabel, dateRange, levelLabel, resultLabel, rupees, typeLabel } from "@/lib/labels";
import { CATEGORIES } from "@/lib/schemas";
import { photoFileNames, type ReportRow } from "./data";
import type { ReportParams } from "./params";

// A plain, easy-to-copy list for the newsletter design team. Styling is kept
// simple on purpose; the final layout happens in Canva.

const ORANGE = "#c2410c";
const INK = "#1c1917";
const MUTED = "#57534e";
const LINE = "#e7e1d5";

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40, fontSize: 9.5, color: INK, fontFamily: "Helvetica" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  logo: { width: 138 },
  headerText: { marginLeft: "auto", alignItems: "flex-end" },
  dept: { fontSize: 9, color: MUTED },
  title: { fontSize: 18, fontWeight: "bold", color: ORANGE, marginTop: 2 },
  period: { fontSize: 11, fontWeight: "bold", marginTop: 2 },
  meta: { fontSize: 8, color: MUTED, marginTop: 3 },
  summary: { flexDirection: "row", gap: 8, marginBottom: 14 },
  stat: { flex: 1, borderWidth: 1, borderColor: LINE, borderRadius: 4, padding: 8 },
  statNum: { fontSize: 16, fontWeight: "bold" },
  statLabel: { fontSize: 8, color: MUTED },
  section: { fontSize: 13, fontWeight: "bold", color: ORANGE, marginTop: 10, marginBottom: 6 },
  entry: { borderWidth: 1, borderColor: LINE, borderRadius: 4, padding: 10, marginBottom: 8 },
  entryHead: { flexDirection: "row", marginBottom: 4 },
  num: { width: 26, fontWeight: "bold", color: ORANGE, fontSize: 11 },
  event: { flex: 1, fontWeight: "bold", fontSize: 11 },
  who: { marginLeft: 26, marginBottom: 6, color: MUTED },
  row: { flexDirection: "row", marginLeft: 26, marginBottom: 2 },
  key: { width: 82, color: MUTED },
  val: { flex: 1 },
  desc: { marginLeft: 26, marginTop: 5, lineHeight: 1.4 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", fontSize: 8, color: MUTED },
  empty: { marginTop: 30, textAlign: "center", color: MUTED },
});

function Field({ k, v }: { k: string; v: string | null | undefined }) {
  if (!v) return null;
  return (
    <View style={s.row}>
      <Text style={s.key}>{k}</Text>
      <Text style={s.val}>{v}</Text>
    </View>
  );
}

function Entry({ row, n }: { row: ReportRow; n: number }) {
  const photos = photoFileNames(row, n);
  const team =
    row.participation_type === "team"
      ? [row.team_name && `Team "${row.team_name}"`, ...row.team_members.map((m) => (m.roll_no ? `${m.name} (${m.roll_no})` : m.name))]
          .filter(Boolean)
          .join(", ") || "Team"
      : null;
  return (
    <View style={s.entry}>
      <View style={s.entryHead}>
        <Text style={s.num}>{n}.</Text>
        <Text style={s.event}>{row.event_name}</Text>
      </View>
      <Text style={s.who}>
        {row.student_name} · {row.roll_no}
        {row.year_of_study || row.section ? ` · ${[row.year_of_study && `${row.year_of_study} year`, row.section].filter(Boolean).join(" ")}` : ""}
      </Text>
      <Field k="Type" v={typeLabel(row.achievement_type)} />
      <Field k="Title" v={row.work_title} />
      <Field k="Result" v={resultLabel(row)} />
      <Field k="Cash prize" v={row.cash_prize ? rupees(row.cash_prize) : null} />
      <Field k="Date" v={dateRange(row.event_date, row.end_date)} />
      <Field k="Organized by" v={row.organizer} />
      <Field k="Held at" v={row.venue} />
      <Field k="Level" v={levelLabel(row.level)} />
      <Field k="Team" v={team} />
      <Field k="Guide" v={row.mentor} />
      <Field k="Photos" v={photos.length ? photos.map((p) => p.name).join(", ") : "No photo"} />
      <Text style={s.desc}>{row.description}</Text>
    </View>
  );
}

function ReportDocument({
  rows,
  params,
  logo,
  generatedBy,
}: {
  rows: ReportRow[];
  params: ReportParams;
  logo: Buffer;
  generatedBy: string;
}) {
  const generated = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  const counts = CATEGORIES.map((c) => ({ ...c, n: rows.filter((r) => r.category === c.value).length }));
  const wins = rows.filter((r) => r.result_type === "award").length;
  // Rows arrive sorted by category, so the position is the entry number used in the CSV and ZIP too.
  const entryNo = new Map(rows.map((r, i) => [r.id, i + 1]));

  return (
    <Document title={`Student Achievements ${params.label}`} author="CSE Spotlight">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
          <Image src={logo} style={s.logo} />
          <View style={s.headerText}>
            <Text style={s.dept}>Dept. Of Computer Science & Engineering, SRMIST VDP</Text>
            <Text style={s.title}>Student Achievements</Text>
            <Text style={s.period}>
              {params.label}
              {params.category ? ` · ${categoryLabel(params.category)}` : ""}
            </Text>
            <Text style={s.meta}>
              Faculty-verified entries · generated by {generatedBy} on {generated}
            </Text>
          </View>
        </View>

        <View style={s.summary}>
          <View style={s.stat}>
            <Text style={s.statNum}>{rows.length}</Text>
            <Text style={s.statLabel}>Achievements</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statNum}>{wins}</Text>
            <Text style={s.statLabel}>Wins / awards</Text>
          </View>
          {counts.map((c) => (
            <View key={c.value} style={s.stat}>
              <Text style={s.statNum}>{c.n}</Text>
              <Text style={s.statLabel}>{c.label}</Text>
            </View>
          ))}
        </View>

        {rows.length === 0 && <Text style={s.empty}>No verified achievements in this period.</Text>}

        {counts
          .filter((c) => c.n > 0)
          .map((c) => (
            <View key={c.value}>
              {rows
                .filter((r) => r.category === c.value)
                .map((r, i) => (
                  // The category heading travels with its first entry, so it is never left alone at a page end.
                  <View key={r.id} wrap={false}>
                    {i === 0 && <Text style={s.section}>{c.label}</Text>}
                    <Entry row={r} n={entryNo.get(r.id)!} />
                  </View>
                ))}
            </View>
          ))}

        <View style={s.footer} fixed>
          <Text>CSE Spotlight · Student Achievements · {params.label}</Text>
          <Text style={{ marginLeft: "auto" }} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderReportPdf(rows: ReportRow[], params: ReportParams, generatedBy: string) {
  // The same SRM Vadapalani logo as the website, at a size that stays sharp in print.
  const logo = await readFile(path.join(process.cwd(), "public/brand/srm-vadapalani-logo-clear.png"));
  return renderToBuffer(<ReportDocument rows={rows} params={params} logo={logo} generatedBy={generatedBy} />);
}
