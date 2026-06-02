// src/app/(dashboard)/influencer/connections/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Globe,
  RefreshCw,
  MoreVertical,
  AlertCircle,
  Zap,
  Users, 
  Eye,
} from 'lucide-react';
import { useState } from 'react';

interface SocialConnection {
  id: number;
  platform: string;
  username: string;
  followers: string;
  status: 'connected' | 'pending' | 'disconnected' | 'error';
  lastSynced: string;
  icon: any;
  color: string;
}

export default function InfluencerConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState<number | null>(null);

  // Social connections data
  const connections: SocialConnection[] = [
    {
      id: 1,
      platform: 'Instagram',
      username: '@sarahchen',
      followers: '125K',
      status: 'connected',
      lastSynced: '2 hours ago',
      icon: Instagram,
      color: 'bg-gradient-to-r from-pink-500 to-rose-600',
    },
    {
      id: 2,
      platform: 'Twitter',
      username: '@sarah_tweets',
      followers: '45K',
      status: 'connected',
      lastSynced: '1 day ago',
      icon: Twitter,
      color: 'bg-gradient-to-r from-blue-400 to-blue-600',
    },
    {
      id: 3,
      platform: 'YouTube',
      username: 'Sarah Chen',
      followers: '30K',
      status: 'connected',
      lastSynced: '3 days ago',
      icon: Youtube,
      color: 'bg-gradient-to-r from-red-500 to-red-700',
    },
    {
      id: 4,
      platform: 'LinkedIn',
      username: 'sarah-chen',
      followers: '15K',
      status: 'pending',
      lastSynced: 'Never',
      icon: Linkedin,
      color: 'bg-gradient-to-r from-blue-600 to-blue-800',
    },
    
  ];

  const platformOptions = [
    { name: 'Instagram', icon: Instagram, connected: true },
    { name: 'Twitter', icon: Twitter, connected: true },
    { name: 'YouTube', icon: Youtube, connected: true },
    { name: 'LinkedIn', icon: Linkedin, connected: false },
    { name: 'Facebook', icon: Globe, connected: false },
    { name: 'Pinterest', icon: Globe, connected: false },
  ];

  const handleSync = async (id: number) => {
    setSyncing(id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSyncing(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            Connected
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
      case 'disconnected':
        return (
          <span className="px-3 py-1 bg-secondary-100 text-secondary-800 text-sm rounded-full flex items-center">
            <XCircle className="w-4 h-4 mr-1" />
            Disconnected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Social Connections</h1>
          <p className="text-secondary-600 mt-2">Connect and manage your social media accounts</p>
        </div>
        <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
          <Zap className="w-4 h-4 mr-2" />
          Connect New Account
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Followers', value: '295K', icon: Users, color: 'from-primary-600 to-primary-700' },
          { title: 'Connected Accounts', value: '3/7', icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
          { title: 'Total Reach', value: '1.2M', icon: Eye, color: 'from-blue-500 to-cyan-600' },
          { title: 'Last Updated', value: '2 hours', icon: RefreshCw, color: 'from-purple-500 to-pink-600' },
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

      {/* Platform Options */}
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {platformOptions.map((platform) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.name}
                  className={`p-4 border rounded-xl flex flex-col items-center justify-center transition ${
                    platform.connected
                      ? 'border-green-300 bg-green-50'
                      : 'border-secondary-200 hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                    platform.connected
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : 'bg-secondary-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${platform.connected ? 'text-white' : 'text-secondary-600'}`} />
                  </div>
                  <span className="font-medium text-secondary-900 text-center">{platform.name}</span>
                  {platform.connected ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-2" />
                  ) : (
                    <Button size="sm" variant="outline" className="mt-2">
                      Connect
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Connected Accounts</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <Input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.map((connection) => {
              const Icon = connection.icon;
              return (
                <div key={connection.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${connection.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-secondary-900">{connection.platform}</h3>
                        {getStatusBadge(connection.status)}
                      </div>
                      <p className="text-secondary-600">{connection.username}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm font-medium text-secondary-900">{connection.followers} followers</span>
                        <span className="text-sm text-secondary-500">Last synced: {connection.lastSynced}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleSync(connection.id)}
                      disabled={syncing === connection.id}
                    >
                      {syncing === connection.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Now
                        </>
                      )}
                    </Button>
                    
                    {connection.status === 'connected' ? (
                      <Button variant="outline" className="text-error-600 hover:text-error-700">
                        <XCircle className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    ) : (
                      <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    )}
                    
                    <button className="p-2 hover:bg-secondary-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-secondary-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connection Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">Why Connect?</h3>
                <p className="text-sm text-secondary-600">Benefits of linking accounts</p>
              </div>
            </div>
            <ul className="space-y-2">
              {[
                'Automatic analytics tracking',
                'Unified inbox for all messages',
                'Profile verification boost',
                'Higher trust score',
                'More brand collaborations',
              ].map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-secondary-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">Best Practices</h3>
                <p className="text-sm text-secondary-600">Maximize your connections</p>
              </div>
            </div>
            <ul className="space-y-2">
              {[
                'Keep accounts public for verification',
                'Regularly sync for accurate analytics',
                'Maintain consistent branding',
                'Engage with your audience',
                'Update profile information',
              ].map((practice, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-secondary-700">{practice}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900">Data Privacy</h3>
                <p className="text-sm text-secondary-600">Your data is safe with us</p>
              </div>
            </div>
            <ul className="space-y-2">
              {[
                'We never post on your behalf',
                'Read-only access to analytics',
                'Your passwords are never stored',
                'GDPR & CCPA compliant',
                'You control connected accounts',
              ].map((privacy, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-secondary-700">{privacy}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}