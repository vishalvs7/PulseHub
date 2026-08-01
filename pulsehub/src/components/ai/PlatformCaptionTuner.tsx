'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Instagram,
  Linkedin,
  Twitter,
  Music2,
  Sparkles,
  Copy,
  Check,
  CalendarClock,
  AlertCircle,
  Wand2,
} from 'lucide-react';
import { generateCaption, parsePlatformCaptions } from '@/services/ai.service';
import { PLATFORM_KEYS, PLATFORM_META } from '@/lib/ai/platforms';
import type { PlatformKey } from '@/lib/ai/platforms';

interface PlatformCaptionTunerProps {
  onApply?: (platform: PlatformKey, caption: string) => void;
  initialPrompt?: string;
}

const PLATFORM_ICONS: Record<PlatformKey, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  tiktok: Music2,
};

export default function PlatformCaptionTuner({ onApply, initialPrompt }: PlatformCaptionTunerProps) {
  const [prompt, setPrompt] = useState(initialPrompt ?? '');
  const [captions, setCaptions] = useState<Partial<Record<PlatformKey, string>>>({});
  const [activeTab, setActiveTab] = useState<PlatformKey>('instagram');
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const rawBufferRef = useRef('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleChunk = useCallback((text: string) => {
    // Accumulate the raw stream and re-parse markers on every chunk.
    rawBufferRef.current += text;
    const parsed = parsePlatformCaptions(rawBufferRef.current);
    setCaptions(parsed);
  }, []);

  const generate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Enter a prompt to generate platform captions');
      return;
    }
    setError('');
    setStreaming(true);
    setCopied(false);
    rawBufferRef.current = '';
    setCaptions({});

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await generateCaption({
        prompt,
        mode: 'platforms',
        signal: controller.signal,
        onChunk: handleChunk,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setStreaming(false);
    }
  }, [prompt, handleChunk]);

  const copyActive = async () => {
    const caption = captions[activeTab];
    if (!caption) return;
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyActive = () => {
    const caption = captions[activeTab];
    if (!caption) return;
    onApply?.(activeTab, caption);
  };

  const activeCaption = captions[activeTab] ?? '';
  const activeMeta = PLATFORM_META[activeTab];
  const overLimit = activeCaption.length > activeMeta.limit;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left — input */}
      <div className="flex flex-col space-y-4">
        <label className="text-sm font-semibold text-secondary-700">
          Describe your post — we&apos;ll tailor it for 4 platforms
        </label>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="e.g. Launching our new eco-friendly water bottle — 50% off this week"
          className="w-full p-4 border border-secondary-300 rounded-lg resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
        />
        <Button
          onClick={generate}
          loading={streaming}
          disabled={streaming}
          className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700"
          icon={<Wand2 className="w-4 h-4" />}
        >
          Generate 4 Captions
        </Button>
        {error && (
          <p className="flex items-center gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg px-4 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {/* Right — tabbed output */}
      <div className="flex flex-col border border-secondary-200 rounded-lg bg-secondary-50 min-h-[340px]">
        <div className="flex border-b border-secondary-200 overflow-x-auto no-scrollbar">
          {PLATFORM_KEYS.map((key) => {
            const Icon = PLATFORM_ICONS[key];
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? 'border-b-2 border-primary-600 text-primary-700 bg-white'
                    : 'text-secondary-600 hover:text-primary-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {PLATFORM_META[key].label}
                {captions[key] ? <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> : null}
              </button>
            );
          })}
        </div>

        <div className="flex-1 p-4">
          {activeCaption ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-secondary-500">
                  {activeCaption.length} / {activeMeta.limit} chars
                </span>
                {overLimit && (
                  <span className="flex items-center gap-1 text-xs text-error-600 font-medium">
                    <AlertCircle className="w-3 h-3" /> Exceeds {activeMeta.label} limit
                  </span>
                )}
              </div>
              <textarea
                value={activeCaption}
                onChange={(e) => setCaptions({ ...captions, [activeTab]: e.target.value })}
                rows={9}
                className="w-full p-3 border border-secondary-200 rounded-lg resize-none bg-white text-sm text-secondary-900 focus:border-primary-500 outline-none"
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-secondary-400 text-sm">
              {streaming ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Writing your {PLATFORM_META[activeTab].label} caption...
                </span>
              ) : (
                'Your platform-tailored captions will stream here.'
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-4 py-3 border-t border-secondary-200">
          <Button
            variant="outline"
            size="sm"
            onClick={copyActive}
            disabled={!activeCaption || streaming}
            icon={copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            size="sm"
            onClick={applyActive}
            disabled={!activeCaption || streaming}
            icon={<CalendarClock className="w-4 h-4" />}
            className="bg-primary-600 hover:bg-primary-700"
          >
            Apply to Scheduler
          </Button>
        </div>
      </div>
    </div>
  );
}
