import type {
  PlatformAdapter,
  PublishPayload,
  PublishResult,
  TokenBundle,
  SelectionOption,
} from '../../contracts/types';

const PINTEREST_OAUTH_BASE = 'https://www.pinterest.com/oauth/';
const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';
const SCOPES = 'boards:read,boards:write,pins:read,pins:write,user_accounts:read';

export class PinterestAdapter implements PlatformAdapter {
  platform = 'pinterest' as const;

  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.PINTEREST_APP_ID || '';
    this.clientSecret = process.env.PINTEREST_APP_SECRET || '';
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
      state,
    });

    return `${PINTEREST_OAUTH_BASE}?${params.toString()}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<TokenBundle> {
    const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const res = await fetch(PINTEREST_OAUTH_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    const data = await res.json();
    if (!res.ok || data.code) {
      throw new Error(data.message || `Pinterest token error (${res.status})`);
    }

    // Pinterest access tokens are long-lived (no expiry, no refresh)
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  }

  async getProfile(accessToken: string): Promise<{ accountId: string; username: string }> {
    const data = await this.apiGet('/user_account', accessToken);
    return { accountId: data.id || '', username: data.username || '' };
  }

  async listConnectOptions(accessToken: string): Promise<SelectionOption[]> {
    const data = await this.apiGet('/boards?page_size=50', accessToken);
    const boards = data.items || [];

    return boards
      .filter((board: any) => board.id)
      .map((board: any) => ({
        id: board.id,
        name: board.name || 'Untitled board',
        description: board.privacy === 'PRIVATE' ? 'Private board' : '',
      }));
  }

  // ─── Publishing ──────────────────────────────────────────────────────────

  async publish(accountId: string, accessToken: string, payload: PublishPayload): Promise<PublishResult> {
    const media = payload.mediaItems?.[0];
    if (!media) {
      return { success: false, error: 'Pinterest requires an image' };
    }
    if (media.type === 'video' || media.type === 'document') {
      return { success: false, error: 'Pinterest supports image pins only' };
    }

    const content = (payload.content || '').trim();
    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    const title = (lines[0] || '').slice(0, 100);
    const description = (lines.length > 1 ? lines.slice(1).join('\n') : content).slice(0, 500);

    const body: Record<string, unknown> = {
      board: accountId,
      description,
      media_source: {
        source_type: 'image_url',
        url: media.url,
      },
    };
    if (title) body.title = title;
    if (payload.mediaItems![0] && media.type === 'image') {
      body.link = media.url;
    }

    try {
      const res = await fetch(`${PINTEREST_API_BASE}/pins`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || data.code) {
        return { success: false, error: data.message || `Pinterest error (${res.status})` };
      }

      return { success: true, platformPostId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Recent Posts ────────────────────────────────────────────────────────

  async getRecentPosts(
    accountId: string,
    accessToken: string,
    limit = 25
  ): Promise<Array<{ id: string; text: string; timestamp: string; mediaType: string }>> {
    const data = await this.apiGet(
      `/boards/${encodeURIComponent(accountId)}/pins?page_size=${Math.min(limit, 100)}`,
      accessToken
    );
    return (data.items || []).map((pin: any) => ({
      id: pin.id || '',
      text: pin.title || pin.description || '',
      timestamp: pin.created_at || '',
      mediaType: pin.media?.media_type || 'IMAGE',
    }));
  }

  // ─── Token Validation ────────────────────────────────────────────────────

  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const res = await fetch(`${PINTEREST_API_BASE}/user_account`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async apiGet(path: string, accessToken: string): Promise<any> {
    const res = await fetch(`${PINTEREST_API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!res.ok || data.code) {
      throw new Error(data.message || `Pinterest API error (${res.status})`);
    }
    return data;
  }
}
