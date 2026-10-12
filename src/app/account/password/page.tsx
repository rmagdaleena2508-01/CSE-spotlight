import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = { title: "Change password · CSE Spotlight" };

export default async function ChangePasswordPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/account/password");

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <h1 className="text-4xl sm:text-5xl">Change password</h1>
      <p className="mt-2 text-muted-foreground">
        Type your current password first, then the new one. Other devices will be logged out.
      </p>
      <ChangePasswordForm />
    </main>
  );
}
