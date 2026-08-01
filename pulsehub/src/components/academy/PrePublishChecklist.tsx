'use client';

import { useMemo, useState } from 'react';
import { ListChecks, X, ShieldCheck, Search, Megaphone, CheckCircle2, GraduationCap } from 'lucide-react';
import Link from 'next/link';

const CTA_KEYWORDS = ['comment', 'save', 'share', 'follow', 'link in bio', 'dm', 'like', 'tag', 'subscribe', 'link'];

interface Props {
  caption: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function PrePublishChecklist({ caption, onConfirm, onClose }: Props) {
  const [safeZones, setSafeZones] = useState(false);
  const [keywords, setKeywords] = useState(false);
  const [cta, setCta] = useState(false);

  const stats = useMemo(() => {
    const words = caption.trim() ? caption.trim().split(/\s+/).length : 0;
    const hashtags = (caption.match(/#[\wа-яА-Я]+/g) || []).length;
    const ctaFound = CTA_KEYWORDS.some((k) => caption.toLowerCase().includes(k));
    return { words, hashtags, ctaFound };
  }, [caption]);

  const allChecked = safeZones && keywords && cta;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-secondary-900">Pre-Publish Checklist</h3>
              <p className="text-xs text-secondary-500">Quick pre-flight check before this post goes out</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <button
            onClick={() => setSafeZones((v) => !v)}
            className={`w-full flex items-start gap-4 p-4 rounded-lg border transition text-left ${
              safeZones ? 'border-emerald-300 bg-emerald-50' : 'border-secondary-200 hover:border-secondary-300'
            }`}
          >
            <div className="mt-0.5">
              {safeZones ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-secondary-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-secondary-900">1. Safe Zones</span>
                <span className="text-xs text-emerald-600">{safeZones ? 'Confirmed' : 'Check'}</span>
              </div>
              <p className="text-sm text-secondary-600">
                Text overlays avoid native UI buttons (TikTok/Reels side menus, like & comment icons).
              </p>
            </div>
          </button>

          <button
            onClick={() => setKeywords((v) => !v)}
            className={`w-full flex items-start gap-4 p-4 rounded-lg border transition text-left ${
              keywords ? 'border-emerald-300 bg-emerald-50' : 'border-secondary-200 hover:border-secondary-300'
            }`}
          >
            <div className="mt-0.5">
              {keywords ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Search className="w-5 h-5 text-secondary-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-secondary-900">2. Search Keywords</span>
                <span className="text-xs text-secondary-500">
                  {stats.words} words · {stats.hashtags} hashtags
                </span>
              </div>
              <p className="text-sm text-secondary-600">
                Caption includes 3–5 niche search terms to rank in native search.
              </p>
              <p className={`text-xs mt-1 ${stats.hashtags >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stats.hashtags >= 3
                  ? 'Good — keyword/hashtag density looks solid.'
                  : 'Consider adding 3–5 niche keywords or hashtags.'}
              </p>
            </div>
          </button>

          <button
            onClick={() => setCta((v) => !v)}
            className={`w-full flex items-start gap-4 p-4 rounded-lg border transition text-left ${
              cta ? 'border-emerald-300 bg-emerald-50' : 'border-secondary-200 hover:border-secondary-300'
            }`}
          >
            <div className="mt-0.5">
              {cta ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Megaphone className="w-5 h-5 text-secondary-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-secondary-900">3. Clear Call-to-Action</span>
                <span className="text-xs text-secondary-500">
                  {stats.ctaFound ? 'CTA detected' : 'No CTA found'}
                </span>
              </div>
              <p className="text-sm text-secondary-600">
                Post explicitly asks for comments, saves, or bio-link clicks.
              </p>
              {!stats.ctaFound && (
                <p className="text-xs text-amber-600 mt-1">
                  Tip: add a prompt like &quot;Comment PLAN for the template&quot; or &quot;Save this for later&quot;.
                </p>
              )}
            </div>
          </button>

          <Link
            href="/academy"
            className="flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm font-medium mt-2"
          >
            <GraduationCap className="w-4 h-4" />
            Learn more in the Creator Academy
          </Link>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-secondary-500">
              {allChecked ? 'All checks passed — you\'re ready to go!' : 'Complete all three to publish.'}
            </span>
            <span className="text-sm font-semibold text-secondary-900">
              {[safeZones, keywords, cta].filter(Boolean).length}/3
            </span>
          </div>
          <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300"
              style={{ width: `${([safeZones, keywords, cta].filter(Boolean).length / 3) * 100}%` }}
            />
          </div>
          <button
            onClick={onConfirm}
            disabled={!allChecked}
            className="w-full mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {allChecked ? 'Looks Good — Publish' : 'Complete Checklist to Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
