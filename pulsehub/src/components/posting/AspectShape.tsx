'use client';

import { Play, FileText } from 'lucide-react';
import type { PostContentType } from '@/lib/postFormats';

const SHAPES: Record<PostContentType, { width: string; height: string; label: string; video?: boolean }> = {
  'square-image': { width: '3rem', height: '3rem', label: '1:1' },
  'square-video': { width: '3rem', height: '3rem', label: '1:1', video: true },
  'vertical-video': { width: '2.6rem', height: '4.4rem', label: '9:16', video: true },
  'long-video': { width: '4.4rem', height: '2.6rem', label: '16:9', video: true },
  document: { width: '2.4rem', height: '3.2rem', label: 'DOC' },
};

export default function AspectShape({ type, selected }: { type: PostContentType; selected?: boolean }) {
  const shape = SHAPES[type];
  const border = selected ? 'border-primary-400' : 'border-secondary-300';
  const bg = selected ? 'bg-primary-50' : 'bg-white';
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`border-2 border-dashed ${border} ${bg} rounded-md flex items-center justify-center relative`}
        style={{ width: shape.width, height: shape.height }}
      >
        {shape.video ? (
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${selected ? 'bg-primary-600 text-white' : 'bg-secondary-200 text-secondary-500'}`}>
            <Play className="w-3 h-3 ml-0.5" />
          </span>
        ) : type === 'document' ? (
          <FileText className={`w-5 h-5 ${selected ? 'text-primary-500' : 'text-secondary-400'}`} />
        ) : (
          <span className={`w-2 h-2 rounded-full ${selected ? 'bg-primary-500' : 'bg-secondary-300'}`} />
        )}
      </div>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selected ? 'text-primary-700' : 'text-secondary-500'}`}>
        {shape.label}
      </span>
    </div>
  );
}
