// src/types/brand.ts
export interface BrandProfile {
  userId: string;
  companyName: string;
  companyLogo?: string;
  industry: string;
  companySize: string;
  website?: string;
  description?: string;
  
  // Social accounts
  socialAccounts: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  
  // Campaign stats
  campaigns: {
    active: number;
    completed: number;
    totalBudget: number;
  };
  
  // Analytics
  analytics: {
    totalReach: number;
    engagementRate: number;
    postsThisMonth: number;
    newFollowers: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  brandId: string;
  name: string;
  description: string;
  platforms: string[];
  budget: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  
  // Influencer metrics
  targetInfluencers: number;
  connectedInfluencers: string[];
  totalReach: number;
  totalEngagement: number;
  
  createdAt: Date;
  updatedAt: Date;
}