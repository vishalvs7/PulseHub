// src/app/(dashboard)/influencer/settings/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Save,
  Bell,
  Shield,
  Users,
  Globe,
  CreditCard,
  Key,
  Trash2,
  User,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  HelpCircle,
  DollarSign,
  Building,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface PricingTier {
  id: number;
  type: string;
  description: string;
  price: string;
  deliverables: string[];
}

export default function InfluencerSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'pricing' | 'notifications' | 'security'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: 'Sarah Chen',
    email: 'sarah@influencer.com',
    phoneNumber: '+1 (555) 123-4567',
    website: 'https://sarahchen.com',
    location: 'Los Angeles, California',
    hourlyRate: '$150 - $250',
    bio: 'Lifestyle & Travel Influencer | Tech Enthusiast ✨ Creating content that inspires and educates.',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: 'collaborations', label: 'New Collaboration Requests', description: 'Get notified when brands want to work with you', enabled: true },
    { id: 'messages', label: 'New Messages', description: 'Notifications when you receive new messages', enabled: true },
    { id: 'analytics', label: 'Weekly Analytics Reports', description: 'Receive weekly performance summaries', enabled: true },
    { id: 'platform', label: 'Platform Updates', description: 'Important platform updates and announcements', enabled: false },
    { id: 'marketing', label: 'Marketing Tips', description: 'Tips and best practices for influencers', enabled: true },
  ]);

  // Pricing tiers
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    {
      id: 1,
      type: 'Instagram Post',
      description: 'Single Instagram feed post',
      price: '$250',
      deliverables: ['1 High-quality photo', 'Caption with brand mentions', '24-hour story support', 'Basic analytics'],
    },
    {
      id: 2,
      type: 'Instagram Reel',
      description: 'Short-form video content',
      price: '$400',
      deliverables: ['30-60 second video', 'Professional editing', 'Caption with CTAs', '48-hour story support', 'Detailed analytics'],
    },
    {
      id: 3,
      type: 'YouTube Video',
      description: 'Long-form video content',
      price: '$1,200',
      deliverables: ['5-10 minute video', 'Professional editing', 'Script consultation', 'Thumbnail design', 'SEO optimization', 'Comprehensive analytics'],
    },
    {
      id: 4,
      type: 'Brand Ambassador',
      description: 'Long-term partnership',
      price: 'Custom',
      deliverables: ['Monthly content package', 'Exclusive rights', 'Brand mentions', 'Product testing', 'Quarterly strategy sessions'],
    },
  ]);

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'pricing', label: 'Pricing & Packages', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would update the profile via API
    alert('Profile settings updated successfully!');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    // In real app, this would update password via API
    alert('Password updated successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const toggleNotification = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, enabled: !n.enabled } : n
    ));
  };

  const updatePricing = (id: number, field: string, value: string) => {
    setPricingTiers(tiers =>
      tiers.map(tier =>
        tier.id === id ? { ...tier, [field]: value } : tier
      )
    );
  };

  const addPricingTier = () => {
    const newId = pricingTiers.length + 1;
    setPricingTiers([
      ...pricingTiers,
      {
        id: newId,
        type: 'New Package',
        description: 'Describe your package',
        price: '$0',
        deliverables: ['Add deliverables here'],
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-600 mt-2">Manage your account, preferences, and security</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <div className="flex space-x-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-secondary-600 hover:text-secondary-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Display Name"
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm({...profileForm, displayName: e.target.value})}
                      icon={<User className="w-5 h-5" />}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      icon={<Mail className="w-5 h-5" />}
                    />
                    <Input
                      label="Phone Number"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                      icon={<Smartphone className="w-5 h-5" />}
                    />
                    <Input
                      label="Website"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                      icon={<Globe className="w-5 h-5" />}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Location
                    </label>
                    <Input
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                      icon={<Building className="w-5 h-5" />}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Hourly Rate
                    </label>
                    <Input
                      value={profileForm.hourlyRate}
                      onChange={(e) => setProfileForm({...profileForm, hourlyRate: e.target.value})}
                      icon={<DollarSign className="w-5 h-5" />}
                    />
                    <p className="text-sm text-secondary-500 mt-2">This is shown to brands for consultation requests</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      className="w-full h-32 px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                    />
                    <p className="text-sm text-secondary-500 mt-2">Brief description that appears on your public profile</p>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-secondary-200">
                    <Button type="submit" className="bg-gradient-to-r from-primary-600 to-primary-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Pricing & Packages */}
          {activeTab === 'pricing' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pricing & Packages</CardTitle>
                    <CardDescription>Set your rates for different types of collaborations</CardDescription>
                  </div>
                  <Button onClick={addPricingTier} variant="outline">
                    + Add Package
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {pricingTiers.map((tier) => (
                    <div key={tier.id} className="p-4 border border-secondary-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Package Type
                          </label>
                          <Input
                            value={tier.type}
                            onChange={(e) => updatePricing(tier.id, 'type', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Description
                          </label>
                          <Input
                            value={tier.description}
                            onChange={(e) => updatePricing(tier.id, 'description', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Price
                          </label>
                          <Input
                            value={tier.price}
                            onChange={(e) => updatePricing(tier.id, 'price', e.target.value)}
                            icon={<DollarSign className="w-5 h-5" />}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Deliverables
                        </label>
                        <div className="space-y-2">
                          {tier.deliverables.map((deliverable, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <Input
                                value={deliverable}
                                onChange={(e) => {
                                  const newDeliverables = [...tier.deliverables];
                                  newDeliverables[index] = e.target.value;
                                  setPricingTiers(tiers =>
                                    tiers.map(t =>
                                      t.id === tier.id ? { ...t, deliverables: newDeliverables } : t
                                    )
                                  );
                                }}
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const newDeliverables = tier.deliverables.filter((_, i) => i !== index);
                                  setPricingTiers(tiers =>
                                    tiers.map(t =>
                                      t.id === tier.id ? { ...t, deliverables: newDeliverables } : t
                                    )
                                  );
                                }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => {
                            setPricingTiers(tiers =>
                              tiers.map(t =>
                                t.id === tier.id
                                  ? { ...t, deliverables: [...t.deliverables, 'New deliverable'] }
                                  : t
                              )
                            );
                          }}
                        >
                          + Add Deliverable
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
                  <h4 className="font-semibold text-secondary-900 mb-2">Pricing Tips</h4>
                  <ul className="space-y-2 text-sm text-secondary-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      Consider your engagement rate and follower count when setting prices
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      Include all deliverables clearly to avoid misunderstandings
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      Offer package discounts for long-term collaborations
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how and when you want to be notified</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-secondary-900">{setting.label}</h3>
                        <p className="text-sm text-secondary-600 mt-1">{setting.description}</p>
                      </div>
                      <button
                        onClick={() => toggleNotification(setting.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                          setting.enabled ? 'bg-primary-600' : 'bg-secondary-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            setting.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
                  <h4 className="font-semibold text-secondary-900 mb-2">Notification Channels</h4>
                  <p className="text-sm text-secondary-600">
                    All notifications are sent via email and in-app notifications. You can also enable browser push notifications.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            className="w-full pl-10 pr-10 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-5 h-5 text-secondary-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-secondary-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                              className="w-full pl-10 pr-10 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-5 h-5 text-secondary-400" />
                              ) : (
                                <Eye className="w-5 h-5 text-secondary-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                              className="w-full pl-10 pr-10 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-5 h-5 text-secondary-400" />
                              ) : (
                                <Eye className="w-5 h-5 text-secondary-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <Button type="submit" className="bg-gradient-to-r from-primary-600 to-primary-700">
                          Update Password
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setShowCurrentPassword(false);
                            setShowNewPassword(false);
                            setShowConfirmPassword(false);
                          }}
                        >
                          Reset
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Security Sessions */}
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      {[
                        { device: 'Chrome on Windows', location: 'Los Angeles, CA', time: 'Current', current: true },
                        { device: 'Safari on iPhone', location: 'New York, NY', time: '2 hours ago', current: false },
                        { device: 'Firefox on Mac', location: 'London, UK', time: '1 day ago', current: false },
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-secondary-900">{session.device}</h4>
                              {session.current && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Current</span>
                              )}
                            </div>
                            <p className="text-sm text-secondary-600">{session.location} • {session.time}</p>
                          </div>
                          {!session.current && (
                            <Button size="sm" variant="ghost" className="text-error-600 hover:text-error-700">
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Account Deletion */}
                  <div className="p-4 border border-error-200 bg-error-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-secondary-900">Delete Account</h3>
                        <p className="text-sm text-secondary-600 mt-1">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      <Button variant="outline" className="border-error-300 text-error-600 hover:bg-error-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Help & Support */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help Center
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Globe className="w-4 h-4 mr-2" />
                Community Forum
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Verification', value: 'Verified', status: 'active' },
                { label: 'Trust Score', value: '92/100', status: 'active' },
                { label: '2FA', value: 'Not Enabled', status: 'inactive' },
                { label: 'Last Login', value: 'Just now', status: 'active' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">{item.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{item.value}</span>
                    {item.status === 'active' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-secondary-400" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="ghost">
                Download Media Kit
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                Export Analytics
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                View Public Profile
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}