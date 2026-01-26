// src/app/(dashboard)/influencer/marketplace/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search,
  Filter,
  Building,
  DollarSign,
  Calendar,
  Target,
  Users,
  Eye,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  MapPin,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface CollaborationOpportunity {
  id: number;
  brand: string;
  brandLogo: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  platforms: string[];
  requiredFollowers: string;
  engagementRate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  matchScore: number;
  tags: string[];
  posted: string;
}

export default function CollaborationOpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [minBudget, setMinBudget] = useState<string>('');

  // Collaboration opportunities
  const opportunities: CollaborationOpportunity[] = [
    {
      id: 1,
      brand: 'TechNova',
      brandLogo: 'TN',
      title: 'Summer Product Launch Campaign',
      description: 'Looking for tech influencers to showcase our new smart home devices. Content includes unboxing, review, and tutorial videos.',
      budget: '$1,200 - $2,500',
      timeline: '2 weeks',
      platforms: ['Instagram', 'YouTube'],
      requiredFollowers: '50K+',
      engagementRate: '4%+',
      status: 'pending',
      matchScore: 92,
      tags: ['Tech', 'Gadgets', 'Review', 'Video'],
      posted: '2 days ago',
    },
    {
      id: 2,
      brand: 'FashionHub',
      brandLogo: 'FH',
      title: 'Spring Collection Promotion',
      description: 'Seeking fashion influencers to style and showcase our new spring collection. High-quality photos and reels required.',
      budget: '$800 - $1,500',
      timeline: '1 month',
      platforms: ['Instagram', 'TikTok'],
      requiredFollowers: '30K+',
      engagementRate: '5%+',
      status: 'accepted',
      matchScore: 88,
      tags: ['Fashion', 'Lifestyle', 'Style', 'Reels'],
      posted: '1 week ago',
    },
    {
      id: 3,
      brand: 'EcoLiving',
      brandLogo: 'EL',
      title: 'Sustainable Lifestyle Series',
      description: 'Creating a 3-part series on sustainable living. Need influencers passionate about eco-friendly products.',
      budget: '$2,000 - $3,500',
      timeline: '3 weeks',
      platforms: ['YouTube', 'Instagram'],
      requiredFollowers: '75K+',
      engagementRate: '3.5%+',
      status: 'pending',
      matchScore: 76,
      tags: ['Eco-Friendly', 'Sustainability', 'Lifestyle', 'Education'],
      posted: '3 days ago',
    },
    {
      id: 4,
      brand: 'FitLife',
      brandLogo: 'FL',
      title: 'Fitness App Launch',
      description: 'Promoting new fitness tracking app. Need fitness influencers to demonstrate features and benefits.',
      budget: '$1,500 - $2,800',
      timeline: '2 weeks',
      platforms: ['Instagram', 'TikTok', 'YouTube'],
      requiredFollowers: '100K+',
      engagementRate: '4.5%+',
      status: 'rejected',
      matchScore: 65,
      tags: ['Fitness', 'Health', 'App', 'Demo'],
      posted: '2 weeks ago',
    },
    {
      id: 5,
      brand: 'FoodieDelight',
      brandLogo: 'FD',
      title: 'Recipe Development Partnership',
      description: 'Long-term partnership for recipe development and cooking tutorials using our kitchen products.',
      budget: '$3,000 - $5,000',
      timeline: 'Ongoing',
      platforms: ['YouTube', 'Instagram'],
      requiredFollowers: '150K+',
      engagementRate: '6%+',
      status: 'completed',
      matchScore: 95,
      tags: ['Food', 'Cooking', 'Recipes', 'Partnership'],
      posted: '1 month ago',
    },
  ];

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { color: 'bg-error-100 text-error-800', icon: XCircle },
    completed: { color: 'bg-secondary-100 text-secondary-800', icon: CheckCircle },
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || opp.status === statusFilter;
    const budgetMin = parseInt(opp.budget.split(' - ')[0].replace('$', '').replace(',', ''));
    const matchesBudget = !minBudget || budgetMin >= parseInt(minBudget);
    
    return matchesSearch && matchesStatus && matchesBudget;
  });

  const getStatusIcon = (status: keyof typeof statusConfig) => {
    const Icon = statusConfig[status].icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Collaboration Opportunities</h1>
          <p className="text-secondary-600 mt-2">Discover and manage brand collaboration opportunities</p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
          <Zap className="w-4 h-4 mr-2" />
          Boost Profile Visibility
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Opportunities', value: '24', icon: Target, color: 'from-primary-600 to-primary-700' },
          { title: 'Pending Responses', value: '8', icon: Clock, color: 'from-yellow-500 to-orange-600' },
          { title: 'Active Collaborations', value: '5', icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
          { title: 'Total Earnings', value: '$12.5K', icon: DollarSign, color: 'from-blue-500 to-cyan-600' },
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

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Search Opportunities</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <Input
                  type="text"
                  placeholder="Brand, title, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Minimum Budget */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Minimum Budget</label>
              <select
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
              >
                <option value="">Any Budget</option>
                <option value="500">$500+</option>
                <option value="1000">$1,000+</option>
                <option value="2000">$2,000+</option>
                <option value="5000">$5,000+</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOpportunities.map((opp) => {
          const StatusIcon = getStatusIcon(opp.status);
          return (
            <Card key={opp.id} className="card-hover">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {opp.brandLogo}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-secondary-900">{opp.brand}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${statusConfig[opp.status].color}`}>
                          {StatusIcon}
                          {opp.status.charAt(0).toUpperCase() + opp.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-secondary-600 mt-1">{opp.title}</p>
                    </div>
                  </div>
                  
                  {/* Match Score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-secondary-900">{opp.matchScore}%</div>
                    <div className="text-sm text-secondary-600">Match Score</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-secondary-700 mb-4 line-clamp-2">{opp.description}</p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 border border-secondary-200 rounded-lg">
                    <DollarSign className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                    <div className="font-semibold text-secondary-900">{opp.budget}</div>
                    <div className="text-xs text-secondary-600">Budget</div>
                  </div>
                  <div className="text-center p-3 border border-secondary-200 rounded-lg">
                    <Calendar className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                    <div className="font-semibold text-secondary-900">{opp.timeline}</div>
                    <div className="text-xs text-secondary-600">Timeline</div>
                  </div>
                  <div className="text-center p-3 border border-secondary-200 rounded-lg">
                    <Users className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                    <div className="font-semibold text-secondary-900">{opp.requiredFollowers}</div>
                    <div className="text-xs text-secondary-600">Followers</div>
                  </div>
                  <div className="text-center p-3 border border-secondary-200 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                    <div className="font-semibold text-secondary-900">{opp.engagementRate}</div>
                    <div className="text-xs text-secondary-600">Engagement</div>
                  </div>
                </div>

                {/* Platforms & Tags */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary-600">Platforms:</span>
                    <div className="flex flex-wrap gap-2">
                      {opp.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm rounded-full"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {opp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Posted & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                  <div className="text-sm text-secondary-600">
                    Posted: {opp.posted}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {opp.status === 'pending' && (
                      <>
                        <Button size="sm" className="bg-gradient-to-r from-primary-600 to-primary-700">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Respond
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </>
                    )}
                    {opp.status === 'accepted' && (
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message Brand
                      </Button>
                    )}
                    {opp.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        <Star className="w-4 h-4 mr-2" />
                        Leave Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredOpportunities.length === 0 && (
        <Card className="border-2 border-dashed border-secondary-300">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No opportunities found</h3>
            <p className="text-secondary-600 mb-6">
              Try adjusting your filters or boost your profile visibility to attract more brands
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
                <Zap className="w-4 h-4 mr-2" />
                Boost Profile
              </Button>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setMinBudget('');
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips for Getting More Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Getting More Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Optimize Your Profile',
                description: 'Complete all profile sections, add high-quality photos, and write a compelling bio.',
                icon: Star,
                action: 'Update Profile',
              },
              {
                title: 'Increase Engagement',
                description: 'Higher engagement rates attract more brands. Engage with your audience regularly.',
                icon: TrendingUp,
                action: 'View Analytics',
              },
              {
                title: 'Showcase Your Work',
                description: 'Add your best content to your portfolio. Brands want to see your content quality.',
                icon: Eye,
                action: 'Add to Portfolio',
              },
            ].map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="p-4 border border-secondary-200 rounded-lg">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-secondary-900 mb-2">{tip.title}</h4>
                  <p className="text-secondary-600 text-sm mb-4">{tip.description}</p>
                  <Button size="sm" variant="outline">
                    {tip.action}
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