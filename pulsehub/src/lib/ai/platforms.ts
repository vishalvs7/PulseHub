// src/lib/ai/platforms.ts
export const PLATFORM_KEYS = ['instagram', 'linkedin', 'twitter', 'tiktok'] as const;
export type PlatformKey = (typeof PLATFORM_KEYS)[number];

export const PLATFORM_META: Record<PlatformKey, { label: string; limit: number }> = {
  instagram: { label: 'Instagram', limit: 2200 },
  linkedin: { label: 'LinkedIn', limit: 3000 },
  twitter: { label: 'X (Twitter)', limit: 280 },
  tiktok: { label: 'TikTok', limit: 2200 },
};
