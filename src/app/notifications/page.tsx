import type { Metadata } from "next";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireStudent } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { markAllRead, openNotification } from "./actions";

export const metadata: Metadata = { title: "Notifications · CSE Spotlight" };

function when(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
}

// A student's notifications, newest first. Unread ones are bright green with
// a dot; read ones are a soft, quiet green.
export default async function NotificationsPage() {
  await requireStudent();
  const supabase = await createClient();
  const { data: notes } = await supabase
    .from("notifications")
    .select("id, title, body, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(50);
  const unread = (notes ?? []).filter((n) => !n.read_at).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl sm:text-5xl">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            {unread ? `${unread} unread` : "You are all caught up."}
          </p>
        </div>
        {unread > 0 && (
          <form action={markAllRead}>
            <Button type="submit" variant="outline">
              <CheckCheck aria-hidden /> Mark all as read
            </Button>
          </form>
        )}
      </div>

      {!notes?.length ? (
        <div className="mt-10 flex flex-col items-center gap-2 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          <Bell className="size-6" aria-hidden />
          <p>No notifications yet. If faculty edit one of your posts, you will see it here.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {notes.map((n) => {
            const isNew = !n.read_at;
            return (
              <li key={n.id}>
                <form action={openNotification}>
                  <input type="hidden" name="id" value={n.id} />
                  <button
                    type="submit"
                    className={cn(
                      "lift w-full rounded-xl border p-4 text-left transition-colors",
                      isNew
                        ? "border-emerald-500 bg-emerald-100/70 hover:bg-emerald-100"
                        : "border-emerald-100 bg-emerald-50/40 text-muted-foreground hover:bg-emerald-50",
                    )}
                  >
                    <span className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", isNew ? "bg-emerald-600" : "bg-emerald-200")}
                      />
                      <span className="min-w-0 flex-1">
                        <span className={cn("block", isNew ? "font-semibold text-foreground" : "font-medium")}>
                          {isNew && <span className="sr-only">Unread: </span>}
                          {n.title}
                        </span>
                        <span className="mt-1 block text-sm whitespace-pre-line">{n.body}</span>
                        <span className="mt-2 block text-xs">{when(n.created_at)}</span>
                      </span>
                    </span>
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
