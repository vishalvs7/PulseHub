'use client';

import { useMemo } from 'react';

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  twitter: '#1D9BF0',
  linkedin: '#0A66C2',
  youtube: '#FF0000',
  facebook: '#1877F2',
  tiktok: '#111111',
  threads: '#101010',
  pinterest: '#E60023',
  reddit: '#FF4500',
  bluesky: '#0085FF',
  snapchat: '#FFFC00',
};

export function platformColor(platform: string): string {
  return PLATFORM_COLORS[platform.toLowerCase()] || '#94A3B8';
}

const DEFAULT_BAR_COLORS = ['#E1306C', '#0A66C2', '#22C55E', '#F59E0B', '#8B5CF6', '#06B6D4'];

interface BarValue {
  label: string;
  value: number;
  color?: string;
}

export function GroupedBarChart({
  groups,
  barColors = DEFAULT_BAR_COLORS,
  height = 240,
}: {
  groups: { label: string; values: BarValue[] }[];
  barColors?: string[];
  height?: number;
}) {
  const W = 640;
  const H = height;
  const padBottom = 34;
  const padTop = 22;
  const padLeft = 8;

  const max = useMemo(
    () => Math.max(1, ...groups.flatMap((g) => g.values.map((v) => v.value))),
    [groups]
  );

  if (groups.length === 0 || groups.every((g) => g.values.every((v) => v.value === 0))) {
    return <div className="text-secondary-400 text-sm text-center py-10">No data for this period.</div>;
  }

  const groupW = (W - padLeft * 2) / groups.length;
  const keys = groups[0].values.map((v) => v.label);
  const barW = Math.max(6, (groupW / keys.length) * 0.62);

  const yFor = (v: number) => padTop + (1 - v / max) * (H - padTop - padBottom);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[420px]">
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const y = padTop + (1 - f) * (H - padTop - padBottom);
          return (
            <g key={f}>
              <line x1={padLeft} x2={W - padLeft} y1={y} y2={y} stroke="#E2E8F0" strokeWidth={1} />
              <text x={W - padLeft - 2} y={y - 3} textAnchor="end" fontSize={9} fill="#94A3B8">
                {Math.round(max * f)}
              </text>
            </g>
          );
        })}

        {groups.map((g, gi) => {
          const gx = padLeft + gi * groupW;
          return (
            <g key={g.label}>
              {g.values.map((v, vi) => {
                const bx = gx + (groupW / keys.length) * vi + (barW / 2);
                const by = yFor(v.value);
                const bh = H - padBottom - by;
                const fill = v.color || barColors[vi % barColors.length];
                return (
                  <g key={vi}>
                    <rect x={bx} y={by} width={barW} height={Math.max(0, bh)} rx={3} fill={fill} />
                    {v.value > 0 && (
                      <text x={bx + barW / 2} y={by - 4} textAnchor="middle" fontSize={9} fontWeight={600} fill="#475569">
                        {v.value >= 10000 ? `${(v.value / 1000).toFixed(1)}k` : v.value}
                      </text>
                    )}
                  </g>
                );
              })}
              <text x={gx + groupW / 2} y={H - 10} textAnchor="middle" fontSize={10} fill="#64748B" fontWeight={600}>
                {g.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        {keys.map((k, i) => (
          <span key={k} className="flex items-center gap-1.5 text-xs text-secondary-600">
            <span className="w-3 h-3 rounded-sm" style={{ background: barColors[i % barColors.length] }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({
  segments,
  centerLabel = 'Total',
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel?: string;
}) {
  const total = useMemo(() => segments.reduce((s, x) => s + x.value, 0), [segments]);
  const R = 70;
  const CIRC = 2 * Math.PI * R;

  if (total === 0) {
    return <div className="text-secondary-400 text-sm text-center py-10">No data for this period.</div>;
  }

  let acc = 0;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-44 h-44 shrink-0">
        <circle cx={100} cy={100} r={R} fill="none" stroke="#F1F5F9" strokeWidth={26} />
        {segments.map((s) => {
          const frac = s.value / total;
          const dash = frac * CIRC;
          const rotate = acc * 360 - 90;
          acc += frac;
          return (
            <circle
              key={s.label}
              cx={100}
              cy={100}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={26}
              strokeDasharray={`${dash} ${CIRC - dash}`}
              transform={`rotate(${rotate} 100 100)`}
            />
          );
        })}
        <text x={100} y={94} textAnchor="middle" fontSize={22} fontWeight={700} fill="#0F172A">
          {total >= 10000 ? `${(total / 1000).toFixed(1)}k` : total}
        </text>
        <text x={100} y={112} textAnchor="middle" fontSize={10} fill="#64748B">
          {centerLabel}
        </text>
      </svg>
      <div className="space-y-2 w-full">
        {segments
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((s) => (
            <div key={s.label} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2 text-secondary-700 font-medium">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
                <span className="capitalize">{s.label}</span>
              </span>
              <span className="text-secondary-500">
                {s.value >= 10000 ? `${(s.value / 1000).toFixed(1)}k` : s.value}
                <span className="ml-1 text-secondary-400">({((s.value / total) * 100).toFixed(0)}%)</span>
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function LineChart({
  series,
  height = 260,
}: {
  series: { label: string; color: string; points: { x: string; y: number }[] }[];
  height?: number;
}) {
  const W = 640;
  const H = height;
  const padTop = 16;
  const padBottom = 30;
  const padLeft = 10;
  const padRight = 48;

  const dates = useMemo(() => {
    const set = new Set<string>();
    series.forEach((s) => s.points.forEach((p) => set.add(p.x)));
    return Array.from(set).sort();
  }, [series]);

  const max = useMemo(
    () => Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.y))),
    [series]
  );

  if (series.length === 0 || dates.length === 0) {
    return <div className="text-secondary-400 text-sm text-center py-10">No trend data for this period.</div>;
  }

  const xAt = (date: string) => {
    const i = dates.indexOf(date);
    return padLeft + (dates.length === 1 ? 0 : (i / (dates.length - 1)) * (W - padLeft - padRight));
  };
  const yAt = (v: number) => padTop + (1 - v / max) * (H - padTop - padBottom);

  // Carry last-known value forward so missing days don't dip to zero.
  const resolved: { label: string; color: string; line: string }[] = series.map((s) => {
    const byDate = new Map(s.points.map((p) => [p.x, p.y]));
    let last = 0;
    const pts: [number, number][] = dates.map((d) => {
      const v = byDate.has(d) ? (byDate.get(d) as number) : last;
      last = v;
      return [xAt(d), yAt(v)];
    });
    return {
      label: s.label,
      color: s.color,
      line: pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' '),
    };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[420px]">
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = padTop + (1 - f) * (H - padTop - padBottom);
        return (
          <g key={f}>
            <line x1={padLeft} x2={W - padRight} y1={y} y2={y} stroke="#E2E8F0" strokeWidth={1} />
            <text x={W - padRight + 6} y={y + 3} fontSize={9} fill="#94A3B8">
              {Math.round(max * f)}
            </text>
          </g>
        );
      })}

      {resolved.map((s) => (
        <g key={s.label}>
          <path d={s.line} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        </g>
      ))}

      {/* End value dots + labels */}
      {series.map((s) => {
        const byDate = new Map(s.points.map((p) => [p.x, p.y]));
        const lastDate = [...byDate.keys()].sort().pop();
        if (!lastDate) return null;
        const x = xAt(lastDate);
        const y = yAt(byDate.get(lastDate) as number);
        return (
          <g key={`dot-${s.label}`}>
            <circle cx={x} cy={y} r={3.5} fill="#fff" stroke={s.color} strokeWidth={2} />
            <text x={x + 6} y={y + 3} fontSize={9} fontWeight={600} fill={s.color}>
              {byDate.get(lastDate)}
            </text>
          </g>
        );
      })}

      {dates.length > 1 &&
        [0, Math.floor((dates.length - 1) / 2), dates.length - 1].map((i) => (
          <text key={i} x={xAt(dates[i])} y={H - 10} textAnchor="middle" fontSize={9} fill="#94A3B8">
            {dates[i]}
          </text>
        ))}
    </svg>
  );
}