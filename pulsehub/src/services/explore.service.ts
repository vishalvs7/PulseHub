import { getSupabase } from '@/lib/supabase/client';
import { ReachTier, reachTierFromFollowers } from '@/types/influencer';

export interface PlatformStats {
  platform: string;
  username?: string;
  followers?: number;
  views?: number;
  engagementRate?: number;
}

export interface ExploreInfluencer {
  id: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  niche: string[];
  location: string;
  followersCount: number;
  engagementRate: number;
  trustScore: number;
  isVerified: boolean;
  reachTier: ReachTier;
  priceRange: { min: number; max: number; currency: string };
  platforms: PlatformStats[];
  totalViews: number;
  featured: boolean;
}

export interface ExploreFilters {
  search?: string;
  niche?: string;
  reachTier?: ReachTier | 'all';
  minFollowers?: number;
  minViews?: number;
  maxPrice?: number;
  sortBy?: 'followers' | 'views' | 'engagement' | 'price';
}

export class ExploreService {

  static async searchInfluencers(filters: ExploreFilters): Promise<ExploreInfluencer[]> {
    const supabase = getSupabase();

    let query = supabase
      .from('influencer_profiles')
      .select('*')
      .order('trust_score', { ascending: false });

    if (filters.niche && filters.niche !== 'all') {
      query = query.contains('niche', [filters.niche]);
    }
    if (filters.reachTier && filters.reachTier !== 'all') {
      query = query.eq('reach_tier', filters.reachTier);
    }
    if (filters.minFollowers) {
      query = query.gte('followers_count', filters.minFollowers);
    }
    if (filters.search) {
      const s = `%${filters.search}%`;
      query = query.or(`display_name.ilike.${s},bio.ilike.${s}`);
    }

    const { data } = await query.limit(50);
    const profiles = data || [];

    if (profiles.length === 0) return [];

    // Fetch connected accounts for these users.
    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('user_id, platform, username, is_connected')
      .in('user_id', profiles.map((p: any) => p.user_id))
      .eq('is_connected', true);

    // Fetch latest analytics snapshot per platform per user.
    const { data: snapshots } = await supabase
      .from('analytics_snapshots')
      .select('user_id, platform, followers, total_reach, total_impressions, engagement_rate, snapshot_date')
      .in('user_id', profiles.map((p: any) => p.user_id));

    const accountsByUser = new Map<string, PlatformStats[]>();
    for (const a of accounts || []) {
      const list = accountsByUser.get(a.user_id) || [];
      if (!list.some((x) => x.platform === a.platform)) {
        list.push({ platform: a.platform, username: a.username });
      }
      accountsByUser.set(a.user_id, list);
    }

    const snapshotByUserPlatform = new Map<string, PlatformStats & { snapshot_date: string }>();
    for (const s of snapshots || []) {
      const key = `${s.user_id}:${s.platform}`;
      const existing = snapshotByUserPlatform.get(key);
      if (!existing || s.snapshot_date > existing.snapshot_date) {
        snapshotByUserPlatform.set(key, {
          platform: s.platform,
          followers: s.followers,
          views: s.total_impressions || s.total_reach,
          engagementRate: s.engagement_rate,
          snapshot_date: s.snapshot_date,
        });
      }
    }

    const results: ExploreInfluencer[] = profiles.map((d: any) => {
      const platforms = (accountsByUser.get(d.user_id) || []).map((p) => {
        const snap = snapshotByUserPlatform.get(`${d.user_id}:${p.platform}`);
        return snap ? { ...p, ...snap } : p;
      });

      // Fallback: if no snapshots, derive a platform split from total followers.
      if (platforms.every((p) => !p.followers)) {
        platforms.forEach((p, i) => {
          const parts = platforms.length;
          p.followers = Math.round((d.followers_count / parts) * (parts - i) * 0.5) + Math.round(d.followers_count / parts);
        });
      }

      const totalViews = platforms.reduce((s, p) => s + (p.views || 0), 0);
      const min = Number(d.base_rate_min ?? 0);
      const max = Number(d.base_rate_max ?? 0);
      const minFromFollowers = d.followers_count < 100000 ? 500 : d.followers_count < 500000 ? 2000 : 8000;
      const maxFromFollowers = d.followers_count < 100000 ? 2000 : d.followers_count < 500000 ? 6000 : 25000;

      return {
        id: d.user_id,
        displayName: d.display_name,
        photoURL: d.photo_url,
        bio: d.bio,
        niche: d.niche || [],
        location: d.location || 'Unknown',
        followersCount: d.followers_count,
        engagementRate: d.engagement_rate,
        trustScore: d.trust_score,
        isVerified: d.is_verified,
        reachTier: (d.reach_tier as ReachTier) || reachTierFromFollowers(d.followers_count),
        priceRange: {
          min: min || minFromFollowers,
          max: max || maxFromFollowers,
          currency: d.base_rate_currency || 'USD',
        },
        platforms,
        totalViews,
        featured: d.trust_score >= 85,
      };
    });

    if (filters.minViews) {
      const filtered = results.filter((r) => r.totalViews >= filters.minViews!);
      results.splice(0, results.length, ...filtered);
    }
    if (filters.maxPrice) {
      const filtered = results.filter((r) => r.priceRange.min <= filters.maxPrice!);
      results.splice(0, results.length, ...filtered);
    }

    if (filters.sortBy === 'followers') {
      results.sort((a, b) => b.followersCount - a.followersCount);
    } else if (filters.sortBy === 'views') {
      results.sort((a, b) => b.totalViews - a.totalViews);
    } else if (filters.sortBy === 'engagement') {
      results.sort((a, b) => b.engagementRate - a.engagementRate);
    } else if (filters.sortBy === 'price') {
      results.sort((a, b) => a.priceRange.min - b.priceRange.min);
    }

    return results;
  }
}
