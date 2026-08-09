'use client';

import { useState } from 'react';
import PlatformCaptionTuner from '@/components/ai/PlatformCaptionTuner';
import TranscriptToClip from '@/components/ai/TranscriptToClip';
import ClipStudio from '@/components/ai/ClipStudio';
import { Sparkles, Scissors, Crop, Lock } from 'lucide-react';

type TabId = 'tuner' | 'transcript' | 'resize';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; pro: boolean }[] = [
  { id: 'tuner', label: 'Caption Tuner', icon: Sparkles, pro: true },
  { id: 'transcript', label: 'Transcript-to-Clip', icon: Scissors, pro: true },
  { id: 'resize', label: 'Resize & Trim', icon: Crop, pro: false },
];

export default function AIStudio() {
  const [tab, setTab] = useState<TabId>('tuner');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">AI Studio</h1>
          <p className="text-secondary-600 mt-1">Per-platform captions, viral clip mining, and auto-resizing.</p>
        </div>
      </div>

      <div className="flex border border-secondary-200 rounded-lg overflow-x-auto no-scrollbar bg-white">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 text-sm font-medium whitespace-nowrap transition ${
                active ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-secondary-600 hover:text-primary-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.pro && <Lock className="w-3 h-3 text-accent-600" />}
            </button>
          );
        })}
      </div>

      {tab === 'tuner' && <PlatformCaptionTuner />}
      {tab === 'transcript' && <TranscriptToClip />}
      {tab === 'resize' && <ClipStudio />}
    </div>
  );
}
