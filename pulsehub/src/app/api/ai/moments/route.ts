import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface ViralMoment {
  start: number;
  end: number;
  quote: string;
  reason: string;
  hook: string;
}

interface RequestBody {
  segments: Array<{ start: number; end: number; text: string }>;
  videoDuration?: number;
}

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key-here') {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const segments = (body.segments || []).filter((s) => s.text.trim());
  if (segments.length === 0) {
    return new Response(JSON.stringify({ error: 'No transcript segments provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const transcript = segments
    .map((s) => `[${formatTime(s.start)}-${formatTime(s.end)}] ${s.text}`)
    .join('\n');

  const systemPrompt =
    'You are a short-form content strategist for TikTok, Instagram Reels, and YouTube Shorts. ' +
    'Given a video transcript with timestamps, identify the 3 most viral or high-retention moments ' +
    '(best quotes, emotional hooks, strong insights). ' +
    'Return ONLY a valid JSON array with exactly 3 objects, each with keys: ' +
    '"start" (number, seconds), "end" (number, seconds), "quote" (the exact transcript text, max 30 words), ' +
    '"reason" (why it will hook viewers, max 20 words), "hook" (an opening line for the clip, max 15 words). ' +
    'Use the nearest segment timestamps. Do not include any text outside the JSON.';

  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Video duration: ${body.videoDuration ? formatTime(body.videoDuration) : 'unknown'}s\n\nTranscript:\n${transcript}` },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    });

    const raw = completion.choices[0]?.message?.content || '';
    const json = raw.match(/\[[\s\S]*\]/)?.[0] || '[]';
    const parsed = JSON.parse(json) as Array<{ start?: number; end?: number; quote?: string; reason?: string; hook?: string }>;

    const moments: ViralMoment[] = parsed.slice(0, 3).map((m) => ({
      start: Math.max(0, Math.round(m.start || 0)),
      end: Math.round(m.end || (m.start || 0) + 15),
      quote: (m.quote || '').trim(),
      reason: (m.reason || '').trim(),
      hook: (m.hook || '').trim(),
    }));

    return new Response(JSON.stringify({ moments }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limited by the AI provider' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Moment analysis failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
