'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ImagePlus, Send, Calendar, Clock, Zap, Link2, X, Loader2, ChevronLeft, ChevronRight,
  FileText, Check, Smartphone, Clock4, Sparkles, Wand2, AlertCircle,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase/client';
import { PLATFORM_CONFIGS, PLATFORM_LIST } from '@/lib/socialPlatforms';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';
import { CONTENT_TYPES } from '@/lib/postFormats';
import type { PostContentType } from '@/lib/postFormats';
import PlatformPreviews from './PlatformPreviews';
import type { PlatformPreviewProps } from './PlatformPreviews';
import AspectShape from './AspectShape';
import BrandIcon from './BrandIcon';
import { generateCaption, parsePlatformCaptions } from '@/services/ai.service';
import { PLATFORM_KEYS } from '@/lib/ai/platforms';
import type { PlatformKey } from '@/lib/ai/platforms';

interface ConnectedAccount {
  platform: string;
  username: string;
}

interface PostComposerProps {
  userId: string;
  connectionsHref: string;
}

const STEPS = ['Content Type', 'Accounts & Text', 'Preview', 'Schedule'] as const;

const AI_PLATFORM_MAP: Record<PlatformKey, CrossPostPlatform> = {
  instagram: 'instagram',
  linkedin: 'linkedin',
  twitter: 'twitter',
  tiktok: 'tiktok',
};

export default function PostComposer({ userId, connectionsHref }: PostComposerProps) {
  const [step, setStep] = useState(0);
  const [contentType, setContentType] = useState<PostContentType | null>(null);
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

  // Per-platform captions (AI-generated or hand-edited). Falls back to `content`.
  const [platformCaptions, setPlatformCaptions] = useState<Partial<Record<CrossPostPlatform, string>>>({});
  // AI assistant
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiError, setAiError] = useState('');
  const aiBufferRef = useRef('');

  const loadConnected = useCallback(async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('social_accounts')
      .select('platform, username')
      .eq('user_id', userId)
      .eq('is_connected', true);
    setConnected(data || []);
  }, [userId]);

  useEffect(() => {
    loadConnected();
  }, [loadConnected]);

  const connectedSet = new Set(connected.map((c) => c.platform));
  const connectedByPlatform = new Map(connected.map((c) => [c.platform, c.username]));

  const togglePlatform = (p: CrossPostPlatform) => {
    setSelected((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const selectType = (t: PostContentType) => {
    setContentType(t);
    setSelected([]);
    setMedia([]);
    setContent('');
    setPlatformCaptions({});
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const newMedia: { url: string; name: string }[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/social/zernio/upload', { method: 'POST', body: formData });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || 'Upload failed');
          continue;
        }
        newMedia.push({ url: json.url, name: json.name });
      }
      setMedia((prev) => [...prev, ...newMedia]);
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
          platforms: selected.map((p) => ({
            platform: p,
            destination: destinations[p],
            customContent: platformCaptions[p] || undefined,
          })),
          scheduledFor,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          contentType,
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

  const platformCharState = (len: number, limit: number) => {
    if (len > limit) return 'text-error-600 font-semibold';
    if (len > limit * 0.9) return 'text-amber-600';
    return 'text-secondary-400';
  };

  const captionFor = (p: CrossPostPlatform) => platformCaptions[p] ?? content;

  const generateCaptions = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Describe your post so the AI can tailor captions.');
      return;
    }
    if (selected.length === 0) {
      setAiError('Select at least one platform first.');
      return;
    }
    setAiError('');
    setAiStreaming(true);
    aiBufferRef.current = '';
    setPlatformCaptions({});

    try {
      await generateCaption({
        prompt: aiPrompt,
        mode: 'platforms',
        onChunk: (chunk) => {
          // Parse streaming output and map only AI-supported selected platforms.
          aiBufferRef.current += chunk;
          const parsed = parsePlatformCaptions(aiBufferRef.current);
          const updates: Partial<Record<CrossPostPlatform, string>> = {};
          for (const key of PLATFORM_KEYS) {
            const platform = AI_PLATFORM_MAP[key];
            if (!selected.includes(platform)) continue;
            const cap = parsed[key];
            if (cap) updates[platform] = cap;
          }
          setPlatformCaptions((prev) => ({ ...prev, ...updates }));
        },
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setAiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAiStreaming(false);
    }
  };

  const setPlatformCaption = (p: CrossPostPlatform, value: string) => {
    setPlatformCaptions((prev) => ({ ...prev, [p]: value }));
  };

  const clearPlatformCaption = (p: CrossPostPlatform) => {
    setPlatformCaptions((prev) => {
      const next = { ...prev };
      delete next[p];
      return next;
    });
  };

  const destinations: Record<string, string> = {};
  if (contentType) {
    for (const p of selected) {
      destinations[p] = CONTENT_TYPES.find((c) => c.id === contentType)?.destination[p] || 'Post';
    }
  }

  const previewItems: PlatformPreviewProps[] = selected.map((p) => ({
    platform: p,
    destination: destinations[p],
    content: captionFor(p),
    media,
    username: connectedByPlatform.get(p) || `${p} user`,
    isDocument: contentType === 'document',
  }));

  const canNext =
    step === 0 ? !!contentType :
    step === 1 ? selected.length > 0 && (content.trim().length > 0 || media.length > 0) :
    true;

  const isDocument = contentType === 'document';
  const acceptAttr = contentType ? CONTENT_TYPES.find((c) => c.id === contentType)?.accepts : 'image/*,video/*';
  const eligiblePlatforms = contentType
    ? PLATFORM_LIST.filter((p) => CONTENT_TYPES.find((c) => c.id === contentType)?.platforms.includes(p.id))
    : [];

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

        {/* Step indicator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STEPS.map((name, i) => (
            <div key={name} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  i === step
                    ? 'bg-primary-600 text-white'
                    : i < step
                      ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                      : 'bg-secondary-100 text-secondary-500 cursor-default'
                }`}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}.</span>}
                <span className="whitespace-nowrap">{name}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-secondary-300 shrink-0" />}
            </div>
          ))}
        </div>

        {/* STEP 1 — Content type */}
        {step === 0 && (
          <div>
            <h3 className="font-bold text-secondary-900 mb-1">What are you posting?</h3>
            <p className="text-sm text-secondary-500 mb-4">
              Pick the media format first — only compatible platforms will be shown.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {CONTENT_TYPES.map((t) => {
                const isSelected = contentType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectType(t.id)}
                    className={`p-5 rounded-2xl border-2 transition flex flex-col items-center text-center ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-secondary-200 bg-white hover:border-primary-300 hover:shadow-sm'
                    }`}
                  >
                    <AspectShape type={t.id} selected={isSelected} />
                    <p className={`font-bold mt-2 ${isSelected ? 'text-primary-700' : 'text-secondary-900'}`}>
                      {t.name}
                    </p>
                    <p className="text-[11px] text-secondary-500 mt-0.5 leading-snug line-clamp-2">
                      {t.description}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                      {t.platforms.map((p) => (
                        <BrandIcon key={p} platform={p} className="w-6 h-6 rounded-md" />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 — Media, caption, platforms */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Media */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-secondary-700">
                  Media <span className="text-secondary-400 font-normal">(required)</span>
                </span>
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
                accept={acceptAttr}
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
                  <span className="text-sm">{isDocument ? 'Drop your document or click to browse' : 'Drop images/videos or click to browse'}</span>
                  <span className="text-xs text-secondary-400 mt-1">{isDocument ? 'PDF or Word (.pdf, .doc, .docx)' : 'Must match your selected format'}</span>
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
                      ) : isDocument ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-primary-500" />
                        </div>
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
                placeholder={isDocument ? 'Write a description for your document…' : 'Write your caption…'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full p-4 border border-secondary-300 rounded-lg resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              />
              <div className="text-right text-sm text-secondary-500 mt-1">{content.length} chars</div>
            </div>

            {/* AI Caption Assistant */}
            <div className="border border-accent-200 bg-accent-50/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-secondary-900">
                  <Sparkles className="w-4 h-4 text-accent-600" />
                  AI Captions for each platform
                </span>
                {selected.length > 0 && (
                  <span className="text-[11px] text-secondary-500">
                    tailored for{' '}
                    {selected.filter((p) => (AI_PLATFORM_MAP as Record<string, string>)[p]).length} of your{' '}
                    {selected.length} platforms
                  </span>
                )}
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={2}
                placeholder="Describe your post — e.g. Launching our eco-friendly water bottle, 50% off this week, with a seaside photo"
                className="w-full p-3 border border-secondary-300 rounded-lg resize-none bg-white focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none text-sm"
              />
              <div className="flex items-center justify-between mt-2">
                <Button
                  onClick={generateCaptions}
                  loading={aiStreaming}
                  disabled={aiStreaming}
                  size="sm"
                  className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700"
                  icon={<Wand2 className="w-4 h-4" />}
                >
                  Generate captions
                </Button>
                <span className="text-[11px] text-secondary-500">
                  Instagram · X · LinkedIn · TikTok — then tweak each below
                </span>
              </div>
              {aiError && (
                <p className="flex items-center gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg px-4 py-2 mt-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {aiError}
                </p>
              )}
            </div>

            {/* Per-platform captions — editable */}
            {selected.length > 0 && (
              <div className="space-y-3">
                <span className="text-sm font-medium text-secondary-700">
                  Captions per platform <span className="text-secondary-400 font-normal">(edit any box below; empty = use main caption)</span>
                </span>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {selected.map((id) => {
                    const cfg = PLATFORM_CONFIGS[id];
                    const custom = platformCaptions[id];
                    const shown = captionFor(id);
                    const over = shown.length > cfg.maxChars;
                    return (
                      <div key={id} className="border border-secondary-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-2">
                            <BrandIcon platform={id} className="w-6 h-6 rounded-md" />
                            <span className="text-sm font-semibold text-secondary-900">{cfg.name}</span>
                          </span>
                          <span className={`text-xs ${platformCharState(shown.length, cfg.maxChars)} ${over ? '' : ''}`}>
                            {shown.length}/{cfg.maxChars}
                          </span>
                        </div>
                        <textarea
                          value={shown}
                          onChange={(e) => setPlatformCaption(id, e.target.value)}
                          rows={3}
                          placeholder={`Your ${cfg.name} caption…`}
                          className={`w-full p-3 border rounded-lg resize-none text-sm outline-none focus:ring-2 ${
                            custom
                              ? 'border-accent-300 bg-accent-50/40 focus:ring-accent-200 focus:border-accent-500'
                              : 'border-secondary-200 bg-white focus:ring-primary-200 focus:border-primary-500'
                          }`}
                        />
                        {custom && (
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-accent-700 font-medium">Customized for {cfg.name}</span>
                            <button
                              onClick={() => clearPlatformCaption(id)}
                              className="text-[11px] text-secondary-500 hover:text-secondary-700 underline"
                            >
                              Reset to main caption
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Platform checkboxes — only eligible */}
            <div>
              <span className="text-sm font-medium text-secondary-700">
                Post to <span className="text-secondary-400 font-normal">(compatible with {STEPS[0]} → {contentType ? CONTENT_TYPES.find((c) => c.id === contentType)?.name : ''})</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {eligiblePlatforms.map((p) => {
                  const isSelected = selected.includes(p.id);
                  const isConnected = connectedSet.has(p.id);
                  const destination = destinations[p.id];
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
                        <BrandIcon platform={p.id} className="w-8 h-8 rounded-lg" />
                        <span className="flex flex-col items-start">
                          <span className="text-sm font-medium text-secondary-900">{p.name}</span>
                          {isSelected && destination && (
                            <span className="text-[10px] text-primary-600 font-semibold">as {destination}</span>
                          )}
                        </span>
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
                    const shown = captionFor(id);
                    return (
                      <span key={id} className="flex items-center space-x-1.5 text-xs">
                        <BrandIcon platform={id} className="w-4 h-4 rounded" />
                        <span className="font-medium text-secondary-700">{cfg.name}</span>
                        <span className={platformCharState(shown.length, cfg.maxChars)}>
                          {shown.length}/{cfg.maxChars}
                        </span>
                        {shown.length > cfg.maxChars && (
                          <span className="text-error-600 font-semibold">Over limit!</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 — Preview */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-primary-600" />
              <h3 className="font-bold text-secondary-900">Preview</h3>
              <span className="text-sm text-secondary-500">
                — how your post looks on each platform ({selected.length})
              </span>
            </div>
            {previewItems.length === 0 ? (
              <div className="p-8 text-center text-secondary-400 border-2 border-dashed border-secondary-200 rounded-xl">
                Select at least one platform to preview.
              </div>
            ) : (
              <PlatformPreviews items={previewItems} />
            )}
          </div>
        )}

        {/* STEP 4 — Schedule */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock4 className="w-4 h-4 text-primary-600" />
              <h3 className="font-bold text-secondary-900">Schedule</h3>
              <span className="text-sm text-secondary-500">— when should this go live?</span>
            </div>
            <div className="flex items-center space-x-4">
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
              <div className="flex items-center space-x-3">
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
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              className="bg-gradient-to-r from-primary-600 to-primary-700"
              onClick={() => canNext && setStep((s) => s + 1)}
              disabled={!canNext}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              className="bg-gradient-to-r from-primary-600 to-primary-700"
              onClick={handlePost}
              loading={sending}
              disabled={sending || uploading}
              icon={<Send className="w-4 h-4" />}
            >
              {mode === 'now' ? 'Post Now' : 'Schedule Post'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
