'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, Users, MessageSquare, Eye,
  Instagram, Twitter, Linkedin, Calendar,
  ArrowUpRight, DollarSign, Target
} from 'lucide-react';
import { BrandService, BrandDashboardStats } from '@/services/brand.service';
import { Campaign } from '@/types/brand';
import { formatNumber } from '@/lib/utils';

export default function BrandDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;

  const [stats, setStats] = useState<BrandDashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, c, p] = await Promise.all([
        BrandService.getDashboardStats(uid),
        BrandService.getCampaigns(uid),
        BrandService.getPlatformPerformance(uid),
      ]);
      setStats(s);
      setCampaigns(c);
      setPlatformData(p);
      setLoading(false);
    };
    load();
  }, [uid]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Reach', value: formatNumber(stats?.totalReach || 0), change: '+12%', trend: 'up', icon: Eye, color: 'from-primary-600 to-primary-700' },
    { title: 'Engagement Rate', value: `${(stats?.engagementRate || 0).toFixed(1)}%`, change: '+2.3%', trend: 'up', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    { title: 'New Messages', value: String(stats?.newMessages || 0), change: '+8', trend: 'up', icon: MessageSquare, color: 'from-blue-500 to-cyan-600' },
    { title: 'Active Campaigns', value: String(stats?.activeCampaigns || 0), change: '+1', trend: 'up', icon: Target, color: 'from-primary-500 to-accent-600' },
  ];

  const activeCampaigns = campaigns.filter(c => c.status === 'active').slice(0, 3);

  const quickActions = [
    { title: 'Create Campaign', icon: Target, color: 'bg-primary-100 text-primary-600', href: `${uid}/campaigns` },
    { title: 'Schedule Post', icon: Calendar, color: 'bg-green-100 text-green-600', href: `${uid}/posting` },
    { title: 'Browse Influencers', icon: Users, color: 'bg-blue-100 text-blue-600', href: `${uid}/marketplace` },
    { title: 'View Analytics', icon: TrendingUp, color: 'bg-primary-100 text-primary-600', href: `${uid}/analytics` },
  ];

  const platformIcons: Record<string, any> = {
    instagram: Instagram, twitter: Twitter, linkedin: Linkedin, facebook: Instagram, youtube: Instagram, tiktok: Instagram,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Brand Dashboard</h1>
          <p className="text-secondary-600 mt-2">Welcome back! Here&apos;s what&apos;s happening with your campaigns.</p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700" onClick={() => router.push(`/brand/${uid}/posting`)}>
          <Calendar className="w-4 h-4 mr-2" />
          Schedule New Post
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-error-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-secondary-500 ml-2">from last month</span>
                    </div>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => router.push(`/brand/${action.href}`)}
              className="bg-white border border-secondary-200 rounded-lg p-4 flex flex-col items-center justify-center hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-medium text-secondary-900 text-center">{action.title}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaigns */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Campaigns</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push(`/brand/${uid}/campaigns`)}>
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeCampaigns.length === 0 ? (
              <p className="text-secondary-500 text-center py-8">No active campaigns yet.</p>
            ) : (
              <div className="space-y-4">
                {activeCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-secondary-900">{campaign.name}</h3>
                        <span className="px-2 py-1 text-xs rounded-lg bg-green-100 text-green-800">active</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-secondary-600">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${Number(campaign.budget).toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {campaign.targetInfluencers} influencers
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {platformData.length === 0 ? (
              <p className="text-secondary-500 text-center py-8">Connect a social account to see performance.</p>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {platformData.map((p, index) => {
                  const Icon = platformIcons[p.platform] || Instagram;
                  return (
                    <div key={index} className="p-4 border border-secondary-200 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-secondary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary-900 capitalize">{p.platform}</h3>
                          <p className="text-sm text-secondary-600">{p.posts} posts</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-2xl font-bold text-secondary-900">{formatNumber(p.reach)}</div>
                          <div className="text-sm text-secondary-600">Total Reach</div>
                        </div>
                        <div className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {p.growth} growth
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
