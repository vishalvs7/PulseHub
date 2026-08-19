// src/components/dashboard/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Megaphone,
  Send,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Zap,
  UserCircle,
  Clock,
  MessageCircle,
  MessagesSquare,
  Handshake,
  Bot,
  Wrench,
  GraduationCap,
  Sparkles,
  Scissors,
  Crop,
  Menu,
  X,
  CalendarClock,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  children: SidebarItem[];
}

type SidebarEntry = SidebarItem | SidebarGroup;

const isGroup = (entry: SidebarEntry): entry is SidebarGroup => 'children' in entry;

interface SidebarProps {
  type: 'brand' | 'influencer';
  uid: string;
  userData?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
}

function buildItems(type: 'brand' | 'influencer', uid: string): SidebarEntry[] {
  const base = `/${type}/${uid}`;
  const newPost = { name: 'New Post', href: `${base}/posting`, icon: Send };
  const analytics = { name: 'Analytics', href: `${base}/analytics`, icon: BarChart3 };
  const posts = { name: 'Posts', href: `${base}/posts`, icon: CalendarClock };
  const connections = { name: 'Accounts', href: `${base}/connections`, icon: Users };
  const deals = { name: 'Deals', href: `${base}/deals`, icon: Handshake };

  const aiStudio: SidebarGroup = {
    name: 'AI Studio',
    icon: Sparkles,
    children: [
      { name: 'Transcript to Clip', href: `${base}/ai/transcript-to-clip`, icon: Scissors },
      { name: 'Resize & Trim', href: `${base}/ai/resize-trim`, icon: Crop },
      { name: 'Best Time to Post', href: `${base}/best-time-to-post`, icon: Clock },
      { name: 'Comment to DM', href: `${base}/comment-to-dm`, icon: Bot },
    ],
  };

  if (type === 'brand') {
    return [
      newPost,
      analytics,
      posts,
      { name: 'Explore Influencers', href: `${base}/explore`, icon: Users },
      deals,
      { name: 'Comments', href: `${base}/comments`, icon: MessagesSquare },
      connections,
      aiStudio,
      { name: 'Campaigns', href: `${base}/campaigns`, icon: Megaphone },
      { name: 'Academy', href: '/academy', icon: GraduationCap },
      { name: 'Free Tools', href: '/tools', icon: Wrench },
      { name: 'Settings', href: `${base}/settings`, icon: Settings },
    ];
  }
  return [
    newPost,
    analytics,
    { name: 'Profile', href: `${base}/profile`, icon: UserCircle },
    posts,
    connections,
    deals,
    { name: 'Comments', href: `${base}/comments`, icon: MessagesSquare },
    aiStudio,
    { name: 'Academy', href: '/academy', icon: GraduationCap },
    { name: 'Free Tools', href: '/tools', icon: Wrench },
    { name: 'Settings', href: `${base}/settings`, icon: Settings },
  ];
}

function SidebarContent({
  type,
  uid,
  userData,
  onLogout,
  collapsed,
  onToggleCollapse,
  onNavigate,
}: SidebarProps & { collapsed: boolean; onToggleCollapse: () => void; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = buildItems(type, uid);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (name: string, current: boolean) => {
    if (collapsed) onToggleCollapse();
    setOpenGroups((prev) => ({ ...prev, [name]: !current }));
  };

  return (
    <div className={`flex flex-col h-full bg-white border-r border-secondary-200 transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="p-6 border-b border-secondary-100">
        <div className="flex items-center justify-between">
          <Link href={`/${type}/${uid}/posting`} className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center ${
              collapsed ? 'mx-auto' : ''
            }`}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-xl font-bold text-secondary-900">PulseHub</span>
                <div className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-lg mt-1 inline-block">
                  {type === 'brand' ? 'Brand' : 'Influencer'}
                </div>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-secondary-100 rounded-lg hidden lg:block"
            >
              <ChevronLeft className="w-5 h-5 text-secondary-600" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-full mt-4 p-1 hover:bg-secondary-100 rounded-lg flex justify-center hidden lg:block"
          >
            <ChevronRight className="w-5 h-5 text-secondary-600" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          if (isGroup(item)) {
            const Icon = item.icon;
            const childActive = item.children.some((c) => pathname === c.href);
            const open = openGroups[item.name] ?? childActive;
            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.name, open)}
                  className={`w-full flex items-center ${
                    collapsed ? 'justify-center px-3' : 'space-x-3 px-4'
                  } py-3 rounded-lg transition-all ${
                    childActive
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                      : 'text-secondary-700 hover:bg-secondary-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${childActive ? 'text-primary-600' : 'text-secondary-400'}`} />
                  {!collapsed && <span className="font-medium truncate flex-1 text-left">{item.name}</span>}
                  {!collapsed &&
                    (open ? (
                      <ChevronUp className="w-4 h-4 text-secondary-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-secondary-400 shrink-0" />
                    ))}
                </button>
                {open && !collapsed && (
                  <div className="mt-1 space-y-0.5">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const active = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={onNavigate}
                          className={`flex items-center space-x-3 py-2.5 pl-12 pr-4 rounded-lg transition-all ${
                            active
                              ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                              : 'text-secondary-700 hover:bg-secondary-50'
                          }`}
                        >
                          <ChildIcon className={`w-4 h-4 shrink-0 ${active ? 'text-primary-600' : 'text-secondary-400'}`} />
                          <span className="font-medium truncate">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center ${
                collapsed ? 'justify-center px-3' : 'space-x-3 px-4'
              } py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                  : 'text-secondary-700 hover:bg-secondary-50'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-600' : 'text-secondary-400'}`} />
              {!collapsed && <span className="font-medium truncate">{item.name}</span>}
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
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
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

export default function Sidebar(props: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-secondary-200 flex items-center justify-between px-4 py-3">
        <Link href={`/${props.type}/${props.uid}/posting`} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-secondary-900">PulseHub</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-secondary-700 hover:bg-secondary-100 rounded-lg"
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          {...props}
          collapsed={false}
          onToggleCollapse={() => {}}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-full">
        <SidebarContent
          {...props}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>
    </>
  );
}
