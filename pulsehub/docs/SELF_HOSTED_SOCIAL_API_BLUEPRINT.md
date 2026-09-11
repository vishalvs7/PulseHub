# Blueprint: Self-Hosted Unified Social API — Replace Zernio

> **Goal:** Build a drop-in replacement for the Zernio API aggregator so we can remove the Zernio dependency entirely, own the OAuth/rate-limit/token lifecycle, and set our own pricing tiers.
>
> **Constraint:** Zernio stays active until the new API is feature-complete and verified end-to-end. A `SOCIAL_PROVIDER` flag toggles between backends.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PulseHub Web App                            │
│  (PostComposer, CommentsInbox, AnalyticsView, ZernioConnections)   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP (same routes)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PulseHub Unified Social API Service                    │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   /connect   │  │   /posts     │  │  /comments   │  ...        │
│  │   /callback  │  │   /upload    │  │  /analytics  │             │
│  │   /select    │  │   /sync      │  │              │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                  │                      │
│         ▼                 ▼                  ▼                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Platform Adapter Layer                          │   │
│  │                                                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │ Instagram│  │ Twitter/X│  │ LinkedIn │  │  Reddit  │   │   │
│  │  │ Adapter  │  │ Adapter  │  │ Adapter  │  │ Adapter  │   │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │   │
│  └───────┼──────────────┼──────────────┼──────────────┼─────────┘   │
│          │              │              │              │              │
│          ▼              ▼              ▼              ▼              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Token Vault (encrypted)                   │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │ social_accounts (existing table — access_token,     │    │   │
│  │  │ refresh_token, expires_at columns already exist)    │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Background Workers (Inngest / Edge Functions)   │   │
│  │  • Token refresh cron (daily)                                │   │
│  │  • Analytics sync cron (every 6-12h)                         │   │
│  │  • Scheduled post publisher                                  │   │
│  │  • Comment poller (active posts)                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Implementation Plan

### Step 1: Define the Normalized API Contract (Phase P0)

**What:** Reverse-engineer `ZernioService` + all API route handlers into a formal TypeScript interface that describes every request/response shape. This is the "spec" the new API must satisfy.

**Deliverables:**
- `src/services/social/contracts/types.ts` — all interfaces (already partially exist in `zernio.service.ts`, extract + formalize)
- `src/services/social/contracts/endpoints.ts` — one typed function per endpoint matching the Zernio service methods
- Document every request param, response field, and error shape

**What to extract from current code:**

| ZernioService Method | Normalized Contract |
|---|---|
| `getConnectUrl(platform, profileId, opts)` | `ConnectRequest` → `ConnectResponse { authUrl, state? }` |
| `listAccounts(profileId)` | `ListAccountsRequest` → `Account[]` |
| `createPost(input)` | `CreatePostInput` → `{ postId }` |
| `listPosts(profileId?, status?, limit?)` | `ListPostsRequest` → `Post[]` |
| `cancelPost(postId)` | `CancelPostRequest` → `void` |
| `listCommentPosts(opts)` | `ListCommentPostsRequest` → `CommentPost[]` |
| `getPostComments(postId, accountId)` | `GetCommentsRequest` → `Comment[]` |
| `replyToComment(postId, input)` | `ReplyCommentRequest` → `Comment` |
| `getAnalytics(opts)` | `GetAnalyticsRequest` → `AnalyticsResult` |
| `getFollowerStats(opts)` | `GetFollowerStatsRequest` → `FollowerStats` |
| `presignUpload(filename, contentType)` | `UploadRequest` → `{ uploadUrl, publicUrl }` |
| `listSelectionOptions(platform, opts)` | `ListSelectionRequest` → `SelectionOption[]` |
| `completeSelection(platform, input)` | `CompleteSelectionRequest` → `Record<string, unknown>` |

**Why this matters:** Every subsequent step builds against this contract. If the contract is right, the swap is a service-layer drop-in.

**Files to create:**
```
src/services/social/contracts/
  types.ts          — all request/response interfaces
  endpoints.ts      — typed function signatures (no implementation)
  provider.ts       — SOCIAL_PROVIDER flag + provider registry
```

---

### Step 2: Build the Provider Registry + Feature Flag (Phase P0)

**What:** Create the switching mechanism so both Zernio and self-hosted can coexist.

**Deliverables:**
- `src/services/social/contracts/provider.ts` exports:
  - `SOCIAL_PROVIDER: 'zernio' | 'selfhosted'` (from env `SOCIAL_PROVIDER`, defaults to `'zernio'`)
  - `getSocialProvider(): SocialProviderInterface` — returns the active provider
  - `SocialProviderInterface` — the contract type from Step 1

- Update `src/services/social/zernio.service.ts` to implement `SocialProviderInterface` (wrap existing static methods)

**Files to create/modify:**
```
NEW:  src/services/social/contracts/provider.ts
EDIT: src/services/social/zernio.service.ts (implement interface)
```

**Verification:** App runs identically with `SOCIAL_PROVIDER=zernio` (default). No frontend changes.

---

### Step 3: Build Token Vault Service (Phase P1)

**What:** Abstract token storage and lifecycle management. The existing `social_accounts` table already has `access_token`, `refresh_token`, `expires_at` columns — we build a service layer on top.

**Deliverables:**
- `src/services/social/vault/tokenVault.service.ts`:
  - `storeTokens(accountId, tokens)` — encrypt + store (use `crypto.subtle` or Supabase Vault)
  - `getTokens(accountId)` — retrieve + decrypt
  - `getExpiringAccounts(daysBuffer)` — find accounts with `expires_at < NOW() + buffer`
  - `markNeedsReconnection(accountId)` — set `is_connected = false`
  - `rotateTokens(accountId, newTokens)` — update stored tokens

- Encryption: AES-GCM encryption at rest for tokens in the `social_accounts` table (or use Supabase Vault if available). The `access_token` column is currently plaintext — add an `encrypted_access_token` column.

**New migration:**
```sql
ALTER TABLE public.social_accounts
  ADD COLUMN encrypted_access_token bytea,
  ADD COLUMN encrypted_refresh_token bytea,
  ADD COLUMN token_iv bytea,
  ADD COLUMN token_status text DEFAULT 'active'
    CHECK (token_status IN ('active', 'expired', 'needs_reconnection', 'revoked'));
```

**Files to create:**
```
NEW:  src/services/social/vault/tokenVault.service.ts
NEW:  src/services/social/vault/crypto.ts
NEW:  supabase/migrations/00008_token_vault.sql
```

---

### Step 4: Build Platform Adapters (Phase P1)

**What:** Implement the actual API calls to each social platform. Each adapter implements a common interface.

**Deliverables:**
- `src/services/social/adapters/platformAdapter.interface.ts` — common interface:

```typescript
interface PlatformAdapter {
  platform: string;

  // OAuth
  getAuthorizeUrl(redirectUri: string, state: string): string;
  exchangeCode(code: string): Promise<TokenBundle>;
  refreshToken(refreshToken: string): Promise<TokenBundle>;
  getProfile(accessToken: string): Promise<PlatformProfile>;

  // Posting
  publish(accountId: string, payload: PublishPayload): Promise<PublishResult>;
  deletePost?(accountId: string, platformPostId: string): Promise<void>;

  // Comments
  getComments(accountId: string, postId: string): Promise<Comment[]>;
  replyToComment(accountId: string, commentId: string, text: string): Promise<Comment>;

  // Analytics
  getPostInsights(accountId: string, postId: string): Promise<PostInsights>;
  getFollowerStats(accountId: string): Promise<FollowerStats>;

  // Token lifecycle
  validateToken(accessToken: string): Promise<boolean>;
}
```

- Implement one adapter at a time (start with Twitter — best API docs):

| Adapter | File | API Base | Key Scopes |
|---|---|---|---|
| Twitter | `adapters/twitter.adapter.ts` | `api.twitter.com/2` | `tweet.read tweet.write users.read offline.access` |
| LinkedIn | `adapters/linkedin.adapter.ts` | `api.linkedin.com/v2` | `w_member_social r_liteprofile w_organization_social` |
| Instagram | `adapters/instagram.adapter.ts` | `graph.facebook.com/v21.0` | `instagram_basic instagram_content_publish pages_read_engagement` |
| Reddit | `adapters/reddit.adapter.ts` | `oauth.reddit.com/api/v1` | `submit read identity` |

**Files to create:**
```
NEW:  src/services/social/adapters/platformAdapter.interface.ts
NEW:  src/services/social/adapters/twitter.adapter.ts
NEW:  src/services/social/adapters/linkedin.adapter.ts
NEW:  src/services/social/adapters/instagram.adapter.ts
NEW:  src/services/social/adapters/reddit.adapter.ts
NEW:  src/services/social/adapters/adapterFactory.ts
```

---

### Step 5: Build OAuth Orchestrator (Phase P2)

**What:** Replicate the full connect → callback → select flow. This replaces `ZernioService.getConnectUrl()`, the callback handler, and the selection flow.

**Deliverables:**
- `src/services/social/oauth/oauthOrchestrator.service.ts`:
  - `initiateConnection(platform, userId, profileId?)` — generates state token (stored in Redis/DB), builds authorize URL via adapter, returns `{ authUrl, state }`
  - `handleCallback(platform, code, state)` — validates state, exchanges code via adapter, fetches profile, returns `{ accountId, username, needsSelection, selectionOptions? }`
  - `completeSelection(userId, platform, selectionId)` — persists selected page/org to `social_accounts`
  - `listSelectionOptions(userId, platform, pendingToken)` — for platforms requiring page/org selection (LinkedIn orgs, Facebook pages)

- State token storage: Supabase `oauth_states` table (or in-memory for MVP):
```sql
CREATE TABLE public.oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  platform text NOT NULL,
  state_token text NOT NULL UNIQUE,
  code_verifier text,  -- for PKCE
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);
```

- Routes to create (mirror Zernio routes exactly):
  - `POST /api/social/connect` → calls `initiateConnection()`
  - `GET /api/social/callback` → calls `handleCallback()`
  - `GET /api/social/select` → calls `listSelectionOptions()`
  - `POST /api/social/select` → calls `completeSelection()`

**Files to create:**
```
NEW:  src/services/social/oauth/oauthOrchestrator.service.ts
NEW:  supabase/migrations/00009_oauth_states.sql
NEW:  src/app/api/social/connect/route.ts
NEW:  src/app/api/social/callback/route.ts
NEW:  src/app/api/social/select/route.ts
```

---

### Step 6: Build Publishing Service (Phase P2)

**What:** Cross-platform post creation, scheduling, and status tracking. Replaces `ZernioService.createPost()` / `listPosts()` / `cancelPost()`.

**Deliverables:**
- `src/services/social/publishing/publishing.service.ts`:
  - `createPost(userId, input)` — resolves account IDs from `social_accounts`, writes to `posts` + `post_targets`, either publishes immediately or enqueues for scheduled delivery
  - `publishToPlatform(postId, platformTarget)` — calls the appropriate adapter's `publish()`, updates `post_targets.status`
  - `listPosts(userId, filters?)` — reads from local `posts` table (enriched with platform status)
  - `cancelPost(postId)` — marks all `post_targets` as `failed`, removes from queue

- Media handling: existing `/api/social/zernio/upload` already stores to Supabase Storage — reuse as-is, just change the route path.

- Scheduled posting: use a simple polling approach initially (cron checks `posts.scheduled_for <= NOW()` every minute), upgrade to Inngest/job queue later.

**Files to create:**
```
NEW:  src/services/social/publishing/publishing.service.ts
NEW:  src/app/api/social/posts/route.ts          (GET, POST, DELETE)
EDIT: src/app/api/social/zernio/upload/route.ts  → rename to /api/social/upload
```

---

### Step 7: Build Comments & Inbox Service (Phase P2)

**What:** Unified comment aggregation and reply. Replaces `ZernioService.listCommentPosts()`, `getPostComments()`, `replyToComment()`.

**Deliverables:**
- `src/services/social/inbox/comments.service.ts`:
  - `listCommentPosts(userId, filters?)` — for each connected account, fetch recent posts that have comments via the platform adapter, merge into unified format
  - `getPostComments(userId, postId, accountId)` — fetch full comment thread from platform
  - `replyToComment(userId, postId, commentId, text)` — post reply via adapter, optimistic local update

- Comment storage: optional local cache in a `comments` table for fast reads:
```sql
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id),
  platform text NOT NULL,
  platform_comment_id text NOT NULL,
  author_name text,
  author_username text,
  author_avatar text,
  content text NOT NULL,
  created_at timestamptz,
  synced_at timestamptz DEFAULT now(),
  UNIQUE (platform, platform_comment_id)
);
```

- Comment polling: background worker polls active posts (created < 7 days) every 5-10 min for new comments, deduplicates by `platform_comment_id`.

**Files to create:**
```
NEW:  src/services/social/inbox/comments.service.ts
NEW:  src/app/api/social/comments/route.ts         (GET, POST)
NEW:  supabase/migrations/00010_comments_cache.sql
```

---

### Step 8: Build Analytics Service (Phase P3)

**What:** Unified analytics aggregation. Replaces `ZernioService.getAnalytics()`, `getFollowerStats()`.

**Deliverables:**
- `src/services/social/analytics/analytics.service.ts`:
  - `getAggregatedAnalytics(userId, dateRange)` — pulls from local `analytics_snapshots` table (populated by background worker)
  - `getFollowerStats(userId)` — per-platform follower counts + growth trend
  - `syncAnalytics(userId)` — on-demand refresh: calls each adapter's `getPostInsights()` and `getFollowerStats()`, writes snapshots

- Background worker: cron job every 6-12 hours that:
  1. Queries `social_accounts WHERE is_connected = true`
  2. For each account, fetches recent post insights via adapter
  3. Normalizes metrics (Retweets → engagements, LinkedIn Reposts → engagements)
  4. Writes to `analytics_snapshots` with today's timestamp

- Unified metrics schema:
```sql
-- Extend existing analytics_snapshots with:
ALTER TABLE public.analytics_snapshots
  ADD COLUMN IF NOT EXISTS views bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagements bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS saves bigint DEFAULT 0;
```

**Files to create:**
```
NEW:  src/services/social/analytics/analytics.service.ts
NEW:  src/app/api/social/analytics/route.ts          (GET)
NEW:  supabase/migrations/00011_analytics_views.sql
NEW:  src/workers/analyticsSync.ts                    (cron/Inngest)
```

---

### Step 9: Build Background Job Infrastructure (Phase P3)

**What:** Token refresh, analytics sync, scheduled post publishing, comment polling — all need to run as background jobs, not in request handlers.

**Deliverables:**
- Choose job runner: **Inngest** (recommended — already in spec) or Supabase Edge Functions
- Set up job definitions:

| Job | Trigger | Frequency | What it does |
|---|---|---|---|
| `tokenRefresh` | Cron | Daily | Scan accounts expiring in 5 days, refresh tokens |
| `analyticsSync` | Cron | Every 6-12h | Pull post insights + follower stats for all connected accounts |
| `commentPoller` | Cron | Every 5-10min | Fetch new comments on active posts (< 7 days old) |
| `scheduledPostPublisher` | Cron | Every 1min | Pick up posts where `scheduled_for <= NOW()` and status = `scheduled` |
| `tokenRevalidation` | Webhook | On publish failure | If a post fails with auth error, mark account as `needs_reconnection` |

- Error handling: exponential backoff with jitter for rate limits (429) and server errors (5xx)
- Dead letter queue for jobs that fail after max retries

**Files to create:**
```
NEW:  src/inngest/client.ts                          (Inngest client setup)
NEW:  src/inngest/functions/tokenRefresh.ts
NEW:  src/inngest/functions/analyticsSync.ts
NEW:  src/inngest/functions/commentPoller.ts
NEW:  src/inngest/functions/scheduledPostPublisher.ts
```

---

### Step 10: Integration Testing + Soak + Swap (Phase P4)

**What:** Verify the self-hosted API handles all current flows identically to Zernio, then flip the switch.

**Sub-steps:**

10a. **Route parity test:**
- Run both backends in parallel (Zernio as primary, self-hosted as shadow)
- For every API call, execute both providers, compare responses
- Log discrepancies

10b. **Frontend verification:**
- Test every flow manually:
  - [ ] Connect Instagram account → callback → select page → appears in Accounts
  - [ ] Connect Twitter account → appears in Accounts
  - [ ] Connect LinkedIn account → select org → appears in Accounts
  - [ ] Connect Reddit account → appears in Accounts
  - [ ] Create post → select accounts → preview → schedule → appears in Recent Posts
  - [ ] Cancel scheduled post → status changes to failed
  - [ ] View comments inbox → comments appear → reply works
  - [ ] View analytics → charts render with real data
  - [ ] Upload media → file stored in Supabase → URL works

10c. **Soak test:**
- Flip `SOCIAL_PROVIDER=selfhosted` on staging/preview
- Monitor for 48-72 hours
- Check: token refresh works, scheduled posts fire, comments sync, analytics populate
- Watch error rates

10d. **Production swap:**
- Set `SOCIAL_PROVIDER=selfhosted` in Vercel production env
- Keep Zernio env vars for rollback
- Monitor for 1 week

10e. **Cleanup (after 1 week stable):**
- Remove `ZERNIO_API_KEY` from env
- Delete `src/services/social/zernio.service.ts`
- Delete `src/app/api/social/zernio/` routes
- Delete `accountSync.service.ts` (Zernio-specific)
- Update `SOCIAL_PROVIDER` to always return `selfhosted`

**Files to create/modify:**
```
NEW:  src/services/social/__tests__/providerParity.test.ts
EDIT: All existing social API routes (add provider switching)
EDIT: .env.local → add SOCIAL_PROVIDER=selfhosted (staging only initially)
```

---

## Migration Strategy (Zero Downtime)

```
Week 1-2:  Steps 1-3  (Contract + Flag + Token Vault)
Week 3-4:  Steps 4-5  (Adapters + OAuth Orchestrator)
Week 5-6:  Step 6     (Publishing Service)
Week 7:    Step 7     (Comments & Inbox)
Week 8:    Step 8     (Analytics)
Week 9:    Step 9     (Background Jobs)
Week 10:   Step 10    (Testing + Soak + Swap)
```

At every step, `SOCIAL_PROVIDER=zernio` remains the default. The frontend never changes until Step 10.

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Platform API rate limits during testing | Use test/sandbox accounts; implement exponential backoff from day 1 |
| Token expiry during development | Build token refresh (Step 3) before testing any platform calls |
| OAuth app review delays | Start app review processes for IG/LinkedIn now (takes weeks); build Twitter/Reddit first (no review needed) |
| Zernio breaks during development | Self-hosted is additive; Zernio stays untouched until swap |
| Data inconsistency during soak | Shadow mode (Step 10a) catches discrepancies before they affect users |

---

## Success Criteria

- [ ] All 4 platform adapters (Twitter, LinkedIn, Instagram, Reddit) pass the contract tests
- [ ] OAuth connect → callback → select flow works for all platforms
- [ ] Cross-platform posting works with correct per-platform formatting
- [ ] Comments sync in real-time (< 10 min latency)
- [ ] Analytics populate with normalized metrics
- [ ] Token refresh handles 60-day expiry windows automatically
- [ ] Zero Zernio API calls in production after swap
- [ ] No frontend changes required during the swap (only env var change)
