import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Flame, Heart, ThumbsUp } from "lucide-react";
import { CategoryPlaceholder } from "@/components/category-placeholder";
import { categoryLabel, formatDate, resultLabel } from "@/lib/labels";
import { photoUrl } from "@/lib/photos";
import type { PublicCard } from "@/lib/published";
import { cn } from "@/lib/utils";

export function AchievementCard({ a, className }: { a: PublicCard; className?: string }) {
  const photo = a.photo_paths[0];
  const isAward = a.result_type === "award";
  const reactions = a.like_count + a.heart_count + a.fire_count;

  return (
    <Link
      href={`/achievements/${a.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {photo ? (
          <Image
            src={photoUrl(photo)}
            alt={`${a.event_name}, posted by ${a.student_name}`}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02] motion-reduce:transition-none"
          />
        ) : (
          <CategoryPlaceholder category={a.category} className="size-full" />
        )}
        <span
          className={cn(
            "absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-medium",
            isAward ? "bg-gold-soft text-gold" : "bg-card/90 text-foreground",
          )}
        >
          {resultLabel(a)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {categoryLabel(a.category)} · {formatDate(a.event_date)}
        </p>
        <h3 className="line-clamp-2 font-medium leading-snug">{a.event_name}</h3>
        <p className="text-sm text-muted-foreground">
          {a.student_name}
          {a.participation_type === "team" && (a.team_name ? ` · Team ${a.team_name}` : " · Team")}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          {a.is_verified ? (
            <span className="inline-flex items-center gap-1 text-primary">
              <BadgeCheck className="size-4" aria-hidden /> Faculty verified
            </span>
          ) : (
            <span className="text-muted-foreground">Not checked yet</span>
          )}
          {reactions > 0 && (
            <span
              className="inline-flex items-center gap-2 text-muted-foreground"
              aria-label={`${a.like_count} likes, ${a.heart_count} hearts, ${a.fire_count} fires`}
            >
              <span className="inline-flex items-center gap-0.5"><ThumbsUp className="size-3.5" aria-hidden />{a.like_count}</span>
              <span className="inline-flex items-center gap-0.5"><Heart className="size-3.5" aria-hidden />{a.heart_count}</span>
              <span className="inline-flex items-center gap-0.5"><Flame className="size-3.5" aria-hidden />{a.fire_count}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
