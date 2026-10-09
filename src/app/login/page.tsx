import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";
import { LoginTabs } from "./login-tabs";

export const metadata: Metadata = { title: "Log in · CSE Spotlight" };

/** Only paths on this site; anything else is ignored. */
function safeNext(value: string | string[] | undefined) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "";
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { as, next: rawNext, signup, reason } = await searchParams;
  const next = safeNext(rawNext);

  const viewer = await getViewer();
  if (viewer) redirect(next || (viewer.kind === "student" ? "/dashboard" : "/faculty/review"));

  // Came from pressing Celebrate or Heart while logged out.
  const cheering = reason === "react";
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <h1 className="text-4xl sm:text-5xl">{cheering ? "Log in to cheer" : "Log in"}</h1>
      <p className="mt-2 text-muted-foreground">
        {cheering
          ? "Your cheer is saved. Log in and we'll send it the moment you're back on the post."
          : "Students use their roll number. Faculty use their username."}
      </p>
      <LoginTabs initialTab={as === "faculty" ? "faculty" : "student"} next={next} signup={signup === "1"} />
    </main>
  );
}
