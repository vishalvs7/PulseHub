'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Link2, Unlink, RefreshCw, ExternalLink } from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { PLATFORM_LIST } from '@/lib/socialPlatforms';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  is_connected: boolean;
  last_synced: string;
  zernio_account_id?: string | null;
}

interface ZernioConnectionsProps {
  userId: string;
}

export default function ZernioConnections({ userId }: ZernioConnectionsProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<CrossPostPlatform | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId);
    setAccounts(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleConnect = async (platform: CrossPostPlatform) => {
    setError('');
    setMessage('');
    setConnecting(platform);
    try {
      const res = await fetch('/api/social/zernio/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to start connection.');
        return;
      }
      // Open Zernio-hosted OAuth; account appears in profile on success.
      window.open(json.authUrl, '_blank');
      setMessage(
        `Complete the ${PLATFORM_LIST.find((p) => p.id === platform)?.name || platform} authorization in the new tab, then click "Sync".`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed.');
    } finally {
      setConnecting(null);
    }
  };

  const handleSync = async () => {
    setError('');
    setMessage('');
    setSyncing(true);
    try {
      const res = await fetch('/api/social/zernio/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Sync failed.');
        return;
      }
      setMessage(`Synced ${json.accounts.length} connected account(s).`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    const supabase = getSupabase();
    await supabase
      .from('social_accounts')
      .update({ is_connected: false, zernio_account_id: null })
      .eq('id', accountId);
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, is_connected: false, zernio_account_id: null } : a))
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading connections…</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm flex items-center justify-between">
          <span className="flex items-center"><ExternalLink className="w-4 h-4 mr-2" />{message}</span>
          <Button size="sm" variant="outline" onClick={handleSync} loading={syncing}>
            <RefreshCw className="w-4 h-4 mr-1" /> Sync
          </Button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Connected Accounts</h1>
          <p className="text-secondary-600 mt-2">
            Connect a platform once via Zernio — then post to it from the composer.
          </p>
        </div>
        <Button variant="outline" onClick={handleSync} loading={syncing}>
          <RefreshCw className="w-4 h-4 mr-2" /> Sync All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORM_LIST.map((platform) => {
          const account = accounts.find((a) => a.platform === platform.id);
          const isConnected = !!account?.is_connected;
          return (
            <Card key={platform.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 bg-gradient-to-r ${platform.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white text-lg font-bold">{platform.icon}</span>
                  </div>
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-secondary-100 text-secondary-600'
                  }`}>
                    {isConnected ? <CheckCircle className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    <span>{isConnected ? 'Connected' : 'Not connected'}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-secondary-900 mb-1">{platform.name}</h3>

                {isConnected && account ? (
                  <div className="space-y-4">
                    <div className="text-sm text-secondary-600">
                      <span className="font-medium text-secondary-900">@{account.username}</span>
                      {account.last_synced && (
                        <p className="mt-1 text-xs">Last synced: {new Date(account.last_synced).toLocaleString()}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-error-600 border-error-200 hover:bg-error-50"
                      onClick={() => handleDisconnect(account.id)}
                    >
                      <Unlink className="w-4 h-4 mr-2" /> Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-secondary-600">
                      Connect your {platform.name} account to start posting.
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700"
                      onClick={() => handleConnect(platform.id)}
                      loading={connecting === platform.id}
                    >
                      <Link2 className="w-4 h-4 mr-2" /> Connect {platform.name}
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
