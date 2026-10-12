"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ACHIEVEMENT_TYPES, CATEGORIES, LEVELS, YEARS } from "@/lib/schemas";
import { editPost } from "./actions";

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function EditForm({ id, initial }: { id: string; initial: Record<string, string> }) {
  const [state, action, pending] = useActionState(editPost, undefined);
  // After a failed save, show what was typed, not the old values.
  const val = (k: string) => state?.values?.[k] ?? initial[k] ?? "";

  const text = (k: string, label: string, props: React.ComponentProps<"input"> = {}) => (
    <Field>
      <FieldLabel htmlFor={k}>{label}</FieldLabel>
      <Input id={k} name={k} defaultValue={val(k)} {...props} />
    </Field>
  );
  const select = (k: string, label: string, options: readonly { value: string; label: string }[]) => (
    <Field>
      <FieldLabel htmlFor={k}>{label}</FieldLabel>
      <select id={k} name={k} defaultValue={val(k)} className={selectClass}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );

  return (
    <form action={action} key={state?.tries ?? 0} className="mt-8">
      <input type="hidden" name="id" value={id} />
      <FieldGroup>
        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {select("year_of_study", "Year", YEARS.map((y) => ({ value: y, label: `${y} year` })))}
          {text("section", "Section", { required: true })}
        </div>
        {select("achievement_type", "Kind of achievement", ACHIEVEMENT_TYPES)}
        {text("event_name", "Event name", { required: true })}
        {text("organizer", "Organizer", { required: true })}
        {text("venue", "Venue", { required: true })}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("event_date", "Event date", { type: "date", required: true })}
          {text("end_date", "End date (if more than one day)", { type: "date" })}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {select("category", "Category", CATEGORIES)}
          {select("level", "Level", LEVELS)}
        </div>
        {select("result_type", "Result", [
          { value: "participation", label: "Participation" },
          { value: "award", label: "Won an award" },
        ])}
        <div className="grid gap-4 sm:grid-cols-3">
          {text("rank", "Rank (for awards)", { inputMode: "numeric" })}
          {text("award_title", "Award title (for awards)")}
          {text("cash_prize", "Cash prize (Rs.)", { inputMode: "numeric" })}
        </div>
        {text("work_title", "Title of the paper, project or talk")}
        {text("mentor", "Guide")}
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" name="description" rows={6} defaultValue={val("description")} required />
        </Field>
        {text("proof_url", "Proof link", { type: "url", placeholder: "https://" })}
        <Field>
          <FieldLabel htmlFor="note">Note for the student (optional)</FieldLabel>
          <Textarea id="note" name="note" rows={2} maxLength={500} defaultValue={val("note")} placeholder="e.g. Fixed the event date from the certificate." />
          <FieldDescription>The student gets a notification listing what you changed, with this note.</FieldDescription>
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save and tell the student"}</Button>
          <Link href={`/faculty/review/${id}`} className={buttonVariants({ variant: "outline" })}>Cancel</Link>
        </div>
      </FieldGroup>
    </form>
  );
}
