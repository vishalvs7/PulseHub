'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, Eye, Users, MessageSquare,
  Heart, Share2, Calendar, Download,
  BarChart3, Instagram, Twitter, Linkedin, Youtube
} from 'lucide-react';
import { AnalyticsService, PlatformAnalytics } from '@/services/analytics.service';
import { formatNumber } from '@/lib/utils';

export default function BrandAnalyticsPage() {
  const params = useParams();
  const uid = params.uid as string;

  const [platforms, setPlatforms] = useState<PlatformAnalytics[]>([]);
  const [aggregated, setAggregated] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [data, agg] = await Promise.all([
        AnalyticsService.getLatest(uid),
        AnalyticsService.getAggregatedStats(uid),
      ]);
      setPlatforms(data);
      setAggregated(agg);
      setLoading(false);
    };
    load();
  }, [uid]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading analytics...</div>;
  }

  const overviewStats = [
    { title: 'Total Reach', value: formatNumber(aggregated?.totalReach || 0), change: '+18%', icon: Eye, color: 'from-primary-600 to-primary-700' },
    { title: 'Engagement Rate', value: `${(aggregated?.avgEngagementRate || 0).toFixed(1)}%`, change: '+1.4%', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    { title: 'New Followers', value: formatNumber(aggregated?.totalFollowers || 0), change: '+824', icon: Users, color: 'from-blue-500 to-cyan-600' },
    { title: 'Total Engagement', value: formatNumber(aggregated?.totalEngagement || 0), change: '+15%', icon: Heart, color: 'from-primary-500 to-accent-600' },
  ];

  const platformIcons: Record<string, any> = {
    instagram: Instagram, twitter: Twitter, linkedin: Linkedin, youtube: Youtube, tiktok: Instagram, facebook: Instagram,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Analytics</h1>
          <p className="text-secondary-600 mt-2">Track your social media performance across all platforms</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                    <span className="text-sm text-green-600">{stat.change}</span>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Platform Breakdown</CardTitle>
            <Button variant="ghost" size="sm">
              <BarChart3 className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {platforms.length === 0 ? (
            <p className="text-secondary-500 text-center py-8">Connect a social account to see analytics.</p>
          ) : (
            <div className="space-y-6">
              {platforms.map((p, index) => {
                const Icon = platformIcons[p.platform] || Instagram;
                return (
                  <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-secondary-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-6 h-6 text-secondary-600" />
                      <span className="font-semibold capitalize text-secondary-900">{p.platform}</span>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary-900">{formatNumber(p.followers)}</div>
                      <div className="text-sm text-secondary-600">Followers</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary-900">{p.engagementRate.toFixed(1)}%</div>
                      <div className="text-sm text-secondary-600">Engagement</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary-900">{formatNumber(p.totalReach)}</div>
                      <div className="text-sm text-secondary-600">Reach</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Top Content</CardTitle></CardHeader>
          <CardContent>
            <p className="text-secondary-500 text-center py-8">Content analytics will appear once you start posting.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Audience Insights</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-secondary-200 rounded-lg">
                <h3 className="font-semibold text-secondary-900">Best Performing Content</h3>
                <p className="text-2xl font-bold text-secondary-900 mt-1">Video content</p>
                <p className="text-sm text-secondary-600">Videos get 3x more engagement than photos</p>
              </div>
              <div className="p-4 border border-secondary-200 rounded-lg">
                <h3 className="font-semibold text-secondary-900">Optimal Posting Time</h3>
                <p className="text-2xl font-bold text-secondary-900 mt-1">Weekdays, 6-8 PM</p>
                <p className="text-sm text-secondary-600">Engagement peaks during evening hours</p>
              </div>
              <div className="p-4 border border-secondary-200 rounded-lg">
                <h3 className="font-semibold text-secondary-900">Top Audience Location</h3>
                <p className="text-2xl font-bold text-secondary-900 mt-1">United States</p>
                <p className="text-sm text-secondary-600">45% of your audience is from the US</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
