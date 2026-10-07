import type {
  PlatformAdapter,
  PublishPayload,
  PublishResult,
  TokenBundle,
  SelectionOption,
} from '../../contracts/types';

const REDDIT_OAUTH_BASE = 'https://www.reddit.com/api/v1';
const REDDIT_API_BASE = 'https://oauth.reddit.com';
const USER_AGENT = 'web:pulsehub:v1.0 (cross-posting app)';

export class RedditAdapter implements PlatformAdapter {
  platform = 'reddit' as const;

  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID || '';
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET || '';
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  // ─── OAuth ───────────────────────────────────────────────────────────────

  getAuthorizeUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      state,
      redirect_uri: redirectUri,
      duration: 'permanent',
      scope: 'identity mysubreddits submit read',
    });

    return `${REDDIT_OAUTH_BASE}/authorize?${params.toString()}`;
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
    const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const res = await fetch(`${REDDIT_OAUTH_BASE}/access_token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
      },
      body: new URLSearchParams(params).toString(),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error_description || data.message || `Reddit token error (${res.status})`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || undefined,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  }

  async getProfile(accessToken: string): Promise<{ accountId: string; username: string }> {
    const data = await this.apiGet('/api/v1/me', accessToken);
    const username = data.name || '';
    return { accountId: username, username };
  }

  async listConnectOptions(accessToken: string): Promise<SelectionOption[]> {
    const data = await this.apiGet('/subreddits/mine/subscriber?limit=100&raw_json=1', accessToken);
    const children = data?.data?.children || [];

    return children
      .map((child: any) => {
        const sub = child.data || {};
        if (!sub.display_name) return null;
        return {
          id: `r/${sub.display_name}`,
          name: `r/${sub.display_name}`,
          description: sub.title || sub.public_description || '',
        } as SelectionOption;
      })
      .filter(Boolean) as SelectionOption[];
  }

  // ─── Publishing ──────────────────────────────────────────────────────────

  async publish(accountId: string, accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const subreddit = accountId.replace(/^r\//, '');
    const content = (payload.content || '').trim();
    const media = payload.mediaItems?.[0];

    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    const title = (lines[0] || 'Untitled post').slice(0, 300);
    const bodyLines = lines.slice(1);
    const body = bodyLines.length > 0 ? bodyLines.join('\n').slice(0, 40000) : '';

    const form: Record<string, string> = {
      sr: subreddit,
      title,
      api_type: 'json',
      ad: 'false',
    };

    if (media && (media.type === 'image' || media.type === 'gif')) {
      form.kind = 'link';
      form.url = media.url;
    } else {
      form.kind = 'self';
      form.text = body || content.slice(0, 40000);
      if (media) {
        form.text = `${form.text}\n\n${media.url}`.slice(0, 40000);
      }
    }

    try {
      const res = await fetch(`${REDDIT_API_BASE}/api/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
        },
        body: new URLSearchParams(form).toString(),
      });

      const data = await res.json();
      const errors: any[] = data?.data?.errors || [];
      if (!res.ok || errors.length > 0) {
        const message = errors.length > 0
          ? errors.map((e) => `${e[0]}: ${e[1]}`).join('; ')
          : `Reddit API error (${res.status})`;
        return { success: false, error: message };
      }

      const postUrl: string = data?.data?.url || '';
      const postId = postUrl.split('/').filter(Boolean).pop() || postUrl;

      return { success: true, platformPostId: postId };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Analytics ───────────────────────────────────────────────────────────

  async getFollowerStats(accountId: string, accessToken: string): Promise<{ followers: number; engagement?: number }> {
    const subreddit = accountId.replace(/^r\//, '');
    const data = await this.apiGet(`/r/${subreddit}/about?raw_json=1`, accessToken);
    return {
      followers: data?.data?.subscribers || 0,
      engagement: data?.data?.active_user_count || 0,
    };
  }

  // ─── Token Validation ────────────────────────────────────────────────────

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const res = await fetch(`${REDDIT_API_BASE}/api/v1/me`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': USER_AGENT },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async apiGet(path: string, accessToken: string): Promise<any> {
    const url = path.startsWith('http') ? path : `${REDDIT_API_BASE}${path}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': USER_AGENT },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || `Reddit API error (${res.status})`);
    }
    return data;
  }
}
