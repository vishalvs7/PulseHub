import type {
  PlatformAdapter,
  PublishPayload,
  PublishResult,
  TokenBundle,
  Comment,
  PostAnalytics,
} from '../../contracts/types';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
const THREADS_BASE = 'https://graph.threads.net/v1.0';

interface MetaTokenBundle extends TokenBundle {
  accountId?: string;
  username?: string;
  pages?: Array<{ id: string; name: string; access_token: string; instagram_business_account?: { id: string; username: string } }>;
}

export class MetaAdapter implements PlatformAdapter {
  platform = 'instagram' as const;

  private appId: string;
  private appSecret: string;

  constructor() {
    this.appId = process.env.META_APP_ID || '';
    this.appSecret = process.env.META_APP_SECRET || '';
  }

  isConfigured(): boolean {
    return !!(this.appId && this.appSecret);
  }

  // ─── OAuth ───────────────────────────────────────────────────────────────

  getAuthorizeUrl(redirectUri: string, state: string): string {
    const scopes = [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'pages_read_engagement',
      'pages_show_list',
      'pages_manage_posts',
      'threads_basic',
      'threads_content_publish',
      'threads_manage_replies',
    ].join(',');

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      state,
    });

    return `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<MetaTokenBundle> {
    // Step 1: Exchange code for short-lived user token
    const tokenRes = await fetch(
      `${GRAPH_BASE}/oauth/access_token?client_id=${this.appId}&client_secret=${this.appSecret}&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`
    );
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error.message);

    const shortLivedToken = tokenData.access_token;

    // Step 2: Exchange short-lived for long-lived token (60 days)
    const longLivedRes = await fetch(
      `${GRAPH_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${this.appId}&client_secret=${this.appSecret}&fb_exchange_token=${shortLivedToken}`
    );
    const longLivedData = await longLivedRes.json();
    const longLivedToken = longLivedData.access_token || shortLivedToken;

    // Step 3: Fetch pages and IG business accounts
    const pagesRes = await fetch(
      `${GRAPH_BASE}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${longLivedToken}`
    );
    const pagesData = await pagesRes.json();
    const pages = pagesData.data || [];

    // Step 4: Determine primary IG + FB account
    let accountId = '';
    let username = '';

    // Look for Instagram business account linked to a page
    for (const page of pages) {
      if (page.instagram_business_account) {
        accountId = page.instagram_business_account.id;
        username = page.instagram_business_account.username;
        break;
      }
    }

    // If no IG account, use the first Facebook page
    if (!accountId && pages.length > 0) {
      accountId = pages[0].id;
      username = pages[0].name;
    }

    return {
      accessToken: longLivedToken,
      accountId,
      username,
      pages,
    };
  }

  async getProfile(accessToken: string): Promise<{ accountId: string; username: string }> {
    const res = await fetch(`${GRAPH_BASE}/me?fields=id,name&access_token=${accessToken}`);
    const data = await res.json();
    return { accountId: data.id || '', username: data.name || '' };
  }

  // ─── Publishing ──────────────────────────────────────────────────────────

  async publish(accountId: string, accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const hasMedia = payload.mediaItems && payload.mediaItems.length > 0;
    const isVideo = hasMedia && payload.mediaItems![0].type === 'video';
    const mediaUrl = hasMedia ? payload.mediaItems![0].url : undefined;

    try {
      if (isVideo) {
        return await this.publishVideo(accountId, accessToken, payload.content, mediaUrl!);
      } else if (hasMedia) {
        return await this.publishImage(accountId, accessToken, payload.content, mediaUrl!);
      } else {
        return await this.publishText(accountId, accessToken, payload.content);
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async publishImage(accountId: string, accessToken: string, caption: string, imageUrl: string): Promise<PublishResult> {
    // Step 1: Create media container
    const containerRes = await fetch(`${GRAPH_BASE}/${accountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      }),
    });
    const container = await containerRes.json();
    if (container.error) throw new Error(container.error.message);

    // Step 2: Publish container
    const publishRes = await fetch(`${GRAPH_BASE}/${accountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: accessToken,
      }),
    });
    const result = await publishRes.json();
    if (result.error) throw new Error(result.error.message);

    return { success: true, platformPostId: result.id };
  }

  private async publishVideo(accountId: string, accessToken: string, caption: string, videoUrl: string): Promise<PublishResult> {
    // Step 1: Create video container
    const containerRes = await fetch(`${GRAPH_BASE}/${accountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'VIDEO',
        video_url: videoUrl,
        caption,
        access_token: accessToken,
      }),
    });
    const container = await containerRes.json();
    if (container.error) throw new Error(container.error.message);

    // Step 2: Wait for processing (poll status)
    let status = 'PROCESSING';
    let attempts = 0;
    while (status === 'PROCESSING' && attempts < 30) {
      await new Promise((r) => setTimeout(r, 2000));
      const statusRes = await fetch(
        `${GRAPH_BASE}/${container.id}?fields=status_code&access_token=${accessToken}`
      );
      const statusData = await statusRes.json();
      status = statusData.status_code || 'ERROR';
      attempts++;
    }

    if (status !== 'FINISHED') {
      throw new Error(`Video processing ${status.toLowerCase()}`);
    }

    // Step 3: Publish
    const publishRes = await fetch(`${GRAPH_BASE}/${accountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: accessToken,
      }),
    });
    const result = await publishRes.json();
    if (result.error) throw new Error(result.error.message);

    return { success: true, platformPostId: result.id };
  }

  private async publishText(accountId: string, accessToken: string, text: string): Promise<PublishResult> {
    // Facebook page text post
    const res = await fetch(`${GRAPH_BASE}/${accountId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        access_token: accessToken,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return { success: true, platformPostId: data.id };
  }

  // ─── Threads Publishing ──────────────────────────────────────────────────

  async publishToThreads(threadsUserId: string, accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const hasMedia = payload.mediaItems && payload.mediaItems.length > 0;

    try {
      if (hasMedia) {
        return await this.publishThreadWithMedia(threadsUserId, accessToken, payload);
      } else {
        return await this.publishThreadText(threadsUserId, accessToken, payload.content);
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async publishThreadText(threadsUserId: string, accessToken: string, text: string): Promise<PublishResult> {
    // Step 1: Create container
    const containerRes = await fetch(`${THREADS_BASE}/${threadsUserId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'TEXT',
        text,
        access_token: accessToken,
      }),
    });
    const container = await containerRes.json();
    if (container.error) throw new Error(container.error.message);

    // Step 2: Publish
    const publishRes = await fetch(`${THREADS_BASE}/${threadsUserId}/threads_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: accessToken,
      }),
    });
    const result = await publishRes.json();
    if (result.error) throw new Error(result.error.message);

    return { success: true, platformPostId: result.id };
  }

  private async publishThreadWithMedia(threadsUserId: string, accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const mediaItem = payload.mediaItems![0];
    const isVideo = mediaItem.type === 'video';

    // Step 1: Create container
    const containerBody: Record<string, unknown> = {
      media_type: isVideo ? 'VIDEO' : 'IMAGE',
      access_token: accessToken,
    };

    if (isVideo) {
      containerBody.video_url = mediaItem.url;
    } else {
      containerBody.image_url = mediaItem.url;
    }

    if (payload.content) {
      containerBody.text = payload.content;
    }

    const containerRes = await fetch(`${THREADS_BASE}/${threadsUserId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(containerBody),
    });
    const container = await containerRes.json();
    if (container.error) throw new Error(container.error.message);

    // Step 2: Publish
    const publishRes = await fetch(`${THREADS_BASE}/${threadsUserId}/threads_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: accessToken,
      }),
    });
    const result = await publishRes.json();
    if (result.error) throw new Error(result.error.message);

    return { success: true, platformPostId: result.id };
  }

  // ─── Comments ────────────────────────────────────────────────────────────

  async getComments(accountId: string, accessToken: string, mediaId: string): Promise<Comment[]> {
    const res = await fetch(
      `${GRAPH_BASE}/${mediaId}/comments?fields=id,text,timestamp,username,name&access_token=${accessToken}`
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return (data.data || []).map((c: any) => ({
      id: c.id,
      platform: 'instagram' as const,
      postId: mediaId,
      authorName: c.name || c.username || '',
      authorUsername: c.username || '',
      content: c.text || '',
      createdAt: c.timestamp || '',
      canReply: true,
      replyCount: 0,
    }));
  }

  async replyToComment(accountId: string, accessToken: string, commentId: string, text: string): Promise<Comment> {
    const res = await fetch(`${GRAPH_BASE}/${commentId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        access_token: accessToken,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return {
      id: data.id,
      platform: 'instagram',
      postId: '',
      authorName: '',
      authorUsername: '',
      content: text,
      createdAt: new Date().toISOString(),
      canReply: true,
      replyCount: 0,
    };
  }

  // ─── Threads Comments (Replies) ─────────────────────────────────────────

  async getThreadsReplies(threadsUserId: string, accessToken: string, postId: string): Promise<Comment[]> {
    const res = await fetch(
      `${THREADS_BASE}/${postId}/replies?fields=id,text,timestamp,username,name&access_token=${accessToken}`
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return (data.data || []).map((c: any) => ({
      id: c.id,
      platform: 'threads' as const,
      postId,
      authorName: c.name || c.username || '',
      authorUsername: c.username || '',
      content: c.text || '',
      createdAt: c.timestamp || '',
      canReply: true,
      replyCount: 0,
    }));
  }

  async replyToThreadsReply(threadsUserId: string, accessToken: string, commentId: string, text: string): Promise<Comment> {
    const res = await fetch(`${THREADS_BASE}/${commentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        access_token: accessToken,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return {
      id: data.id,
      platform: 'threads',
      postId: '',
      authorName: '',
      authorUsername: '',
      content: text,
      createdAt: new Date().toISOString(),
      canReply: true,
      replyCount: 0,
    };
  }

  // ─── Analytics ───────────────────────────────────────────────────────────

  async getPostInsights(accountId: string, accessToken: string, mediaId: string): Promise<Partial<PostAnalytics>> {
    const metrics = ['impressions', 'reach', 'engagement', 'saved'];
    const res = await fetch(
      `${GRAPH_BASE}/${mediaId}/insights?metric=${metrics.join(',')}&access_token=${accessToken}`
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const insights: Record<string, number> = {};
    for (const item of data.data || []) {
      insights[item.name] = item.values?.[0]?.value || 0;
    }

    return {
      impressions: insights.impressions || 0,
      reach: insights.reach || 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: insights.saved || 0,
      views: 0,
      clicks: 0,
    };
  }

  async getFollowerStats(accountId: string, accessToken: string): Promise<{ followers: number; engagement?: number }> {
    const res = await fetch(
      `${GRAPH_BASE}/${accountId}?fields=followers_count,media_count&access_token=${accessToken}`
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return {
      followers: data.followers_count || 0,
    };
  }

  async getThreadsInsights(threadsUserId: string, accessToken: string, postId: string): Promise<Partial<PostAnalytics>> {
    const metrics = ['impressions', 'likes', 'replies', 'reposts', 'quotes'];
    const res = await fetch(
      `${THREADS_BASE}/${postId}/insights?metric=${metrics.join(',')}&access_token=${accessToken}`
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const insights: Record<string, number> = {};
    for (const item of data.data || []) {
      insights[item.name] = item.values?.[0]?.value || 0;
    }

    return {
      impressions: insights.impressions || 0,
      reach: 0,
      likes: insights.likes || 0,
      comments: insights.replies || 0,
      shares: (insights.reposts || 0) + (insights.quotes || 0),
      saves: 0,
      views: 0,
      clicks: 0,
    };
  }

  // ─── Token Validation ────────────────────────────────────────────────────

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const res = await fetch(`${GRAPH_BASE}/me?access_token=${accessToken}`);
      const data = await res.json();
      return !data.error;
    } catch {
      return false;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  async getPages(accessToken: string): Promise<Array<{ id: string; name: string; accessToken: string; igUserId?: string; igUsername?: string }>> {
    const res = await fetch(
      `${GRAPH_BASE}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${accessToken}`
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    return (data.data || []).map((page: any) => ({
      id: page.id,
      name: page.name,
      accessToken: page.access_token,
      igUserId: page.instagram_business_account?.id,
      igUsername: page.instagram_business_account?.username,
    }));
  }

  async getThreadsUserId(igUserId: string, accessToken: string): Promise<string | null> {
    // Threads user ID can be obtained via the Instagram Graph API
    // The Threads user ID is the same as the Instagram account ID for now
    // This may change in the future
    return igUserId;
  }
}
