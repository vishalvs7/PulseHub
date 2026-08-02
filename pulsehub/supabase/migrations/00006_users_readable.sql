-- 00006: allow authenticated users to read basic profile info of other users
-- Needed by DealsInbox / messaging to render conversation partner names/avatars,
-- and by any dashboard widget that shows other users. Profiles (influencer_profiles,
-- brand_profiles) are already publicly readable; make public.users consistent.

create policy "Authenticated users can read all users"
  on public.users for select
  using (auth.uid() is not null);
