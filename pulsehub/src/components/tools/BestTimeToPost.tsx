'use client';

import { useMemo, useState } from 'react';
import { Clock, Zap, Instagram, Youtube, Linkedin, Twitter, Music2 } from 'lucide-react';

type Platform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'x';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const PLATFORM_PEAKS: Record<Platform, number> = {
  instagram: 20,
  tiktok: 20,
  youtube: 17,
  linkedin: 8,
  x: 9,
};

const PLATFORM_META: Record<Platform, { label: string; icon: React.ReactNode }> = {
  instagram: { label: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
  tiktok: { label: 'TikTok', icon: <Music2 className="w-4 h-4" /> },
  youtube: { label: 'YouTube', icon: <Youtube className="w-4 h-4" /> },
  linkedin: { label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" /> },
  x: { label: 'X', icon: <Twitter className="w-4 h-4" /> },
};

// Deterministic pseudo-activity per platform/day/hour for demo purposes.
function activityAt(platform: Platform, day: number, hour: number): number {
  const peak = PLATFORM_PEAKS[platform];
  const seed = (platform.length * 7 + day * 13 + hour * 3) % 10;
  const peakBoost = Math.max(0, 8 - Math.abs(hour - peak) * 1.6);
  const weekend = (day === 5 || day === 6) ? (platform === 'instagram' || platform === 'tiktok' ? 2 : -2) : 0;
  const base = 1 + seed * 0.7;
  const value = base + peakBoost + weekend;
  return Math.max(1, Math.min(10, Math.round(value)));
}

function heatColor(value: number): string {
  if (value <= 2) return 'bg-primary-50';
  if (value <= 4) return 'bg-primary-100';
  if (value <= 6) return 'bg-primary-200';
  if (value <= 8) return 'bg-primary-400';
  return 'bg-accent-500';
}

export default function BestTimeToPost() {
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [queued, setQueued] = useState<{ day: number; hour: number } | null>(null);

  const grid = useMemo(
    () => DAYS.map((_, d) => HOURS.map((h) => activityAt(platform, d, h))),
    [platform]
  );

  const peak = useMemo(() => {
    let best = { day: 0, hour: 0, value: 0 };
    grid.forEach((row, d) =>
      row.forEach((value, h) => {
        if (value > best.value) best = { day: d, hour: h, value };
      })
    );
    return best;
  }, [grid]);

  const hourLabel = (h: number) => {
    const t = new Date(2000, 0, 1, h);
    return t.toLocaleString('en-US', { hour: 'numeric', hour12: true });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Best Time to Post</h2>
            <p className="text-sm text-gray-500">Audience activity heatmap from your connected accounts</p>
          </div>
        </div>
        <button
          onClick={() => setQueued({ day: peak.day, hour: peak.hour })}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-accent-700 transition shadow"
        >
          <Zap className="w-4 h-4" />
          Auto-Queue at Peak Hour
        </button>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(PLATFORM_META) as Platform[]).map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              platform === p ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow' : 'bg-white border border-primary-200 text-gray-600 hover:bg-primary-50'
            }`}
          >
            {PLATFORM_META[p].icon}
            {PLATFORM_META[p].label}
          </button>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid" style={{ gridTemplateColumns: '70px repeat(24, 1fr)' }}>
            <div />
            {HOURS.map((h) => (
              <div key={h} className="text-[10px] text-gray-400 text-center mb-1 truncate" title={hourLabel(h)}>
                {h % 6 === 0 ? hourLabel(h) : ''}
              </div>
            ))}
            {DAYS.map((day, d) => (
              <div key={day} className="contents">
                <div className="text-xs font-medium text-gray-600 py-1 pr-2 flex items-center">
                  {day}
                  {queued?.day === d && (
                    <span className="ml-1 text-[9px] text-accent-600 font-bold">●</span>
                  )}
                </div>
                {HOURS.map((h) => {
                  const isPeak = h === peak.hour && d === peak.day;
                  const isQueued = queued?.day === d && queued?.hour === h;
                  return (
                    <div
                      key={h}
                      title={`${day} ${hourLabel(h)} — activity ${grid[d][h]}/10`}
                      className={`h-6 m-0.5 rounded ${heatColor(grid[d][h])} ${
                        isPeak ? 'ring-2 ring-accent-600' : ''
                      } ${isQueued ? 'ring-2 ring-emerald-500' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
          <span>Low</span>
          <span className="w-4 h-4 bg-primary-50 rounded" />
          <span className="w-4 h-4 bg-primary-100 rounded" />
          <span className="w-4 h-4 bg-primary-200 rounded" />
          <span className="w-4 h-4 bg-primary-400 rounded" />
          <span className="w-4 h-4 bg-accent-500 rounded" />
          <span>High</span>
          <span className="ml-auto">
            Peak: <strong className="text-gray-900">{DAYS[peak.day]} {hourLabel(peak.hour)}</strong>
          </span>
        </div>
      </div>

      {queued && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-emerald-800 text-sm">
          <strong>Queued for peak:</strong> {PLATFORM_META[platform].label} will auto-schedule on{' '}
          <strong>{DAYS[queued.day]} at {hourLabel(queued.hour)}</strong>. This account&apos;s audience is most active
          then, which maximizes initial reach and algorithm lift.
        </div>
      )}

      <p className="text-xs text-gray-500 bg-primary-50 border border-primary-100 rounded-lg p-4">
        Demo heatmap using sample audience data. Connect social accounts to see live activity patterns; the analytics
        worker refreshes these every 6–12 hours.
      </p>
    </div>
  );
}
