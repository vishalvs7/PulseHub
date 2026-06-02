// src/app/(dashboard)/influencer/inbox/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search,
  Filter,
  Mail,
  Building,
  Clock,
  CheckCircle,
  Star,
  Paperclip,
  Send,
  MoreVertical,
  Image,
  Smile,
  DollarSign,
  Calendar,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: number;
  sender: {
    name: string;
    company: string;
    avatar: string;
    isBrand: boolean;
  };
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  starred: boolean;
  attachments: boolean;
  budget?: string;
}

interface Conversation {
  id: number;
  messages: Array<{
    id: number;
    sender: 'user' | 'brand';
    content: string;
    time: string;
    read: boolean;
  }>;
}

export default function InfluencerInboxPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'brand'>('all');

  // Mock messages data
  const messages: Message[] = [
    {
      id: 1,
      sender: {
        name: 'TechNova Inc.',
        company: 'TechNova',
        avatar: 'TN',
        isBrand: true,
      },
      subject: 'Summer Product Launch Collaboration',
      preview: "Hi Sarah! We're launching our new product line and think you'd be perfect for our campaign...",
      time: '10:30 AM',
      unread: true,
      starred: true,
      attachments: true,
      budget: '$1,200 - $2,500',
    },
    {
      id: 2,
      sender: {
        name: 'FashionHub',
        company: 'FashionHub',
        avatar: 'FH',
        isBrand: true,
      },
      subject: 'Spring Collection Promotion',
      preview: 'Thanks for your interest in our collaboration! Here are the details...',
      time: 'Yesterday',
      unread: false,
      starred: true,
      attachments: true,
      budget: '$800 - $1,500',
    },
    {
      id: 3,
      sender: {
        name: 'Mike Johnson',
        company: 'Individual',
        avatar: 'MJ',
        isBrand: false,
      },
      subject: 'Partnership Inquiry',
      preview: 'Loved your recent content! Would love to discuss potential collaboration...',
      time: 'Mar 15',
      unread: false,
      starred: false,
      attachments: false,
    },
    {
      id: 4,
      sender: {
        name: 'EcoLiving',
        company: 'EcoLiving',
        avatar: 'EL',
        isBrand: true,
      },
      subject: 'Sustainable Lifestyle Series',
      preview: 'Following up on our previous conversation about the eco-series...',
      time: 'Mar 14',
      unread: true,
      starred: false,
      attachments: true,
      budget: '$2,000 - $3,500',
    },
    {
      id: 5,
      sender: {
        name: 'Alex Chen',
        company: 'Marketing Agency',
        avatar: 'AC',
        isBrand: false,
      },
      subject: 'Brand Partnership Opportunity',
      preview: 'We have multiple brands interested in working with influencers like you...',
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
          sender: 'brand',
          content: "Hi Sarah! I'm Lisa from TechNova. We're launching our new smart home product line and think your tech content would be perfect for our campaign.",
          time: '10:30 AM',
          read: true,
        },
        {
          id: 2,
          sender: 'brand',
          content: 'The campaign involves creating 3 Instagram posts and 1 YouTube review video. Budget range is $1,200 - $2,500 depending on deliverables.',
          time: '10:31 AM',
          read: true,
        },
        {
          id: 3,
          sender: 'user',
          content: "Hi Lisa! Thanks for reaching out. I'd love to learn more about the timeline and specific requirements. Could you share the creative brief?",
          time: '10:45 AM',
          read: true,
        },
        {
          id: 4,
          sender: 'brand',
          content: 'Absolutely! The timeline is 2 weeks for content creation. I can share the creative brief and product details. When would you be available for a quick call?',
          time: '10:50 AM',
          read: true,
        },
      ],
    },
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'unread' && message.unread) ||
                         (filter === 'starred' && message.starred) ||
                         (filter === 'brand' && message.sender.isBrand);
    return matchesSearch && matchesFilter;
  });

  const selectedConversation = selectedMessage ? conversations[selectedMessage] : null;

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedMessage) return;
    
    // In a real app, this would send the message
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const brandMessages = messages.filter(m => m.sender.isBrand);
  const pendingBrandOffers = brandMessages.filter(m => m.unread).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Inbox</h1>
          <p className="text-secondary-600 mt-2">Manage all your messages and collaboration requests</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Messages', value: '42', icon: Mail, color: 'from-primary-600 to-primary-700' },
          { title: 'Brand Offers', value: `${brandMessages.length}`, icon: Building, color: 'from-green-500 to-emerald-600' },
          { title: 'Pending Offers', value: `${pendingBrandOffers}`, icon: Clock, color: 'from-yellow-500 to-orange-600' },
          { title: 'Avg Response Time', value: '4.2h', icon: CheckCircle, color: 'from-blue-500 to-cyan-600' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary-600">{stat.title}</p>
                    <p className="text-xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
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
              
              <div className="flex flex-wrap gap-2">
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
                <Button
                  size="sm"
                  variant={filter === 'brand' ? 'primary' : 'outline'}
                  onClick={() => setFilter('brand')}
                  className="relative"
                >
                  Brand Offers
                  {brandMessages.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                      {brandMessages.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Message List */}
            <div className="overflow-y-auto h-[calc(100vh-400px)]">
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
                        message.sender.isBrand
                          ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
                          : 'bg-secondary-100 text-secondary-700'
                      }`}>
                        {message.sender.avatar}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-secondary-900">
                            {message.sender.name}
                          </h3>
                          {message.sender.isBrand && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Brand
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-secondary-600">
                          {message.sender.company}
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
                  
                  <h4 className="font-medium text-secondary-900 mb-1">{message.subject}</h4>
                  <p className="text-secondary-700 line-clamp-2 mb-2">{message.preview}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {message.budget && (
                        <div className="flex items-center text-sm text-green-600">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {message.budget}
                        </div>
                      )}
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
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                      TN
                    </div>
                    <div>
                      <h2 className="font-semibold text-secondary-900">TechNova Inc.</h2>
                      <div className="flex items-center space-x-2 text-sm text-secondary-600">
                        <span>Summer Product Launch Collaboration</span>
                        <div className="flex items-center text-green-600">
                          <DollarSign className="w-3 h-3 mr-1" />
                          <span>$1,200 - $2,500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      View Offer
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-primary-600 to-primary-700">
                      Accept Collaboration
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
                        <Button variant="ghost" size="sm">
                          <DollarSign className="w-4 h-4" />
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
                Select a message from the list to view or continue a conversation
              </p>
              <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
                <Mail className="w-4 h-4 mr-2" />
                Start New Conversation
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Response Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Response Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Interest in Collaboration',
                content: "Thanks for reaching out! I'm interested in learning more about this opportunity. Could you share the creative brief and timeline?",
                icon: CheckCircle,
              },
              {
                title: 'Request for More Info',
                content: "This looks interesting! Could you provide more details about deliverables, exclusivity terms, and payment structure?",
                icon: Users,
              },
              {
                title: 'Availability Check',
                content: "I'd love to discuss this further. I'm available for a call next week. What times work best for you?",
                icon: Calendar,
              },
            ].map((template, index) => (
              <div key={index} className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition cursor-pointer">
                <div className="flex items-center space-x-2 mb-2">
                  {template.icon && <template.icon className="w-4 h-4 text-primary-600" />}
                  <h3 className="font-semibold text-secondary-900">{template.title}</h3>
                </div>
                <p className="text-sm text-secondary-600">{template.content}</p>
                <Button size="sm" variant="ghost" className="mt-2">
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}