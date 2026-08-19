'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, AlertCircle, CheckCircle2, UserRound } from 'lucide-react';
import BrandIcon from './BrandIcon';
import { PLATFORM_LIST } from '@/lib/socialPlatforms';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';

interface Option {
  id: string;
  name: string;
  username?: string;
  description?: string;
  urn?: string;
  logoUrl?: string;
  vanityName?: string;
  boardName?: string;
  instagramUsername?: string;
}

export default function AccountSelectPicker({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const platform = (searchParams.get('platform') || '') as CrossPostPlatform;
  const pendingDataToken = searchParams.get('pendingDataToken') || '';
  const profileId = searchParams.get('profileId') || '';
  const tempToken = searchParams.get('tempToken') || '';
  const connectToken = searchParams.get('connectToken') || '';
  const userProfileRaw = searchParams.get('userProfile') || '';

  const [options, setOptions] = useState<Option[]>([]);
  const [selectionType, setSelectionType] = useState('');
  const [userProfile, setUserProfile] = useState<Record<string, unknown> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState('');

  const platformName = PLATFORM_LIST.find((p) => p.id === platform)?.name || platform;
  const optionLabel =
    selectionType === 'organizations' ? 'organizations' :
    selectionType === 'boards' ? 'boards' :
    selectionType === 'pages' ? 'pages' : 'accounts';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({ platform });
      if (pendingDataToken) qs.set('pendingDataToken', pendingDataToken);
      if (profileId) qs.set('profileId', profileId);
      if (tempToken) qs.set('tempToken', tempToken);
      if (connectToken) qs.set('connectToken', connectToken);
      if (userProfileRaw) qs.set('userProfile', userProfileRaw);

      const res = await fetch(`/api/social/zernio/select?${qs.toString()}`, { method: 'GET' });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to load available accounts.');
        return;
      }
      setOptions(json.options || []);
      setSelectionType(json.selectionType || '');
      if (json.userProfile) setUserProfile(json.userProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load available accounts.');
    } finally {
      setLoading(false);
    }
  }, [platform, pendingDataToken, profileId, tempToken, connectToken, userProfileRaw]);

  useEffect(() => {
    load();
  }, [load]);

  const finish = async (selection: Record<string, unknown>, accountType?: string) => {
    setSelecting(true);
    setError('');
    try {
      const res = await fetch('/api/social/zernio/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          profileId,
          tempToken,
          userProfile,
          connectToken,
          accountType,
          selection,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to connect account.');
        setSelecting(false);
        return;
      }
      router.push(`${basePath}/connections?connected=1&platform=${platform}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect account.');
      setSelecting(false);
    }
  };

  const isPersonalLinkedIn = platform === 'linkedin' && selectionType === 'organizations';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BrandIcon platform={platform} className="w-12 h-12 rounded-xl" />
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Connect {platformName}</h1>
          <p className="text-secondary-600 text-sm">
            Choose the {optionLabel} you want to connect to PulseHub.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          {error}
        </div>
      )}

      {loading && (
        <Card>
          <CardContent className="p-10 text-center text-secondary-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
            Loading your {optionLabel}…
          </CardContent>
        </Card>
      )}

      {!loading && options.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-secondary-600">
              No {optionLabel} found. Make sure you have access to a {platformName} page or organization.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && options.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select a {optionLabel === 'accounts' ? 'profile' : optionLabel.slice(0, -1)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  const selection =
                    platform === 'linkedin'
                      ? { id: opt.id, urn: opt.urn, name: opt.name, logoUrl: opt.logoUrl, vanityName: opt.vanityName }
                      : platform === 'pinterest'
                        ? { boardId: opt.id, boardName: opt.name }
                        : { pageId: opt.id };
                  finish(selection, platform === 'linkedin' ? 'organization' : undefined);
                }}
                disabled={selecting}
                className="w-full flex items-center justify-between p-4 border border-secondary-200 rounded-xl hover:border-primary-400 hover:bg-primary-50/40 transition text-left"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {opt.logoUrl ? (
                    <img src={opt.logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center shrink-0">
                      <UserRound className="w-5 h-5 text-secondary-500" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-secondary-900 truncate">{opt.name}</p>
                    {(opt.username || opt.instagramUsername) && (
                      <p className="text-sm text-secondary-500 truncate">
                        @{opt.username || opt.instagramUsername}
                      </p>
                    )}
                  </div>
                </div>
                {selecting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {isPersonalLinkedIn && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => finish({}, 'personal')}
            loading={selecting}
          >
            Connect as personal profile instead
          </Button>
        </div>
      )}
    </div>
  );
}