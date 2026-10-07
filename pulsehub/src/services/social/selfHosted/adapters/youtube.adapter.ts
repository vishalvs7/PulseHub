import type {
  PlatformAdapter,
  PublishPayload,
  PublishResult,
  TokenBundle,
  PostAnalytics,
} from '../../contracts/types';

const GOOGLE_OAUTH_BASE = 'https://oauth2.googleapis.com';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_UPLOAD_BASE = 'https://www.googleapis.com/upload/youtube/v3/videos';
const MAX_UPLOAD_BYTES = 250 * 1024 * 1024;

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.upload',
].join(' ');

export class YouTubeAdapter implements PlatformAdapter {
  platform = 'youtube' as const;

  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  // ─── OAuth ───────────────────────────────────────────────────────────────

  getAuthorizeUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<TokenBundle> {
    return this.tokenRequest({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });
  }

  async refreshToken(refreshToken: string): Promise<TokenBundle> {
    return this.tokenRequest({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
  }

  private async tokenRequest(params: Record<string, string>): Promise<TokenBundle> {
    const res = await fetch(`${GOOGLE_OAUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        ...params,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }).toString(),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error_description || data.error || `Google token error (${res.status})`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || undefined,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  }

  async getProfile(accessToken: string): Promise<{ accountId: string; username: string }> {
    const data = await this.apiGet('/channels?part=snippet&mine=true', accessToken);
    const channel = data.items?.[0];
    return {
      accountId: channel?.id || '',
      username: channel?.snippet?.title || 'YouTube channel',
    };
  }

  // ─── Publishing ──────────────────────────────────────────────────────────

  async publish(accountId: string, accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const media = payload.mediaItems?.[0];
    if (!media || media.type === 'image' || media.type === 'document') {
      return { success: false, error: 'YouTube requires a video file' };
    }

    try {
      const head = await fetch(media.url, { method: 'HEAD' });
      const contentType = head.headers.get('content-type') || 'video/mp4';
      if (!contentType.startsWith('video/')) {
        return { success: false, error: `Media is not a video (${contentType})` };
      }

      const mediaRes = await fetch(media.url);
      if (!mediaRes.ok) {
        return { success: false, error: `Could not download media (${mediaRes.status})` };
      }

      const buffer = Buffer.from(await mediaRes.arrayBuffer());
      if (buffer.byteLength > MAX_UPLOAD_BYTES) {
        return { success: false, error: 'Video exceeds 250MB upload limit' };
      }

      const content = (payload.content || '').trim();
      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      const title = (lines[0] || 'Untitled video').slice(0, 100);
      const description = lines.slice(1).join('\n').slice(0, 4800);

      const metadata = {
        snippet: {
          title,
          description,
          categoryId: '22',
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
      };

      const boundary = `pulsehub-${Date.now()}`;
      const parts = [
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
        JSON.stringify(metadata),
        `\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
        buffer,
        `\r\n--${boundary}--\r\n`,
      ];

      const res = await fetch(
        `${YOUTUBE_UPLOAD_BASE}?uploadType=multipart&part=snippet,status&notifySubscribers=true`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: Buffer.concat(parts.map((p) => (typeof p === 'string' ? Buffer.from(p) : p))),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        const reason = data?.error?.errors?.[0]?.reason || data?.error?.message || `(${res.status})`;
        return { success: false, error: `YouTube upload failed: ${reason}` };
      }

      return { success: true, platformPostId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Analytics ───────────────────────────────────────────────────────────

  async getFollowerStats(accountId: string, accessToken: string): Promise<{ followers: number; engagement?: number }> {
    const data = await this.apiGet(
      `/channels?part=statistics&id=${encodeURIComponent(accountId)}`,
      accessToken
    );
    const stats = data.items?.[0]?.statistics || {};
    return {
      followers: parseInt(stats.subscriberCount || '0', 10),
      engagement: parseInt(stats.hiddenSubscriberCount ? '0' : stats.viewCount || '0', 10),
    };
  }

  async getRecentPosts(
    accountId: string,
    accessToken: string,
    limit = 25
  ): Promise<Array<{ id: string; text: string; timestamp: string; mediaType: string }>> {
    const data = await this.apiGet(
      `/videos?part=snippet&mine=true&maxResults=${Math.min(limit, 50)}`,
      accessToken
    );
    return (data.items || []).map((item: any) => ({
      id: item.id,
      text: item.snippet?.title || '',
      timestamp: item.snippet?.publishedAt || '',
      mediaType: 'VIDEO',
    }));
  }

  async getPostInsights(
    accountId: string,
    accessToken: string,
    postId: string
  ): Promise<Partial<PostAnalytics>> {
    const data = await this.apiGet(
      `/videos?part=statistics&id=${encodeURIComponent(postId)}`,
      accessToken
    );
    const stats = data.items?.[0]?.statistics || {};
    const views = parseInt(stats.viewCount || '0', 10);
    const likes = parseInt(stats.likeCount || '0', 10);
    const comments = parseInt(stats.commentCount || '0', 10);

    return {
      impressions: views,
      reach: views,
      likes,
      comments,
      shares: 0,
      saves: 0,
      views,
      clicks: 0,
    };
  }

  // ─── Token Validation ────────────────────────────────────────────────────

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const res = await fetch(`${YOUTUBE_API_BASE}/channels?part=id&mine=true`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async apiGet(path: string, accessToken: string): Promise<any> {
    const res = await fetch(`${YOUTUBE_API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
      const reason = data?.error?.errors?.[0]?.reason || data?.error?.message || `(${res.status})`;
      throw new Error(`YouTube API error: ${reason}`);
    }
    return data;
  }
}
