-- Fields the department newsletter prints, plus a stricter proof rule:
-- every post has exactly one certificate (photos stay optional, up to 5).

alter table public.achievements
  add column year_of_study    text not null default '' check (year_of_study in ('', 'I', 'II', 'III', 'IV')),
  add column section          text not null default '' check (char_length(section) <= 20),
  add column achievement_type text not null default 'competition'
    check (achievement_type in ('competition', 'hackathon', 'paper', 'certification', 'talk', 'sports', 'project', 'other')),
  add column end_date         date,
  add column venue            text not null default '' check (char_length(venue) <= 150),
  add column cash_prize       int check (cash_prize is null or cash_prize between 1 and 10000000),
  add column work_title       text check (work_title is null or char_length(work_title) between 3 and 250),
  add column mentor           text check (mentor is null or char_length(mentor) between 3 and 120),
  add column proof_url        text check (proof_url is null or (proof_url ~ '^https://' and char_length(proof_url) <= 500)),
  add constraint achievements_end_after_start check (end_date is null or end_date >= event_date);

alter table public.achievements
  drop constraint achievements_check1,
  drop constraint achievements_certificate_paths_check,
  add constraint achievements_one_certificate check (cardinality(certificate_paths) = 1);

grant insert (year_of_study, section, achievement_type, end_date, venue, cash_prize, work_title, mentor, proof_url)
  on public.achievements to authenticated;
grant update (year_of_study, section, achievement_type, end_date, venue, cash_prize, work_title, mentor, proof_url)
  on public.achievements to authenticated;

-- The end date cannot be in the future either.
create or replace function public.achievements_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    select name into new.student_name from public.students where roll_no = new.roll_no;
  end if;
  if new.event_date > (now() at time zone 'Asia/Kolkata')::date
     or new.end_date > (now() at time zone 'Asia/Kolkata')::date then
    raise exception 'Event date cannot be in the future' using errcode = '23514';
  end if;
  return new;
end;
$$;

-- Public copy gets the new safe fields. The proof link stays private.
alter table public.published_achievements
  add column year_of_study    text not null default '',
  add column section          text not null default '',
  add column achievement_type text not null default 'competition',
  add column end_date         date,
  add column venue            text not null default '',
  add column cash_prize       int,
  add column work_title       text,
  add column mentor           text;

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
    is_verified, created_at, year_of_study, section, achievement_type, end_date, venue,
    cash_prize, work_title, mentor)
  values (
    new.id, new.student_name, new.event_name, new.organizer, new.event_date, new.category, new.level,
    new.result_type, new.rank, new.award_title, new.participation_type, new.team_name,
    coalesce(array(select m ->> 'name' from jsonb_array_elements(new.team_members) m), '{}'),
    new.description, new.photo_paths, new.status = 'verified', new.created_at, new.year_of_study,
    new.section, new.achievement_type, new.end_date, new.venue, new.cash_prize, new.work_title, new.mentor)
  on conflict (id) do update set
    student_name = excluded.student_name, event_name = excluded.event_name, organizer = excluded.organizer,
    event_date = excluded.event_date, category = excluded.category, level = excluded.level,
    result_type = excluded.result_type, rank = excluded.rank, award_title = excluded.award_title,
    participation_type = excluded.participation_type, team_name = excluded.team_name,
    team_member_names = excluded.team_member_names, description = excluded.description,
    photo_paths = excluded.photo_paths, is_verified = excluded.is_verified,
    year_of_study = excluded.year_of_study, section = excluded.section,
    achievement_type = excluded.achievement_type, end_date = excluded.end_date, venue = excluded.venue,
    cash_prize = excluded.cash_prize, work_title = excluded.work_title, mentor = excluded.mentor;
  return null;
end;
$$;

revoke execute on function public.sync_published_achievement(), public.achievements_before_write()
  from public, anon, authenticated;
