// src/app/(dashboard)/brand/inbox/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search,
  Filter,
  Mail,
  User,
  Clock,
  CheckCircle,
  Star,
  Paperclip,
  Send,
  MoreVertical,
  Image,
  Smile,
  Instagram,
  Twitter,
  Linkedin,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: number;
  sender: {
    name: string;
    avatar: string;
    handle: string;
    isInfluencer: boolean;
  };
  platform: string;
  preview: string;
  time: string;
  unread: boolean;
  starred: boolean;
  attachments: boolean;
}

interface Conversation {
  id: number;
  messages: Array<{
    id: number;
    sender: 'user' | 'other';
    content: string;
    time: string;
    read: boolean;
  }>;
}

export default function BrandInboxPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  // Mock messages data
  const messages: Message[] = [
    {
      id: 1,
      sender: {
        name: 'Sarah Chen',
        avatar: 'SC',
        handle: '@sarahchen',
        isInfluencer: true,
      },
      platform: 'Instagram',
      preview: "Hi! I'm interested in your summer campaign. Could you share more details about the collaboration?",
      time: '10:30 AM',
      unread: true,
      starred: true,
      attachments: true,
    },
    {
      id: 2,
      sender: {
        name: 'Mike Rossi',
        avatar: 'MR',
        handle: '@miketravels',
        isInfluencer: true,
      },
      platform: 'YouTube',
      preview: 'Thanks for the opportunity! Here are my media kit and rates.',
      time: 'Yesterday',
      unread: false,
      starred: true,
      attachments: true,
    },
    {
      id: 3,
      sender: {
        name: 'Lena Beauty',
        avatar: 'LB',
        handle: '@lenabeauty',
        isInfluencer: true,
      },
      platform: 'TikTok',
      preview: 'The content is ready for review. Please let me know your feedback.',
      time: 'Mar 15',
      unread: false,
      starred: false,
      attachments: false,
    },
    {
      id: 4,
      sender: {
        name: 'Travel World',
        avatar: 'TW',
        handle: '@travelworld',
        isInfluencer: false,
      },
      platform: 'Email',
      preview: 'Partnership inquiry for Q2 2024',
      time: 'Mar 14',
      unread: true,
      starred: false,
      attachments: true,
    },
    {
      id: 5,
      sender: {
        name: 'TechGuru',
        avatar: 'TG',
        handle: '@techguru',
        isInfluencer: true,
      },
      platform: 'Twitter',
      preview: 'Looking forward to working on the product review!',
      time: 'Mar 13',
      unread: false,
      starred: true,
      attachments: false,
    },
  ];

  // Mock conversation data
  const conversations: Record<number, Conversation> = {
    1: {
      id: 1,
      messages: [
        {
          id: 1,
          sender: 'other',
          content: "Hi! I'm Sarah Chen, a lifestyle influencer. I came across your summer campaign and I'm very interested!",
          time: '10:30 AM',
          read: true,
        },
        {
          id: 2,
          sender: 'other',
          content: 'I have 125K engaged followers on Instagram and my audience aligns perfectly with your target demographic.',
          time: '10:31 AM',
          read: true,
        },
        {
          id: 3,
          sender: 'user',
          content: "Hi Sarah! Thanks for reaching out. We'd love to learn more about your content style and engagement rates.",
          time: '10:45 AM',
          read: true,
        },
        {
          id: 4,
          sender: 'other',
          content: 'My average engagement rate is 4.8% and I specialize in lifestyle, fashion, and travel content. I can share my media kit if you’re interested!',
          time: '10:50 AM',
          read: true,
        },
      ],
    },
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'unread' && message.unread) ||
                         (filter === 'starred' && message.starred);
    return matchesSearch && matchesFilter;
  });

  const selectedConversation = selectedMessage ? conversations[selectedMessage] : null;

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMessage) return;
    
    // In a real app, this would send the message
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'youtube':
        return <Instagram className="w-4 h-4 text-red-500" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-600" />;
      default:
        return <Mail className="w-4 h-4 text-secondary-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Inbox</h1>
          <p className="text-secondary-600 mt-2">Manage all your messages and collaborations in one place</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter Conversations
          </Button>
          <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
            <Mail className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Left Column: Message List */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardContent className="p-0">
            {/* Search and Filters */}
            <div className="p-4 border-b border-secondary-200">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <Input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={filter === 'all' ? 'primary' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  All Messages
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'unread' ? 'primary' : 'outline'}
                  onClick={() => setFilter('unread')}
                  className="relative"
                >
                  Unread
                  {messages.filter(m => m.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                      {messages.filter(m => m.unread).length}
                    </span>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'starred' ? 'primary' : 'outline'}
                  onClick={() => setFilter('starred')}
                >
                  Starred
                </Button>
              </div>
            </div>

            {/* Message List */}
            <div className="overflow-y-auto h-[calc(100vh-300px)]">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message.id)}
                  className={`p-4 border-b border-secondary-100 hover:bg-secondary-50 cursor-pointer transition ${
                    selectedMessage === message.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        message.sender.isInfluencer
                          ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                          : 'bg-secondary-100 text-secondary-700'
                      }`}>
                        {message.sender.avatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-secondary-900">
                            {message.sender.name}
                          </h3>
                          {message.sender.isInfluencer && (
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                              Influencer
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-secondary-600">
                          <span>{message.sender.handle}</span>
                          <div className="flex items-center">
                            {getPlatformIcon(message.platform)}
                            <span className="ml-1">{message.platform}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {message.starred && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {message.unread && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                      <span className="text-sm text-secondary-500">{message.time}</span>
                    </div>
                  </div>
                  
                  <p className="text-secondary-700 line-clamp-2 mb-2">{message.preview}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {message.attachments && (
                        <div className="flex items-center text-sm text-secondary-500">
                          <Paperclip className="w-3 h-3 mr-1" />
                          Attachment
                        </div>
                      )}
                    </div>
                    <button className="p-1 hover:bg-secondary-200 rounded">
                      <MoreVertical className="w-4 h-4 text-secondary-600" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredMessages.length === 0 && (
                <div className="p-8 text-center">
                  <Mail className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">No messages found</h3>
                  <p className="text-secondary-600">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Conversation */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-secondary-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      SC
                    </div>
                    <div>
                      <h2 className="font-semibold text-secondary-900">Sarah Chen</h2>
                      <div className="flex items-center space-x-2 text-sm text-secondary-600">
                        <span>@sarahchen</span>
                        <div className="flex items-center">
                          <Instagram className="w-4 h-4 text-pink-500 mr-1" />
                          <span>Instagram Influencer</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-primary-600 to-primary-700">
                      Start Collaboration
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50">
                {selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                          : 'bg-white border border-secondary-200'
                      }`}
                    >
                      <p className={msg.sender === 'user' ? 'text-white' : 'text-secondary-900'}>
                        {msg.content}
                      </p>
                      <div className={`flex items-center justify-end mt-2 text-xs ${
                        msg.sender === 'user' ? 'text-primary-200' : 'text-secondary-500'
                      }`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {msg.time}
                        {msg.sender === 'user' && msg.read && (
                          <CheckCircle className="w-3 h-3 ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-secondary-200 bg-white">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full h-20 px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Image className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Smile className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-secondary-500">
                        {newMessage.length}/1000 characters
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 h-12 px-6"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <Mail className="w-16 h-16 text-secondary-400 mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">No conversation selected</h3>
              <p className="text-secondary-600 text-center mb-6">
                Select a message from the list to start or continue a conversation
              </p>
              <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
                <Mail className="w-4 h-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Conversations', value: '42', change: '+5', trend: 'up' },
          { title: 'Avg Response Time', value: '2.4h', change: '-0.5h', trend: 'down' },
          { title: 'Active Collaborations', value: '8', change: '+2', trend: 'up' },
          { title: 'Unread Messages', value: '12', change: '-3', trend: 'down' },
        ].map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600">{stat.title}</p>
                  <p className="text-xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-error-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-secondary-500 ml-2">this week</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}