import { AchievementCard } from "@/components/achievement-card";
import { CategoryShelf } from "@/components/category-shelf";
import { Hero } from "@/components/hero";
import { CATEGORY_STICKER } from "@/lib/category-stickers";
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
    <>
      <Hero semesterLabel={semester.label} />
      <main className="mx-auto max-w-6xl px-4 pb-24">

      {shelves.map((s) => (
        <CategoryShelf
          key={s.value}
          title={s.label}
          sticker={CATEGORY_STICKER[s.value]}
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
    </>
  );
}
