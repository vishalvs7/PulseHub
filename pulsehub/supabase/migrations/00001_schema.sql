-- ============================================================
-- PulseHub Schema Migration
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- 1. Users table (extends auth.users)
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text not null,
  photo_url     text,
  role          text not null check (role in ('influencer', 'brand', 'admin')),
  email_verified boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. Brand profiles
create table if not exists public.brand_profiles (
  user_id       uuid primary key references public.users(id) on delete cascade,
  company_name  text not null,
  email         text not null,
  industry      text not null default 'General',
  company_size  text not null default '1-10' check (company_size in ('1-10', '11-50', '51-200', '201-500', '500+')),
  website       text,
  description   text,
  logo_url      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 3. Influencer profiles
create table if not exists public.influencer_profiles (
  user_id         uuid primary key references public.users(id) on delete cascade,
  display_name    text not null,
  email           text not null,
  photo_url       text,
  bio             text,
  niche           text[] not null default '{}',
  location        text not null default 'Unknown',
  website         text,
  followers_count bigint not null default 0,
  engagement_rate numeric(5,2) not null default 0,
  trust_score     integer not null default 50 check (trust_score between 0 and 100),
  is_verified     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 4. Social accounts (connected platforms)
create table if not exists public.social_accounts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  platform      text not null check (platform in ('instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'facebook')),
  username      text not null,
  profile_id    text,
  access_token  text not null,
  refresh_token text,
  expires_at    timestamptz,
  is_connected  boolean not null default false,
  last_synced   timestamptz,
  created_at    timestamptz not null default now()
);

-- 5. Campaigns
create table if not exists public.campaigns (
  id                  uuid primary key default gen_random_uuid(),
  brand_id            uuid not null references public.brand_profiles(user_id) on delete cascade,
  name                text not null,
  description         text not null default '',
  platforms           text[] not null default '{}',
  budget              numeric(12,2) not null default 0,
  status              text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed', 'cancelled')),
  start_date          date,
  end_date            date,
  target_influencers  integer not null default 0,
  connected_influencers text[] not null default '{}',
  total_reach         bigint not null default 0,
  total_engagement    bigint not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 6. Campaign-Influencer junction
create table if not exists public.campaign_influencers (
  campaign_id    uuid not null references public.campaigns(id) on delete cascade,
  influencer_id  uuid not null references public.influencer_profiles(user_id) on delete cascade,
  status         text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'negotiating', 'completed')),
  earnings       numeric(12,2),
  created_at     timestamptz not null default now(),
  primary key (campaign_id, influencer_id)
);

-- 7. Conversations (chat)
create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  subject     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 8. Conversation participants
create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  last_read_at    timestamptz,
  primary key (conversation_id, user_id)
);

-- 9. Messages
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.users(id) on delete cascade,
  content         text not null,
  media_url       text,
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);

-- 10. Posts (scheduled / published)
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  platform        text not null,
  platform_post_id text,
  content         text not null default '',
  media_urls      text[] not null default '{}',
  scheduled_for   timestamptz,
  published_at    timestamptz,
  status          text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'failed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 11. Analytics snapshots
create table if not exists public.analytics_snapshots (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  platform        text not null,
  followers       bigint not null default 0,
  following       bigint not null default 0,
  posts_count     integer not null default 0,
  total_likes     bigint not null default 0,
  total_comments  bigint not null default 0,
  total_shares    bigint not null default 0,
  total_reach     bigint not null default 0,
  total_impressions bigint not null default 0,
  engagement_rate numeric(5,2) not null default 0,
  snapshot_date   date not null default current_date,
  created_at      timestamptz not null default now(),
  unique (user_id, platform, snapshot_date)
);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_social_accounts_user on public.social_accounts(user_id);
create index idx_social_accounts_platform on public.social_accounts(platform);
create index idx_campaigns_brand on public.campaigns(brand_id);
create index idx_campaigns_status on public.campaigns(status);
create index idx_campaign_influencers_campaign on public.campaign_influencers(campaign_id);
create index idx_campaign_influencers_influencer on public.campaign_influencers(influencer_id);
create index idx_messages_conversation on public.messages(conversation_id);
create index idx_messages_sender on public.messages(sender_id);
create index idx_conversation_participants_user on public.conversation_participants(user_id);
create index idx_posts_user on public.posts(user_id);
create index idx_posts_status on public.posts(status);
create index idx_analytics_snapshots_user on public.analytics_snapshots(user_id);
create index idx_users_role on public.users(role);

-- ============================================================
-- Auto-update timestamps
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
  tables_with_updated_at text[] := array['users', 'brand_profiles', 'influencer_profiles', 'campaigns', 'conversations', 'posts'];
begin
  foreach t in array tables_with_updated_at
  loop
    execute format('drop trigger if exists set_%s_updated_at on public.%I', t, t);
    execute format(
      'create trigger set_%s_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.users enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.influencer_profiles enable row level security;
alter table public.social_accounts enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_influencers enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.posts enable row level security;
alter table public.analytics_snapshots enable row level security;

-- Helper: current user id
create or replace function public.auth_user_id()
returns uuid
language sql stable
as $$ select auth.uid() $$;

-- Helper: is the current user an admin? (security definer to avoid RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  )
$$;

-- Users: can read own, admin can read all
create policy "Users can read own data"
  on public.users for select
  using (id = auth_user_id());

create policy "Authenticated users can read all users"
  on public.users for select
  using (auth.uid() is not null);

create policy "Admins can read all users"
  on public.users for select
  using (public.is_admin());

create policy "Users can update own data"
  on public.users for update
  using (id = auth_user_id())
  with check (id = auth_user_id());

create policy "Users can insert own data"
  on public.users for insert
  with check (id = auth_user_id());

-- Brand profiles: readable by everyone (marketplace), writable by owner
create policy "Brand profiles are publicly readable"
  on public.brand_profiles for select
  using (true);

create policy "Brands can insert own profile"
  on public.brand_profiles for insert
  with check (user_id = auth_user_id());

create policy "Brands can update own profile"
  on public.brand_profiles for update
  using (user_id = auth_user_id())
  with check (user_id = auth_user_id());

-- Influencer profiles: readable by everyone (marketplace), writable by owner
create policy "Influencer profiles are publicly readable"
  on public.influencer_profiles for select
  using (true);

create policy "Influencers can insert own profile"
  on public.influencer_profiles for insert
  with check (user_id = auth_user_id());

create policy "Influencers can update own profile"
  on public.influencer_profiles for update
  using (user_id = auth_user_id())
  with check (user_id = auth_user_id());

-- Social accounts: only owner can CRUD
create policy "Users can read own social accounts"
  on public.social_accounts for select
  using (user_id = auth_user_id());

create policy "Users can insert own social accounts"
  on public.social_accounts for insert
  with check (user_id = auth_user_id());

create policy "Users can update own social accounts"
  on public.social_accounts for update
  using (user_id = auth_user_id())
  with check (user_id = auth_user_id());

create policy "Users can delete own social accounts"
  on public.social_accounts for delete
  using (user_id = auth_user_id());

-- Helper: is the current user a campaign participant? (security definer to avoid RLS recursion)
create or replace function public.is_campaign_participant(p_campaign_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.campaign_influencers ci
    where ci.campaign_id = p_campaign_id and ci.influencer_id = auth.uid()
  ) or exists (
    select 1 from public.campaigns c
    where c.id = p_campaign_id and c.brand_id = auth.uid()
  )
$$;

-- Helper: is the current user a conversation participant? (security definer to avoid RLS recursion)
create or replace function public.is_conversation_participant(p_conversation_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id and cp.user_id = auth.uid()
  )
$$;

-- Campaigns: brand owners can CRUD, influencers can read joined
create policy "Brands can read own campaigns"
  on public.campaigns for select
  using (
    brand_id = auth_user_id()
    or public.is_campaign_participant(id)
    or public.is_admin()
  );

create policy "Brands can insert campaigns"
  on public.campaigns for insert
  with check (brand_id = auth_user_id());

create policy "Brands can update own campaigns"
  on public.campaigns for update
  using (brand_id = auth_user_id())
  with check (brand_id = auth_user_id());

create policy "Brands can delete own campaigns"
  on public.campaigns for delete
  using (brand_id = auth_user_id());

-- Campaign influencers: participants can read, brands can manage
create policy "Campaign influencers readable by participants"
  on public.campaign_influencers for select
  using (
    influencer_id = auth_user_id()
    or public.is_campaign_participant(campaign_id)
  );

create policy "Brands can manage campaign influencers"
  on public.campaign_influencers for insert
  with check (
    exists (select 1 from public.campaigns where id = campaign_id and brand_id = auth_user_id())
  );

create policy "Brands can update campaign influencers"
  on public.campaign_influencers for update
  using (
    exists (select 1 from public.campaigns where id = campaign_id and brand_id = auth_user_id())
  );

-- Conversations: participants only
create policy "Participants can read conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = id and user_id = auth_user_id()
    )
  );

create policy "Participants can create conversations"
  on public.conversations for insert
  with check (true);

-- Conversation participants: only participants can read
create policy "Participants can read conversation participants"
  on public.conversation_participants for select
  using (
    user_id = auth_user_id()
    or public.is_conversation_participant(conversation_id)
  );

create policy "Users can insert participants"
  on public.conversation_participants for insert
  with check (true);

-- Messages: participants only
create policy "Participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth_user_id()
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    sender_id = auth_user_id()
    and exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth_user_id()
    )
  );

create policy "Participants can mark messages as read"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth_user_id()
    )
  );

-- Posts: owner can CRUD
create policy "Users can read own posts"
  on public.posts for select
  using (user_id = auth_user_id());

create policy "Users can insert posts"
  on public.posts for insert
  with check (user_id = auth_user_id());

create policy "Users can update own posts"
  on public.posts for update
  using (user_id = auth_user_id())
  with check (user_id = auth_user_id());

create policy "Users can delete own posts"
  on public.posts for delete
  using (user_id = auth_user_id());

-- Analytics: owner only
create policy "Users can read own analytics"
  on public.analytics_snapshots for select
  using (user_id = auth_user_id());

create policy "Users can insert analytics"
  on public.analytics_snapshots for insert
  with check (user_id = auth_user_id());

-- ============================================================
-- Functions
-- ============================================================

-- Auto-create public.users row on signup (via trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, display_name, photo_url, role, email_verified)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_user_meta_data ->> 'role', 'influencer'),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
