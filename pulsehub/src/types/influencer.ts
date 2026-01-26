// src/types/influencer.ts
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
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  tags: string[];
  featured: boolean;
}