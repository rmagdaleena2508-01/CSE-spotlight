"use client";

import { useActionState, useState, useTransition } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { importRoster, previewRoster, type ImportResult } from "./actions";

export function RosterUpload() {
  const [state, action, reading] = useActionState(previewRoster, undefined);
  const [saving, startSave] = useTransition();
  const [result, setResult] = useState<ImportResult & { from?: string }>();
  const preview = state?.preview;
  const showPreview = preview && result?.from !== state?.fileName;

  return (
    <Card className="mt-6">
      <CardContent className="space-y-4">
        <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field className="flex-1">
            <FieldLabel htmlFor="roster-file">Class Excel file</FieldLabel>
            <Input id="roster-file" name="file" type="file" accept=".xlsx,.xls" required />
          </Field>
          <Button type="submit" variant="outline" disabled={reading}>
            {reading ? "Reading…" : "Check file"}
          </Button>
        </form>

        {state?.error && (
          <Alert variant="destructive" aria-live="polite">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {showPreview && (
          <div className="space-y-3 rounded-lg border bg-background p-4 text-sm" aria-live="polite">
            <p>
              <span className="font-medium">{state.fileName}</span>: {preview.rows.length} students found.
              {preview.duplicates.length > 0 && ` ${preview.duplicates.length} repeated, skipped.`}
              {preview.invalid.length > 0 && ` ${preview.invalid.length} rows have a bad roll number, skipped.`}
            </p>
            {preview.invalid.length > 0 && (
              <p className="text-muted-foreground">
                Bad rows: {preview.invalid.slice(0, 10).map((i) => `line ${i.line} (${i.value})`).join(", ")}
                {preview.invalid.length > 10 && "…"}
              </p>
            )}
            <ul className="max-h-48 overflow-y-auto rounded-md border bg-card px-3 py-2 font-mono text-xs">
              {preview.rows.slice(0, 8).map((r) => (
                <li key={r.roll_no}>
                  {r.roll_no} {r.name}
                </li>
              ))}
              {preview.rows.length > 8 && <li className="text-muted-foreground">…and {preview.rows.length - 8} more</li>}
            </ul>
            <Button
              disabled={saving}
              onClick={() =>
                startSave(async () => {
                  const r = await importRoster(preview.rows);
                  setResult({ ...r, from: state.fileName });
                })
              }
            >
              {saving ? "Saving…" : `Save ${preview.rows.length} students`}
            </Button>
          </div>
        )}

        {result && (
          <Alert variant={result.error ? "destructive" : "default"} aria-live="polite">
            <AlertDescription>
              {result.error ?? `Saved. ${result.added} new, ${result.updated} changed, ${result.invalid} skipped. Students already on the list and unchanged were left alone.`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
