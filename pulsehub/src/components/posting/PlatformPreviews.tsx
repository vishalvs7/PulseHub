'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Repeat2, Play, ThumbsUp } from 'lucide-react';
import BrandIcon from './BrandIcon';
import type { CrossPostPlatform } from '@/lib/socialPlatforms';

export interface PreviewMedia {
  url: string;
  name: string;
}

export interface PlatformPreviewProps {
  platform: CrossPostPlatform;
  destination: string;
  content: string;
  media: PreviewMedia[];
  username: string;
  isDocument: boolean;
}

function useAspectWarn(url: string | undefined) {
  const [warn, setWarn] = useState<string | null>(null);
  return { warn, onLoad: (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    if (!url) return;
    const el = e.currentTarget as HTMLImageElement | HTMLVideoElement;
    const img = el as HTMLImageElement;
    const vid = el as HTMLVideoElement;
    const w = img.naturalWidth || vid.videoWidth || 0;
    const h = img.naturalHeight || vid.videoHeight || 0;
    if (w && h) {
      const ratio = w / h;
      if (ratio > 0.85 && ratio < 1.15) setWarn('Square media');
      else if (ratio < 0.85) setWarn('Vertical media');
      else setWarn('Horizontal media');
    }
  } };
}

function Media({ media, isDocument, ratio, previewUrl }: { media: PreviewMedia[]; isDocument: boolean; ratio?: string; previewUrl?: string }) {
  const first = media[0];
  const url = previewUrl || first?.url;
  if (isDocument || (first && !/\.(mp4|mov|webm)$/i.test(first.url))) {
    return (
      <div className={`w-full bg-secondary-100 flex items-center justify-center overflow-hidden ${ratio || ''}`}>
        {isDocument ? (
          <div className="text-center text-secondary-500">
            <div className="mx-auto w-10 h-12 bg-white border border-secondary-200 rounded flex items-center justify-center mb-1">
              <span className="text-[8px] font-bold text-secondary-400">PDF</span>
            </div>
            <span className="text-[10px]">{media[0]?.name || 'document.pdf'}</span>
          </div>
        ) : url ? (
          <img src={url} alt="post media" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-secondary-400">No media</span>
        )}
      </div>
    );
  }
  return (
    <div className={`w-full bg-secondary-100 relative overflow-hidden ${ratio || ''}`}>
      {url ? (
        <video src={url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
      ) : (
        <div className="h-full flex items-center justify-center text-secondary-400 text-xs">No media</div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <Play className="w-6 h-6 text-white drop-shadow" />
      </div>
    </div>
  );
}

function IgFrame(props: PlatformPreviewProps) {
  const { warn } = useAspectWarn(props.media[0]?.url);
  return (
    <div className="w-52 bg-white rounded-2xl border border-secondary-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 p-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-rose-600 p-[1.5px]">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span className="text-[7px] font-bold text-secondary-700">{props.username[0]?.toUpperCase() || 'U'}</span>
          </div>
        </div>
        <span className="text-[9px] font-semibold text-secondary-800">{props.username}</span>
        <span className="ml-auto text-secondary-400 font-bold">···</span>
      </div>
      <div className="relative">
        <Media media={props.media} isDocument={props.isDocument} ratio="aspect-square" />
        <span className="absolute top-1 right-1 px-1 py-0.5 bg-white/90 text-[7px] font-bold text-secondary-700 rounded">{props.destination}</span>
      </div>
      <div className="p-2 space-y-1">
        <div className="flex items-center gap-1.5 text-secondary-700">
          <Heart className="w-3 h-3" />
          <MessageCircle className="w-3 h-3" />
          <Share2 className="w-3 h-3" />
          <Bookmark className="w-3 h-3 ml-auto" />
        </div>
        <p className="text-[8px] text-secondary-600 leading-tight line-clamp-2">
          <span className="font-semibold">{props.username}</span> {props.content || 'Your caption goes here…'}
        </p>
        <div className="text-[7px] text-secondary-400 flex items-center gap-1">
          {props.content.length}/{2200} chars {warn && <span className="text-amber-600">· {warn}</span>}
        </div>
      </div>
    </div>
  );
}

function XFrame(props: PlatformPreviewProps) {
  return (
    <div className="w-60 bg-white rounded-xl border border-secondary-200 overflow-hidden shadow-sm">
      <div className="flex items-start gap-2 p-3">
        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
          {props.username[0]?.toUpperCase() || 'U'}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-secondary-900 leading-tight">
            {props.username} <span className="font-normal text-secondary-400">@{props.username.toLowerCase()} · 2m</span>
          </p>
          <p className="text-[10px] text-secondary-700 mt-1 leading-snug">
            {props.content || 'Your tweet goes here…'}
          </p>
          <div className="mt-2 rounded-xl overflow-hidden border border-secondary-200">
            <Media media={props.media} isDocument={props.isDocument} ratio="aspect-square" />
          </div>
          <div className="flex items-center justify-between mt-2 text-secondary-400 text-[9px] pr-2">
            <span className="flex items-center gap-1"><MessageCircle className="w-2.5 h-2.5" /> 12</span>
            <span className="flex items-center gap-1"><Repeat2 className="w-2.5 h-2.5" /> 3</span>
            <span className="flex items-center gap-1"><Heart className="w-2.5 h-2.5" /> 48</span>
            <span className="flex items-center gap-1"><Share2 className="w-2.5 h-2.5" /></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiFrame(props: PlatformPreviewProps) {
  return (
    <div className="w-60 bg-white rounded-xl border border-secondary-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 p-3 pb-2">
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
          {props.username[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="text-[10px] font-semibold text-secondary-900 leading-tight">{props.username}</p>
          <p className="text-[8px] text-secondary-400">Creator · 2h</p>
        </div>
        <span className="ml-auto text-secondary-300 font-bold">···</span>
      </div>
      <div className="px-3">
        <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 text-[7px] font-bold text-blue-600 rounded">{props.destination}</span>
      </div>
      <div className="p-3 pt-1">
        <p className="text-[10px] text-secondary-700 leading-snug line-clamp-3">{props.content || 'Your post text goes here…'}</p>
        <div className="mt-2 rounded-lg overflow-hidden border border-secondary-200">
          <Media media={props.media} isDocument={props.isDocument} ratio="aspect-square" />
        </div>
        <div className="flex items-center justify-between mt-2 text-[9px] text-secondary-400">
          <span className="flex items-center gap-1"><ThumbsUp className="w-2.5 h-2.5" /> 127</span>
          <span>18 comments · 6 reposts</span>
        </div>
      </div>
    </div>
  );
}

function TiktokFrame(props: PlatformPreviewProps) {
  return (
    <div className="w-28 rounded-2xl overflow-hidden shadow-md relative bg-secondary-900" style={{ aspectRatio: '9/16' }}>
      {props.media[0]?.url ? (
        <video src={props.media[0].url} className="absolute inset-0 w-full h-full object-cover" muted playsInline preload="metadata" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white/70">
          <div className="text-center"><Play className="w-5 h-5 mx-auto mb-1" />No video</div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
        <p className="text-[7px] text-white font-semibold">@{props.username.toLowerCase()}</p>
        <p className="text-[7px] text-white/90 leading-tight line-clamp-2">{props.content || 'Caption…'}</p>
      </div>
      <div className="absolute right-1.5 bottom-14 flex flex-col items-center gap-2 text-white text-[7px]">
        <Heart className="w-3.5 h-3.5" /><span>2.1K</span>
        <MessageCircle className="w-3.5 h-3.5" /><span>312</span>
        <Share2 className="w-3.5 h-3.5" /><span>Share</span>
      </div>
    </div>
  );
}

function YtFrame(props: PlatformPreviewProps) {
  return (
    <div className="w-64 bg-white rounded-xl border border-secondary-200 overflow-hidden shadow-sm">
      <div className="relative">
        <Media media={props.media} isDocument={props.isDocument} ratio="aspect-video" />
        <span className="absolute bottom-1 right-1 px-1 bg-black/70 text-[7px] text-white rounded">{props.destination}</span>
      </div>
      <div className="p-2.5">
        <p className="text-[10px] font-semibold text-secondary-900 leading-tight line-clamp-2">
          {props.content || 'Your video title goes here…'}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[7px] font-bold text-white">{props.username[0]?.toUpperCase() || 'U'}</div>
          <span className="text-[8px] text-secondary-500">{props.username} · 12K views · 3 days ago</span>
          <span className="ml-auto px-1.5 py-0.5 bg-red-600 text-white text-[7px] font-bold rounded">Subscribe</span>
        </div>
      </div>
    </div>
  );
}

function FbFrame(props: PlatformPreviewProps) {
  return (
    <div className="w-56 bg-white rounded-xl border border-secondary-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 p-2.5">
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white">{props.username[0]?.toUpperCase() || 'U'}</div>
        <div>
          <p className="text-[9px] font-semibold text-secondary-900 leading-tight">{props.username}</p>
          <p className="text-[7px] text-secondary-400">2h · 🌐</p>
        </div>
      </div>
      <div className="px-2.5">
        <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 text-[7px] font-bold text-blue-600 rounded">{props.destination}</span>
      </div>
      <p className="text-[9px] text-secondary-700 p-2.5 leading-snug line-clamp-3">{props.content || 'Your caption goes here…'}</p>
      <Media media={props.media} isDocument={props.isDocument} ratio="aspect-square" />
      <div className="flex items-center justify-between px-2.5 py-1.5 text-[8px] text-secondary-500">
        <span className="flex items-center gap-0.5"><ThumbsUp className="w-2.5 h-2.5 text-blue-500" /> 89</span>
        <span>24 comments</span>
      </div>
    </div>
  );
}

function ThreadsFrame(props: PlatformPreviewProps) {
  return (
    <div className="w-52 bg-white rounded-xl border border-secondary-200 overflow-hidden shadow-sm">
      <div className="flex items-start gap-2 p-3">
        <div className="w-6 h-6 rounded-full bg-secondary-900 flex items-center justify-center text-[8px] font-bold text-white">{props.username[0]?.toUpperCase() || 'U'}</div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-secondary-900">{props.username}</p>
          <p className="text-[9px] text-secondary-700 leading-snug mt-0.5 line-clamp-4">{props.content || 'Your thread post goes here…'}</p>
          <div className="mt-1.5 rounded-xl overflow-hidden border border-secondary-200">
            <Media media={props.media} isDocument={props.isDocument} ratio="aspect-square" />
          </div>
          <div className="flex items-center gap-3 mt-2 text-secondary-400 text-[9px]">
            <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" /> 87</span>
            <span className="flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> 14</span>
            <span className="flex items-center gap-0.5"><Repeat2 className="w-2.5 h-2.5" /> 6</span>
            <Share2 className="w-2.5 h-2.5 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PinterestFrame(props: PlatformPreviewProps) {
  return (
    <div className="w-36 rounded-xl overflow-hidden shadow-md bg-white relative">
      <div className="relative" style={{ aspectRatio: '2/3' }}>
        <Media media={props.media} isDocument={props.isDocument} />
        <span className="absolute top-1 right-1 px-1 py-0.5 bg-white/90 text-[7px] font-bold text-secondary-700 rounded">{props.destination}</span>
      </div>
      <div className="p-1.5">
        <p className="text-[8px] text-secondary-700 leading-tight line-clamp-2">{props.content || 'Pin title…'}</p>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-3 h-3 rounded-full bg-red-600 flex items-center justify-center text-[5px] font-bold text-white">{props.username[0]?.toUpperCase() || 'U'}</div>
          <span className="text-[7px] text-secondary-400">{props.username}</span>
        </div>
      </div>
    </div>
  );
}

function RedditFrame(props: PlatformPreviewProps) {
  return (
    <div className="w-60 bg-white rounded-xl border border-secondary-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-secondary-100">
        <div className="w-3 h-3 rounded-full bg-orange-500" />
        <span className="text-[8px] font-semibold text-secondary-500">r/PulseHub · u/{props.username.toLowerCase()}</span>
      </div>
      <div className="flex">
        <div className="flex flex-col items-center px-2 py-2 text-secondary-500 text-[9px] gap-0.5">
          <span className="text-secondary-700">▲</span>
          <span className="font-bold">127</span>
          <span className="text-secondary-700">▼</span>
        </div>
        <div className="p-2 pl-1 min-w-0">
          <p className="text-[10px] font-medium text-secondary-800 leading-snug line-clamp-2">
            {props.content || 'Your post title goes here…'}
          </p>
          <div className="mt-1.5 rounded-lg overflow-hidden border border-secondary-200 max-w-40">
            <Media media={props.media} isDocument={props.isDocument} ratio="aspect-square" />
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[8px] text-secondary-400">
            <span className="flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> 42</span>
            <span>Share</span>
            <span className="ml-auto">{props.destination}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const FRAMES: Record<string, React.ComponentType<PlatformPreviewProps>> = {
  instagram: IgFrame,
  twitter: XFrame,
  linkedin: LiFrame,
  tiktok: TiktokFrame,
  youtube: YtFrame,
  facebook: FbFrame,
  threads: ThreadsFrame,
  pinterest: PinterestFrame,
  reddit: RedditFrame,
};

export default function PlatformPreviews({ items }: { items: PlatformPreviewProps[] }) {
  return (
    <div className="flex flex-wrap gap-5">
      {items.map((item) => {
        const Frame = FRAMES[item.platform];
        if (!Frame) return null;
        return (
          <div key={item.platform} className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <BrandIcon platform={item.platform} className="w-5 h-5 rounded-md" />
              <span className="text-xs font-semibold text-secondary-700">
                {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
              </span>
              <span className="px-1.5 py-0.5 bg-primary-50 text-primary-700 text-[9px] font-bold rounded">
                {item.destination}
              </span>
            </div>
            <Frame {...item} />
          </div>
        );
      })}
    </div>
  );
}
