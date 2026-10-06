"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch, type FieldError as RHFError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Upload, X } from "lucide-react";
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
import { CATEGORIES, FILE_RULES, LEVELS, achievementSchema, type AchievementInput } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";

type Bucket = keyof typeof FILE_RULES;

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

function Err({ error }: { error?: RHFError | { message?: string } }) {
  return error?.message ? <FieldError>{error.message}</FieldError> : null;
}

function FilePicker({
  bucket,
  label,
  files,
  onChange,
}: {
  bucket: Bucket;
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const rule = FILE_RULES[bucket];
  const [error, setError] = useState<string>();
  const inputId = `files-${bucket}`;

  function add(list: FileList | null) {
    if (!list) return;
    const next = [...files];
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
        setError(`You can add up to ${rule.max} files here.`);
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
        Choose files or drop them here
      </label>
      <input
        id={inputId}
        type="file"
        multiple
        accept={rule.types.join(",")}
        className="sr-only"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
      <FieldDescription>
        Up to {rule.max}. {rule.label}.
      </FieldDescription>
      {error && <FieldError>{error}</FieldError>}
      {files.length > 0 && (
        <ul className="space-y-1 text-sm">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-md border bg-card px-3 py-1.5">
              <span className="truncate">
                {f.name} <span className="text-muted-foreground">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${f.name}`}
                onClick={() => onChange(files.filter((_, j) => j !== i))}
              >
                <X />
              </Button>
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

export function SubmitForm({ userId, rollNo, today }: { userId: string; rollNo: string; today: string }) {
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
      event_name: "",
      organizer: "",
      event_date: "",
      result_type: "participation",
      participation_type: "individual",
      team_members: [],
      description: "",
    },
  });
  const members = useFieldArray({ control, name: "team_members" });
  const resultType = useWatch({ control, name: "result_type" });
  const participationType = useWatch({ control, name: "participation_type" });
  const descriptionLength = useWatch({ control, name: "description" })?.length ?? 0;

  async function onSubmit(raw: AchievementInput) {
    setSubmitError(undefined);
    if (certificates.length + photos.length === 0) {
      setSubmitError("Add at least one certificate or photo so faculty can check it.");
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
        event_name: v.event_name,
        organizer: v.organizer,
        event_date: v.event_date,
        category: v.category,
        level: v.level,
        result_type: v.result_type,
        rank: isAward && v.rank ? Number(v.rank) : null,
        award_title: isAward && v.award_title ? v.award_title : null,
        participation_type: v.participation_type,
        team_name: isTeam && v.team_name ? v.team_name : null,
        team_members: isTeam ? v.team_members : [],
        description: v.description,
        certificate_paths: uploaded.filter((u) => u.bucket === "certificates").map((u) => u.path),
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
          <FieldLegend>The event</FieldLegend>
          <FieldGroup>
            <Field data-invalid={!!errors.event_name}>
              <FieldLabel htmlFor="event_name">Event name</FieldLabel>
              <Input id="event_name" aria-invalid={!!errors.event_name} {...register("event_name")} />
              <Err error={errors.event_name} />
            </Field>
            <Field data-invalid={!!errors.organizer}>
              <FieldLabel htmlFor="organizer">Organized by</FieldLabel>
              <Input id="organizer" placeholder="College, club or company" aria-invalid={!!errors.organizer} {...register("organizer")} />
              <Err error={errors.organizer} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.event_date}>
                <FieldLabel htmlFor="event_date">Event date</FieldLabel>
                <Input id="event_date" type="date" max={today} aria-invalid={!!errors.event_date} {...register("event_date")} />
                <Err error={errors.event_date} />
              </Field>
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
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet data-invalid={!!errors.category}>
          <FieldLegend variant="label">Category</FieldLegend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIES.map((c) => (
              <label
                key={c.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-sm has-checked:border-primary has-checked:bg-primary/5"
              >
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
                <label
                  key={o.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-sm has-checked:border-primary has-checked:bg-primary/5"
                >
                  <input type="radio" value={o.value} className="accent-primary" {...register("result_type")} />
                  {o.label}
                </label>
              ))}
            </div>
            {resultType === "award" && (
              <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                <Field data-invalid={!!errors.rank}>
                  <FieldLabel htmlFor="rank">Rank</FieldLabel>
                  <Input id="rank" inputMode="numeric" placeholder="1" aria-invalid={!!errors.rank} {...register("rank")} />
                  <Err error={errors.rank} />
                </Field>
                <Field data-invalid={!!errors.award_title}>
                  <FieldLabel htmlFor="award_title">Or award title</FieldLabel>
                  <Input id="award_title" placeholder="Best Design Award" aria-invalid={!!errors.award_title} {...register("award_title")} />
                  <Err error={errors.award_title} />
                </Field>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "individual", label: "Just me" },
                { value: "team", label: "With a team" },
              ].map((o) => (
                <label
                  key={o.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-sm has-checked:border-primary has-checked:bg-primary/5"
                >
                  <input type="radio" value={o.value} className="accent-primary" {...register("participation_type")} />
                  {o.label}
                </label>
              ))}
            </div>
            {participationType === "team" && (
              <div className="space-y-3 rounded-lg border bg-card p-4">
                <Field>
                  <FieldLabel htmlFor="team_name">Team name (optional)</FieldLabel>
                  <Input id="team_name" {...register("team_name")} />
                </Field>
                <p className="text-sm font-medium">Other team members</p>
                {members.fields.map((m, i) => (
                  <div key={m.id} className="grid grid-cols-[1fr_1fr_auto] items-start gap-2">
                    <Field data-invalid={!!errors.team_members?.[i]?.name}>
                      <Input aria-label={`Member ${i + 1} name`} placeholder="Name" {...register(`team_members.${i}.name`)} />
                      <Err error={errors.team_members?.[i]?.name} />
                    </Field>
                    <Field data-invalid={!!errors.team_members?.[i]?.roll_no}>
                      <Input aria-label={`Member ${i + 1} roll number`} placeholder="Roll no. (optional)" {...register(`team_members.${i}.roll_no`)} />
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
          </FieldGroup>
        </FieldSet>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Tell us about it</FieldLabel>
          <Textarea id="description" rows={5} aria-invalid={!!errors.description} {...register("description")} />
          <FieldDescription>
            What did you do and what did you learn? {descriptionLength}/1500 (at least 30)
          </FieldDescription>
          <Err error={errors.description} />
        </Field>

        <FieldSet>
          <FieldLegend>Proof and photos</FieldLegend>
          <FieldDescription>Add at least one certificate or photo. Certificates stay private; only faculty see them.</FieldDescription>
          <FieldGroup>
            <FilePicker bucket="certificates" label="Certificates" files={certificates} onChange={setCertificates} />
            <FilePicker bucket="photos" label="Photos for the website" files={photos} onChange={setPhotos} />
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

        <Button type="submit" size="lg" disabled={isSubmitting}>
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
