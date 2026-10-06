import type { Metadata } from "next";
import { requireStudent } from "@/lib/session";
import { todayInIndia } from "@/lib/schemas";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = { title: "Add a win · CSE Spotlight" };

export default async function SubmitPage() {
  const student = await requireStudent();
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Add a win</h1>
      <p className="mt-2 text-muted-foreground">
        Posting as <span className="font-medium text-foreground">{student.name}</span> ({student.rollNo}). Your post goes
        live right away. Faculty check it later and can remove it if something is wrong.
      </p>
      <SubmitForm userId={student.userId} rollNo={student.rollNo} today={todayInIndia()} />
    </main>
  );
}
