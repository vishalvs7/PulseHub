// src/types/influencer.ts
export type ReachTier = 'nano' | 'micro' | 'mid' | 'macro';

export const REACH_TIER_LABELS: Record<ReachTier, string> = {
  nano: 'Nano',
  micro: 'Micro',
  mid: 'Mid',
  macro: 'Macro',
};

export const REACH_TIER_ORDER: ReachTier[] = ['nano', 'micro', 'mid', 'macro'];

export function reachTierFromFollowers(followers: number): ReachTier {
  if (followers < 10_000) return 'nano';
  if (followers < 100_000) return 'micro';
  if (followers < 500_000) return 'mid';
  return 'macro';
}

export interface InfluencerProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  niche: string[];
  location: string;
  website?: string;
  
  // Social stats
  followers: {
    instagram?: number;
    twitter?: number;
    linkedin?: number;
    tiktok?: number;
    youtube?: number;
  };
  
  engagementRate: number;
  trustScore: number;
  isVerified: boolean;
  
  // Platform connections
  connectedAccounts: {
    instagram?: boolean;
    twitter?: boolean;
    linkedin?: boolean;
    tiktok?: boolean;
    youtube?: boolean;
  };
  
  // Analytics
  analytics: {
    totalReach: number;
    totalEngagement: number;
    averageLikes: number;
    averageComments: number;
    postsThisMonth: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface InfluencerListing {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  niche: string[];
  location: string;
  followersCount: number;
  engagementRate: number;
  trustScore: number;
  isVerified: boolean;
  reachTier?: ReachTier;
  baseRateMin?: number;
  baseRateMax?: number;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  tags: string[];
  featured: boolean;
}