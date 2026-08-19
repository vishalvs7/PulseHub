'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Search, Reply, Check, MessageCircle, ExternalLink } from 'lucide-react';
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

export default function CommentsInbox({ userId }: CommentsInboxProps) {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('platform') || 'all';

  const [comments, setComments] = useState<UnifiedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState(initialFilter);
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyingId, setReplyingId] = useState<string | null>(null);

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

  const platforms = Array.from(new Set(comments.map((c) => c.platform)));

  const filtered = comments.filter((c) => {
    const matchPlatform = platformFilter === 'all' || c.platform === platformFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      c.content.toLowerCase().includes(q) ||
      c.authorName.toLowerCase().includes(q) ||
      c.authorUsername.toLowerCase().includes(q) ||
      c.postContent.toLowerCase().includes(q);
    return matchPlatform && matchSearch;
  });

  const handleReply = async (comment: UnifiedComment) => {
    if (!replyText.trim()) return;
    setReplyingId(comment.id);
    try {
      await CommentService.reply(userId, comment, replyText.trim());
      setReplyText('');
      setReplyOpen(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply.');
    } finally {
      setReplyingId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading comments...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2 text-secondary-500">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search comments, authors, posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-secondary-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              platformFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            }`}
          >
            All
          </button>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${
                platformFilter === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-secondary-200 rounded-xl p-12 text-center">
          <MessageCircle className="w-10 h-10 text-secondary-300 mx-auto mb-3" />
          <p className="text-secondary-600">No comments yet.</p>
          <p className="text-sm text-secondary-500 mt-1">
            Comments from your connected platforms will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => {
            const cfg = PLATFORM_CONFIGS[c.platform as keyof typeof PLATFORM_CONFIGS];
            const cardKey = `${c.platform}:${c.postId}:${c.id}`;
            return (
              <div
                key={cardKey}
                className="bg-white border border-secondary-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Platform + post header */}
                <div className="flex items-center space-x-3 px-5 py-3 border-b border-secondary-100 bg-secondary-50/50">
                  <span className={`w-8 h-8 ${cfg ? `bg-gradient-to-r ${cfg.color}` : 'bg-secondary-400'} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {cfg ? cfg.icon : c.platform.slice(0, 2)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                      {CommentService.platformLabel(c.platform)}
                    </p>
                    <p className="text-sm text-secondary-800 font-medium truncate">
                      {c.postContent || 'Untitled post'}
                      {c.commentCount > 0 && (
                        <span className="ml-2 text-secondary-400 font-normal">
                          · {c.commentCount} comment{c.commentCount === 1 ? '' : 's'}
                        </span>
                      )}
                      {c.postPermalink && (
                        <a
                          href={c.postPermalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-0.5"
                        >
                          open <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-secondary-400 shrink-0">{timeLabel(c.createdAt)}</span>
                </div>

                {/* Comment body */}
                <div className="px-5 py-4">
                  <div className="flex items-start space-x-3">
                    {c.authorAvatar ? (
                      <img
                        src={c.authorAvatar}
                        alt={c.authorName}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {c.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-secondary-900 text-sm">{c.authorName}</p>
                        {c.authorUsername && (
                          <span className="text-xs text-secondary-500">@{c.authorUsername}</span>
                        )}
                      </div>
                      <p className="text-secondary-700 mt-1">{c.content}</p>

                      {replyOpen === cardKey ? (
                        <div className="mt-3 flex items-center space-x-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleReply(c);
                            }}
                            placeholder={`Reply to ${c.authorName}...`}
                            autoFocus
                            className="flex-1 bg-white border border-secondary-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <button
                            onClick={() => handleReply(c)}
                            disabled={!replyText.trim() || replyingId === c.id}
                            className="px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-1"
                          >
                            {replyingId === c.id ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Sending</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                <span>Reply</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setReplyOpen(null);
                              setReplyText('');
                            }}
                            className="px-3 py-2 text-sm text-secondary-600 hover:bg-secondary-100 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyOpen(cardKey)}
                          className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                        >
                          <Reply className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
