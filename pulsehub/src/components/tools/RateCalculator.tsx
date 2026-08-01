'use client';

import { useMemo, useState } from 'react';
import { Calculator, TrendingUp, Users, Eye, DollarSign, ArrowRight } from 'lucide-react';

const NICHES: { value: string; label: string; multiplier: number; cpe: number }[] = [
  { value: 'beauty', label: 'Beauty & Skincare', multiplier: 1.4, cpe: 0.45 },
  { value: 'fashion', label: 'Fashion & Lifestyle', multiplier: 1.2, cpe: 0.4 },
  { value: 'tech', label: 'Technology & Gadgets', multiplier: 1.5, cpe: 0.5 },
  { value: 'finance', label: 'Finance & Investing', multiplier: 1.6, cpe: 0.55 },
  { value: 'gaming', label: 'Gaming', multiplier: 1.3, cpe: 0.4 },
  { value: 'fitness', label: 'Fitness & Health', multiplier: 1.1, cpe: 0.35 },
  { value: 'food', label: 'Food & Cooking', multiplier: 1.0, cpe: 0.3 },
  { value: 'travel', label: 'Travel', multiplier: 1.2, cpe: 0.35 },
  { value: 'education', label: 'Education & Learning', multiplier: 1.1, cpe: 0.3 },
  { value: 'parenting', label: 'Parenting & Family', multiplier: 1.0, cpe: 0.3 },
  { value: 'music', label: 'Music & Entertainment', multiplier: 1.1, cpe: 0.3 },
  { value: 'other', label: 'Other', multiplier: 1.0, cpe: 0.25 },
];

const PLATFORM_MULTIPLIER: Record<string, number> = {
  instagram: 1.0,
  tiktok: 0.9,
  youtube: 1.3,
};

interface InfluencerEstimate {
  low: number;
  high: number;
  reachPerPost: number;
  impressions: number;
  engagedFollowers: number;
  costPerEngaged: number;
  storyPrice: number;
}

function estimateInfluencer(
  followers: number,
  er: number,
  niche: { multiplier: number; cpe: number },
  platform: string
): InfluencerEstimate {
  const engaged = Math.round(followers * (er / 100));
  const costPerEngaged = niche.cpe * (PLATFORM_MULTIPLIER[platform] || 1);
  const mid = Math.round(engaged * costPerEngaged);
  const reachPerPost = Math.round(followers * (platform === 'youtube' ? 0.5 : 0.35));
  return {
    low: Math.round(mid * 0.8),
    high: Math.round(mid * 1.25),
    reachPerPost,
    impressions: Math.round(reachPerPost * 1.4),
    engagedFollowers: engaged,
    costPerEngaged,
    storyPrice: Math.round(mid * 0.5),
  };
}

function estimateBrand(budget: number): {
  impressions: number;
  reach: number;
  engagement: number;
  creatorsToBook: number;
  avgCpm: number;
} {
  const avgCpm = 12;
  const impressions = Math.round((budget / avgCpm) * 1000);
  const reach = Math.round(impressions * 0.7);
  const engagement = Math.round(reach * 0.035);
  const creatorsToBook = Math.max(1, Math.floor(budget / 800));
  return { impressions, reach, engagement, creatorsToBook, avgCpm };
}

export default function RateCalculator() {
  const [mode, setMode] = useState<'influencer' | 'brand'>('influencer');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [followers, setFollowers] = useState<number>(50000);
  const [engagementRate, setEngagementRate] = useState<number>(4);
  const [niche, setNiche] = useState<string>('tech');
  const [platform, setPlatform] = useState<string>('instagram');
  const [budget, setBudget] = useState<number>(150000);

  const INR_PER_USD = 83;
  const toDisplay = (usd: number) => (currency === 'INR' ? Math.round(usd * INR_PER_USD) : Math.round(usd));
  const money = (usd: number) =>
    currency === 'INR'
      ? '₹' + toDisplay(usd).toLocaleString('en-IN')
      : '$' + toDisplay(usd).toLocaleString('en-US');

  const influencer = useMemo(() => {
    const n = NICHES.find((x) => x.value === niche) || NICHES[0];
    return estimateInfluencer(followers || 0, engagementRate || 0, n, platform);
  }, [followers, engagementRate, niche, platform]);

  const brand = useMemo(() => {
    const budgetUSD = currency === 'INR' ? (budget || 0) / INR_PER_USD : budget || 0;
    return estimateBrand(budgetUSD);
  }, [budget, currency]);

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-primary-200 bg-white p-1 shadow-sm">
          {(['influencer', 'brand'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                mode === m ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'
              }`}
            >
              {m === 'influencer' ? "I'm a Creator" : "I'm a Brand"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-primary-200 bg-white p-1 shadow-sm">
          {(['INR', 'USD'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                currency === c ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'
              }`}
            >
              {c === 'INR' ? '₹ INR' : '$ USD'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-white rounded-lg border border-primary-100 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary-600" />
            Your Inputs
          </h3>

          {mode === 'influencer' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follower Count</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={followers}
                    onChange={(e) => setFollowers(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  />
                  <button
                    onClick={() => setFollowers(Math.round(followers / 1000) * 1000 + 1000)}
                    className="shrink-0 px-3 py-3 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100"
                    title="Quick add 1K"
                  >
                    +1K
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Engagement Rate (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={0.1}
                    value={engagementRate}
                    onChange={(e) => setEngagementRate(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                  <span className="w-12 text-right font-semibold text-primary-700">{engagementRate.toFixed(1)}%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niche</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                >
                  {NICHES.map((n) => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Budget ({currency === 'INR' ? '₹ INR' : '$ USD'})
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-gray-400">{currency === 'INR' ? '₹' : '$'}</span>
                <input
                  type="number"
                  min={0}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Based on an average blended CPM of ~$12 (≈₹1,000) across Instagram, TikTok and YouTube creator campaigns.
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {mode === 'influencer' ? (
            <>
              <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg p-8 text-white shadow-lg">
                <p className="text-sm text-white/80 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Estimated rate per post / Reel
                </p>
                <div className="text-4xl font-bold mb-1">
                  {money(influencer.low)} – {money(influencer.high)}
                </div>
                <p className="text-white/80 text-sm">
                  Engaged followers: {influencer.engagedFollowers.toLocaleString()} · {money(influencer.costPerEngaged)} per engaged
                </p>
                {currency === 'USD' && (
                  <p className="text-white/60 text-xs mt-2">
                    ≈ {money(influencer.low * INR_PER_USD)} – {money(influencer.high * INR_PER_USD)} INR
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Eye className="w-4 h-4" /> Est. reach / post
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{influencer.reachPerPost.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <TrendingUp className="w-4 h-4" /> Est. impressions
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{influencer.impressions.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Users className="w-4 h-4" /> Est. story rate
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{money(influencer.storyPrice)}</div>
                </div>
                <div className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Users className="w-4 h-4" /> Est. Reel/TikTok rate
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {money(Math.round((influencer.low + influencer.high) / 2) * 1.2)}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 bg-primary-50 border border-primary-100 rounded-lg p-4">
                Model: (followers × engagement rate) × niche cost-per-engaged-follower. Ranges are ±20% to account for
                audience quality, content format and seasonality. {currency === 'INR' ? 'INR figures are converted from a USD benchmark (₹83/USD); Indian-market rates can vary significantly by niche and region.' : 'Use these as a negotiation starting point, not a hard quote.'}
              </p>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg p-8 text-white shadow-lg">
                <p className="text-sm text-white/80 mb-2">Estimated campaign reach</p>
                <div className="text-4xl font-bold mb-1">{brand.reach.toLocaleString()}</div>
                <p className="text-white/80 text-sm">Impressions: {brand.impressions.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <TrendingUp className="w-4 h-4" /> Est. engagement
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{brand.engagement.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 mt-1">~3.5% blended engagement rate</p>
                </div>
                <div className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Users className="w-4 h-4" /> Creators to book
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{brand.creatorsToBook}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    ~{money(800)} avg creator rate
                  </p>
                </div>
                <div className="col-span-2 bg-white rounded-lg border border-primary-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 mb-3">
                    <ArrowRight className="w-4 h-4" /> Suggested creator mix
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between"><span>Nano creators (5K–50K)</span><span className="font-semibold">{Math.round(brand.creatorsToBook * 0.6)}</span></div>
                    <div className="flex justify-between"><span>Micro creators (50K–500K)</span><span className="font-semibold">{Math.round(brand.creatorsToBook * 0.3)}</span></div>
                    <div className="flex justify-between"><span>Mid creators (500K–1M+)</span><span className="font-semibold">{Math.max(1, Math.round(brand.creatorsToBook * 0.1))}</span></div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 bg-primary-50 border border-primary-100 rounded-lg p-4">
                Estimates use average industry benchmarks (blended CPM ~$12, 70% reach-to-impressions, ~3.5% engagement).
                Actual results vary by niche, creative quality and audience targeting.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
