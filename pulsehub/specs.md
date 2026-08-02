# PulseHub — Specs & Discussion

## What PulseHub Is
A dual-sided SaaS platform where brands and influencers manage their entire social media presence and collaborations in one place.

- **Brands** connect their social accounts, schedule cross-platform posts, monitor all comments/likes/DMs via a unified inbox, view aggregated analytics, and discover/reach out to influencers.
- **Influencers** list themselves in the marketplace, connect their social accounts, track analytics, manage brand collaborations, and communicate with brands in-app.
- **Admin** oversees platform activity, manages users, and moderates the marketplace.

---

## Social Media Integration — Feasibility Report

### Per-Platform Breakdown

| Feature | Instagram | Twitter/X | LinkedIn | TikTok | YouTube | Facebook |
|---------|-----------|-----------|----------|--------|---------|----------|
| **Posting** | ✅ Graph API (business) | ✅ API v2 | ✅ Page API | ⚠️ Content API (approval) | ✅ Data API | ✅ Graph API |
| **Read Comments** | ✅ Graph API | ✅ v2 search/timeline | ✅ API | ⚠️ Comment API (approval) | ✅ Data API | ✅ Graph API |
| **Reply to Comments** | ✅ Graph API | ✅ v2 | ✅ API | ⚠️ Comment API | ✅ Data API | ✅ Graph API |
| **Read DMs** | ⚠️ Messaging API (restricted) | ✅ DM API (OAuth scope) | ❌ Requires partnership | ❌ Not available | ❌ Not available | ✅ Pages API (approval) |
| **Read Likes/Reactions** | ✅ Graph API | ✅ API v2 | ✅ API | ❌ Not available | ✅ Data API | ✅ Graph API |
| **Analytics** | ✅ Graph API | ✅ API v2 | ✅ API | ✅ Business API | ✅ Analytics API | ✅ Graph API |

**Legend:** ✅ = Feasible | ⚠️ = Feasible but requires app review/approval | ❌ = Not publicly available

### Key Constraints

**1. Instagram**
- **Posting** requires an Instagram Business or Creator account connected to a Facebook Page
- **DMs** require Instagram Messaging API — app review, business verification, and Facebook App Review. Can take weeks.
- **Analytics** require `instagram_business_account` with `pages_read_engagement` permission

**2. Twitter/X**
- Free tier: 1,500 tweets/month, read-only access to DMs
- Basic tier ($100/mo): 3,000 tweets/month, full DM access
- Pro tier ($5,000/mo): 1M tweets/month
- Best API documentation of all platforms

**3. LinkedIn**
- **Posting** only works for LinkedIn Pages (not personal profiles)
- **DMs** require LinkedIn Messaging API — enterprise partnership only, not available for small apps
- Can use in-app chat as workaround

**4. TikTok**
- Content Posting API requires Business Account + App Review + access to specific scopes
- Comment API currently in closed beta
- DM API does not exist
- Analytics API available but requires Business account

**5. YouTube**
- Quota-limited (10,000 units/day default, can request more)
- DM API does not exist
- Best for video content management

**6. Facebook**
- Posting only works for Pages, not personal profiles
- DM reading works for Page conversations via Pages API
- Requires Facebook App Review

### Authentication Complexity
Each platform has its own OAuth flow:
- **Instagram/Facebook**: Facebook Login + Graph API tokens (60-day expiry, need page access tokens)
- **Twitter**: OAuth 1.0a (user context) + OAuth 2.0 (for v2 API)
- **LinkedIn**: OAuth 2.0 with specific scopes (2-month access tokens, refresh via service)
- **TikTok**: OAuth 2.0 with specific scopes (renewable access tokens)
- **YouTube**: Google OAuth 2.0 (7-day expiry for offline access, must refresh)

Total: 5 different OAuth flows to implement and maintain.

---

## Recommended Implementation Strategy

### Phase A — MVP (what we build first)
Focus on the features that are:
1. Highest value to users
2. Lowest implementation complexity

Priority order:

1. **Cross-Platform Posting** (Post once → publish to Instagram + Twitter + LinkedIn + Facebook)
   - Build a scheduling/composer UI
   - Each platform has its own adapter/service
   - Content adaptation (image resizing, character limits per platform)

2. **Unified Analytics Dashboard**
   - Fetch follower counts, engagement rate, reach, impressions from each platform's API
   - Store daily snapshots in `analytics_snapshots` table
   - Display trends, comparisons, exportable reports

3. **Unified Inbox (Comment/Likes only — skip DMs)**
   - Aggregate comments and replies from all connected platforms
   - In-app reply capability
   - DM aggregation deferred — use in-app chat for brand↔influencer communication

4. **In-App Chat (already partially designed)**
   - Brands can reach out to influencers
   - Campaign negotiation happens in-app
   - This replaces the need for platform DM integration for the core use case

### Phase B — Later
5. Platform DM integration (Instagram, Facebook, Twitter — the ones that allow it)
6. TikTok posting (once approved)
7. Smart scheduling (AI-recommended post times based on platform analytics)

### The "Post Once, Publish Everywhere" Feature
This is the flagship feature. Architecture:

```
User creates post in composer
       ↓
Content adaptation layer (resize images, truncate text per platform)
       ↓
Platform services (instagram.service.ts, twitter.service.ts, etc.)
       ↓
Each calls its respective API
       ↓
Status tracked in `posts` table per platform
       ↓
Analytics backfill after publishing
```

**Content adaptation requirements:**
- Images: Instagram (1:1, 4:5), Twitter (16:9, 4:5), LinkedIn (1.91:1, 1:1), Facebook (1.91:1, 4:5)
- Videos: Different max lengths per platform
- Text: Character limits (Twitter: 280/4000, Instagram: 2200, LinkedIn: 3000, Facebook: 63206)

---

## Alternative Approaches (if direct API integration is too heavy)

### Option 1: N8N/Make/Zapier Backend
Instead of building direct platform integrations, use n8n (self-hosted, free) as a middleware layer:
- User creates post in PulseHub
- PulseHub sends webhook to n8n workflow
- n8n handles the multi-platform posting
- n8n fetches comments/analytics and sends back to PulseHub webhook
- **Pro:** Months of dev time saved, rate limiting handled externally
- **Con:** Another service to maintain, less control

### Option 2: Buffer/Hootsuite-Style (Schedule + Redirect)
- Build the composer/scheduler in PulseHub
- When it's time to post, open the platform's native sharing sheet (mobile) or copy to clipboard
- User manually pastes on each platform
- For analytics: use platform-specific embedded widgets/iframes
- **Pro:** Zero API integration needed
- **Con:** Not truly automated, worse UX

### Option 3: Hybrid MVP
- Build posting for Twitter + LinkedIn (best APIs)
- Build analytics for all platforms (read-only APIs are more accessible)
- Build unified inbox for comments only (no DMs)
- Use in-app chat for messaging
- Add Instagram/Facebook posting after app review
- Defer TikTok entirely

**This is what I recommend.**

---

## Technical Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | Next.js 16 + React 19 | Already set up |
| Styling | Tailwind CSS v4 | Already set up |
| Auth | Supabase Auth | Already set up |
| Database | Supabase (PostgreSQL) | Schema ready |
| Social APIs | Direct REST + OAuth | Each platform has dedicated service |
| Deployment | Vercel | Recommended for Next.js |
| File Storage | Supabase Storage / Uploadthing | For post media |
| Background Jobs | Inngest / Cron | For scheduled posting, analytics sync |

---

## Todo List (Session Plan)

### Phase 1 ✅ — Cleanup (Done)
- [x] Delete Firebase, redundant configs
- [x] Fix hardcoded admin credentials
- [x] Wire sidebar into layouts
- [x] Fill empty stub files
- [x] Fix build errors

### Phase 2 ✅ — Database & Auth (Done)
- [x] Create full Supabase schema with RLS
- [x] Create seed data
- [x] Harden auth service
- [x] Create admin client + auth callback

### Phase 3 ⬜ — Core Services & Real Data
- [ ] Build `brand.service.ts` — CRUD for brand profiles, campaign management with real DB queries
- [ ] Build `influencer.service.ts` — profile management, trust score, marketplace listing
- [ ] Build `marketplace.service.ts` — search, filter, discover influencers
- [ ] Build `analytics.service.ts` — fetch from DB/APIs, aggregate

### Phase 4 ⬜ — Replace Placeholder Data
- [ ] Wire brand dashboard to real data
- [ ] Wire influencer dashboard to real data
- [ ] Wire campaigns page to real data
- [ ] Wire marketplace to real data
- [ ] Wire analytics pages to real data

### Phase 5 ⬜ — Social Platform Integration
- [ ] Design OAuth connection flow (each platform)
- [ ] Build `instagram.service.ts`
- [ ] Build `twitter.service.ts`
- [ ] Build `linkedin.service.ts`
- [ ] Build post composer UI (cross-platform)
- [ ] Build unified inbox (comments only)
- [ ] Build scheduled posting system

### Phase 6 ⬜ — Chat, Admin & Polish
- [ ] Build real-time in-app chat
- [ ] Admin panel with user/campaign management
- [ ] Email notifications
- [ ] Error handling & monitoring

---

# Product Specification (v2) — Development Specification

> Authoritative product spec. Where this conflicts with earlier sections above, this section wins.

## 1. Project Overview & Vision

A unified social media platform for two roles: **Brands** and **Influencers**, serving two core utilities:

1. **Cross-Posting & Publishing SaaS Engine** — upload media once, visually preview how it renders natively across multiple networks, and schedule/publish to all platforms simultaneously.
2. **Influencer Discovery & Campaign Marketplace** — brands search creators by reach tier, primary platforms, and niche, then initiate campaigns directly via a built-in real-time messaging system.

## 2. Technical Stack (v2)

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router, Server Actions, API Routes) |
| Database & Auth | Supabase (PostgreSQL, Supabase Auth with RBAC + Row Level Security) |
| Storage | Supabase Storage / AWS S3 (short-form video & visual assets) |
| Real-Time | WebSockets via Supabase Realtime (or Stream Chat SDK) |
| Social Middleware / API Layer | **Unified Social API Aggregator** (e.g., Zernio / Postproxy / Phyllo) to bypass per-platform app-review bottlenecks and handle OAuth token refresh cycles |
| UI | Tailwind CSS, custom Shadcn-style UI components |
| Language | TypeScript |

## 2.1 In-Scope Social Platforms

Platforms actively supported for posting, analytics, and inbox aggregation in the codebase. Everything else is treated as out-of-scope content (still counted for char limits in tools, but not integrated).

| Platform | Posting | Analytics | Inbox (Comments) | Notes |
|----------|---------|-----------|------------------|-------|
| **Instagram** | ✅ (Graph API, business/creator acct) | ✅ | ✅ (comments via Graph API) | DMs out of scope (Messaging API review) |
| **X / Twitter** | ✅ (API v2) | ✅ | ✅ (mentions via v2) | Free-tier DM read-only; posting limited by plan |
| **LinkedIn** | ✅ (w_member_social / w_organization_social) | ✅ | 🟡 (post comments API) | DMs out of scope (requires partnership) |
| **Reddit** | ✅ (OAuth submit) | 🟡 (basic via posts) | ❌ | Retained for posting only |

**Explicitly out of scope:** TikTok (Content/Comment API still gated), YouTube (view/analytics read-only only), Facebook Pages (defer — reuses Instagram Graph stack if added later), and all platform DMs (replaced by in-app chat).

Implementation files: `src/services/social/{instagram,twitter,linkedin,reddit}.service.ts`, `oauth.service.ts`, `posting.service.ts`.

## 3. Key Architecture & Feature Requirements

### Feature 1: Role-Based User Onboarding & Search Engine
- **Database:** Extended `profiles` table with `role` (`BRAND` vs `INFLUENCER`).
  - `brand_profiles`: industry, budget ranges, company size, website.
  - `influencer_profiles`: bio, **reach tier (Nano, Micro, Mid, Macro)**, **primary platforms** (`['instagram', 'tiktok', 'youtube']`), niche, engagement rates, and **base sponsorship rates**.
- **Influencer Search:** directory for brands with filter facets — Reach Tier, Platform, Niche, Keyword search — via PostgreSQL Full-Text Search or Meilisearch.

### Feature 2: Interactive Cross-Posting Window & Multi-Platform Preview
- **4-Step Wizard (`PostComposer.tsx`):**
  1. **Content Type** — pick media format first: Square Image, Square Video, Vertical Short Video, Long Video, Document. Each card shows its aspect ratio as a dotted-line shape and which platforms support it (brand logos).
  2. **Accounts & Text** — only platforms compatible with the chosen format are shown (e.g. vertical video → IG/TikTok/YouTube/FB; long video → no TikTok; document → LinkedIn/X/FB/Reddit). Upload media (type-restricted), write caption, toggle accounts; each selected platform shows its derived destination ("as Reel" / "as Shorts" / "as Video").
  3. **Preview** — live native-looking mock frames per selected platform (`PlatformPreviews.tsx`): IG feed card, TikTok 9:16 with action rail, YouTube thumbnail with Shorts badge, LinkedIn document card, X, FB, Threads, Pinterest, Reddit.
  4. **Schedule** — Post Now or Schedule Later (date + time).
- **Destination derivation:** content type drives per-platform destination (`postFormats.ts`), e.g. vertical short video + YouTube → **YouTube Shorts**; + Instagram → **Reel**. Stored in `posts.content_type` and `post_target_formats`, forwarded to Zernio as `platformSpecificData`.
- **Preview Rendering Engine:**
  - Custom CSS/SVG platform mock frames simulating native overlays (TikTok side icons, IG bottom overlays) over the uploaded media (`object-fit: cover`).
  - Real-time character limit validation per platform (warning when X exceeds 280 chars, etc.).

### Feature 3: In-App Direct Messaging & Campaign Workspace
- Real-time messaging bound by a **`Deals` / `Inquiries` state machine** (`PENDING` → `OFFER_SENT` → `ACCEPTED` → `COMPLETED`).
- RLS ensures channels are only accessible by the specific `brand_id` and `influencer_id`.
- Chat window must support embedding **campaign briefs, milestones, and proposal approvals inline** inside the chat thread.

### Feature 4: Unified Analytics Pipeline
- Background worker/cron queue (BullMQ or Supabase Edge Functions) polls platform APIs every 6–12 hours for updated engagement metrics.
- Standardized schema normalizing platform-specific terms into a unified **`views`** metric column (YouTube Views, TikTok Video Views, IG Reel Plays → `views`).

### Feature 5: Growth Micro-Tools (Marketing & SEO)

Low-effort, standalone tools that drive organic traffic and solve real creator pain points. All run client-side (no backend), so they're quick to ship and double as SEO landing pages.

#### 5.1 Influencer Rate & ROI Calculator
- **What:** A free interactive calculator for both brands and creators.
  - Influencers input follower count, engagement rate, and niche → get a realistic price range to charge per post/Reel.
  - Brands input campaign budget → get expected reach, impressions, and estimated engagement across platforms.
- **Why it works:** Pricing in the influencer space is notoriously opaque; both sides constantly search "how much should I charge for a TikTok post?".
- **Effort:** Very Low (1 day) — pure React state with custom formulas. Great for SEO growth (attracts organic search traffic).

#### 5.2 Smart Caption Trimmer & Thread Splitter
- **What:** A text formatting sandbox where users paste a long-form article/script and it automatically:
  - Formats & splits into a numbered X (Twitter) thread respecting 280-char boundaries.
  - Formats into a LinkedIn post with optimal line-spacing and line breaks.
  - Generates an Instagram caption with a hidden hashtag block (`...` vertical breaks).
- **Why it works:** Saves manual copy-pasting and wrestling with LinkedIn's spacing rules.
- **Effort:** Very Low (1–2 days) — client-side string-manipulation; no AI required (optional low-cost OpenAI call for re-summarization).

#### 5.3 Multi-Platform Character & Hashtag Counter (Micro-Tool)
- **What:** A clean text editor validating text against all platform limits simultaneously in real time:
  - X: 280 chars
  - TikTok: 2,200 chars
  - Instagram: 2,200 chars + 30 hashtags max
  - LinkedIn: 3,000 chars
- **Effort:** Extremely Low (half a day) — pure React `onChange` character-counting.
- **Note:** This is the same validation logic required by the Feature 2 preview engine — build once, reuse in both places.

#### 5.4 Timing Optimization: Dynamic "Best Time to Post" Heatmaps
- **What:** Pull audience activity metrics via social APIs to generate an hour-by-hour heatmap for each connected account, instead of static scheduling (posting when an audience is offline kills initial reach).
- **How it works:** Provide an **"Auto-Queue at Peak Hour"** button. If TikTok peaks at 8:00 PM and LinkedIn at 8:30 AM, the post auto-schedules per-platform to each account's optimal window.

#### 5.5 Audience Conversion: "Comment-to-DM" Automation
- **What:** Social algorithms favor fast comment velocity. Encourage CTAs like *"Comment 'PLAN' below to get the free template in your DMs"*.
- **How it works:** Integrate automated DM triggers (like ManyChat). When a follower comments a keyword on Instagram, Facebook, or TikTok, the platform automatically sends a private DM with the link/lead magnet/product page.
- **Outcome:** Turns vanity engagement into email leads, sales, or website traffic.

## 4. Critical Technical Constraints, Edge Cases & Workarounds

1. **Anti-Leakage Mechanisms in Chat** — backend sanitization/regex to flag or redact explicit attempts to move conversations off-platform (raw emails, phone numbers, external payment links) until an active deal milestone is created.
2. **Cross-Posting API Limits & Video Processing** — never stream video uploads to TikTok/Instagram Graph APIs synchronously inside a Next.js API route. Use an async job/queue model. Videos must live in public S3 or Supabase Storage signed URLs (Meta/TikTok pull media via URL fetch endpoints).
3. **TikTok Direct Posting API** — strict rate limits (~6 publish ops/min per user token), requires explicit media upload initialization steps; posting status must display gracefully in the UI.
4. **Database Security (Supabase RLS)** — brands can view public influencer metadata but must not read other brands' direct messages or unpublished post drafts.
5. **Visual Overlay Compatibility** — provide visual "safe zone" overlays in the preview renderer so creators know if burned-in text/elements will be obscured by TikTok/Reel native buttons (right margin).

## 5. Immediate Next Execution Tasks

1. Add scheduled-posts management UI (list/view/cancel) + Zernio sync/status polling.
2. Build real-time deal-based chat (Supabase Realtime) with the `deals` state machine + anti-leakage sanitization.
3. Wire per-platform posting adapters for scheduled (non-now) delivery and destination-specific formatting (Shorts/Reel) as Zernio supports them.

## 6. Implementation Status vs Spec (Gap Analysis)

| Spec requirement | Status in codebase |
|---|---|
| Next.js App Router + Supabase + TS + Tailwind | ✅ Done |
| Auth: role-based `profiles` (ours: `users` table w/ role) | ✅ Done |
| `brand_profiles` (industry, size, website) | ✅ Done (no budget-range column) |
| `influencer_profiles` (bio, niche, engagement, verified) | ✅ Done |
| Influencer **reach tier** (Nano/Micro/Mid/Macro) | ✅ Done (generated column from `followers_count`, tier filter in marketplace) |
| Influencer **base sponsorship rates** | ✅ Done (`base_rate_min`/`base_rate_max`/`base_rate_currency`; marketplace uses them with heuristic fallback) |
| Influencer search facets (niche, followers, keyword) | 🟡 Partial (ilike/contains filters + reach-tier facet; no FTS/Meilisearch) |
| Cross-posting **4-step wizard composer** (content type → accounts → preview → schedule) | ✅ Done (`PostComposer.tsx` — steps: media format, eligible-account picker, live previews, schedule) |
| Platform-native preview frames + CSS overlays | ✅ Done (`PlatformPreviews.tsx` — IG/X/LinkedIn/TikTok/YouTube/FB/Threads/Pinterest/Reddit mock frames) |
| Content-type → platform targeting (e.g. vertical video → IG Reel / TikTok / YouTube Shorts) | ✅ Done (`postFormats.ts` — 5 content types, eligibility per type, derived per-platform destination) |
| Media **uploader** (video/asset → Supabase Storage signed URL) | ✅ Done (`/api/social/zernio/upload`, `post-media` bucket) |
| Character-limit validation | ✅ Done (per-platform char counters in Step 2) |
| `post_targets` table (per-platform post status) | ✅ Done (table + RLS; `posting.service` writes/updates targets per platform) |
| Deals/Inquiries state machine + `deals` table | ❌ Missing (`campaigns.status` exists, different model) |
| Real-time chat (Supabase Realtime) | ❌ Missing (inbox is placeholder UI) |
| Chat anti-leakage sanitization | ❌ Missing |
| Inline campaign briefs/milestones in chat | ❌ Missing |
| Unified analytics pipeline (cron poll 6–12h) | ❌ Missing (snapshots exist, no worker) |
| Unified **`views`** metric normalization | ❌ Missing (`analytics_snapshots` has reach/impressions only) |
| Social OAuth connect (IG/Twitter/LinkedIn) | 🟡 Scaffolded (OAuth service + connect/callback routes; needs app credentials + app review) |
| Social middleware aggregator (Zernio) | ✅ Done (Zernio service + cross-posting live via Zernio API; upload, connect, sync, posts routes) |
| Shadcn UI | ❌ Using custom UI components |
| Brand logos in UI (react-icons) | ✅ Done (`BrandIcon.tsx` — real SVG logos across composer/sidebar) |
| 5.1 Rate & ROI Calculator | ✅ Done (`/tools/rate-calculator`, `RateCalculator.tsx`) |
| 5.2 Caption Trimmer & Thread Splitter | ✅ Done (`/tools/thread-splitter`, `ThreadSplitter.tsx`) |
| 5.3 Character & Hashtag Counter | ✅ Done (`/tools/char-counter`, `CharCounter.tsx`, shared `socialLimits.ts`) |
| 5.4 "Best Time to Post" heatmaps | 🟡 Done as demo (static activity model; needs analytics worker + live audience metrics) — `/brand/[uid]/best-time-to-post` |
| 5.5 Comment-to-DM automation | 🟡 Done as draft builder (saved to localStorage; needs DM-capable platform APIs) — `/brand/[uid]/comment-to-dm` |
| Creator Academy (docs + sidebar) | ✅ Done (`/academy`, `/academy/[slug]`, 4 modules / 13 docs, docs-style layout) |

**Overall alignment: the foundation (~65%) is in place** — auth/RBAC, both profile tables (incl. reach tier + base rates), RLS, campaigns, marketplace search (incl. reach-tier facet), `post_targets`, analytics schema, OAuth scaffolding, all five growth micro-tools, the Creator Academy, plus the flagship **cross-posting wizard** (content-type targeting → eligible accounts → live platform previews → scheduling) on the Zernio aggregator. The remaining headline features (real-time deal-based chat, analytics pipeline, native OAuth posting without Zernio) are still unbuilt.

**Closest wins:** All five micro-tools (5.1–5.5) are now shipped and client-side. 5.4 needs Feature 4's analytics worker for real audience metrics; 5.5 needs DM-capable platform integrations (Instagram/Facebook/TikTok), which the spec defers to the social middleware aggregator.

---

# Session Log — Live DB, Auth, AI & Mobile-First

Recent working sessions and their outcomes. Supabase is now the **live production database** (project `elsowkdruovxrotbxsmi`, region `ap-northeast-2`), fully migrated, seeded, and verified end-to-end.

## What Was Done Recently

### 1. Supabase Live Database (Applied & Verified)
- **Migrations applied to the cloud project:** `supabase/migrations/00001_schema.sql` (12 tables: `users`, `brand_profiles`, `influencer_profiles`, `posts`, `post_targets`, `campaigns`, `campaign_influencers`, `social_accounts`, `analytics_snapshots`, `conversations`, `messages`, `notifications`; 38 RLS policies; functions `set_updated_at`, `auth_user_id`, `handle_new_user`, `is_admin`; triggers) and `00002_quick_wins.sql` (`reach_tier` generated column on `influencer_profiles`, `base_rate_min`/`base_rate_max`/`base_rate_currency` on `influencer_profiles`, `post_targets` table).
- **Migration bugs fixed:** `CREATE TRIGGER IF NOT EXISTS` → DO-loop drop+create; `CREATE OR REPLACE TRIGGER` → drop+create; **infinite RLS recursion** on "Admins can read all users" → security-definer `is_admin()` helper (both live DB and migration file updated).
- **Seed applied:** 7 users, 5 influencers, 2 brands, 5 campaigns, 28 social accounts, 3 conversations, 6 messages, 6 analytics snapshots; seed UUIDs fixed to valid UUIDs.
- **Verified e2e:** auth signup triggers `handle_new_user` → `public.users` row auto-created; RLS returns only own row; `influencer_profiles` insert works; `reach_tier='micro'` derived for 12.5k followers; posts + `post_targets` insert fine.
- **Access:** pooler session mode `aws-1-ap-northeast-2.pooler.supabase.com:5432`, tenant `postgres.elsowkdruovxrotbxsmi`.

### 2. Auth Flow (Working End-to-End)
- Register → `/api/auth/register` (admin `createUser` with **`email_confirm: true`** — email verification auto-approved) → redirect to `/login`.
- Login → `AuthService.loginWithEmail` → `signInWithPassword` → role from `users.role` (with admin override via `/api/auth/admin/check`) → `redirectPath` per role.
- **Middleware fixed:** previously checked a cookie named `sb-access-token`, which `@supabase/ssr` never creates (real cookie: `sb-<project-ref>-auth-token`). Rewrote `src/middleware.ts` to use `createServerClient` + `supabase.auth.getUser()`, and added role-based enforcement:
  - Unauthenticated on a protected route → `/login?redirect=...`
  - Authenticated on `/login` or `/register` → redirected to their own role dashboard
  - Authenticated on a wrong-role path (e.g. brand on `/influencer/...`) → redirected to their own dashboard
- **E2E verified live:** influencer → `/influencer/[uid]`, brand → `/brand/[uid]`; test users cleaned up after.

### 3. AI Content Generation (Working)
- **`/api/ai/generate`** route: `single` mode (full post) and `platforms` mode (per-platform captions with `<<<platform:...>>>` markers), streaming response.
- Provider: **Groq** (`llama-3.3-70b-versatile`) for captions — verified streaming live.
- **Gemini** for content generation: model updated to `gemini-3.5-flash` (`gemini-2.5-flash`/`-lite` unavailable to new users). Key + project number in `.env.local`, verified working.
- UI: `src/components/ai/` (composer integration), `/influencer/[uid]/ai` and `/brand/[uid]/ai` pages.

### 4. Mobile-First Responsive (Done)
- `Sidebar.tsx` → slide-in drawer on `<lg` (`fixed inset-y-0`), fixed rail + collapse on desktop; closes on nav click (`onNavigate`).
- `SiteNav.tsx` hamburger menu; brand/influencer layouts `min-h-screen lg:h-screen lg:flex` with `px-4 pt-20 lg:p-8` main.
- Homepage hero responsive; `SiteFooter.tsx` added.
- Build green.

### 5. Pricing & Zernio Scope Decision
- **Pricing page** (`/pricing`): 4-tier grid, Free tier ($0/30 posts), Popular/Free badges; config in `src/config/features.ts`.
- **Zernio decision (brainstorm):** Zernio covers **only** cross-posting + unified comments/likes/inbox vertical. Everything else (AI, marketplace, analytics intelligence, academy) stays custom stack. `ZERNIO_API_KEY` added to env **only** — building on Zernio is paused pending explicit go-ahead.

## What's Working

- ✅ Auth register → login → role-based dashboard redirect (verified live, middleware fixed)
- ✅ Email verification auto-approved on registration
- ✅ RLS + schema + seed on live Supabase (all policies verified)
- ✅ AI content generation (Groq + Gemini, single & platforms modes)
- ✅ Mobile-first responsive UI (drawer sidebar, hamburger nav)
- ✅ Pricing page, Creator Academy, all 5 growth micro-tools
- ✅ **Cross-posting wizard** (4 steps: content type → accounts → preview → schedule) on Zernio aggregator
- ✅ **Unified comment inbox** (long-card UI, search, platform filters, inline replies, RLS policies + 12 seeded comments)
- ✅ **Comment-to-DM** automation with link **and document (PDF/DOCX) sharing**
- ✅ Auth deadlock fix (pages load on full reload); users-readable RLS policy (no more 406s on deals)
- ✅ `npm run build` passes

## What's Not Working / Not Built

- ❌ **Platform OAuth connect** (IG/Twitter/LinkedIn/Reddit) — service + routes scaffolded, but no app credentials / app review yet; posting currently routes through Zernio aggregator
- ❌ **Zernio scheduling polish** — cross-posting works via Zernio; scheduled posting and per-destination (Shorts/Reel) behavior depend on Zernio capabilities
- ❌ **Real-time deal-based chat** + anti-leakage sanitization — inbox is placeholder UI
- ❌ **Unified analytics pipeline** (cron 6–12h) + unified `views` metric — snapshots exist, no worker
- ❌ **Admin panel** — no admin dashboard page
- 🟡 "Best Time to Post" + Comment-to-DM — demo/draft only (need analytics worker / DM-capable platform APIs)
- 🟡 Marketplace search — ilike/contains + reach-tier facet (no FTS/Meilisearch)

## Deployment (Vercel — Live)

- **URL:** `https://prepost-app.vercel.app` (production). Note: `prepost.vercel.app` and `pulsehub.vercel.app` are both taken by other Vercel accounts/teams.
- **Project:** `pulsehub` under team `amp-global`; `vercel.json` (Next.js framework, `npm run build`).
- **Git integration:** connected to `github.com/vishalvs7/PulseHub`; production branch `main` — pushes to `main` auto-deploy to production. `rootDirectory` set to `pulsehub` (app lives in the `pulsehub/` subdir of the repo).
- **Env vars pushed to Vercel (production):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `GEMINI_PROJECT_NUMBER`, `ZERNIO_API_KEY`. `VERCEL_TOKEN` is stored in local `.env.local` only (gitignored).
- **Verified live:** homepage, register, login, pricing, tools all 200; register API creates auto-confirmed users; login → role dashboard redirect works; middleware protects `/influencer|brand|admin/[uid]` (307 → `/login?redirect=...`).
- **Known deployment warning:** Next.js reports `middleware` file convention deprecated → use `proxy` instead (Next 16). Non-blocking; build succeeds.

## Recent Session (Cross-Posting Wizard + Posting UX)

- **4-step wizard composer** replacing the single-form composer: content type → accounts & text → preview → schedule. Content types (square image/video, vertical short video, long video, document) drive platform eligibility and per-platform destination (IG Reel, YouTube Shorts, TikTok Video, etc.).
- **New files:** `src/lib/postFormats.ts` (content-type config + eligibility + destination map), `src/components/posting/AspectShape.tsx` (dotted-line dimension shapes), `src/components/posting/BrandIcon.tsx` (react-icons brand logos), `src/components/posting/PlatformPreviews.tsx` (per-platform mock frames).
- **Migration `00007_post_formats.sql` applied live:** `posts.content_type` column + `post_target_formats` table (post_id/platform/destination) with RLS + policies + index.
- **API:** `/api/social/zernio/posts` now accepts `contentType` + per-platform `destination`, persists both, forwards destination to Zernio as `platformSpecificData`.
- **UI polish:** step-1 cards show dotted aspect shapes + real brand logos (react-icons, incl. TikTok/Threads/Pinterest/Reddit not in lucide); brand logos reused across step-2 platform picker, char counters, preview headers; sidebar "Connections" tab renamed to **"Accounts"**.
- **Verified headless:** per-type platform filtering (document → LinkedIn/X/FB/Reddit; long video → no TikTok; vertical → IG/TikTok/YouTube/FB), destination badges, preview frames, schedule step; `npm run build` green; production responding 200 after auto-deploy.

## Next Steps

1. Migrate `src/middleware.ts` → `proxy` convention to clear the deployment warning
2. Set up real platform OAuth credentials (IG Graph, X, LinkedIn, Reddit) and app review
3. Add per-account scheduling UI (list/view/cancel scheduled posts) + sync status from Zernio
4. Build real-time chat (Supabase Realtime) + Deals state machine
5. Build the analytics worker/cron for live metrics
6. Build the admin panel
