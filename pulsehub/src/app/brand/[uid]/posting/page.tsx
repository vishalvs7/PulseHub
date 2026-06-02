// src/app/(dashboard)/brand/posting/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Plus, 
  Calendar, 
  Image, 
  Video, 
  Link, 
  Send,
  Instagram,
  Twitter,
  Linkedin,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';

interface ScheduledPost {
  id: number;
  content: string;
  platforms: string[];
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed';
  media?: string;
}

export default function BrandPostingPage() {
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram']);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
  ];

  const scheduledPosts: ScheduledPost[] = [
    {
      id: 1,
      content: 'Excited to announce our Summer Collection 2024! 🌞 Get ready for sunny days ahead.',
      platforms: ['instagram', 'twitter'],
      scheduledFor: '2024-03-20 10:00',
      status: 'scheduled',
      media: 'summer-collection.jpg',
    },
    {
      id: 2,
      content: 'Behind the scenes at our latest photoshoot 📸 Our team is working hard to bring you the best content!',
      platforms: ['instagram'],
      scheduledFor: '2024-03-21 14:30',
      status: 'scheduled',
      media: 'behind-scenes.jpg',
    },
    {
      id: 3,
      content: 'New partnership announcement! We are thrilled to collaborate with @ecoBrand for sustainable packaging.',
      platforms: ['linkedin', 'twitter'],
      scheduledFor: '2024-03-18 09:00',
      status: 'published',
    },
    {
      id: 4,
      content: 'Flash sale alert! 24 hours only - 40% off on selected items. Use code: SPRING40',
      platforms: ['instagram', 'twitter', 'linkedin'],
      scheduledFor: '2024-03-15 12:00',
      status: 'failed',
    },
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePostNow = () => {
    // In a real app, this would send the post to the selected platforms
    alert(`Posting to: ${selectedPlatforms.join(', ')}\n\n${postContent}`);
    setPostContent('');
    setSelectedPlatforms(['instagram']);
  };

  const handleSchedulePost = () => {
    // In a real app, this would schedule the post
    alert(`Scheduled for: ${scheduleDate} ${scheduleTime}\n\n${postContent}`);
    setPostContent('');
    setScheduleDate('');
    setScheduleTime('');
    setSelectedPlatforms(['instagram']);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Content Posting</h1>
          <p className="text-secondary-600 mt-2">Create and schedule posts across all your social platforms</p>
        </div>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          View Calendar
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Create Post */}
        <div className="space-y-6">
          {/* Create Post Card */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Select Platforms
                </label>
                <div className="flex items-center space-x-3">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-secondary-300 hover:border-secondary-400'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${platform.color}`} />
                        <span className="font-medium">{platform.name}</span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-primary-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Post Content */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Post Content
                </label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What would you like to post?"
                  className="w-full h-40 px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-sm text-secondary-500">
                    {postContent.length}/280 characters
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Link className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Schedule Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Schedule Date
                  </label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Schedule Time
                  </label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4">
                <Button
                  onClick={handlePostNow}
                  disabled={!postContent.trim() || selectedPlatforms.length === 0}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Now
                </Button>
                <Button
                  onClick={handleSchedulePost}
                  disabled={!postContent.trim() || selectedPlatforms.length === 0 || !scheduleDate || !scheduleTime}
                  variant="outline"
                  className="flex-1"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Posting Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  'Use relevant hashtags to increase reach',
                  'Post during peak engagement hours',
                  'Include high-quality images or videos',
                  'Engage with comments to boost visibility',
                  'Use platform-specific formatting',
                ].map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Scheduled Posts */}
        <div className="space-y-6">
          {/* Scheduled Posts Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-secondary-900">Scheduled Posts</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  className="pl-9 pr-4 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Scheduled Posts List */}
          <div className="space-y-4">
            {scheduledPosts.map((post) => {
              const statusConfig = {
                scheduled: { color: 'bg-blue-100 text-blue-800', icon: Clock },
                published: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
                failed: { color: 'bg-error-100 text-error-800', icon: XCircle },
              };

              const StatusIcon = statusConfig[post.status].icon;
              
              return (
                <Card key={post.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Post Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {post.platforms.map((platform) => {
                              const platformConfig = platforms.find(p => p.id === platform);
                              if (!platformConfig) return null;
                              const Icon = platformConfig.icon;
                              return (
                                <div
                                  key={platform}
                                  className="p-1 rounded bg-secondary-100"
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                              );
                            })}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${statusConfig[post.status].color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                        </div>

                        {/* Post Content */}
                        <p className="text-secondary-700 mb-3 line-clamp-2">{post.content}</p>

                        {/* Post Details */}
                        <div className="flex items-center justify-between text-sm text-secondary-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>Scheduled for: {post.scheduledFor}</span>
                          </div>
                          {post.media && (
                            <div className="flex items-center">
                              <Image className="w-4 h-4 mr-1" />
                              <span>Media attached</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-4">
                        <button className="p-2 hover:bg-secondary-100 rounded-lg">
                          <MoreVertical className="w-5 h-5 text-secondary-600" />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-3 mt-3 border-t border-secondary-200">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        Duplicate
                      </Button>
                      {post.status === 'scheduled' && (
                        <Button size="sm" variant="outline" className="text-error-600 hover:text-error-700">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {scheduledPosts.length === 0 && (
            <Card className="border-2 border-dashed border-secondary-300">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">No scheduled posts</h3>
                <p className="text-secondary-600 mb-4">
                  Schedule your first post to maintain a consistent social media presence
                </p>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule a Post
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Posting Calendar Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Posting Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-sm font-medium text-secondary-600 py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }).map((_, index) => {
                  const day = index + 1;
                  const hasPost = day % 5 === 0; // Mock: every 5th day has a post
                  return (
                    <div
                      key={day}
                      className={`h-10 flex items-center justify-center rounded-lg ${
                        hasPost
                          ? 'bg-primary-100 text-primary-700 font-semibold'
                          : 'hover:bg-secondary-100'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-200">
                <div className="text-sm text-secondary-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary-100 rounded"></div>
                    <span>Scheduled posts</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View Full Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}