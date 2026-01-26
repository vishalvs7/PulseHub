// src/app/(dashboard)/brand/campaigns/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Filter, 
  Search, 
  MoreVertical,
  Users,
  DollarSign,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  PauseCircle,
  XCircle,
  Instagram,
  Twitter,
  Youtube,
  TrendingUp,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useState } from 'react';

// Campaign status type
type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

interface Campaign {
  id: number;
  name: string;
  description: string;
  status: CampaignStatus;
  budget: string;
  influencers: number;
  startDate: string;
  endDate: string;
  platforms: string[];
  reach: string;
  engagement: string;
  progress: number;
}

export default function BrandCampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  
  // Mock campaign data
  const campaigns: Campaign[] = [
    {
      id: 1,
      name: 'Summer Vibes 2024',
      description: 'Promote summer collection across social platforms',
      status: 'active',
      budget: '$15,000',
      influencers: 12,
      startDate: '2024-03-01',
      endDate: '2024-06-30',
      platforms: ['Instagram', 'TikTok', 'YouTube'],
      reach: '245K',
      engagement: '4.8%',
      progress: 75,
    },
    {
      id: 2,
      name: 'Product Launch - Nova Series',
      description: 'Launch new product line with influencer partnerships',
      status: 'draft',
      budget: '$25,000',
      influencers: 8,
      startDate: '2024-04-01',
      endDate: '2024-05-31',
      platforms: ['Instagram', 'Twitter', 'LinkedIn'],
      reach: '0',
      engagement: '0%',
      progress: 30,
    },
    {
      id: 3,
      name: 'Back to School Campaign',
      description: 'Target students and parents for school supplies',
      status: 'completed',
      budget: '$12,000',
      influencers: 15,
      startDate: '2023-08-01',
      endDate: '2023-09-15',
      platforms: ['Instagram', 'Facebook', 'TikTok'],
      reach: '312K',
      engagement: '5.2%',
      progress: 100,
    },
    {
      id: 4,
      name: 'Holiday Special',
      description: 'Festive promotions and holiday shopping',
      status: 'paused',
      budget: '$18,000',
      influencers: 10,
      startDate: '2024-11-15',
      endDate: '2024-12-31',
      platforms: ['Instagram', 'YouTube', 'Pinterest'],
      reach: '0',
      engagement: '0%',
      progress: 20,
    },
    {
      id: 5,
      name: 'Brand Awareness Q2',
      description: 'Increase brand visibility and recognition',
      status: 'active',
      budget: '$20,000',
      influencers: 20,
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      platforms: ['Instagram', 'Twitter', 'LinkedIn', 'YouTube'],
      reach: '156K',
      engagement: '3.9%',
      progress: 50,
    },
  ];

  const statusConfig = {
    draft: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    paused: { color: 'bg-blue-100 text-blue-800', icon: PauseCircle },
    completed: { color: 'bg-secondary-100 text-secondary-800', icon: CheckCircle },
    cancelled: { color: 'bg-error-100 text-error-800', icon: XCircle },
  };

  const platformIcons = {
    Instagram: Instagram,
    Twitter: Twitter,
    YouTube: Youtube,
    TikTok: Instagram,
    LinkedIn: Instagram,
    Facebook: Instagram,
    Pinterest: Instagram,
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: CampaignStatus) => {
    const Icon = statusConfig[status].icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Campaigns</h1>
          <p className="text-secondary-600 mt-2">Manage and track your influencer marketing campaigns</p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Campaigns', value: '8', icon: Target, color: 'from-primary-600 to-primary-700' },
          { title: 'Active Campaigns', value: '3', icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
          { title: 'Total Budget', value: '$90K', icon: DollarSign, color: 'from-blue-500 to-cyan-600' },
          { title: 'Total Influencers', value: '65', icon: Users, color: 'from-purple-500 to-pink-600' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
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

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')}
                  className="px-3 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-secondary-900">{campaign.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${statusConfig[campaign.status].color}`}>
                      {getStatusIcon(campaign.status)}
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-secondary-600 mb-4">{campaign.description}</p>
                  
                  {/* Campaign Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 border border-secondary-200 rounded-lg">
                      <DollarSign className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                      <div className="font-semibold text-secondary-900">{campaign.budget}</div>
                      <div className="text-xs text-secondary-600">Budget</div>
                    </div>
                    <div className="text-center p-3 border border-secondary-200 rounded-lg">
                      <Users className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                      <div className="font-semibold text-secondary-900">{campaign.influencers}</div>
                      <div className="text-xs text-secondary-600">Influencers</div>
                    </div>
                    <div className="text-center p-3 border border-secondary-200 rounded-lg">
                      <Eye className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                      <div className="font-semibold text-secondary-900">{campaign.reach}</div>
                      <div className="text-xs text-secondary-600">Reach</div>
                    </div>
                    <div className="text-center p-3 border border-secondary-200 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                      <div className="font-semibold text-secondary-900">{campaign.engagement}</div>
                      <div className="text-xs text-secondary-600">Engagement</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-secondary-600">Progress</span>
                      <span className="font-semibold">{campaign.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Platforms */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm text-secondary-600">Platforms:</span>
                    <div className="flex items-center space-x-2">
                      {campaign.platforms.map((platform) => {
                        const PlatformIcon = platformIcons[platform as keyof typeof platformIcons] || Instagram;
                        return (
                          <div key={platform} className="flex items-center space-x-1 bg-secondary-100 px-2 py-1 rounded text-xs">
                            <PlatformIcon className="w-3 h-3" />
                            <span>{platform}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Dates */}
                  <div className="flex items-center justify-between text-sm text-secondary-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{campaign.startDate} → {campaign.endDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="outline">Edit</Button>
                  {campaign.status === 'draft' && (
                    <Button size="sm" className="bg-gradient-to-r from-primary-600 to-primary-700">
                      Launch
                    </Button>
                  )}
                </div>
                <button className="p-2 hover:bg-secondary-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-secondary-600" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Campaign CTA */}
      {filteredCampaigns.length === 0 && (
        <Card className="border-2 border-dashed border-secondary-300">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-secondary-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No campaigns found</h3>
            <p className="text-secondary-600 mb-6">Create your first campaign to start working with influencers</p>
            <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Set Clear Goals',
                description: 'Define specific, measurable objectives for your campaign before starting.',
                icon: Target,
              },
              {
                title: 'Choose Relevant Influencers',
                description: 'Select influencers whose audience matches your target demographic.',
                icon: Users,
              },
              {
                title: 'Track Performance',
                description: 'Monitor engagement rates and ROI to optimize future campaigns.',
                icon: TrendingUp,
              },
            ].map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="p-4 border border-secondary-200 rounded-lg">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-secondary-900 mb-2">{tip.title}</h4>
                  <p className="text-secondary-600 text-sm">{tip.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}