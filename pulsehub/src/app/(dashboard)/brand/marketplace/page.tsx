// src/app/(dashboard)/brand/marketplace/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search,
  Filter,
  Users,
  Star,
  MapPin,
  Instagram,
  Youtube,
  
  Twitter,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Eye,
  Heart,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';
import { useState } from 'react';

interface Influencer {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  niche: string[];
  location: string;
  followers: string;
  engagementRate: string;
  trustScore: number;
  verified: boolean;
  platforms: string[];
  priceRange: string;
  tags: string[];
  featured: boolean;
}

export default function BrandMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [minFollowers, setMinFollowers] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'relevance' | 'followers' | 'engagement' | 'price'>('relevance');

  // Mock influencers data
  const influencers: Influencer[] = [
    {
      id: 1,
      name: 'Sarah Chen',
      handle: '@sarahchen',
      avatar: 'SC',
      niche: ['Lifestyle', 'Fashion', 'Travel'],
      location: 'Los Angeles, CA',
      followers: '125K',
      engagementRate: '4.8%',
      trustScore: 92,
      verified: true,
      platforms: ['Instagram', 'YouTube'],
      priceRange: '$1,000 - $3,000',
      tags: ['High Engagement', 'Premium', 'US Based'],
      featured: true,
    },
    {
      id: 2,
      name: 'Mike Rossi',
      handle: '@miketravels',
      avatar: 'MR',
      niche: ['Travel', 'Adventure', 'Photography'],
      location: 'Miami, FL',
      followers: '450K',
      engagementRate: '6.2%',
      trustScore: 88,
      verified: true,
      platforms: ['YouTube', 'Instagram', 'TikTok'],
      priceRange: '$3,000 - $8,000',
      tags: ['Video Expert', 'Global Reach', 'High Production'],
      featured: true,
    },
    {
      id: 3,
      name: 'Lena Beauty',
      handle: '@lenabeauty',
      avatar: 'LB',
      niche: ['Beauty', 'Skincare', 'Makeup'],
      location: 'New York, NY',
      followers: '2.1M',
      engagementRate: '3.9%',
      trustScore: 95,
      verified: true,
      platforms: ['TikTok', 'Instagram'],
      priceRange: '$10,000 - $25,000',
      tags: ['Mega Influencer', 'Brand Ambassador', 'Trend Setter'],
      featured: true,
    },
    {
      id: 4,
      name: 'TechGuru',
      handle: '@techguru',
      avatar: 'TG',
      niche: ['Technology', 'Gadgets', 'Reviews'],
      location: 'San Francisco, CA',
      followers: '850K',
      engagementRate: '5.4%',
      trustScore: 85,
      verified: true,
      platforms: ['YouTube', 'Twitter'],
      priceRange: '$5,000 - $12,000',
      tags: ['Tech Expert', 'Detailed Reviews', 'Male Audience'],
      featured: false,
    },
    {
      id: 5,
      name: 'FitnessFanatic',
      handle: '@fitfanatic',
      avatar: 'FF',
      niche: ['Fitness', 'Health', 'Nutrition'],
      location: 'Austin, TX',
      followers: '320K',
      engagementRate: '7.1%',
      trustScore: 90,
      verified: true,
      platforms: ['Instagram', 'TikTok'],
      priceRange: '$2,000 - $5,000',
      tags: ['High Engagement', 'Active Community', 'Certified Trainer'],
      featured: false,
    },
    {
      id: 6,
      name: 'FoodieExplorer',
      handle: '@foodexplorer',
      avatar: 'FE',
      niche: ['Food', 'Restaurants', 'Recipes'],
      location: 'Chicago, IL',
      followers: '180K',
      engagementRate: '5.8%',
      trustScore: 87,
      verified: false,
      platforms: ['Instagram', 'YouTube'],
      priceRange: '$800 - $2,500',
      tags: ['Local Influence', 'Recipe Developer', 'Restaurant Reviews'],
      featured: false,
    },
  ];

  const niches = ['all', 'Lifestyle', 'Fashion', 'Travel', 'Beauty', 'Technology', 'Fitness', 'Food'];

  const filteredInfluencers = influencers.filter(influencer => {
    // Search filter
    const matchesSearch = influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         influencer.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         influencer.niche.some(n => n.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Niche filter
    const matchesNiche = selectedNiche === 'all' || influencer.niche.includes(selectedNiche);
    
    // Followers filter
    const followersNum = parseInt(influencer.followers.replace('K', '000').replace('M', '000000'));
    const matchesFollowers = !minFollowers || followersNum >= parseInt(minFollowers) * 1000;
    
    // Price filter
    const priceMin = parseInt(influencer.priceRange.split(' - ')[0].replace('$', '').replace(',', ''));
    const matchesPrice = !maxPrice || priceMin <= parseInt(maxPrice);
    
    return matchesSearch && matchesNiche && matchesFollowers && matchesPrice;
  });

  // Sort influencers
  const sortedInfluencers = [...filteredInfluencers].sort((a, b) => {
    switch (sortBy) {
      case 'followers':
        return parseInt(b.followers.replace('K', '000').replace('M', '000000')) - 
               parseInt(a.followers.replace('K', '000').replace('M', '000000'));
      case 'engagement':
        return parseFloat(b.engagementRate) - parseFloat(a.engagementRate);
      case 'price':
        const priceA = parseInt(a.priceRange.split(' - ')[0].replace('$', '').replace(',', ''));
        const priceB = parseInt(b.priceRange.split(' - ')[0].replace('$', '').replace(',', ''));
        return priceA - priceB;
      default:
        return a.featured === b.featured ? 0 : a.featured ? -1 : 1;
    }
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      
      case 'twitter':
        return <Twitter className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Influencer Marketplace</h1>
          <p className="text-secondary-600 mt-2">Discover and connect with verified influencers for your campaigns</p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
          <Users className="w-4 h-4 mr-2" />
          Saved Influencers (12)
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Influencers', value: '1,245', icon: Users, color: 'from-primary-600 to-primary-700' },
          { title: 'Avg Engagement Rate', value: '4.8%', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
          { title: 'Verified Creators', value: '892', icon: CheckCircle, color: 'from-blue-500 to-cyan-600' },
          { title: 'Avg Campaign Price', value: '$3,200', icon: DollarSign, color: 'from-purple-500 to-pink-600' },
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

      {/* Filters Section */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Search Influencers</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <Input
                  type="text"
                  placeholder="Name, handle, or niche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Niche Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Niche</label>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
              >
                {niches.map((niche) => (
                  <option key={niche} value={niche}>
                    {niche === 'all' ? 'All Niches' : niche}
                  </option>
                ))}
              </select>
            </div>

            {/* Followers Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Min Followers</label>
              <select
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
              >
                <option value="">Any</option>
                <option value="10">10K+</option>
                <option value="50">50K+</option>
                <option value="100">100K+</option>
                <option value="500">500K+</option>
                <option value="1000">1M+</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Max Budget</label>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
              >
                <option value="">Any Budget</option>
                <option value="1000">Under $1,000</option>
                <option value="5000">Under $5,000</option>
                <option value="10000">Under $10,000</option>
                <option value="25000">Under $25,000</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-secondary-200">
            <div className="flex items-center space-x-4">
              <span className="text-secondary-600">Sort by:</span>
              <div className="flex items-center space-x-2">
                {[
                  { value: 'relevance', label: 'Relevance' },
                  { value: 'followers', label: 'Followers' },
                  { value: 'engagement', label: 'Engagement' },
                  { value: 'price', label: 'Price' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`px-4 py-2 rounded-lg transition ${
                      sortBy === option.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Influencers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedInfluencers.map((influencer) => (
          <Card key={influencer.id} className={`card-hover ${influencer.featured ? 'border-2 border-primary-500' : ''}`}>
            <CardContent className="p-6">
              {/* Influencer Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                    influencer.featured 
                      ? 'bg-gradient-to-r from-primary-600 to-pink-600' 
                      : 'bg-gradient-to-r from-primary-500 to-primary-700'
                  }`}>
                    {influencer.avatar}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-secondary-900">{influencer.name}</h3>
                      {influencer.verified && (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      )}
                      {influencer.featured && (
                        <span className="px-2 py-1 bg-gradient-to-r from-primary-600 to-pink-600 text-white text-xs rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-secondary-600">{influencer.handle}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-secondary-100 rounded-lg">
                  <Star className="w-5 h-5 text-secondary-400 hover:text-yellow-500" />
                </button>
              </div>

              {/* Niche and Location */}
              <div className="flex flex-wrap gap-2 mb-4">
                {influencer.niche.map((n) => (
                  <span
                    key={n}
                    className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                  >
                    {n}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center text-sm text-secondary-600 mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                {influencer.location}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 border border-secondary-200 rounded-lg">
                  <div className="text-xl font-bold text-secondary-900">{influencer.followers}</div>
                  <div className="text-sm text-secondary-600">Followers</div>
                </div>
                <div className="text-center p-3 border border-secondary-200 rounded-lg">
                  <div className="text-xl font-bold text-secondary-900">{influencer.engagementRate}</div>
                  <div className="text-sm text-secondary-600">Engagement</div>
                </div>
              </div>

              {/* Trust Score */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Trust Score</span>
                  <span className="font-semibold">{influencer.trustScore}/100</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      influencer.trustScore >= 90 ? 'bg-green-500' :
                      influencer.trustScore >= 80 ? 'bg-primary-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${influencer.trustScore}%` }}
                  />
                </div>
              </div>

              {/* Platforms */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-secondary-600">Platforms:</span>
                <div className="flex items-center space-x-2">
                  {influencer.platforms.map((platform) => (
                    <div key={platform} className="p-2 bg-secondary-100 rounded">
                      {getPlatformIcon(platform)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Price Range:</span>
                  <span className="font-bold text-secondary-900">{influencer.priceRange}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {influencer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <Button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button variant="outline" className="flex-1">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedInfluencers.length === 0 && (
        <Card className="border-2 border-dashed border-secondary-300">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No influencers found</h3>
            <p className="text-secondary-600 mb-6">
              Try adjusting your filters or search criteria to find matching influencers
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedNiche('all');
                setMinFollowers('');
                setMaxPrice('');
              }}
              variant="outline"
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Marketplace Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Finding the Right Influencer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Check Engagement Rate',
                description: 'Look for influencers with engagement rates above 3% for better ROI.',
                icon: Heart,
              },
              {
                title: 'Review Past Collaborations',
                description: 'Examine their previous brand partnerships for content quality.',
                icon: Eye,
              },
              {
                title: 'Verify Audience Authenticity',
                description: 'Use our trust score to ensure genuine follower base.',
                icon: CheckCircle,
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