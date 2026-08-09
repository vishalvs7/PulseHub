'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Upload, Crop, Download, Loader2, AlertCircle, AlertTriangle, X, RefreshCw, Play, AudioLines,
} from 'lucide-react';
import { RESIZE_PRESETS, type ResizePreset } from '@/components/ai/VideoResizer';

type FitMode = 'cover' | 'blur' | 'letterbox';

const FIT_MODES: { id: FitMode; label: string; desc: string }[] = [
  {
    id: 'cover',
    label: 'Center-crop',
    desc: 'Fill the frame (may cut sides). Drag the window below to choose what stays visible.',
  },
  {
    id: 'blur',
    label: 'Blurred fit',
    desc: 'Complete clip is kept; empty space is filled with a blurred copy. Nothing is cut.',
  },
  {
    id: 'letterbox',
    label: 'Letterbox',
    desc: 'Complete clip is kept with plain black bars. Nothing is cut.',
  },
];

function formatTime(t: number): string {
  if (!isFinite(t) || t < 0) return '00:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export default function ClipStudio() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [preset, setPreset] = useState<ResizePreset>(RESIZE_PRESETS[0]);
  const [fitMode, setFitMode] = useState<FitMode>('blur');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const outVideoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [current, setCurrent] = useState(0);
  const [resultUrl, setResultUrl] = useState('');

  // Cover-crop window (in source-video pixel space).
  const [pan, setPan] = useState({ x: 0, y: 0 }); // 0..1  = fraction of the unused axis used
  const [includeAudio, setIncludeAudio] = useState(false);
  const rafRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [sourceUrl, resultUrl]);

  useEffect(() => cleanup, [cleanup]);

  const drawInto = useCallback(
    (canvas: HTMLCanvasElement, w: number, h: number) => {
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      if (!video || !ctx) return;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      if (fitMode === 'blur') {
        // Background: shrunk + stretched copy for an impression of blur.
        const bw = Math.max(8, Math.round(w / 8));
        const bh = Math.max(8, Math.round(h / 8));
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(video, 0, 0, bw, bh, 0, 0, w, h);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }

      if (fitMode === 'cover') {
        const scale = Math.max(w / vw, h / vh);
        let sw = w / scale;
        let sh = h / scale;
        let sx = (vw - sw) * pan.x;
        let sy = (vh - sh) * pan.y;
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
      } else {
        // Fit whole frame, centered.
        const fs = Math.min(w / vw, h / vh);
        const dw = vw * fs;
        const dh = vh * fs;
        ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
      }
    },
    [fitMode, pan]
  );

  // Update the preview canvas whenever the frame / mode / pan changes.
  useEffect(() => {
    const draw = () => {
      const c = previewRef.current;
      if (!c) return;
      const w = preset.width;
      const h = preset.height;
      if (c.width !== w) c.width = w;
      if (c.height !== h) c.height = h;
      drawInto(c, w, h);
    };
    draw();
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', draw);
      video.addEventListener('seeked', draw);
      video.addEventListener('loadeddata', () => setCurrent(video.currentTime));
    }
    return () => {
      video?.removeEventListener('timeupdate', draw);
      video?.removeEventListener('seeked', draw);
    };
  }, [drawInto, preset]);

  // Crop-adjustment canvas: full video fitted, with the crop window overlay.
  useEffect(() => {
    const cvs = cropCanvasRef.current;
    const video = videoRef.current;
    if (!cvs || !video || fitMode !== 'cover') return;
    const cw = 360;
    const ch = Math.round((cw / (preset.width / preset.height)));
    if (cvs.width !== cw) cvs.width = cw;
    if (cvs.height !== ch) cvs.height = ch;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, cw, ch);
    const fs = Math.min(cw / vw, ch / vh);
    const dw = vw * fs;
    const dh = vh * fs;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.drawImage(video, dx, dy, dw, dh);

    // Darken outside the crop region.
    const scale = Math.max(cw / vw, ch / vh);
    const sw = cw / scale;
    const sh = ch / scale;
    const rx = dx + (vw - sw) * pan.x * fs;
    const ry = dy + (vh - sh) * pan.y * fs;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.clearRect(rx, ry, sw * fs, sh * fs);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rx, ry, sw * fs, sh * fs);
    if (sw * fs > 34 && sh * fs > 34) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(rx + (sw * fs) / 2, ry + (sh * fs) / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [pan.x, pan.y, fitMode, preset]);

  const handleDragCrop = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (fitMode !== 'cover') return;
    const cvs = cropCanvasRef.current;
    const video = videoRef.current;
    if (!cvs || !video) return;
    const rect = cvs.getBoundingClientRect();
    const cw = cvs.width;
    const ch = cvs.height;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const onMove = (e: PointerEvent) => {
      const x = ((e.clientX - rect.left) / rect.width) * cw;
      const y = ((e.clientY - rect.top) / rect.height) * ch;
      const fs = Math.min(cw / vw, ch / vh);
      const dw = vw * fs;
      const dh = vh * fs;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      const scale = Math.max(cw / vw, ch / vh);
      const sw = cw / scale;
      const sh = ch / scale;
      const fw = sw * fs;
      const fh = sh * fs;
      const nx = clamp((x - dx - fw / 2) / (dw - fw), 0, 1);
      const ny = clamp((y - dy - fh / 2) / (dh - fh), 0, 1);
      setPan((p) => ({ x: Number.isFinite(nx) ? nx : p.x, y: Number.isFinite(ny) ? ny : p.y }));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleFile = (selected: File) => {
    if (!selected.type.startsWith('video/')) {
      setError('Please upload a video file.');
      return;
    }
    setError('');
    setFile(selected);
    setDone(false);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl(URL.createObjectURL(selected));
    setTrimStart(0);
    setTrimEnd(0);
    setCurrent(0);
    setPan({ x: 0, y: 0 });
  };

  const waitForSeeked = (video: HTMLVideoElement) =>
    new Promise<void>((resolve) => {
      if (video.seekable.length === 0) {
        resolve();
        return;
      }
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      video.addEventListener('seeked', onSeeked);
    });

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const processFrameStep = async (): Promise<Blob> => {
    const video = videoRef.current;
    const canvas = exportCanvasRef.current;
    if (!video || !canvas) throw new Error('Canvas unavailable');

    canvas.width = preset.width;
    canvas.height = preset.height;
    const stream = canvas.captureStream(30);
    const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) =>
      MediaRecorder.isTypeSupported(m)
    );
    if (!mime) throw new Error('WebM recording is not supported in this browser.');
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    const donePromise = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    const fps = 30;
    const start = trimStart;
    const end = trimEnd;
    const frames = Math.max(1, Math.ceil((end - start) * fps));
    recorder.start(100);
    video.currentTime = start;
    for (let i = 0; i < frames; i++) {
      video.currentTime = start + i / fps;
      await waitForSeeked(video);
      drawInto(canvas, preset.width, preset.height);
      setProgress(Math.min(99, Math.round((i / frames) * 100)));
      if (i < frames - 1) await sleep(1000 / fps - 10);
    }
    recorder.stop();
    await donePromise;
    return new Blob(chunks, { type: mime });
  };

  const processRealtime = async (): Promise<Blob> => {
    // Real-time playback so the audio track can be captured alongside the re-drawn frames.
    const video = videoRef.current;
    const canvas = exportCanvasRef.current;
    if (!video || !canvas) throw new Error('Canvas unavailable');

    canvas.width = preset.width;
    canvas.height = preset.height;
    const canvasStream = canvas.captureStream(30);
    let audioTrack: MediaStreamTrack | null = null;
    try {
      const vs = (video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream?.();
      audioTrack = vs?.getAudioTracks()?.[0] ?? null;
      if (audioTrack) canvasStream.addTrack(audioTrack);
    } catch {
      audioTrack = null;
    }

    const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) =>
      MediaRecorder.isTypeSupported(m)
    );
    if (!mime) throw new Error('WebM recording is not supported in this browser.');
    const recorder = new MediaRecorder(canvasStream, {
      mimeType: mime,
      videoBitsPerSecond: 8_000_000,
      audioBitsPerSecond: 128_000,
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    const donePromise = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    const start = trimStart;
    const end = trimEnd;
    const draw = () => drawInto(canvas, preset.width, preset.height);
    const loop = () => {
      draw();
      if (video.currentTime < end && !video.paused && !video.ended) {
        rafRef.current = requestAnimationFrame(loop);
      } else if (video.currentTime >= end || video.ended) {
        cancelAnimationFrame(rafRef.current ?? 0);
      }
    };

    recorder.start(250);
    video.currentTime = start;
    await new Promise<void>((resolve) => {
      const onLoaded = () => {
        video.removeEventListener('seeked', onLoaded);
        resolve();
      };
      video.addEventListener('seeked', onLoaded);
    });
    video.muted = false;
    rafRef.current = requestAnimationFrame(loop);
    await video.play();

    await new Promise<void>((resolve) => {
      const tick = () => {
        const p = (video.currentTime - start) / (end - start);
        setProgress(Math.min(99, Math.round(p * 100)));
        if (video.currentTime >= end || video.ended) {
          video.removeEventListener('timeupdate', tick);
          resolve();
        }
      };
      video.addEventListener('timeupdate', tick);
    });

    cancelAnimationFrame(rafRef.current || 0);
    video.pause();
    draw();
    recorder.stop();
    await donePromise;
    return new Blob(chunks, { type: mime });
  };

  const process = async () => {
    if (!file) {
      setError('Upload a video first.');
      return;
    }
    if (trimEnd - trimStart < 0.25) {
      setError('The trim range is too short.');
      return;
    }
    setError('');
    setProcessing(true);
    setProgress(0);
    try {
      const blob = includeAudio ? await processRealtime() : await processFrameStep();
      setResultUrl(URL.createObjectURL(blob));
      setProgress(100);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `clip-${preset.id}${trimStart ? `-${formatTime(trimStart)}` : ''}.webm`;
    a.click();
  };

  const seekTo = (t: number, play = false) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = clamp(t, 0, duration);
    setCurrent(t);
    if (play) void video.play();
  };

  const timelineWidthPct = duration > 0 ? ((trimEnd - trimStart) / duration) * 100 : 0;

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
              className="w-full min-h-[240px] border-2 border-dashed border-secondary-300 rounded-lg flex flex-col items-center justify-center gap-3 text-secondary-500 hover:border-primary-500 hover:text-primary-600 transition"
            >
              <Upload className="w-10 h-10" />
              <span className="font-medium">Upload a video to resize & trim</span>
              <span className="text-sm">Center-crop, blurred-fit, or letterbox to any platform format</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-secondary-700">
                <span className="flex items-center gap-2 truncate">
                  <Crop className="w-4 h-4 shrink-0" />
                  {file.name}
                </span>
                <button
                  onClick={() => { setFile(null); setSourceUrl(''); setResultUrl(''); setDone(false); }}
                  className="text-secondary-400 hover:text-secondary-600"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <video
                ref={videoRef}
                src={sourceUrl}
                className="w-full rounded-lg bg-black max-h-[260px]"
                muted={!includeAudio}
                playsInline
                controls
                preload="metadata"
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration;
                  setDuration(d);
                  setTrimEnd(d);
                  e.currentTarget.currentTime = 0;
                }}
                onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
              />
              <p className="text-xs text-secondary-500">
                {duration ? `${duration.toFixed(1)}s` : 'Loading…'} · trim {formatTime(trimStart)} →{' '}
                {formatTime(trimEnd)} ({((trimEnd - trimStart) || 0).toFixed(1)}s)
              </p>
            </div>
          )}

          {/* Format presets */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-800 mb-2">Output format</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {RESIZE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPreset(p); setDone(false); }}
                  className={`p-3 border rounded-lg text-left transition ${
                    preset.id === p.id
                      ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                      : 'border-secondary-200 hover:border-secondary-400'
                  }`}
                >
                  <div className="text-sm font-semibold text-secondary-900">{p.label}</div>
                  <div className="text-xs text-accent-700 font-medium mt-0.5">{p.platforms}</div>
                  <div className="text-xs text-secondary-500 mt-1">{p.width}×{p.height}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-secondary-800 flex items-center gap-2">
            <Crop className="w-4 h-4 text-primary-600" />
            Preview
          </h3>
          <div className="bg-black rounded-lg flex items-center justify-center min-h-[260px] p-4">
            <canvas
              ref={previewRef}
              className="max-w-full max-h-[300px] rounded shadow-lg"
              style={{ aspectRatio: `${preset.width}/${preset.height}` }}
            />
          </div>

          {/* Fit mode */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-800 mb-2">How to fill the new size</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FIT_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setFitMode(m.id); setDone(false); }}
                  className={`p-3 border rounded-lg text-left transition ${
                    fitMode === m.id
                      ? 'border-accent-600 bg-accent-50 ring-1 ring-accent-600'
                      : 'border-secondary-200 hover:border-secondary-400'
                  }`}
                >
                  <div className="text-sm font-semibold text-secondary-900">{m.label}</div>
                  <div className="text-xs text-secondary-500 mt-1">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {fitMode === 'cover' && (
            <div>
              <h3 className="text-sm font-semibold text-secondary-800 mb-2">
                Choose what to keep in frame
              </h3>
              <div className="border border-secondary-200 rounded-lg p-3 bg-secondary-50">
                <canvas
                  ref={cropCanvasRef}
                  className="w-full rounded cursor-move"
                  onPointerDown={handleDragCrop}
                />
                <p className="text-xs text-secondary-500 mt-2">
                  Grayed out areas are cut. Click and drag the bright window to choose the
                  visible part instead of a blind center zoom.
                </p>
              </div>
            </div>
          )}

          {/* Trim */}
          <div>
            <h3 className="text-sm font-semibold text-secondary-800 mb-2">Trim</h3>
            <div className="border border-secondary-200 rounded-lg p-4 space-y-3">
              <TrimmingBar
                duration={duration}
                start={trimStart}
                end={trimEnd}
                current={current}
                onChange={(s, e) => { setTrimStart(s); setTrimEnd(e); setDone(false); }}
                onScrub={(t) => seekTo(t)}
              />
              <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-600">
                <span>
                  Start <b>{formatTime(trimStart)}</b>
                </span>
                <span>
                  End <b>{formatTime(trimEnd)}</b>
                </span>
                <span className="text-secondary-400">Duration {(trimEnd - trimStart || 0).toFixed(1)}s</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => seekTo(Math.max(0, current - 0.05))}>
                  <span className="w-3 text-center">-</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => seekTo(Math.min(duration, current + 0.05))}>
                  <span className="w-3 text-center">+</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => seekTo(trimStart, true)}>
                  <Play className="w-3 h-3 mr-1" /> Preview trim
                </Button>
                <label className="flex items-center gap-2 text-secondary-600 ml-auto cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAudio}
                    onChange={(e) => setIncludeAudio(e.target.checked)}
                    className="accent-accent-600"
                  />
                  <span className="flex items-center gap-1">
                    <AudioLines className="w-3.5 h-3.5" /> Keep audio
                    <span className="text-secondary-400">(real-time render)</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-error-700 bg-error-50 border border-error-200 rounded-lg px-4 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}

          {done && resultUrl && (
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm text-sage-700 bg-sage-50 border border-sage-200 rounded-lg px-4 py-2">
                <RefreshCw className="w-4 h-4 shrink-0" />
                {preset.label} clip ready {includeAudio ? 'with audio' : ''} — {formatTime(trimStart)} →{' '}
                {formatTime(trimEnd)}
              </p>
              <video ref={outVideoRef} src={resultUrl} controls className="w-full rounded-lg bg-black max-h-[180px]" />
              <Button onClick={download} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download clip
              </Button>
            </div>
          )}

          <Button
            onClick={process}
            loading={processing}
            disabled={processing || !file}
            className="w-full md:w-auto bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700"
          >
            {processing ? (
              <>
                Rendering {progress}%
              </>
            ) : (
              <>
                <Crop className="w-4 h-4 mr-2" />
                Render & download
              </>
            )}
          </Button>
          {processing && (
            <div className="w-full bg-secondary-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-accent-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TrimmingBarProps {
  duration: number;
  start: number;
  end: number;
  current: number;
  onChange: (start: number, end: number) => void;
  onScrub: (t: number) => void;
}

function TrimmingBar({ duration, start, end, current, onChange, onScrub }: TrimmingBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ handle: 'start' | 'end' | 'scrub' | null }>({ handle: null });

  const timeFromClientX = (clientX: number): number => {
    const el = barRef.current;
    if (!el || duration <= 0) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return ratio * duration;
  };

  const onPointerDown = (ev: React.PointerEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const el = barRef.current;
    if (!el) return;
    el.setPointerCapture(ev.pointerId);
    const t = timeFromClientX(ev.clientX);
    const leftPx = (start / duration) * el.offsetWidth;
    const rightPx = (end / duration) * el.offsetWidth;
    if (Math.abs(ev.clientX - (el.getBoundingClientRect().left + leftPx)) < 12) {
      dragRef.current.handle = 'start';
    } else if (Math.abs(ev.clientX - (el.getBoundingClientRect().left + rightPx)) < 12) {
      dragRef.current.handle = 'end';
    } else if (t > start && t < end) {
      dragRef.current.handle = 'scrub';
      onScrub(t);
    }
  };

  const onPointerMove = (ev: React.PointerEvent<HTMLDivElement>) => {
    const handle = dragRef.current.handle;
    if (!handle) return;
    const t = ev.clientX;
    const tt = duration <= 0 ? 0 : t; // fallback
    const _t = tt;
    const e = timeFromClientX(_t);
    if (handle === 'start') {
      const next = clamp(e, 0, Math.max(0, end - 0.25));
      onChange(next, end);
    } else if (handle === 'end') {
      const next = clamp(e, Math.min(duration, start + 0.25), duration);
      onChange(start, next);
    } else if (handle === 'scrub') {
      onScrub(clamp(e, start, end));
    }
  };

  const onPointerUp = () => {
    dragRef.current.handle = null;
  };

  const startPct = duration > 0 ? (start / duration) * 100 : 0;
  const endPct = duration > 0 ? (end / duration) * 100 : 100;
  const curPct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      ref={barRef}
      className="relative h-8 select-none touch-none cursor-pointer"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-secondary-200 rounded-full" />
      <div
        className="absolute top-1/2 -translate-y-1/2 bg-accent-600 h-1.5 rounded-full"
        style={{ left: `${startPct}%`, width: `${Math.max(0, endPct - startPct)}%` }}
      />
      {/* playhead */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/90"
        style={{ left: `${curPct}%` }}
      />
      {/* start pin */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-5 rounded bg-primary-600 border border-white shadow"
        style={{ left: `${startPct}%` }}
      />
      {/* end pin */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-5 rounded bg-primary-600 border border-white shadow"
        style={{ left: `${endPct}%` }}
      />
    </div>
  );
}