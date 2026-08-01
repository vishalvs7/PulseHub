'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Upload,
  Film,
  Sparkles,
  Clock,
  AlertCircle,
  Scissors,
  Download,
  Loader2,
  X,
} from 'lucide-react';

interface Segment {
  start: number;
  end: number;
  text: string;
}

interface ViralMoment {
  start: number;
  end: number;
  quote: string;
  reason: string;
  hook: string;
}

export default function TranscriptToClip() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [moments, setMoments] = useState<ViralMoment[]>([]);
  const [transcribing, setTranscribing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith('video/') && !selected.type.startsWith('audio/')) {
      setError('Please upload a video or audio file');
      return;
    }
    setError('');
    setFile(selected);
    setTranscript('');
    setSegments([]);
    setMoments([]);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(selected));
  };

  const seekTo = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const transcribe = async () => {
    if (!file) {
      setError('Upload a video to transcribe');
      return;
    }
    setError('');
    setTranscribing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/ai/transcript', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transcription failed');
      setTranscript(data.text);
      setSegments(data.segments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setTranscribing(false);
    }
  };

  const analyze = async () => {
    if (segments.length === 0) {
      setError('Transcribe the video first');
      return;
    }
    setError('');
    setAnalyzing(true);

    try {
      const res = await fetch('/api/ai/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segments, videoDuration: duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setMoments(data.moments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload + preview */}
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="video/*,audio/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          {!file ? (
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full min-h-[280px] border-2 border-dashed border-secondary-300 rounded-lg flex flex-col items-center justify-center gap-3 text-secondary-500 hover:border-primary-500 hover:text-primary-600 transition"
            >
              <Upload className="w-10 h-10" />
              <span className="font-medium">Upload a video or podcast audio</span>
              <span className="text-sm">MP4, WebM, MP3, M4A, WAV — we&apos;ll find the viral moments</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-secondary-700">
                <span className="flex items-center gap-2 truncate">
                  <Film className="w-4 h-4 shrink-0" />
                  {file.name}
                </span>
                <button onClick={() => { setFile(null); setVideoUrl(''); }} className="text-secondary-400 hover:text-secondary-600" aria-label="Remove file">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {file.type.startsWith('video/') && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg bg-black max-h-[300px]"
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                />
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => inputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Change
                </Button>
                <Button onClick={transcribe} loading={transcribing} disabled={transcribing}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Transcribe
                </Button>
              </div>
            </div>
          )}

          {error && (
            <p className="flex items-center gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg px-4 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}

          {/* Transcript */}
          {transcript && (
            <div className="border border-secondary-200 rounded-lg bg-secondary-50 p-4 max-h-[260px] overflow-y-auto">
              <h3 className="text-sm font-semibold text-secondary-800 mb-2 flex items-center gap-2">
                <Film className="w-4 h-4 text-primary-600" />
                Full Transcript
              </h3>
              <p className="text-sm text-secondary-700 leading-relaxed whitespace-pre-wrap">{transcript}</p>
            </div>
          )}
        </div>

        {/* Viral moments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-secondary-900">Viral Key Moments</h3>
            <Button
              size="sm"
              onClick={analyze}
              loading={analyzing}
              disabled={analyzing || transcribing || segments.length === 0}
              className="bg-accent-600 hover:bg-accent-700"
            >
              {analyzing ? 'Finding hooks...' : 'Find Viral Moments'}
            </Button>
          </div>

          {moments.length === 0 && !analyzing ? (
            <div className="border border-dashed border-secondary-300 rounded-lg p-10 text-center text-secondary-400">
              <Scissors className="w-8 h-8 mx-auto mb-3" />
              <p className="text-sm">Transcribe your video, then we&apos;ll surface the 3 most clip-worthy moments with timestamps.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyzing && segments.length > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-secondary-500 py-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning transcript for high-retention hooks...
                </div>
              )}
              {moments.map((m, i) => (
                <div key={i} className="border border-secondary-200 rounded-lg p-4 hover:border-primary-400 transition bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-semibold rounded">
                      Moment #{i + 1}
                    </span>
                    <button
                      onClick={() => seekTo(m.start)}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
                    >
                      <Clock className="w-3 h-3" />
                      {formatTime(m.start)} - {formatTime(m.end)}
                    </button>
                  </div>
                  <p className="text-sm font-medium text-secondary-900 mb-1">“{m.quote}”</p>
                  <p className="text-xs text-secondary-500 mb-2">{m.reason}</p>
                  <p className="text-xs text-accent-700">🎯 Hook: {m.hook}</p>
                </div>
              ))}
              {moments.length > 0 && (
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Clip List (CSV)
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
