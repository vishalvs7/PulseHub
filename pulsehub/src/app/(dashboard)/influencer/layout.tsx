// src/app/(dashboard)/influencer/layout.tsx
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  UserCircle,
  Inbox,
  Settings,
  Menu,
  X,
  Zap,
  Bell,
  Search,
  HelpCircle,
  TrendingUp,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { AuthService } from '@/services/auth.service';

const influencerNavItems = [
  { name: 'Dashboard', href: '/dashboard/influencer', icon: LayoutDashboard },
  { name: 'Analytics', href: '/dashboard/influencer/analytics', icon: BarChart3 },
  { name: 'Connections', href: '/dashboard/influencer/connections', icon: Users },
  { name: 'Profile', href: '/dashboard/influencer/profile', icon: UserCircle },
  { name: 'Inbox', href: '/dashboard/influencer/inbox', icon: Inbox },
  { name: 'Marketplace', href: '/dashboard/influencer/marketplace', icon: Users },
  { name: 'Settings', href: '/dashboard/influencer/settings', icon: Settings },
];

export default function InfluencerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData } = useAuth();

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  const notifications = [
    { id: 1, text: 'New collaboration request from @TechBrand', time: '10 min ago', read: false },
    { id: 2, text: 'Your post reached 10K likes!', time: '2 hours ago', read: true },
    { id: 3, text: 'Profile verification approved', time: '1 day ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mock influencer stats
  const platformStats = [
    { platform: 'Instagram', followers: '125K', icon: Instagram, color: 'text-pink-500' },
    { platform: 'Twitter', followers: '45K', icon: Twitter, color: 'text-blue-400' },
    { platform: 'YouTube', followers: '30K', icon: Youtube, color: 'text-red-500' },
    { platform: 'LinkedIn', followers: '15K', icon: Linkedin, color: 'text-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/20 to-white">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white shadow-md"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-secondary-200 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-200`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-secondary-100">
            <Link href="/dashboard/influencer" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-secondary-900">PulseHub</span>
                <div className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full mt-1 inline-block">
                  Influencer
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {influencerNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                      : 'text-secondary-700 hover:bg-secondary-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-secondary-400'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Platform Stats */}
          <div className="p-4 border-t border-secondary-100">
            <h3 className="text-sm font-medium text-secondary-900 mb-3">Platform Stats</h3>
            <div className="space-y-2">
              {platformStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-sm text-secondary-600">{stat.platform}</span>
                    </div>
                    <span className="text-sm font-semibold text-secondary-900">{stat.followers}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User profile */}
          <div className="p-4 border-t border-secondary-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {(userData as any)?.displayName?.[0] || 'I'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-secondary-900 truncate">
                  {(userData as any)?.displayName || 'Influencer'}
                </p>
                <div className="flex items-center">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">4.8% engagement</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-center px-4 py-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-secondary-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search analytics, brands, messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none bg-white/50"
                  />
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Help */}
                <button className="p-2 text-secondary-600 hover:text-primary-600 transition">
                  <HelpCircle className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-secondary-600 hover:text-primary-600 transition relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-secondary-200 z-50">
                      <div className="p-4 border-b border-secondary-100">
                        <h3 className="font-semibold text-secondary-900">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-secondary-100 hover:bg-secondary-50 ${
                              !notification.read ? 'bg-primary-50' : ''
                            }`}
                          >
                            <p className="text-sm text-secondary-900">{notification.text}</p>
                            <p className="text-xs text-secondary-500 mt-1">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-2 border-t border-secondary-100">
                        <Link
                          href="/dashboard/influencer/inbox"
                          className="block text-center text-sm text-primary-600 hover:text-primary-700 p-2"
                        >
                          View All Notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Score Badge */}
                <div className="px-3 py-1.5 bg-gradient-to-r from-primary-50 to-pink-50 border border-primary-200 rounded-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-primary-700">Trust Score: 92</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6">
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
}