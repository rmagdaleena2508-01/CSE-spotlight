-- Student Spotlight: Celebrate and Heart, LinkedIn style.
-- - Two reactions replace Like / Heart / Fire. Old likes and fires become celebrates.
-- - One reaction per person per post (pick Celebrate or Heart; picking it again takes it back).
-- - Faculty can react too, not only students.
-- - Who reacted is shown by name ("Priya and 12 others"), through two read-only
--   functions that return names only: never roll numbers, user ids or emails.

-- 1. Counts on the public copy.
alter table public.published_achievements
  add column celebrate_count int not null default 0;

update public.published_achievements set celebrate_count = like_count + fire_count;

-- 2. The reaction kinds.
alter table public.reactions drop constraint reactions_kind_check;
update public.reactions set kind = 'celebrate' where kind in ('like', 'fire');
alter table public.reactions
  add constraint reactions_kind_check check (kind in ('celebrate', 'heart'));

-- 3. Keep the counts in step (replaces the Day 2 trigger function).
create or replace function public.count_reaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('DELETE', 'UPDATE') then
    update public.published_achievements set
      celebrate_count = celebrate_count - (old.kind = 'celebrate')::int,
      heart_count     = heart_count     - (old.kind = 'heart')::int
    where id = old.achievement_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    update public.published_achievements set
      celebrate_count = celebrate_count + (new.kind = 'celebrate')::int,
      heart_count     = heart_count     + (new.kind = 'heart')::int
    where id = new.achievement_id;
  end if;
  return null;
end;
$$;

alter table public.published_achievements
  drop column like_count,
  drop column fire_count;

-- 4. Faculty may react as well as students.
drop policy "students add own reactions" on public.reactions;
create policy "students and faculty add own reactions" on public.reactions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and ((select public.current_roll_no()) is not null or (select public.is_faculty()))
    and exists (select 1 from public.published_achievements p where p.id = achievement_id)
  );

-- 5. Names of the people who reacted to one public post, newest first.
create or replace function public.post_reactors(p_id uuid, p_limit int default 50)
returns table (name text, kind text, is_faculty boolean, reacted_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(f.name, s.name) as name,
         r.kind,
         f.auth_user_id is not null as is_faculty,
         r.created_at as reacted_at
  from public.reactions r
  join public.published_achievements p on p.id = r.achievement_id
  left join public.faculty f on f.auth_user_id = r.user_id
  left join public.students s on s.auth_user_id = r.user_id
  where r.achievement_id = p_id
    and coalesce(f.name, s.name) is not null
  order by r.created_at desc
  limit least(greatest(p_limit, 1), 200)
$$;

-- 6. For the cards: the most recent person to react to each post.
create or replace function public.latest_reactors(p_ids uuid[])
returns table (achievement_id uuid, name text)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct on (r.achievement_id)
         r.achievement_id,
         coalesce(f.name, s.name) as name
  from public.reactions r
  join public.published_achievements p on p.id = r.achievement_id
  left join public.faculty f on f.auth_user_id = r.user_id
  left join public.students s on s.auth_user_id = r.user_id
  where r.achievement_id = any (p_ids[1:60])
    and coalesce(f.name, s.name) is not null
  order by r.achievement_id, r.created_at desc
$$;

revoke execute on function public.post_reactors(uuid, int) from public;
revoke execute on function public.latest_reactors(uuid[]) from public;
grant execute on function public.post_reactors(uuid, int) to anon, authenticated;
grant execute on function public.latest_reactors(uuid[]) to anon, authenticated;
