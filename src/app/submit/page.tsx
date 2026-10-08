import type { Metadata } from "next";
import { requireStudent } from "@/lib/session";
import { todayInIndia } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = { title: "Add a win · CSE Spotlight" };

export default async function SubmitPage() {
  const student = await requireStudent();
  // Fill year and section from the student's last post, so they type it once.
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("achievements")
    .select("year_of_study, section")
    .eq("roll_no", student.rollNo)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">Add a win</h1>
      <p className="mt-2 text-muted-foreground">
        Posting as <span className="font-medium text-foreground">{student.name}</span> ({student.rollNo}). Your post goes
        live right away. Faculty check it later and can remove it if something is wrong.
      </p>
      <SubmitForm
        userId={student.userId}
        rollNo={student.rollNo}
        today={todayInIndia()}
        lastClass={{ year: last?.year_of_study ?? "", section: last?.section ?? "" }}
      />
    </main>
  );
}
