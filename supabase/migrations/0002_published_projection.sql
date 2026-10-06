-- Replace the public view with a real table that holds only safe fields.
-- A trigger keeps it in step with achievements, so public reads never touch
-- the private table (no roll numbers, no certificates, no removed posts).

drop view if exists public.public_achievements;

create table public.published_achievements (
  id                 uuid primary key references public.achievements (id) on delete cascade,
  student_name       text not null,
  event_name         text not null,
  organizer          text not null,
  event_date         date not null,
  category           text not null,
  level              text not null,
  result_type        text not null,
  rank               int,
  award_title        text,
  participation_type text not null,
  team_name          text,
  team_member_names  text[] not null default '{}',
  description        text not null,
  photo_paths        text[] not null default '{}',
  is_verified        boolean not null default false,
  created_at         timestamptz not null
);

create index published_category_idx on public.published_achievements (category, event_date desc, id);
create index published_date_idx on public.published_achievements (event_date desc, id);

alter table public.published_achievements enable row level security;

create policy "anyone can read published achievements" on public.published_achievements
  for select to anon, authenticated
  using (true);

revoke all on public.published_achievements from anon, authenticated;
grant select on public.published_achievements to anon, authenticated;

create or replace function public.sync_published_achievement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'removed' then
    delete from public.published_achievements where id = new.id;
    return null;
  end if;

  insert into public.published_achievements as p (
    id, student_name, event_name, organizer, event_date, category, level, result_type, rank,
    award_title, participation_type, team_name, team_member_names, description, photo_paths,
    is_verified, created_at)
  values (
    new.id, new.student_name, new.event_name, new.organizer, new.event_date, new.category, new.level,
    new.result_type, new.rank, new.award_title, new.participation_type, new.team_name,
    coalesce(array(select m ->> 'name' from jsonb_array_elements(new.team_members) m), '{}'),
    new.description, new.photo_paths, new.status = 'verified', new.created_at)
  on conflict (id) do update set
    student_name = excluded.student_name, event_name = excluded.event_name, organizer = excluded.organizer,
    event_date = excluded.event_date, category = excluded.category, level = excluded.level,
    result_type = excluded.result_type, rank = excluded.rank, award_title = excluded.award_title,
    participation_type = excluded.participation_type, team_name = excluded.team_name,
    team_member_names = excluded.team_member_names, description = excluded.description,
    photo_paths = excluded.photo_paths, is_verified = excluded.is_verified;
  return null;
end;
$$;

create trigger achievements_sync_published after insert or update on public.achievements
  for each row execute function public.sync_published_achievement();

-- Trigger functions are never called over the API.
revoke execute on function public.sync_published_achievement(), public.achievements_before_write(),
  public.touch_updated_at() from public, anon, authenticated;
