export interface PlatformLimit {
  id: string;
  name: string;
  maxChars: number;
  maxHashtags?: number;
  icon: string;
}

export const PLATFORM_LIMITS: PlatformLimit[] = [
  { id: 'x', name: 'X (Twitter)', maxChars: 280, icon: 'X' },
  { id: 'tiktok', name: 'TikTok', maxChars: 2200, icon: 'T' },
  { id: 'instagram', name: 'Instagram', maxChars: 2200, maxHashtags: 30, icon: 'IG' },
  { id: 'linkedin', name: 'LinkedIn', maxChars: 3000, icon: 'in' },
  { id: 'youtube', name: 'YouTube Shorts', maxChars: 100, icon: 'YT' },
];

export const platformLimit = (id: string): PlatformLimit | undefined =>
  PLATFORM_LIMITS.find((p) => p.id === id);

export function countHashtags(text: string): number {
  const matches = text.match(/#[\wа-яА-Я]+/g);
  return matches ? matches.length : 0;
}

export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\wа-яА-Я]+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

export function stripHashtags(text: string): string {
  return text
    .replace(/#[\wа-яА-Я]+/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(Math.round(n));
}
