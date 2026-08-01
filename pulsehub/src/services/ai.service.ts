// src/services/ai.service.ts
import { PLATFORM_KEYS } from '@/lib/ai/platforms';
import type { PlatformKey } from '@/lib/ai/platforms';
export type { PlatformKey } from '@/lib/ai/platforms';
import { PLATFORM_META } from '@/lib/ai/platforms';

export type QuickAction = 'shorter' | 'professional' | 'hashtags' | 'analyze' | null;

export { PLATFORM_META };

interface GenerateOptions {
  prompt: string;
  quickAction?: QuickAction;
  media?: { mimeType: string; data: string };
  mode?: 'single' | 'platforms';
  signal?: AbortSignal;
  onChunk?: (text: string) => void;
}

interface SsePayload {
  text?: string;
  error?: string;
}

/**
 * Calls /api/ai/generate and returns:
 * - single mode: the full caption string
 * - platforms mode: { [platform]: caption }
 */
export async function generateCaption(
  opts: GenerateOptions
): Promise<string | Partial<Record<PlatformKey, string>>> {
  const res = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: opts.prompt,
      quickAction: opts.quickAction ?? null,
      media: opts.media,
      mode: opts.mode ?? 'single',
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  if (!res.body) throw new Error('No response stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split('\n\n');
    buffer = events.pop() || '';

    for (const event of events) {
      if (!event.startsWith('data: ')) continue;
      const payload = event.slice(6);
      if (payload === '[DONE]') continue;
      try {
        const parsed: SsePayload = JSON.parse(payload);
        if (parsed.error) throw new Error(mapError(parsed.error));
        if (parsed.text) {
          full += parsed.text;
          opts.onChunk?.(parsed.text);
        }
      } catch {
        // ignore malformed frames
      }
    }
  }

  if (opts.mode === 'platforms') {
    return parsePlatformCaptions(full);
  }
  return full;
}

export function parsePlatformCaptions(raw: string): Partial<Record<PlatformKey, string>> {
  const result: Partial<Record<PlatformKey, string>> = {};
  for (const key of PLATFORM_KEYS) {
    const start = raw.indexOf(`<<<platform:${key}>>>`);
    const end = raw.indexOf('<<<platform:', start + 1);
    if (start !== -1) {
      const contentStart = start + `<<<platform:${key}>>>`.length;
      const content = end === -1 ? raw.slice(contentStart) : raw.slice(contentStart, end);
      result[key] = content.replace(/\n+$/, '').trim();
    }
  }
  return result;
}

export function mapError(code: string): string {
  switch (code) {
    case 'RATE_LIMITED':
      return 'Rate limit reached. Retrying with fallback provider...';
    case 'AUTH_FAILED':
      return 'Invalid API key. Check GROQ_API_KEY / GEMINI_API_KEY in .env.local.';
    case 'UNKNOWN':
      return 'The AI provider returned an error. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
