-- Day 2: Like / Heart / Fire reactions.
-- One reaction per student per post. Who reacted stays private; only the
-- totals are public, kept on published_achievements by a trigger.

alter table public.published_achievements
  add column like_count  int not null default 0,
  add column heart_count int not null default 0,
  add column fire_count  int not null default 0;

create table public.reactions (
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  kind           text not null check (kind in ('like', 'heart', 'fire')),
  created_at     timestamptz not null default now(),
  primary key (achievement_id, user_id)
);
create index reactions_user_idx on public.reactions (user_id);

alter table public.reactions enable row level security;

-- Students react only to posts that are public, and only as themselves.
create policy "students read own reactions" on public.reactions
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "students add own reactions" on public.reactions
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.current_roll_no()) is not null
    and exists (select 1 from public.published_achievements p where p.id = achievement_id)
  );

create policy "students change own reactions" on public.reactions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "students remove own reactions" on public.reactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.reactions from anon, authenticated;
grant select, insert, delete on public.reactions to authenticated;
grant update (kind) on public.reactions to authenticated;

create or replace function public.count_reaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('DELETE', 'UPDATE') then
    update public.published_achievements set
      like_count  = like_count  - (old.kind = 'like')::int,
      heart_count = heart_count - (old.kind = 'heart')::int,
      fire_count  = fire_count  - (old.kind = 'fire')::int
    where id = old.achievement_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    update public.published_achievements set
      like_count  = like_count  + (new.kind = 'like')::int,
      heart_count = heart_count + (new.kind = 'heart')::int,
      fire_count  = fire_count  + (new.kind = 'fire')::int
    where id = new.achievement_id;
  end if;
  return null;
end;
$$;

create trigger reactions_count after insert or update or delete on public.reactions
  for each row execute function public.count_reaction();

revoke execute on function public.count_reaction() from public, anon, authenticated;

-- Faculty review list sorts and filters by status and date.
create index achievements_review_idx on public.achievements (status, created_at desc);
