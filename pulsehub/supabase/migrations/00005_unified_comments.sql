-- ============================================================
-- Unified Comments table
-- Aggregates comments from all connected platforms into one
-- inbox where users can view the post + platform and reply.
-- ============================================================

create table if not exists public.comments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  platform       text not null check (platform in ('instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'facebook', 'threads', 'pinterest', 'reddit')),
  post_id        text not null default '',
  post_content   text not null default '',
  post_media_url text,
  author_name    text not null default 'Unknown',
  author_username text not null default '',
  author_avatar  text,
  content        text not null,
  replied        boolean not null default false,
  reply_content  text,
  replied_at     timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Users can read own comments"
  on public.comments for select
  using (user_id = auth_user_id());

create policy "Users can insert comments"
  on public.comments for insert
  with check (user_id = auth_user_id());

create policy "Users can update own comments"
  on public.comments for update
  using (user_id = auth_user_id())
  with check (user_id = auth_user_id());

create policy "Users can delete own comments"
  on public.comments for delete
  using (user_id = auth_user_id());

create index if not exists comments_user_id_idx on public.comments (user_id);
