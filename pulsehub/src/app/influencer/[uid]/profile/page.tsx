// src/app/(dashboard)/influencer/profile/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Save,
  Edit,
  User,
  Mail,
  MapPin,
  Globe,
  Users,
  TrendingUp,
  Award,
  Shield,
  Link2,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { AuthService } from '@/services/auth.service';
import { InfluencerService } from '@/services/influencer.service';
import BrandIcon from '@/components/posting/BrandIcon';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';
import { formatNumber } from '@/lib/utils';

interface ProfileForm {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  niche: string;
}

export default function InfluencerProfilePage() {
  const params = useParams();
  const uid = params.uid as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [form, setForm] = useState<ProfileForm>({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    niche: '',
  });
  const [followers, setFollowers] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);
  const [trustScore, setTrustScore] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [socialLinks, setSocialLinks] = useState<{ platform: string; username: string }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [userData, profile, accounts] = await Promise.all([
        AuthService.getUserData(uid),
        InfluencerService.getProfile(uid),
        getSupabase().from('social_accounts')
          .select('platform, username')
          .eq('user_id', uid)
          .eq('is_connected', true),
      ]);

      const name = profile?.displayName || userData?.displayName || '';
      setEmail(userData?.email || '');
      setPhotoUrl(profile?.photoURL || userData?.photoURL || '');
      setForm({
        displayName: name === 'User' ? '' : name,
        bio: profile?.bio || '',
        location: profile?.location === 'Unknown' ? '' : profile?.location || '',
        website: profile?.website || '',
        niche: (profile?.niche || []).join(', '),
      });
      setFollowers(profile?.followers?.instagram || 0);
      setEngagementRate(profile?.engagementRate || 0);
      setTrustScore(profile?.trustScore || 0);
      setIsVerified(profile?.isVerified || false);
      setSocialLinks((accounts.data || []).map((a: any) => ({ platform: a.platform, username: a.username })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const ok = await InfluencerService.upsertProfile(uid, {
        displayName: form.displayName || 'User',
        bio: form.bio,
        location: form.location || 'Unknown',
        website: form.website,
        niche: form.niche.split(',').map((s) => s.trim()).filter(Boolean),
      });
      if (!ok) {
        setError('Failed to save profile.');
        return;
      }
      const supabase = getSupabase();
      await supabase.from('users').update({ display_name: form.displayName }).eq('id', uid);
      setMessage('Profile saved.');
      setEditMode(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading profile…
      </div>
    );
  }

  const initials = (form.displayName || email || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Profile</h1>
          <p className="text-secondary-600 mt-2">Manage your influencer profile and portfolio</p>
        </div>
        <div className="flex items-center space-x-3">
          {editMode ? (
            <>
              <Button onClick={() => setEditMode(false)} variant="outline">Cancel</Button>
              <Button
                type="submit"
                form="profile-form"
                className="bg-gradient-to-r from-primary-600 to-primary-700"
                loading={saving}
              >
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)} className="bg-gradient-to-r from-primary-600 to-primary-700">
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">{message}</div>
      )}
      {error && (
        <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <form id="profile-form" onSubmit={handleSave} className="space-y-6">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    {photoUrl ? (
                      <img src={photoUrl} alt={form.displayName} className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    {editMode ? (
                      <Input
                        label="Display Name"
                        value={form.displayName}
                        onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                        icon={<User className="w-5 h-5" />}
                        className="mb-4"
                        placeholder="Your name or brand"
                      />
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-secondary-900">
                          {form.displayName || 'Your Profile'}
                        </h2>
                        {isVerified && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Shield className="w-4 h-4 text-primary-600" />
                            <span className="text-primary-600 font-medium">Verified Influencer</span>
                          </div>
                        )}
                      </>
                    )}

                    {form.niche && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.niche.split(',').map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-lg">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Bio</label>
                  {editMode ? (
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      placeholder="Tell brands about yourself…"
                      className="w-full h-32 px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                    />
                  ) : form.bio ? (
                    <p className="text-secondary-700 whitespace-pre-line">{form.bio}</p>
                  ) : (
                    <p className="text-secondary-400">No bio yet — add one to stand out to brands.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Email</label>
                    <div className="flex items-center text-secondary-700">
                      <Mail className="w-5 h-5 text-secondary-400 mr-2" />
                      {email || '—'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Location</label>
                    {editMode ? (
                      <Input
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        icon={<MapPin className="w-5 h-5" />}
                        placeholder="City, Country"
                      />
                    ) : form.location ? (
                      <div className="flex items-center text-secondary-700">
                        <MapPin className="w-5 h-5 text-secondary-400 mr-2" /> {form.location}
                      </div>
                    ) : (
                      <p className="text-secondary-400">Not set</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Website</label>
                    {editMode ? (
                      <Input
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        icon={<Globe className="w-5 h-5" />}
                        placeholder="https://…"
                      />
                    ) : form.website ? (
                      <div className="flex items-center text-secondary-700">
                        <Globe className="w-5 h-5 text-secondary-400 mr-2" />
                        <a href={form.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                          {form.website}
                        </a>
                      </div>
                    ) : (
                      <p className="text-secondary-400">Not set</p>
                    )}
                  </div>
                </div>

                {editMode && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Niches <span className="text-secondary-400 font-normal">(comma separated)</span>
                    </label>
                    <Input
                      value={form.niche}
                      onChange={(e) => setForm({ ...form, niche: e.target.value })}
                      placeholder="e.g. Lifestyle, Travel, Tech"
                    />
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Social Links — real connected accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {socialLinks.length === 0 ? (
                <p className="text-secondary-400 text-sm py-4">
                  No connected accounts yet. Head to <span className="font-medium">Accounts</span> to connect your social profiles.
                </p>
              ) : (
                <div className="space-y-3">
                  {socialLinks.map((link) => (
                    <div key={link.platform} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BrandIcon platform={link.platform as CrossPostPlatform} className="w-10 h-10 rounded-lg" />
                        <div>
                          <h3 className="font-semibold text-secondary-900 capitalize">{link.platform}</h3>
                          <p className="text-secondary-600">@{link.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="w-5 h-5 mr-1" /> Connected
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portfolio — data not available yet */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Showcase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-10 text-center text-secondary-400">
                <Link2 className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>Your portfolio is empty.</p>
                <p className="text-sm mt-1">Published posts will appear here once you start cross-posting.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — real stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Followers</p>
                    <p className="text-xl font-bold text-secondary-900">{formatNumber(followers) || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Engagement Rate</p>
                    <p className="text-xl font-bold text-secondary-900">
                      {engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : '—'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Trust Score</p>
                    <p className="text-xl font-bold text-secondary-900">{trustScore > 0 ? `${trustScore}/100` : '—'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Display name', done: !!form.displayName },
                { label: 'Bio', done: !!form.bio },
                { label: 'Location', done: !!form.location },
                { label: 'Website', done: !!form.website },
                { label: 'Connected accounts', done: socialLinks.length > 0 },
              ].map((task, index) => (
                <div key={index} className="flex items-center">
                  {task.done ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-secondary-300 rounded-full mr-2" />
                  )}
                  <span className={`text-sm ${task.done ? 'text-secondary-600' : 'text-secondary-900'}`}>{task.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}