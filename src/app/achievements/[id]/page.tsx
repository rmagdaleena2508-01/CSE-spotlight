import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Building2, CalendarDays, Layers, Users } from "lucide-react";
import { CategoryPlaceholder } from "@/components/category-placeholder";
import { categoryLabel, formatDate, levelLabel, resultLabel } from "@/lib/labels";
import { photoUrl } from "@/lib/photos";
import { getViewer } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { Reactions } from "./reactions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function load(id: string) {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("published_achievements").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: PageProps<"/achievements/[id]">): Promise<Metadata> {
  const a = await load((await params).id);
  if (!a) return { title: "Not available · CSE Spotlight" };
  return { title: `${a.event_name} · CSE Spotlight`, description: `${a.student_name}: ${resultLabel(a)} at ${a.event_name}.` };
}

export default async function AchievementPage({ params }: PageProps<"/achievements/[id]">) {
  const { id } = await params;
  const a = await load(id);
  if (!a) notFound();

  const viewer = await getViewer();
  let mine: "like" | "heart" | "fire" | null = null;
  if (viewer?.kind === "student") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reactions")
      .select("kind")
      .eq("achievement_id", id)
      .eq("user_id", viewer.userId)
      .maybeSingle();
    mine = data?.kind ?? null;
  }

  const photos: string[] = a.photo_paths ?? [];
  const members: string[] = a.team_member_names ?? [];
  const isAward = a.result_type === "award";

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/achievements" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> All achievements
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">{categoryLabel(a.category)}</span>
        <span className={isAward ? "rounded-full bg-gold-soft px-2.5 py-0.5 font-medium text-gold" : "rounded-full bg-muted px-2.5 py-0.5"}>
          {resultLabel(a)}
        </span>
        {a.is_verified ? (
          <span className="inline-flex items-center gap-1 font-medium text-primary">
            <BadgeCheck className="size-4" aria-hidden /> Faculty verified
          </span>
        ) : (
          <span className="text-muted-foreground">Not checked by faculty yet</span>
        )}
      </div>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{a.event_name}</h1>
      <p className="mt-1 text-lg text-muted-foreground">{a.student_name}</p>

      <dl className="mt-6 grid gap-3 rounded-xl border bg-card p-4 text-sm sm:grid-cols-2">
        <div className="flex gap-2">
          <CalendarDays className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-muted-foreground">Date</dt>
            <dd className="font-medium">{formatDate(a.event_date)}</dd>
          </div>
        </div>
        <div className="flex gap-2">
          <Building2 className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-muted-foreground">Organized by</dt>
            <dd className="font-medium">{a.organizer}</dd>
          </div>
        </div>
        <div className="flex gap-2">
          <Layers className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-muted-foreground">Level</dt>
            <dd className="font-medium">{levelLabel(a.level)}</dd>
          </div>
        </div>
        <div className="flex gap-2">
          <Users className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
          <div>
            <dt className="text-muted-foreground">{a.participation_type === "team" ? "Team" : "Took part"}</dt>
            <dd className="font-medium">
              {a.participation_type === "team"
                ? [a.team_name, members.length ? `with ${members.join(", ")}` : null].filter(Boolean).join(" ") || "Team"
                : "On their own"}
            </dd>
          </div>
        </div>
      </dl>

      <section className="mt-8" aria-labelledby="story">
        <h2 id="story" className="text-xl font-semibold">About it</h2>
        <p className="mt-2 leading-relaxed whitespace-pre-line">{a.description}</p>
      </section>

      <section className="mt-8" aria-labelledby="photos">
        <h2 id="photos" className="text-xl font-semibold">Photos</h2>
        {photos.length === 0 ? (
          <CategoryPlaceholder category={a.category} className="mt-3 aspect-[4/3] w-full max-w-md rounded-xl" />
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {photos.map((p, i) => (
              <li key={p} className={photos.length === 1 ? "sm:col-span-2" : undefined}>
                <a href={photoUrl(p)} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={photoUrl(p)}
                      alt={`${a.event_name}, photo ${i + 1} of ${photos.length}`}
                      fill
                      sizes="(min-width: 640px) 440px, 100vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                  <span className="sr-only">Open photo {i + 1} full size</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8" aria-labelledby="react">
        <h2 id="react" className="text-xl font-semibold">Cheer them on</h2>
        <div className="mt-3">
          <Reactions
            key={`${mine}-${a.like_count}-${a.heart_count}-${a.fire_count}`}
            id={a.id}
            canReact={viewer?.kind === "student"}
            initial={{ mine, counts: { like: a.like_count, heart: a.heart_count, fire: a.fire_count } }}
          />
        </div>
      </section>
    </main>
  );
}
