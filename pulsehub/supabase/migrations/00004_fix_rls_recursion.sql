-- ============================================================
-- Fix infinite RLS recursion
-- campaigns <-> campaign_influencers and conversation_participants
-- referenced themselves in policy subqueries, causing 42P17 errors
-- that made dashboard / explore / deals queries fail.
-- ============================================================

-- Helper: is the current user a campaign participant?
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

-- Helper: is the current user a conversation participant?
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

-- Campaigns
drop policy if exists "Brands can read own campaigns" on public.campaigns;
create policy "Brands can read own campaigns"
  on public.campaigns for select
  using (
    brand_id = auth.uid()
    or public.is_campaign_participant(id)
    or public.is_admin()
  );

-- Campaign influencers
drop policy if exists "Campaign influencers readable by participants" on public.campaign_influencers;
create policy "Campaign influencers readable by participants"
  on public.campaign_influencers for select
  using (
    influencer_id = auth.uid()
    or public.is_campaign_participant(campaign_id)
  );

drop policy if exists "Brands can update campaign influencers" on public.campaign_influencers;
create policy "Brands can update campaign influencers"
  on public.campaign_influencers for update
  using (
    exists (select 1 from public.campaigns where id = campaign_id and brand_id = auth.uid())
  );

drop policy if exists "Brands can manage campaign influencers" on public.campaign_influencers;
create policy "Brands can manage campaign influencers"
  on public.campaign_influencers for insert
  with check (
    exists (select 1 from public.campaigns where id = campaign_id and brand_id = auth.uid())
  );

-- Conversation participants
drop policy if exists "Participants can read conversation participants" on public.conversation_participants;
create policy "Participants can read conversation participants"
  on public.conversation_participants for select
  using (
    user_id = auth.uid()
    or public.is_conversation_participant(conversation_id)
  );
