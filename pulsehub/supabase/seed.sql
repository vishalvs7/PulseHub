-- ============================================================
-- PulseHub Seed Data
-- Run after migration: psql -f seed.sql
-- ============================================================

-- Note: In Supabase, auth.users inserts require service_role.
-- Use the Supabase Dashboard SQL editor or run via admin API.
-- These IDs are deterministic for reproducibility.
-- Password: password123 (bcrypt cost 10, matching GoTrue requirements)

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, confirmed_at, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'sarah@example.com', '$2a$10$d2UanYyV6GnFuT7fV7T1CeOH6Hgdny9X9y0MjxuR1ALl6oTnOyWCO', now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Sarah Chen", "role": "influencer", "email_verified": true}', false, false, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'mike@example.com', '$2a$10$d2UanYyV6GnFuT7fV7T1CeOH6Hgdny9X9y0MjxuR1ALl6oTnOyWCO', now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Mike Rossi", "role": "influencer", "email_verified": true}', false, false, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'lena@example.com', '$2a$10$d2UanYyV6GnFuT7fV7T1CeOH6Hgdny9X9y0MjxuR1ALl6oTnOyWCO', now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Lena Beauty", "role": "influencer", "email_verified": true}', false, false, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'tech@example.com', '$2a$10$d2UanYyV6GnFuT7fV7T1CeOH6Hgdny9X9y0MjxuR1ALl6oTnOyWCO', now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "TechGuru", "role": "influencer", "email_verified": true}', false, false, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'fit@example.com', '$2a$10$d2UanYyV6GnFuT7fV7T1CeOH6Hgdny9X9y0MjxuR1ALl6oTnOyWCO', now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "FitnessFanatic", "role": "influencer", "email_verified": true}', false, false, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'brand@acme.com', '$2a$10$d2UanYyV6GnFuT7fV7T1CeOH6Hgdny9X9y0MjxuR1ALl6oTnOyWCO', now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Acme Corp", "role": "brand", "email_verified": true}', false, false, now(), now()),
  ('00000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'hello@novabrand.com', '$2a$10$d2UanYyV6GnFuT7fV7T1CeOH6Hgdny9X9y0MjxuR1ALl6oTnOyWCO', now(), now(), '{"provider":"email","providers":["email"]}', '{"display_name": "Nova Brand", "role": "brand", "email_verified": true}', false, false, now(), now())
on conflict (id) do nothing;

-- Auth identities (required by GoTrue for password login)
insert into auth.identities (id, user_id, provider, provider_id, identity_data, email, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, 'email', id::text,
  jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false),
  email, now(), now(), now()
from auth.users
where id in (
  'a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000002')
on conflict (provider, provider_id) do nothing;

-- Align GoTrue token fields (empty strings, not null)
update auth.users set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change = coalesce(email_change, ''),
  phone_change = coalesce(phone_change, '')
where id in (
  'a0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000002');

-- Public users
insert into public.users (id, email, display_name, photo_url, role, email_verified, created_at, updated_at)
values
  ('a0000000-0000-0000-0000-000000000001', 'sarah@example.com', 'Sarah Chen', null, 'influencer', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000002', 'mike@example.com', 'Mike Rossi', null, 'influencer', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000003', 'lena@example.com', 'Lena Beauty', null, 'influencer', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000004', 'tech@example.com', 'TechGuru', null, 'influencer', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000005', 'fit@example.com', 'FitnessFanatic', null, 'influencer', true, now(), now()),
  ('b0000000-0000-0000-0000-000000000001', 'brand@acme.com', 'Acme Corp', null, 'brand', true, now(), now()),
  ('b0000000-0000-0000-0000-000000000002', 'hello@novabrand.com', 'Nova Brand', null, 'brand', true, now(), now())
on conflict (id) do nothing;

-- Influencer profiles
insert into public.influencer_profiles (user_id, display_name, email, bio, niche, location, followers_count, engagement_rate, trust_score, is_verified, base_rate_min, base_rate_max, created_at, updated_at)
values
  ('a0000000-0000-0000-0000-000000000001', 'Sarah Chen', 'sarah@example.com', 'Lifestyle & fashion content creator', '{Lifestyle,Fashion,Travel}', 'Los Angeles, CA', 125000, 4.80, 92, true, 800, 1800, now(), now()),
  ('a0000000-0000-0000-0000-000000000002', 'Mike Rossi', 'mike@example.com', 'Adventure traveler & photographer', '{Travel,Adventure,Photography}', 'Miami, FL', 450000, 6.20, 88, true, 2500, 5500, now(), now()),
  ('a0000000-0000-0000-0000-000000000003', 'Lena Beauty', 'lena@example.com', 'Beauty & skincare expert', '{Beauty,Skincare,Makeup}', 'New York, NY', 2100000, 3.90, 95, true, 9000, 25000, now(), now()),
  ('a0000000-0000-0000-0000-000000000004', 'TechGuru', 'tech@example.com', 'Tech reviews & unboxings', '{Technology,Gadgets,Reviews}', 'San Francisco, CA', 850000, 5.40, 85, true, 5000, 12000, now(), now()),
  ('a0000000-0000-0000-0000-000000000005', 'FitnessFanatic', 'fit@example.com', 'Fitness coach & nutrition enthusiast', '{Fitness,Health,Nutrition}', 'Austin, TX', 320000, 7.10, 90, true, 1500, 4000, now(), now())
on conflict (user_id) do nothing;

-- Brand profiles
insert into public.brand_profiles (user_id, company_name, email, industry, company_size, website, description, created_at, updated_at)
values
  ('b0000000-0000-0000-0000-000000000001', 'Acme Corp', 'brand@acme.com', 'Technology', '51-200', 'https://acme.com', 'Leading tech innovation company', now(), now()),
  ('b0000000-0000-0000-0000-000000000002', 'Nova Brand', 'hello@novabrand.com', 'Fashion', '11-50', 'https://novabrand.com', 'Modern fashion & lifestyle brand', now(), now())
on conflict (user_id) do nothing;

-- Social accounts
insert into public.social_accounts (user_id, platform, username, profile_id, access_token, is_connected, last_synced, created_at)
values
  ('a0000000-0000-0000-0000-000000000001', 'instagram', 'sarahchen', 'ig_001', 'tok_sarah_ig', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000001', 'youtube', 'sarahchen', 'yt_001', 'tok_sarah_yt', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000002', 'youtube', 'miketravels', 'yt_002', 'tok_mike_yt', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000002', 'instagram', 'miketravels', 'ig_002', 'tok_mike_ig', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000002', 'tiktok', 'miketravels', 'tk_002', 'tok_mike_tk', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000003', 'tiktok', 'lenabeauty', 'tk_003', 'tok_lena_tk', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000003', 'instagram', 'lenabeauty', 'ig_003', 'tok_lena_ig', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000004', 'youtube', 'techguru', 'yt_004', 'tok_tech_yt', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000004', 'twitter', 'techguru', 'tw_004', 'tok_tech_tw', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000005', 'instagram', 'fitfanatic', 'ig_005', 'tok_fit_ig', true, now(), now()),
  ('a0000000-0000-0000-0000-000000000005', 'tiktok', 'fitfanatic', 'tk_005', 'tok_fit_tk', true, now(), now()),
  ('b0000000-0000-0000-0000-000000000001', 'instagram', 'acmecorp', 'ig_b001', 'tok_acme_ig', true, now(), now()),
  ('b0000000-0000-0000-0000-000000000001', 'twitter', 'acmecorp', 'tw_b001', 'tok_acme_tw', true, now(), now()),
  ('b0000000-0000-0000-0000-000000000002', 'instagram', 'novabrand', 'ig_b002', 'tok_nova_ig', true, now(), now())
on conflict (id) do nothing;

-- Campaigns
insert into public.campaigns (id, brand_id, name, description, platforms, budget, status, start_date, end_date, target_influencers, total_reach, total_engagement, created_at, updated_at)
values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Summer Vibes 2024', 'Promote summer collection across social platforms',
   '{Instagram,TikTok,YouTube}', 15000.00, 'active', '2024-03-01', '2024-06-30', 12, 245000, 11760, now(), now()),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Product Launch - Nova Series', 'Launch new product line with influencer partnerships',
   '{Instagram,Twitter,LinkedIn}', 25000.00, 'draft', '2024-04-01', '2024-05-31', 8, 0, 0, now(), now()),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Brand Awareness Q2', 'Increase brand visibility and recognition',
   '{Instagram,Twitter,LinkedIn,YouTube}', 20000.00, 'active', '2024-04-01', '2024-06-30', 20, 156000, 6084, now(), now()),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'Spring Collection', 'Promote new spring fashion line',
   '{Instagram,TikTok}', 12000.00, 'active', '2024-02-01', '2024-04-30', 10, 89000, 4272, now(), now()),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'Sustainable Lifestyle', 'Eco-friendly product campaign',
   '{Instagram,YouTube}', 18000.00, 'draft', '2024-05-01', '2024-07-31', 15, 0, 0, now(), now())
on conflict (id) do nothing;

-- Campaign influencers
insert into public.campaign_influencers (campaign_id, influencer_id, status, earnings)
values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'accepted', 2500.00),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'accepted', 5000.00),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'pending', null),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'accepted', 3500.00),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'accepted', 8000.00),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'negotiating', null)
on conflict (campaign_id, influencer_id) do nothing;

-- Conversations (Brand → Influencer DMs)
insert into public.conversations (id, subject, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', 'Collaboration: Summer Vibes 2024', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'Partnership opportunity', now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'Spring Collection campaign', now(), now())
on conflict (id) do nothing;

insert into public.conversation_participants (conversation_id, user_id, last_read_at)
values
  ('00000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', now()),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', now()),
  ('00000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', now()),
  ('00000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', now()),
  ('00000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', now()),
  ('00000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', now())
on conflict (conversation_id, user_id) do nothing;

insert into public.messages (conversation_id, sender_id, content, read, created_at)
values
  ('00000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Hi Sarah! We love your content and would like to collaborate on our Summer Vibes campaign.', true, now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Thanks for reaching out! I''d love to work together. What did you have in mind?', true, now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'We''re looking for 3 Instagram posts and 2 TikTok videos over 2 months. Budget is flexible!', false, now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Hey TechGuru! Interested in reviewing our new Nova Series products?', true, now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'Absolutely! I''ve been following your brand. Send over the details.', true, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'Hi Lena! We''d love to feature you in our Spring Collection campaign.', false, now() - interval '6 hours');

-- Posts
insert into public.posts (user_id, platform, content, media_urls, status, published_at, created_at, updated_at)
values
  ('a0000000-0000-0000-0000-000000000001', 'instagram', 'Loving the summer vibes with @AcmeCorp! ☀️', '{"https://picsum.photos/seed/sarah1/800/800"}', 'published', now() - interval '2 days', now(), now()),
  ('a0000000-0000-0000-0000-000000000001', 'tiktok', 'Summer fashion haul with Acme! #SummerVibes2024', '{"https://picsum.photos/seed/sarah2/800/800"}', 'published', now() - interval '1 day', now(), now()),
  ('a0000000-0000-0000-0000-000000000002', 'youtube', 'Exploring Miami with Acme products - full vlog', '{"https://picsum.photos/seed/mike1/1280/720"}', 'published', now() - interval '3 days', now(), now()),
  ('a0000000-0000-0000-0000-000000000004', 'youtube', 'Acme Nova Series - Honest Review', '{"https://picsum.photos/seed/tech1/1280/720"}', 'published', now() - interval '5 days', now(), now()),
  ('b0000000-0000-0000-0000-000000000001', 'instagram', 'Excited to announce our Summer Vibes campaign!', '{"https://picsum.photos/seed/acme1/800/800"}', 'published', now() - interval '1 week', now(), now());

-- Analytics snapshots
insert into public.analytics_snapshots (user_id, platform, followers, following, posts_count, total_likes, total_comments, total_shares, total_reach, total_impressions, engagement_rate, snapshot_date)
values
  ('a0000000-0000-0000-0000-000000000001', 'instagram', 125000, 1200, 24, 45000, 3200, 1800, 89000, 120000, 4.80, current_date),
  ('a0000000-0000-0000-0000-000000000001', 'youtube', 30000, 500, 8, 12000, 2400, 1500, 45000, 67000, 8.10, current_date),
  ('a0000000-0000-0000-0000-000000000002', 'youtube', 450000, 800, 42, 89000, 12500, 6700, 312000, 450000, 6.20, current_date),
  ('a0000000-0000-0000-0000-000000000003', 'tiktok', 2100000, 300, 156, 345000, 28000, 15600, 890000, 1200000, 3.90, current_date),
  ('a0000000-0000-0000-0000-000000000004', 'youtube', 850000, 600, 67, 156000, 18400, 9200, 520000, 780000, 5.40, current_date),
  ('a0000000-0000-0000-0000-000000000005', 'instagram', 320000, 950, 45, 67000, 8900, 4200, 198000, 310000, 7.10, current_date);
