'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Search, Users, Star, MapPin,
  Instagram, Youtube, Twitter, CheckCircle,
  MessageSquare, TrendingUp, DollarSign, SlidersHorizontal
} from 'lucide-react';
import { MarketplaceService } from '@/services/marketplace.service';
import { InfluencerListing, REACH_TIER_LABELS, REACH_TIER_ORDER, ReachTier } from '@/types/influencer';

export default function BrandMarketplacePage() {
  const params = useParams();
  const uid = params.uid as string;

  const [influencers, setInfluencers] = useState<InfluencerListing[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedReachTier, setSelectedReachTier] = useState<ReachTier | 'all'>('all');
  const [minFollowers, setMinFollowers] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'followers' | 'engagement' | 'price'>('relevance');
  const [loading, setLoading] = useState(true);

  const niches = ['all', 'Lifestyle', 'Fashion', 'Travel', 'Beauty', 'Technology', 'Fitness', 'Food'];

  useEffect(() => {
    const load = async () => {
      const [data, marketplaceStats] = await Promise.all([
        MarketplaceService.searchInfluencers({ search: searchQuery, niche: selectedNiche, reachTier: selectedReachTier, sortBy }),
        MarketplaceService.getMarketplaceStats(),
      ]);
      setInfluencers(data);
      setStats(marketplaceStats);
      setLoading(false);
    };
    load();
  }, [searchQuery, selectedNiche, selectedReachTier, sortBy]);

  useEffect(() => {
    const refetch = async () => {
      const data = await MarketplaceService.searchInfluencers({
        search: searchQuery,
        niche: selectedNiche,
        reachTier: selectedReachTier,
        minFollowers: minFollowers ? Number(minFollowers) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy,
      });
      setInfluencers(data);
    };
    refetch();
  }, [minFollowers, maxPrice]);

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, any> = {
      instagram: Instagram, youtube: Youtube, twitter: Twitter, tiktok: Instagram, linkedin: Instagram,
    };
    const Icon = icons[platform.toLowerCase()];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading marketplace...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Influencer Marketplace</h1>
          <p className="text-secondary-600 mt-2">Discover and connect with verified influencers for your campaigns</p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
          <Users className="w-4 h-4 mr-2" />
          Saved Influencers ({influencers.filter(i => i.featured).length})
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Influencers', value: String(stats?.totalInfluencers || 0), icon: Users, color: 'from-primary-600 to-primary-700' },
          { title: 'Avg Engagement Rate', value: `${(stats?.avgEngagementRate || 0).toFixed(1)}%`, icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
          { title: 'Verified Creators', value: String(stats?.verifiedCreators || 0), icon: CheckCircle, color: 'from-blue-500 to-cyan-600' },
          { title: 'Avg Campaign Price', value: `$${stats?.avgCampaignPrice || 3200}`, icon: DollarSign, color: 'from-primary-500 to-accent-600' },
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

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Search Influencers</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Name, handle, or niche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Niche</label>
              <select value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none">
                {niches.map((n) => <option key={n} value={n}>{n === 'all' ? 'All Niches' : n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Reach Tier</label>
              <select value={selectedReachTier} onChange={(e) => setSelectedReachTier(e.target.value as ReachTier | 'all')}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none">
                <option value="all">All Tiers</option>
                {REACH_TIER_ORDER.map((tier) => (
                  <option key={tier} value={tier}>{REACH_TIER_LABELS[tier]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Min Followers</label>
              <select value={minFollowers} onChange={(e) => setMinFollowers(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none">
                <option value="">Any</option>
                <option value="10">10K+</option>
                <option value="50">50K+</option>
                <option value="100">100K+</option>
                <option value="500">500K+</option>
                <option value="1000">1M+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Max Budget</label>
              <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none">
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
                  <button key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={`px-4 py-2 rounded-lg transition ${
                      sortBy === option.value ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}>{option.label}</button>
                ))}
              </div>
            </div>
            <Button variant="outline"><SlidersHorizontal className="w-4 h-4 mr-2" />Advanced Filters</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {influencers.map((inf) => (
          <Card key={inf.id} className={`card-hover ${inf.featured ? 'border-2 border-primary-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                    inf.featured ? 'bg-gradient-to-r from-primary-600 to-accent-600' : 'bg-gradient-to-r from-primary-500 to-primary-700'
                  }`}>{inf.displayName.charAt(0)}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-secondary-900">{inf.displayName}</h3>
                      {inf.isVerified && <CheckCircle className="w-5 h-5 text-primary-600" />}
                      {inf.featured && <span className="px-2 py-1 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-xs rounded-lg">Featured</span>}
                    </div>
                    <p className="text-secondary-600">@{inf.displayName.toLowerCase().replace(/\s/g, '')}</p>
                    {inf.reachTier && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-medium rounded">
                        {REACH_TIER_LABELS[inf.reachTier]}
                      </span>
                    )}
                  </div>
                </div>
                <button className="p-2 hover:bg-secondary-100 rounded-lg">
                  <Star className="w-5 h-5 text-secondary-400 hover:text-yellow-500" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {inf.niche.map((n) => (
                  <span key={n} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-lg">{n}</span>
                ))}
              </div>

              <div className="flex items-center text-sm text-secondary-600 mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                {inf.location}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 border border-secondary-200 rounded-lg">
                  <div className="text-xl font-bold text-secondary-900">{inf.followersCount >= 1000 ? `${(inf.followersCount / 1000).toFixed(0)}K` : inf.followersCount}</div>
                  <div className="text-sm text-secondary-600">Followers</div>
                </div>
                <div className="text-center p-3 border border-secondary-200 rounded-lg">
                  <div className="text-xl font-bold text-secondary-900">{inf.engagementRate.toFixed(1)}%</div>
                  <div className="text-sm text-secondary-600">Engagement</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Trust Score</span>
                  <span className="font-semibold">{inf.trustScore}/100</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${inf.trustScore >= 90 ? 'bg-green-500' : inf.trustScore >= 80 ? 'bg-primary-500' : 'bg-yellow-500'}`}
                    style={{ width: `${inf.trustScore}%` }} />
                </div>
              </div>

              {inf.priceRange && (
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-600">Price Range:</span>
                    <span className="font-bold text-secondary-900">${inf.priceRange.min.toLocaleString()} - ${inf.priceRange.max.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Button className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button variant="outline" className="flex-1">View Profile</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {influencers.length === 0 && (
        <Card className="border-2 border-dashed border-secondary-300">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No influencers found</h3>
            <p className="text-secondary-600 mb-6">Try adjusting your filters or search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
