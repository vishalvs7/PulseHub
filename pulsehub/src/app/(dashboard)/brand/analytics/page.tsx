// src/app/(dashboard)/brand/analytics/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { 
  TrendingUp, 
  Eye, 
  Users, 
  MessageSquare,
  Heart,
  Share2,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Instagram,
  Twitter,
  Linkedin,
  Youtube
} from 'lucide-react';

export default function BrandAnalyticsPage() {
  // Analytics overview stats
  const overviewStats = [
    {
      title: 'Total Reach',
      value: '245.8K',
      change: '+18%',
      trend: 'up',
      icon: Eye,
      color: 'bg-gradient-to-r from-primary-600 to-primary-700',
    },
    {
      title: 'Engagement Rate',
      value: '5.2%',
      change: '+1.4%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    },
    {
      title: 'New Followers',
      value: '3,245',
      change: '+824',
      trend: 'up',
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    },
    {
      title: 'Content Posts',
      value: '156',
      change: '+28',
      trend: 'up',
      icon: MessageSquare,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
    },
  ];

  // Engagement metrics
  const engagementMetrics = [
    { label: 'Likes', value: '45.2K', icon: Heart, color: 'text-red-500' },
    { label: 'Comments', value: '3.8K', icon: MessageSquare, color: 'text-blue-500' },
    { label: 'Shares', value: '1.2K', icon: Share2, color: 'text-green-500' },
    { label: 'Saves', value: '8.5K', icon: Calendar, color: 'text-yellow-500' },
  ];

  // Platform performance data
  const platformData = [
    {
      platform: 'Instagram',
      icon: Instagram,
      reach: '156.4K',
      engagement: '4.8%',
      growth: '+24%',
      posts: 68,
      color: 'bg-gradient-to-r from-pink-500 to-rose-600',
    },
    {
      platform: 'Twitter',
      icon: Twitter,
      reach: '42.8K',
      engagement: '2.1%',
      growth: '+12%',
      posts: 42,
      color: 'bg-gradient-to-r from-blue-400 to-blue-600',
    },
    {
      platform: 'LinkedIn',
      icon: Linkedin,
      reach: '31.5K',
      engagement: '3.4%',
      growth: '+18%',
      posts: 28,
      color: 'bg-gradient-to-r from-blue-600 to-blue-800',
    },
    {
      platform: 'YouTube',
      icon: Youtube,
      reach: '15.1K',
      engagement: '6.2%',
      growth: '+32%',
      posts: 18,
      color: 'bg-gradient-to-r from-red-500 to-red-700',
    },
  ];

  // Top performing posts
  const topPosts = [
    {
      id: 1,
      title: 'Summer Collection Launch',
      platform: 'Instagram',
      engagement: '12.4K',
      reach: '45.2K',
      date: '2024-03-15',
      engagementRate: '8.2%',
    },
    {
      id: 2,
      title: 'Behind the Scenes',
      platform: 'Twitter',
      engagement: '8.7K',
      reach: '32.1K',
      date: '2024-03-14',
      engagementRate: '6.5%',
    },
    {
      id: 3,
      title: 'Team Spotlight',
      platform: 'LinkedIn',
      engagement: '5.3K',
      reach: '28.4K',
      date: '2024-03-12',
      engagementRate: '7.1%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Analytics Dashboard</h1>
          <p className="text-secondary-600 mt-2">Track and analyze your social media performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Engagement Overview</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <LineChart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <PieChart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Chart placeholder */}
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-secondary-200 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-secondary-400 mx-auto mb-2" />
                <p className="text-secondary-600">Engagement chart visualization</p>
                <p className="text-sm text-secondary-500">Data will be displayed here</p>
              </div>
            </div>
            
            {/* Engagement metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {engagementMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="text-center p-4 border border-secondary-200 rounded-lg">
                    <Icon className={`w-8 h-8 ${metric.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-secondary-900">{metric.value}</div>
                    <div className="text-sm text-secondary-600">{metric.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformData.map((platform, index) => {
                const Icon = platform.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-900">{platform.platform}</h3>
                        <p className="text-sm text-secondary-600">{platform.posts} posts</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="font-semibold text-secondary-900">{platform.reach}</div>
                        <div className="text-xs text-secondary-600">Reach</div>
                      </div>
                      <div>
                        <div className="font-semibold text-secondary-900">{platform.engagement}</div>
                        <div className="text-xs text-secondary-600">Engagement</div>
                      </div>
                      <div>
                        <div className={`font-semibold ${
                          platform.growth.startsWith('+') ? 'text-green-600' : 'text-error-600'
                        }`}>
                          {platform.growth}
                        </div>
                        <div className="text-xs text-secondary-600">Growth</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 text-secondary-600 font-medium">Content</th>
                  <th className="text-left py-3 px-4 text-secondary-600 font-medium">Platform</th>
                  <th className="text-left py-3 px-4 text-secondary-600 font-medium">Engagement</th>
                  <th className="text-left py-3 px-4 text-secondary-600 font-medium">Reach</th>
                  <th className="text-left py-3 px-4 text-secondary-600 font-medium">Engagement Rate</th>
                  <th className="text-left py-3 px-4 text-secondary-600 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {topPosts.map((post) => (
                  <tr key={post.id} className="border-b border-secondary-100 hover:bg-secondary-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-medium text-secondary-900">{post.title}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {post.platform === 'Instagram' && <Instagram className="w-4 h-4 mr-2 text-pink-500" />}
                        {post.platform === 'Twitter' && <Twitter className="w-4 h-4 mr-2 text-blue-400" />}
                        {post.platform === 'LinkedIn' && <Linkedin className="w-4 h-4 mr-2 text-blue-600" />}
                        <span>{post.platform}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-secondary-900">{post.engagement}</td>
                    <td className="py-3 px-4 font-semibold text-secondary-900">{post.reach}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        parseFloat(post.engagementRate) > 7 ? 'bg-green-100 text-green-800' :
                        parseFloat(post.engagementRate) > 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-secondary-100 text-secondary-800'
                      }`}>
                        {post.engagementRate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary-600">{post.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-center">
            <Button variant="outline">View All Content Analytics</Button>
          </div>
        </CardContent>
      </Card>

      {/* Audience Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Audience Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: '18-24', value: '32%', color: 'bg-primary-500' },
                { label: '25-34', value: '45%', color: 'bg-primary-600' },
                { label: '35-44', value: '18%', color: 'bg-primary-700' },
                { label: '45+', value: '5%', color: 'bg-primary-800' },
              ].map((demo, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-secondary-700">{demo.label}</span>
                    <span className="font-semibold">{demo.value}</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div 
                      className={`${demo.color} h-2 rounded-full`}
                      style={{ width: demo.value }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { location: 'United States', percentage: '42%' },
                { location: 'United Kingdom', percentage: '18%' },
                { location: 'Canada', percentage: '12%' },
                { location: 'Australia', percentage: '8%' },
                { location: 'Germany', percentage: '6%' },
              ].map((loc, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-secondary-700">{loc.location}</span>
                  <span className="font-semibold text-secondary-900">{loc.percentage}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Best Times to Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { day: 'Monday', time: '10:00 AM - 12:00 PM' },
                { day: 'Wednesday', time: '2:00 PM - 4:00 PM' },
                { day: 'Friday', time: '6:00 PM - 8:00 PM' },
                { day: 'Saturday', time: '11:00 AM - 1:00 PM' },
              ].map((time, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium text-secondary-900">{time.day}</span>
                  <span className="text-secondary-600">{time.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}