'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, CalendarClock, RefreshCw, Trash2, FileText, AlertCircle } from 'lucide-react';
import BrandIcon from './BrandIcon';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';

interface PostItem {
  id: string;
  content: string;
  status: string;
  scheduledFor: string | null;
  timezone: string;
  createdAt: string | null;
  publishedAt: string | null;
  title?: string;
  platforms: { platform: string; status?: string }[];
  media: { type: string; url: string }[];
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-amber-100 text-amber-800',
  published: 'bg-green-100 text-green-800',
  draft: 'bg-secondary-100 text-secondary-700',
  failed: 'bg-error-50 text-error-700',
  pending: 'bg-blue-100 text-blue-800',
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '';
  }
}

export default function RecentPosts() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/social/zernio/posts', { method: 'GET' });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to load posts.');
        setPosts([]);
        return;
      }
      setPosts(json.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (postId: string) => {
    setCancelling(postId);
    setError('');
    try {
      const res = await fetch(`/api/social/zernio/posts?id=${encodeURIComponent(postId)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to cancel post.');
        return;
      }
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: 'cancelled' } : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel post.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between px-6 pt-6">
        <h3 className="text-lg font-bold text-secondary-900">Posts</h3>
        <Button size="sm" variant="outline" onClick={load} loading={loading} icon={<RefreshCw className="w-4 h-4" />}>
          Refresh
        </Button>
      </div>
      <CardContent className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-secondary-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <p className="text-secondary-500 text-sm text-center py-10">
            No posts yet. Create one from the composer — scheduled and published posts will show up here.
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border border-secondary-200 rounded-xl flex items-start gap-4">
                {post.media[0] ? (
                  post.media[0].url.match(/\.(mp4|mov|webm)$/i) ? (
                    <video src={post.media[0].url} className="w-16 h-16 rounded-lg object-cover" muted />
                  ) : (
                    <img src={post.media[0].url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  )
                ) : (
                  <div className="w-16 h-16 bg-secondary-100 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-secondary-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${STATUS_STYLES[post.status] || 'bg-secondary-100 text-secondary-700'}`}>
                      {post.status}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {post.platforms.map((p) => (
                        <BrandIcon key={p.platform} platform={p.platform as CrossPostPlatform} className="w-5 h-5 rounded" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-secondary-900 font-medium line-clamp-2">{post.content || '(media only)'}</p>
                  <p className="text-xs text-secondary-500 mt-1 flex items-center gap-1">
                    <CalendarClock className="w-3.5 h-3.5" />
                    {post.status === 'scheduled'
                      ? `Scheduled for ${formatDate(post.scheduledFor)}`
                      : post.status === 'published'
                        ? `Published ${formatDate(post.publishedAt || post.createdAt)}`
                        : `Created ${formatDate(post.createdAt)}`}
                  </p>
                </div>

                {post.status === 'scheduled' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 text-error-600 border-error-200 hover:bg-error-50"
                    onClick={() => cancel(post.id)}
                    loading={cancelling === post.id}
                    icon={<Trash2 className="w-4 h-4" />}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}