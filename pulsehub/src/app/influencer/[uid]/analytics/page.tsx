// src/app/(dashboard)/influencer/analytics/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { 
  TrendingUp, 
  Eye, 
  Users, 
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Instagram,
  Twitter,
  Youtube,
  ArrowUpRight,
  Target,
} from 'lucide-react';
import { useState } from 'react';

export default function InfluencerAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // Analytics overview stats
  const overviewStats = [
    {
      title: 'Total Reach',
      value: '1.2M',
      change: '+18%',
      trend: 'up',
      icon: Eye,
      color: 'bg-gradient-to-r from-primary-600 to-primary-700',
    },
    {
      title: 'Engagement Rate',
      value: '4.8%',
      change: '+1.4%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    },
    {
      title: 'New Followers',
      value: '12.4K',
      change: '+2.8K',
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

  // Engagement breakdown
  const engagementMetrics = [
    { label: 'Likes', value: '245K', icon: Heart, color: 'text-red-500', change: '+12%' },
    { label: 'Comments', value: '18.4K', icon: MessageSquare, color: 'text-blue-500', change: '+8%' },
    { label: 'Shares', value: '8.2K', icon: Share2, color: 'text-green-500', change: '+15%' },
    { label: 'Saves', value: '24.5K', icon: Calendar, color: 'text-yellow-500', change: '+22%' },
  ];

  // Platform analytics
  const platformAnalytics = [
    {
      platform: 'Instagram',
      icon: Instagram,
      followers: '125K',
      engagement: '5.2%',
      growth: '+8.4%',
      posts: 24,
      color: 'from-pink-500 to-rose-600',
    },
    {
      platform: 'Twitter',
      icon: Twitter,
      followers: '45K',
      engagement: '3.8%',
      growth: '+12.1%',
      posts: 42,
      color: 'from-blue-400 to-blue-600',
    },
    {
      platform: 'YouTube',
      icon: Youtube,
      subscribers: '30K',
      engagement: '8.1%',
      growth: '+15.3%',
      videos: 8,
      color: 'from-red-500 to-red-700',
    },
  ];

  // Top performing content
  const topContent = [
    {
      id: 1,
      title: 'Behind the Scenes - Studio Day',
      platform: 'Instagram',
      engagement: '12.4K',
      reach: '45.2K',
      date: '2024-03-15',
      engagementRate: '8.2%',
    },
    {
      id: 2,
      title: 'Product Review - Tech Gadgets',
      platform: 'YouTube',
      engagement: '45.8K',
      reach: '125.4K',
      date: '2024-03-10',
      engagementRate: '9.1%',
    },
    {
      id: 3,
      title: 'Morning Routine Vlog',
      platform: 'Instagram',
      engagement: '8.7K',
      reach: '32.1K',
      date: '2024-03-08',
      engagementRate: '6.5%',
    },
  ];

  // Audience demographics
  const audienceDemographics = [
    { age: '18-24', percentage: '32%', color: 'bg-primary-500' },
    { age: '25-34', percentage: '45%', color: 'bg-primary-600' },
    { age: '35-44', percentage: '18%', color: 'bg-primary-700' },
    { age: '45+', percentage: '5%', color: 'bg-primary-800' },
  ];

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Analytics Dashboard</h1>
          <p className="text-secondary-600 mt-2">Track your performance and audience insights</p>
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
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center space-x-2">
        {timeRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value as any)}
            className={`px-4 py-2 rounded-lg transition ${
              timeRange === range.value
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Performance Trends</CardTitle>
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
                <p className="text-secondary-600">Performance chart visualization</p>
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
                    <div className="text-xs text-green-600 mt-1">{metric.change}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Platform Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformAnalytics.map((platform, index) => {
                const Icon = platform.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${platform.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-900">{platform.platform}</h3>
                        <p className="text-sm text-secondary-600">
                          {platform.posts || platform.videos} {platform.posts ? 'posts' : 'videos'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="font-semibold text-secondary-900">
                          {platform.followers || platform.subscribers}
                        </div>
                        <div className="text-xs text-secondary-600">
                          {platform.followers ? 'Followers' : 'Subscribers'}
                        </div>
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

      {/* Two Column Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Content */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topContent.map((content) => {
                const PlatformIcon = content.platform === 'Instagram' ? Instagram : 
                                   content.platform === 'YouTube' ? Youtube : Twitter;
                return (
                  <div key={content.id} className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-secondary-900">{content.title}</h3>
                      <div className="flex items-center">
                        <PlatformIcon className="w-4 h-4 mr-2 text-secondary-600" />
                        <span>{content.platform}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-lg font-bold text-secondary-900">{content.engagement}</div>
                        <div className="text-sm text-secondary-600">Engagement</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-secondary-900">{content.reach}</div>
                        <div className="text-sm text-secondary-600">Reach</div>
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${
                          parseFloat(content.engagementRate) > 7 ? 'text-green-600' :
                          parseFloat(content.engagementRate) > 5 ? 'text-yellow-600' :
                          'text-secondary-900'
                        }`}>
                          {content.engagementRate}
                        </div>
                        <div className="text-sm text-secondary-600">Engagement Rate</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-secondary-600">
                      <span>Posted: {content.date}</span>
                      <Button size="sm" variant="ghost">
                        View Details
                        <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Audience Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Audience Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Age Demographics */}
            <div className="mb-6">
              <h3 className="font-semibold text-secondary-900 mb-4">Age Distribution</h3>
              <div className="space-y-3">
                {audienceDemographics.map((demo, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-secondary-700">{demo.age}</span>
                      <span className="font-semibold">{demo.percentage}</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div 
                        className={`${demo.color} h-2 rounded-full`}
                        style={{ width: demo.percentage }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Locations */}
            <div className="mb-6">
              <h3 className="font-semibold text-secondary-900 mb-3">Top Locations</h3>
              <div className="space-y-2">
                {[
                  { location: 'United States', percentage: '45%' },
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
            </div>

            {/* Audience Interests */}
            <div>
              <h3 className="font-semibold text-secondary-900 mb-3">Audience Interests</h3>
              <div className="flex flex-wrap gap-2">
                {['Technology', 'Fashion', 'Travel', 'Food', 'Fitness', 'Music', 'Gaming', 'Art'].map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Increase Post Frequency',
                description: 'Posting 3-5 times per week can increase engagement by 40%',
                icon: Calendar,
                action: 'Schedule Posts',
              },
              {
                title: 'Optimize Posting Times',
                description: 'Your audience is most active between 6-9 PM on weekdays',
                icon: Target,
                action: 'Set Reminders',
              },
              {
                title: 'Expand Content Types',
                description: 'Try creating more video content - videos get 3x more engagement',
                icon: TrendingUp,
                action: 'Create Video',
              },
            ].map((rec, index) => {
              const Icon = rec.icon;
              return (
                <div key={index} className="p-4 border border-secondary-200 rounded-lg">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-secondary-900 mb-2">{rec.title}</h4>
                  <p className="text-secondary-600 text-sm mb-4">{rec.description}</p>
                  <Button size="sm" variant="outline">
                    {rec.action}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}