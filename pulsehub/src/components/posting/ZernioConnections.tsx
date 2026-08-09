'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle, Link2, Unlink, RefreshCw, ExternalLink, Plus, X, AlertCircle,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { PLATFORM_LIST } from '@/lib/socialPlatforms';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';
import BrandIcon from './BrandIcon';

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
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Add-account modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<CrossPostPlatform | ''>('');
  const [accountName, setAccountName] = useState('');
  const [pending, setPending] = useState<{ platform: CrossPostPlatform; name: string } | null>(null);

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

  const connected = accounts.filter((a) => a.is_connected);

  const openModal = () => {
    setSelectedPlatform('');
    setAccountName('');
    setError('');
    setMessage('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPending(null);
  };

  const handleConnect = async () => {
    if (!selectedPlatform) {
      setError('Choose the social platform for this account.');
      return;
    }
    if (!accountName.trim()) {
      setError('Add the account username or a label (e.g. @acme_news).');
      return;
    }
    setError('');
    setMessage('');
    setConnecting(true);
    try {
      const res = await fetch('/api/social/zernio/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: selectedPlatform }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to start connection.');
        return;
      }
      // Open Zernio-hosted OAuth; account appears in the profile on success.
      window.open(json.authUrl, '_blank');
      setPending({ platform: selectedPlatform, name: accountName.trim() });
      setModalOpen(false);
      setMessage(
        `Complete the ${PLATFORM_LIST.find((p) => p.id === selectedPlatform)?.name || selectedPlatform} authorization in the new tab, then click "Sync" to add the account.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed.');
    } finally {
      setConnecting(false);
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
      setPending(null);
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
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading accounts…</div>;
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
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm flex items-center justify-between">
          <span className="flex items-center"><AlertCircle className="w-4 h-4 mr-2" />{error}</span>
          <button onClick={() => setError('')} className="text-error-400 hover:text-error-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Accounts</h1>
          <p className="text-secondary-600 mt-2">
            Connect as many profiles as you need — even multiple accounts for the same platform.
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-primary-600 to-primary-700"
          onClick={openModal}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Account
        </Button>
      </div>

      {connected.length === 0 && !pending ? (
        <Card className="border-2 border-dashed border-secondary-300">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-8 h-8 text-secondary-500" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No profiles connected</h3>
            <p className="text-secondary-600 mb-6">
              Add your first social account to start cross-posting from the composer.
            </p>
            <Button
              className="bg-gradient-to-r from-primary-600 to-primary-700"
              onClick={openModal}
              icon={<Plus className="w-4 h-4" />}
            >
              Add New Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pending && (
            <Card className="border-accent-300 bg-accent-50/40">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <BrandIcon platform={pending.platform} className="w-14 h-14 rounded-lg" />
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm bg-amber-100 text-amber-800">
                    <AlertCircle className="w-4 h-4" />
                    <span>Pending auth</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-1">
                  {pending.name} <span className="font-normal text-secondary-500">· {PLATFORM_LIST.find((p) => p.id === pending.platform)?.name}</span>
                </h3>
                <p className="text-sm text-secondary-600 mb-4">
                  Complete the authorization in the new tab, then sync to finish connecting.
                </p>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-primary-600 to-accent-600"
                  onClick={handleSync}
                  loading={syncing}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Sync to add account
                </Button>
              </CardContent>
            </Card>
          )}

          {connected.map((account) => {
            const platform = (PLATFORM_LIST.find((p) => p.id === account.platform)?.id || account.platform) as CrossPostPlatform;
            const cfg = PLATFORM_LIST.find((p) => p.id === account.platform);
            return (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <BrandIcon platform={platform} className="w-14 h-14 rounded-lg" />
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span>Connected</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-1">{cfg?.name || account.platform}</h3>
                  <div className="text-sm text-secondary-600">
                    <span className="font-medium text-secondary-900">@{account.username}</span>
                    {account.last_synced && (
                      <p className="mt-1 text-xs">Last synced: {new Date(account.last_synced).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-error-600 border-error-200 hover:bg-error-50"
                      onClick={() => handleDisconnect(account.id)}
                    >
                      <Unlink className="w-4 h-4 mr-2" /> Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Supported platforms strip */}
      <div className="border border-secondary-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-secondary-900">Platforms supported</span>
          <span className="text-xs text-secondary-500">— connect one or many of each</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
          {PLATFORM_LIST.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-1.5 shrink-0">
              <BrandIcon platform={p.id} className="w-10 h-10 rounded-lg" />
              <span className="text-xs text-secondary-600">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add-account modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-secondary-900">Add a new account</h3>
              <button onClick={closeModal} className="text-secondary-400 hover:text-secondary-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                  {PLATFORM_LIST.map((p) => {
                    const isSelected = selectedPlatform === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlatform(p.id)}
                        className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                            : 'border-secondary-200 hover:border-secondary-400'
                        }`}
                      >
                        <BrandIcon platform={p.id} className="w-8 h-8 rounded-lg" />
                        <span className={`text-xs font-medium ${isSelected ? 'text-primary-700' : 'text-secondary-600'}`}>
                          {p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Username or label
                </label>
                <input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder={selectedPlatform ? `e.g. @your${selectedPlatform}handle` : 'Pick a platform first'}
                  disabled={!selectedPlatform}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none disabled:bg-secondary-100 disabled:text-secondary-400"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Used as a label until the platform returns your verified handle.
                </p>
              </div>

              {error && (
                <p className="flex items-center gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg px-4 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </p>
              )}

              <Button
                className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700"
                onClick={handleConnect}
                loading={connecting}
                disabled={connecting}
                icon={<Link2 className="w-4 h-4" />}
              >
                Continue & authorize
              </Button>
              <p className="text-center text-xs text-secondary-400">
                Opens the platform authorization in a new tab. Sync afterwards to finish.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}