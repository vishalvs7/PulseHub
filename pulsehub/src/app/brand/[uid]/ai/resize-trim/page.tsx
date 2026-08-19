'use client';

import ClipStudio from '@/components/ai/ClipStudio';

export default function BrandResizeTrimPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Resize & Trim</h1>
        <p className="text-secondary-600 mt-2">
          Reformat any video for every platform with crop modes and clip trimming.
        </p>
      </div>
      <ClipStudio />
    </div>
  );
}