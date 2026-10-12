-- Students may edit their own post only while faculty have not checked it yet,
-- and only for 2 months after posting. After that the post is locked, so old
-- records cannot be changed later on. Faculty edits go through the server and
-- are not limited by this.
drop policy if exists "students edit own unverified achievements" on public.achievements;

create policy "students edit own unverified achievements" on public.achievements
  for update to authenticated
  using (
    roll_no = (select public.current_roll_no())
    and status = 'live'
    and created_at > now() - interval '2 months'
  )
  with check (roll_no = (select public.current_roll_no()) and status = 'live');
