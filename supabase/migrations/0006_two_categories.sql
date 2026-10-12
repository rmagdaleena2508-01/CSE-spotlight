-- Only two categories now: Technical and Non-Technical. Arts and Sports are gone.
-- (The "sports" kind of win stays: a sports event can still be posted as Non-Technical.)

alter table public.achievements drop constraint achievements_category_check;
alter table public.achievements
  add constraint achievements_category_check check (category in ('technical', 'non_technical'));
