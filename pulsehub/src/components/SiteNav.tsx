'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, User } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { AuthService } from '@/services/auth.service';

const NAV_LINKS = [
  { href: '/tools', label: 'Free Tools' },
  { href: '/academy', label: 'Academy' },
  { href: '/pricing', label: 'Pricing' },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, userData, loading, signOut } = useAuth();

  const dashboardHref = userData?.role
    ? `/${userData.role}/${user?.id}`
    : '/login';

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    router.push('/login');
  };

  const avatarText = (userData?.displayName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <nav className="border-b border-primary-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <span className="text-xl font-bold text-primary-600">PulseHub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-primary-700 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 hover:opacity-90 transition"
                  aria-label="Account menu"
                >
                  {userData?.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt={userData.displayName || 'User'}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center text-white font-bold ring-2 ring-primary-200">
                      {avatarText}
                    </div>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-secondary-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-secondary-100">
                      <p className="font-semibold text-secondary-900 text-sm truncate">
                        {userData?.displayName || user.email}
                      </p>
                      <p className="text-xs text-secondary-500 truncate">{user.email}</p>
                      {userData?.role && (
                        <span className="inline-block mt-1 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-lg capitalize">
                          {userData.role}
                        </span>
                      )}
                    </div>
                    <Link
                      href={dashboardHref}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href={userData?.role ? `/${userData.role}/${user?.id}/settings` : '/login'}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 transition"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-error-600 hover:bg-error-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-gray-900">
                  Sign In
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-primary-100 bg-white px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700 hover:bg-primary-50 rounded-lg transition"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-primary-100 flex flex-col space-y-2">
            {!loading && user ? (
              <>
                <div className="flex items-center space-x-3 px-4 py-2">
                  {userData?.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt={userData.displayName || 'User'}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center text-white font-bold">
                      {avatarText}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-secondary-900 truncate">
                      {userData?.displayName || user.email}
                    </p>
                    <p className="text-xs text-secondary-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700 hover:bg-primary-50 rounded-lg transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 text-sm font-semibold uppercase tracking-wide text-error-600 hover:bg-error-50 rounded-lg transition text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700 hover:bg-primary-50 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="px-4 py-3">
                  <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
