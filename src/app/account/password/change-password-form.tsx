"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/password-input";
import { changePassword } from "./actions";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);

  if (state?.done) {
    return (
      <p role="status" className="mt-8 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
        Your password is changed. Use the new one next time you log in. Any other device that was logged in has been
        logged out.
      </p>
    );
  }

  return (
    // The boxes empty themselves after every try, so a password never stays on the screen.
    <form action={action} className="mt-8">
      <FieldGroup>
        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="current-password">Current password</FieldLabel>
          <PasswordInput id="current-password" name="current" autoComplete="current-password" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="new-password">New password</FieldLabel>
          <PasswordInput id="new-password" name="password" autoComplete="new-password" minLength={8} maxLength={72} required />
          <FieldDescription>At least 8 characters. Do not share it, and do not reuse one from another site.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Type the new one again</FieldLabel>
          <PasswordInput id="confirm-password" name="confirm" autoComplete="new-password" minLength={8} maxLength={72} required />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Changing…" : "Change password"}
        </Button>
      </FieldGroup>
    </form>
  );
}
