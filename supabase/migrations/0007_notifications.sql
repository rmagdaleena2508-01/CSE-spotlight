-- Notifications for students, shown under the bell in the navbar.
-- The first kind: a faculty member edited the student's post.
--
-- Safety:
-- - Each person can only read their own notifications.
-- - The only thing a person can change is read_at (marking it read).
-- - Nobody can add a notification from the browser. Only the server adds
--   them (with the admin key), after checking the faculty member is logged in.

create table public.notifications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid references public.achievements (id) on delete cascade,
  kind           text not null check (kind in ('faculty_edit')),
  title          text not null check (char_length(title) between 1 and 200),
  body           text not null check (char_length(body) between 1 and 2000),
  created_at     timestamptz not null default now(),
  read_at        timestamptz
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

alter table public.notifications enable row level security;

create policy "people read their own notifications" on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "people mark their own notifications read" on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
