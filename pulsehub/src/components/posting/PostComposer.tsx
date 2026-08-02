'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ImagePlus, Send, Calendar, Clock, Zap, Link2, X, Loader2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { PLATFORM_CONFIGS, PLATFORM_LIST } from '@/lib/socialPlatforms';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';

interface ConnectedAccount {
  platform: string;
  username: string;
}

interface PostComposerProps {
  userId: string;
  connectionsHref: string;
}

export default function PostComposer({ userId, connectionsHref }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [selected, setSelected] = useState<CrossPostPlatform[]>([]);
  const [media, setMedia] = useState<{ url: string; name: string }[]>([]);
  const [connected, setConnected] = useState<ConnectedAccount[]>([]);
  const [mode, setMode] = useState<'now' | 'later'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadConnected = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('social_accounts')
      .select('platform, username')
      .eq('user_id', userId)
      .eq('is_connected', true);
    setConnected(data || []);
    if (data?.length) {
      setSelected(data.map((a: ConnectedAccount) => a.platform as CrossPostPlatform));
    }
  }, [userId]);

  useEffect(() => {
    loadConnected();
  }, [loadConnected]);

  const connectedSet = new Set(connected.map((c) => c.platform));

  const togglePlatform = (p: CrossPostPlatform) => {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/social/zernio/upload', { method: 'POST', body: formData });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || 'Upload failed');
          continue;
        }
        setMedia((prev) => [...prev, { url: json.url, name: json.name }]);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeMedia = (url: string) => {
    setMedia((prev) => prev.filter((m) => m.url !== url));
  };

  const handlePost = async () => {
    setError('');
    setResult('');

    if (!content.trim() && media.length === 0) {
      setError('Add some text or media to your post.');
      return;
    }
    if (selected.length === 0) {
      setError('Select at least one platform.');
      return;
    }

    let scheduledFor: string | undefined;
    if (mode === 'later') {
      if (!scheduleDate || !scheduleTime) {
        setError('Pick a date and time to schedule.');
        return;
      }
      scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    }

    setSending(true);
    try {
      const res = await fetch('/api/social/zernio/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          mediaUrls: media.map((m) => m.url),
          platforms: selected.map((p) => ({ platform: p })),
          scheduledFor,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to send post.');
        return;
      }
      if (json.missing?.length) {
        setError(`Sent to ${json.platforms.join(', ')}. Not connected: ${json.missing.join(', ')}.`);
      }
      setResult(`Post ${mode === 'later' ? 'scheduled' : 'sent'} ✓`);
      setContent('');
      setMedia([]);
      setSelected([]);
      setMode('now');
      setScheduleDate('');
      setScheduleTime('');
      setTimeout(() => setResult(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send post.');
    } finally {
      setSending(false);
    }
  };

  const charState = (limit: number) => {
    if (content.length > limit) return 'text-error-600 font-semibold';
    if (content.length > limit * 0.9) return 'text-amber-600';
    return 'text-secondary-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">{error}</div>
        )}
        {result && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">{result}</div>
        )}

        {/* Media */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-secondary-700">Media</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <ImagePlus className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {media.length === 0 && !uploading && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-secondary-300 rounded-xl flex flex-col items-center justify-center text-secondary-500 hover:border-primary-400 hover:text-primary-600 transition"
            >
              <ImagePlus className="w-8 h-8 mb-2" />
              <span className="text-sm">Drop images/videos or click to browse</span>
            </button>
          )}
          {uploading && (
            <div className="w-full h-16 border-2 border-dashed border-secondary-300 rounded-xl flex items-center justify-center text-secondary-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Uploading…
            </div>
          )}
          {media.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {media.map((m) => (
                <div key={m.url} className="relative group aspect-square rounded-lg overflow-hidden bg-secondary-100">
                  {m.url.match(/\.(mp4|mov|webm)$/i) ? (
                    <video src={m.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(m.url)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text */}
        <div>
          <textarea
            placeholder="Write your caption…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full p-4 border border-secondary-300 rounded-lg resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          />
          <div className="text-right text-sm text-secondary-500 mt-1">{content.length} chars</div>
        </div>

        {/* Platform checkboxes */}
        <div>
          <span className="text-sm font-medium text-secondary-700">Post to</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {PLATFORM_LIST.map((p) => {
              const isSelected = selected.includes(p.id);
              const isConnected = connectedSet.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : isConnected
                        ? 'border-secondary-300 hover:border-secondary-400'
                        : 'border-secondary-200 bg-secondary-50 opacity-60'
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <span className={`w-8 h-8 bg-gradient-to-r ${p.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                      {p.icon}
                    </span>
                    <span className="text-sm font-medium text-secondary-900">{p.name}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    {!isConnected && (
                      <a
                        href={connectionsHref}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center text-xs text-primary-600 hover:underline"
                        title="Connect this account"
                      >
                        <Link2 className="w-3.5 h-3.5 mr-1" /> Connect
                      </a>
                    )}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-primary-600 pointer-events-none"
                    />
                  </span>
                </button>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {selected.map((id) => {
                const cfg = PLATFORM_CONFIGS[id];
                const status = content.length <= cfg.maxChars ? 'ok' : content.length > cfg.maxChars ? 'over' : 'near';
                return (
                  <span key={id} className="flex items-center space-x-1 text-xs">
                    <span className={`font-medium ${cfg.color.split(' ')[0]} bg-clip-text text-transparent`}>{cfg.name}</span>
                    <span className={charState(cfg.maxChars)}>
                      {content.length}/{cfg.maxChars}
                    </span>
                    {status === 'over' && <span className="text-error-600 font-semibold">Over limit!</span>}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="pt-4 border-t border-secondary-200">
          <span className="text-sm font-medium text-secondary-700">When to post</span>
          <div className="flex items-center space-x-4 mt-3">
            <button
              type="button"
              onClick={() => setMode('now')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                mode === 'now'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-300 text-secondary-600 hover:border-secondary-400'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Post Now</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('later')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                mode === 'later'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-300 text-secondary-600 hover:border-secondary-400'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Later</span>
            </button>
          </div>

          {mode === 'later' && (
            <div className="flex items-center space-x-3 mt-4">
              <Calendar className="w-5 h-5 text-secondary-400" />
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:border-primary-500 outline-none"
              />
              <Clock className="w-5 h-5 text-secondary-400" />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:border-primary-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* Post button */}
        <div className="flex justify-end pt-4">
          <Button
            className="bg-gradient-to-r from-primary-600 to-primary-700"
            onClick={handlePost}
            loading={sending}
            disabled={sending || uploading}
            icon={<Send className="w-4 h-4" />}
          >
            {mode === 'now' ? 'Post Now' : 'Schedule Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
