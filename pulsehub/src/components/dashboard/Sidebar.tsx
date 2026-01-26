// src/components/dashboard/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Send,
  Inbox,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  UserCircle,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  type: 'brand' | 'influencer';
  userData?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

const brandItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard/brand', icon: LayoutDashboard },
  { name: 'Analytics', href: '/dashboard/brand/analytics', icon: BarChart3 },
  { name: 'Campaigns', href: '/dashboard/brand/campaigns', icon: Megaphone },
  { name: 'Posting', href: '/dashboard/brand/posting', icon: Send },
  { name: 'Inbox', href: '/dashboard/brand/inbox', icon: Inbox },
  { name: 'Marketplace', href: '/dashboard/brand/marketplace', icon: Users },
  { name: 'Pricing', href: '/dashboard/brand/pricing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/brand/settings', icon: Settings },
];

const influencerItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard/influencer', icon: LayoutDashboard },
  { name: 'Analytics', href: '/dashboard/influencer/analytics', icon: BarChart3 },
  { name: 'Connections', href: '/dashboard/influencer/connections', icon: Users },
  { name: 'Profile', href: '/dashboard/influencer/profile', icon: UserCircle },
  { name: 'Inbox', href: '/dashboard/influencer/inbox', icon: Inbox },
  { name: 'Marketplace', href: '/dashboard/influencer/marketplace', icon: Users },
  { name: 'Settings', href: '/dashboard/influencer/settings', icon: Settings },
];

export default function Sidebar({ type, userData, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  const items = type === 'brand' ? brandItems : influencerItems;

  return (
    <div className={`h-full bg-white border-r border-secondary-200 transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="p-6 border-b border-secondary-100">
        <div className="flex items-center justify-between">
          <Link href={type === 'brand' ? '/dashboard/brand' : '/dashboard/influencer'} 
                className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center ${
              collapsed ? 'mx-auto' : ''
            }`}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-xl font-bold text-secondary-900">PulseHub</span>
                <div className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full mt-1 inline-block">
                  {type === 'brand' ? 'Brand' : 'Influencer'}
                </div>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 hover:bg-secondary-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-secondary-600" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full mt-4 p-1 hover:bg-secondary-100 rounded-lg flex justify-center"
          >
            <ChevronRight className="w-5 h-5 text-secondary-600" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center ${
                collapsed ? 'justify-center px-3' : 'space-x-3 px-4'
              } py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                  : 'text-secondary-700 hover:bg-secondary-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-secondary-400'}`} />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      {userData && !collapsed && (
        <div className="p-4 border-t border-secondary-100">
          <div className="flex items-center space-x-3 mb-4">
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={userData.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-bold">
                  {userData.name?.[0] || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-secondary-900 truncate">
                {userData.name || `${type} Account`}
              </p>
              <p className="text-sm text-secondary-500 truncate">{userData.email}</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full text-center px-4 py-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}
      
      {collapsed && userData && (
        <div className="p-4 border-t border-secondary-100 flex justify-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-bold">
              {userData.name?.[0] || 'U'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}