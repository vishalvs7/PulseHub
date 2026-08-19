'use client';

import TranscriptToClip from '@/components/ai/TranscriptToClip';

export default function BrandTranscriptToClipPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Transcript-to-Clip</h1>
        <p className="text-secondary-600 mt-2">
          Turn a long video into viral short clips from its transcript.
        </p>
      </div>
      <TranscriptToClip />
    </div>
  );
}