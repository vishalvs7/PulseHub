// src/app/(dashboard)/brand/settings/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Save,
  Upload,
  Bell,
  Shield,
  Users,
  Globe,
  CreditCard,
  Key,
  Trash2,
  User,
  Building,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
   HelpCircle,
} from 'lucide-react';
import { useState } from 'react';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
}

export default function BrandSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'billing' | 'notifications' | 'security'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    companyName: 'TechNova Inc.',
    contactEmail: 'contact@technova.com',
    phoneNumber: '+1 (555) 123-4567',
    website: 'https://technova.com',
    industry: 'Technology',
    companySize: '51-200',
    address: '123 Tech Street, San Francisco, CA 94107',
    bio: 'Innovative tech company specializing in AI solutions for businesses.',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: 'campaigns', label: 'Campaign Updates', description: 'Get notified about campaign status changes', enabled: true },
    { id: 'influencers', label: 'New Influencer Messages', description: 'Notifications when influencers message you', enabled: true },
    { id: 'analytics', label: 'Weekly Analytics Reports', description: 'Receive weekly performance summaries', enabled: true },
    { id: 'system', label: 'System Updates', description: 'Important platform updates and announcements', enabled: false },
    { id: 'marketing', label: 'Marketing Emails', description: 'Tips, best practices, and platform news', enabled: true },
  ]);

  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, name: 'Alex Johnson', email: 'alex@technova.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Sarah Miller', email: 'sarah@technova.com', role: 'editor', status: 'active' },
    { id: 3, name: 'Mike Chen', email: 'mike@technova.com', role: 'viewer', status: 'pending' },
    { id: 4, name: 'Lisa Wang', email: 'lisa@technova.com', role: 'editor', status: 'inactive' },
  ]);

  const tabs = [
    { id: 'profile', label: 'Company Profile', icon: Building },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would update the profile via API
    alert('Profile updated successfully!');
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

  const removeTeamMember = (id: number) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter(member => member.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-lg">Active</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-lg">Pending</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded-lg">Inactive</span>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-lg">Admin</span>;
      case 'editor':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">Editor</span>;
      case 'viewer':
        return <span className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded-lg">Viewer</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-600 mt-2">Manage your company profile, team, and preferences</p>
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
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Update your company information and contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Company Name"
                      value={profileForm.companyName}
                      onChange={(e) => setProfileForm({...profileForm, companyName: e.target.value})}
                      icon={<Building className="w-5 h-5" />}
                    />
                    <Input
                      label="Contact Email"
                      type="email"
                      value={profileForm.contactEmail}
                      onChange={(e) => setProfileForm({...profileForm, contactEmail: e.target.value})}
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
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Industry
                      </label>
                      <select
                        value={profileForm.industry}
                        onChange={(e) => setProfileForm({...profileForm, industry: e.target.value})}
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
                      >
                        <option value="Technology">Technology</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Health & Wellness">Health & Wellness</option>
                        <option value="Travel">Travel</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Company Size
                      </label>
                      <select
                        value={profileForm.companySize}
                        onChange={(e) => setProfileForm({...profileForm, companySize: e.target.value})}
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 outline-none"
                      >
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Company Address
                    </label>
                    <Input
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Company Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      className="w-full h-32 px-4 py-3 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                    />
                    <p className="text-sm text-secondary-500 mt-2">Brief description of your company (max 500 characters)</p>
                  </div>
                  
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Company Logo
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-secondary-100 rounded-lg flex items-center justify-center">
                        <Building className="w-10 h-10 text-secondary-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-secondary-600 mb-2">
                          Upload your company logo. Recommended size: 400x400px
                        </p>
                        <div className="flex items-center space-x-3">
                          <Button type="button" variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo
                          </Button>
                          <Button type="button" variant="ghost" className="text-error-600 hover:text-error-700">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
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

          {/* Team Management */}
          {activeTab === 'team' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>Manage team members and their permissions</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
                    <Users className="w-4 h-4 mr-2" />
                    Invite Team Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary-900">{member.name}</h3>
                          <p className="text-sm text-secondary-600">{member.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getRoleBadge(member.role)}
                          {getStatusBadge(member.status)}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-error-600 hover:text-error-700"
                            onClick={() => removeTeamMember(member.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Permissions Info */}
                <div className="mt-8 p-4 bg-secondary-50 rounded-lg">
                  <h4 className="font-semibold text-secondary-900 mb-3">Permission Levels</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        role: 'Admin',
                        description: 'Full access to all features, billing, and team management',
                        color: 'text-primary-700',
                      },
                      {
                        role: 'Editor',
                        description: 'Can create campaigns, contact influencers, and view analytics',
                        color: 'text-blue-700',
                      },
                      {
                        role: 'Viewer',
                        description: 'View-only access to campaigns and analytics',
                        color: 'text-secondary-700',
                      },
                    ].map((perm, index) => (
                      <div key={index} className="p-3 bg-white border border-secondary-200 rounded">
                        <h5 className={`font-semibold ${perm.color} mb-1`}>{perm.role}</h5>
                        <p className="text-sm text-secondary-600">{perm.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing & Plan */}
          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your subscription and billing information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="p-6 border border-primary-200 bg-primary-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-secondary-900">Professional Plan</h3>
                        <p className="text-secondary-600">Billed monthly • Next payment: April 15, 2024</p>
                      </div>
                      <span className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold">
                        $149/month
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {[
                        { label: 'Social Accounts', value: '10/10', max: 10 },
                        { label: 'Team Members', value: '2/3', max: 3 },
                        { label: 'Influencer Contacts', value: 'Unlimited', max: null },
                        { label: 'Storage', value: '50GB', max: null },
                      ].map((item, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl font-bold text-secondary-900">{item.value}</div>
                          <div className="text-sm text-secondary-600">{item.label}</div>
                          {item.max && (
                            <div className="w-full bg-secondary-200 rounded-full h-2 mt-2">
                              <div 
                                className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full"
                                style={{ width: `${(parseInt(item.value.split('/')[0]) / item.max) * 100}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button className="bg-gradient-to-r from-primary-600 to-primary-700">
                        Upgrade to Enterprise
                      </Button>
                      <Button variant="outline">
                        Change Plan
                      </Button>
                      <Button variant="ghost" className="text-error-600 hover:text-error-700">
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Billing History</h3>
                    <div className="space-y-3">
                      {[
                        { date: 'Mar 15, 2024', description: 'Professional Plan - Monthly', amount: '$149.00', status: 'Paid' },
                        { date: 'Feb 15, 2024', description: 'Professional Plan - Monthly', amount: '$149.00', status: 'Paid' },
                        { date: 'Jan 15, 2024', description: 'Professional Plan - Monthly', amount: '$149.00', status: 'Paid' },
                      ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                          <div>
                            <p className="font-medium text-secondary-900">{invoice.date}</p>
                            <p className="text-sm text-secondary-600">{invoice.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-semibold text-secondary-900">{invoice.amount}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-lg">
                              {invoice.status}
                            </span>
                            <Button size="sm" variant="outline">
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Payment Method</h3>
                    <div className="p-4 border border-secondary-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900">Visa ending in 4242</p>
                            <p className="text-sm text-secondary-600">Expires 12/2025</p>
                          </div>
                        </div>
                        <Button variant="outline">Update</Button>
                      </div>
                    </div>
                  </div>
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
                    All notifications are sent via email. For urgent matters, you can also enable push notifications in your browser settings.
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
                        { device: 'Chrome on Windows', location: 'San Francisco, CA', time: 'Current', current: true },
                        { device: 'Safari on iPhone', location: 'New York, NY', time: '2 hours ago', current: false },
                        { device: 'Firefox on Mac', location: 'London, UK', time: '1 day ago', current: false },
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-secondary-900">{session.device}</h4>
                              {session.current && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-lg">Current</span>
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

                  {/* Two-Factor Authentication */}
                  <div className="p-4 border border-secondary-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-secondary-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-secondary-600 mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-secondary-100 text-secondary-800 text-sm rounded-lg">
                        Not Enabled
                      </span>
                    </div>
                    <Button variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Enable 2FA
                    </Button>
                  </div>

                  {/* Account Deletion */}
                  <div className="p-4 border border-error-200 bg-error-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-secondary-900">Delete Account</h3>
                        <p className="text-sm text-secondary-600 mt-1">
                          Permanently delete your account and all associated data
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
                API Documentation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Plan', value: 'Professional', status: 'active' },
                { label: 'Billing', value: 'Monthly', status: 'active' },
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
                      <XCircle className="w-4 h-4 text-secondary-400" />
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
                Download Data
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                Export Campaigns
              </Button>
              <Button className="w-full justify-start" variant="ghost">
                View Audit Log
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