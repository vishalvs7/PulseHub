-- ============================================================
-- 3. Zernio cross-posting: widen platform checks to 9 platforms,
--    add Zernio account columns, and create the media bucket.
-- ============================================================

-- 1. Widen social_accounts.platform check to the 9 supported platforms.
alter table public.social_accounts
  drop constraint if exists social_accounts_platform_check;

alter table public.social_accounts
  add constraint social_accounts_platform_check
    check (platform in (
      'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube',
      'facebook', 'threads', 'pinterest', 'reddit'
    ));

-- 2. Widen post_targets.platform check to match.
alter table public.post_targets
  drop constraint if exists post_targets_platform_check;

alter table public.post_targets
  add constraint post_targets_platform_check
    check (platform in (
      'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube',
      'facebook', 'threads', 'pinterest', 'reddit'
    ));

-- 3. Zernio account identity columns. access_token stays for legacy,
--    but new connects only store the Zernio accountId / profileId.
--    The Zernio profile (tenant boundary) is stored on the user row.
alter table public.users
  add column if not exists zernio_profile_id text;

alter table public.social_accounts
  add column if not exists zernio_profile_id text,
  add column if not exists zernio_account_id text;

create index if not exists idx_social_accounts_zernio on public.social_accounts(zernio_account_id);

-- 4. Storage bucket for post media. Zernio auto-proxies Supabase URLs.
insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

-- 5. Allow authenticated users to upload into post-media.
drop policy if exists "Users can upload post media" on storage.objects;

create policy "Users can upload post media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-media');

drop policy if exists "Users can read post media" on storage.objects;

create policy "Users can read post media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'post-media');
