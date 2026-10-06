"use client";

import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { firstLogin, facultyLogin, studentLogin, type FormState } from "./actions";

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
            {pending ? "Saving…" : "Save password and log in"}
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
          <Input id="first-name" name="name" autoComplete="name" defaultValue={state?.name} required />
          <FieldDescription>As it is on the class list. Dots and word order do not matter.</FieldDescription>
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

export function LoginTabs({ initialTab }: { initialTab: "student" | "faculty" }) {
  return (
    <Tabs defaultValue={initialTab === "faculty" ? "faculty" : "login"} className="mt-6">
      <TabsList className="w-full">
        <TabsTrigger value="login">Student</TabsTrigger>
        <TabsTrigger value="first">First time</TabsTrigger>
        <TabsTrigger value="faculty">Faculty</TabsTrigger>
      </TabsList>
      <Card className="mt-4">
        <CardContent>
          <TabsContent value="login">
            <StudentLogin />
          </TabsContent>
          <TabsContent value="first">
            <FirstTime />
          </TabsContent>
          <TabsContent value="faculty">
            <FacultyLogin />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
