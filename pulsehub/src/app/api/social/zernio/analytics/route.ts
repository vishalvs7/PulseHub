import { NextRequest, NextResponse } from 'next/server';
import { requireUser, getAdmin } from '@/lib/auth/server-auth';
import { ZernioService } from '@/services/social/zernio.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PAGES = 6;
const PAGE_SIZE = 100;

interface Metrics {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  clicks: number;
  reach: number;
  impressions: number;
  engagement: number;
  rateSum: number;
  rateImpressions: number;
  rateCount: number;
  posts: number;
}

const emptyMetrics = (): Metrics => ({
  likes: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  views: 0,
  clicks: 0,
  reach: 0,
  impressions: 0,
  engagement: 0,
  rateSum: 0,
  rateImpressions: 0,
  rateCount: 0,
  posts: 0,
});

function addMetrics(target: Metrics, src: Record<string, unknown>) {
  const num = (v: unknown) => (typeof v === 'number' ? v : 0);
  target.likes += num(src.likes);
  target.comments += num(src.comments);
  target.shares += num(src.shares);
  target.saves += num(src.saves);
  target.views += num(src.views);
  target.clicks += num(src.clicks);
  target.reach += num(src.reach);
  target.impressions += num(src.impressions);
  const rate = num(src.engagementRate);
  if (rate > 0) {
    target.rateSum += rate * num(src.impressions);
    target.rateImpressions += num(src.impressions);
    target.rateCount += 1;
  }
}

function engagementRate(m: Metrics): number | null {
  if (m.rateImpressions > 0) return m.rateSum / m.rateImpressions;
  if (m.rateCount > 0) return m.rateSum / m.rateCount;
  return null;
}

function summarize(m: Metrics) {
  return {
    posts: m.posts,
    likes: m.likes,
    comments: m.comments,
    shares: m.shares,
    saves: m.saves,
    views: m.views,
    clicks: m.clicks,
    reach: m.reach,
    impressions: m.impressions,
    engagement: m.engagement,
    engagementRate: engagementRate(m),
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const admin = getAdmin();

    const daysParam = req.nextUrl.searchParams.get('days');
    const days = Math.min(Math.max(parseInt(daysParam || '90', 10) || 90, 1), 366);

    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    const fromDate = from.toISOString().split('T')[0];
    const toDate = to.toISOString().split('T')[0];

    const { data: userRow } = await admin
      .from('users')
      .select('zernio_profile_id')
      .eq('id', user.id)
      .single();
    const profileId = userRow?.zernio_profile_id || undefined;

    if (!profileId) {
      return NextResponse.json({
        hasAnalyticsAccess: true,
        dateRange: { from: fromDate, to: toDate },
        platforms: [],
        posts: [],
        postsTotal: 0,
        lastSync: null,
      });
    }

    // Follower counts are refreshed once a day by Zernio.
    let followerAccounts: Record<string, unknown>[] = [];
    try {
      const fs = await ZernioService.getFollowerStats({ profileId, fromDate, toDate });
      followerAccounts = fs.accounts || [];
    } catch {
      // Follower stats can be unavailable without the add-on; analytics still work.
    }

    const followersByAccount = new Map<string, { followers: number; growth: number }>();
    for (const a of followerAccounts) {
      followersByAccount.set(String(a._id || ''), {
        followers: typeof a.currentFollowers === 'number' ? a.currentFollowers : 0,
        growth: typeof a.growth === 'number' ? a.growth : 0,
      });
    }

    // Fetch analytics pages until we have all posts (capped).
    const platformTotals = new Map<string, Metrics>();
    const accountTotals = new Map<string, Metrics>();
    const accountMeta = new Map<string, { platform: string; username: string }>();
    const rows: Record<string, unknown>[] = [];
    let postsTotal = 0;
    let lastSync: string | null = null;
    let hasAnalyticsAccess = true;
    let analyticsError: string | null = null;

    for (let page = 1; page <= MAX_PAGES; page++) {
      let data: Record<string, unknown>;
      try {
        data = await ZernioService.getAnalytics({
          profileId,
          fromDate,
          toDate,
          limit: PAGE_SIZE,
          page,
          sortBy: 'date',
        });
      } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status === 402 || status === 403) {
          hasAnalyticsAccess = false;
          analyticsError = err instanceof Error ? err.message : 'Analytics add-on required.';
          break;
        }
        throw err;
      }

      if (data.hasAnalyticsAccess === false) {
        hasAnalyticsAccess = false;
        analyticsError = 'Analytics add-on required to view post analytics.';
        break;
      }

      if (typeof data.lastSync === 'string') lastSync = data.lastSync;
      const overview = data.overview as Record<string, unknown> | undefined;
      if (overview && typeof overview.totalPosts === 'number') postsTotal = overview.totalPosts;
      if (!lastSync && overview && typeof overview.lastSync === 'string') lastSync = overview.lastSync;

      const postList = (data.posts || []) as Record<string, unknown>[];

      postList.forEach((post) => {
        const content = (post.content as string) || '';
        const publishedAt = (post.publishedAt as string) || (post.scheduledFor as string) || null;
        const postId = String(post._id || '');
        const thumbnailUrl = (post.thumbnailUrl as string) || null;
        const mediaType = (post.mediaType as string) || null;
        const platforms = (post.platforms || []) as Record<string, unknown>[];
        const fallbackPlatform = (post.platform as string) || '';

        const targets = platforms.length > 0
          ? platforms
          : fallbackPlatform
            ? [{ platform: fallbackPlatform, analytics: post.analytics, accountUsername: post.accountUsername || null }]
            : [];

        for (const t of targets) {
          const platform = String(t.platform || '').toLowerCase();
          if (!platform) continue;
          const m = (t.analytics || {}) as Record<string, unknown>;
          const accountId = String(t.accountId || '');
          const username = String(t.accountUsername || '').replace(/^@/, '');

          const pt = platformTotals.get(platform) || emptyMetrics();
          pt.posts += 1;
          addMetrics(pt, m);
          platformTotals.set(platform, pt);

          if (accountId) {
            const at = accountTotals.get(accountId) || emptyMetrics();
            at.posts += 1;
            addMetrics(at, m);
            accountTotals.set(accountId, at);
            accountMeta.set(accountId, { platform, username });
          }

          rows.push({
            postId,
            content,
            publishedAt,
            platform,
            accountId,
            accountUsername: username || null,
            platformPostUrl: t.platformPostUrl || null,
            thumbnailUrl,
            mediaType,
            status: t.status || post.status || null,
            metrics: {
              likes: typeof m.likes === 'number' ? m.likes : 0,
              comments: typeof m.comments === 'number' ? m.comments : 0,
              shares: typeof m.shares === 'number' ? m.shares : 0,
              saves: typeof m.saves === 'number' ? m.saves : 0,
              views: typeof m.views === 'number' ? m.views : 0,
              clicks: typeof m.clicks === 'number' ? m.clicks : 0,
              reach: typeof m.reach === 'number' ? m.reach : 0,
              impressions: typeof m.impressions === 'number' ? m.impressions : 0,
              engagementRate: typeof m.engagementRate === 'number' ? m.engagementRate : null,
            },
          });
        }
      });

      const pagination = data.pagination as Record<string, unknown> | undefined;
      const totalPages = typeof pagination?.pages === 'number' ? pagination.pages : 1;
      if (page >= totalPages) break;
    }

    // Build per-platform aggregates with per-account breakdown.
    const platforms = Array.from(platformTotals.entries())
      .map(([platform, totals]) => {
        const accountRows = Array.from(accountTotals.entries())
          .map(([accountId, at]) => {
            const meta = accountMeta.get(accountId);
            if (!meta || meta.platform !== platform) return null;
            const f = followersByAccount.get(accountId);
            return {
              accountId,
              username: meta.username,
              followers: f?.followers ?? 0,
              followerGrowth: f?.growth ?? 0,
              totals: { ...summarize(at), posts: at.posts },
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null)
          .sort((a, b) => b.totals.engagement - a.totals.engagement);

        const totalFollowers = accountRows.reduce((s, a) => s + a.followers, 0);
        const totalGrowth = accountRows.reduce((s, a) => s + a.followerGrowth, 0);
        return {
          platform,
          followers: totalFollowers,
          followerGrowth: totalGrowth,
          totals: { ...summarize(totals), posts: totals.posts },
          accounts: accountRows,
        };
      })
      .sort((a, b) => b.totals.engagement - a.totals.engagement);

    const posts = rows.sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));

    return NextResponse.json({
      hasAnalyticsAccess,
      analyticsError,
      dateRange: { from: fromDate, to: toDate },
      platforms,
      posts,
      postsTotal,
      lastSync,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load analytics';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}