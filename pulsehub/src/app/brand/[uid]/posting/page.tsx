'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, Calendar, Image, Video, Send,
  Instagram, Twitter, Linkedin, Clock,
  CheckCircle, XCircle, Search
} from 'lucide-react';
import { PostingService } from '@/services/social/posting.service';
import PrePublishChecklist from '@/components/academy/PrePublishChecklist';

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledFor: string;
  publishedAt: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  media?: string;
  createdAt: string;
}

export default function BrandPostingPage() {
  const params = useParams();
  const uid = params.uid as string;

  const [postContent, setPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showChecklist, setShowChecklist] = useState(false);
  const [pendingAction, setPendingAction] = useState<'now' | 'schedule' | null>(null);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-accent-500' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
  ];

  useEffect(() => {
    const load = async () => {
      const data = await PostingService.getScheduledPosts(uid);
      setPosts(data);
      setLoading(false);
    };
    load();
  }, [uid]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePost = async (immediate: boolean) => {
    if (!postContent.trim()) {
      setError('Please enter post content');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError('Select at least one platform');
      return;
    }

    setPendingAction(immediate ? 'now' : 'schedule');
    setShowChecklist(true);
  };

  const confirmPublish = async () => {
    if (!pendingAction) return;
    const immediate = pendingAction === 'now';
    setShowChecklist(false);
    setPendingAction(null);
    setSending(true);
    setError('');

    const attachments = selectedPlatforms.map(p => ({
      platform: p,
      content: postContent,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
    }));

    if (immediate) {
      const result = await PostingService.createPost(uid, uid, attachments);
      if (!result.success) {
        setError(result.error || 'Failed to create post');
      } else {
        await PostingService.publishPost(result.post!.id, attachments);
      }
    } else {
      if (!scheduleDate || !scheduleTime) {
        setError('Select a date and time to schedule');
        setSending(false);
        return;
      }
      const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);
      await PostingService.createPost(uid, uid, attachments, scheduledFor);
    }

    setPostContent('');
    setMediaUrl('');
    setSending(false);
    const data = await PostingService.getScheduledPosts(uid);
    setPosts(data);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Composer */}
      <Card>
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">{error}</div>
          )}

          {/* Content */}
          <textarea
            placeholder="What would you like to share?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows={4}
            className="w-full p-4 border border-secondary-300 rounded-lg resize-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
          />
          <div className="text-right text-sm text-secondary-500 mt-1">{postContent.length} chars</div>

          {/* Media */}
          <div className="flex items-center space-x-3 mt-4">
            <input
              type="text"
              placeholder="Media URL (optional)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg text-sm focus:border-primary-500 outline-none"
            />
            <Button variant="outline" size="sm"><Image className="w-4 h-4 mr-1" />Image</Button>
            <Button variant="outline" size="sm"><Video className="w-4 h-4 mr-1" />Video</Button>
          </div>

          {/* Platform Selection */}
          <div className="flex items-center space-x-3 mt-6">
            <span className="text-sm font-medium text-secondary-700">Post to:</span>
            {platforms.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-300 text-secondary-600 hover:border-secondary-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? p.color : ''}`} />
                  <span className="text-sm font-medium">{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Schedule & Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-secondary-200">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-secondary-400" />
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:border-primary-500 outline-none"
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:border-primary-500 outline-none"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => handlePost(false)} loading={sending}>
                <Clock className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button className="bg-gradient-to-r from-primary-600 to-primary-700" onClick={() => handlePost(true)} loading={sending}>
                <Send className="w-4 h-4 mr-2" />
                Post Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Posts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Posts</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search posts..."
                className="px-3 py-1 border border-secondary-300 rounded-lg text-sm focus:border-primary-500 outline-none"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-secondary-500 text-center py-8">No posts yet. Create your first post above!</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="flex items-start justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {post.platforms.map((p) => {
                        const pf = platforms.find(x => x.id === p);
                        const Icon = pf?.icon || Instagram;
                        return <Icon key={p} className={`w-4 h-4 ${pf?.color || ''}`} />;
                      })}
                      <span className={`px-2 py-0.5 text-xs rounded-lg ${
                        post.status === 'published' ? 'bg-green-100 text-green-800' :
                        post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        post.status === 'failed' ? 'bg-error-100 text-error-800' :
                        'bg-secondary-100 text-secondary-600'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-secondary-900 text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-secondary-500">
                      {post.scheduledFor && <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{post.scheduledFor}</span>}
                      {post.publishedAt && <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" />{post.publishedAt}</span>}
                    </div>
                  </div>
                  <button className="p-2 hover:bg-secondary-100 rounded-lg">
                    <span className="sr-only">More</span>
                    ⋯
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {showChecklist && (
        <PrePublishChecklist
          caption={postContent}
          onConfirm={confirmPublish}
          onClose={() => {
            setShowChecklist(false);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
}
