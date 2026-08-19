'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Search,
  Check,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  Loader2,
  MessagesSquare,
} from 'lucide-react';
import { CommentService, UnifiedComment } from '@/services/comment.service';
import { PLATFORM_CONFIGS } from '@/lib/socialPlatforms';

interface CommentsInboxProps {
  userId: string;
}

function timeLabel(iso: string): string {
  const t = new Date(iso);
  const now = new Date();
  const isToday = t.toDateString() === now.toDateString();
  return isToday
    ? t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : t.toLocaleDateString();
}

function cardKey(c: UnifiedComment): string {
  return `${c.platform}:${c.postId}:${c.id}`;
}

function Avatar({ name, src, className = 'w-9 h-9 text-sm' }: { name: string; src?: string; className?: string }) {
  if (src) {
    return <img src={src} alt={name} className={`${className} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${className} rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold shrink-0`}>
      {(name || 'U').charAt(0).toUpperCase()}
    </div>
  );
}

function PlatformBadge({ platform, size = 'w-6 h-6 text-[10px]' }: { platform: string; size?: string }) {
  const cfg = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
  return (
    <span className={`${size} ${cfg ? `bg-gradient-to-r ${cfg.color}` : 'bg-secondary-400'} rounded-lg flex items-center justify-center text-white font-bold shrink-0`}>
      {cfg ? cfg.icon : platform.slice(0, 2).toUpperCase()}
    </span>
  );
}

export default function CommentsInbox({ userId }: CommentsInboxProps) {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('platform') || 'all';

  const [comments, setComments] = useState<UnifiedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState(initialFilter);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, { text: string; at: string }>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await CommentService.getComments(userId);
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments.');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const platforms = useMemo(() => Array.from(new Set(comments.map((c) => c.platform))), [comments]);

  const filtered = useMemo(
    () =>
      comments.filter((c) => {
        const matchPlatform = platformFilter === 'all' || c.platform === platformFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch =
          !q ||
          c.content.toLowerCase().includes(q) ||
          c.authorName.toLowerCase().includes(q) ||
          c.authorUsername.toLowerCase().includes(q) ||
          c.postContent.toLowerCase().includes(q);
        return matchPlatform && matchSearch;
      }),
    [comments, platformFilter, searchQuery]
  );

  const selected = useMemo(
    () => filtered.find((c) => cardKey(c) === selectedKey) || null,
    [filtered, selectedKey]
  );

  // Default to the first filtered comment; keep selection valid across filters.
  useEffect(() => {
    if (selectedKey && filtered.some((c) => cardKey(c) === selectedKey)) return;
    if (filtered.length > 0) setSelectedKey(cardKey(filtered[0]));
    else setSelectedKey(null);
  }, [filtered, selectedKey]);

  const handleReply = async (comment: UnifiedComment, text: string) => {
    if (!text.trim()) return;
    const key = cardKey(comment);
    setReplyingId(key);
    setError('');
    try {
      await CommentService.reply(userId, comment, text.trim());
      setReplies((prev) => ({ ...prev, [key]: { text: text.trim(), at: new Date().toISOString() } }));
      setReplyText('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply.');
    } finally {
      setReplyingId(null);
    }
  };

  const selectComment = (comment: UnifiedComment) => {
    setSelectedKey(cardKey(comment));
    setMobileOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading comments…
      </div>
    );
  }

  return (
    <div className="bg-white border border-secondary-200 rounded-2xl overflow-hidden shadow-sm h-[calc(100vh-15rem)] min-h-[420px] flex flex-col lg:flex-row">
      {error && (
        <div className="absolute inset-x-0 top-0 z-10 p-3 bg-error-50 border-b border-error-200 text-error-700 text-sm">
          {error}
        </div>
      )}

      {/* LEFT — comment list */}
      <div className={`${mobileOpen ? 'hidden' : 'flex'} lg:flex flex-col w-full lg:w-[370px] xl:w-[410px] shrink-0 border-b lg:border-b-0 lg:border-r border-secondary-200 bg-secondary-50/40`}>
        {/* Filters */}
        <div className="p-4 border-b border-secondary-200 bg-white space-y-3">
          <div className="flex items-center space-x-2 text-secondary-500">
            <Search className="w-4 h-4 shrink-0" />
            <input
              type="text"
              placeholder="Search comments, authors…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-secondary-400"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
                platformFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              All platforms
            </button>
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize whitespace-nowrap transition ${
                  platformFilter === p ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <MessageCircle className="w-10 h-10 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-600 font-medium">No comments yet.</p>
              <p className="text-sm text-secondary-500 mt-1">
                Comments from your connected platforms will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-secondary-100">
              {filtered.map((c) => {
                const key = cardKey(c);
                const isActive = selectedKey === key;
                const replied = replies[key];
                return (
                  <li key={key}>
                    <button
                      onClick={() => selectComment(c)}
                      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition ${
                        isActive ? 'bg-primary-50 border-l-4 border-primary-600' : 'border-l-4 border-transparent hover:bg-secondary-50'
                      }`}
                    >
                      <Avatar name={c.authorName} src={c.authorAvatar} className="w-10 h-10 text-sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="font-semibold text-secondary-900 text-sm truncate">{c.authorName}</p>
                            {c.authorUsername && (
                              <span className="text-xs text-secondary-500 truncate">@{c.authorUsername}</span>
                            )}
                          </div>
                          <span className="text-xs text-secondary-400 shrink-0">{timeLabel(c.createdAt)}</span>
                        </div>
                        <p className={`text-sm mt-0.5 line-clamp-2 ${isActive ? 'text-secondary-800' : 'text-secondary-600'}`}>
                          {c.content || '—'}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <PlatformBadge platform={c.platform} />
                          <span className="text-xs text-secondary-400 truncate">{c.postContent || 'Untitled post'}</span>
                        </div>
                        {replied && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Replied: {replied.text}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* RIGHT — conversation / reply pane */}
      <div className={`${mobileOpen ? 'flex' : 'hidden'} lg:flex flex-1 flex-col min-w-0 bg-white`}>
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <MessagesSquare className="w-12 h-12 text-secondary-200 mb-3" />
            <p className="text-secondary-500 font-medium">Select a comment to view it</p>
            <p className="text-sm text-secondary-400 mt-1">Pick a comment from the list to reply or open it on the platform.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-secondary-200 flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 -ml-1.5 text-secondary-600 hover:bg-secondary-100 rounded-lg"
                aria-label="Back to list"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Avatar name={selected.authorName} src={selected.authorAvatar} className="w-11 h-11" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-secondary-900">{selected.authorName}</p>
                  {selected.authorUsername && (
                    <span className="text-sm text-secondary-500">@{selected.authorUsername}</span>
                  )}
                  <PlatformBadge platform={selected.platform} />
                </div>
                <p className="text-sm text-secondary-500 truncate">
                  {CommentService.platformLabel(selected.platform)} · {timeLabel(selected.createdAt)}
                </p>
              </div>
              {selected.postPermalink && (
                <a
                  href={selected.postPermalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 shrink-0"
                >
                  Open post <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-secondary-50/40">
              {/* Original comment (incoming) */}
              <div className="flex items-start gap-3">
                <Avatar name={selected.authorName} src={selected.authorAvatar} className="w-9 h-9 text-sm" />
                <div className="max-w-[75%]">
                  <div className="bg-white border border-secondary-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <p className="text-sm text-secondary-900">{selected.content}</p>
                  </div>
                  <p className="text-xs text-secondary-400 mt-1 px-1">{timeLabel(selected.createdAt)}</p>
                </div>
              </div>

              {/* Our reply (outgoing) */}
              {replies[cardKey(selected)] && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="max-w-[75%]">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm text-white">
                      <p className="text-sm">{replies[cardKey(selected)].text}</p>
                    </div>
                    <p className="text-xs text-secondary-400 mt-1 px-1 text-right">{timeLabel(replies[cardKey(selected)].at)}</p>
                  </div>
                </div>
              )}

              {/* Post context */}
              <div className="text-center">
                <span className="text-xs text-secondary-400 bg-white border border-secondary-200 rounded-[8px] px-4 py-2 inline-flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>On: {selected.postContent || 'Untitled post'}</span>
                  {selected.commentCount > 0 && (
                    <span className="text-secondary-500">· {selected.commentCount} comment{selected.commentCount === 1 ? '' : 's'}</span>
                  )}
                </span>
              </div>
            </div>

            {/* Reply composer */}
            <div className="px-4 py-3 border-t border-secondary-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleReply(selected, replyText);
                  }}
                  placeholder={`Reply to ${selected.authorName}…`}
                  className="flex-1 bg-secondary-50 border border-secondary-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => handleReply(selected, replyText)}
                  disabled={!replyText.trim() || replyingId === cardKey(selected)}
                  className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 shrink-0"
                >
                  {replyingId === cardKey(selected) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}