import type {
  SocialProvider,
  ConnectRequest,
  ConnectResponse,
  CallbackRequest,
  CallbackResult,
  SelectionOption,
  SelectionRequest,
  SelectionResult,
  SocialAccount,
  CreatePostInput,
  CreatePostResult,
  ListPostsRequest,
  Post,
  ListCommentPostsRequest,
  CommentPost,
  GetCommentsRequest,
  Comment,
  ReplyCommentRequest,
  GetAnalyticsRequest,
  AnalyticsResult,
  PostAnalytics,
  UploadRequest,
  UploadResult,
  CrossPostPlatform,
} from '../contracts/types';
import { getAdapter, getMetaAdapter, isPlatformSupported } from './adapters/adapterFactory';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class SelfHostedProvider implements SocialProvider {
  name = 'selfhosted' as const;

  // ─── Connection ──────────────────────────────────────────────────────────

  async getConnectUrl(request: ConnectRequest): Promise<ConnectResponse> {
    const adapter = getAdapter(request.platform);
    if (!adapter) throw new Error(`Platform ${request.platform} is not supported yet`);

    const state = crypto.randomUUID();
    const redirectUri = `${BASE_URL}/api/social/callback`;

    // Store state in DB for validation
    await getSupabase().from('oauth_states').insert({
      user_id: request.userId,
      platform: request.platform,
      state_token: state,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
    });

    const authUrl = adapter.getAuthorizeUrl(redirectUri, state);
    return { authUrl, state };
  }

  async handleCallback(request: CallbackRequest): Promise<CallbackResult> {
    // Validate state
    const { data: stateRecord } = await getSupabase()
      .from('oauth_states')
      .select('*')
      .eq('state_token', request.state)
      .eq('platform', request.platform)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!stateRecord) {
      return { success: false, error: 'Invalid or expired state token' };
    }

    const userId = stateRecord.user_id;
    const redirectUri = `${BASE_URL}/api/social/callback`;

    try {
      if (request.platform === 'instagram' || request.platform === 'facebook' || request.platform === 'threads') {
        return await this.handleMetaCallback(request.code, redirectUri, userId, request.platform);
      } else if (request.platform === 'linkedin') {
        return await this.handleLinkedInCallback(request.code, redirectUri, userId);
      } else {
        return { success: false, error: `Platform ${request.platform} not implemented` };
      }
    } finally {
      // Clean up state
      await getSupabase().from('oauth_states').delete().eq('state_token', request.state);
    }
  }

  private async handleMetaCallback(
    code: string,
    redirectUri: string,
    userId: string,
    platform: CrossPostPlatform
  ): Promise<CallbackResult> {
    const adapter = getMetaAdapter();
    const tokenBundle = await adapter.exchangeCode(code, redirectUri);

    // Get pages to find IG accounts
    const pages = await adapter.getPages(tokenBundle.accessToken);

    // Check if there are IG accounts to select from
    const igAccounts = pages.filter((p) => p.igUserId);
    const fbPages = pages;

    if (platform === 'threads') {
      // For Threads, we need the IG user ID → threads user ID
      // Threads uses the same IG token, and the threads user ID = IG user ID
      const igAccount = igAccounts[0];
      if (!igAccount) {
        return { success: false, error: 'No Instagram account linked for Threads access' };
      }

      await this.storeAccount(userId, 'threads', igAccount.igUsername || igAccount.name, igAccount.igUserId!, tokenBundle.accessToken);
      return { success: true, accountId: igAccount.igUserId, username: igAccount.igUsername || igAccount.name, platform: 'threads' };
    }

    if (platform === 'instagram') {
      if (igAccounts.length > 1) {
        // Multiple IG accounts — need selection
        return {
          success: true,
          needsSelection: true,
          selectionOptions: igAccounts.map((ig) => ({
            id: ig.igUserId!,
            name: ig.name,
            username: ig.igUsername,
          })),
          platform: 'instagram',
        };
      }

      if (igAccounts.length === 1) {
        const ig = igAccounts[0];
        await this.storeAccount(userId, 'instagram', ig.igUsername || ig.name, ig.igUserId!, tokenBundle.accessToken);
        return { success: true, accountId: ig.igUserId, username: ig.igUsername || ig.name, platform: 'instagram' };
      }

      return { success: false, error: 'No Instagram business account found. Link your Instagram to a Facebook Page first.' };
    }

    if (platform === 'facebook') {
      if (fbPages.length > 1) {
        return {
          success: true,
          needsSelection: true,
          selectionOptions: fbPages.map((p) => ({
            id: p.id,
            name: p.name,
          })),
          platform: 'facebook',
        };
      }

      if (fbPages.length === 1) {
        const page = fbPages[0];
        await this.storeAccount(userId, 'facebook', page.name, page.id, page.accessToken);
        return { success: true, accountId: page.id, username: page.name, platform: 'facebook' };
      }

      return { success: false, error: 'No Facebook pages found. Create a Facebook Page first.' };
    }

    return { success: false, error: 'Unknown platform' };
  }

  private async handleLinkedInCallback(code: string, redirectUri: string, userId: string): Promise<CallbackResult> {
    const adapter = getAdapter('linkedin')!;
    const tokenBundle = await adapter.exchangeCode(code, redirectUri);
    const profile = await adapter.getProfile(tokenBundle.accessToken);

    // Get organizations for selection
    const linkedinAdapter = adapter as any;
    const orgs = await linkedinAdapter.getOrganizations(tokenBundle.accessToken);

    if (orgs.length > 1) {
      return {
        success: true,
        needsSelection: true,
        selectionOptions: orgs.map((o: any) => ({
          id: o.id,
          name: o.name,
          username: o.vanityName,
        })),
        platform: 'linkedin',
      };
    }

    if (orgs.length === 1) {
      await this.storeAccount(userId, 'linkedin', orgs[0].name, orgs[0].id, tokenBundle.accessToken);
      return { success: true, accountId: orgs[0].id, username: orgs[0].name, platform: 'linkedin' };
    }

    // No orgs — store personal profile
    await this.storeAccount(userId, 'linkedin', profile.username, profile.accountId, tokenBundle.accessToken);
    return { success: true, accountId: profile.accountId, username: profile.username, platform: 'linkedin' };
  }

  async listSelectionOptions(platform: CrossPostPlatform, userId: string, state: string): Promise<SelectionOption[]> {
    // Options are returned from handleCallback — this is for re-fetching if needed
    return [];
  }

  async completeSelection(request: SelectionRequest): Promise<SelectionResult> {
    // Retrieve stored tokens from the most recent social_account for this user + platform
    const { data: existing } = await getSupabase()
      .from('social_accounts')
      .select('access_token')
      .eq('user_id', request.userId)
      .eq('platform', request.platform)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!existing?.access_token) {
      return { success: false, error: 'No stored token found' };
    }

    // Get the selection details
    const option = request.selectionId; // This is the selected org/page ID

    // Look up the name from selection options if available, otherwise use the ID
    const { data: existingAccount } = await getSupabase()
      .from('social_accounts')
      .select('username')
      .eq('user_id', request.userId)
      .eq('platform', request.platform)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const username = existingAccount?.username || option;

    // Store the account with the selected org/page ID as profile_id
    await this.storeAccount(request.userId, request.platform, username, option, existing.access_token);
    return { success: true, accountId: option, username };
  }

  async listAccounts(userId: string): Promise<SocialAccount[]> {
    const { data } = await getSupabase()
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return (data || []).map((row) => ({
      id: row.id,
      platform: row.platform,
      username: row.username,
      profileId: row.profile_id || '',
      isConnected: row.is_connected,
      lastSynced: row.last_synced,
    }));
  }

  // ─── Publishing ──────────────────────────────────────────────────────────

  async createPost(input: CreatePostInput): Promise<CreatePostResult> {
    const platformResults: CreatePostResult['platformResults'] = [];

    for (const target of input.platforms) {
      const adapter = getAdapter(target.platform);
      if (!adapter) {
        platformResults.push({
          platform: target.platform,
          accountId: target.accountId,
          status: 'failed',
          error: `Platform ${target.platform} not supported`,
        });
        continue;
      }

      // Get access token for this account
      const { data: account } = await getSupabase()
        .from('social_accounts')
        .select('access_token')
        .eq('user_id', input.userId)
        .eq('platform', target.platform)
        .eq('profile_id', target.accountId)
        .single();

      if (!account?.access_token) {
        platformResults.push({
          platform: target.platform,
          accountId: target.accountId,
          status: 'failed',
          error: 'No access token found',
        });
        continue;
      }

      const publishPayload = {
        content: target.customContent || input.content,
        mediaItems: input.mediaItems,
        platformSpecificData: target.platformSpecificData,
      };

      let result;
      if (target.platform === 'threads') {
        const metaAdapter = getMetaAdapter();
        result = await metaAdapter.publishToThreads(target.accountId, account.access_token, publishPayload);
      } else {
        result = await adapter.publish(target.accountId, account.access_token, publishPayload);
      }

      platformResults.push({
        platform: target.platform,
        accountId: target.accountId,
        status: result.success ? 'published' : 'failed',
        platformPostId: result.platformPostId,
        error: result.error,
      });
    }

    // Store post in local DB
    const { data: post } = await getSupabase()
      .from('posts')
      .insert({
        user_id: input.userId,
        content: input.content,
        status: platformResults.some((r) => r.status === 'published') ? 'published' : 'failed',
        scheduled_for: input.scheduledFor,
      })
      .select('id')
      .single();

    if (post) {
      for (const result of platformResults) {
        await getSupabase().from('post_targets').insert({
          post_id: post.id,
          platform: result.platform,
          content: input.content,
          status: result.status,
          platform_post_id: result.platformPostId,
          error: result.error,
        });
      }
    }

    return {
      postId: post?.id || '',
      platformResults,
    };
  }

  async listPosts(request: ListPostsRequest): Promise<Post[]> {
    const { data: posts } = await getSupabase()
      .from('posts')
      .select('*, post_targets(*)')
      .eq('user_id', request.userId)
      .order('created_at', { ascending: false })
      .limit(request.limit || 50);

    return (posts || []).map((post: any) => ({
      id: post.id,
      content: post.content,
      status: post.status,
      scheduledFor: post.scheduled_for,
      publishedAt: post.published_at,
      createdAt: post.created_at,
      platforms: (post.post_targets || []).map((t: any) => ({
        platform: t.platform,
        accountId: '',
        status: t.status,
        platformPostId: t.platform_post_id,
        destination: t.destination,
        error: t.error,
      })),
    }));
  }

  async cancelPost(postId: string): Promise<void> {
    await getSupabase()
      .from('post_targets')
      .update({ status: 'failed', error: 'Cancelled by user' })
      .eq('post_id', postId)
      .eq('status', 'scheduled');

    await getSupabase()
      .from('posts')
      .update({ status: 'failed' })
      .eq('id', postId);
  }

  // ─── Comments ────────────────────────────────────────────────────────────

  async listCommentPosts(request: ListCommentPostsRequest): Promise<CommentPost[]> {
    // Query local posts that have published targets
    const { data: posts } = await getSupabase()
      .from('posts')
      .select('*, post_targets(*)')
      .eq('user_id', request.userId)
      .order('created_at', { ascending: false })
      .limit((request.limit || 25) * 2); // Fetch more to filter client-side

    // Filter to only posts with at least one published target
    const publishedPosts = (posts || []).filter((post: any) =>
      post.post_targets?.some((t: any) => t.status === 'published')
    );

    return publishedPosts.slice(0, request.limit || 25).map((post: any) => ({
      postId: post.id,
      platform: post.post_targets?.[0]?.platform || 'instagram',
      content: post.content,
      commentCount: 0,
    }));
  }

  async getPostComments(request: GetCommentsRequest): Promise<Comment[]> {
    const adapter = getAdapter(request.platform);
    if (!adapter?.getComments) return [];

    const { data: account } = await getSupabase()
      .from('social_accounts')
      .select('access_token')
      .eq('user_id', request.userId)
      .eq('profile_id', request.accountId)
      .single();

    if (!account?.access_token) return [];

    return adapter.getComments(request.accountId, account.access_token, request.postId);
  }

  async replyToComment(request: ReplyCommentRequest): Promise<Comment> {
    const adapter = getAdapter(request.platform);
    if (!adapter?.replyToComment) throw new Error('Reply not supported for this platform');

    const { data: account } = await getSupabase()
      .from('social_accounts')
      .select('access_token')
      .eq('user_id', request.userId)
      .eq('profile_id', request.accountId)
      .single();

    if (!account?.access_token) throw new Error('No access token');

    return adapter.replyToComment(request.accountId, account.access_token, request.commentId, request.text);
  }

  // ─── Analytics ───────────────────────────────────────────────────────────

  async getAnalytics(request: GetAnalyticsRequest): Promise<AnalyticsResult> {
    const { data: accounts } = await getSupabase()
      .from('social_accounts')
      .select('*')
      .eq('user_id', request.userId)
      .eq('is_connected', true);

    const platforms: AnalyticsResult['platforms'] = [];
    const allPosts: AnalyticsResult['posts'] = [];

    for (const account of accounts || []) {
      if (request.platform && account.platform !== request.platform) continue;

      const adapter = getAdapter(account.platform as CrossPostPlatform);
      if (!adapter) continue;

      const platformImpressions = { impressions: 0, reach: 0, engagement: 0 };

      // 1. Get follower stats
      if (adapter.getFollowerStats) {
        try {
          const stats = await adapter.getFollowerStats(account.profile_id, account.access_token);
          platforms.push({
            platform: account.platform as CrossPostPlatform,
            accountId: account.profile_id,
            username: account.username,
            followers: stats.followers,
            impressions: 0,
            reach: 0,
            engagement: 0,
            engagementRate: 0,
          });
        } catch {
          platforms.push({
            platform: account.platform as CrossPostPlatform,
            accountId: account.profile_id,
            username: account.username,
            followers: 0,
            impressions: 0,
            reach: 0,
            engagement: 0,
            engagementRate: 0,
          });
        }
      }

      // 2. Fetch recent posts and their insights
      if (adapter.getRecentPosts || adapter.getPostInsights) {
        try {
          let recentPosts: Array<{ id: string; text: string; timestamp: string; mediaType: string }> = [];

          // Fetch recent posts from the platform
          if (account.platform === 'instagram' || account.platform === 'facebook' || account.platform === 'threads') {
            const metaAdapter = getMetaAdapter();
            if (account.platform === 'threads') {
              const threads = await metaAdapter.getRecentThreads(account.profile_id, account.access_token, 25);
              recentPosts = threads.map(t => ({ id: t.id, text: t.text, timestamp: t.timestamp, mediaType: t.mediaType }));
            } else {
              const media = await metaAdapter.getRecentMedia(account.profile_id, account.access_token, 25);
              recentPosts = media.map(m => ({ id: m.id, text: m.caption, timestamp: m.timestamp, mediaType: m.mediaType }));
            }
          } else if (account.platform === 'linkedin' && adapter.getRecentPosts) {
            recentPosts = await adapter.getRecentPosts(account.profile_id, account.access_token, 25);
          }

          // Get insights for each post
          for (const post of recentPosts) {
            try {
              if (!adapter.getPostInsights) continue;

              let insights: Partial<PostAnalytics>;

              if (account.platform === 'threads') {
                const metaAdapter = getMetaAdapter();
                insights = await metaAdapter.getThreadsInsights(account.profile_id, account.access_token, post.id);
              } else {
                insights = await adapter.getPostInsights(account.profile_id, account.access_token, post.id);
              }

              platformImpressions.impressions += insights.impressions || 0;
              platformImpressions.reach += insights.reach || 0;
              platformImpressions.engagement += (insights.likes || 0) + (insights.comments || 0) + (insights.shares || 0);

              allPosts.push({
                postId: post.id,
                platform: account.platform as CrossPostPlatform,
                content: post.text,
                impressions: insights.impressions || 0,
                reach: insights.reach || 0,
                likes: insights.likes || 0,
                comments: insights.comments || 0,
                shares: insights.shares || 0,
                saves: insights.saves || 0,
                views: insights.views || 0,
                clicks: insights.clicks || 0,
                publishedAt: post.timestamp,
              });
            } catch {
              // Skip individual post failures
            }
          }
        } catch {
          // Skip platform-level failures
        }
      }

      // 3. Update platform totals
      const platformEntry = platforms.find(p => p.accountId === account.profile_id);
      if (platformEntry) {
        platformEntry.impressions = platformImpressions.impressions;
        platformEntry.reach = platformImpressions.reach;
        platformEntry.engagement = platformImpressions.engagement;
        platformEntry.engagementRate = platformEntry.followers > 0
          ? Math.round((platformImpressions.engagement / platformEntry.followers) * 10000) / 100
          : 0;
      }
    }

    // 4. Build follower trend from snapshots
    const dateFrom = request.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const dateTo = request.dateTo || new Date().toISOString();

    const { data: snapshots } = await getSupabase()
      .from('analytics_snapshots')
      .select('*')
      .eq('user_id', request.userId)
      .gte('snapshot_date', dateFrom)
      .lte('snapshot_date', dateTo)
      .order('snapshot_date', { ascending: true });

    const followerTrend: AnalyticsResult['followerTrend'] = (snapshots || []).map((snap: any) => ({
      date: snap.snapshot_date,
      platform: snap.platform as CrossPostPlatform,
      followers: snap.followers || 0,
    }));

    // Sort posts by publishedAt descending (most recent first)
    allPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return {
      hasAccess: platforms.length > 0,
      dateRange: { from: dateFrom, to: dateTo },
      platforms,
      posts: allPosts.slice(0, 50),
      followerTrend,
      lastSync: new Date().toISOString(),
    };
  }

  // ─── Upload ──────────────────────────────────────────────────────────────

  async presignUpload(request: UploadRequest): Promise<UploadResult> {
    const filePath = `${request.userId}/${Date.now()}-${request.filename}`;

    const { data, error } = await getSupabase().storage
      .from('post-media')
      .createSignedUploadUrl(filePath);

    if (error) throw new Error(error.message);

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-media/${filePath}`;

    return {
      uploadUrl: data.signedUrl,
      publicUrl,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async storeAccount(
    userId: string,
    platform: string,
    username: string,
    profileId: string,
    accessToken: string
  ): Promise<void> {
    // Upsert — if account with same profile_id exists, update; otherwise insert
    const { data: existing } = await getSupabase()
      .from('social_accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('profile_id', profileId)
      .single();

    if (existing) {
      await getSupabase()
        .from('social_accounts')
        .update({
          username,
          access_token: accessToken,
          is_connected: true,
          last_synced: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await getSupabase().from('social_accounts').insert({
        user_id: userId,
        platform,
        username,
        profile_id: profileId,
        access_token: accessToken,
        is_connected: true,
        last_synced: new Date().toISOString(),
      });
    }
  }
}
