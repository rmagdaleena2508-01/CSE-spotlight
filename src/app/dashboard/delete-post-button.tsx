"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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
import { deleteMyPost } from "./actions";

// Lets a student delete their own post. It asks first, because a deleted
// post cannot be brought back.
export function DeletePostButton({ id, eventName }: { id: string; eventName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, startDelete] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="ghost" aria-label={`Delete ${eventName}`} />}>
        <Trash2 aria-hidden /> Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this post?</DialogTitle>
          <DialogDescription>
            &ldquo;{eventName}&rdquo; will be taken off the site for good, with its certificate, photos, and cheers.
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
            Keep it
          </Button>
          <Button
            variant="destructive"
            disabled={deleting}
            onClick={() =>
              startDelete(async () => {
                const r = await deleteMyPost(id);
                if (r.error) {
                  toast.error(r.error);
                  return;
                }
                setOpen(false);
                toast.success("Deleted.");
                router.refresh();
              })
            }
          >
            <Trash2 aria-hidden /> {deleting ? "Deleting…" : "Delete for good"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
