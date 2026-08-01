import { getSupabase } from '@/lib/supabase/client';
import { InfluencerListing } from '@/types/influencer';

export interface MarketplaceFilters {
  niche?: string;
  search?: string;
  minFollowers?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'followers' | 'engagement' | 'price';
}

export class MarketplaceService {

  static async searchInfluencers(filters: MarketplaceFilters): Promise<InfluencerListing[]> {
    const supabase = getSupabase();

    let query = supabase
      .from('influencer_profiles')
      .select('*')
      .order('trust_score', { ascending: false });

    if (filters.niche && filters.niche !== 'all') {
      query = query.contains('niche', [filters.niche]);
    }

    if (filters.minFollowers) {
      query = query.gte('followers_count', filters.minFollowers * 1000);
    }

    if (filters.search) {
      const s = `%${filters.search}%`;
      query = query.or(`display_name.ilike.${s},bio.ilike.${s},niche.cs.{${filters.search}}`);
    }

    const { data } = await query.limit(50);

    let results = (data || []).map((d: any) => ({
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
      priceRange: {
        min: d.followers_count < 100000 ? 500 : d.followers_count < 500000 ? 2000 : 8000,
        max: d.followers_count < 100000 ? 2000 : d.followers_count < 500000 ? 6000 : 25000,
        currency: 'USD',
      },
      tags: [],
      featured: d.trust_score >= 85,
    }));

    if (filters.sortBy === 'followers') {
      results.sort((a: any, b: any) => b.followersCount - a.followersCount);
    } else if (filters.sortBy === 'engagement') {
      results.sort((a: any, b: any) => b.engagementRate - a.engagementRate);
    } else if (filters.sortBy === 'price') {
      results.sort((a: any, b: any) => (a.priceRange?.min || 0) - (b.priceRange?.min || 0));
    }

    if (filters.maxPrice) {
      results = results.filter((r: any) => (r.priceRange?.min || 0) <= filters.maxPrice!);
    }

    return results;
  }

  static async getInfluencerDetails(userId: string): Promise<InfluencerListing | null> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('influencer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) return null;

    return {
      id: data.user_id,
      userId: data.user_id,
      displayName: data.display_name,
      photoURL: data.photo_url,
      niche: data.niche,
      location: data.location,
      followersCount: data.followers_count,
      engagementRate: data.engagement_rate,
      trustScore: data.trust_score,
      isVerified: data.is_verified,
      tags: [],
      featured: data.trust_score >= 85,
    };
  }

  static async getMarketplaceStats() {
    const supabase = getSupabase();

    const count = await supabase
      .from('influencer_profiles')
      .select('*', { count: 'exact', head: true });

    const avgEngagement = await supabase
      .from('influencer_profiles')
      .select('engagement_rate');

    const verified = await supabase
      .from('influencer_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    const rates = avgEngagement.data || [];
    const avg = rates.length > 0
      ? rates.reduce((s: number, r: any) => s + Number(r.engagement_rate), 0) / rates.length
      : 0;

    return {
      totalInfluencers: count.count || 0,
      avgEngagementRate: avg,
      verifiedCreators: verified.count || 0,
      avgCampaignPrice: 3200,
    };
  }
}
