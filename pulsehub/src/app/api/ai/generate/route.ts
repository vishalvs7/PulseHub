import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';
import { PLATFORM_KEYS } from '@/lib/ai/platforms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GEMINI_MODEL = 'gemini-3.5-flash';

type QuickAction = 'shorter' | 'professional' | 'hashtags' | 'analyze' | null;
type Mode = 'single' | 'platforms';

interface GenerateRequest {
  prompt?: string;
  quickAction?: QuickAction;
  mode?: Mode;
  media?: {
    mimeType: string;
    data: string;
  };
}

function buildSystemPrompt(quickAction: QuickAction, mode: Mode): string {
  const base =
    'You are PulseHub AI, a social media caption and media-analysis assistant. ' +
    'You write engaging, platform-aware captions. Output plain text only.';

  const actionRule = (() => {
    switch (quickAction) {
      case 'shorter':
        return 'Rewrite the user\u2019s text to be significantly shorter and punchier while keeping the core message.';
      case 'professional':
        return 'Rewrite the user\u2019s text with a polished, professional, business-appropriate tone.';
      case 'hashtags':
        return 'Keep the user\u2019s text and append 8-12 highly relevant, high-traffic hashtags on a new line.';
      case 'analyze':
        return 'Analyze the attached media (subject matter, colors, mood, text overlays) and write a tailored caption. Append 5 suggested hashtags on a new line.';
      default:
        return 'Write an engaging caption from the user\u2019s prompt. Append 3-5 relevant hashtags on a new line.';
    }
  })();

  if (mode === 'platforms') {
    return (
      base +
      ' Generate exactly FOUR platform-specific captions from the same prompt. ' +
      'Wrap each one with these exact markers, one block per platform, in this order:\n' +
      '<<<platform:instagram>>>\n' +
      '[Emoji-friendly, visual, with hashtags and an engagement call-to-action. Max 2200 chars.]\n' +
      '<<<platform:linkedin>>>\n' +
      '[Professional, structured with clean bullet points, focused on discussion. Max 3000 chars.]\n' +
      '<<<platform:twitter>>>\n' +
      '[Short, punchy, curiosity-driven. STRICTLY under 280 characters, no hashtag spam.]\n' +
      '<<<platform:tiktok>>>\n' +
      '[Casual, creator-first, hook-focused to match vertical video trends. Max 2200 chars.]\n' +
      'Do not add anything outside the four marker blocks.'
    );
  }

  return `${base} ${actionRule} Do not use markdown headers or wrapping quotes.`;
}

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = (err as { status: number }).status;
    if (status === 429) return 'RATE_LIMITED';
    if (status === 401 || status === 403) return 'AUTH_FAILED';
  }
  return 'PROVIDER_ERROR';
}

function sseStream(): { stream: ReadableStream; enqueue: (data: string) => void; close: () => void } {
  let controller!: ReadableStreamDefaultController;
  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });
  const encoder = new TextEncoder();
  const enqueue = (data: string) => {
    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
  };
  const close = () => controller.close();
  return { stream, enqueue, close };
}

async function streamFromGroq(
  prompt: string,
  systemPrompt: string,
  enqueue: (data: string) => void
): Promise<void> {
  const groq = new Groq({ apiKey: GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 2048,
    stream: true,
  });

  for await (const chunk of completion) {
    const text = chunk.choices?.[0]?.delta?.content ?? '';
    if (text) enqueue(JSON.stringify({ text }));
  }
}

async function streamFromGemini(
  prompt: string,
  systemPrompt: string,
  media?: { mimeType: string; data: string },
  enqueue?: (data: string) => void
): Promise<string> {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
  });

  const parts = media
    ? [
        { inlineData: { mimeType: media.mimeType, data: media.data } },
        { text: prompt },
      ]
    : [{ text: prompt }];

  const result = await model.generateContentStream({ contents: [{ role: 'user', parts }] });

  let accumulated = '';
  if (enqueue) {
    for await (const chunk of result.stream) {
      const full = chunk.text() ?? '';
      if (full.length > accumulated.length) {
        enqueue(JSON.stringify({ text: full.slice(accumulated.length) }));
        accumulated = full;
      }
    }
  } else {
    for await (const chunk of result.stream) {
      accumulated += chunk.text() ?? '';
    }
  }
  return accumulated;
}

async function handleGroqWithFallback(
  prompt: string,
  systemPrompt: string,
  media: { mimeType: string; data: string } | undefined,
  enqueue: (data: string) => void
): Promise<void> {
  try {
    if (media) {
      await streamFromGemini(prompt, systemPrompt, media, enqueue);
      return;
    }
    await streamFromGroq(prompt, systemPrompt, enqueue);
  } catch (err) {
    const msg = getErrorMessage(err);
    if ((msg === 'RATE_LIMITED' || msg === 'PROVIDER_ERROR') && GEMINI_API_KEY && !media) {
      await streamFromGemini(prompt, systemPrompt, undefined, enqueue);
      return;
    }
    enqueue(JSON.stringify({ error: msg }));
  }
}

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { prompt = '', quickAction = null, mode = 'single', media } = body;

  if (!prompt.trim() && !media) {
    return new Response(JSON.stringify({ error: 'A prompt or media attachment is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (media) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key-here') {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const systemPrompt = buildSystemPrompt(quickAction, mode);
  const { stream, enqueue, close } = sseStream();

  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  handleGroqWithFallback(prompt, systemPrompt, media, enqueue)
    .catch(() => enqueue(JSON.stringify({ error: 'UNKNOWN' })))
    .finally(close);

  return new Response(stream, { headers });
}
