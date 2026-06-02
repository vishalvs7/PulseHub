// src/app/(dashboard)/influencer/profile/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Save,
  Upload,
  Edit,
  User,
  Mail,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  TrendingUp,
  DollarSign,
  Award,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

interface SocialLink {
  platform: string;
  handle: string;
  verified: boolean;
  icon: any;
}

interface PortfolioItem {
  id: number;
  title: string;
  platform: string;
  engagement: string;
  reach: string;
  date: string;
}

export default function InfluencerProfilePage() {
  const [editMode, setEditMode] = useState(false);
  
  // Profile data
  const [profile, setProfile] = useState({
    displayName: 'Sarah Chen',
    bio: 'Lifestyle & Travel Influencer | Tech Enthusiast ✨ Creating content that inspires and educates. Based in Los Angeles, exploring the world one story at a time.',
    email: 'sarah@influencer.com',
    location: 'Los Angeles, California',
    website: 'https://sarahchen.com',
    niche: ['Lifestyle', 'Travel', 'Technology', 'Fashion'],
    hourlyRate: '$150 - $250',
    languages: ['English', 'Mandarin'],
  });

  // Social links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: 'Instagram', handle: '@sarahchen', verified: true, icon: Instagram },
    { platform: 'Twitter', handle: '@sarah_tweets', verified: true, icon: Twitter },
    { platform: 'YouTube', handle: 'Sarah Chen', verified: true, icon: Youtube },
    { platform: 'LinkedIn', handle: 'sarah-chen', verified: false, icon: Linkedin },
  ]);

  // Portfolio items
  const portfolioItems: PortfolioItem[] = [
    { id: 1, title: 'Tokyo Travel Vlog', platform: 'YouTube', engagement: '45K', reach: '125K', date: '2024-02-15' },
    { id: 2, title: 'Tech Gadget Review', platform: 'Instagram', engagement: '12K', reach: '45K', date: '2024-02-10' },
    { id: 3, title: 'Morning Routine', platform: 'TikTok', engagement: '85K', reach: '250K', date: '2024-02-05' },
    { id: 4, title: 'Sustainable Fashion', platform: 'Instagram', engagement: '8K', reach: '32K', date: '2024-01-28' },
  ];

  // Stats
  const profileStats = [
    { label: 'Profile Views', value: '1,245', icon: Eye, change: '+12%' },
    { label: 'New Followers', value: '2,450', icon: Users, change: '+8%' },
    { label: 'Engagement Rate', value: '4.8%', icon: TrendingUp, change: '+0.4%' },
    { label: 'Avg Earnings', value: '$3,450', icon: DollarSign, change: '+$450' },
  ];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would update the profile via API
    alert('Profile updated successfully!');
    setEditMode(false);
  };

  const toggleVerification = (platform: string) => {
    setSocialLinks(links =>
      links.map(link =>
        link.platform === platform
          ? { ...link, verified: !link.verified }
          : link
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Profile</h1>
          <p className="text-secondary-600 mt-2">Manage your influencer profile and portfolio</p>
        </div>
        <div className="flex items-center space-x-3">
          {editMode ? (
            <>
              <Button
                onClick={() => setEditMode(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="profile-form"
                className="bg-gradient-to-r from-primary-600 to-primary-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              className="bg-gradient-to-r from-primary-600 to-primary-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <form id="profile-form" onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-start space-x-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      SC
                    </div>
                    {editMode && (
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-secondary-300 rounded-full flex items-center justify-center hover:bg-secondary-50"
                      >
                        <Upload className="w-4 h-4 text-secondary-600" />
                      </button>
                    )}
                  </div>
                  
                  {/* Basic Info */}
                  <div className="flex-1">
                    {editMode ? (
                      <Input
                        label="Display Name"
                        value={profile.displayName}
                        onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                        icon={<User className="w-5 h-5" />}
                        className="mb-4"
                      />
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-secondary-900">{profile.displayName}</h2>
                        <div className="flex items-center space-x-2 mt-1">
                          <Shield className="w-4 h-4 text-primary-600" />
                          <span className="text-primary-600 font-medium">Verified Influencer</span>
                          <span className="text-sm text-secondary-500">• Trust Score: 92/100</span>
                        </div>
                      </>
                    )}
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.niche.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Bio
                  </label>
                  {editMode ? (
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      className="w-full h-32 px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                    />
                  ) : (
                    <p className="text-secondary-700 whitespace-pre-line">{profile.bio}</p>
                  )}
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Email
                    </label>
                    {editMode ? (
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        icon={<Mail className="w-5 h-5" />}
                      />
                    ) : (
                      <div className="flex items-center text-secondary-700">
                        <Mail className="w-5 h-5 text-secondary-400 mr-2" />
                        {profile.email}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Location
                    </label>
                    {editMode ? (
                      <Input
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        icon={<MapPin className="w-5 h-5" />}
                      />
                    ) : (
                      <div className="flex items-center text-secondary-700">
                        <MapPin className="w-5 h-5 text-secondary-400 mr-2" />
                        {profile.location}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Website
                    </label>
                    {editMode ? (
                      <Input
                        value={profile.website}
                        onChange={(e) => setProfile({...profile, website: e.target.value})}
                        icon={<Globe className="w-5 h-5" />}
                      />
                    ) : (
                      <div className="flex items-center text-secondary-700">
                        <Globe className="w-5 h-5 text-secondary-400 mr-2" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Hourly Rate
                    </label>
                    {editMode ? (
                      <Input
                        value={profile.hourlyRate}
                        onChange={(e) => setProfile({...profile, hourlyRate: e.target.value})}
                        icon={<DollarSign className="w-5 h-5" />}
                      />
                    ) : (
                      <div className="flex items-center text-secondary-700">
                        <DollarSign className="w-5 h-5 text-secondary-400 mr-2" />
                        {profile.hourlyRate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((language) => (
                      <span
                        key={language}
                        className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm rounded-full"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Social Media Links</CardTitle>
                {editMode && (
                  <Button size="sm" variant="outline">
                    + Add Platform
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <div key={link.platform} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-secondary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary-900">{link.platform}</h3>
                          <p className="text-secondary-600">{link.handle}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {link.verified ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-5 h-5 mr-1" />
                            <span className="text-sm">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-secondary-600">
                            <XCircle className="w-5 h-5 mr-1" />
                            <span className="text-sm">Not Verified</span>
                          </div>
                        )}
                        
                        {editMode && (
                          <button
                            onClick={() => toggleVerification(link.platform)}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            {link.verified ? 'Unverify' : 'Verify'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Showcase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-secondary-900">{item.title}</h3>
                      <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded">
                        {item.platform}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-lg font-bold text-secondary-900">{item.engagement}</div>
                        <div className="text-sm text-secondary-600">Engagement</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-secondary-900">{item.reach}</div>
                        <div className="text-sm text-secondary-600">Reach</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-secondary-600">
                      <span>{item.date}</span>
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="outline">
                  View Full Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Profile Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm text-secondary-600">{stat.label}</p>
                          <p className="text-xl font-bold text-secondary-900">{stat.value}</p>
                        </div>
                      </div>
                      <span className="text-sm text-green-600">{stat.change}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Trust Score */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Award className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-secondary-900 mb-2">92/100</div>
                <div className="text-secondary-600 mb-4">Trust Score</div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Score Progress</span>
                    <span>92%</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                      style={{ width: '92%' }}
                    />
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Improve Score
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Add Portfolio Item
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Set Pricing
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Award className="w-4 h-4 mr-2" />
                Get Verified
              </Button>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-secondary-900 mb-4">Profile Completion</h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>85% Complete</span>
                  <span>17/20</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full"
                    style={{ width: '85%' }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                {[
                  { task: 'Add profile photo', completed: true },
                  { task: 'Write bio', completed: true },
                  { task: 'Connect 3+ social accounts', completed: true },
                  { task: 'Add portfolio items', completed: true },
                  { task: 'Set pricing', completed: false },
                  { task: 'Complete verification', completed: false },
                ].map((task, index) => (
                  <div key={index} className="flex items-center">
                    {task.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-secondary-300 rounded-full mr-2" />
                    )}
                    <span className={`text-sm ${task.completed ? 'text-secondary-600' : 'text-secondary-900'}`}>
                      {task.task}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}