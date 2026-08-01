// src/config/features.ts
// Central feature → tier mapping. Used by pricing page, sidebar badges, and gating.

export type Plan = 'free' | 'pro' | 'business';

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  tier: Plan;
  // When true, the feature is accessible without a paid plan but shows an upsell badge.
  badge?: boolean;
}

export const FEATURES: FeatureDefinition[] = [
  {
    id: 'ai-caption-basic',
    name: 'AI Caption Generator',
    description: 'Generate a single tailored caption from a text prompt.',
    tier: 'free',
  },
  {
    id: 'ai-caption-tuner',
    name: 'Per-Platform AI Caption Tuner',
    description: 'Generate 4 unique captions at once — Instagram, LinkedIn, X, and TikTok.',
    tier: 'pro',
  },
  {
    id: 'transcript-to-clip',
    name: 'Video Transcript-to-Clip Analyzer',
    description: 'Transcribe video audio and surface the 3 most viral moments with timestamps.',
    tier: 'pro',
  },
  {
    id: 'video-resizer',
    name: 'Auto Video Resizer',
    description: 'Automatically crop and format video to each platform aspect ratio.',
    tier: 'free',
  },
  {
    id: 'best-time-to-post',
    name: 'Best Time to Post Heatmaps',
    description: 'Hour-by-hour audience activity heatmaps for each connected account.',
    tier: 'free',
  },
  {
    id: 'comment-to-dm',
    name: 'Comment-to-DM Automation',
    description: 'Build keyword triggers that auto-send DM follow-ups.',
    tier: 'pro',
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics Pipeline',
    description: 'Unified views metric + 6–12h platform polling.',
    tier: 'business',
  },
  {
    id: 'marketplace',
    name: 'Influencer Marketplace',
    description: 'Discover and contact vetted creators by reach tier and niche.',
    tier: 'free',
  },
];

export function isFeatureEnabled(featureId: string, plan: Plan): boolean {
  const feature = FEATURES.find((f) => f.id === featureId);
  if (!feature) return true;
  if (feature.tier === 'free') return true;
  if (feature.badge) return true;
  if (plan === 'business') return true;
  if (plan === 'pro') return feature.tier !== 'business';
  return false;
}
