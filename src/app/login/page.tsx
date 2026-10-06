import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";
import { LoginTabs } from "./login-tabs";

export const metadata: Metadata = { title: "Log in · CSE Spotlight" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const viewer = await getViewer();
  if (viewer?.kind === "student") redirect("/dashboard");
  if (viewer?.kind === "faculty") redirect("/faculty/roster");

  const { as } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-muted-foreground">Students use their roll number. Faculty use their username.</p>
      <LoginTabs initialTab={as === "faculty" ? "faculty" : "student"} />
    </main>
  );
}
