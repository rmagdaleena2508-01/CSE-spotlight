import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { BadgeCheck } from "lucide-react";
import { CATEGORY_STICKER } from "@/lib/category-stickers";
import { categoryLabel, levelLabel, resultLabel } from "@/lib/labels";
import { photoUrl } from "@/lib/photos";
import { displayName } from "@/lib/reactions/kinds";
import type { SpotlightPost } from "@/lib/spotlight";
import { cn } from "@/lib/utils";

// Student Spotlight on the home page, as two moving rows of cards, like the "Trusted by"
// logo strips on big tech sites: the top row runs left to right, the bottom one right to
// left, both forever. Hovering a row pauses it so a card can be read and clicked.
// Pure CSS (no JavaScript): each row's cards are drawn twice, and the strip slides by
// exactly one copy's width, so the loop never jumps. Soft edges fade cards in and out.

/** Below this many cards a row would show gaps, so short lists are repeated. */
const MIN_PER_ROW = 8;
/** Seconds each card takes to pass, so rows of any length move at the same calm speed. */
const SECONDS_PER_CARD = 6;

function fill(posts: SpotlightPost[]) {
  if (posts.length === 0) return [];
  const out: SpotlightPost[] = [];
  while (out.length < MIN_PER_ROW) out.push(...posts);
  return out;
}

export function SpotlightMarquee({ posts, signedIn }: { posts: SpotlightPost[]; signedIn: boolean }) {
  // Two different rows when there are enough posts; with only a few, both rows show them all.
  const top = posts.length >= 2 * 4 ? posts.filter((_, i) => i % 2 === 0) : posts;
  const bottom = posts.length >= 2 * 4 ? posts.filter((_, i) => i % 2 === 1) : [...posts].reverse();

  return (
    <div className="-mx-4 flex flex-col gap-4 sm:gap-5">
      <Row posts={fill(top)} direction="right" signedIn={signedIn} />
      <Row posts={fill(bottom)} direction="left" signedIn={signedIn} />
    </div>
  );
}

function Row({ posts, direction, signedIn }: { posts: SpotlightPost[]; direction: "left" | "right"; signedIn: boolean }) {
  const style = { "--marquee-duration": `${posts.length * SECONDS_PER_CARD}s` } as CSSProperties;
  return (
    <div className="marquee group/marquee overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <ul
        className={cn("marquee-track flex w-max", direction === "right" ? "marquee-right" : "marquee-left")}
        style={style}
      >
        {[0, 1].map((copy) =>
          posts.map((p, i) => (
            // The second copy is only there to close the loop, so screen readers skip it.
            <li key={`${copy}-${i}-${p.id}`} aria-hidden={copy === 1 || undefined} className="shrink-0 pr-4 sm:pr-5">
              <Card post={p} signedIn={signedIn} tabbable={copy === 0} />
            </li>
          )),
        )}
      </ul>
    </div>
  );
}

// Card pictures load straight away ("eager"), not when they slide into view: the rows
// move sideways, so lazy loading made cards show up empty and fill in late on phones.
function Card({ post, signedIn, tabbable }: { post: SpotlightPost; signedIn: boolean; tabbable: boolean }) {
  // The square thumbnail if there is one (a face crop), otherwise the main photo.
  const photo = post.thumb_path ?? post.photo_paths[0];
  const sticker = CATEGORY_STICKER[post.category];
  const isAward = post.result_type === "award";
  // Wins lead with the award ("Best Paper Award 2026"), with the event's short name under
  // it ("TWC 2026", from the brackets in the event name). Other posts lead with the event.
  const year = post.event_date.slice(0, 4);
  const short = /\(([^()]+)\)\s*$/.exec(post.event_name)?.[1];
  const title =
    isAward && post.award_title
      ? post.award_title.includes(year) ? post.award_title : `${post.award_title} ${year}`
      : post.event_name;
  const subtitle = isAward && post.award_title ? (short ?? post.event_name) : null;
  const detail = `/achievements/${post.id}`;
  // The full post is for people who are logged in; everyone else is asked to log in first.
  const href = signedIn ? detail : `/login?reason=more&next=${encodeURIComponent(detail)}`;

  // Layout follows the calm "story card" pattern of big product sites: the same
  // padding on every side, a square picture as tall as the text, and the text in
  // three bands (group on top, title and name in the middle, result at the bottom)
  // spread evenly so nothing bunches up in the center.
  return (
    <Link
      href={href}
      tabIndex={tabbable ? undefined : -1}
      aria-label={`${title}${subtitle ? `, ${subtitle}` : ""}, ${displayName(post.student_name)}${signedIn ? "" : ". Log in to read the full post"}`}
      className="lift flex w-[18.5rem] items-stretch gap-3.5 rounded-2xl bg-white p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_10px_26px_-16px_rgb(0_0_0/0.35)] sm:w-[22rem] sm:gap-4 sm:p-5"
    >
      <span
        className={cn(
          "relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl sm:size-[6.5rem]",
          post.category === "technical" ? "bg-sky-100" : "bg-violet-100",
        )}
      >
        {photo ? (
          <Image src={photoUrl(photo)} alt="" fill sizes="104px" loading="eager" className="object-cover" />
        ) : (
          sticker && (
            <Image
              src={sticker.src}
              alt=""
              width={sticker.w}
              height={sticker.h}
              sizes="80px"
              loading="eager"
              className="w-3/4 -rotate-6"
            />
          )
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <span className="block text-[0.6875rem] leading-none font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          {categoryLabel(post.category)}
        </span>
        <span className="block">
          <span className="line-clamp-2 font-[family-name:var(--font-headline)] text-[1.05rem] leading-tight">
            {title}
          </span>
          {subtitle && (
            <span className="mt-0.5 block truncate text-xs font-semibold tracking-[0.06em] text-foreground/70 uppercase">
              {subtitle}
            </span>
          )}
          <span className="mt-1 block truncate text-sm leading-tight text-muted-foreground">
            {displayName(post.student_name)}
          </span>
        </span>
        <span className="flex items-center gap-2 text-xs">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-semibold",
              isAward ? "bg-[#fbbf24] text-[#080809]" : "bg-muted text-foreground",
            )}
          >
            {/* The award is already the title, so the tag shows the level instead. */}
            {subtitle ? levelLabel(post.level) : resultLabel(post)}
          </span>
          {post.is_verified && <BadgeCheck className="size-4 text-emerald-600" aria-label="Faculty verified" />}
        </span>
      </span>
    </Link>
  );
}
