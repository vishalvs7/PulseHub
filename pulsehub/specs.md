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
- **Dual-Pane Layout:**
  - **Left Pane (Form Input):** media uploader (MP4 vertical/horizontal), main caption text box, platform-specific override fields (e.g., separate X post length trimmer, IG auto-first-comment hashtags field), and a dateTime scheduler.
  - **Right Pane (Live UI Previews):** interactive tab switcher (`TikTok` | `Instagram Reels` | `YouTube Shorts` | `LinkedIn` | `X`).
- **Preview Rendering Engine:**
  - Custom CSS/SVG mobile device wrappers simulating native overlays (TikTok side icons, IG Reel bottom overlays) over the uploaded video (`object-fit: cover`).
  - Real-time character limit validation (e.g., auto-warning badge when X exceeds 280 characters).

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

1. Draft complete PostgreSQL schema (DDL) for Supabase: `profiles`, `brand_profiles`, `influencer_profiles`, `posts`, `post_targets`, `deals`, `messages`, with all RLS policies.
2. Build the Next.js `SchedulePostForm` component + platform-native CSS Live Preview container.
3. Set up API routing for multi-platform publishing using a unified payload interface.

## 6. Implementation Status vs Spec (Gap Analysis)

| Spec requirement | Status in codebase |
|---|---|
| Next.js App Router + Supabase + TS + Tailwind | ✅ Done |
| Auth: role-based `profiles` (ours: `users` table w/ role) | ✅ Done |
| `brand_profiles` (industry, size, website) | ✅ Done (no budget-range column) |
| `influencer_profiles` (bio, niche, engagement, verified) | ✅ Done |
| Influencer **reach tier** (Nano/Micro/Mid/Macro) | ❌ Missing (no column) |
| Influencer **base sponsorship rates** | ❌ Missing (priceRange computed heuristically in marketplace) |
| Influencer search facets (niche, followers, keyword) | 🟡 Partial (ilike/contains filters; no reach-tier facet, no FTS/Meilisearch) |
| Cross-posting **dual-pane preview engine** | ❌ Missing (composer is a single basic form) |
| Platform-native preview tab switcher + CSS overlays | ❌ Missing |
| Character-limit validation / safe-zone overlays | ❌ Missing |
| Media **uploader** (video/asset → S3/Storage signed URL) | ❌ Missing (media URL is a text field only) |
| `post_targets` table (per-platform post status) | ❌ Missing (`platform` is a CSV string on `posts`) |
| Deals/Inquiries state machine + `deals` table | ❌ Missing (`campaigns.status` exists, different model) |
| Real-time chat (Supabase Realtime) | ❌ Missing (inbox is placeholder UI) |
| Chat anti-leakage sanitization | ❌ Missing |
| Inline campaign briefs/milestones in chat | ❌ Missing |
| Unified analytics pipeline (cron poll 6–12h) | ❌ Missing (snapshots exist, no worker) |
| Unified **`views`** metric normalization | ❌ Missing (`analytics_snapshots` has reach/impressions only) |
| Social OAuth connect (IG/Twitter/LinkedIn) | 🟡 Scaffolded but broken (browser client on server, no limits) |
| Social middleware aggregator (Zernio/Postproxy/Phyllo) | ❌ Missing (direct OAuth today) |
| Shadcn UI | ❌ Using custom UI components |
| 5.1 Rate & ROI Calculator | ❌ Missing |
| 5.2 Caption Trimmer & Thread Splitter | ❌ Missing |
| 5.3 Character & Hashtag Counter | ❌ Missing (needed by preview engine too) |
| 5.4 "Best Time to Post" heatmaps | ❌ Missing (needs analytics worker + audience metrics) |
| 5.5 Comment-to-DM automation | ❌ Missing (needs platform DM APIs — Instagram/Facebook/TikTok) |

**Overall alignment: the foundation (~35–40%) is in place** — auth/RBAC, both profile tables, RLS, campaigns, marketplace search, analytics schema, and OAuth scaffolding. The four headline features (preview engine, real-time deal-based chat, analytics pipeline, social aggregator) plus all five growth micro-tools are mostly unbuilt.

**Closest wins:** 5.1, 5.2, 5.3 are client-side-only and independent of the social API work — they can ship in days and unlock the "free tools → SEO → signup" funnel while the platform features catch up. 5.4 depends on Feature 4's analytics worker; 5.5 depends on DM-capable platform integrations (Instagram/Facebook/TikTok), which the spec defers to the social middleware aggregator.
