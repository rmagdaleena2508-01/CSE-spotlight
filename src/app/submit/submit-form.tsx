"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch, type FieldError as RHFError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Star, Trash2, Upload, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ACHIEVEMENT_TYPES,
  CATEGORIES,
  FILE_RULES,
  LEVELS,
  NEEDS_WORK_TITLE,
  YEARS,
  achievementSchema,
  type AchievementInput,
} from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Bucket = keyof typeof FILE_RULES;

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

const choiceClass =
  "flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-sm has-checked:border-primary has-checked:bg-primary/5";

function Err({ error }: { error?: RHFError | { message?: string } }) {
  return error?.message ? <FieldError>{error.message}</FieldError> : null;
}

function FilePicker({
  bucket,
  label,
  hint,
  files,
  onChange,
  pickMain = false,
}: {
  bucket: Bucket;
  label: string;
  hint: string;
  files: File[];
  onChange: (files: File[]) => void;
  pickMain?: boolean;
}) {
  const rule = FILE_RULES[bucket];
  const [error, setError] = useState<string>();
  const inputId = `files-${bucket}`;
  const single = rule.max === 1;

  function add(list: FileList | null) {
    if (!list) return;
    // A single-file picker replaces what is there.
    const next = single ? [] : [...files];
    for (const f of Array.from(list)) {
      if (!(rule.types as readonly string[]).includes(f.type)) {
        setError(`${f.name}: use ${rule.label}.`);
        continue;
      }
      if (f.size > rule.maxBytes) {
        setError(`${f.name} is too big. ${rule.label}.`);
        continue;
      }
      if (next.length >= rule.max) {
        setError(single ? "Only one file here." : `You can add up to ${rule.max} files here.`);
        break;
      }
      next.push(f);
      setError(undefined);
    }
    onChange(next);
  }

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground hover:bg-muted"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          add(e.dataTransfer.files);
        }}
      >
        <Upload className="size-4" aria-hidden />
        {single ? "Choose a file or drop it here" : "Choose files or drop them here"}
      </label>
      <input
        id={inputId}
        type="file"
        multiple={!single}
        accept={rule.types.join(",")}
        // The field gives every child full width; keep this hidden input 1px so it cannot
        // stretch past the screen and make phones scroll sideways.
        className="sr-only !w-px"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
      <FieldDescription>{hint}</FieldDescription>
      {error && <FieldError>{error}</FieldError>}
      {files.length > 0 && (
        <ul className="space-y-1 text-sm">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 rounded-md border bg-card px-3 py-1.5">
              <span className="min-w-0 truncate">
                {f.name} <span className="text-muted-foreground">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                {pickMain &&
                  (i === 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                      <Star className="size-3.5 fill-current" aria-hidden /> Main photo
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => onChange([f, ...files.filter((_, j) => j !== i)])}
                    >
                      Make main
                    </Button>
                  ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => onChange(files.filter((_, j) => j !== i))}
                >
                  <X />
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Field>
  );
}

function extension(file: File) {
  return { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type] ?? "bin";
}

const optional = (v?: string) => (v && v.trim() ? v.trim() : null);

export function SubmitForm({
  userId,
  rollNo,
  today,
  lastClass,
}: {
  userId: string;
  rollNo: string;
  today: string;
  lastClass: { year: string; section: string };
}) {
  const router = useRouter();
  const [certificates, setCertificates] = useState<File[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [declared, setDeclared] = useState(false);
  const [status, setStatus] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AchievementInput>({
    resolver: zodResolver(achievementSchema),
    mode: "onBlur",
    defaultValues: {
      year_of_study: (YEARS as readonly string[]).includes(lastClass.year) ? (lastClass.year as AchievementInput["year_of_study"]) : undefined,
      section: lastClass.section,
      event_name: "",
      organizer: "",
      venue: "",
      event_date: "",
      end_date: "",
      result_type: "participation",
      participation_type: "individual",
      team_members: [],
      description: "",
      cash_prize: "",
      work_title: "",
      mentor: "",
      proof_url: "",
    },
  });
  const members = useFieldArray({ control, name: "team_members" });
  const resultType = useWatch({ control, name: "result_type" });
  const participationType = useWatch({ control, name: "participation_type" });
  const achievementType = useWatch({ control, name: "achievement_type" });
  const eventDate = useWatch({ control, name: "event_date" });
  const descriptionLength = useWatch({ control, name: "description" })?.length ?? 0;
  const needsTitle = (NEEDS_WORK_TITLE as readonly string[]).includes(achievementType ?? "");

  async function onSubmit(raw: AchievementInput) {
    setSubmitError(undefined);
    if (certificates.length !== 1) {
      setSubmitError("Add your certificate so faculty can check it.");
      return;
    }
    if (!declared) {
      setSubmitError("Tick the box to say the details are true.");
      return;
    }
    const v = achievementSchema.parse(raw);
    const supabase = createClient();
    const uploaded: { bucket: Bucket; path: string }[] = [];

    try {
      const all = [
        ...certificates.map((file) => ({ bucket: "certificates" as const, file })),
        ...photos.map((file) => ({ bucket: "photos" as const, file })),
      ];
      for (const [i, { bucket, file }] of all.entries()) {
        setStatus(`Uploading file ${i + 1} of ${all.length}…`);
        const path = `${userId}/${crypto.randomUUID()}.${extension(file)}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
        if (error) throw new Error(`Could not upload ${file.name}. Try again.`);
        uploaded.push({ bucket, path });
      }

      setStatus("Saving…");
      const isAward = v.result_type === "award";
      const isTeam = v.participation_type === "team";
      const { error } = await supabase.from("achievements").insert({
        roll_no: rollNo,
        year_of_study: v.year_of_study,
        section: v.section,
        achievement_type: v.achievement_type,
        event_name: v.event_name,
        organizer: v.organizer,
        venue: v.venue,
        event_date: v.event_date,
        end_date: optional(v.end_date),
        category: v.category,
        level: v.level,
        result_type: v.result_type,
        rank: isAward && v.rank ? Number(v.rank) : null,
        award_title: isAward && v.award_title ? v.award_title : null,
        cash_prize: optional(v.cash_prize) ? Number(v.cash_prize) : null,
        participation_type: v.participation_type,
        team_name: isTeam && v.team_name ? v.team_name : null,
        team_members: isTeam ? v.team_members : [],
        work_title: optional(v.work_title),
        mentor: optional(v.mentor),
        description: v.description,
        proof_url: optional(v.proof_url),
        certificate_paths: uploaded.filter((u) => u.bucket === "certificates").map((u) => u.path),
        // The first photo is the main one the newsletter team uses.
        photo_paths: uploaded.filter((u) => u.bucket === "photos").map((u) => u.path),
      });
      if (error) throw new Error("Could not save your post. Check the details and try again.");

      router.push("/dashboard?posted=1");
      router.refresh();
    } catch (e) {
      // Do not leave orphan files behind.
      for (const bucket of ["certificates", "photos"] as const) {
        const paths = uploaded.filter((u) => u.bucket === bucket).map((u) => u.path);
        if (paths.length) await supabase.storage.from(bucket).remove(paths);
      }
      setSubmitError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setStatus(undefined);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8" noValidate>
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Your class</FieldLegend>
          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!errors.year_of_study}>
              <FieldLabel htmlFor="year_of_study">Year</FieldLabel>
              <select
                id="year_of_study"
                className={selectClass}
                defaultValue={lastClass.year || ""}
                aria-invalid={!!errors.year_of_study}
                {...register("year_of_study")}
              >
                <option value="" disabled>Pick your year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y} year</option>
                ))}
              </select>
              <Err error={errors.year_of_study} />
            </Field>
            <Field data-invalid={!!errors.section}>
              <FieldLabel htmlFor="section">Section</FieldLabel>
              <Input id="section" placeholder="e.g. CSE B" aria-invalid={!!errors.section} {...register("section")} />
              <Err error={errors.section} />
            </Field>
          </div>
        </FieldSet>

        <FieldSet>
          <FieldLegend>The event</FieldLegend>
          <FieldGroup>
            <Field data-invalid={!!errors.achievement_type}>
              <FieldLabel htmlFor="achievement_type">What kind of achievement?</FieldLabel>
              <select
                id="achievement_type"
                className={selectClass}
                defaultValue=""
                aria-invalid={!!errors.achievement_type}
                {...register("achievement_type")}
              >
                <option value="" disabled>Pick one</option>
                {ACHIEVEMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <Err error={errors.achievement_type} />
            </Field>
            <Field data-invalid={!!errors.event_name}>
              <FieldLabel htmlFor="event_name">Event name</FieldLabel>
              <Input
                id="event_name"
                placeholder="e.g. Smart India Hackathon 2026"
                aria-invalid={!!errors.event_name}
                {...register("event_name")}
              />
              <Err error={errors.event_name} />
            </Field>
            {needsTitle && (
              <Field data-invalid={!!errors.work_title}>
                <FieldLabel htmlFor="work_title">Title of your paper, project or talk</FieldLabel>
                <Input
                  id="work_title"
                  placeholder="e.g. Crowd Counting Using Deep Learning"
                  aria-invalid={!!errors.work_title}
                  {...register("work_title")}
                />
                <Err error={errors.work_title} />
              </Field>
            )}
            <Field data-invalid={!!errors.organizer}>
              <FieldLabel htmlFor="organizer">Organized by</FieldLabel>
              <Input
                id="organizer"
                placeholder="e.g. Computer Society of India, Chennai Chapter"
                aria-invalid={!!errors.organizer}
                {...register("organizer")}
              />
              <Err error={errors.organizer} />
            </Field>
            <Field data-invalid={!!errors.venue}>
              <FieldLabel htmlFor="venue">Where was it held?</FieldLabel>
              <Input
                id="venue"
                placeholder="e.g. Rajalakshmi Engineering College, Chennai"
                aria-invalid={!!errors.venue}
                {...register("venue")}
              />
              <FieldDescription>College or place, and city. Write &quot;Online&quot; if it was online.</FieldDescription>
              <Err error={errors.venue} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.event_date}>
                <FieldLabel htmlFor="event_date">Date (or start date)</FieldLabel>
                <Input id="event_date" type="date" max={today} aria-invalid={!!errors.event_date} {...register("event_date")} />
                <Err error={errors.event_date} />
              </Field>
              <Field data-invalid={!!errors.end_date}>
                <FieldLabel htmlFor="end_date">End date (if more than one day)</FieldLabel>
                <Input
                  id="end_date"
                  type="date"
                  min={eventDate || undefined}
                  max={today}
                  aria-invalid={!!errors.end_date}
                  {...register("end_date")}
                />
                <Err error={errors.end_date} />
              </Field>
            </div>
            <Field data-invalid={!!errors.level}>
              <FieldLabel htmlFor="level">Level</FieldLabel>
              <select id="level" className={selectClass} defaultValue="" aria-invalid={!!errors.level} {...register("level")}>
                <option value="" disabled>Pick one</option>
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <Err error={errors.level} />
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSet data-invalid={!!errors.category}>
          <FieldLegend variant="label">Category</FieldLegend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((c) => (
              <label key={c.value} className={choiceClass}>
                <input type="radio" value={c.value} className="accent-primary" {...register("category")} />
                {c.label}
              </label>
            ))}
          </div>
          <Err error={errors.category} />
        </FieldSet>

        <FieldSet>
          <FieldLegend>The result</FieldLegend>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "participation", label: "I took part" },
                { value: "award", label: "I won / got an award" },
              ].map((o) => (
                <label key={o.value} className={choiceClass}>
                  <input type="radio" value={o.value} className="accent-primary" {...register("result_type")} />
                  {o.label}
                </label>
              ))}
            </div>
            {resultType === "award" && (
              <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                <Field data-invalid={!!errors.rank}>
                  <FieldLabel htmlFor="rank">Rank</FieldLabel>
                  <Input id="rank" inputMode="numeric" placeholder="e.g. 1" aria-invalid={!!errors.rank} {...register("rank")} />
                  <Err error={errors.rank} />
                </Field>
                <Field data-invalid={!!errors.award_title}>
                  <FieldLabel htmlFor="award_title">Or award title</FieldLabel>
                  <Input id="award_title" placeholder="e.g. Best Design Award" aria-invalid={!!errors.award_title} {...register("award_title")} />
                  <Err error={errors.award_title} />
                </Field>
              </div>
            )}
            <Field data-invalid={!!errors.cash_prize}>
              <FieldLabel htmlFor="cash_prize">Cash prize in rupees (optional)</FieldLabel>
              <Input id="cash_prize" inputMode="numeric" placeholder="e.g. 2000" aria-invalid={!!errors.cash_prize} {...register("cash_prize")} />
              <Err error={errors.cash_prize} />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "individual", label: "Just me" },
                { value: "team", label: "With a team" },
              ].map((o) => (
                <label key={o.value} className={choiceClass}>
                  <input type="radio" value={o.value} className="accent-primary" {...register("participation_type")} />
                  {o.label}
                </label>
              ))}
            </div>
            {participationType === "team" && (
              <div className="space-y-3 rounded-lg border bg-card p-4">
                <Field>
                  <FieldLabel htmlFor="team_name">Team name (optional)</FieldLabel>
                  <Input id="team_name" placeholder="e.g. Byte Me" {...register("team_name")} />
                </Field>
                <p className="text-sm font-medium">Other team members</p>
                {members.fields.map((m, i) => (
                  <div key={m.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-2">
                    <Field data-invalid={!!errors.team_members?.[i]?.name}>
                      <Input aria-label={`Member ${i + 1} name`} placeholder="Name" {...register(`team_members.${i}.name`)} />
                      <Err error={errors.team_members?.[i]?.name} />
                    </Field>
                    <Field data-invalid={!!errors.team_members?.[i]?.roll_no}>
                      <Input
                        aria-label={`Member ${i + 1} roll number`}
                        placeholder="Roll no. (optional)"
                        {...register(`team_members.${i}.roll_no`)}
                      />
                      <Err error={errors.team_members?.[i]?.roll_no} />
                    </Field>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove member ${i + 1}`} onClick={() => members.remove(i)}>
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={members.fields.length >= 20}
                  onClick={() => members.append({ name: "", roll_no: "" })}
                >
                  <Plus /> Add member
                </Button>
                <FieldDescription>Only names are shown on the site. Roll numbers stay private.</FieldDescription>
              </div>
            )}
            <Field data-invalid={!!errors.mentor}>
              <FieldLabel htmlFor="mentor">Faculty guide or mentor (optional)</FieldLabel>
              <Input id="mentor" placeholder="e.g. Dr. T. Anusha" aria-invalid={!!errors.mentor} {...register("mentor")} />
              <Err error={errors.mentor} />
            </Field>
          </FieldGroup>
        </FieldSet>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Tell us about it</FieldLabel>
          <Textarea
            id="description"
            rows={5}
            placeholder="What did you do, what was it like, and what did you learn? Write it in your own words, or draft it and polish it with ChatGPT so it still sounds like you."
            aria-invalid={!!errors.description}
            {...register("description")}
          />
          <FieldDescription>{descriptionLength}/1500 characters (at least 30)</FieldDescription>
          <Err error={errors.description} />
        </Field>

        <FieldSet>
          <FieldLegend>Proof and photos</FieldLegend>
          <FieldGroup>
            <FilePicker
              bucket="certificates"
              label="Certificate"
              hint="One file: PDF, JPG or PNG, up to 10 MB. Only faculty see it."
              files={certificates}
              onChange={setCertificates}
            />
            <FilePicker
              bucket="photos"
              label="Photos for the website (optional)"
              hint="Up to 5 photos: JPG, PNG or WebP, up to 5 MB each. Pick your best shots where you look good. The main photo goes on your card and in the newsletter."
              files={photos}
              onChange={setPhotos}
              pickMain
            />
            <Field data-invalid={!!errors.proof_url}>
              <FieldLabel htmlFor="proof_url">Proof link (optional)</FieldLabel>
              <Input
                id="proof_url"
                type="url"
                placeholder="e.g. https://www.linkedin.com/posts/… or a certificate verification link"
                aria-invalid={!!errors.proof_url}
                {...register("proof_url")}
              />
              <Err error={errors.proof_url} />
            </Field>
          </FieldGroup>
        </FieldSet>

        <Field orientation="horizontal">
          <Checkbox id="declare" checked={declared} onCheckedChange={(v) => setDeclared(v === true)} />
          <FieldLabel htmlFor="declare" className="font-normal">
            The details are true and the proof is mine.
          </FieldLabel>
        </Field>

        {submitError && (
          <Alert variant="destructive" aria-live="polite">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting} className={cn(isSubmitting && "cursor-wait")}>
          {isSubmitting ? status ?? "Posting…" : "Post it"}
        </Button>
        {isSubmitting && status && (
          <p role="status" className="sr-only">
            {status}
          </p>
        )}
      </FieldGroup>
    </form>
  );
}
