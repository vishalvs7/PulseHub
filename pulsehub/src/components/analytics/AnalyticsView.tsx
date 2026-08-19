'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Loader2,
  RefreshCw,
  AlertCircle,
  Heart,
  MessageSquare,
  Repeat2,
  Bookmark,
  Eye,
  MousePointerClick,
  FileText,
  CalendarClock,
  ExternalLink,
  TrendingUp,
  Activity,
} from 'lucide-react';
import BrandIcon from '@/components/posting/BrandIcon';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';
import { PLATFORM_CONFIGS, PLATFORM_LIST } from '@/lib/socialPlatforms';
import { formatNumber } from '@/lib/utils';
import { LineChart, DonutChart, GroupedBarChart, platformColor } from './charts';

interface MetricsTotals {
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  clicks: number;
  reach: number;
  impressions: number;
  engagement: number;
  engagementRate: number | null;
}

interface AccountAgg {
  accountId: string;
  username: string;
  followers: number;
  followerGrowth: number;
  totals: MetricsTotals;
}

interface PlatformAgg {
  platform: string;
  followers: number;
  followerGrowth: number;
  totals: MetricsTotals;
  accounts: AccountAgg[];
}

interface PostRow {
  postId: string;
  content: string;
  publishedAt: string | null;
  platform: string;
  accountUsername: string | null;
  platformPostUrl: string | null;
  thumbnailUrl: string | null;
  mediaType: string | null;
  status: string | null;
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    views: number;
    clicks: number;
    reach: number;
    impressions: number;
    engagementRate: number | null;
  };
}

interface AnalyticsData {
  hasAnalyticsAccess: boolean;
  analyticsError: string | null;
  dateRange: { from: string; to: string };
  platforms: PlatformAgg[];
  posts: PostRow[];
  postsTotal: number;
  lastSync: string | null;
  followerTrend: { date: string; platform: string; followers: number }[];
}

const DAY_OPTIONS = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
];

const METRIC_TILES: { key: Exclude<keyof MetricsTotals, 'engagementRate'>; label: string; icon: any }[] = [
  { key: 'likes', label: 'Likes', icon: Heart },
  { key: 'comments', label: 'Comments', icon: MessageSquare },
  { key: 'shares', label: 'Shares', icon: Repeat2 },
  { key: 'saves', label: 'Saves', icon: Bookmark },
  { key: 'views', label: 'Views', icon: Eye },
  { key: 'clicks', label: 'Clicks', icon: MousePointerClick },
  { key: 'reach', label: 'Reach', icon: Activity },
  { key: 'impressions', label: 'Impressions', icon: Eye },
];

const POST_COLUMNS = ['Likes', 'Comments', 'Shares', 'Views', 'Reach'];

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

function platformName(platform: string): string {
  return PLATFORM_CONFIGS[platform as CrossPostPlatform]?.name || PLATFORM_LIST.find((p) => p.id === platform)?.name || platform;
}

function MetricValue({ value }: { value: number }) {
  return value > 0 ? formatNumber(value) : '—';
}

export default function AnalyticsView({ userId }: { userId: string }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (d: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/social/zernio/analytics?days=${d}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to load analytics.');
        setData(null);
        return;
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading analytics…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm flex items-center">
        <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
      </div>
    );
  }

  if (!data) return null;

  const hasAccounts = data.platforms.length > 0 || data.postsTotal > 0;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-secondary-600">
          {data.dateRange?.from} → {data.dateRange?.to}
          {data.lastSync && <span className="ml-2 text-secondary-400">· synced {fmtDate(data.lastSync)}</span>}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary-100 rounded-lg p-1">
            {DAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  days === opt.value ? 'bg-white shadow text-primary-700' : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={() => load(days)} loading={loading} icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      {!data.hasAnalyticsAccess ? (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          {data.analyticsError || 'Analytics add-on required to view post analytics.'}
        </div>
      ) : !hasAccounts ? (
        <Card>
          <CardContent className="p-10 text-center text-secondary-400">
            <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-secondary-900 font-medium">No analytics yet</p>
            <p className="text-sm mt-1">Connect a social account and publish posts to see per-platform performance.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts — every bar/slice is one platform; nothing is summed across platforms. */}
          {(() => {
            const trendSeries = Object.entries(
              (data.followerTrend || []).reduce<Record<string, { x: string; y: number }[]>>((acc, pt) => {
                (acc[pt.platform] = acc[pt.platform] || []).push({ x: pt.date, y: pt.followers });
                return acc;
              }, {})
            ).map(([platform, points]) => ({ label: platformName(platform), color: platformColor(platform), points }));

            const engagementSegments = data.platforms
              .map((p) => ({ label: platformName(p.platform), value: p.totals.engagement, color: platformColor(p.platform) }))
              .filter((s) => s.value > 0);

            const likeBar = data.platforms.map((p) => ({
              label: platformName(p.platform),
              values: [
                { label: 'Likes', value: p.totals.likes, color: '#E1306C' },
                { label: 'Comments', value: p.totals.comments, color: '#0A66C2' },
                { label: 'Shares', value: p.totals.shares, color: '#22C55E' },
              ],
            }));

            const reachBar = data.platforms.map((p) => ({
              label: platformName(p.platform),
              values: [
                { label: 'Reach', value: p.totals.reach, color: '#8B5CF6' },
                { label: 'Impressions', value: p.totals.impressions, color: '#06B6D4' },
              ],
            }));

            return (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Follower Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LineChart series={trendSeries} />
                      <div className="flex flex-wrap gap-4 justify-center mt-2">
                        {trendSeries.map((s) => (
                          <span key={s.label} className="flex items-center gap-1.5 text-xs text-secondary-600">
                            <span className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
                            {s.label}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Share</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DonutChart segments={engagementSegments} centerLabel="engagements" />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Likes · Comments · Shares by platform</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <GroupedBarChart groups={likeBar} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Reach vs Impressions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <GroupedBarChart groups={reachBar} height={220} />
                    </CardContent>
                  </Card>
                </div>
              </>
            );
          })()}

          {/* Per-platform sections — never aggregated across platforms. */}
          <div className="space-y-6">
            {data.platforms.map((p) => (
              <Card key={p.platform}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <BrandIcon platform={p.platform as CrossPostPlatform} className="w-11 h-11 rounded-xl" />
                      <div>
                        <CardTitle className="capitalize">{platformName(p.platform)}</CardTitle>
                        <p className="text-sm text-secondary-600 mt-0.5">
                          <span className="font-semibold text-secondary-900">{formatNumber(p.followers)}</span> followers
                          {p.followerGrowth !== 0 && (
                            <span className={`ml-1 ${p.followerGrowth > 0 ? 'text-green-600' : 'text-error-600'}`}>
                              ({p.followerGrowth > 0 ? '+' : ''}{formatNumber(p.followerGrowth)} this period)
                            </span>
                          )}
                          {' · '}
                          <span className="font-semibold text-secondary-900">{p.totals.posts}</span> posts
                        </p>
                      </div>
                    </div>
                    {p.totals.engagementRate !== null && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-secondary-900">{p.totals.engagementRate.toFixed(1)}%</p>
                        <p className="text-sm text-secondary-600">Engagement rate</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform totals — this platform only. */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'Posts', value: p.totals.posts > 0 ? formatNumber(p.totals.posts) : '—', icon: FileText },
                      ...METRIC_TILES.filter((t) => p.totals[t.key] > 0).map((t) => ({
                        label: t.label,
                        value: formatNumber(p.totals[t.key]),
                        icon: t.icon,
                      })),
                    ].map((tile, i) => {
                      const Icon = tile.icon;
                      return (
                        <div key={i} className="p-4 bg-secondary-50 rounded-xl">
                          <div className="flex items-center gap-2 text-secondary-600 mb-1">
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{tile.label}</span>
                          </div>
                          <p className="text-xl font-bold text-secondary-900">{tile.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Per-account / per-profile breakdown for this platform. */}
                  {p.accounts.length > 1 && (
                    <div>
                      <h4 className="text-sm font-semibold text-secondary-900 mb-2">Breakdown by profile</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-secondary-500 border-b border-secondary-200">
                              <th className="text-left py-2 pr-4 font-medium">Profile</th>
                              <th className="text-right py-2 px-2 font-medium">Followers</th>
                              <th className="text-right py-2 px-2 font-medium">Posts</th>
                              <th className="text-right py-2 px-2 font-medium">Likes</th>
                              <th className="text-right py-2 px-2 font-medium">Comments</th>
                              <th className="text-right py-2 px-2 font-medium">Shares</th>
                              <th className="text-right py-2 px-2 font-medium">Reach</th>
                              <th className="text-right py-2 pl-2 font-medium">Engagement</th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.accounts.map((a) => (
                              <tr key={a.accountId} className="border-b border-secondary-100">
                                <td className="py-2 pr-4 font-medium text-secondary-900">@{a.username || 'profile'}</td>
                                <td className="text-right py-2 px-2"><MetricValue value={a.followers} /></td>
                                <td className="text-right py-2 px-2"><MetricValue value={a.totals.posts} /></td>
                                <td className="text-right py-2 px-2"><MetricValue value={a.totals.likes} /></td>
                                <td className="text-right py-2 px-2"><MetricValue value={a.totals.comments} /></td>
                                <td className="text-right py-2 px-2"><MetricValue value={a.totals.shares} /></td>
                                <td className="text-right py-2 px-2"><MetricValue value={a.totals.reach} /></td>
                                <td className="text-right py-2 pl-2">
                                  {a.totals.engagementRate !== null ? `${a.totals.engagementRate.toFixed(1)}%` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Per-post analytics */}
          {data.posts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Posts</CardTitle>
                  <span className="text-sm text-secondary-500">{data.posts.length} shown</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-secondary-500 border-b border-secondary-200">
                        <th className="text-left py-2 pr-4 font-medium">Post</th>
                        <th className="text-left py-2 px-2 font-medium">Platform</th>
                        <th className="text-left py-2 px-2 font-medium">Date</th>
                        {POST_COLUMNS.map((c) => (
                          <th key={c} className="text-right py-2 px-2 font-medium">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.posts.slice(0, 50).map((post, i) => (
                        <tr key={`${post.postId}-${i}`} className="border-b border-secondary-100 align-middle">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3 min-w-0">
                              {post.thumbnailUrl ? (
                                post.mediaType === 'video' ? (
                                  <video src={post.thumbnailUrl} className="w-12 h-12 rounded-lg object-cover shrink-0" muted />
                                ) : (
                                  <img src={post.thumbnailUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                )
                              ) : (
                                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5 text-secondary-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-secondary-900 line-clamp-1">{post.content || '(media only)'}</p>
                                <p className="text-xs text-secondary-500 flex items-center gap-1">
                                  <CalendarClock className="w-3 h-3" /> {fmtDate(post.publishedAt)}
                                  {post.accountUsername && <span>· @{post.accountUsername}</span>}
                                  {post.platformPostUrl && (
                                    <a
                                      href={post.platformPostUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-0.5"
                                    >
                                      <ExternalLink className="w-3 h-3" /> view
                                    </a>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            <BrandIcon platform={post.platform as CrossPostPlatform} className="w-7 h-7 rounded-md" />
                          </td>
                          <td className="py-2 px-2 text-secondary-600 whitespace-nowrap">{fmtDate(post.publishedAt)}</td>
                          <td className="text-right py-2 px-2 font-semibold text-secondary-900"><MetricValue value={post.metrics.likes} /></td>
                          <td className="text-right py-2 px-2"><MetricValue value={post.metrics.comments} /></td>
                          <td className="text-right py-2 px-2"><MetricValue value={post.metrics.shares} /></td>
                          <td className="text-right py-2 px-2"><MetricValue value={post.metrics.views} /></td>
                          <td className="text-right py-2 px-2"><MetricValue value={post.metrics.reach} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Note: charts compare platforms side by side; totals are never added across platforms. */}
          <p className="text-xs text-secondary-400 text-center">
            Every chart compares platforms side by side — like counts, comments and shares are never added together across platforms.
            <TrendingUp className="inline w-3 h-3 ml-1 mb-0.5" />
          </p>
        </>
      )}
    </div>
  );
}