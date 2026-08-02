-- Add content_type to posts to record which media format the post uses.
alter table public.posts
  add column if not exists content_type text;

-- Destination per platform (e.g. youtube -> 'Shorts', instagram -> 'Reel').
create table if not exists public.post_target_formats (
  post_id      uuid not null references public.posts(id) on delete cascade,
  platform     text not null,
  destination  text not null,
  primary key (post_id, platform)
);

alter table public.post_target_formats enable row level security;

create policy "Users can read own target formats"
  on public.post_target_formats for select
  using (exists (select 1 from public.posts where id = post_id and user_id = auth_user_id()));

create policy "Users can insert target formats"
  on public.post_target_formats for insert
  with check (exists (select 1 from public.posts where id = post_id and user_id = auth_user_id()));

create policy "Users can update own target formats"
  on public.post_target_formats for update
  using (exists (select 1 from public.posts where id = post_id and user_id = auth_user_id()));

create policy "Users can delete own target formats"
  on public.post_target_formats for delete
  using (exists (select 1 from public.posts where id = post_id and user_id = auth_user_id()));

create index idx_post_target_formats_post on public.post_target_formats(post_id);
