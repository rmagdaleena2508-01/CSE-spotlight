import { Cpu, Mic, Palette, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const STYLE: Record<string, { icon: typeof Cpu; className: string }> = {
  technical: { icon: Cpu, className: "from-blue-100 to-blue-200 text-blue-700 dark:from-blue-950 dark:to-blue-900 dark:text-blue-300" },
  non_technical: { icon: Mic, className: "from-violet-100 to-violet-200 text-violet-700 dark:from-violet-950 dark:to-violet-900 dark:text-violet-300" },
  arts: { icon: Palette, className: "from-rose-100 to-rose-200 text-rose-700 dark:from-rose-950 dark:to-rose-900 dark:text-rose-300" },
  sports: { icon: Trophy, className: "from-emerald-100 to-emerald-200 text-emerald-700 dark:from-emerald-950 dark:to-emerald-900 dark:text-emerald-300" },
};

// Shown when a post has no photo.
export function CategoryPlaceholder({ category, className }: { category: string; className?: string }) {
  const { icon: Icon, className: tone } = STYLE[category] ?? STYLE.technical;
  return (
    <div className={cn("flex items-center justify-center bg-gradient-to-br", tone, className)} aria-hidden>
      <Icon className="size-10 opacity-70" strokeWidth={1.5} />
    </div>
  );
}
