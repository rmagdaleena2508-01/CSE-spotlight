"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { removePost, verifyPost } from "../actions";

export function ReviewActions({ id, status, studentName }: { id: string; status: string; studentName: string }) {
  const router = useRouter();
  const [verifying, startVerify] = useTransition();
  const [removing, startRemove] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();

  if (status === "removed") return null;

  return (
    <div className="flex flex-wrap gap-2">
      {status === "live" && (
        <Button
          size="lg"
          disabled={verifying}
          onClick={() =>
            startVerify(async () => {
              const r = await verifyPost(id);
              if (r.error) toast.error(r.error);
              else {
                toast.success("Verified. The badge is now on the post.");
                router.push("/faculty/review");
              }
            })
          }
        >
          <BadgeCheck aria-hidden /> {verifying ? "Verifying…" : "Verify"}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button size="lg" variant="destructive" />}>
          <Trash2 aria-hidden /> Remove
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this post?</DialogTitle>
            <DialogDescription>
              It will be hidden from the site. {studentName} will see your reason on their page.
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="remove-reason">Reason</FieldLabel>
            <Textarea
              id="remove-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. The certificate is for a different event."
              aria-invalid={!!error}
            />
            <FieldDescription>Be clear so the student knows what to fix.</FieldDescription>
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={removing}
              onClick={() =>
                startRemove(async () => {
                  const r = await removePost(id, reason);
                  if (r.error) setError(r.error);
                  else {
                    setOpen(false);
                    toast.success("Removed. The student can see why.");
                    router.push("/faculty/review");
                  }
                })
              }
            >
              {removing ? "Removing…" : "Remove post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
