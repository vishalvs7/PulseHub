'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Zap,
  Briefcase,
  Flame,
  ImageIcon,
  Copy,
  Check,
  CalendarClock,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';

export type QuickAction = 'shorter' | 'professional' | 'hashtags' | 'analyze' | null;

interface AIAssistantProps {
  onApply?: (caption: string) => void;
  placeholder?: string;
}

const QUICK_ACTIONS: { id: QuickAction; label: string; icon: typeof Zap }[] = [
  { id: 'shorter', label: 'Make Shorter', icon: Zap },
  { id: 'professional', label: 'Professional Tone', icon: Briefcase },
  { id: 'hashtags', label: 'Viral Hashtags', icon: Flame },
  { id: 'analyze', label: 'Analyze Media', icon: ImageIcon },
];

interface SsePayload {
  text?: string;
  error?: string;
}

export default function AIAssistant({ onApply, placeholder }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [activeAction, setActiveAction] = useState<QuickAction>(null);
  const [media, setMedia] = useState<{ mimeType: string; data: string; name: string } | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [output]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Only image or video files are supported');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      setMedia({
        mimeType: file.type,
        data: base64,
        name: file.name,
      });
      setActiveAction('analyze');
    };
    reader.readAsDataURL(file);
  };

  const generate = useCallback(async () => {
    if (!prompt.trim() && !media) {
      setError('Enter a prompt or attach media to get started');
      return;
    }
    setError('');
    setOutput('');
    setStreaming(true);
    setCopied(false);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, quickAction: activeAction, media }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          if (!event.startsWith('data: ')) continue;
          const payload = event.slice(6) as string;
          if (payload === '[DONE]') continue;
          try {
            const parsed: SsePayload = JSON.parse(payload);
            if (parsed.error) {
              setError(mapError(parsed.error));
              break;
            }
            if (parsed.text) {
              setOutput((prev) => prev + parsed.text);
            }
          } catch {
            // ignore malformed frames
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setStreaming(false);
    }
  }, [prompt, media, activeAction]);

  const mapError = (code: string): string => {
    switch (code) {
      case 'RATE_LIMITED':
        return 'Rate limit reached. Falling back to Gemini...';
      case 'AUTH_FAILED':
        return 'Invalid API key. Check GROQ_API_KEY / GEMINI_API_KEY in .env.local.';
      case 'UNKNOWN':
        return 'The AI provider returned an error. Please try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apply = () => {
    if (!output) return;
    onApply?.(output);
    window.dispatchEvent(new CustomEvent('pulsehub:apply-caption', { detail: output }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left — User Input */}
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder || 'Describe what you want to post, or paste your draft caption here...'}
            rows={6}
            className="w-full p-4 pr-10 border border-secondary-300 rounded-lg resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          />
          {prompt && (
            <button
              onClick={() => setPrompt('')}
              className="absolute top-3 right-3 p-1 text-secondary-400 hover:text-secondary-600"
              aria-label="Clear prompt"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {media && (
          <div className="flex items-center justify-between px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg">
            <span className="flex items-center gap-2 text-sm text-primary-700 truncate">
              <ImageIcon className="w-4 h-4 shrink-0" />
              {media.name}
            </span>
            <button onClick={() => setMedia(null)} className="text-secondary-400 hover:text-secondary-600" aria-label="Remove media">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const active = activeAction === action.id;
            return (
              <button
                key={action.id}
                onClick={() => {
                  setActiveAction(active ? null : action.id);
                  if (action.id === 'analyze' && !media) {
                    document.getElementById('ai-media-upload')?.click();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition ${
                  active
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-secondary-300 text-secondary-700 hover:border-primary-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
          <input
            id="ai-media-upload"
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </div>

        <Button
          onClick={generate}
          loading={streaming}
          disabled={streaming}
          className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700"
          icon={<Sparkles className="w-4 h-4" />}
        >
          Generate Caption
        </Button>

        {error && (
          <p className="text-sm text-error-600 bg-error-50 border border-error-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Right — Live AI Output */}
      <div className="flex flex-col border border-secondary-200 rounded-lg bg-secondary-50 min-h-[300px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-200">
          <span className="text-sm font-semibold text-secondary-700">AI Output</span>
          {streaming && (
            <span className="flex items-center gap-2 text-sm text-secondary-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Writing...
            </span>
          )}
        </div>

        <div ref={outputRef} className="flex-1 p-4 overflow-y-auto max-h-[320px] whitespace-pre-wrap text-secondary-900 text-sm">
          {output || <span className="text-secondary-400">Generated captions will stream here in real time.</span>}
        </div>

        <div className="flex items-center gap-3 px-4 py-3 border-t border-secondary-200">
          <Button
            variant="outline"
            size="sm"
            onClick={copyOutput}
            disabled={!output || streaming}
            icon={copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            size="sm"
            onClick={apply}
            disabled={!output || streaming}
            icon={<CalendarClock className="w-4 h-4" />}
            className="bg-primary-600 hover:bg-primary-700"
          >
            Apply to Post Scheduler
          </Button>
        </div>
      </div>
    </div>
  );
}
