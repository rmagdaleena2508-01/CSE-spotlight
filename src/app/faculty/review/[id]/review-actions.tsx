"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Pencil, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { deletePostForGood, removePost, verifyPost } from "../actions";

export function ReviewActions({ id, status, studentName }: { id: string; status: string; studentName: string }) {
  const router = useRouter();
  const [verifying, startVerify] = useTransition();
  const [removing, startRemove] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "removed" && (
        <>
          <Link href={`/faculty/review/${id}/edit`} className={buttonVariants({ size: "lg", variant: "outline" })}>
            <Pencil aria-hidden /> Edit
          </Link>
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
              <XCircle aria-hidden /> Remove
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
        </>
      )}
      <DeleteForGood id={id} studentName={studentName} />
    </div>
  );
}

// Deletes the post and its files for good. Faculty can do this at any time,
// even for old posts the student can no longer edit.
function DeleteForGood({ id, studentName }: { id: string; studentName: string }) {
  const router = useRouter();
  const [deleting, startDelete] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" variant="destructive" />}>
        <Trash2 aria-hidden /> Delete for good
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this post for good?</DialogTitle>
          <DialogDescription>
            The post, its certificate, photos and cheers are deleted and cannot be brought back. {studentName} gets a
            notification with your reason.
          </DialogDescription>
        </DialogHeader>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="delete-reason">Reason</FieldLabel>
          <Textarea
            id="delete-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. This was posted twice."
            aria-invalid={!!error}
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={deleting}
            onClick={() =>
              startDelete(async () => {
                const r = await deletePostForGood(id, reason);
                if (r.error) setError(r.error);
                else {
                  setOpen(false);
                  toast.success("Deleted. The student was told why.");
                  router.push("/faculty/review");
                }
              })
            }
          >
            {deleting ? "Deleting…" : "Delete for good"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
