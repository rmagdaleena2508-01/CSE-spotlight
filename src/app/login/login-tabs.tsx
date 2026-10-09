"use client";

import { useActionState, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { firstLogin, facultyLogin, studentLogin, type FormState } from "./actions";

// Secondary action with the same smooth lift as the hero buttons: it rises and a soft
// shadow spreads beneath on hover, eased over half a second; it sinks a touch when pressed.
const LIFT_LINK =
  "mt-1 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-sm font-medium text-foreground " +
  "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)] transition-[translate,scale,box-shadow,background-color] duration-500 " +
  "ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/5 " +
  "hover:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35),0_14px_28px_-14px_rgb(0_0_0/0.8)] active:translate-y-0 " +
  "active:scale-[0.98] active:duration-150 motion-reduce:transition-none";

function FormError({ state }: { state: FormState }) {
  if (!state?.error) return null;
  return (
    <Alert variant="destructive" aria-live="polite">
      <AlertDescription>{state.error}</AlertDescription>
    </Alert>
  );
}

function StudentLogin() {
  const [state, action, pending] = useActionState(studentLogin, undefined);
  return (
    <form action={action}>
      <FieldGroup>
        <FormError state={state} />
        <Field>
          <FieldLabel htmlFor="login-roll">Roll number</FieldLabel>
          <Input id="login-roll" name="roll_no" autoComplete="username" placeholder="RA2511003040001" defaultValue={state?.rollNo} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </Button>
      </FieldGroup>
    </form>
  );
}

function FirstTime() {
  const [state, action, pending] = useActionState(firstLogin, undefined);

  if (state?.step === "password" && state.rollNo) {
    return (
      <form action={action}>
        <FieldGroup>
          <FormError state={state} />
          <p className="text-sm">
            Found you, <span className="font-medium">{state.rollNo}</span>. Now make a password.
          </p>
          <input type="hidden" name="roll_no" value={state.rollNo} />
          <input type="hidden" name="name" value={state.name} />
          <Field>
            <FieldLabel htmlFor="new-password">New password</FieldLabel>
            <Input id="new-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
            <FieldDescription>At least 8 characters. Do not share it.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">Type it again</FieldLabel>
            <Input id="confirm-password" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? "Signing up…" : "Sign up and log in"}
          </Button>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form action={action}>
      <FieldGroup>
        <FormError state={state} />
        <Field>
          <FieldLabel htmlFor="first-roll">Roll number</FieldLabel>
          <Input id="first-roll" name="roll_no" placeholder="RA2511003040001" defaultValue={state?.rollNo} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="first-name">Your name</FieldLabel>
          <Input id="first-name" name="name" autoComplete="name" placeholder="e.g. R PRIYA" autoCapitalize="characters" defaultValue={state?.name} required />
          <FieldDescription>Write your name in CAPS, including the initial.</FieldDescription>
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Continue"}
        </Button>
      </FieldGroup>
    </form>
  );
}

function FacultyLogin() {
  const [state, action, pending] = useActionState(facultyLogin, undefined);
  return (
    <form action={action}>
      <FieldGroup>
        <FormError state={state} />
        <Field>
          <FieldLabel htmlFor="faculty-username">Username</FieldLabel>
          <Input id="faculty-username" name="username" autoComplete="username" defaultValue={state?.username} required />
        </Field>
        <Field>
          <FieldLabel htmlFor="faculty-password">Password</FieldLabel>
          <Input id="faculty-password" name="password" type="password" autoComplete="current-password" required />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </Button>
      </FieldGroup>
    </form>
  );
}

/** Student tab: log in, with a sign-up option for students who have not registered yet. */
function StudentPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  if (mode === "signup") {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl">Sign up</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Only students on the CSE class list can sign up. Enter your roll number and name, then make a password.
          </p>
        </div>
        <FirstTime />
        <button type="button" onClick={() => setMode("login")} className={LIFT_LINK}>
          Already signed up? Log in
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <StudentLogin />
      <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" /> New here? <span className="h-px flex-1 bg-border" />
      </div>
      <button type="button" onClick={() => setMode("signup")} className={LIFT_LINK}>
        Sign up
      </button>
    </div>
  );
}

export function LoginTabs({ initialTab }: { initialTab: "student" | "faculty" }) {
  return (
    <Tabs defaultValue={initialTab === "faculty" ? "faculty" : "student"} className="mt-6">
      <TabsList className="w-full">
        <TabsTrigger value="student">Student</TabsTrigger>
        <TabsTrigger value="faculty">Faculty</TabsTrigger>
      </TabsList>
      <Card className="mt-4">
        <CardContent>
          <TabsContent value="student">
            <StudentPanel />
          </TabsContent>
          <TabsContent value="faculty">
            <FacultyLogin />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
