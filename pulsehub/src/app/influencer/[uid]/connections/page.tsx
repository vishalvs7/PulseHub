'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Instagram, Twitter, Youtube, Linkedin,
  Link2, Unlink, CheckCircle, AlertCircle, RefreshCw, Plus
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { OAuthService } from '@/services/social/oauth.service';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  is_connected: boolean;
  last_synced: string;
}

export default function InfluencerConnectionsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const uid = params.uid as string;

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) setMessage(`Successfully connected ${connected}!`);
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', uid);
      setAccounts(data || []);
      setLoading(false);
    };
    load();
  }, [uid]);

  const handleConnect = (platform: string) => {
    window.location.href = `/api/social/${platform}/connect?user_id=${uid}`;
  };

  const handleDisconnect = async (accountId: string) => {
    const supabase = getSupabase();
    await supabase
      .from('social_accounts')
      .update({ is_connected: false, access_token: null })
      .eq('id', accountId);
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, is_connected: false } : a));
  };

  const platformIcons: Record<string, any> = {
    instagram: Instagram, twitter: Twitter, youtube: Youtube, linkedin: Linkedin, tiktok: Instagram, facebook: Instagram,
  };

  const platformColors: Record<string, string> = {
    instagram: 'from-accent-500 to-rose-600',
    twitter: 'from-blue-400 to-blue-600',
    youtube: 'from-red-500 to-red-700',
    linkedin: 'from-blue-600 to-blue-800',
    tiktok: 'from-gray-800 to-gray-900',
    facebook: 'from-blue-500 to-blue-700',
  };

  const allPlatforms = ['instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'facebook'];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading connections...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          <CheckCircle className="w-4 h-4 inline mr-2" />{message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Connected Accounts</h1>
          <p className="text-secondary-600 mt-2">Manage your social media connections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPlatforms.map((platform) => {
          const Icon = platformIcons[platform] || Instagram;
          const account = accounts.find(a => a.platform === platform);
          const isConnected = !!account?.is_connected;
          const isConfigured = OAuthService.isConfigured(platform);

          return (
            <Card key={platform}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-r ${platformColors[platform] || 'from-primary-500 to-primary-700'} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-secondary-100 text-secondary-600'
                  }`}>
                    {isConnected ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-secondary-900 capitalize mb-1">{platform}</h3>

                {isConnected && account ? (
                  <div className="space-y-4">
                    <div className="text-sm text-secondary-600">
                      <span className="font-medium text-secondary-900">@{account.username}</span>
                      {account.last_synced && (
                        <p className="mt-1">Last synced: {new Date(account.last_synced).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-error-600 border-error-200 hover:bg-error-50"
                        onClick={() => handleDisconnect(account.id)}
                      >
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-secondary-600">
                      {isConfigured
                        ? `Connect your ${platform} account to start posting and tracking analytics.`
                        : `${platform} integration is not configured. Set up API keys in your environment variables to enable connection.`}
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700"
                      onClick={() => handleConnect(platform)}
                      disabled={!isConfigured}
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Connect {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
