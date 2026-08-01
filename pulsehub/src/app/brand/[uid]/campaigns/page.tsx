'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, Filter, Search, MoreVertical,
  Users, DollarSign, Calendar, Target,
  CheckCircle, Clock, PauseCircle, XCircle,
  Instagram, Twitter, Youtube, TrendingUp, Eye, MessageSquare
} from 'lucide-react';
import { BrandService } from '@/services/brand.service';
import type { Campaign } from '@/types/brand';

export default function BrandCampaignsPage() {
  const params = useParams();
  const uid = params.uid as string;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await BrandService.getCampaigns(uid);
      setCampaigns(data);
      setLoading(false);
    };
    load();
  }, [uid]);

  const statusConfig: Record<string, { color: string; icon: any }> = {
    draft: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    paused: { color: 'bg-blue-100 text-blue-800', icon: PauseCircle },
    completed: { color: 'bg-secondary-100 text-secondary-800', icon: CheckCircle },
    cancelled: { color: 'bg-error-100 text-error-800', icon: XCircle },
  };

  const filtered = campaigns.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((s, c) => s + Number(c.budget), 0);
  const totalInfluencers = campaigns.reduce((s, c) => s + c.targetInfluencers, 0);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Campaigns', value: String(campaigns.length), icon: Target, color: 'from-primary-600 to-primary-700' },
          { title: 'Active Campaigns', value: String(activeCount), icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
          { title: 'Total Budget', value: `$${(totalBudget / 1000).toFixed(0)}K`, icon: DollarSign, color: 'from-blue-500 to-cyan-600' },
          { title: 'Total Influencers', value: String(totalInfluencers), icon: Users, color: 'from-primary-500 to-accent-600' },
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
                  onChange={(e) => setStatusFilter(e.target.value)}
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
              <Button variant="outline"><Filter className="w-4 h-4 mr-2" />More Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((campaign) => {
          const StatusIcon = statusConfig[campaign.status]?.icon || Clock;
          return (
            <Card key={campaign.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-secondary-900">{campaign.name}</h3>
                      <span className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${statusConfig[campaign.status]?.color || ''}`}>
                        <StatusIcon className="w-4 h-4" />
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-secondary-600 mb-4">{campaign.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 border border-secondary-200 rounded-lg">
                        <DollarSign className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                        <div className="font-semibold text-secondary-900">${Number(campaign.budget).toLocaleString()}</div>
                        <div className="text-xs text-secondary-600">Budget</div>
                      </div>
                      <div className="text-center p-3 border border-secondary-200 rounded-lg">
                        <Users className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                        <div className="font-semibold text-secondary-900">{campaign.targetInfluencers}</div>
                        <div className="text-xs text-secondary-600">Influencers</div>
                      </div>
                      <div className="text-center p-3 border border-secondary-200 rounded-lg">
                        <Eye className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                        <div className="font-semibold text-secondary-900">{campaign.totalReach.toLocaleString()}</div>
                        <div className="text-xs text-secondary-600">Reach</div>
                      </div>
                      <div className="text-center p-3 border border-secondary-200 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-secondary-600 mx-auto mb-2" />
                        <div className="font-semibold text-secondary-900">{campaign.totalEngagement.toLocaleString()}</div>
                        <div className="text-xs text-secondary-600">Engagement</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-sm text-secondary-600">Platforms:</span>
                      <div className="flex items-center space-x-2">
                        {campaign.platforms.map((platform) => (
                          <div key={platform} className="flex items-center space-x-1 bg-secondary-100 px-2 py-1 rounded text-xs">
                            <span>{platform}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-secondary-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(campaign.startDate).toLocaleDateString()} → {new Date(campaign.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Edit</Button>
                    {campaign.status === 'draft' && (
                      <Button size="sm" className="bg-gradient-to-r from-primary-600 to-primary-700">Launch</Button>
                    )}
                  </div>
                  <button className="p-2 hover:bg-secondary-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-secondary-600" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
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
    </div>
  );
}
