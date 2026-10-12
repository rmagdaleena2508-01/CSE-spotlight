import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostEditForm } from "@/components/post-edit-form";
import { editValues, STUDENT_EDIT_MONTHS, studentCanEdit } from "@/lib/post-edit";
import { requireStudent } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { editMyPost } from "./actions";

export const metadata: Metadata = { title: "Edit my post · CSE Spotlight" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A student edits their own post while it waits for faculty, up to 2 months after posting.
export default async function EditMyPostPage({ params }: PageProps<"/dashboard/edit/[id]">) {
  const student = await requireStudent();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const { data: a } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", id)
    .eq("roll_no", student.rollNo)
    .maybeSingle();
  if (!a) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Back to my posts
      </Link>
      <h1 className="mt-4 text-4xl">Edit my post</h1>
      {studentCanEdit(a) ? (
        <>
          <p className="mt-1 text-muted-foreground">
            You can change your post while faculty have not checked it yet, for up to {STUDENT_EDIT_MONTHS} months
            after posting. Photos and the certificate stay as they are.
          </p>
          <PostEditForm
            id={id}
            initial={editValues(a)}
            action={editMyPost}
            cancelHref="/dashboard"
            submitLabel="Save changes"
          />
        </>
      ) : (
        <p className="mt-4 rounded-lg border bg-muted/40 p-4 text-sm">
          This post is locked. Posts can be edited only while faculty have not checked them, and only for{" "}
          {STUDENT_EDIT_MONTHS} months after posting. If something is wrong, ask a faculty member to fix it.
        </p>
      )}
    </main>
  );
}
