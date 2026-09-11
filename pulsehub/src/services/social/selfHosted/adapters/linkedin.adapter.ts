import type {
  PlatformAdapter,
  PublishPayload,
  PublishResult,
  TokenBundle,
  Comment,
  PostAnalytics,
} from '../../contracts/types';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';
const LINKEDIN_OAUTH_BASE = 'https://www.linkedin.com/oauth/v2';

export class LinkedInAdapter implements PlatformAdapter {
  platform = 'linkedin' as const;

  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  // ─── OAuth ───────────────────────────────────────────────────────────────

  getAuthorizeUrl(redirectUri: string, state: string): string {
    const scopes = ['w_member_social', 'r_liteprofile', 'w_organization_social'].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      state,
    });

    return `${LINKEDIN_OAUTH_BASE}/authorization?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<TokenBundle> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const res = await fetch(`${LINKEDIN_OAUTH_BASE}/accessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error_description || data.error);

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  }

  async getProfile(accessToken: string): Promise<{ accountId: string; username: string }> {
    const res = await fetch(`${LINKEDIN_API_BASE}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    return { accountId: data.sub || '', username: data.name || data.given_name || '' };
  }

  // ─── Publishing ──────────────────────────────────────────────────────────

  async publish(accountId: string, accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const hasMedia = payload.mediaItems && payload.mediaItems.length > 0;
    const mediaUrl = hasMedia ? payload.mediaItems![0].url : undefined;

    // Detect author type: LinkedIn person IDs are UUID-like, org IDs are numeric
    const isPersonId = accountId.includes('-') || accountId.length > 20;
    const authorUrn = isPersonId
      ? `urn:li:person:${accountId}`
      : `urn:li:organization:${accountId}`;

    const body: Record<string, unknown> = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: payload.content },
          shareMediaCategory: mediaUrl ? 'IMAGE' : 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    if (mediaUrl) {
      (body.specificContent as any)['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          media: mediaUrl,
        },
      ];
    }

    try {
      const res = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.message || JSON.stringify(data));

      // LinkedIn returns the post ID in the x-restli-id header or body
      const postId = res.headers.get('x-restli-id') || data.id || '';

      return { success: true, platformPostId: postId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Organizations (Pages) ──────────────────────────────────────────────

  async getOrganizations(accessToken: string): Promise<Array<{ id: string; name: string; vanityName?: string }>> {
    const res = await fetch(
      `${LINKEDIN_API_BASE}/organizationAcls?q=roleAssignee&projection=(elements*(organization~(id,name,vanityName)))&role=ADMINISTRATOR`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await res.json();

    return (data.elements || [])
      .map((el: any) => ({
        id: el.organization?.id || el['organization~']?.id || '',
        name: el.organization?.name || el['organization~']?.name || '',
        vanityName: el.organization?.vanityName || el['organization~']?.vanityName || '',
      }))
      .filter((org: any) => org.id);
  }

  // ─── Comments ────────────────────────────────────────────────────────────

  async getComments(accountId: string, accessToken: string, postId: string): Promise<Comment[]> {
    // LinkedIn post URN format: urn:li:share:{id} or urn:li:ugcPost:{id}
    const postUrn = postId.startsWith('urn:') ? postId : `urn:li:share:${postId}`;

    const res = await fetch(
      `${LINKEDIN_API_BASE}/socialActions/${encodeURIComponent(postUrn)}/comments?q=threaded&count=50`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.message || JSON.stringify(data));

    return (data.elements || []).map((c: any) => ({
      id: c.id || '',
      platform: 'linkedin' as const,
      postId,
      authorName: c.actor?.name || '',
      authorUsername: '',
      authorAvatar: c.actor?.picture?.['image~']?.elements?.[0]?.identifiers?.[0]?.identifier || '',
      content: c.message?.text || '',
      createdAt: c.created?.time ? new Date(c.created.time).toISOString() : '',
      canReply: true,
      replyCount: c.commentsSummary?.totalFirstLevelComments || 0,
    }));
  }

  async replyToComment(accountId: string, accessToken: string, commentId: string, text: string): Promise<Comment> {
    // LinkedIn reply to comment
    const res = await fetch(`${LINKEDIN_API_BASE}/socialActions/${encodeURIComponent(commentId)}/replies`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        message: { text },
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.message || JSON.stringify(data));

    return {
      id: data.id || '',
      platform: 'linkedin',
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

  async getFollowerStats(accountId: string, accessToken: string): Promise<{ followers: number; engagement?: number }> {
    const res = await fetch(
      `${LINKEDIN_API_BASE}/organizationalEntityShareStatistics?q=organizationalEntity&organization=urn:li:organization:${accountId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.message || JSON.stringify(data));

    const stats = data.elements?.[0] || {};
    return {
      followers: stats.followerStatistics?.totalFollowerCount || 0,
      engagement: stats.totalShareStatistics?.shareCount || 0,
    };
  }

  async getPostInsights(accountId: string, accessToken: string, postId: string): Promise<Partial<PostAnalytics>> {
    const postUrn = postId.startsWith('urn:') ? postId : `urn:li:share:${postId}`;

    const res = await fetch(
      `${LINKEDIN_API_BASE}/organizationalEntityShareStatistics?q=organizationalEntity&organization=urn:li:organization:${accountId}&shares[0]=${encodeURIComponent(postUrn)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.message || JSON.stringify(data));

    const stats = data.elements?.[0]?.totalShareStatistics || {};
    return {
      impressions: stats.impressionCount || 0,
      reach: stats.uniqueImpressionsCount || 0,
      likes: stats.likeCount || 0,
      comments: stats.commentCount || 0,
      shares: stats.repostCount || 0,
      saves: 0,
      views: 0,
      clicks: stats.clickCount || 0,
    };
  }

  // ─── Recent Posts ───────────────────────────────────────────────────────

  async getRecentPosts(accountId: string, accessToken: string, limit = 50): Promise<Array<{ id: string; text: string; timestamp: string; mediaType: string }>> {
    const res = await fetch(
      `${LINKEDIN_API_BASE}/ugcPosts?q=authors&authors=List(urn:li:organization:${accountId})&count=${limit}&projection=(elements*(id,created,lastModified,specificContent))`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.message || JSON.stringify(data));

    return (data.elements || []).map((item: any) => {
      const content = item.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '';
      return {
        id: item.id || '',
        text: content,
        timestamp: item.created?.time ? new Date(item.created.time).toISOString() : '',
        mediaType: item.specificContent?.['com.linkedin.ugc.ShareContent']?.shareMediaCategory || 'NONE',
      };
    });
  }

  // ─── Token Validation ────────────────────────────────────────────────────

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const res = await fetch(`${LINKEDIN_API_BASE}/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
