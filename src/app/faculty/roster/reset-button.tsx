"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resetStudent } from "./actions";

export function ResetButton({ rollNo, name }: { rollNo: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Reset ${name}? They will need to log in again with roll number and name, then set a new password.`)) return;
        start(async () => {
          const { error } = await resetStudent(rollNo);
          if (error) toast.error(error);
          else toast.success(`${name} can now set a new password.`);
        });
      }}
    >
      {pending ? "Resetting…" : "Reset login"}
    </Button>
  );
}
