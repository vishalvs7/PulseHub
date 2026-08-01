import { getSupabase } from '@/lib/supabase/client';

export interface PlatformAnalytics {
  platform: string;
  followers: number;
  following: number;
  postsCount: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalReach: number;
  totalImpressions: number;
  engagementRate: number;
  snapshotDate: string;
}

export interface AnalyticsTrend {
  date: string;
  followers: number;
  reach: number;
  engagement: number;
}

export class AnalyticsService {

  static async getLatest(userId: string): Promise<PlatformAnalytics[]> {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false });

    const latest = new Map<string, PlatformAnalytics>();
    for (const row of data || []) {
      if (!latest.has(row.platform)) {
        latest.set(row.platform, {
          platform: row.platform,
          followers: row.followers,
          following: row.following,
          postsCount: row.posts_count,
          totalLikes: row.total_likes,
          totalComments: row.total_comments,
          totalShares: row.total_shares,
          totalReach: row.total_reach,
          totalImpressions: row.total_impressions,
          engagementRate: row.engagement_rate,
          snapshotDate: row.snapshot_date,
        });
      }
    }

    return Array.from(latest.values());
  }

  static async getTrend(userId: string, platform: string, days = 30): Promise<AnalyticsTrend[]> {
    const supabase = getSupabase();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const { data } = await supabase
      .from('analytics_snapshots')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .gte('snapshot_date', start.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    return (data || []).map((d: any) => ({
      date: d.snapshot_date,
      followers: d.followers,
      reach: d.total_reach,
      engagement: d.engagement_rate,
    }));
  }

  static async getAggregatedStats(userId: string) {
    const platforms = await this.getLatest(userId);

    return {
      totalFollowers: platforms.reduce((s: number, p: any) => s + p.followers, 0),
      totalReach: platforms.reduce((s: number, p: any) => s + p.totalReach, 0),
      totalEngagement: platforms.reduce((s: number, p: any) => s + p.totalLikes + p.totalComments + p.totalShares, 0),
      postsThisMonth: platforms.reduce((s: number, p: any) => s + p.postsCount, 0),
      avgEngagementRate: platforms.length > 0
        ? platforms.reduce((s: number, p: any) => s + p.engagementRate, 0) / platforms.length
        : 0,
    };
  }

  static async recordSnapshot(userId: string, data: {
    platform: string;
    followers: number;
    following: number;
    postsCount: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalReach: number;
    totalImpressions: number;
    engagementRate: number;
  }) {
    const supabase = getSupabase();
    const { error } = await supabase.from('analytics_snapshots').upsert({
      user_id: userId,
      platform: data.platform,
      followers: data.followers,
      following: data.following,
      posts_count: data.postsCount,
      total_likes: data.totalLikes,
      total_comments: data.totalComments,
      total_shares: data.totalShares,
      total_reach: data.totalReach,
      total_impressions: data.totalImpressions,
      engagement_rate: data.engagementRate,
      snapshot_date: new Date().toISOString().split('T')[0],
    }, { onConflict: 'user_id,platform,snapshot_date' });

    return !error;
  }
}
