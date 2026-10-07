import Link from "next/link";
import { History } from "lucide-react";
import { AchievementCard } from "@/components/achievement-card";
import { CategoryShelf } from "@/components/category-shelf";
import { buttonVariants } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/schemas";
import { PUBLIC_CARD_COLUMNS, type PublicCard } from "@/lib/published";
import { currentSemester } from "@/lib/semester";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const semester = currentSemester();

  // Six newest posts per category from this semester.
  const shelves = await Promise.all(
    CATEGORIES.map(async (c) => {
      const { data } = await supabase
        .from("published_achievements")
        .select(PUBLIC_CARD_COLUMNS)
        .eq("category", c.value)
        .gte("event_date", semester.start)
        .order("event_date", { ascending: false })
        .order("id")
        .limit(6)
        .overrideTypes<PublicCard[], { merge: false }>();
      return { ...c, posts: data ?? [] };
    }),
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section>
        <p className="text-sm font-medium text-primary">{semester.label}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">What CSE students did this semester</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Wins and events from our class, posted by students and checked by faculty.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/achievements" className={buttonVariants({ size: "lg" })}>
            Explore achievements
          </Link>
          <Link href="/submit" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Add your achievement
          </Link>
          <Link href="/achievements?period=past" className={buttonVariants({ size: "lg", variant: "ghost" })}>
            <History aria-hidden /> Past achievements
          </Link>
        </div>
      </section>

      {shelves.map((s) => (
        <CategoryShelf
          key={s.value}
          title={s.label}
          viewAllHref={`/achievements?period=current&category=${s.value}`}
          empty={s.posts.length === 0}
        >
          {s.posts.map((a) => (
            <li key={a.id} className="w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[31.5%]">
              <AchievementCard a={a} className="h-full" />
            </li>
          ))}
        </CategoryShelf>
      ))}
    </main>
  );
}
