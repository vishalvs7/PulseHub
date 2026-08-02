'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Mail, Send, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSupabase } from '@/lib/supabase/client';

interface ConversationItem {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  subtitle: string;
  preview: string;
  time: string;
  unread: boolean;
}

interface MessageDetail {
  id: string;
  sender: 'user' | 'other';
  content: string;
  time: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface DealsInboxProps {
  userId: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function DealsInbox({ userId, emptyTitle = 'Select a conversation', emptyDescription = 'Choose a conversation from the left to start messaging' }: DealsInboxProps) {
  const searchParams = useSearchParams();
  const initialConv = searchParams.get('conv');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<MessageDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(initialConv);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const supabase = getSupabase();
    const { data: cps } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (!cps || cps.length === 0) {
      setLoading(false);
      return;
    }

    const ids = cps.map((c: { conversation_id: string }) => c.conversation_id);
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', ids)
      .order('created_at', { ascending: false });

    const latestByConv = new Map<string, MessageRow>();
    for (const m of (msgs as MessageRow[]) || []) {
      if (!latestByConv.has(m.conversation_id)) latestByConv.set(m.conversation_id, m);
    }

    const convList: ConversationItem[] = [];
    for (const [convId, msg] of latestByConv) {
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', convId)
        .neq('user_id', userId);

      const otherUserId = participants?.[0]?.user_id;
      let name = 'User';
      let avatar = 'U';
      let subtitle = '';
      if (otherUserId) {
        const { data: u } = await supabase
          .from('users')
          .select('display_name, photo_url, role')
          .eq('id', otherUserId)
          .single();
        name = u?.display_name || 'User';
        avatar = u?.photo_url || name.charAt(0);
        subtitle = u?.role === 'brand' ? 'Brand' : 'Influencer';
      }

      const time = new Date(msg.created_at);
      const now = new Date();
      const isToday = time.toDateString() === now.toDateString();
      const timeLabel = isToday
        ? time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : time.toLocaleDateString();

      convList.push({
        id: convId,
        participantId: otherUserId || '',
        participantName: name,
        participantAvatar: avatar,
        subtitle,
        preview: msg.content.substring(0, 80),
        time: timeLabel,
        unread: !msg.read,
      });
    }

    setConversations(convList);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const run = async () => {
      await loadConversations();
    };
    run();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) return;
    const loadMessages = async () => {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedId)
        .order('created_at', { ascending: true });

      setMessages((data || []).map((m: MessageRow) => ({
        id: m.id,
        sender: m.sender_id === userId ? 'user' : 'other',
        content: m.content,
        time: new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      })));

      // Mark incoming as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', selectedId)
        .neq('sender_id', userId);
    };
    loadMessages();
  }, [selectedId, userId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedId) return;
    const supabase = getSupabase();
    await supabase.from('messages').insert({
      conversation_id: selectedId,
      sender_id: userId,
      content: newMessage,
    });
    setNewMessage('');
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', selectedId)
      .order('created_at', { ascending: true });
    setMessages((data || []).map((m: MessageRow) => ({
      id: m.id,
      sender: m.sender_id === userId ? 'user' : 'other',
      content: m.content,
      time: new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    })));
    await loadConversations();
  };

  const filtered = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading deals...</div>;
  }

  const selected = conversations.find(c => c.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-secondary-200 bg-white">
      {/* Conversation list */}
      <div className="w-80 sm:w-96 bg-secondary-50 border-r border-secondary-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-secondary-100">
          <h1 className="text-xl font-bold text-secondary-900 mb-4">Deals</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:border-primary-500 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`w-full p-4 flex items-start space-x-3 border-b border-secondary-100 hover:bg-white transition text-left ${
                selectedId === conv.id ? 'bg-white shadow-sm' : ''
              }`}
            >
              {conv.participantAvatar.length > 1 ? (
                <img src={conv.participantAvatar} alt={conv.participantName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {conv.participantAvatar}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-secondary-900 text-sm truncate">{conv.participantName}</h3>
                  <span className="text-xs text-secondary-500 flex-shrink-0">{conv.time}</span>
                </div>
                <p className="text-xs text-secondary-500">{conv.subtitle}</p>
                <p className="text-sm text-secondary-600 mt-1 truncate">{conv.preview}</p>
              </div>
              {conv.unread && <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-secondary-500">No deals yet.</div>
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            <div className="p-4 border-b border-secondary-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selected.participantAvatar.length > 1 ? (
                  <img src={selected.participantAvatar} alt={selected.participantName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                    {selected.participantAvatar}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-secondary-900">{selected.participantName}</h3>
                  <p className="text-xs text-secondary-500">{selected.subtitle}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-secondary-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-secondary-600" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-br-sm'
                      : 'bg-secondary-100 text-secondary-900 rounded-bl-sm'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-200' : 'text-secondary-500'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-secondary-500">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>

            <div className="p-4 border-t border-secondary-100">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder={`Message ${selected.participantName}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-lg text-sm focus:border-primary-500 outline-none"
                />
                <Button onClick={handleSend} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Mail className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">{emptyTitle}</h3>
              <p className="text-secondary-600">{emptyDescription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
