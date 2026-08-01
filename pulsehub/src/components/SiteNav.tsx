'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/tools', label: 'Free Tools' },
  { href: '/academy', label: 'Academy' },
  { href: '/pricing', label: 'Pricing' },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);

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

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-sm font-semibold uppercase tracking-wide text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link href="/register">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                Get Started
              </button>
            </Link>
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
          </div>
        </div>
      )}
    </nav>
  );
}
