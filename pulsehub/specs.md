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

### Phase 3 ✅ — Core Services & Real Data
- [x] Build `brand.service.ts` — CRUD for brand profiles, campaign management with real DB queries
- [x] Build `influencer.service.ts` — profile management, trust score, marketplace listing
- [x] Build `marketplace.service.ts` — search, filter, discover influencers
- [x] Build `analytics.service.ts` — fetch from DB/APIs, aggregate

### Phase 4 ✅ — Replace Placeholder Data
- [x] Wire brand dashboard to real data
- [x] Wire influencer dashboard to real data
- [x] Wire campaigns page to real data
- [x] Wire marketplace to real data
- [x] Wire analytics pages to real data

### Phase 5 ⬜ — Social Platform Integration
- [x] Design OAuth connection flow (each platform)
- [x] Build Meta adapter (Instagram + Facebook + Threads)
- [x] Build LinkedIn adapter
- [x] Build post composer UI (cross-platform)
- [x] Build unified inbox (comments only)
- [x] Build scheduled posting system
- [x] Fix platform detection in OAuth callback (BUG #1)
- [x] Fix callback redirect to correct dashboard (BUG #2)
- [x] Fix post accountId lookup (BUG #3)
- [x] Fix multi-account selection flow (BUG #4)
- [x] Custom domain deployed (postpilot.growphile.com)
- [ ] **Live OAuth test** — connect Instagram → verify pages → post → verify lands on platform
- [ ] **Live Facebook connect test** — verify page selection, posting, comments
- [ ] **Live LinkedIn connect test** — verify org selection, posting, analytics
- [ ] **Live Threads connect test** — verify posting, inbox sync
- [ ] **OAuth redirect URI setup** — add `https://postpilot.growphile.com/api/social/callback` in Meta + LinkedIn dashboards
- [ ] Token vault + encryption + refresh (security hardening)

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
| Character-limit validation | ✅ Done (per-platform char counters in Step 2; AI captions auto-validate per platform) |
| **AI per-platform caption generation in composer** | ✅ Done (`PostComposer.tsx` Step 2 "AI Captions for each platform" — one prompt streams tailored captions for IG/X/LinkedIn/TikTok, each editable inline, sent per-platform as `customContent`) |
| **Video resize + trim** | ✅ Done (`ClipStudio.tsx` in AI Studio "Resize & Trim" — aspect presets, start/end trim pins, 3 fill modes: center-crop w/ draggable crop window, blurred fit, letterbox; optional audio capture) |
| `post_targets` table (per-platform post status) | ✅ Done (table + RLS; `posting.service` writes/updates targets per platform) |
| Deals/Inquiries state machine + `deals` table | ❌ Missing (`campaigns.status` exists, different model) |
| Real-time chat (Supabase Realtime) | ❌ Missing (inbox is placeholder UI) |
| Chat anti-leakage sanitization | ❌ Missing |
| Inline campaign briefs/milestones in chat | ❌ Missing |
| Unified analytics pipeline (cron poll 6–12h) | ❌ Missing (snapshots exist, no worker) |
| Unified **`views`** metric normalization | ❌ Missing (`analytics_snapshots` has reach/impressions only) |
| Social OAuth connect (IG/Twitter/LinkedIn) | 🟡 Scaffolded (OAuth service + connect/callback routes; needs app credentials + app review) |
| Social middleware aggregator (Zernio) | ✅ Done (Zernio service + cross-posting live via Zernio API; upload, connect, sync, posts routes) |
| **Multi-account per platform (Accounts page)** | ✅ Done (`ZernioConnections.tsx` — one card per connected profile, add-account modal with platform picker + label, pending-auth state, supported-platforms strip; `social_accounts` supports multiple rows per platform) |
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

### 0. Self-Hosted OAuth Fixes + Production Deploy (Latest)
- **4 critical bugs fixed** in the self-hosted social integration layer:
  - **BUG #1** (`selfHosted.provider.ts`): Platform detection — removed `.eq('platform', ...)` from state query; platform now read from `stateRecord.platform`, fixing Facebook/Threads/LinkedIn OAuth detection.
  - **BUG #2** (`callback/route.ts`): OAuth callback redirect — rewrote to look up user role from `social_accounts` + `users` tables; redirects to `/brand/{uid}/connections` or `/influencer/{uid}/connections` (was redirecting to non-existent `/connections`).
  - **BUG #3** (`zernio/posts/route.ts`): Post accountId — looks up `profile_id` from `social_accounts` by `user_id + platform` before passing to provider (was passing `user.id` which is a UUID, not a platform account ID).
  - **BUG #4** (`selfHosted.provider.ts`): Multi-account selection flow — all 3 selection branches (Instagram multi, Facebook multi, LinkedIn multi) now store a temp account with `profile_id: 'pending'` before returning `needsSelection: true`; `completeSelection` reads token from temp account, deletes it, then stores the real account.
- **Detailed audit passed** for all single-account flows (Instagram, Facebook, Threads, LinkedIn) and multi-account selection flows.
- **Custom domain deployed:** `https://postpilot.growphile.com` — DNS verified, Vercel alias configured, production live.
- **`NEXT_PUBLIC_APP_URL`** set to `https://postpilot.growphile.com` in both `.env.local` and Vercel production env vars.
- **`database.md`** created — full schema reference (15 tables, 6 functions, 7 triggers, 20 indexes, RLS policies, seed data, migration history, design decisions, pitfalls).
- **Supabase project resumed** — was paused (free tier), now live at `elsowkdruovxrotbxsmi`.
- **Deployed via Vercel CLI** — pushed to GitHub `main`, then `vercel --prod` to deploy. GitHub auto-deploy is not configured (project was deployed via CLI, not linked to GitHub in Vercel dashboard).

### 1. Posting UX + AI Studio + Accounts
- **AI captions inside the composer** (`PostComposer.tsx` Step 2): one prompt → streamed, platform-tailored captions for Instagram / X / LinkedIn / TikTok, each rendered in its own **editable** box with live char counters; per-platform captions are sent to Zernio as `customContent` (API already supported it) and reflected in previews. Removed the standalone "Caption Tuner" tab from AI Studio (component deleted).
- **`ClipStudio.tsx` — combined Resize & Trim** (replaces the old VideoResizer tab): aspect presets (9:16, 1:1, 4:5, 16:9), trim start/end pins with playhead scrub, and **3 fill modes** that fix the landscape→portrait zoom-out problem: **center-crop with a draggable crop window**, **blurred fit** (nothing cut, blurred sides), and **letterbox**. Optional **audio-preserving** real-time render path.
- **Accounts page supports multiple profiles per platform** (`ZernioConnections.tsx` redesign): empty state "No profiles connected" + Add New Account; modal with platform-type grid + username/label; pending-auth card → Sync to finish; one card per connected profile; horizontal "Platforms supported" strip at the bottom. `social_accounts` already allowed multiple rows per platform — no migration needed.
- **Sidebar icon differentiation:** Deals → `Handshake`, Comments → `MessagesSquare`, Comment-to-DM → `Bot` (brand + influencer nav).
- Build green; pushed to `main` (auto-deploys).

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
- ✅ **AI per-platform captions in composer** (streamed, inline-editable, sent as per-platform `customContent`)
- ✅ **Resize & Trim** (`ClipStudio` — crop modes incl. no-cut blurred fit, trim pins, optional audio)
- ✅ **Multi-account support** on the Accounts page (add-account modal, pending-auth state)
- ✅ **Unified comment inbox** (long-card UI, search, platform filters, inline replies, RLS policies + 12 seeded comments)
- ✅ **Comment-to-DM** automation with link **and document (PDF/DOCX) sharing**
- ✅ Auth deadlock fix (pages load on full reload); users-readable RLS policy (no more 406s on deals)
- ✅ `npm run build` passes
- ✅ **Self-hosted OAuth integration** — Meta (IG/FB/Threads) + LinkedIn adapters built, platform detection fixed, multi-account selection flow fixed
- ✅ **Custom domain** — `postpilot.growphile.com` live, DNS verified, Vercel alias configured
- ✅ **Supabase live** — project resumed, database.md documented (15 tables, 6 functions, 7 triggers, 20 indexes)

## What's Not Working / Not Built

- ❌ **Live OAuth test not yet run** — all 4 platform connect flows fixed in code but not verified end-to-end with real Meta/LinkedIn accounts
- ❌ **OAuth redirect URIs not yet added** — user must add `https://postpilot.growphile.com/api/social/callback` in Meta and LinkedIn developer dashboards
- ❌ **Token vault / encryption / refresh** — tokens stored in plaintext in `social_accounts` table; needs encryption at rest + auto-refresh logic
- ❌ **YouTube, Reddit, Pinterest, X/Twitter, TikTok** — not yet integrated (show "Coming Soon" in UI)
- ❌ **Real-time deal-based chat** + anti-leakage sanitization — inbox is placeholder UI
- ❌ **Unified analytics pipeline** (cron 6–12h) + unified `views` metric — snapshots exist, no worker
- ❌ **Admin panel** — no admin dashboard page
- 🟡 **Zernio scheduling polish** — cross-posting works via Zernio; scheduled posting and per-destination behavior depend on Zernio capabilities
- 🟡 **Best Time to Post** + Comment-to-DM — demo/draft only (need analytics worker / DM-capable platform APIs)
- 🟡 **Marketplace search** — ilike/contains + reach-tier facet (no FTS/Meilisearch)

## Deployment (Vercel — Live)

- **Production URL:** `https://postpilot.growphile.com` (custom domain, verified)
- **Vercel URL:** `https://pulsehub-2n69uilfc-growphiles-projects.vercel.app`
- **Project:** `pulsehub` (ID: `prj_TBwpnzgSaacm8O4NxTR6eAXOm9KU`), org: **Growphile's projects** (`team_YLcxrfKNcWs3ermw5tsd1AUC`)
- **Git integration:** connected to `github.com/vishalvs7/PulseHub`; production branch `main`. However, auto-deploy is **not linked** in Vercel dashboard — deployments use CLI `vercel --prod`.
- **Env vars on Vercel (production):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `GEMINI_PROJECT_NUMBER`, `ZERNIO_API_KEY`, `NEXT_PUBLIC_APP_URL=https://postpilot.growphile.com`. `VERCEL_TOKEN` is local `.env.local` only (gitignored).
- **Verified live:** homepage, register, login, pricing, tools all 200; register API creates auto-confirmed users; login → role dashboard redirect works; middleware protects `/influencer|brand|admin/[uid]` (307 → `/login?redirect=...`).
- **Known deployment warning:** Next.js reports `middleware` file convention deprecated → use `proxy` instead (Next 16). Non-blocking; build succeeds.

## Recent Session (Self-Hosted OAuth Fixes + Production Deploy)

- **4-step wizard composer** replacing the single-form composer: content type → accounts & text → preview → schedule. Content types (square image/video, vertical short video, long video, document) drive platform eligibility and per-platform destination (IG Reel, YouTube Shorts, TikTok Video, etc.).
- **New files:** `src/lib/postFormats.ts` (content-type config + eligibility + destination map), `src/components/posting/AspectShape.tsx` (dotted-line dimension shapes), `src/components/posting/BrandIcon.tsx` (react-icons brand logos), `src/components/posting/PlatformPreviews.tsx` (per-platform mock frames).
- **Migration `00007_post_formats.sql` applied live:** `posts.content_type` column + `post_target_formats` table (post_id/platform/destination) with RLS + policies + index.
- **API:** `/api/social/zernio/posts` now accepts `contentType` + per-platform `destination`, persists both, forwards destination to Zernio as `platformSpecificData`.
- **UI polish:** step-1 cards show dotted aspect shapes + real brand logos (react-icons, incl. TikTok/Threads/Pinterest/Reddit not in lucide); brand logos reused across step-2 platform picker, char counters, preview headers; sidebar "Connections" tab renamed to **"Accounts"**.
- **Verified headless:** per-type platform filtering (document → LinkedIn/X/FB/Reddit; long video → no TikTok; vertical → IG/TikTok/YouTube/FB), destination badges, preview frames, schedule step; `npm run build` green; production responding 200 after auto-deploy.

## Next Steps — Self-Hosted Unified Social API

### What's Done (as of Latest Session)
- ✅ All 4 platform adapters built (Meta IG/FB/Threads + LinkedIn)
- ✅ All 4 critical OAuth bugs fixed (platform detection, callback redirect, post accountId, multi-account selection)
- ✅ Custom domain `postpilot.growphile.com` deployed and verified
- ✅ Supabase project resumed and live
- ✅ `database.md` created with full schema reference

### What's Next (Resume Here)
1. **Add OAuth redirect URIs** in Meta and LinkedIn developer dashboards:
   - Meta: Facebook Login → Settings → Valid OAuth Redirect URIs → add `https://postpilot.growphile.com/api/social/callback`
   - LinkedIn: Auth tab → Authorized Redirect URLs → add `https://postpilot.growphile.com/api/social/callback`
2. **Live end-to-end test** — connect Instagram → verify pages → post → verify lands on platform
3. **Test Facebook, Threads, and LinkedIn** connect flows
4. **Test cross-platform posting**, comments sync, and analytics
5. **Token security** — encrypt tokens at rest, implement auto-refresh logic

> **Decision:** Replace Zernio with our own unified API. Phase 1 targets **Instagram, Facebook, and Threads** (all Meta ecosystem — single OAuth). Other platforms come later and show "Coming Soon" in the UI until integrated.

### Platform Roadmap

| Phase | Platforms | Status |
|---|---|---|
| **Phase 1 (done)** | Instagram, Facebook, Threads | ✅ Built + Proxy Wired + Deployed |
| **Phase 2 (done)** | LinkedIn | ✅ Built + Proxy Wired + Deployed |
| **Phase 3 (next)** | YouTube, Reddit, Pinterest | Building |
| **Phase 4** | X/Twitter | Planned |
| **Phase 5** | TikTok | Planned (approval gated) |
| **Future** | Snapchat, Discord | Considered |

> **Why Instagram + Facebook + Threads first:** All three use the Meta Graph API. One Facebook App, one OAuth flow, one adapter serves all three. This is the highest-leverage starting point.

### Build Status

| Step | What | Status |
|---|---|---|
| **1** | Normalized API contract + `SOCIAL_PROVIDER` flag | ✅ Done |
| **2** | Meta adapter (Instagram + Facebook + Threads) | ✅ Done |
| **3** | LinkedIn adapter | ✅ Done |
| **4** | Token vault + encryption + refresh | 🟡 Deferred (not blocking) |
| **5** | OAuth orchestrator (connect → callback → select) | ✅ Done |
| **6** | Publishing service (cross-platform posting) | ✅ Done |
| **7** | Comments & inbox service | ✅ Done |
| **8** | Analytics service (post insights, follower stats, trends) | ✅ Done |
| **9** | Proxy wiring (all Zernio routes → self-hosted) | ✅ Done |
| **10** | Pre-test audit + bug fixes | ✅ Done (9 bugs fixed) |
| **11** | Module-level createClient fixes (Vercel build) | ✅ Done (9 files) |
| **12** | Background analytics snapshot cron | ✅ Done (daily) |
| **13** | Deploy to Growphile Vercel | ✅ Live at postpilot.growphile.com |
| **14** | Fix critical OAuth bugs (4 bugs) | ✅ Done (all 4 fixed, build passes) |
| **15** | Custom domain + DNS setup | ✅ Done (postpilot.growphile.com verified) |
| **16** | Supabase project resume | ✅ Done (live, schema documented) |
| **17** | End-to-end OAuth test | ⬜ Blocked — needs redirect URIs added to Meta/LinkedIn |

### Pre-Test Audit Fixes (All 9 resolved)

| Severity | Issue | Fix |
|---|---|---|
| CRITICAL | `[platform]/callback` used browser Supabase client server-side | Switched to server-side `createClient` with service role key |
| HIGH | `createPost` used `accountId` as userId for token lookup | Added `userId` to `CreatePostInput`, uses `input.userId` |
| HIGH | Posts stored with wrong `user_id` in DB | Same fix — `input.userId` used for DB insert |
| MEDIUM | `completeSelection` stored empty username | Looks up existing account username before storing |
| MEDIUM | `listCommentPosts` Supabase nested filter broken | Moved filtering to client-side (Supabase can't filter joined tables with `.eq()`) |
| MEDIUM | LinkedIn adapter always posted as organization | Now detects person vs org IDs — `urn:li:person:*` for UUIDs, `urn:li:organization:*` for numeric |

### Vercel Build Fixes (9 files)

All API routes and providers had `const supabase = createClient(...)` at module level, which crashes during Next.js build (env vars not yet injected). Fixed by converting to lazy `getSupabase()` functions:

- `src/app/api/social/connect/route.ts`
- `src/app/api/social/posts/route.ts`
- `src/app/api/social/select/route.ts`
- `src/app/api/social/sync/route.ts`
- `src/app/api/social/upload/route.ts`
- `src/app/api/social/comments/route.ts`
- `src/app/api/social/analytics/route.ts`
- `src/services/social/selfHosted/selfHosted.provider.ts`
- `src/services/social/zernio/zernio.provider.ts`

### Deployments

| Environment | Account | URL | Status |
|---|---|---|---|
| **Production** | growphilebusiness@gmail.com | https://postpilot.growphile.com | ✅ Live (custom domain) |
| Preview | growphilebusiness@gmail.com | https://pulsehub-2n69uilfc-growphiles-projects.vercel.app | ✅ Live |
| Old (deprecated) | ampglobal2025@gmail.com | prepost-app.vercel.app | ❌ Token removed |

- `SOCIAL_PROVIDER=selfhosted` — self-hosted adapters active, Zernio routes delegate to self-hosted
- Deployed via CLI token (`vercel --prod`), no GitHub auto-deploy linked
- Daily cron at `/api/cron/analytics-snapshot` saves follower snapshots at midnight UTC

**Detailed blueprint:** See `docs/SELF_HOSTED_SOCIAL_API_BLUEPRINT.md` for full architecture, code-level details, and risk mitigation.

---

# Analytics — Current State & Deferred Work

> **Note:** Analytics is fully wired in code and Supabase is live. The analytics pipeline will work end-to-end once OAuth connections are tested and posts are published. Follower snapshots will populate over time via the daily cron.

### What Analytics Now Shows (Self-Hosted Path)

| Metric | Source | Status |
|---|---|---|
| Follower count per platform | `adapter.getFollowerStats()` → live API call | ✅ Working |
| Per-post impressions | `adapter.getPostInsights()` → live API call | ✅ Working |
| Per-post reach | `adapter.getPostInsights()` → live API call | ✅ Working |
| Per-post likes, comments, shares | `adapter.getPostInsights()` → live API call | ✅ Working |
| Per-post saves, views, clicks | `adapter.getPostInsights()` → live API call | ✅ Working |
| Engagement rate | Calculated as `(likes+comments+shares) / followers * 100` | ✅ Working |
| Follower trend chart | Reads from `analytics_snapshots` table | ✅ Working (needs cron to populate) |
| Daily snapshot cron | `/api/cron/analytics-snapshot` → saves follower count per account | ✅ Working (Hobby: 1x/day) |

### What's Different from Zernio Analytics

| Feature | Zernio | Self-Hosted |
|---|---|---|
| Follower count | ✅ | ✅ Same |
| Post insights (reach, impressions) | ✅ | ✅ Same — same platform APIs |
| Follower trend chart | ✅ | ✅ Same — snapshots populate over time |
| Background sync frequency | 6-12h | 1x/day (Hobby limit) |
| Unified inbox (all platforms) | ✅ | ✅ Same — adapter methods exist |
| Reply to comments | ✅ | ✅ Same — adapter methods exist |

### Adapter Methods Built But Not Yet Tested Live

| Adapter | Method | API Call | Status |
|---|---|---|---|
| Meta | `getRecentMedia()` | `GET /{igUserId}/media?fields=id,caption,media_type,timestamp,permalink,like_count,comments_count` | Built, awaiting live test |
| Meta | `getRecentThreads()` | `GET /{threadsUserId}/threads?fields=id,text,timestamp,media_type` | Built, awaiting live test |
| Meta | `getPostInsights()` | `GET /{mediaId}/insights?metric=impressions,reach,engagement,saved` | Built, awaiting live test |
| Meta | `getThreadsInsights()` | `GET /{postId}/insights?metric=impressions,likes,replies,reposts,quotes` | Built, awaiting live test |
| Meta | `getFollowerStats()` | `GET /{accountId}?fields=followers_count,media_count` | Built, awaiting live test |
| LinkedIn | `getRecentPosts()` | `GET /ugcPosts?q=authors&authors=List(urn:li:organization:{orgId})` | Built, awaiting live test |
| LinkedIn | `getPostInsights()` | `GET /organizationalEntityShareStatistics?shares[0]={postUrn}` | Built, awaiting live test |
| LinkedIn | `getFollowerStats()` | `GET /organizationalEntityShareStatistics` | Built, awaiting live test |

### Deferred: Supabase Project

- **Status:** ✅ Live (resumed from free-tier pause)
- **Project URL:** `elsowkdruovxrotbxsmi.supabase.co` — DNS resolving
- **Schema documented:** `database.md` — 15 tables, 6 functions, 7 triggers, 20 indexes, RLS policies, seed data
- **Remaining:** Analytics snapshot cron needs to populate `analytics_snapshots` over time

### Deferred: App Approvals

| Platform | App | Status |
|---|---|---|
| Meta (IG/FB/Threads) | App ID `28882450258027919` | Admin on app — no review needed for testing |
| LinkedIn | Client ID `77uuuf0gq3wp0e` | Admin on app — no review needed for testing |

> **Note:** Both apps are in developer mode with the user as admin. No App Review submission required for testing. Production access for external users would require review, but for the user's own accounts this is not needed.

### Deferred: OAuth Redirect URIs (Must Do Before Testing)

| Platform | Redirect URI to Add | Where |
|---|---|---|
| Meta | `https://postpilot.growphile.com/api/social/callback` | Facebook Login → Settings → Valid OAuth Redirect URIs |
| LinkedIn | `https://postpilot.growphile.com/api/social/callback` | Auth tab → Authorized Redirect URLs |

---

# Future Plan of Action: Background Engines, Queues & Data Ingestion

Running a multi-platform cross-posting platform requires offloading long-running, timing-dependent, and repetitive tasks to an asynchronous background architecture. Here is the operational blueprint for orchestrating queues, token lifecycles, and bidirectional data sync.

## 1. The Distributed Scheduling & Publishing Engine

A standard web server cannot handle scheduled posts via basic database timers because serverless functions timeout, network calls to multiple social platforms can stall, and simultaneous user posts can trigger API rate limits.

```
[ User Schedules Post ]
          │
          ▼
[ Delayed Message / Job Enqueued ] ──(Waits until target timestamp)──┐
                                                                    ▼
[ Worker Picks Up Job ] ◄───────────────────────────────────────────┘
          │
          ├─► Validates Token Status
          ├─► Spawns Parallel Sub-Jobs per Destination (Fan-Out)
          │         │
          │         ├─► Task A: Call Meta API
          │         ├─► Task B: Call LinkedIn API
          │         └─► Task C: Call YouTube API
          │
          ▼
[ Destination State Machine Updates ] ──► (Dispatches SSE/WebSocket event to UI)
```

* **Delayed Queue Orchestration:**
  * When a post is scheduled for a future timestamp, the system computes the delay offset (Δt = Target Time − Current Time) and registers a delayed job in the message broker.
  * Instead of polling the database every second (which degrades database performance at scale), the worker sleeps until the broker triggers an execution event at the precise millisecond.

* **The "Fan-Out" Worker Pattern:**
  * A single post with 5 target accounts is split into 5 isolated sub-tasks.
  * If the LinkedIn API succeeds but Meta's API experiences a temporary timeout, only the Meta sub-task enters a retry loop. The overall post status reflects partial success rather than failing entirely.

* **Exponential Backoff & Jitter:**
  * When a social platform returns a rate limit (HTTP 429) or temporary server error (HTTP 5xx), the worker retries the request using exponential backoff:

    Retry Delay = 2^(attempt) × 1000ms + Random Jitter

  * Jitter prevents thousands of delayed jobs from hitting social media endpoints at the exact same millisecond.

## 2. Proactive OAuth Token Rotation & Session Maintenance

OAuth tokens degrade over time due to platform-mandated lifecycles, manual password resets, or permission revocations.

```
[ Scheduled Token Cron (Daily) ]
          │
          ▼
[ Query Expiring Accounts: token_expires_at < NOW + 5 Days ]
          │
          ├─► Has Valid Refresh Token?
          │         │
          │         ├─► YES: Request New Access Token ──► Update Vault & Timestamp
          │         │
          │         └─► NO (or Revoked):
          │                   │
          │                   ▼
          │         [ Flag Account: "Needs Re-auth" ]
          │                   │
          ▼                   ▼
[ Trigger In-App Alert / Email Notification to User ]
```

* **Token Expiration Tiers:**
  * Short-Lived Tokens (e.g., standard User Tokens): Expire in 1 to 24 hours.
  * Long-Lived Tokens (e.g., Meta 60-day tokens, LinkedIn 60-day tokens): Require proactive exchange before the 60-day mark.
  * Refresh Tokens: Long-lived keys used solely to mint fresh access tokens without requiring the user to log in again.

* **Proactive Refresh Window (The 5-Day Buffer):**
  * Never wait until a token expires to refresh it. If a user schedules a post for tomorrow and their token expires tonight, the post will fail silently.
  * Running a daily scan against accounts expiring within 5 days ensures tokens remain perpetually fresh.

* **Graceful Revocation Handling:**
  * If a user disconnects the app from within their native Instagram or LinkedIn security settings, token refreshes return an `invalid_grant` error.
  * The system immediately marks the account state as `requires_reconnection` and surfaces a non-intrusive warning badge in the user dashboard, preventing scheduled publishing failures.

## 3. Bidirectional Comment Sync & Reply Engine

Ingesting public comments across multiple networks requires balancing fresh conversation feeds against strict platform API rate limits.

```
[ Active Posts Detector (Created < 7 Days) ]
          │
          ▼
[ Batch Dispatcher: Group by Connected Platform ]
          │
          ├─► Fetch New Comments via Normalized Endpoint
          │
          ▼
[ Ingestion & Deduplication Pipeline ]
          │
          ├─► Is platform_comment_id in Database?
          │         │
          │         ├─► YES: Update Like/Reply Counts
          │         └─► NO: Insert as Unread Comment
          │
          ▼
[ Trigger Real-time Event to Unified Dashboard Inbox ]
```

* **Active Window Decay Strategy:**
  * 95% of social post comments occur within 72 hours of publication.
  * **Posts < 24 hours old:** Polled every 5–10 minutes.
  * **Posts 1–7 days old:** Polled every 30–60 minutes.
  * **Posts > 7 days old:** Polling ceases; updated only on manual user demand (e.g., clicking "Refresh Comments" on an old post).

* **Deduplication Engine:**
  * Social network comment feeds return arrays of comments on every call. The ingestion engine checks incoming unique platform comment IDs against local records to ensure only net-new comments trigger notifications or database writes.

* **Outbound Reply Flow:**
  * When a user replies from the unified dashboard, the system bypasses the queue and posts directly to the network's comment endpoint via the platform adapter, appending the new reply to the local thread instantly for optimistic UI rendering.

## 4. Asynchronous Analytics Aggregation & Heat Maps

Social analytics APIs (impressions, reach, shares, video view duration) are computationally heavy and strictly rate-limited, requiring decoupled batch processing.

```
[ Nightly Analytics Cron (Off-Peak Hours) ]
          │
          ▼
[ Fetch Lifetime Post Destinations ]
          │
          ▼
[ Batch Query Platform Insights Endpoints ]
          │
          ▼
[ Normalize into Analytics Snapshots Table ]
          │
          ▼
[ Compute Aggregated Audience Heat Map Data ]
```

* **Time-Series Metric Snapshots:**
  * Instead of overwriting existing post stats, metrics are recorded as daily timestamped snapshots. This allows users to view growth over time (e.g., "This video gained 4,000 views on Day 1 and 12,000 views on Day 4").

* **Cross-Platform Normalization:**
  * Each network uses different terms for engagement (e.g., Twitter "Retweets", LinkedIn "Reposts", Meta "Shares").
  * The analytics aggregator maps these metrics into universal metrics: `impressions`, `reach`, `engagements`, and `conversions`.

* **Heat Map Pre-Computation:**
  * Calculating best posting times across thousands of past engagements in real time during a page load slows down dashboard performance.
  * The background worker aggregates historical engagement data by hour and day of the week off-peak, storing a lightweight 7×24 matrix per user ready for instant client-side rendering.

## 5. Self-Hosted Unified Social API (Replace Zernio)

**Goal:** Build our own unified social API aggregator (functionally equivalent to Zernio) so we can remove the Zernio dependency entirely, own the OAuth/rate-limit/token lifecycle, and set our own pricing tiers. **This is the primary track — it must never regress current website features. The swap only happens when the new API is feature-complete and verified end-to-end.**

### Why
- Zernio is the only hard external dependency today: OAuth connect, cross-posting, comments, analytics all route through it.
- Removing it means full control over pricing, platform coverage, rate limits, and data.
- The background engines from sections 1–4 are the same machinery this API needs — building them here is building the replacement.

### Phase 1 Platforms: Instagram + Facebook + Threads

All three platforms use the **Meta Graph API** — same OAuth flow, same app, one adapter serves all three.

| Platform | API Base | Posting | Comments | Analytics | Notes |
|---|---|---|---|---|---|
| **Instagram** | `graph.facebook.com/v21.0` | ✅ Two-step (container → publish) | ✅ Graph API | ✅ Insights API | Requires business/creator account linked to FB Page |
| **Facebook** | `graph.facebook.com/v21.0` | ✅ Page Feed API | ✅ Page conversations | ✅ Page Insights | Posting only to Pages (not personal profiles) |
| **Threads** | `graph.threads.net/v1.0` | ✅ Two-step (container → publish) | ✅ Replies API | ✅ Media insights | Text limit 500 chars; 250 posts/day; same Meta app |

**Meta App Permissions Required:**

| Permission | Purpose | App Review |
|---|---|---|
| `instagram_basic` | Read IG profile, media | Required |
| `instagram_content_publish` | Publish to Instagram | Required |
| `instagram_manage_comments` | Read/reply to IG comments | Required |
| `pages_read_engagement` | Read FB page insights | Required |
| `pages_show_list` | List managed FB pages | Required |
| `pages_manage_posts` | Post to FB pages | Required |
| `threads_basic` | Read Threads profile/media | Required |
| `threads_content_publish` | Publish to Threads | Required |
| `threads_manage_replies` | Read/reply to Threads replies | Required |

### Phase 2 Platform: LinkedIn

| Feature | Status | Notes |
|---|---|---|
| Posting | ✅ UGC Post API | Pages only (not personal profiles) |
| Comments | ✅ Social Actions API | Post comments + replies |
| Analytics | 🟡 Organization stats | Follower count, impressions |
| OAuth | Standard OAuth 2.0 | 60-day tokens, no refresh — user must re-authorize |
| App Review | Required | `w_member_social`, `r_liteprofile`, `w_organization_social` |

### Target API Surface (drop-in replacement for `/api/social/zernio/*` routes)

| Current Zernio route | New self-hosted route | Status |
|---|---|---|
| `/api/social/zernio/connect` (+callback/select) | `/api/social/connect` (+ callback/select) | 🟡 Scaffolded (`oauth.service.ts`), needs platform creds |
| `/api/social/zernio/posts` (POST list / DELETE) | `/api/social/posts` | ✅ Interface defined by ZernioService; swap base + auth |
| `/api/social/zernio/upload` | `/api/social/upload` (Supabase Storage signed URL) | ✅ Already storage-backed, no Zernio needed |
| `/api/social/zernio/analytics` (+ follower-stats) | `/api/social/analytics` | ✅ Logic is ours; only fetch layer changes |
| `/api/social/zernio/inbox` / `comments` | `/api/social/comments` | ✅ Parsing is ours; only fetch layer changes |
| Webhooks (post published, new comment) | `/api/webhooks/social` | ❌ Missing — needs worker + queue |

The frontend already talks to these routes via `ZernioService` (`src/services/social/zernio.service.ts`) — the migration is a **service-layer swap**, not a UI rewrite.

### Architecture
```
[ PulseHub Web App ]  ──HTTP──►  [ PulseHub Unified Social API (new service) ]
                                     │  exposes /connect /posts /comments /analytics /webhooks
                                     │
                          ┌──────────┼──────────────┬──────────────┐
                          ▼          ▼              ▼              ▼
                    [Meta Adapter] [LinkedIn]   [X/Twitter]   [Reddit/...]
                    IG+FB+Threads  (Phase 2)    (Phase 3)     (Phase 3+)
                    (single OAuth)
                          │
                          ▼
                   [ Token Vault (encrypted) ]  ◄── daily rotation cron (section 2)
                          │
                          ▼
                   [ Queue/Worker (sections 1, 3, 4) ] ──► real-time events to UI
```

### Platform Adapter Interface (one per platform)
```
connect(state)          -> start OAuth dance
callback(code)          -> exchange code, store tokens in vault
publish(payload)        -> create post on platform (sync or enqueued)
getComments(postId)     -> normalized comment feed
replyComment(id, text)  -> post reply
getAnalytics(accountId) -> normalized metrics (impressions/reach/engagements/views)
refreshToken()          -> proactive rotation (section 2)
```

### Migration Plan (parallel, non-breaking)
1. **Phase P0 (now):** Lock the normalized API contract to exactly what the frontend consumes today (reverse-engineer `ZernioService` + route response shapes). Document in this spec.
2. **Phase P1:** Stand up the new API service with stubbed adapters returning the contract. Add a config flag `SOCIAL_PROVIDER=zernio|selfhosted` — default `zernio` so nothing changes in production.
3. **Phase P2:** Implement Meta adapter (IG + FB + Threads) behind the flag. Verify against live Zernio behavior. Keep Zernio as fallback.
4. **Phase P3:** Implement LinkedIn adapter. Verify.
5. **Phase P4:** Flip `SOCIAL_PROVIDER=selfhosted`, run soak tests, then delete Zernio service/routes/env.
6. **Phase P5:** Own pricing. Gate platform features by subscription tier (posts/month, platforms, comment volume).

**Do not:** remove Zernio code or env keys until P4 soak tests pass on production traffic.

### Current Zernio constraints this removes
- Per-platform OAuth token limits (Zernio's one-account-per-platform model) → we store unlimited accounts in our own vault.
- Zernio platform coverage/approval gates → we control which platforms and when.
- Zernio pricing/rate limits → we set our own.

---

## 6. Prerequisites — What We Need Before Building

> **This section defines everything required from you (the developer) before Step 1 of the 10-step plan begins. No code is written until these are in place.**

### A. Meta Developer App (covers Instagram + Facebook + Threads)

**One Meta App serves all three platforms.** Create it once, configure for all three.

| Step | What to do | Where | Time |
|---|---|---|---|
| 1 | Create Meta Developer account | [developers.facebook.com](https://developers.facebook.com) | 5 min |
| 2 | Create a new App → select "Business" type | Meta Developer Dashboard | 5 min |
| 3 | Add products: **Instagram Graph API**, **Facebook Login**, **Threads API** | App Settings → Products | 10 min |
| 4 | Set app to **Live Mode** (not Development) | App Settings → Basic | 1 min |
| 5 | Generate **App ID** + **App Secret** | App Settings → Basic | 1 min |
| 6 | Set Valid OAuth Redirect URIs: `{YOUR_DOMAIN}/api/social/callback` | Facebook Login → Settings | 5 min |
| 7 | Enable **Instagram Business Account** login in Facebook Login settings | Facebook Login → Settings | 2 min |

**What to send me after this:**
```
META_APP_ID=xxxxxxxxxxxxxxx
META_APP_SECRET=xxxxxxxxxxxxxxx
```

### B. LinkedIn Developer App

| Step | What to do | Where | Time |
|---|---|---|---|
| 1 | Create LinkedIn Developer account | [linkedin.com/developers](https://linkedin.com/developers) | 5 min |
| 2 | Create app → select "Share on LinkedIn" product | LinkedIn Developer Portal | 5 min |
| 3 | Request permissions: `w_member_social`, `r_liteprofile`, `w_organization_social` | Products tab | 5 min |
| 4 | Generate **Client ID** + **Client Secret** | Auth tab | 1 min |
| 5 | Set Authorized Redirect URL: `{YOUR_DOMAIN}/api/social/callback` | Auth tab | 2 min |

**What to send me after this:**
```
LINKEDIN_CLIENT_ID=xxxxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=xxxxxxxxxxxxxxx
```

### C. Test Accounts (for development — no app review needed yet)

| Platform | What you need | How to get it |
|---|---|---|
| **Instagram** | Instagram Business or Creator account linked to a Facebook Page | Create IG account → Settings → Account → Switch to Professional → Business → Link to FB Page |
| **Facebook** | A Facebook Page you manage | Create a Page in Facebook (can be a test page) |
| **Threads** | Threads account linked to the same Instagram account | Download Threads app → Sign in with Instagram |
| **LinkedIn** | A LinkedIn Company Page | LinkedIn → Work → Create a Company Page |

> **App review can wait.** In Development mode, the app only works for testers you add. Add your own Facebook/LinkedIn accounts as testers and you can test everything end-to-end. App review is only needed when you want other users (non-testers) to connect their accounts.

### D. Environment Variables

Add these to your `.env.local`:

```env
# === Meta (Instagram + Facebook + Threads) ===
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# === LinkedIn ===
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret

# === App URL (for OAuth redirects) ===
NEXT_PUBLIC_APP_URL=https://prepost-app.vercel.app

# === Self-Hosted API Flag ===
SOCIAL_PROVIDER=selfhosted  # Flipped from zernio — self-hosted is now active
```

### E. What You Need to Know

| Topic | Details |
|---|---|
| **Meta OAuth flow** | Instagram and Threads use Facebook Login. User clicks "Connect" → redirected to Facebook → authorizes → Facebook redirects to our callback with `code` → we exchange for access token → fetch IG user ID or Threads user ID from the token. Same flow, different user ID at the end. |
| **Facebook Pages** | Instagram business accounts MUST be linked to a Facebook Page. When we get the token, we call `/me/accounts` to list pages, then check each page for `instagram_business_account`. This is how we know which IG account to post to. |
| **Threads = Instagram** | Threads uses the same Instagram account. The Threads user ID is different from the Instagram user ID, but they share the same OAuth token. We get the Threads user ID by calling the Threads API with the IG token. |
| **LinkedIn Pages** | LinkedIn posting only works for Company Pages (not personal profiles). User must select which page to post to. We call `/me/following/organizations` to list pages they manage. |
| **Token lifetimes** | Meta long-lived tokens = 60 days. LinkedIn tokens = 60 days. No refresh tokens available for LinkedIn — user must re-authorize when expired. For Meta, we can exchange short-lived → long-lived tokens on connect. |
| **Rate limits** | Meta: 200 calls/user/hour (Instagram), 4800 × impressions / 24h (Threads). LinkedIn: 100 calls/day for some endpoints. We implement exponential backoff for all. |
| **Two-step publishing** | Instagram and Threads require two API calls: (1) create media container, (2) publish container. This is NOT optional — it's how their API works. We handle this transparently. |
| **App review timing** | Meta app review takes 1-4 weeks. LinkedIn review takes 1-2 weeks. Submit early. In the meantime, add your accounts as testers in Development mode. |

### F. What I Will Build (You Don't Need to Know)

| Component | What it does |
|---|---|
| `MetaAdapter` | Handles IG + FB + Threads — OAuth, posting, comments, analytics |
| `LinkedInAdapter` | Handles LinkedIn — OAuth, posting, comments, analytics |
| `TokenVault` | Encrypts and stores OAuth tokens, handles refresh |
| `OAuthOrchestrator` | Connect → callback → select flow for all platforms |
| `PublishingService` | Cross-platform post creation + scheduling |
| `CommentsService` | Unified comment aggregation + reply |
| `AnalyticsService` | Background cron sync + normalized metrics |
| `SOCIAL_PROVIDER` flag | Switch between Zernio and self-hosted with one env var |

### G. Summary — Your Pre-Build Checklist

- [x] Meta Developer account created
- [x] Meta App created with IG Graph API + Facebook Login + Threads API products
- [x] `META_APP_ID` and `META_APP_SECRET` sent to me
- [x] LinkedIn Developer account created
- [x] LinkedIn App created with `w_member_social`, `r_liteprofile`, `w_organization_social`
- [x] `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` sent to me
- [ ] Instagram Business account linked to a Facebook Page (for testing)
- [ ] LinkedIn Company Page created (for testing)
- [ ] Your Facebook + LinkedIn accounts added as testers in both apps
- [x] `.env.local` updated with all env vars above
- [x] `NEXT_PUBLIC_APP_URL` set to `https://prepost-app.vercel.app`
- [x] `SOCIAL_PROVIDER` flipped to `selfhosted`

**Build complete. Awaiting: app tester approvals + live OAuth testing.**

---

# Monetizable Unified Social API (Phase 2 — Future)

> **Goal:** Expose our self-hosted unified API to external developers, similar to how Zernio operates. This transforms PulseHub from a SaaS product into a platform — developers pay us to use our API for their own apps, tools, and integrations.

## Why This Is a Business

| Competitor | What They Charge | What We Offer |
|---|---|---|
| Zernio | $29-99/mo for API access | Same + more platforms |
| Phyllo | Enterprise pricing ($10k+/yr) | Simpler, cheaper |
| Buffer API | $100/mo + per-seat | Our API is usage-based |
| Hootsuite API | Enterprise only | Self-serve tiers |

Our advantage: we already built the adapter pattern, the unified contract, and the proxy layer. Adding API key management on top is incremental.

## What External Developers Get

```
POST https://api.pulsehub.dev/v1/connect
  → { platform: "instagram" }
  → { authUrl: "https://facebook.com/...", state: "abc123" }

POST https://api.pulsehub.dev/v1/posts
  → { content: "Hello", platforms: [{ platform: "instagram", accountId: "..." }] }
  → { postId: "xyz", status: "published" }

GET https://api.pulsehub.dev/v1/analytics?platform=instagram
  → { followers: 12500, impressions: 45000, engagement: 3.2 }

GET https://api.pulsehub.dev/v1/comments?postId=xyz
  → { comments: [{ author: "...", content: "...", createdAt: "..." }] }
```

## Pricing Tiers

| Tier | Price | Platforms | API Calls/Month | Connected Accounts | Webhooks |
|---|---|---|---|---|---|
| **Free** | $0 | 2 platforms | 1,000 | 2 | ❌ |
| **Starter** | $19/mo | 4 platforms | 10,000 | 5 | ❌ |
| **Pro** | $49/mo | All platforms | 50,000 | 20 | ✅ |
| **Business** | $149/mo | All platforms | 500,000 | Unlimited | ✅ + Priority |
| **Enterprise** | Custom | Custom | Unlimited | Unlimited | ✅ + SLA |

## Preparations Needed (Before Launch)

### 1. API Key Management

| Component | What It Does | Effort |
|---|---|---|
| `api_keys` table | Store key hash, user_id, tier, rate_limit, created_at | 1 hour |
| Key generation endpoint | `POST /api/v1/keys` → generate key, return once | 2 hours |
| Key validation middleware | Check `Authorization: Bearer pk_xxx` on every request | 2 hours |
| Key rotation | `DELETE /api/v1/keys/:id` + `POST /api/v1/keys` | 1 hour |

**Database schema:**
```sql
CREATE TABLE public.api_keys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key_hash    text NOT NULL UNIQUE,      -- SHA-256 of the actual key
  key_prefix  text NOT NULL,             -- First 8 chars for display: "pk_abc1..."
  tier        text DEFAULT 'free' CHECK (tier IN ('free','starter','pro','business','enterprise')),
  rate_limit  integer DEFAULT 100,       -- calls per minute
  monthly_limit integer DEFAULT 1000,    -- calls per month
  monthly_used integer DEFAULT 0,        -- calls used this month
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  last_used_at timestamptz
);
```

### 2. Rate Limiting

| Tier | Rate Limit (calls/min) | Monthly Limit |
|---|---|---|
| Free | 100 | 1,000 |
| Starter | 200 | 10,000 |
| Pro | 500 | 50,000 |
| Business | 1,000 | 500,000 |
| Enterprise | Custom | Unlimited |

Implementation: in-memory token bucket per API key, reset monthly via cron.

### 3. Developer Dashboard

| Page | What It Shows |
|---|---|
| `/developers` | Overview: current tier, usage this month, API key |
| `/developers/keys` | List keys, create new, revoke |
| `/developers/docs` | Interactive API docs (Swagger/OpenAPI) |
| `/developers/usage` | Usage graphs: calls/day, errors, latency |
| `/developers/billing` | Upgrade tier, payment history |

### 4. API Versioning

```
https://api.pulsehub.dev/v1/connect     ← Current (v1)
https://api.pulsehub.dev/v2/connect     ← Future breaking changes
```

All routes live under `/api/v1/*` to allow future versioning without breaking existing integrations.

### 5. Webhook System

For Pro+ tiers, notify developers of events:

| Event | Payload |
|---|---|
| `post.published` | `{ postId, platform, publishedAt }` |
| `post.failed` | `{ postId, platform, error }` |
| `comment.new` | `{ commentId, postId, author, content }` |
| `token.expired` | `{ accountId, platform, needsReconnection }` |

Webhook registration: `POST /api/v1/webhooks { url: "https://...", events: ["post.published"] }`

### 6. Documentation

- OpenAPI/Swagger spec for the unified API
- Quickstart guide: "Connect Instagram in 5 minutes"
- Code examples: Python, Node.js, PHP, Go
- Changelog: `GET /api/v1/changelog`

## Implementation Timeline (Future)

| Week | What |
|---|---|
| 1 | API key management (table + middleware + routes) |
| 2 | Rate limiting + usage tracking |
| 3 | Developer dashboard pages |
| 4 | OpenAPI docs + quickstart guide |
| 5 | Webhook system |
| 6 | Billing integration (Stripe) + launch |

## Revenue Projection (Conservative)

| Month | Free Users | Paid Users | MRR |
|---|---|---|---|
| 1 | 50 | 5 | $245 |
| 3 | 200 | 20 | $980 |
| 6 | 500 | 50 | $2,450 |
| 12 | 1,500 | 150 | $7,350 |

At scale (1,000 paid users × $49 avg) = **$49,000 MRR** = **$588K ARR**
