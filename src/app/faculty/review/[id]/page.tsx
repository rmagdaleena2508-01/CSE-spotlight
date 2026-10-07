import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryLabel, formatDate, levelLabel, resultLabel } from "@/lib/labels";
import { photoUrl } from "@/lib/photos";
import { requireFaculty } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ReviewActions } from "./review-actions";

export const metadata: Metadata = { title: "Check post · CSE Spotlight" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ReviewPostPage({ params }: PageProps<"/faculty/review/[id]">) {
  await requireFaculty();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const { data: a } = await supabase.from("achievements").select("*").eq("id", id).maybeSingle();
  if (!a) notFound();

  // Short-lived links: certificates are private, so each view gets a fresh 5-minute link.
  const { data: signed } = a.certificate_paths.length
    ? await supabase.storage.from("certificates").createSignedUrls(a.certificate_paths, 300)
    : { data: [] };
  const certificates = (signed ?? []).flatMap((s) => (s.signedUrl ? [{ path: s.path ?? "", url: s.signedUrl }] : []));
  const members: { name: string; roll_no: string }[] = a.team_members ?? [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/faculty/review" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Back to review list
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant={a.status === "verified" ? "default" : a.status === "removed" ? "destructive" : "secondary"}>
            {a.status === "live" ? "Waiting for you" : a.status === "verified" ? "Verified" : "Removed"}
          </Badge>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{a.event_name}</h1>
          <p className="mt-1 text-muted-foreground">
            {a.student_name} · <span className="font-mono text-sm">{a.roll_no}</span>
          </p>
        </div>
        <ReviewActions id={a.id} status={a.status} studentName={a.student_name} />
      </div>

      {a.status === "removed" && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          Removed on {new Date(a.removed_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}. Reason: {a.remove_reason}
        </p>
      )}
      {a.status === "verified" && (
        <p className="mt-4 text-sm text-muted-foreground">
          Verified on {new Date(a.verified_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}.
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="details">
          <h2 id="details" className="text-xl font-semibold">What they posted</h2>
          <dl className="mt-3 divide-y rounded-xl border bg-card text-sm">
            {[
              ["Organizer", a.organizer],
              ["Event date", formatDate(a.event_date)],
              ["Category", categoryLabel(a.category)],
              ["Level", levelLabel(a.level)],
              ["Result", resultLabel(a)],
              ["Took part", a.participation_type === "team" ? `Team${a.team_name ? ` "${a.team_name}"` : ""}` : "Alone"],
              ["Posted", new Date(a.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2 px-4 py-2.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="col-span-2 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          {members.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium">Team members</h3>
              <ul className="mt-1 text-sm">
                {members.map((m, i) => (
                  <li key={i}>
                    {m.name} {m.roll_no && <span className="font-mono text-xs text-muted-foreground">{m.roll_no}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <h3 className="mt-4 text-sm font-medium">Description</h3>
          <p className="mt-1 text-sm leading-relaxed whitespace-pre-line">{a.description}</p>
        </section>

        <section aria-labelledby="proof">
          <h2 id="proof" className="text-xl font-semibold">Proof</h2>
          {certificates.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No certificate. Check the photos below.</p>}
          <ul className="mt-3 space-y-4">
            {certificates.map((c, i) => {
              const isPdf = c.path.endsWith(".pdf");
              return (
                <li key={c.path} className="overflow-hidden rounded-xl border bg-card">
                  {isPdf ? (
                    <iframe src={c.url} title={`Certificate ${i + 1}`} className="h-96 w-full" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- private signed link, not for the image optimizer
                    <img src={c.url} alt={`Certificate ${i + 1}`} className="w-full" />
                  )}
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 border-t px-3 py-2 text-sm text-primary hover:bg-muted"
                  >
                    <FileText className="size-4" aria-hidden /> Open certificate {i + 1} in a new tab
                  </a>
                </li>
              );
            })}
          </ul>
          {a.photo_paths.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-medium">Photos</h3>
              <ul className="mt-2 grid grid-cols-2 gap-2">
                {a.photo_paths.map((p: string, i: number) => (
                  <li key={p}>
                    <a href={photoUrl(p)} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element -- small review thumbnails */}
                      <img src={photoUrl(p)} alt={`Photo ${i + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover" />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
