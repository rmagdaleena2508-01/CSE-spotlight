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
        "group flex flex-col rounded-[22px] bg-white p-2.5 text-[#080809] transition-transform duration-200 hover:-translate-y-1 hover:-rotate-1 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:transform-none",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-neutral-900">
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
            isAward ? "bg-[#fbbf24] text-[#080809]" : "bg-white text-[#080809]",
          )}
        >
          {resultLabel(a)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-2 pt-3 pb-1.5">
        <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
          {categoryLabel(a.category)} · {formatDate(a.event_date)}
        </p>
        <h3 className="line-clamp-2 text-lg leading-snug font-bold">{a.event_name}</h3>
        <p className="text-sm text-neutral-600">
          {a.student_name}
          {a.participation_type === "team" && (a.team_name ? ` · Team ${a.team_name}` : " · Team")}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          {a.is_verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#aef96c] px-2 py-0.5 text-xs font-bold text-[#080809]">
              <BadgeCheck className="size-3.5" aria-hidden /> Faculty verified
            </span>
          ) : (
            <span className="text-xs text-neutral-500">Not checked yet</span>
          )}
          {reactions > 0 && (
            <span
              className="inline-flex items-center gap-2 text-neutral-500"
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
