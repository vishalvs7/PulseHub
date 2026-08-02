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
  type: 'image' | 'video';
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
  profileId?: string;
  [key: string]: unknown;
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

  static async createProfile(name: string): Promise<{ profileId: string }> {
    const data = await zernioFetch<{ profile: { _id: string } }>('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name, description: 'PulseHub workspace' }),
    });
    return { profileId: data.profile._id };
  }

  static async getConnectUrl(platform: CrossPostPlatform, profileId: string): Promise<{ authUrl: string }> {
    return zernioFetch(`/connect/${platform}?profileId=${encodeURIComponent(profileId)}`);
  }

  static async listAccounts(profileId?: string): Promise<ZernioAccount[]> {
    const qs = profileId ? `?profileId=${encodeURIComponent(profileId)}` : '';
    const data = await zernioFetch<{ accounts: ZernioAccount[] }>(`/accounts${qs}`);
    return data.accounts || [];
  }

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

  static async presignUpload(filename: string, contentType: string): Promise<{ uploadUrl: string; publicUrl: string }> {
    return zernioFetch('/media/presign', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    });
  }
}
