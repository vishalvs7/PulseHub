import { getSupabase } from '@/lib/supabase/client';
import { InfluencerProfile, InfluencerListing } from '@/types/influencer';

export interface InfluencerDashboardStats {
  totalFollowers: number;
  engagementRate: number;
  monthlyEarnings: number;
  activeCampaigns: number;
}

export class InfluencerService {

  static async getProfile(userId: string): Promise<InfluencerProfile | null> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('influencer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) return null;

    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('platform')
      .eq('user_id', userId)
      .eq('is_connected', true);

    const connectedAccounts = {
      instagram: accounts?.some((a: any) => a.platform === 'instagram') || false,
      twitter: accounts?.some((a: any) => a.platform === 'twitter') || false,
      linkedin: accounts?.some((a: any) => a.platform === 'linkedin') || false,
      tiktok: accounts?.some((a: any) => a.platform === 'tiktok') || false,
      youtube: accounts?.some((a: any) => a.platform === 'youtube') || false,
    };

    return {
      userId: data.user_id,
      displayName: data.display_name,
      email: data.email,
      photoURL: data.photo_url,
      bio: data.bio,
      niche: data.niche,
      location: data.location,
      website: data.website,
      followers: {},
      engagementRate: data.engagement_rate,
      trustScore: data.trust_score,
      isVerified: data.is_verified,
      connectedAccounts,
      analytics: { totalReach: 0, totalEngagement: 0, averageLikes: 0, averageComments: 0, postsThisMonth: 0 },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  static async upsertProfile(userId: string, profile: Partial<InfluencerProfile>): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase.from('influencer_profiles').upsert({
      user_id: userId,
      display_name: profile.displayName,
      bio: profile.bio,
      niche: profile.niche || [],
      location: profile.location || 'Unknown',
      website: profile.website,
      photo_url: profile.photoURL,
    });

    return !error;
  }

  static async getDashboardStats(userId: string): Promise<InfluencerDashboardStats> {
    const supabase = getSupabase();

    const profile = await supabase
      .from('influencer_profiles')
      .select('followers_count, engagement_rate')
      .eq('user_id', userId)
      .single();

    const campaigns = await supabase
      .from('campaign_influencers')
      .select('earnings, status')
      .eq('influencer_id', userId);

    const totalFollowers = profile.data?.followers_count || 0;
    const engagementRate = profile.data?.engagement_rate || 0;
    const monthlyEarnings = campaigns.data
      ?.filter((c: any) => c.status === 'accepted' || c.status === 'completed')
      .reduce((sum: number, c: any) => sum + Number(c.earnings || 0), 0) || 0;
    const activeCampaigns = campaigns.data?.filter((c: any) => c.status === 'accepted' || c.status === 'negotiating').length || 0;

    return { totalFollowers, engagementRate, monthlyEarnings, activeCampaigns };
  }

  static async getListings(filters?: {
    niche?: string;
    minFollowers?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: 'followers' | 'engagement' | 'price' | 'relevance';
  }): Promise<InfluencerListing[]> {
    const supabase = getSupabase();

    let query = supabase
      .from('influencer_profiles')
      .select('*')
      .order('trust_score', { ascending: false });

    if (filters?.niche && filters.niche !== 'all') {
      query = query.contains('niche', [filters.niche]);
    }

    if (filters?.minFollowers) {
      query = query.gte('followers_count', filters.minFollowers);
    }

    if (filters?.search) {
      const s = `%${filters.search}%`;
      query = query.or(`display_name.ilike.${s},bio.ilike.${s}`);
    }

    const { data } = await query.limit(50);

    return (data || []).map((d: any) => ({
      id: d.user_id,
      userId: d.user_id,
      displayName: d.display_name,
      photoURL: d.photo_url,
      niche: d.niche,
      location: d.location,
      followersCount: d.followers_count,
      engagementRate: d.engagement_rate,
      trustScore: d.trust_score,
      isVerified: d.is_verified,
      tags: [],
      featured: d.trust_score >= 85,
    }));
  }

  static async getCollaborations(userId: string) {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('campaign_influencers')
      .select('*, campaigns(*)')
      .eq('influencer_id', userId);

    return (data || []).map((ci: any) => ({
      id: ci.campaign_id,
      brand: (ci.campaigns as any)?.name || 'Unknown',
      campaign: (ci.campaigns as any)?.description || '',
      status: ci.status,
      earnings: Number(ci.earnings || 0),
      deadline: (ci.campaigns as any)?.end_date || '',
      progress: ci.status === 'completed' ? 100 : ci.status === 'accepted' ? 75 : 30,
    }));
  }

  static async getPlatformPerformance(userId: string) {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false });

    const latestByPlatform = new Map<string, any>();
    for (const row of data || []) {
      if (!latestByPlatform.has(row.platform)) {
        latestByPlatform.set(row.platform, row);
      }
    }

    return Array.from(latestByPlatform.entries()).map(([platform, d]: [string, any]) => ({
      platform,
      followers: d.followers,
      engagement: d.engagement_rate,
      growth: '+0%',
      posts: d.posts_count,
    }));
  }
}
