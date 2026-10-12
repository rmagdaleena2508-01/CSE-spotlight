import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireFaculty } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { EditForm } from "./edit-form";

export const metadata: Metadata = { title: "Edit post · CSE Spotlight" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Faculty fix mistakes in a post. The student is told what changed.
export default async function EditPostPage({ params }: PageProps<"/faculty/review/[id]/edit">) {
  await requireFaculty();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const { data: a } = await supabase.from("achievements").select("*").eq("id", id).maybeSingle();
  if (!a) notFound();

  const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
  const initial = {
    year_of_study: s(a.year_of_study),
    section: s(a.section),
    achievement_type: s(a.achievement_type),
    event_name: s(a.event_name),
    organizer: s(a.organizer),
    venue: s(a.venue),
    event_date: s(a.event_date),
    end_date: s(a.end_date),
    category: s(a.category),
    level: s(a.level),
    result_type: s(a.result_type),
    rank: s(a.rank),
    award_title: s(a.award_title),
    cash_prize: s(a.cash_prize),
    work_title: s(a.work_title),
    mentor: s(a.mentor),
    description: s(a.description),
    proof_url: s(a.proof_url),
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href={`/faculty/review/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Back to the post
      </Link>
      <h1 className="mt-4 text-4xl">Edit post</h1>
      <p className="mt-1 text-muted-foreground">
        {a.student_name} · <span className="font-mono text-sm">{a.roll_no}</span>. Fix any mistakes, then save. The
        student is told what you changed.
      </p>
      <EditForm id={id} initial={initial} />
    </main>
  );
}
