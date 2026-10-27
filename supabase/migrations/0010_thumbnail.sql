-- An optional square thumbnail for a post, used on the small rolling cards on the home
-- page. The main photo (photo_paths[1]) can then be a full poster, shown uncropped on
-- the Spotlight cards and the post page, while the thumbnail is a tight face crop.

alter table public.achievements add column thumb_path text;
alter table public.published_achievements add column thumb_path text;

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
    cash_prize, work_title, mentor, thumb_path)
  values (
    new.id, new.student_name, new.event_name, new.organizer, new.event_date, new.category, new.level,
    new.result_type, new.rank, new.award_title, new.participation_type, new.team_name,
    coalesce(array(select m ->> 'name' from jsonb_array_elements(new.team_members) m), '{}'),
    new.description, new.photo_paths, new.status = 'verified', new.created_at, new.year_of_study,
    new.section, new.achievement_type, new.end_date, new.venue, new.cash_prize, new.work_title, new.mentor,
    new.thumb_path)
  on conflict (id) do update set
    student_name = excluded.student_name, event_name = excluded.event_name, organizer = excluded.organizer,
    event_date = excluded.event_date, category = excluded.category, level = excluded.level,
    result_type = excluded.result_type, rank = excluded.rank, award_title = excluded.award_title,
    participation_type = excluded.participation_type, team_name = excluded.team_name,
    team_member_names = excluded.team_member_names, description = excluded.description,
    photo_paths = excluded.photo_paths, is_verified = excluded.is_verified,
    year_of_study = excluded.year_of_study, section = excluded.section,
    achievement_type = excluded.achievement_type, end_date = excluded.end_date, venue = excluded.venue,
    cash_prize = excluded.cash_prize, work_title = excluded.work_title, mentor = excluded.mentor,
    thumb_path = excluded.thumb_path;
  return null;
end;
$$;
