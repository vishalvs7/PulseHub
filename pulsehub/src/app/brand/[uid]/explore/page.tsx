'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Search, Users, Star, MapPin, CheckCircle,
  MessageSquare, SlidersHorizontal,
  X, Eye, BadgeCheck
} from 'lucide-react';
import { ExploreService } from '@/services/explore.service';
import type { ExploreInfluencer } from '@/services/explore.service';
import { REACH_TIER_LABELS, REACH_TIER_ORDER, ReachTier } from '@/types/influencer';
import { PLATFORM_CONFIGS } from '@/lib/socialPlatforms';

export default function BrandExplorePage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;

  const [influencers, setInfluencers] = useState<ExploreInfluencer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedReachTier, setSelectedReachTier] = useState<ReachTier | 'all'>('all');
  const [minFollowers, setMinFollowers] = useState('');
  const [minViews, setMinViews] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'followers' | 'views' | 'engagement' | 'price'>('followers');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<ExploreInfluencer | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);

  const niches = ['all', 'Lifestyle', 'Fashion', 'Travel', 'Beauty', 'Technology', 'Fitness', 'Food'];

  const load = useCallback(async () => {
    const data = await ExploreService.searchInfluencers({
      search: searchQuery || undefined,
      niche: selectedNiche,
      reachTier: selectedReachTier,
      minFollowers: minFollowers ? Number(minFollowers) : undefined,
      minViews: minViews ? Number(minViews) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
    });
    setInfluencers(data);
    setLoading(false);
  }, [searchQuery, selectedNiche, selectedReachTier, minFollowers, minViews, maxPrice, sortBy]);

  useEffect(() => {
    load();
  }, [load]);

  const startConversation = async (influencer: ExploreInfluencer) => {
    setMessagingId(influencer.id);
    try {
      const res = await fetch('/api/messaging/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: influencer.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to start conversation');
      router.push(`/brand/${uid}/deals?conv=${json.conversationId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setMessagingId(null);
    }
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading influencers...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Explore Influencers</h1>
        <p className="text-secondary-600 mt-2">Search, filter and message creators on PulseHub.</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search by name, niche, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
            />
          </div>

          {/* Filter row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Niche</label>
              <select value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:border-primary-500 outline-none">
                {niches.map((n) => <option key={n} value={n}>{n === 'all' ? 'All Niches' : n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Reach Tier</label>
              <select value={selectedReachTier} onChange={(e) => setSelectedReachTier(e.target.value as ReachTier | 'all')}
                className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:border-primary-500 outline-none">
                <option value="all">All Tiers</option>
                {REACH_TIER_ORDER.map((tier) => (
                  <option key={tier} value={tier}>{REACH_TIER_LABELS[tier]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Min Followers</label>
              <select value={minFollowers} onChange={(e) => setMinFollowers(e.target.value)}
                className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:border-primary-500 outline-none">
                <option value="">Any</option>
                <option value="10000">10K+</option>
                <option value="50000">50K+</option>
                <option value="100000">100K+</option>
                <option value="500000">500K+</option>
                <option value="1000000">1M+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Min Views</label>
              <select value={minViews} onChange={(e) => setMinViews(e.target.value)}
                className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:border-primary-500 outline-none">
                <option value="">Any</option>
                <option value="10000">10K+</option>
                <option value="100000">100K+</option>
                <option value="500000">500K+</option>
                <option value="1000000">1M+</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-600">Sort by:</span>
              <div className="flex items-center space-x-2">
                {[
                  { value: 'followers', label: 'Followers' },
                  { value: 'views', label: 'Views' },
                  { value: 'engagement', label: 'Engagement' },
                  { value: 'price', label: 'Price' },
                ].map((option) => (
                  <button key={option.value}
                    onClick={() => setSortBy(option.value as typeof sortBy)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      sortBy === option.value ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}>{option.label}</button>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-4 h-4 mr-2" />Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-secondary-200">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Max Budget</label>
                <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2.5 border border-secondary-300 rounded-lg text-sm focus:border-primary-500 outline-none">
                  <option value="">Any Budget</option>
                  <option value="1000">Under $1,000</option>
                  <option value="5000">Under $5,000</option>
                  <option value="10000">Under $10,000</option>
                  <option value="25000">Under $25,000</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {influencers.map((inf) => (
          <Card key={inf.id} className={`card-hover ${inf.featured ? 'border-2 border-primary-500' : ''}`}>
            <CardContent className="p-6">
              <button className="w-full text-left" onClick={() => setSelectedProfile(inf)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {inf.photoURL ? (
                      <img src={inf.photoURL} alt={inf.displayName} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                        inf.featured ? 'bg-gradient-to-r from-primary-600 to-accent-600' : 'bg-gradient-to-r from-primary-500 to-primary-700'
                      }`}>{inf.displayName.charAt(0)}</div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-secondary-900">{inf.displayName}</h3>
                        {inf.isVerified && <BadgeCheck className="w-5 h-5 text-primary-600" />}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-medium rounded">
                        {REACH_TIER_LABELS[inf.reachTier]}
                      </span>
                    </div>
                  </div>
                  <Star className="w-5 h-5 text-secondary-400 hover:text-yellow-500" />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {inf.niche.map((n) => (
                    <span key={n} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-lg">{n}</span>
                  ))}
                </div>

                <div className="flex items-center text-sm text-secondary-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" /> {inf.location}
                </div>
              </button>

              {/* Platform chips with followers */}
              <div className="space-y-2 mb-4">
                {inf.platforms.map((p) => {
                  const cfg = PLATFORM_CONFIGS[p.platform as keyof typeof PLATFORM_CONFIGS];
                  return (
                    <div key={p.platform} className="flex items-center justify-between px-3 py-2 bg-secondary-50 rounded-lg">
                      <span className="flex items-center space-x-2">
                        <span className={`w-6 h-6 ${cfg ? `bg-gradient-to-r ${cfg.color}` : 'bg-secondary-400'} rounded flex items-center justify-center text-white text-[10px] font-bold`}>
                          {cfg ? cfg.icon : p.platform.slice(0, 2)}
                        </span>
                        <span className="text-sm font-medium text-secondary-800 capitalize">{p.platform}</span>
                      </span>
                      <span className="text-sm font-semibold text-secondary-900">{formatCount(p.followers || 0)}</span>
                    </div>
                  );
                })}
                {inf.platforms.length === 0 && (
                  <p className="text-sm text-secondary-500">No connected platforms yet</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 border border-secondary-200 rounded-lg">
                  <div className="text-lg font-bold text-secondary-900">{formatCount(inf.followersCount)}</div>
                  <div className="text-xs text-secondary-600">Followers</div>
                </div>
                <div className="text-center p-2 border border-secondary-200 rounded-lg">
                  <div className="text-lg font-bold text-secondary-900">{inf.engagementRate.toFixed(1)}%</div>
                  <div className="text-xs text-secondary-600">Engagement</div>
                </div>
                <div className="text-center p-2 border border-secondary-200 rounded-lg">
                  <div className="text-lg font-bold text-secondary-900">{formatCount(inf.totalViews)}</div>
                  <div className="text-xs text-secondary-600">Views</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Price / Post</span>
                  <span className="font-bold text-secondary-900">${inf.priceRange.min.toLocaleString()} - ${inf.priceRange.max.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700"
                  onClick={() => startConversation(inf)}
                  loading={messagingId === inf.id}
                  disabled={messagingId !== null}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Now
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedProfile(inf)}>
                  View Profile
                </Button>
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

      {/* Profile modal */}
      {selectedProfile && (
        <ProfileModal
          influencer={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onMessage={() => startConversation(selectedProfile)}
          messaging={messagingId === selectedProfile.id}
        />
      )}
    </div>
  );
}

function ProfileModal({
  influencer,
  onClose,
  onMessage,
  messaging,
}: {
  influencer: ExploreInfluencer;
  onClose: () => void;
  onMessage: () => void;
  messaging: boolean;
}) {
  const formatCount = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-secondary-100">
          <div className="flex items-center space-x-4">
            {influencer.photoURL ? (
              <img src={influencer.photoURL} alt={influencer.displayName} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                influencer.featured ? 'bg-gradient-to-r from-primary-600 to-accent-600' : 'bg-gradient-to-r from-primary-500 to-primary-700'
              }`}>{influencer.displayName.charAt(0)}</div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-secondary-900">{influencer.displayName}</h2>
                {influencer.isVerified && <CheckCircle className="w-5 h-5 text-primary-600" />}
              </div>
              <span className="inline-block mt-1 px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-medium rounded">
                {REACH_TIER_LABELS[influencer.reachTier]} Creator
              </span>
              <p className="text-sm text-secondary-500 mt-1 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{influencer.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg">
            <X className="w-5 h-5 text-secondary-600" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {influencer.bio && (
            <p className="text-secondary-700">{influencer.bio}</p>
          )}

          <div>
            <span className="text-sm font-medium text-secondary-700">Niches</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {influencer.niche.map((n) => (
                <span key={n} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-lg">{n}</span>
              ))}
            </div>
          </div>

          {/* Per-platform analytics */}
          <div>
            <span className="text-sm font-medium text-secondary-700">Platforms & Analytics</span>
            <div className="space-y-2 mt-2">
              {influencer.platforms.map((p) => {
                const cfg = PLATFORM_CONFIGS[p.platform as keyof typeof PLATFORM_CONFIGS];
                return (
                  <div key={p.platform} className="flex items-center justify-between px-3 py-2 bg-secondary-50 rounded-lg">
                    <span className="flex items-center space-x-2">
                      <span className={`w-6 h-6 ${cfg ? `bg-gradient-to-r ${cfg.color}` : 'bg-secondary-400'} rounded flex items-center justify-center text-white text-[10px] font-bold`}>
                        {cfg ? cfg.icon : p.platform.slice(0, 2)}
                      </span>
                      <span className="text-sm font-medium text-secondary-800 capitalize">{p.platform}</span>
                    </span>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center text-secondary-600"><Users className="w-3.5 h-3.5 mr-1" />{formatCount(p.followers || 0)}</span>
                      <span className="flex items-center text-secondary-600"><Eye className="w-3.5 h-3.5 mr-1" />{formatCount(p.views || 0)}</span>
                      {p.engagementRate != null && (
                        <span className="text-secondary-600">{p.engagementRate.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {influencer.platforms.length === 0 && <p className="text-sm text-secondary-500">No connected platforms yet</p>}
            </div>
          </div>

          {/* Rates */}
          <div>
            <span className="text-sm font-medium text-secondary-700">Pricing</span>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 border border-secondary-200 rounded-lg text-center">
                <div className="text-lg font-bold text-secondary-900">${influencer.priceRange.min.toLocaleString()} - ${influencer.priceRange.max.toLocaleString()}</div>
                <div className="text-xs text-secondary-600">Per Post</div>
              </div>
              <div className="p-3 border border-secondary-200 rounded-lg text-center">
                <div className="text-lg font-bold text-secondary-900">${Math.round(influencer.priceRange.max * 1.3).toLocaleString()}</div>
                <div className="text-xs text-secondary-600">Per Reel / Video</div>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 border border-secondary-200 rounded-lg">
              <div className="text-xl font-bold text-secondary-900">{formatCount(influencer.followersCount)}</div>
              <div className="text-xs text-secondary-600">Total Followers</div>
            </div>
            <div className="text-center p-3 border border-secondary-200 rounded-lg">
              <div className="text-xl font-bold text-secondary-900">{influencer.engagementRate.toFixed(1)}%</div>
              <div className="text-xs text-secondary-600">Engagement</div>
            </div>
            <div className="text-center p-3 border border-secondary-200 rounded-lg">
              <div className="text-xl font-bold text-secondary-900">{influencer.trustScore}/100</div>
              <div className="text-xs text-secondary-600">Trust Score</div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-6 pt-4 border-t border-secondary-100">
          <Button className="w-full bg-gradient-to-r from-primary-600 to-primary-700" onClick={onMessage} loading={messaging} disabled={messaging}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Message {influencer.displayName}
          </Button>
        </div>
      </div>
    </div>
  );
}
