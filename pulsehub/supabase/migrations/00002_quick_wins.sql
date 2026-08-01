-- ============================================================
-- PulseHub Schema Migration 00002 — Marketplace & Posting Quick Wins
-- 1. influencer_profiles: reach_tier (derived) + base sponsorship rates
-- 2. post_targets: per-platform post status (replaces CSV platform string)
-- ============================================================

-- 1a. Base sponsorship rates (USD by default). Nullable until influencer sets them.
alter table public.influencer_profiles
  add column if not exists base_rate_min numeric(12,2),
  add column if not exists base_rate_max numeric(12,2),
  add column if not exists base_rate_currency text not null default 'USD';

alter table public.influencer_profiles
  add constraint influencer_profiles_rate_range_check
    check (base_rate_min is null or base_rate_max is null or base_rate_min <= base_rate_max);

-- 1b. Reach tier derived from followers_count so it can never go stale.
--     Tiers (per specs §3.1): Nano <10K, Micro <100K, Mid <500K, Macro >=500K.
alter table public.influencer_profiles
  add column if not exists reach_tier text generated always as (
    case
      when followers_count < 10000  then 'nano'
      when followers_count < 100000 then 'micro'
      when followers_count < 500000 then 'mid'
      else 'macro'
    end
  ) stored;

-- 2. post_targets — one row per platform per post.
create table if not exists public.post_targets (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid not null references public.posts(id) on delete cascade,
  platform        text not null check (platform in ('instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'facebook')),
  content         text not null default '',
  media_urls      text[] not null default '{}',
  status          text not null default 'pending' check (status in ('pending', 'scheduled', 'published', 'failed')),
  platform_post_id text,
  scheduled_for   timestamptz,
  published_at    timestamptz,
  error           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (post_id, platform)
);

create index idx_post_targets_post on public.post_targets(post_id);
create index idx_post_targets_status on public.post_targets(status);

-- 3. RLS for post_targets (mirrors posts: owner can CRUD)
alter table public.post_targets enable row level security;

create policy "Users can read own post targets"
  on public.post_targets for select
  using (
    exists (select 1 from public.posts where id = post_id and user_id = auth_user_id())
  );

create policy "Users can insert post targets"
  on public.post_targets for insert
  with check (
    exists (select 1 from public.posts where id = post_id and user_id = auth_user_id())
  );

create policy "Users can update own post targets"
  on public.post_targets for update
  using (
    exists (select 1 from public.posts where id = post_id and user_id = auth_user_id())
  )
  with check (
    exists (select 1 from public.posts where id = post_id and user_id = auth_user_id())
  );

create policy "Users can delete own post targets"
  on public.post_targets for delete
  using (
    exists (select 1 from public.posts where id = post_id and user_id = auth_user_id())
  );
