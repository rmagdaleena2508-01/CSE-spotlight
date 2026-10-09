"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Heart, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listReactors, react } from "@/lib/reactions/actions";
import { displayName, type ReactionKind, type Reactor } from "@/lib/reactions/kinds";
import { cn } from "@/lib/utils";

// Celebrate and Heart under a post, LinkedIn style.
// - One reaction per person: pick one, switch to the other, or tap again to take it back.
// - Under the buttons: "You and 12 others" or "R Priya and 12 others"; tap it to see everyone.
// - Logged out? Tapping a button opens a friendly prompt to log in. The chosen reaction is
//   remembered, and once they are back on this page logged in, it is added for them.

type Counts = Record<ReactionKind, number>;
type State = { mine: ReactionKind | null; counts: Counts };

const PENDING_KEY = "cse-spotlight:pending-reaction";
const PENDING_MAX_AGE = 30 * 60 * 1000;

const KINDS: { kind: ReactionKind; label: string; done: string; icon: typeof Heart; on: string }[] = [
  {
    kind: "celebrate",
    label: "Celebrate",
    done: "Celebrated",
    icon: PartyPopper,
    on: "border-amber-400 bg-amber-50 text-amber-700",
  },
  { kind: "heart", label: "Heart", done: "Loved", icon: Heart, on: "border-rose-400 bg-rose-50 text-rose-600" },
];

function toggle(state: State, kind: ReactionKind): State {
  const counts = { ...state.counts };
  if (state.mine) counts[state.mine] -= 1;
  if (state.mine === kind) return { mine: null, counts };
  counts[kind] += 1;
  return { mine: kind, counts };
}

function readPending(id: string): ReactionKind | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { id: string; kind: ReactionKind; at: number };
    if (p.id !== id) return null;
    sessionStorage.removeItem(PENDING_KEY);
    return Date.now() - p.at < PENDING_MAX_AGE ? p.kind : null;
  } catch {
    return null;
  }
}

function savePending(id: string, kind: ReactionKind) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ id, kind, at: Date.now() }));
  } catch {
    // Private mode: they will just need to tap again after logging in.
  }
}

function summary(state: State, latest: string | null) {
  const total = state.counts.celebrate + state.counts.heart;
  if (total === 0) return null;
  const others = (n: number) => `${n} ${n === 1 ? "other" : "others"}`;
  if (state.mine) return total === 1 ? "You" : `You and ${others(total - 1)}`;
  if (latest) return total === 1 ? displayName(latest) : `${displayName(latest)} and ${others(total - 1)}`;
  return `${total} ${total === 1 ? "cheer" : "cheers"}`;
}

export function ReactionBar({
  id,
  studentName,
  counts,
  mine,
  latest,
  signedIn,
  className,
}: {
  id: string;
  studentName: string;
  counts: Counts;
  mine: ReactionKind | null;
  latest: string | null;
  signedIn: boolean;
  className?: string;
}) {
  const [state, setOptimistic] = useOptimistic<State, ReactionKind>({ mine, counts }, toggle);
  const [pending, start] = useTransition();
  const [ask, setAsk] = useState<ReactionKind | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const router = useRouter();
  const name = displayName(studentName);

  const send = (kind: ReactionKind) =>
    start(async () => {
      setOptimistic(kind);
      const res = await react(id, kind);
      if (res.error) toast.error(res.error);
    });

  // Back from logging in: add the reaction they tried to give before.
  useEffect(() => {
    if (!signedIn) return;
    const kind = readPending(id);
    if (!kind || mine === kind) return;
    start(async () => {
      setOptimistic(kind);
      const res = await react(id, kind);
      if (res.error) toast.error(res.error);
      else toast.success(kind === "celebrate" ? `You celebrated ${name}'s win!` : `You sent ${name} some love!`);
    });
  }, [signedIn, id, mine, name, setOptimistic]);

  const onPress = (kind: ReactionKind) => {
    if (!signedIn) {
      setAsk(kind);
      return;
    }
    send(kind);
  };

  // Remember the cheer, then go to log in; afterwards come straight back to this post.
  const goLogin = (kind: ReactionKind, signup: boolean) => {
    savePending(id, kind);
    const here = `${location.pathname}${location.search}#post-${id}`;
    router.push(`/login?reason=react${signup ? "&signup=1" : ""}&next=${encodeURIComponent(here)}`);
  };
  const line = summary(state, latest);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {KINDS.map(({ kind, label, done, icon: Icon, on }) => {
          const active = state.mine === kind;
          return (
            <button
              key={kind}
              type="button"
              disabled={pending}
              aria-pressed={active}
              aria-label={`${active ? done : label}, ${state.counts[kind]}`}
              onClick={() => onPress(kind)}
              className={cn(
                "lift inline-flex h-10 items-center justify-center gap-1.5 rounded-full border bg-white px-3.5 text-sm font-medium disabled:cursor-wait",
                active ? on : "hover:bg-black/[0.03]",
              )}
            >
              <Icon className={cn("size-4", active && "fill-current")} aria-hidden />
              <span>{active ? done : label}</span>
              {state.counts[kind] > 0 && <span className="tabular-nums opacity-70">{state.counts[kind]}</span>}
            </button>
          );
        })}
      </div>

      {line ? (
        <button
          type="button"
          onClick={() => setListOpen(true)}
          className="flex w-fit items-center gap-1.5 text-left text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          <span className="flex -space-x-1" aria-hidden>
            {state.counts.celebrate > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-amber-100 ring-2 ring-white">
                <PartyPopper className="size-3 text-amber-700" />
              </span>
            )}
            {state.counts.heart > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-rose-100 ring-2 ring-white">
                <Heart className="size-3 fill-current text-rose-600" />
              </span>
            )}
          </span>
          {line}
        </button>
      ) : (
        <p className="text-xs text-muted-foreground">Be the first to cheer {name} on.</p>
      )}

      <LoginPrompt
        kind={ask}
        name={name}
        onClose={() => setAsk(null)}
        onGo={goLogin}
      />
      <ReactorList id={id} open={listOpen} onOpenChange={setListOpen} />
    </div>
  );
}

/** The friendly "log in first" prompt for visitors who press Celebrate or Heart. */
function LoginPrompt({
  kind,
  name,
  onClose,
  onGo,
}: {
  kind: ReactionKind | null;
  name: string;
  onClose: () => void;
  onGo: (kind: ReactionKind, signup: boolean) => void;
}) {
  const celebrate = kind !== "heart";
  const Icon = celebrate ? PartyPopper : Heart;
  return (
    <Dialog open={kind !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span
            className={cn(
              "mb-1 grid size-12 place-items-center rounded-full",
              celebrate ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-600",
            )}
            aria-hidden
          >
            <Icon className={cn("size-6", !celebrate && "fill-current")} />
          </span>
          <DialogTitle className="font-sans text-xl font-bold tracking-tight">
            {celebrate ? `Join the celebration for ${name}` : `Send ${name} some love`}
          </DialogTitle>
          <DialogDescription>
            {celebrate
              ? `Log in to celebrate this win. We'll hold on to your cheer, bring you right back here, and add it for you.`
              : `Log in to cheer ${name} on. We'll hold on to your heart, bring you right back here, and add it for you.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <button
            type="button"
            onClick={() => kind && onGo(kind, false)}
            className="lift inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            <Icon className={cn("size-4", !celebrate && "fill-current")} aria-hidden />
            {celebrate ? "Log in and celebrate" : "Log in and send love"}
          </button>
          <button
            type="button"
            onClick={() => kind && onGo(kind, true)}
            className="lift inline-flex h-11 w-full items-center justify-center rounded-full bg-white text-sm font-medium shadow-[inset_0_0_0_1px_rgb(0_0_0/0.18)]"
          >
            New here? Sign up with your roll number
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Maybe later
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Everyone who reacted, loaded when the list opens. */
function ReactorList({ id, open, onOpenChange }: { id: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [people, setPeople] = useState<Reactor[] | null>(null);

  useEffect(() => {
    if (!open) return;
    let live = true;
    listReactors(id).then((list) => live && setPeople(list));
    return () => {
      live = false;
    };
  }, [open, id]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setPeople(null);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-sans text-lg font-bold tracking-tight">Cheering them on</DialogTitle>
          <DialogDescription>Everyone who celebrated or loved this win.</DialogDescription>
        </DialogHeader>
        {people === null ? (
          <p className="py-4 text-sm text-muted-foreground">Loading…</p>
        ) : people.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No cheers yet.</p>
        ) : (
          <ul className="-mx-1 max-h-80 divide-y overflow-y-auto">
            {people.map((p, i) => (
              <li key={`${p.name}-${i}`} className="flex items-center gap-3 px-1 py-2.5">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full",
                    p.kind === "celebrate" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-600",
                  )}
                  aria-label={p.kind === "celebrate" ? "Celebrated" : "Loved"}
                >
                  {p.kind === "celebrate" ? <PartyPopper className="size-4" /> : <Heart className="size-4 fill-current" />}
                </span>
                <span className="flex-1 text-sm font-medium">{displayName(p.name)}</span>
                {p.isFaculty && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-xs">
                    <GraduationCap className="size-3.5" aria-hidden /> Faculty
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
