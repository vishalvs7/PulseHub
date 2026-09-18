# PulseHub — Database Reference

> **Single source of truth for the Supabase PostgreSQL database.**
> If you're reading this in a new session, this file tells you everything about the schema, RLS, functions, triggers, indexes, seed data, and migration history. **Do not assume any table/column exists unless it's documented here.**

---

## 1. Project Info

| Field | Value |
|-------|-------|
| **Project Ref** | `elsowkdruovxrotbxsmi` |
| **Region** | `ap-northeast-2` (Seoul) |
| **Supabase URL** | `https://elsowkdruovxrotbxsmi.supabase.co` |
| **Pooler** | `aws-1-ap-northeast-2.pooler.supabase.com:5432` (tenant: `postgres.elsowkdruovxrotbxsmi`) |
| **Status** | Live (free tier — may auto-pause after inactivity) |
| **Storage Bucket** | `post-media` (public, no file size limit) |

---

## 2. Instructions for New Sessions

### When writing queries or services:
- **Always check this file first** before assuming a table or column exists.
- The `public.users` table is the **canonical user table** — it extends `auth.users` via a trigger. Never query `auth.users` directly from client code.
- **RLS is enabled on every table** except `oauth_states`. All queries run through the Supabase client must respect RLS.
- `oauth_states` is **server-only** — access it with the `service_role` key, never the anon key.
- Platform check constraints allow exactly: `instagram`, `twitter`, `linkedin`, `tiktok`, `youtube`, `facebook`, `threads`, `pinterest`, `reddit`.
- Status check constraints use lowercase values (e.g. `draft`, `active`, `published`).
- All `uuid` primary keys use `gen_random_uuid()` as default.
- All `timestamptz` columns with `created_at`/`updated_at` default to `now()`.
- The `reach_tier` column on `influencer_profiles` is a **generated column** — do not INSERT or UPDATE it directly; it's computed from `followers_count`.
- Foreign keys use `ON DELETE CASCADE` everywhere — deleting a user cascades to all their data.
- When adding new tables, **always enable RLS and create policies** before the table is used in production.

### When running migrations:
- Migration files are in `supabase/migrations/` numbered `00001` through `00008`.
- Supabase tracks applied migrations in `supabase_migrations.schema_migrations`.
- **Never modify an already-applied migration** — create a new one instead.
- If a migration needs to be re-run, use `DROP ... IF EXISTS` + `CREATE` patterns.

### When seeding data:
- Seed file: `supabase/seed.sql`
- Auth users require `service_role` key to insert into `auth.users`.
- Seed UUIDs follow a deterministic pattern (`a0000000-...` for influencers, `b0000000-...` for brands, `c0000000-...` for campaigns, `00000000-...` for conversations).
- Seed password for all test users: `password123`.

---

## 3. Tables — Full Schema

### 3.1 `public.users`

Extends `auth.users`. Created automatically via `handle_new_user()` trigger on signup.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NOT NULL | — | **PK**, FK → `auth.users(id)` ON DELETE CASCADE |
| `email` | `text` | NOT NULL | — | User's email |
| `display_name` | `text` | NOT NULL | — | Display name |
| `photo_url` | `text` | nullable | `null` | Avatar URL |
| `role` | `text` | NOT NULL | — | CHECK: `'influencer'`, `'brand'`, `'admin'` |
| `email_verified` | `boolean` | NOT NULL | `false` | Auto-set to `true` on signup |
| `zernio_profile_id` | `text` | nullable | `null` | Added in migration 00003 |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Auto-updated via trigger |

**Indexes:** `idx_users_role` on `(role)`

**RLS Policies:**
| Policy | Operation | Rule |
|--------|-----------|------|
| Users can read own data | SELECT | `id = auth_user_id()` |
| Authenticated users can read all users | SELECT | `auth.uid() is not null` |
| Admins can read all users | SELECT | `is_admin()` |
| Users can update own data | UPDATE | `id = auth_user_id()` |
| Users can insert own data | INSERT | `id = auth_user_id()` |

---

### 3.2 `public.brand_profiles`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `user_id` | `uuid` | NOT NULL | — | **PK**, FK → `users(id)` ON DELETE CASCADE |
| `company_name` | `text` | NOT NULL | — | |
| `email` | `text` | NOT NULL | — | |
| `industry` | `text` | NOT NULL | `'General'` | |
| `company_size` | `text` | NOT NULL | `'1-10'` | CHECK: `'1-10'`, `'11-50'`, `'51-200'`, `'201-500'`, `'500+'` |
| `website` | `text` | nullable | `null` | |
| `description` | `text` | nullable | `null` | |
| `logo_url` | `text` | nullable | `null` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Auto-updated via trigger |

**RLS Policies:**
| Policy | Operation | Rule |
|--------|-----------|------|
| Brand profiles are publicly readable | SELECT | `true` |
| Brands can insert own profile | INSERT | `user_id = auth_user_id()` |
| Brands can update own profile | UPDATE | `user_id = auth_user_id()` |

---

### 3.3 `public.influencer_profiles`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `user_id` | `uuid` | NOT NULL | — | **PK**, FK → `users(id)` ON DELETE CASCADE |
| `display_name` | `text` | NOT NULL | — | |
| `email` | `text` | NOT NULL | — | |
| `photo_url` | `text` | nullable | `null` | |
| `bio` | `text` | nullable | `null` | |
| `niche` | `text[]` | NOT NULL | `'{}'` | Array of niche tags |
| `location` | `text` | NOT NULL | `'Unknown'` | |
| `website` | `text` | nullable | `null` | |
| `followers_count` | `bigint` | NOT NULL | `0` | |
| `engagement_rate` | `numeric(5,2)` | NOT NULL | `0` | Percentage |
| `trust_score` | `integer` | NOT NULL | `50` | CHECK: 0–100 |
| `is_verified` | `boolean` | NOT NULL | `false` | |
| `base_rate_min` | `numeric(12,2)` | nullable | `null` | Added in 00002 |
| `base_rate_max` | `numeric(12,2)` | nullable | `null` | Added in 00002 |
| `base_rate_currency` | `text` | NOT NULL | `'USD'` | Added in 00002 |
| `reach_tier` | `text` | GENERATED | — | **DO NOT INSERT/UPDATE.** Generated from `followers_count`: `<10K`→`nano`, `<100K`→`micro`, `<500K`→`mid`, `>=500K`→`macro` |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Auto-updated via trigger |

**Constraints:**
- `influencer_profiles_rate_range_check`: `base_rate_min <= base_rate_max` (only enforced when both are non-null)

**RLS Policies:**
| Policy | Operation | Rule |
|--------|-----------|------|
| Influencer profiles are publicly readable | SELECT | `true` |
| Influencers can insert own profile | INSERT | `user_id = auth_user_id()` |
| Influencers can update own profile | UPDATE | `user_id = auth_user_id()` |

---

### 3.4 `public.social_accounts`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | **PK** |
| `user_id` | `uuid` | NOT NULL | — | FK → `users(id)` ON DELETE CASCADE |
| `platform` | `text` | NOT NULL | — | CHECK: `'instagram'`, `'twitter'`, `'linkedin'`, `'tiktok'`, `'youtube'`, `'facebook'`, `'threads'`, `'pinterest'`, `'reddit'` |
| `username` | `text` | NOT NULL | — | Platform username |
| `profile_id` | `text` | nullable | `null` | Platform profile ID |
| `access_token` | `text` | NOT NULL | — | OAuth access token |
| `refresh_token` | `text` | nullable | `null` | OAuth refresh token |
| `expires_at` | `timestamptz` | nullable | `null` | Token expiry |
| `is_connected` | `boolean` | NOT NULL | `false` | |
| `last_synced` | `timestamptz` | nullable | `null` | |
| `zernio_profile_id` | `text` | nullable | `null` | Added in 00003 |
| `zernio_account_id` | `text` | nullable | `null` | Added in 00003 |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Indexes:** `idx_social_accounts_user` on `(user_id)`, `idx_social_accounts_platform` on `(platform)`, `idx_social_accounts_zernio` on `(zernio_account_id)`

**RLS Policies:** Owner-only CRUD (all operations check `user_id = auth_user_id()`).

---

### 3.5 `public.campaigns`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | **PK** |
| `brand_id` | `uuid` | NOT NULL | — | FK → `brand_profiles(user_id)` ON DELETE CASCADE |
| `name` | `text` | NOT NULL | — | |
| `description` | `text` | NOT NULL | `''` | |
| `platforms` | `text[]` | NOT NULL | `'{}'` | Array of platform names |
| `budget` | `numeric(12,2)` | NOT NULL | `0` | |
| `status` | `text` | NOT NULL | `'draft'` | CHECK: `'draft'`, `'active'`, `'paused'`, `'completed'`, `'cancelled'` |
| `start_date` | `date` | nullable | `null` | |
| `end_date` | `date` | nullable | `null` | |
| `target_influencers` | `integer` | NOT NULL | `0` | |
| `connected_influencers` | `text[]` | NOT NULL | `'{}'` | |
| `total_reach` | `bigint` | NOT NULL | `0` | |
| `total_engagement` | `bigint` | NOT NULL | `0` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Auto-updated via trigger |

**Indexes:** `idx_campaigns_brand` on `(brand_id)`, `idx_campaigns_status` on `(status)`

**RLS Policies:**
| Policy | Operation | Rule |
|--------|-----------|------|
| Brands can read own campaigns | SELECT | `brand_id = auth.uid()` OR `is_campaign_participant(id)` OR `is_admin()` |
| Brands can insert campaigns | INSERT | `brand_id = auth_user_id()` |
| Brands can update own campaigns | UPDATE | `brand_id = auth_user_id()` |
| Brands can delete own campaigns | DELETE | `brand_id = auth_user_id()` |

---

### 3.6 `public.campaign_influencers`

Junction table linking campaigns to influencers.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `campaign_id` | `uuid` | NOT NULL | — | FK → `campaigns(id)` ON DELETE CASCADE |
| `influencer_id` | `uuid` | NOT NULL | — | FK → `influencer_profiles(user_id)` ON DELETE CASCADE |
| `status` | `text` | NOT NULL | `'pending'` | CHECK: `'pending'`, `'accepted'`, `'declined'`, `'negotiating'`, `'completed'` |
| `earnings` | `numeric(12,2)` | nullable | `null` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Primary Key:** `(campaign_id, influencer_id)`

**Indexes:** `idx_campaign_influencers_campaign` on `(campaign_id)`, `idx_campaign_influencers_influencer` on `(influencer_id)`

**RLS Policies:** Readable by participants; insert/update by brand owner only.

---

### 3.7 `public.conversations`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | **PK** |
| `subject` | `text` | nullable | `null` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Auto-updated via trigger |

**RLS Policies:** Participants only (via `conversation_participants`).

---

### 3.8 `public.conversation_participants`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `conversation_id` | `uuid` | NOT NULL | — | FK → `conversations(id)` ON DELETE CASCADE |
| `user_id` | `uuid` | NOT NULL | — | FK → `users(id)` ON DELETE CASCADE |
| `last_read_at` | `timestamptz` | nullable | `null` | |

**Primary Key:** `(conversation_id, user_id)`

**Indexes:** `idx_conversation_participants_user` on `(user_id)`

**RLS Policies:** Readable by self or conversation participants. Insert allowed for all authenticated users.

---

### 3.9 `public.messages`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | **PK** |
| `conversation_id` | `uuid` | NOT NULL | — | FK → `conversations(id)` ON DELETE CASCADE |
| `sender_id` | `uuid` | NOT NULL | — | FK → `users(id)` ON DELETE CASCADE |
| `content` | `text` | NOT NULL | — | Message body |
| `media_url` | `text` | nullable | `null` | |
| `read` | `boolean` | NOT NULL | `false` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Indexes:** `idx_messages_conversation` on `(conversation_id)`, `idx_messages_sender` on `(sender_id)`

**RLS Policies:** Participants only. Insert requires `sender_id = auth_user_id()` AND participant status.

---

### 3.10 `public.posts`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | **PK** |
| `user_id` | `uuid` | NOT NULL | — | FK → `users(id)` ON DELETE CASCADE |
| `platform` | `text` | NOT NULL | — | Primary platform for this post |
| `platform_post_id` | `text` | nullable | `null` | ID from the social platform |
| `content` | `text` | NOT NULL | `''` | Caption / text content |
| `media_urls` | `text[]` | NOT NULL | `'{}'` | Array of media URLs |
| `content_type` | `text` | nullable | `null` | Added in 00007. Values: `'square_image'`, `'square_video'`, `'vertical_short_video'`, `'long_video'`, `'document'` |
| `scheduled_for` | `timestamptz` | nullable | `null` | When to publish |
| `published_at` | `timestamptz` | nullable | `null` | When it was published |
| `status` | `text` | NOT NULL | `'draft'` | CHECK: `'draft'`, `'scheduled'`, `'published'`, `'failed'` |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | Auto-updated via trigger |

**Indexes:** `idx_posts_user` on `(user_id)`, `idx_posts_status` on `(status)`

**RLS Policies:** Owner-only CRUD (all operations check `user_id = auth_user_id()`).

---

### 3.11 `public.post_targets`

One row per platform per post — tracks per-destination publish status.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | **PK** |
| `post_id` | `uuid` | NOT NULL | — | FK → `posts(id)` ON DELETE CASCADE |
| `platform` | `text` | NOT NULL | — | CHECK: 9 platforms (same as `social_accounts`) |
| `content` | `text` | NOT NULL | `''` | Platform-specific caption |
| `media_urls` | `text[]` | NOT NULL | `'{}'` | Platform-specific media |
| `status` | `text` | NOT NULL | `'pending'` | CHECK: `'pending'`, `'scheduled'`, `'published'`, `'failed'` |
| `platform_post_id` | `text` | nullable | `null` | ID from the platform after publish |
| `scheduled_for` | `timestamptz` | nullable | `null` | |
| `published_at` | `timestamptz` | nullable | `null` | |
| `error` | `text` | nullable | `null` | Error message if publish failed |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | |

**Unique constraint:** `(post_id, platform)`

**Indexes:** `idx_post_targets_post` on `(post_id)`, `idx_post_targets_status` on `(status)`

**RLS Policies:** Owner-only via parent `posts.user_id` check.

---

### 3.12 `public.post_target_formats`

Stores the derived destination per platform (e.g., Instagram → "Reel", YouTube → "Shorts").

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `post_id` | `uuid` | NOT NULL | — | FK → `posts(id)` ON DELETE CASCADE |
| `platform` | `text` | NOT NULL | — | |
| `destination` | `text` | NOT NULL | — | e.g. `'Reel'`, `'Shorts'`, `'Video'`, `'Post'` |

**Primary Key:** `(post_id, platform)`

**Indexes:** `idx_post_target_formats_post` on `(post_id)`

**RLS Policies:** Owner-only via parent `posts.user_id` check.

---

### 3.13 `public.analytics_snapshots`

Daily snapshots of per-platform analytics. Populated by the cron job at `/api/cron/analytics-snapshot`.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | **PK** |
| `user_id` | `uuid` | NOT NULL | — | FK → `users(id)` ON DELETE CASCADE |
| `platform` | `text` | NOT NULL | — | |
| `followers` | `bigint` | NOT NULL | `0` | |
| `following` | `bigint` | NOT NULL | `0` | |
| `posts_count` | `integer` | NOT NULL | `0` | |
| `total_likes` | `bigint` | NOT NULL | `0` | |
| `total_comments` | `bigint` | NOT NULL | `0` | |
| `total_shares` | `bigint` | NOT NULL | `0` | |
| `total_reach` | `bigint` | NOT NULL | `0` | |
| `total_impressions` | `bigint` | NOT NULL | `0` | |
| `engagement_rate` | `numeric(5,2)` | NOT NULL | `0` | |
| `snapshot_date` | `date` | NOT NULL | `current_date` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Unique constraint:** `(user_id, platform, snapshot_date)`

**Indexes:** `idx_analytics_snapshots_user` on `(user_id)`

**RLS Policies:** Owner-only (SELECT and INSERT check `user_id = auth_user_id()`).

---

### 3.14 `public.comments`

Unified comment inbox — aggregates comments from all connected social platforms.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | **PK** |
| `user_id` | `uuid` | NOT NULL | — | FK → `users(id)` ON DELETE CASCADE |
| `platform` | `text` | NOT NULL | — | CHECK: 9 platforms |
| `post_id` | `text` | NOT NULL | `''` | Platform post ID (text, not uuid) |
| `post_content` | `text` | NOT NULL | `''` | The post's content |
| `post_media_url` | `text` | nullable | `null` | |
| `author_name` | `text` | NOT NULL | `'Unknown'` | Commenter's display name |
| `author_username` | `text` | NOT NULL | `''` | Commenter's username |
| `author_avatar` | `text` | nullable | `null` | |
| `content` | `text` | NOT NULL | — | Comment body |
| `replied` | `boolean` | NOT NULL | `false` | |
| `reply_content` | `text` | nullable | `null` | Our reply text |
| `replied_at` | `timestamptz` | nullable | `null` | |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |

**Indexes:** `comments_user_id_idx` on `(user_id)`

**RLS Policies:** Owner-only CRUD (all operations check `user_id = auth_user_id()`).

---

### 3.15 `public.oauth_states`

Temporary OAuth state tokens for secure connect flow. **No RLS — server-only table.**

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | **PK** |
| `user_id` | `uuid` | NOT NULL | — | FK → `users(id)` ON DELETE CASCADE |
| `platform` | `text` | NOT NULL | — | Platform being connected |
| `state_token` | `text` | NOT NULL | — | Unique state token |
| `created_at` | `timestamptz` | NOT NULL | `now()` | |
| `expires_at` | `timestamptz` | NOT NULL | — | Expiration timestamp |

**Indexes:** `idx_oauth_states_token` on `(state_token)`, `idx_oauth_states_user` on `(user_id)`

**RLS:** **NOT enabled.** Access only via `service_role` key in server-side code. Expired states should be cleaned up periodically: `DELETE FROM public.oauth_states WHERE expires_at < NOW();`

---

## 4. Storage Buckets

| Bucket | Public | File Size Limit | Allowed MIME Types | Notes |
|--------|--------|-----------------|-------------------|-------|
| `post-media` | `true` | None | None (all types) | Used for post media uploads. Zernio proxies Supabase URLs. |

**Policies:**
| Policy | Operation | Who |
|--------|-----------|-----|
| Users can upload post media | INSERT | `authenticated` |
| Users can read post media | SELECT | `authenticated` |

---

## 5. Database Functions

### 5.1 `public.set_updated_at()`
- **Language:** PL/pgSQL
- **Purpose:** Auto-sets `updated_at = now()` on UPDATE.
- **Used by:** Trigger on `users`, `brand_profiles`, `influencer_profiles`, `campaigns`, `conversations`, `posts`.

### 5.2 `public.auth_user_id()`
- **Language:** SQL (stable)
- **Purpose:** Returns `auth.uid()`. Convenience wrapper for RLS policies.
- **Returns:** `uuid`

### 5.3 `public.is_admin()`
- **Language:** SQL (stable, **security definer**)
- **Purpose:** Checks if the current user has `role = 'admin'` in `public.users`.
- **Returns:** `boolean`
- **Why security definer:** Avoids RLS recursion when admin policies reference this function.

### 5.4 `public.is_campaign_participant(p_campaign_id uuid)`
- **Language:** SQL (stable, **security definer**)
- **Purpose:** Checks if the current user is a brand owner or influencer participant of the given campaign.
- **Returns:** `boolean`

### 5.5 `public.is_conversation_participant(p_conversation_id uuid)`
- **Language:** SQL (stable, **security definer**)
- **Purpose:** Checks if the current user is a participant in the given conversation.
- **Returns:** `boolean`

### 5.6 `public.handle_new_user()`
- **Language:** PL/pgSQL (**security definer**)
- **Purpose:** Trigger function. Auto-creates a `public.users` row when a new `auth.users` row is inserted.
- **Behavior:**
  - `id` → `new.id`
  - `email` → `new.email`
  - `display_name` → `new.raw_user_meta_data ->> 'display_name'` or fallback to email prefix
  - `photo_url` → `new.raw_user_meta_data ->> 'avatar_url'`
  - `role` → `new.raw_user_meta_data ->> 'role'` or default `'influencer'`
  - `email_verified` → `true`
  - Uses `ON CONFLICT (id) DO NOTHING` to be idempotent.

---

## 6. Triggers

| Trigger | Table | Event | Function | Notes |
|---------|-------|-------|----------|-------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user()` | Creates `public.users` row |
| `set_users_updated_at` | `users` | BEFORE UPDATE | `set_updated_at()` | |
| `set_brand_profiles_updated_at` | `brand_profiles` | BEFORE UPDATE | `set_updated_at()` | |
| `set_influencer_profiles_updated_at` | `influencer_profiles` | BEFORE UPDATE | `set_updated_at()` | |
| `set_campaigns_updated_at` | `campaigns` | BEFORE UPDATE | `set_updated_at()` | |
| `set_conversations_updated_at` | `conversations` | BEFORE UPDATE | `set_updated_at()` | |
| `set_posts_updated_at` | `posts` | BEFORE UPDATE | `set_updated_at()` | |

---

## 7. Indexes — Complete List

| Table | Index Name | Column(s) | Migration |
|-------|-----------|-----------|-----------|
| `users` | `idx_users_role` | `role` | 00001 |
| `social_accounts` | `idx_social_accounts_user` | `user_id` | 00001 |
| `social_accounts` | `idx_social_accounts_platform` | `platform` | 00001 |
| `social_accounts` | `idx_social_accounts_zernio` | `zernio_account_id` | 00003 |
| `campaigns` | `idx_campaigns_brand` | `brand_id` | 00001 |
| `campaigns` | `idx_campaigns_status` | `status` | 00001 |
| `campaign_influencers` | `idx_campaign_influencers_campaign` | `campaign_id` | 00001 |
| `campaign_influencers` | `idx_campaign_influencers_influencer` | `influencer_id` | 00001 |
| `conversation_participants` | `idx_conversation_participants_user` | `user_id` | 00001 |
| `messages` | `idx_messages_conversation` | `conversation_id` | 00001 |
| `messages` | `idx_messages_sender` | `sender_id` | 00001 |
| `posts` | `idx_posts_user` | `user_id` | 00001 |
| `posts` | `idx_posts_status` | `status` | 00001 |
| `analytics_snapshots` | `idx_analytics_snapshots_user` | `user_id` | 00001 |
| `post_targets` | `idx_post_targets_post` | `post_id` | 00002 |
| `post_targets` | `idx_post_targets_status` | `status` | 00002 |
| `post_target_formats` | `idx_post_target_formats_post` | `post_id` | 00007 |
| `comments` | `comments_user_id_idx` | `user_id` | 00005 |
| `oauth_states` | `idx_oauth_states_token` | `state_token` | 00008 |
| `oauth_states` | `idx_oauth_states_user` | `user_id` | 00008 |

---

## 8. Seed Data Summary

| Table | Rows | Notes |
|-------|------|-------|
| `auth.users` | 7 | 5 influencers + 2 brands (password: `password123`) |
| `public.users` | 7 | Auto-created via trigger (or inserted by seed) |
| `influencer_profiles` | 5 | Sarah Chen, Mike Rossi, Lena Beauty, TechGuru, FitnessFanatic |
| `brand_profiles` | 2 | Acme Corp, Nova Brand |
| `social_accounts` | 14 | Multiple platforms per user |
| `campaigns` | 5 | 3 active, 2 draft |
| `campaign_influencers` | 6 | Mix of accepted, pending, negotiating |
| `conversations` | 3 | Brand ↔ Influencer DMs |
| `conversation_participants` | 6 | 2 per conversation |
| `messages` | 6 | Sample chat threads |
| `posts` | 5 | Published posts across platforms |
| `analytics_snapshots` | 6 | One per influencer platform |

**Seed UUIDs:**
- Influencers: `a0000000-0000-0000-0000-{000000000001..05}`
- Brands: `b0000000-0000-0000-0000-{000000000001..02}`
- Campaigns: `c0000000-0000-0000-0000-{000000000001..05}`
- Conversations: `00000000-0000-0000-0000-{000000000001..03}`

---

## 9. Migration History

| # | File | What It Does |
|---|------|-------------|
| 1 | `00001_schema.sql` | Creates all core tables (12), indexes (13), RLS (all tables), functions (`set_updated_at`, `auth_user_id`, `is_admin`, `is_campaign_participant`, `is_conversation_participant`, `handle_new_user`), triggers |
| 2 | `00002_quick_wins.sql` | Adds `reach_tier` (generated column), `base_rate_min/max/currency` to `influencer_profiles`. Creates `post_targets` table with RLS |
| 3 | `00003_zernio_crossposting.sql` | Widens platform checks to 9 platforms. Adds `zernio_profile_id` to `users`, `zernio_profile_id`/`zernio_account_id` to `social_accounts`. Creates `post-media` storage bucket |
| 4 | `00004_fix_rls_recursion.sql` | Drops and recreates policies on `campaigns`, `campaign_influencers`, `conversation_participants` to fix infinite RLS recursion (uses `security definer` functions) |
| 5 | `00005_unified_comments.sql` | Creates `comments` table with RLS for unified comment inbox |
| 6 | `00006_users_readable.sql` | Adds policy allowing authenticated users to read all `users` rows (needed for messaging UI) |
| 7 | `00007_post_formats.sql` | Adds `content_type` column to `posts`. Creates `post_target_formats` table with RLS |
| 8 | `00008_oauth_states.sql` | Creates `oauth_states` table (no RLS — server-only) for OAuth connect flow |

---

## 10. Key Design Decisions

1. **`auth.users` vs `public.users`:** Supabase Auth manages `auth.users`. Our `public.users` extends it with app-specific fields (role, display_name). The trigger keeps them in sync. Never query `auth.users` from client code.

2. **`reach_tier` is generated:** It's a PostgreSQL `GENERATED ALWAYS AS ... STORED` column. You cannot INSERT or UPDATE it — it auto-updates when `followers_count` changes. Values: `nano` (<10K), `micro` (<100K), `mid` (<500K), `macro` (>=500K).

3. **Platform check constraints:** Both `social_accounts.platform` and `post_targets.platform` and `comments.platform` all share the same 9-platform CHECK constraint. If you add a new platform, you must update all three tables.

4. **`oauth_states` has no RLS:** It's accessed only server-side with `service_role`. Client code must never touch this table.

5. **`ON DELETE CASCADE` everywhere:** Deleting a user cascades to all their profiles, social accounts, posts, campaigns, messages, etc. This is intentional — no orphaned data.

6. **Security definer functions:** `is_admin()`, `is_campaign_participant()`, `is_conversation_participant()` all use `SECURITY DEFINER` to avoid RLS recursion. They run with the privileges of the function owner (the role that created them), not the calling user.

7. **`comments.post_id` is `text`, not `uuid`:** This is deliberate — platform comment IDs are strings, not UUIDs. The `post_id` field here stores the platform's native post identifier.

8. **`campaign_influencers` composite PK:** The primary key is `(campaign_id, influencer_id)` — a campaign can only have one row per influencer. Status transitions happen via UPDATE.

---

## 11. Common Pitfalls

- **Querying `auth.users` directly** — Use `public.users` instead. `auth.users` is managed by Supabase Auth and doesn't have our custom columns.
- **Forgetting RLS** — Every table has RLS. If a query returns empty, check the RLS policies first.
- **Inserting `reach_tier`** — It's generated. Omit it from INSERT/UPDATE or the query will fail.
- **Using anon key for `oauth_states`** — This table has no RLS, so the anon key returns 404. Use `service_role`.
- **Platform string casing** — All platform values are lowercase (`'instagram'`, not `'Instagram'`).
- **`updated_at` triggers** — 6 tables have auto-update triggers. You don't need to set `updated_at` manually in UPDATE queries (but it doesn't hurt if you do).
