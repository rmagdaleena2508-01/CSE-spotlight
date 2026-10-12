-- Faculty can delete any post for good, at any time (even after the 2 month
-- student edit limit). The student gets a notification saying so. The post is
-- gone by then, so this notification has no post linked to it.
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications
  add constraint notifications_kind_check check (kind in ('faculty_edit', 'faculty_delete'));
