-- CSE Spotlight, Day 1 schema.
-- Students are a roster loaded from the faculty Excel sheet. Achievements go
-- live as soon as they are posted; faculty verify or remove them later.

-- Name matching: uppercase, dots become spaces, word order ignored.
-- "PRIYAN .A .M", "Priyan A M" and "A M Priyan" all give "A M PRIYAN".
create or replace function public.name_key(raw text)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(string_agg(w, ' ' order by w), '')
  from unnest(regexp_split_to_array(upper(trim(regexp_replace(coalesce(raw, ''), '[^A-Za-z0-9]+', ' ', 'g'))), '\s+')) as w
  where w <> ''
$$;

-- ---------------------------------------------------------------- tables

create table public.students (
  roll_no      text primary key check (roll_no ~ '^RA[0-9]{13}$'),
  name         text not null check (char_length(trim(name)) between 1 and 120),
  name_key     text generated always as (public.name_key(name)) stored,
  active       boolean not null default true,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  claimed_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.faculty (
  auth_user_id uuid primary key references auth.users (id) on delete cascade,
  username     text not null unique,
  name         text not null,
  created_at   timestamptz not null default now()
);

create table public.achievements (
  id                 uuid primary key default gen_random_uuid(),
  roll_no            text not null references public.students (roll_no),
  student_name       text not null default '',
  event_name         text not null check (char_length(event_name) between 3 and 150),
  organizer          text not null check (char_length(organizer) between 3 and 150),
  event_date         date not null,
  category           text not null check (category in ('technical', 'non_technical', 'arts', 'sports')),
  level              text not null check (level in ('intra_college', 'inter_college', 'state', 'national', 'international')),
  result_type        text not null check (result_type in ('participation', 'award')),
  rank               int check (rank > 0),
  award_title        text check (award_title is null or char_length(award_title) between 2 and 100),
  participation_type text not null check (participation_type in ('individual', 'team')),
  team_name          text check (team_name is null or char_length(team_name) <= 100),
  -- [{ "name": "...", "roll_no": "..." }]; roll numbers here are never public.
  team_members       jsonb not null default '[]'::jsonb check (jsonb_typeof(team_members) = 'array' and jsonb_array_length(team_members) <= 20),
  description        text not null check (char_length(description) between 30 and 1500),
  certificate_paths  text[] not null default '{}' check (cardinality(certificate_paths) <= 3),
  photo_paths        text[] not null default '{}' check (cardinality(photo_paths) <= 5),
  status             text not null default 'live' check (status in ('live', 'verified', 'removed')),
  verified_by        uuid references public.faculty (auth_user_id),
  verified_at        timestamptz,
  removed_by         uuid references public.faculty (auth_user_id),
  removed_at         timestamptz,
  remove_reason      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (result_type = 'participation' or rank is not null or award_title is not null),
  check (cardinality(certificate_paths) + cardinality(photo_paths) >= 1),
  check (status <> 'removed' or remove_reason is not null)
);

create index achievements_roll_no_idx on public.achievements (roll_no);
create index achievements_public_idx on public.achievements (status, category, event_date desc);

-- Failed first-login attempts, for rate limiting. Only the server reads this.
create table public.login_attempts (
  id         bigint generated always as identity primary key,
  roll_no    text not null,
  created_at timestamptz not null default now()
);
create index login_attempts_roll_idx on public.login_attempts (roll_no, created_at desc);

-- ---------------------------------------------------------------- helpers

create or replace function public.is_faculty()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.faculty where auth_user_id = (select auth.uid()))
$$;

create or replace function public.current_roll_no()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select roll_no from public.students where auth_user_id = (select auth.uid()) and active
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- The posted name always comes from the roster, and dates cannot be in the future.
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
  if new.event_date > (now() at time zone 'Asia/Kolkata')::date then
    raise exception 'Event date cannot be in the future' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger achievements_before_write before insert or update on public.achievements
  for each row execute function public.achievements_before_write();

create trigger students_touch before update on public.students
  for each row execute function public.touch_updated_at();
create trigger achievements_touch before update on public.achievements
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- row level security

alter table public.students enable row level security;
alter table public.faculty enable row level security;
alter table public.achievements enable row level security;
alter table public.login_attempts enable row level security;

create policy "students read own row, faculty read all" on public.students
  for select to authenticated
  using (auth_user_id = (select auth.uid()) or (select public.is_faculty()));

create policy "faculty read own row" on public.faculty
  for select to authenticated
  using (auth_user_id = (select auth.uid()));

create policy "owner or faculty read achievements" on public.achievements
  for select to authenticated
  using (roll_no = (select public.current_roll_no()) or (select public.is_faculty()));

create policy "students post their own achievements" on public.achievements
  for insert to authenticated
  with check (roll_no = (select public.current_roll_no()) and status = 'live');

create policy "students edit own unverified achievements" on public.achievements
  for update to authenticated
  using (roll_no = (select public.current_roll_no()) and status = 'live')
  with check (roll_no = (select public.current_roll_no()) and status = 'live');

-- Column grants: students can only write content columns. Status, verify and
-- remove columns change only through the faculty functions below.
revoke all on public.students, public.faculty, public.achievements, public.login_attempts from anon, authenticated;
grant select on public.students, public.faculty to authenticated;
grant select on public.achievements to authenticated;
grant insert (roll_no, event_name, organizer, event_date, category, level, result_type, rank,
              award_title, participation_type, team_name, team_members, description, certificate_paths, photo_paths)
  on public.achievements to authenticated;
grant update (event_name, organizer, event_date, category, level, result_type, rank, award_title,
              participation_type, team_name, team_members, description, certificate_paths, photo_paths)
  on public.achievements to authenticated;

-- ---------------------------------------------------------------- public view

-- What anyone may see: no roll numbers, no certificates, no removed posts.
create view public.public_achievements
with (security_barrier = true)
as
select
  a.id,
  a.student_name,
  a.event_name,
  a.organizer,
  a.event_date,
  a.category,
  a.level,
  a.result_type,
  a.rank,
  a.award_title,
  a.participation_type,
  a.team_name,
  coalesce((select jsonb_agg(m ->> 'name') from jsonb_array_elements(a.team_members) m), '[]'::jsonb) as team_member_names,
  a.description,
  a.photo_paths,
  a.status = 'verified' as is_verified,
  a.created_at
from public.achievements a
where a.status in ('live', 'verified');

grant select on public.public_achievements to anon, authenticated;

-- ---------------------------------------------------------------- faculty actions

create or replace function public.verify_achievement(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_faculty() then
    raise exception 'Only faculty can verify' using errcode = '42501';
  end if;
  update public.achievements
     set status = 'verified', verified_by = auth.uid(), verified_at = now()
   where id = p_id and status = 'live';
  if not found then
    raise exception 'Achievement not found or not live' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.remove_achievement(p_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_faculty() then
    raise exception 'Only faculty can remove' using errcode = '42501';
  end if;
  if char_length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A reason is required' using errcode = '22023';
  end if;
  update public.achievements
     set status = 'removed', removed_by = auth.uid(), removed_at = now(), remove_reason = trim(p_reason)
   where id = p_id and status <> 'removed';
  if not found then
    raise exception 'Achievement not found or already removed' using errcode = 'P0002';
  end if;
end;
$$;

-- Upsert the class list. rows = [{ "roll_no": "...", "name": "..." }].
create or replace function public.import_roster(p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r jsonb;
  v_roll text;
  v_name text;
  v_added int := 0;
  v_updated int := 0;
  v_invalid int := 0;
  v_inserted boolean;
begin
  if not public.is_faculty() then
    raise exception 'Only faculty can import the roster' using errcode = '42501';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 5000 then
    raise exception 'Expected an array of at most 5000 rows' using errcode = '22023';
  end if;

  for r in select * from jsonb_array_elements(p_rows) loop
    v_roll := upper(regexp_replace(coalesce(r ->> 'roll_no', ''), '\s', '', 'g'));
    v_name := trim(regexp_replace(coalesce(r ->> 'name', ''), '\s+', ' ', 'g'));
    if v_roll !~ '^RA[0-9]{13}$' or v_name = '' then
      v_invalid := v_invalid + 1;
      continue;
    end if;
    insert into public.students (roll_no, name) values (v_roll, v_name)
    on conflict (roll_no) do update set name = excluded.name, active = true
      where public.students.name is distinct from excluded.name or not public.students.active
    returning (xmax = 0) into v_inserted;
    if found then
      if v_inserted then v_added := v_added + 1; else v_updated := v_updated + 1; end if;
    end if;
  end loop;

  return jsonb_build_object('added', v_added, 'updated', v_updated, 'invalid', v_invalid);
end;
$$;

-- Faculty lets a student log in fresh (for a wrong claim or a lost password).
-- The server deletes the auth user after this succeeds.
create or replace function public.reset_student(p_roll_no text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not public.is_faculty() then
    raise exception 'Only faculty can reset students' using errcode = '42501';
  end if;
  select auth_user_id into v_user from public.students where roll_no = p_roll_no for update;
  if not found then
    raise exception 'Student not found' using errcode = 'P0002';
  end if;
  update public.students set auth_user_id = null, claimed_at = null where roll_no = p_roll_no;
  return v_user;
end;
$$;

revoke execute on function public.verify_achievement(uuid), public.remove_achievement(uuid, text),
  public.import_roster(jsonb), public.reset_student(text) from public, anon;
grant execute on function public.verify_achievement(uuid), public.remove_achievement(uuid, text),
  public.import_roster(jsonb), public.reset_student(text) to authenticated;
revoke execute on function public.is_faculty(), public.current_roll_no() from public, anon;
grant execute on function public.is_faculty(), public.current_roll_no() to authenticated;

-- ---------------------------------------------------------------- storage

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('certificates', 'certificates', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png']),
  ('photos', 'photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Files live under "<auth user id>/<random name>".
create policy "students upload own certificates" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'certificates' and (storage.foldername(name))[1] = (select auth.uid())::text
              and (select public.current_roll_no()) is not null);

create policy "owner or faculty read certificates" on storage.objects
  for select to authenticated
  using (bucket_id = 'certificates'
         and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_faculty())));

create policy "students upload own photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text
              and (select public.current_roll_no()) is not null);

create policy "students delete own files" on storage.objects
  for delete to authenticated
  using (bucket_id in ('certificates', 'photos') and (storage.foldername(name))[1] = (select auth.uid())::text);
