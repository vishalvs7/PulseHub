import Groq from 'groq-sdk';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptResult {
  text: string;
  segments: TranscriptSegment[];
}

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key-here') {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return new Response(JSON.stringify({ error: 'A media file is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Whitelist formats Whisper accepts.
  const allowed = new Set(['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'wav', 'webm']);
  const mime = file.type.split('/').pop()?.toLowerCase() || '';
  if (!allowed.has(mime)) {
    return new Response(JSON.stringify({ error: `Unsupported file type: ${mime || file.type}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });
    const transcription = await groq.audio.transcriptions.create({
      model: 'whisper-large-v3-turbo',
      file,
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    const data = transcription as unknown as {
      text?: string;
      segments?: Array<{ start?: number; end?: number; text?: string }>;
    };

    const segments: TranscriptSegment[] = (data.segments || []).map((seg) => ({
      start: Math.round(seg.start || 0),
      end: Math.round(seg.end || 0),
      text: (seg.text || '').trim(),
    }));

    return new Response(
      JSON.stringify({ text: data.text || segments.map((s) => s.text).join(' '), segments } satisfies TranscriptResult),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limited by the transcription provider' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Transcription failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
