'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Plus, Trash2, Power, Link2, AlertCircle, CheckCircle2, FileText, X } from 'lucide-react';

interface SharedDocument {
  name: string;
  dataUrl: string;
}

interface TriggerRule {
  id: string;
  platform: string;
  keyword: string;
  message: string;
  link: string;
  document?: SharedDocument;
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

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CommentToDM() {
  const [rules, setRules] = useState<TriggerRule[]>(() => loadRules());
  const [platform, setPlatform] = useState('instagram');
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [document, setDocument] = useState<SharedDocument | undefined>();
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (rules.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    }
  }, [rules]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_DOCUMENT_BYTES) {
      alert('Document must be under 5MB.');
      e.target.value = '';
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setDocument({ name: file.name, dataUrl });
  };

  const clearDocument = () => {
    setDocument(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addRule = () => {
    if (!keyword.trim() || !message.trim()) return;
    const rule: TriggerRule = {
      id: Math.random().toString(36).slice(2),
      platform,
      keyword: keyword.trim(),
      message: message.trim(),
      link: link.trim(),
      document,
      active: true,
    };
    setRules((r) => [rule, ...r]);
    setKeyword('');
    setMessage('');
    setLink('');
    setDocument(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document to share <span className="font-normal text-gray-400">(optional, PDF/DOCX up to 5MB)</span>
              </label>
              {document ? (
                <div className="flex items-center justify-between gap-2 px-4 py-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <span className="inline-flex items-center gap-2 text-sm text-primary-700 min-w-0">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{document.name}</span>
                  </span>
                  <button
                    onClick={clearDocument}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Remove document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <div>
                    <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">
                      Attach a PDF, Word doc, or text file to auto-send in the DM.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
                      onChange={handleFileChange}
                      className="text-sm text-gray-600 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 file:font-semibold file:cursor-pointer hover:file:bg-primary-200"
                    />
                  </div>
                </div>
              )}
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
                  {rule.document && (
                    <a
                      href={rule.document.dataUrl}
                      download={rule.document.name}
                      className="text-xs text-primary-600 mt-1 inline-flex items-center gap-1 hover:underline"
                    >
                      <FileText className="w-3 h-3" /> {rule.document.name}
                    </a>
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
