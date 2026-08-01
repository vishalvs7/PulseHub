'use client';

import { useMemo, useState } from 'react';
import { TextCursorInput, AlertTriangle, Hash } from 'lucide-react';
import { PLATFORM_LIMITS, countHashtags } from '@/lib/socialLimits';

export default function CharCounter() {
  const [text, setText] = useState('');

  const hashtags = useMemo(() => countHashtags(text), [text]);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Editor */}
      <div className="bg-white rounded-lg border border-primary-100 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <TextCursorInput className="w-5 h-5 text-primary-600" />
          Write your caption
        </h3>
        <p className="text-sm text-gray-500 mb-4">Validated in real time against every platform limit.</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing your caption..."
          autoFocus
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
        />
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-gray-500">{text.length.toLocaleString()} characters</span>
          <span className={`inline-flex items-center gap-1 ${hashtags > 30 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
            <Hash className="w-4 h-4" /> {hashtags} hashtags
          </span>
        </div>
      </div>

      {/* Live validation */}
      <div className="space-y-3">
        {PLATFORM_LIMITS.map((p) => {
          const used = text.length;
          const over = used > p.maxChars;
          const pct = Math.min(100, (used / p.maxChars) * 100);
          const overHashtags = p.maxHashtags !== undefined && hashtags > p.maxHashtags;
          return (
            <div key={p.id} className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{p.name}</span>
                {p.maxHashtags && (
                  <span className={`text-xs font-medium ${overHashtags ? 'text-red-600' : 'text-gray-500'}`}>
                    {hashtags}/{p.maxHashtags} hashtags
                  </span>
                )}
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    over ? 'bg-red-500' : used > p.maxChars * 0.9 ? 'bg-amber-500' : 'bg-gradient-to-r from-primary-500 to-accent-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`font-bold ${over ? 'text-red-600' : used > p.maxChars * 0.9 ? 'text-amber-600' : 'text-gray-900'}`}>
                  {used.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ {p.maxChars.toLocaleString()}</span>
                </span>
                <span className={`text-sm font-medium ${over ? 'text-red-600' : 'text-gray-500'}`}>
                  {over ? `${used - p.maxChars} over` : `${p.maxChars - used} left`}
                </span>
              </div>
              {over && (
                <div className="mt-2 flex items-center gap-1.5 text-red-600 text-xs font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Exceeds {p.name}&apos;s {p.maxChars.toLocaleString()}-character limit
                </div>
              )}
              {overHashtags && (
                <div className="mt-1 flex items-center gap-1.5 text-red-600 text-xs font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Instagram allows a maximum of {p.maxHashtags} hashtags
                </div>
              )}
            </div>
          );
        })}
        <p className="text-xs text-gray-500 bg-primary-50 border border-primary-100 rounded-lg p-4">
          Note: Instagram&apos;s algorithm hides some hashtags; the best practice is 3–10 highly relevant hashtags plus
          a hidden block. Character limits follow current platform docs.
        </p>
      </div>
    </div>
  );
}
