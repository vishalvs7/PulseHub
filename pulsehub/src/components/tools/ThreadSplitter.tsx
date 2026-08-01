'use client';

import { useMemo, useState } from 'react';
import { Scissors, Copy, Check, ListOrdered, Linkedin, Instagram } from 'lucide-react';
import { PLATFORM_LIMITS, extractHashtags, stripHashtags } from '@/lib/socialLimits';

type ToolMode = 'thread' | 'linkedin' | 'instagram';

function splitThread(text: string, maxChars = 280, addIndex = true): string[] {
  const cleaned = text.replace(/\r/g, '').trim();
  if (!cleaned) return [];
  const parts: string[] = [];
  let current = '';
  const sentences = cleaned.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    const candidate = current ? current + ' ' + sentence : sentence;
    const overhead = addIndex ? 4 : 0; // "1/12 " prefix
    if (candidate.length + overhead > maxChars) {
      if (current) {
        parts.push(current);
        current = sentence;
      } else {
        // Sentence itself is too long — hard wrap by words
        const words = sentence.split(' ');
        let chunk = '';
        for (const word of words) {
          if ((chunk + ' ' + word).trim().length + overhead > maxChars) {
            parts.push(chunk.trim());
            chunk = word;
          } else {
            chunk = (chunk + ' ' + word).trim();
          }
        }
        if (chunk.trim()) current = chunk.trim();
      }
    } else {
      current = candidate;
    }
  }
  if (current.trim()) parts.push(current.trim());

  if (addIndex && parts.length > 1) {
    return parts.map((p, i) => `${i + 1}/${parts.length} ${p}`.slice(0, maxChars));
  }
  return parts;
}

function formatLinkedIn(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/ {2,}/g, ' ')
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .join('\n\n');
}

function buildInstagramCaption(text: string): { caption: string; hashtags: string } {
  const hashtags = extractHashtags(text);
  const caption = stripHashtags(text);
  if (hashtags.length === 0) return { caption, hashtags: '' };
  const block = hashtags.length <= 8 ? hashtags.join(' ') : hashtags.join('\n');
  return { caption, hashtags: '.\n.\n.\n' + block };
}

export default function ThreadSplitter() {
  const [mode, setMode] = useState<ToolMode>('thread');
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === 'thread') return splitThread(text, PLATFORM_LIMITS[0].maxChars);
    if (mode === 'linkedin') {
      const out = formatLinkedIn(text);
      return out ? [out] : [];
    }
    const { caption, hashtags } = buildInstagramCaption(text);
    return [caption, hashtags].filter(Boolean);
  }, [mode, text]);

  const copyAll = async () => {
    const content = result.join('\n\n');
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const modes: { id: ToolMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'thread', label: 'X Thread', icon: <ListOrdered className="w-4 h-4" />, desc: 'Split into numbered 280-char tweets' },
    { id: 'linkedin', label: 'LinkedIn Post', icon: <Linkedin className="w-4 h-4" />, desc: 'Optimal line spacing & breaks' },
    { id: 'instagram', label: 'Instagram Caption', icon: <Instagram className="w-4 h-4" />, desc: 'Hidden hashtag block' },
  ];

  const charCount = text.length;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Input */}
      <div className="bg-white rounded-lg border border-primary-100 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary-600" />
          Paste your content
        </h3>
        <div className="flex gap-2 mb-4 flex-wrap">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === m.id ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mb-3">{modes.find((m) => m.id === mode)?.desc}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your long-form post, article, or script here..."
          className="w-full h-72 px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-500">{charCount.toLocaleString()} characters</span>
          {text && (
            <button onClick={() => setText('')} className="text-sm text-primary-600 hover:text-primary-800 font-medium">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Output */}
      <div className="bg-white rounded-lg border border-primary-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Output</h3>
          {result.length > 0 && (
            <button
              onClick={copyAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg text-sm font-semibold hover:from-primary-700 hover:to-accent-700 transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          )}
        </div>

        {result.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            Formatted output will appear here
          </div>
        ) : (
          <div className="space-y-3 h-72 overflow-y-auto pr-2">
            {result.map((part, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  part.length > PLATFORM_LIMITS[0].maxChars && mode === 'thread'
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap text-gray-800">{part}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">{part.length.toLocaleString()} chars</span>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(part);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="text-xs text-primary-600 hover:text-primary-800 font-medium inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
