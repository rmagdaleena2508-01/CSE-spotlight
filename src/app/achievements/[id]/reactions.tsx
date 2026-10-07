"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { Flame, Heart, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { react } from "./actions";

type Kind = "like" | "heart" | "fire";
type State = { mine: Kind | null; counts: Record<Kind, number> };

const BUTTONS: { kind: Kind; label: string; icon: typeof Heart; on: string }[] = [
  { kind: "like", label: "Like", icon: ThumbsUp, on: "border-primary bg-primary/10 text-primary" },
  { kind: "heart", label: "Heart", icon: Heart, on: "border-rose-500 bg-rose-50 text-rose-600" },
  { kind: "fire", label: "Fire", icon: Flame, on: "border-orange-500 bg-orange-50 text-orange-600" },
];

function toggle(state: State, kind: Kind): State {
  const counts = { ...state.counts };
  if (state.mine) counts[state.mine] -= 1;
  if (state.mine === kind) return { mine: null, counts };
  counts[kind] += 1;
  return { mine: kind, counts };
}

export function Reactions({ id, initial, canReact }: { id: string; initial: State; canReact: boolean }) {
  const [state, setOptimistic] = useOptimistic(initial, toggle);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {BUTTONS.map(({ kind, label, icon: Icon, on }) => {
        const active = state.mine === kind;
        return (
          <button
            key={kind}
            type="button"
            disabled={!canReact || pending}
            aria-pressed={active}
            aria-label={`${label}, ${state.counts[kind]}`}
            onClick={() =>
              start(async () => {
                setOptimistic(kind);
                const { error } = await react(id, kind);
                if (error) toast.error(error);
              })
            }
            className={cn(
              "inline-flex h-11 min-w-20 items-center justify-center gap-1.5 rounded-full border bg-card px-4 text-sm font-medium transition-colors disabled:cursor-default",
              canReact && "hover:bg-muted",
              active && on,
            )}
          >
            <Icon className={cn("size-4", active && kind !== "like" && "fill-current")} aria-hidden />
            {state.counts[kind]}
          </button>
        );
      })}
      {!canReact && (
        <Link href="/login" className="text-sm text-primary underline-offset-4 hover:underline">
          Log in as a student to react
        </Link>
      )}
    </div>
  );
}
