// src/types/user.ts
export type UserRole = 'influencer' | 'brand' | 'admin';

export interface BaseUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
}

export interface InfluencerUser extends BaseUser {
  role: 'influencer';
  profileId: string;
  isVerified: boolean;
  trustScore: number;
  niche?: string[];
  location?: string;
  followersCount?: number;
  engagementRate?: number;
}

export interface BrandUser extends BaseUser {
  role: 'brand';
  companyName: string;
  companyLogo?: string;
  industry?: string;
  companySize?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  website?: string;
}

export type AppUser = InfluencerUser | BrandUser;