export const CROSSPOST_PLATFORMS = [
  'instagram',
  'twitter',
  'linkedin',
  'tiktok',
  'youtube',
  'facebook',
  'threads',
  'pinterest',
  'reddit',
] as const;

export type CrossPostPlatform = (typeof CROSSPOST_PLATFORMS)[number];

export interface PlatformConfig {
  id: CrossPostPlatform;
  name: string;
  maxChars: number;
  media: 'image' | 'video' | 'both' | 'none';
  color: string;
  icon: string;
}

export const PLATFORM_CONFIGS: Record<CrossPostPlatform, PlatformConfig> = {
  instagram: { id: 'instagram', name: 'Instagram', maxChars: 2200, media: 'both', color: 'from-accent-500 to-rose-600', icon: 'IG' },
  twitter:   { id: 'twitter', name: 'X (Twitter)', maxChars: 280, media: 'both', color: 'from-blue-400 to-blue-600', icon: 'X' },
  linkedin:  { id: 'linkedin', name: 'LinkedIn', maxChars: 3000, media: 'both', color: 'from-blue-600 to-blue-800', icon: 'in' },
  tiktok:    { id: 'tiktok', name: 'TikTok', maxChars: 2200, media: 'video', color: 'from-gray-800 to-gray-900', icon: 'TT' },
  youtube:   { id: 'youtube', name: 'YouTube', maxChars: 100, media: 'video', color: 'from-red-500 to-red-700', icon: 'YT' },
  facebook:  { id: 'facebook', name: 'Facebook', maxChars: 63206, media: 'both', color: 'from-blue-500 to-blue-700', icon: 'f' },
  threads:   { id: 'threads', name: 'Threads', maxChars: 500, media: 'both', color: 'from-gray-700 to-gray-900', icon: 'th' },
  pinterest: { id: 'pinterest', name: 'Pinterest', maxChars: 500, media: 'image', color: 'from-red-600 to-red-800', icon: 'P' },
  reddit:    { id: 'reddit', name: 'Reddit', maxChars: 40000, media: 'both', color: 'from-orange-500 to-orange-700', icon: 'R' },
};

export const PLATFORM_LIST: PlatformConfig[] = CROSSPOST_PLATFORMS.map((id) => PLATFORM_CONFIGS[id]);
