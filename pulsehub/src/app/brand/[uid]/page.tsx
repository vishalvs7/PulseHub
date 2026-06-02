// src/app/(dashboard)/brand/dashboard/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Eye,
  Instagram,
  Twitter,
  Linkedin,
  Calendar,
  ArrowUpRight,
  MoreVertical,
  DollarSign,
  Target
} from 'lucide-react';

export default function BrandDashboardPage() {
  const stats = [
    {
      title: 'Total Reach',
      value: '124.5K',
      change: '+12%',
      trend: 'up',
      icon: Eye,
      color: 'from-primary-600 to-primary-700',
    },
    {
      title: 'Engagement Rate',
      value: '4.8%',
      change: '+2.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'New Messages',
      value: '24',
      change: '+8',
      trend: 'up',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Active Campaigns',
      value: '3',
      change: '+1',
      trend: 'up',
      icon: Target,
      color: 'from-purple-500 to-pink-600',
    },
  ];

  const campaigns = [
    {
      id: 1,
      name: 'Summer Vibes 2024',
      status: 'active',
      progress: 75,
      budget: '$5,000',
      influencers: 12,
      endDate: '2024-06-30',
      platforms: ['Instagram', 'TikTok'],
    },
    {
      id: 2,
      name: 'Product Launch',
      status: 'draft',
      progress: 30,
      budget: '$10,000',
      influencers: 8,
      endDate: '2024-07-15',
      platforms: ['Instagram', 'YouTube'],
    },
    {
      id: 3,
      name: 'Holiday Campaign',
      status: 'completed',
      progress: 100,
      budget: '$8,000',
      influencers: 15,
      endDate: '2023-12-25',
      platforms: ['Instagram', 'Twitter', 'Facebook'],
    },
  ];

  const recentInfluencers = [
    {
      id: 1,
      name: 'Sarah Chen',
      handle: '@sarahchen',
      platform: 'Instagram',
      followers: '125K',
      engagement: '4.8%',
      status: 'pending',
    },
    {
      id: 2,
      name: 'Mike Rossi',
      handle: '@miketravels',
      platform: 'YouTube',
      followers: '450K',
      engagement: '6.2%',
      status: 'accepted',
    },
    {
      id: 3,
      name: 'Lena Beauty',
      handle: '@lenabeauty',
      platform: 'TikTok',
      followers: '2.1M',
      engagement: '3.9%',
      status: 'negotiating',
    },
  ];

  const quickActions = [
    { title: 'Create Campaign', icon: Target, color: 'bg-primary-100 text-primary-600' },
    { title: 'Schedule Post', icon: Calendar, color: 'bg-green-100 text-green-600' },
    { title: 'Browse Influencers', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { title: 'View Analytics', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Brand Dashboard</h1>
          <p className="text-secondary-600 mt-2">Welcome back! Here's what's happening with your campaigns.</p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule New Post
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
              className="bg-white border border-secondary-200 rounded-xl p-4 flex flex-col items-center justify-center hover:border-primary-300 hover:shadow-md transition-all"
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
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-secondary-900">{campaign.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-secondary-100 text-secondary-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-secondary-600">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {campaign.budget}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {campaign.influencers} influencers
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{campaign.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full"
                          style={{ width: `${campaign.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-3">
                      {campaign.platforms.map((platform) => {
                        const Icon = platform === 'Instagram' ? Instagram : 
                                     platform === 'Twitter' ? Twitter : 
                                     platform === 'YouTube' ? Linkedin : Instagram;
                        return (
                          <div key={platform} className="flex items-center space-x-1 bg-secondary-100 px-2 py-1 rounded text-sm">
                            <Icon className="w-4 h-4" />
                            <span>{platform}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Influencers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Influencer Activity</CardTitle>
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInfluencers.map((influencer) => (
                <div key={influencer.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {influencer.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">{influencer.name}</h3>
                      <p className="text-sm text-secondary-600">{influencer.handle}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <div className="font-semibold text-secondary-900">{influencer.followers}</div>
                        <div className="text-secondary-600">Followers</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-secondary-900">{influencer.engagement}</div>
                        <div className="text-secondary-600">Engagement</div>
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        influencer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        influencer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {influencer.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { platform: 'Instagram', icon: Instagram, reach: '89.4K', growth: '+12%', posts: 24 },
              { platform: 'Twitter', icon: Twitter, reach: '42.1K', growth: '+8%', posts: 18 },
              { platform: 'LinkedIn', icon: Linkedin, reach: '31.5K', growth: '+15%', posts: 12 },
              { platform: 'Facebook', icon: Instagram, reach: '56.8K', growth: '+5%', posts: 16 },
            ].map((platform, index) => {
              const Icon = platform.icon;
              return (
                <div key={index} className="p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">{platform.platform}</h3>
                      <p className="text-sm text-secondary-600">{platform.posts} posts</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold text-secondary-900">{platform.reach}</div>
                      <div className="text-sm text-secondary-600">Total Reach</div>
                    </div>
                    <div className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {platform.growth} growth
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}