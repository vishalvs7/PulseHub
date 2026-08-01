'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, Crop, Download, Loader2, AlertCircle, X, RefreshCw } from 'lucide-react';

export interface ResizePreset {
  id: string;
  label: string;
  platforms: string;
  ratio: number;
  width: number;
  height: number;
  desc: string;
}

export const RESIZE_PRESETS: ResizePreset[] = [
  { id: '9x16', label: '9:16 Vertical', platforms: 'TikTok · Reels · Shorts', ratio: 9 / 16, width: 1080, height: 1920, desc: 'Full-screen vertical for TikTok, Instagram Reels, YouTube Shorts' },
  { id: '1x1', label: '1:1 Square', platforms: 'Feed posts', ratio: 1, width: 1080, height: 1080, desc: 'Square crop for Instagram feed and X' },
  { id: '4x5', label: '4:5 Portrait', platforms: 'IG feed · X', ratio: 4 / 5, width: 1080, height: 1350, desc: 'Taller portrait that fills more of the mobile feed' },
  { id: '16x9', label: '16:9 Landscape', platforms: 'YouTube · LinkedIn', ratio: 16 / 9, width: 1280, height: 720, desc: 'Widescreen for YouTube and LinkedIn posts' },
];

export default function VideoResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [preset, setPreset] = useState<ResizePreset>(RESIZE_PRESETS[0]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outVideoRef = useRef<HTMLVideoElement>(null);
  const [resultUrl, setResultUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [sourceUrl, resultUrl]);

  useEffect(() => {
    // Live crop preview on the canvas whenever the frame changes.
    const drawPreview = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;
      drawCropFrame(video, canvas, preset);
    };
    const video = videoRef.current;
    if (video) {
      video.addEventListener('seeked', drawPreview);
      video.addEventListener('timeupdate', drawPreview);
    }
    return () => {
      video?.removeEventListener('seeked', drawPreview);
      video?.removeEventListener('timeupdate', drawPreview);
    };
  }, [preset]);

  function drawCropFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement, p: ResizePreset) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    // "Cover" crop: scale so the container is fully filled, then center-crop.
    const scale = Math.max(p.width / vw, p.height / vh);
    const sw = p.width / scale;
    const sh = p.height / scale;
    const sx = (vw - sw) / 2;
    const sy = (vh - sh) / 2;

    canvas.width = p.width;
    canvas.height = p.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, p.width, p.height);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, p.width, p.height);
  }

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }
    setError('');
    setFile(selected);
    setDone(false);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(URL.createObjectURL(selected));
  };

  const process = async () => {
    const video = videoRef.current;
    if (!video || !file) {
      setError('Upload a video first');
      return;
    }
    setError('');
    setProcessing(true);
    setProgress(0);

    try {
      await video.play().catch(() => {});
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas unavailable');

      const stream = canvas.captureStream(30);
      const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) =>
        MediaRecorder.isTypeSupported(m)
      );
      if (!mime) throw new Error('WebM recording is not supported in this browser');
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const donePromise = new Promise<void>((resolve, reject) => {
        recorder.onstop = () => resolve();
        recorder.onerror = (e) => reject(new Error('Recording failed'));
      });

      // Draw every frame at 30fps for the whole duration.
      const fps = 30;
      const frames = Math.ceil(duration * fps);
      recorder.start(100);

      video.currentTime = 0;
      for (let i = 0; i < frames; i++) {
        video.currentTime = i / fps;
        await waitForSeeked(video);
        drawCropFrame(video, canvas, preset);
        setProgress(Math.min(99, Math.round((i / frames) * 100)));
        if (i < frames - 1) {
          await sleep(1000 / fps - 10);
        }
      }

      recorder.stop();
      await donePromise;
      const blob = new Blob(chunks, { type: mime });
      setResultUrl(URL.createObjectURL(blob));
      setProgress(100);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const waitForSeeked = (video: HTMLVideoElement) =>
    new Promise<void>((resolve) => {
      if (video.seekable.length === 0 || Math.abs(video.currentTime - 0) < 0) resolve();
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      video.addEventListener('seeked', onSeeked);
    });

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `resized-${preset.id}.webm`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source */}
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
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
              className="w-full min-h-[260px] border-2 border-dashed border-secondary-300 rounded-lg flex flex-col items-center justify-center gap-3 text-secondary-500 hover:border-primary-500 hover:text-primary-600 transition"
            >
              <Upload className="w-10 h-10" />
              <span className="font-medium">Upload a video to resize</span>
              <span className="text-sm">We&apos;ll center-crop it to any platform format in your browser</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-secondary-700">
                <span className="flex items-center gap-2 truncate">
                  <Crop className="w-4 h-4 shrink-0" />
                  {file.name}
                </span>
                <button onClick={() => { setFile(null); setSourceUrl(''); }} className="text-secondary-400 hover:text-secondary-600" aria-label="Remove file">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <video
                ref={videoRef}
                src={sourceUrl}
                className="w-full rounded-lg bg-black max-h-[280px]"
                muted
                playsInline
                onLoadedMetadata={(e) => {
                  setDuration(e.currentTarget.duration);
                  e.currentTarget.currentTime = 0;
                }}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              />
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => inputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Change
                </Button>
                <span className="text-xs text-secondary-500">
                  {duration ? `${duration.toFixed(1)}s` : 'Loading...'} · frame {currentTime.toFixed(1)}s
                </span>
              </div>
            </div>
          )}
          {error && (
            <p className="flex items-center gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg px-4 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Output */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-secondary-800 flex items-center gap-2">
            <Crop className="w-4 h-4 text-primary-600" />
            Live Crop Preview
          </h3>
          <div className="bg-black rounded-lg flex items-center justify-center min-h-[280px] p-4">
            <canvas ref={canvasRef} className="max-w-full max-h-[280px] rounded" />
          </div>

          {done && resultUrl && (
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm text-sage-700 bg-sage-50 border border-sage-200 rounded-lg px-4 py-2">
                <RefreshCw className="w-4 h-4 shrink-0" />
                Resized {preset.label} ({preset.width}×{preset.height}) ready
              </p>
              <video ref={outVideoRef} src={resultUrl} controls className="w-full rounded-lg bg-black max-h-[180px]" />
              <Button onClick={download} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download {preset.id}.webm
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {RESIZE_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => { setPreset(p); setDone(false); }}
            className={`p-4 border rounded-lg text-left transition ${
              preset.id === p.id ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-secondary-200 hover:border-secondary-400'
            }`}
          >
            <div className="text-sm font-semibold text-secondary-900">{p.label}</div>
            <div className="text-xs text-accent-700 font-medium mt-0.5">{p.platforms}</div>
            <div className="text-xs text-secondary-500 mt-1">{p.width}×{p.height}</div>
          </button>
        ))}
      </div>

      <Button
        onClick={process}
        loading={processing}
        disabled={processing || !file}
        className="w-full md:w-auto bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing {progress}%
          </>
        ) : (
          <>
            <Crop className="w-4 h-4 mr-2" />
            Auto-Resize for {preset.label}
          </>
        )}
      </Button>
      {processing && (
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div className="h-2 rounded-full bg-accent-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
