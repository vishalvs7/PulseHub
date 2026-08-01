import { getSupabase } from '@/lib/supabase/client';
import { BrandProfile, Campaign } from '@/types/brand';

export interface BrandDashboardStats {
  totalReach: number;
  engagementRate: number;
  newMessages: number;
  activeCampaigns: number;
}

export class BrandService {

  static async getProfile(userId: string): Promise<BrandProfile | null> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) return null;

    return {
      userId: data.user_id,
      companyName: data.company_name,
      companyLogo: data.logo_url,
      industry: data.industry,
      companySize: data.company_size,
      website: data.website,
      description: data.description,
      socialAccounts: { instagram: '', twitter: '', linkedin: '', facebook: '' },
      campaigns: { active: 0, completed: 0, totalBudget: 0 },
      analytics: { totalReach: 0, engagementRate: 0, postsThisMonth: 0, newFollowers: 0 },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  static async upsertProfile(
    userId: string,
    profile: Partial<BrandProfile>
  ): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase.from('brand_profiles').upsert({
      user_id: userId,
      company_name: profile.companyName,
      industry: profile.industry || 'General',
      company_size: profile.companySize || '1-10',
      website: profile.website,
      description: profile.description,
      logo_url: profile.companyLogo,
    });

    return !error;
  }

  static async getDashboardStats(userId: string): Promise<BrandDashboardStats> {
    const supabase = getSupabase();

    const campaigns = await supabase
      .from('campaigns')
      .select('status, budget, total_reach, total_engagement')
      .eq('brand_id', userId);

    const msgCount = await supabase
      .from('conversation_participants')
      .select('conversation_id', { count: 'exact', head: true })
      .eq('user_id', userId);

    const lastSnapshot = await supabase
      .from('analytics_snapshots')
      .select('total_reach, engagement_rate')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    const activeCampaigns = campaigns.data?.filter((c: any) => c.status === 'active').length || 0;
    const totalReach = campaigns.data?.reduce((s: number, c: any) => s + Number(c.total_reach || 0), 0) || 0;

    return {
      totalReach,
      engagementRate: lastSnapshot.data?.engagement_rate || 0,
      newMessages: msgCount.count || 0,
      activeCampaigns,
    };
  }

  static async getCampaigns(brandId: string): Promise<Campaign[]> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    return (data || []).map((c: any) => ({
      id: c.id,
      brandId: c.brand_id,
      name: c.name,
      description: c.description,
      platforms: c.platforms,
      budget: Number(c.budget),
      status: c.status,
      startDate: new Date(c.start_date),
      endDate: new Date(c.end_date),
      targetInfluencers: c.target_influencers,
      connectedInfluencers: c.connected_influencers || [],
      totalReach: c.total_reach,
      totalEngagement: c.total_engagement,
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at),
    }));
  }

  static async createCampaign(campaign: Partial<Campaign>): Promise<Campaign | null> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        brand_id: campaign.brandId,
        name: campaign.name,
        description: campaign.description || '',
        platforms: campaign.platforms || [],
        budget: campaign.budget || 0,
        status: campaign.status || 'draft',
        start_date: campaign.startDate?.toISOString(),
        end_date: campaign.endDate?.toISOString(),
        target_influencers: campaign.targetInfluencers || 0,
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      brandId: data.brand_id,
      name: data.name,
      description: data.description,
      platforms: data.platforms,
      budget: Number(data.budget),
      status: data.status,
      startDate: data.start_date ? new Date(data.start_date) : new Date(),
      endDate: data.end_date ? new Date(data.end_date) : new Date(),
      targetInfluencers: data.target_influencers,
      connectedInfluencers: [],
      totalReach: 0,
      totalEngagement: 0,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  static async updateCampaign(id: string, updates: Partial<Campaign>): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('campaigns')
      .update({
        name: updates.name,
        description: updates.description,
        platforms: updates.platforms,
        budget: updates.budget,
        status: updates.status,
        start_date: updates.startDate?.toISOString(),
        end_date: updates.endDate?.toISOString(),
        target_influencers: updates.targetInfluencers,
      })
      .eq('id', id);

    return !error;
  }

  static async deleteCampaign(id: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    return !error;
  }

  static async getPlatformPerformance(userId: string) {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(10);

    const latestByPlatform = new Map<string, any>();
    for (const row of data || []) {
      if (!latestByPlatform.has(row.platform)) {
        latestByPlatform.set(row.platform, row);
      }
    }

    return Array.from(latestByPlatform.entries()).map(([platform, d]: [string, any]) => ({
      platform,
      reach: d.total_reach,
      engagement: d.engagement_rate,
      posts: d.posts_count,
      followers: d.followers,
      growth: '+0%',
    }));
  }
}
