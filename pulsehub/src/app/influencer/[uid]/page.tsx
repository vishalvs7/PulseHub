// src/app/(dashboard)/influencer/dashboard/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageSquare, 
  Eye,
  DollarSign,
  Calendar,
  ArrowUpRight,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  CheckCircle,
  Zap,
  Target,
} from 'lucide-react';

export default function InfluencerDashboardPage() {
  // Overview stats
  const overviewStats = [
    {
      title: 'Total Followers',
      value: '245K',
      change: '+12K',
      trend: 'up',
      icon: Users,
      color: 'bg-gradient-to-r from-primary-600 to-primary-700',
    },
    {
      title: 'Engagement Rate',
      value: '4.8%',
      change: '+0.4%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
    },
    {
      title: 'Monthly Earnings',
      value: '$3,450',
      change: '+$450',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    },
    {
      title: 'Active Campaigns',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: Target,
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
    },
  ];

  // Platform performance
  const platformPerformance = [
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
      followers: '30K',
      engagement: '8.1%',
      growth: '+15.3%',
      posts: 8,
      color: 'from-red-500 to-red-700',
    },
    {
      platform: 'LinkedIn',
      icon: Linkedin,
      followers: '15K',
      engagement: '2.4%',
      growth: '+5.6%',
      posts: 12,
      color: 'from-blue-600 to-blue-800',
    },
  ];

  // Recent collaborations
  const recentCollaborations = [
    {
      id: 1,
      brand: 'TechNova',
      campaign: 'Summer Product Launch',
      status: 'active',
      earnings: '$1,200',
      deadline: '2024-04-15',
      progress: 75,
    },
    {
      id: 2,
      brand: 'FashionHub',
      campaign: 'Spring Collection',
      status: 'review',
      earnings: '$800',
      deadline: '2024-03-30',
      progress: 90,
    },
    {
      id: 3,
      brand: 'EcoLiving',
      campaign: 'Sustainable Lifestyle',
      status: 'pending',
      earnings: '$1,500',
      deadline: '2024-04-20',
      progress: 30,
    },
  ];

  // Upcoming tasks
  const upcomingTasks = [
    { task: 'Submit content for TechNova', due: 'Today', priority: 'high' },
    { task: 'Schedule Instagram posts', due: 'Tomorrow', priority: 'medium' },
    { task: 'Review contract with FashionHub', due: 'Mar 25', priority: 'high' },
    { task: 'Create YouTube video script', due: 'Mar 28', priority: 'medium' },
  ];

  // Quick actions
  const quickActions = [
    { title: 'Post Content', icon: Instagram, color: 'bg-pink-100 text-pink-600' },
    { title: 'Check Messages', icon: MessageSquare, color: 'bg-blue-100 text-blue-600' },
    { title: 'View Analytics', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { title: 'Update Profile', icon: Users, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Influencer Dashboard</h1>
          <p className="text-secondary-600 mt-2">Welcome back! Here's your performance overview.</p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
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
        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Platform Performance</CardTitle>
              <Button variant="ghost" size="sm">
                View Details
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformPerformance.map((platform, index) => {
                const Icon = platform.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${platform.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-900">{platform.platform}</h3>
                        <p className="text-sm text-secondary-600">{platform.posts} posts this month</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-secondary-900">{platform.followers}</div>
                      <div className="text-sm text-secondary-600">Followers</div>
                      <div className="flex items-center justify-end mt-1">
                        <span className={`text-sm ${
                          platform.growth.startsWith('+') ? 'text-green-600' : 'text-error-600'
                        }`}>
                          {platform.growth}
                        </span>
                        <span className="text-sm text-secondary-600 ml-1">growth</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Collaborations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Collaborations</CardTitle>
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCollaborations.map((collab) => (
                <div key={collab.id} className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-secondary-900">{collab.brand}</h3>
                      <p className="text-sm text-secondary-600">{collab.campaign}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      collab.status === 'active' ? 'bg-green-100 text-green-800' :
                      collab.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {collab.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-lg font-bold text-secondary-900">{collab.earnings}</div>
                      <div className="text-sm text-secondary-600">Earnings</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary-900">{collab.deadline}</div>
                      <div className="text-sm text-secondary-600">Deadline</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-secondary-600">Progress</span>
                      <span className="font-semibold">{collab.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${collab.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      task.priority === 'high' ? 'bg-error-100 text-error-600' :
                      'bg-warning-100 text-warning-600'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-secondary-900">{task.task}</h3>
                      <p className="text-sm text-secondary-600">Due: {task.due}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'high' ? 'bg-error-100 text-error-800' :
                    'bg-warning-100 text-warning-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                View Full Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  metric: 'Best Performing Content',
                  value: 'Behind the scenes videos',
                  insight: 'Videos get 3x more engagement than photos',
                  icon: Heart,
                  color: 'text-pink-500',
                },
                {
                  metric: 'Optimal Posting Time',
                  value: 'Weekdays, 6-8 PM',
                  insight: 'Engagement peaks during evening hours',
                  icon: Eye,
                  color: 'text-blue-500',
                },
                {
                  metric: 'Top Audience Location',
                  value: 'United States',
                  insight: '45% of your audience is from the US',
                  icon: Users,
                  color: 'text-green-500',
                },
              ].map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="p-4 border border-secondary-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-secondary-900">{insight.metric}</h3>
                      <Icon className={`w-5 h-5 ${insight.color}`} />
                    </div>
                    <div className="text-lg font-bold text-secondary-900 mb-1">{insight.value}</div>
                    <p className="text-sm text-secondary-600">{insight.insight}</p>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-secondary-900">Pro Tip</h3>
                  <p className="text-sm text-secondary-600">
                    Post consistently at optimal times to maximize your reach and engagement.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Score & Verification */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">Trust Score & Verification</h3>
              <p className="text-secondary-600 mt-1">Higher trust scores lead to more brand collaborations</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-secondary-900">92/100</div>
              <div className="text-sm text-green-600 flex items-center justify-end">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5 points this month
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-secondary-600">Trust Score Progress</span>
              <span className="font-semibold">92%</span>
            </div>
            <div className="w-full bg-secondary-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                style={{ width: '92%' }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Account Age', value: '2+ years', status: 'verified' },
              { label: 'Engagement Authenticity', value: '98% real', status: 'verified' },
              { label: 'Content Quality', value: 'High', status: 'verified' },
            ].map((item, index) => (
              <div key={index} className="p-3 border border-secondary-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">{item.label}</span>
                  {item.status === 'verified' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-secondary-400" />
                  )}
                </div>
                <div className="font-semibold text-secondary-900 mt-1">{item.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}