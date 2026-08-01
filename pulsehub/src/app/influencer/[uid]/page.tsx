'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { 
  TrendingUp, Users, Heart, MessageSquare, Eye,
  DollarSign, Calendar, ArrowUpRight,
  Instagram, Twitter, Youtube, Linkedin,
  CheckCircle, Zap, Target, UserCircle
} from 'lucide-react';
import { InfluencerService, InfluencerDashboardStats } from '@/services/influencer.service';
import { formatNumber } from '@/lib/utils';

export default function InfluencerDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;

  const [stats, setStats] = useState<InfluencerDashboardStats | null>(null);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, p, c] = await Promise.all([
        InfluencerService.getDashboardStats(uid),
        InfluencerService.getPlatformPerformance(uid),
        InfluencerService.getCollaborations(uid),
      ]);
      setStats(s);
      setPlatforms(p);
      setCollaborations(c);
      setLoading(false);
    };
    load();
  }, [uid]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading dashboard...</div>;
  }

  const overviewStats = [
    { title: 'Total Followers', value: formatNumber(stats?.totalFollowers || 0), change: '+12K', trend: 'up', icon: Users, color: 'bg-gradient-to-r from-primary-600 to-primary-700' },
    { title: 'Engagement Rate', value: `${(stats?.engagementRate || 0).toFixed(1)}%`, change: '+0.4%', trend: 'up', icon: TrendingUp, color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    { title: 'Monthly Earnings', value: `$${formatNumber(stats?.monthlyEarnings || 0)}`, change: `+$${formatNumber(Math.round((stats?.monthlyEarnings || 0) * 0.15))}`, trend: 'up', icon: DollarSign, color: 'bg-gradient-to-r from-blue-500 to-cyan-600' },
    { title: 'Active Campaigns', value: String(stats?.activeCampaigns || 0), change: '+2', trend: 'up', icon: Target, color: 'bg-gradient-to-r from-primary-500 to-accent-600' },
  ];

  const platformColors: Record<string, string> = {
    instagram: 'from-accent-500 to-rose-600',
    twitter: 'from-blue-400 to-blue-600',
    youtube: 'from-red-500 to-red-700',
    linkedin: 'from-blue-600 to-blue-800',
    tiktok: 'from-gray-800 to-gray-900',
  };

  const platformIcons: Record<string, any> = {
    instagram: Instagram, twitter: Twitter, youtube: Youtube, linkedin: Linkedin, tiktok: Instagram,
  };

  const quickActions = [
    { title: 'Post Content', icon: Instagram, color: 'bg-accent-100 text-accent-600', href: `/influencer/${uid}/profile` },
    { title: 'Check Messages', icon: MessageSquare, color: 'bg-blue-100 text-blue-600', href: `/influencer/${uid}/inbox` },
    { title: 'View Analytics', icon: TrendingUp, color: 'bg-green-100 text-green-600', href: `/influencer/${uid}/analytics` },
    { title: 'Update Profile', icon: UserCircle, color: 'bg-primary-100 text-primary-600', href: `/influencer/${uid}/profile` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Influencer Dashboard</h1>
          <p className="text-secondary-600 mt-2">Welcome back! Here&apos;s your performance overview.</p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700" onClick={() => router.push(`/influencer/${uid}/profile`)}>
          <Zap className="w-4 h-4 mr-2" />
          Boost Profile Visibility
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => router.push(action.href)}
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
        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Platform Performance</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push(`/influencer/${uid}/analytics`)}>
                View Details
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {platforms.length === 0 ? (
              <p className="text-secondary-500 text-center py-8">Connect a social account to see performance.</p>
            ) : (
              <div className="space-y-4">
                {platforms.map((platform, index) => {
                  const Icon = platformIcons[platform.platform] || Instagram;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${platformColors[platform.platform] || 'from-primary-500 to-primary-700'} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary-900 capitalize">{platform.platform}</h3>
                          <p className="text-sm text-secondary-600">{platform.posts} posts this month</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-secondary-900">{formatNumber(platform.followers)}</div>
                        <div className="text-sm text-secondary-600">Followers</div>
                        <div className="flex items-center justify-end mt-1">
                          <span className="text-sm text-green-600">{platform.growth}</span>
                          <span className="text-sm text-secondary-600 ml-1">growth</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Collaborations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Collaborations</CardTitle>
              <Button variant="ghost" size="sm">View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {collaborations.length === 0 ? (
              <p className="text-secondary-500 text-center py-8">No active collaborations yet.</p>
            ) : (
              <div className="space-y-4">
                {collaborations.map((collab: any, index: number) => (
                  <div key={index} className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-secondary-900">{collab.brand}</h3>
                        <p className="text-sm text-secondary-600">{collab.campaign}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-sm ${
                        collab.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        collab.status === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>{collab.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-lg font-bold text-secondary-900">${formatNumber(collab.earnings)}</div>
                        <div className="text-sm text-secondary-600">Earnings</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-secondary-900">{collab.deadline || 'TBD'}</div>
                        <div className="text-sm text-secondary-600">Deadline</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-secondary-600">Progress</span>
                        <span className="font-semibold">{collab.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full transition-all duration-300" style={{ width: `${collab.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
