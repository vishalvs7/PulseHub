// src/types/social.ts
export interface SocialAccount {
  platform: 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube' | 'facebook';
  username: string;
  profileId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  isConnected: boolean;
  lastSynced: Date;
}

export interface Post {
  id: string;
  userId: string;
  platform: string;
  platformPostId: string;
  content: string;
  mediaUrls: string[];
  scheduledFor?: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  
  // Analytics
  analytics?: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
    impressions: number;
    engagementRate: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  platform: string;
  content: string;
  mediaUrl?: string;
  read: boolean;
  timestamp: Date;
}