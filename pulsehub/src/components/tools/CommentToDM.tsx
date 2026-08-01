'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2, Power, Link2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TriggerRule {
  id: string;
  platform: string;
  keyword: string;
  message: string;
  link: string;
  active: boolean;
}

const STORAGE_KEY = 'pulsehub_comment_to_dm_rules';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
];

function loadRules(): TriggerRule[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function CommentToDM() {
  const [rules, setRules] = useState<TriggerRule[]>(() => loadRules());
  const [platform, setPlatform] = useState('instagram');
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (rules.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    }
  }, [rules]);

  const addRule = () => {
    if (!keyword.trim() || !message.trim()) return;
    const rule: TriggerRule = {
      id: Math.random().toString(36).slice(2),
      platform,
      keyword: keyword.trim(),
      message: message.trim(),
      link: link.trim(),
      active: true,
    };
    setRules((r) => [rule, ...r]);
    setKeyword('');
    setMessage('');
    setLink('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleRule = (id: string) =>
    setRules((r) => r.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));

  const removeRule = (id: string) => setRules((r) => r.filter((x) => x.id !== id));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Comment-to-DM Automation</h2>
          <p className="text-sm text-gray-500">
            When a follower comments a trigger keyword, automatically send them a DM with your link.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Builder */}
        <div className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Create a trigger</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trigger keyword</label>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. PLAN"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">
                Follower comments this word on your post → DM is triggered.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DM message template</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hey! Here's the free template you asked for 👇"
                className="w-full h-20 px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link / lead magnet URL <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://yourlanding.page/offer"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
            </div>
            <button
              onClick={addRule}
              disabled={!keyword.trim() || !message.trim()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-accent-700 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Activate Trigger
            </button>
            {saved && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Trigger saved
              </div>
            )}
          </div>
        </div>

        {/* Active rules */}
        <div className="bg-white rounded-lg border border-primary-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Active triggers ({rules.length})</h3>
          {rules.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              No triggers yet. Create one on the left.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rules.map((rule) => (
                <div key={rule.id} className={`p-4 rounded-lg border ${rule.active ? 'border-primary-200 bg-primary-50/50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-primary-200 rounded-lg text-xs font-bold text-primary-700 uppercase">
                      {rule.keyword}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          rule.active ? 'text-emerald-600' : 'text-gray-500'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" /> {rule.active ? 'Active' : 'Paused'}
                      </button>
                      <button onClick={() => removeRule(rule.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900 capitalize">{rule.platform}:</strong> {rule.message}
                  </p>
                  {rule.link && (
                    <p className="text-xs text-primary-600 mt-1 truncate flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> {rule.link}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Comment-to-DM requires Instagram Messaging / Facebook Page / TikTok messaging APIs, which need app review and
          business verification. We&apos;ll route this through the social middleware aggregator once approved. Until then,
          rules can be drafted and saved above.
        </span>
      </div>
    </div>
  );
}
