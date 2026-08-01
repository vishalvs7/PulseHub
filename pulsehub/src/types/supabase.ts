import type { ReachTier } from './influencer';
import type { UserRole } from './user';

export type Tables = {
  users: {
    id: string;
    email: string;
    display_name: string;
    photo_url: string | null;
    role: UserRole;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
  };
  brand_profiles: {
    user_id: string;
    company_name: string;
    email: string;
    industry: string;
    company_size: string;
    website?: string;
    description?: string;
    created_at: string;
    updated_at: string;
  };
  influencer_profiles: {
    user_id: string;
    display_name: string;
    email: string;
    bio: string | null;
    photo_url?: string;
    niche: string[];
    location: string;
    website?: string;
    followers_count: number;
    engagement_rate: number;
    trust_score: number;
    is_verified: boolean;
    base_rate_min?: number | null;
    base_rate_max?: number | null;
    base_rate_currency: string;
    reach_tier: ReachTier;
    created_at: string;
    updated_at: string;
  };
  posts: {
    id: string;
    user_id: string;
    platform: string;
    platform_post_id?: string | null;
    content: string;
    media_urls: string[];
    scheduled_for?: string | null;
    published_at?: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  };
  post_targets: {
    id: string;
    post_id: string;
    platform: string;
    content: string;
    media_urls: string[];
    status: string;
    platform_post_id?: string | null;
    scheduled_for?: string | null;
    published_at?: string | null;
    error?: string | null;
    created_at: string;
    updated_at: string;
  };
  social_accounts: {
    id: string;
    user_id: string;
    platform: string;
    username: string;
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
    is_connected: boolean;
    last_synced: string;
    created_at: string;
  };
  campaigns: {
    id: string;
    brand_id: string;
    name: string;
    description: string;
    platforms: string[];
    budget: number;
    status: string;
    start_date: string;
    end_date: string;
    target_influencers: number;
    created_at: string;
    updated_at: string;
  };
  messages: {
    id: string;
    conversation_id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    read: boolean;
    created_at: string;
  };
};
