import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireFaculty } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PostEditForm } from "@/components/post-edit-form";
import { editValues } from "@/lib/post-edit";
import { editPost } from "./actions";

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
      <PostEditForm
        id={id}
        initial={editValues(a)}
        action={editPost}
        cancelHref={`/faculty/review/${id}`}
        submitLabel="Save and tell the student"
        withNote
      />
    </main>
  );
}
