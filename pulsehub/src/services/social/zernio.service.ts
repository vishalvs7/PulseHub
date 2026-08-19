import type { CrossPostPlatform } from '@/lib/socialPlatforms';

const ZERNIO_BASE = process.env.ZERNIO_API_URL || 'https://zernio.com/api/v1';
const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY || '';

export interface ZernioPlatformTarget {
  platform: CrossPostPlatform;
  accountId: string;
  customContent?: string;
  platformSpecificData?: Record<string, unknown>;
}

export interface ZernioMediaItem {
  type: 'image' | 'video' | 'gif' | 'document';
  url: string;
}

export interface ZernioCreatePostInput {
  content: string;
  platforms: ZernioPlatformTarget[];
  mediaItems?: ZernioMediaItem[];
  scheduledFor?: string;
  timezone?: string;
  publishNow?: boolean;
}

export interface ZernioAccount {
  _id: string;
  platform: string;
  username?: string;
  displayName?: string;
  profileId?: string;
  [key: string]: unknown;
}

export interface ZernioPost {
  _id: string;
  content: string;
  status: string;
  scheduledFor?: string;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  title?: string;
  mediaItems?: { type: string; url: string }[];
  platforms?: { platform: string; accountId: string; status?: string }[];
  [key: string]: unknown;
}

export interface SelectionOption {
  id: string;
  name: string;
  username?: string;
  description?: string;
  urn?: string;
  logoUrl?: string;
  vanityName?: string;
  boardName?: string;
  instagramUsername?: string;
}

class ZernioError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function zernioFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!ZERNIO_API_KEY) {
    throw new ZernioError('ZERNIO_API_KEY is not configured', 500);
  }

  const res = await fetch(`${ZERNIO_BASE}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${ZERNIO_API_KEY}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    const errData = data as Record<string, unknown>;
    const errMsg =
      (errData.error as Record<string, unknown> | undefined)?.message ||
      errData.message ||
      errData.error ||
      `Zernio API error (${res.status})`;
    throw new ZernioError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg), res.status);
  }

  return data as T;
}

export class ZernioService {

  static isConfigured(): boolean {
    return !!ZERNIO_API_KEY;
  }

  static getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
  }

  static async createProfile(name: string): Promise<{ profileId: string }> {
    const data = await zernioFetch<{ profile: { _id: string } }>('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name, description: 'PulseHub workspace' }),
    });
    return { profileId: data.profile._id };
  }

  static async getConnectUrl(
    platform: CrossPostPlatform,
    profileId: string,
    opts?: { headless?: boolean; redirectUrl?: string }
  ): Promise<{ authUrl: string; state?: string }> {
    const qs = new URLSearchParams({ profileId });
    if (opts?.headless) qs.set('headless', 'true');
    if (opts?.redirectUrl) qs.set('redirect_url', opts.redirectUrl);
    return zernioFetch(`/connect/${platform}?${qs.toString()}`);
  }

  static async listAccounts(profileId?: string): Promise<ZernioAccount[]> {
    const qs = profileId ? `?profileId=${encodeURIComponent(profileId)}` : '';
    const data = await zernioFetch<{ accounts: ZernioAccount[] }>(`/accounts${qs}`);
    return data.accounts || [];
  }

  // ---- Headless selection flow (keeps Zernio invisible to end users) ----

  static async getPendingOAuthData(pendingDataToken: string): Promise<Record<string, unknown>> {
    return zernioFetch(`/connect/pending-data?token=${encodeURIComponent(pendingDataToken)}`);
  }

  static async listSelectionOptions(platform: string, opts: {
    profileId?: string;
    tempToken?: string;
    pendingDataToken?: string;
    connectToken?: string;
  }): Promise<{ platform: string; options: SelectionOption[]; profileId?: string; tempToken?: string; selectionType?: string; userProfile?: Record<string, unknown> }> {
    const connectHeader: Record<string, string> = opts.connectToken ? { 'X-Connect-Token': opts.connectToken } : {};

    // LinkedIn, Pinterest, Snapchat, GMB carry a pending-data token instead of URL params.
    if (opts.pendingDataToken) {
      const data = await this.getPendingOAuthData(opts.pendingDataToken);
      const raw = (data.organizations || data.pages || data.boards || data.locations || data.profiles || []) as Record<string, unknown>[];
      const options: SelectionOption[] = raw.map((o: any) => ({
        id: String(o.id || o._id || ''),
        name: o.name || o.username || o.displayName || '',
        username: o.username || o.vanityName || '',
        urn: o.urn,
        logoUrl: o.logoUrl || o.profilePicture || o.coverUrl,
        vanityName: o.vanityName,
      }));
      return {
        platform: String(data.platform || platform),
        options,
        profileId: (data.profileId as string) || opts.profileId,
        tempToken: (data.tempToken as string) || opts.tempToken,
        selectionType: data.selectionType as string,
        userProfile: data.userProfile as Record<string, unknown>,
      };
    }

    // Facebook + Instagram (via Facebook Login) list pages directly with tempToken.
    if (platform === 'facebook' || platform === 'instagram') {
      const path = platform === 'facebook'
        ? `/connect/facebook/select-page?profileId=${encodeURIComponent(opts.profileId || '')}&tempToken=${encodeURIComponent(opts.tempToken || '')}`
        : `/connect/instagram/select-account?profileId=${encodeURIComponent(opts.profileId || '')}&tempToken=${encodeURIComponent(opts.tempToken || '')}`;
      const data = await zernioFetch<{ pages: any[] }>(path, { headers: connectHeader });
      const options: SelectionOption[] = (data.pages || []).map((p: any) => ({
        id: String(p.id || ''),
        name: p.name || '',
        username: p.username || '',
        instagramUsername: platform === 'instagram' ? p.instagram_business_account?.username : undefined,
      }));
      return {
        platform,
        options,
        profileId: opts.profileId,
        tempToken: opts.tempToken,
        selectionType: 'pages',
      };
    }

    return { platform, options: [] };
  }

  static async completeSelection(platform: string, input: {
    profileId: string;
    tempToken: string;
    userProfile?: Record<string, unknown>;
    connectToken?: string;
    selection: Record<string, unknown>;
    accountType?: string;
  }): Promise<Record<string, unknown>> {
    const connectHeader: Record<string, string> = input.connectToken ? { 'X-Connect-Token': input.connectToken } : {};
    const redirect_url = `${this.getBaseUrl()}/api/social/zernio/callback`;

    let path = '';
    let payload: Record<string, unknown>;

    switch (platform) {
      case 'facebook':
        path = '/connect/facebook/select-page';
        payload = {
          profileId: input.profileId,
          pageId: input.selection.pageId,
          tempToken: input.tempToken,
          userProfile: input.userProfile,
          redirect_url,
        };
        break;
      case 'instagram':
        path = '/connect/instagram/select-account';
        payload = {
          profileId: input.profileId,
          pageId: input.selection.pageId,
          tempToken: input.tempToken,
          redirect_url,
        };
        break;
      case 'linkedin':
        path = '/connect/linkedin/select-organization';
        payload = {
          profileId: input.profileId,
          tempToken: input.tempToken,
          userProfile: input.userProfile,
          accountType: input.accountType || 'organization',
          ...(input.accountType === 'organization' ? { selectedOrganization: input.selection } : {}),
          redirect_url,
        };
        break;
      case 'pinterest':
        path = '/connect/pinterest/select-board';
        payload = {
          profileId: input.profileId,
          boardId: input.selection.boardId,
          boardName: input.selection.boardName,
          tempToken: input.tempToken,
          userProfile: input.userProfile,
          redirect_url,
        };
        break;
      default:
        throw new ZernioError(`Unsupported selection platform: ${platform}`, 400);
    }

    return zernioFetch(path, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: connectHeader,
    });
  }

  // ---- Posts ----

  static async createPost(input: ZernioCreatePostInput): Promise<{ postId: string }> {
    const data = await zernioFetch<{ post: { _id: string } }>('/posts', {
      method: 'POST',
      body: JSON.stringify({
        content: input.content,
        platforms: input.platforms,
        mediaItems: input.mediaItems,
        scheduledFor: input.scheduledFor,
        timezone: input.timezone,
        publishNow: input.publishNow,
      }),
    });
    return { postId: data.post._id };
  }

  static async getPost(postId: string): Promise<Record<string, unknown>> {
    return zernioFetch(`/posts/${encodeURIComponent(postId)}`);
  }

  static async listPosts(profileId?: string, status?: string, limit = 100): Promise<ZernioPost[]> {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (profileId) qs.set('profileId', profileId);
    if (status) qs.set('status', status);
    const data = await zernioFetch<{ posts: ZernioPost[] }>(`/posts?${qs.toString()}`);
    return data.posts || [];
  }

  static async cancelPost(postId: string): Promise<void> {
    await zernioFetch(`/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' });
  }

  // ---- Comments inbox ----

  static async listCommentPosts(opts: {
    profileId?: string;
    platform?: string;
    limit?: number;
  }): Promise<Record<string, unknown>> {
    const qs = new URLSearchParams({ limit: String(opts.limit || 50) });
    if (opts.profileId) qs.set('profileId', opts.profileId);
    if (opts.platform) qs.set('platform', opts.platform);
    return zernioFetch(`/inbox/comments?${qs.toString()}`);
  }

  static async getPostComments(postId: string, accountId: string): Promise<Record<string, unknown>> {
    const qs = new URLSearchParams({ accountId });
    return zernioFetch(`/inbox/comments/${encodeURIComponent(postId)}?${qs.toString()}`);
  }

  static async replyToComment(
    postId: string,
    input: { accountId: string; message: string; commentId?: string }
  ): Promise<Record<string, unknown>> {
    return zernioFetch(`/inbox/comments/${encodeURIComponent(postId)}`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // ---- Analytics ----

  static async getAnalytics(opts: {
    profileId?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
  }): Promise<Record<string, unknown>> {
    const qs = new URLSearchParams({ limit: String(opts.limit || 50) });
    if (opts.profileId) qs.set('profileId', opts.profileId);
    if (opts.fromDate) qs.set('fromDate', opts.fromDate);
    if (opts.toDate) qs.set('toDate', opts.toDate);
    if (opts.page) qs.set('page', String(opts.page));
    if (opts.sortBy) qs.set('sortBy', opts.sortBy);
    return zernioFetch(`/analytics?${qs.toString()}`);
  }

  static async getFollowerStats(opts: {
    profileId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ accounts: Record<string, unknown>[]; stats: Record<string, unknown[]> }> {
    const qs = new URLSearchParams();
    if (opts.profileId) qs.set('profileId', opts.profileId);
    if (opts.fromDate) qs.set('fromDate', opts.fromDate);
    if (opts.toDate) qs.set('toDate', opts.toDate);
    return zernioFetch(`/accounts/follower-stats?${qs.toString()}`);
  }

  static async presignUpload(filename: string, contentType: string): Promise<{ uploadUrl: string; publicUrl: string }> {
    return zernioFetch('/media/presign', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    });
  }
}