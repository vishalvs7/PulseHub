export const APP_NAME = 'PulseHub';
export const APP_DESCRIPTION = 'Unified Social Media Platform';

export const PLATFORMS = ['instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'facebook'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
};

export const INFLUENCER_NICHES = [
  'Lifestyle', 'Fashion', 'Travel', 'Beauty', 'Technology',
  'Fitness', 'Food', 'Photography', 'Music', 'Gaming',
  'Education', 'Business', 'Health', 'Sports', 'Parenting',
] as const;

export const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const;

export const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'completed', 'cancelled'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
