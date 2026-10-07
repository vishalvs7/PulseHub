import type { PlatformAdapter } from '../../contracts/types';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';
import { MetaAdapter } from './meta.adapter';
import { LinkedInAdapter } from './linkedin.adapter';
import { RedditAdapter } from './reddit.adapter';
import { YouTubeAdapter } from './youtube.adapter';
import { PinterestAdapter } from './pinterest.adapter';

const adapters: Partial<Record<CrossPostPlatform, PlatformAdapter>> = {};

export function getAdapter(platform: CrossPostPlatform): PlatformAdapter | null {
  if (adapters[platform]) return adapters[platform]!;

  let adapter: PlatformAdapter | null = null;

  switch (platform) {
    case 'instagram':
    case 'facebook':
    case 'threads':
      const meta = new MetaAdapter();
      if (meta.isConfigured()) adapter = meta;
      break;
    case 'linkedin':
      const linkedin = new LinkedInAdapter();
      if (linkedin.isConfigured()) adapter = linkedin;
      break;
    case 'reddit':
      const reddit = new RedditAdapter();
      if (reddit.isConfigured()) adapter = reddit;
      break;
    case 'youtube':
      const youtube = new YouTubeAdapter();
      if (youtube.isConfigured()) adapter = youtube;
      break;
    case 'pinterest':
      const pinterest = new PinterestAdapter();
      if (pinterest.isConfigured()) adapter = pinterest;
      break;
    default:
      adapter = null;
  }

  if (adapter) {
    adapters[platform] = adapter;
  }

  return adapter;
}

export function getMetaAdapter(): MetaAdapter {
  return getAdapter('instagram') as MetaAdapter;
}

export function isPlatformSupported(platform: CrossPostPlatform): boolean {
  return getAdapter(platform) !== null;
}

export function getSupportedPlatforms(): CrossPostPlatform[] {
  const supported: CrossPostPlatform[] = [];
  const platforms: CrossPostPlatform[] = ['instagram', 'facebook', 'threads', 'linkedin', 'reddit', 'youtube', 'pinterest'];
  for (const p of platforms) {
    if (isPlatformSupported(p)) supported.push(p);
  }
  return supported;
}
