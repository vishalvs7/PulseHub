// src/app/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Zap, Sparkles, BarChart3, Users, MessageSquare, Shield, TrendingUp, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">PulseHub</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white border border-purple-200 px-4 py-2 rounded-full mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">No credit card required • Free for influencers</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Brands</span> Meet{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Authentic Influence</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Unify your social presence, discover vetted influencers, and drive real results—all from one beautiful dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=brand">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Start as a Brand
              </Button>
            </Link>
            <Link href="/register?role=influencer">
              <Button size="lg" variant="outline" className="border-purple-600 text-purple-600">
                Join as Influencer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - 3 Cards */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-lg text-gray-600">Built for modern brands and influencers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Unified Analytics</h3>
              <p className="text-gray-600">Track performance across Instagram, Twitter, LinkedIn, and Reddit from one dashboard.</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vetted Influencer Network</h3>
              <p className="text-gray-600">Connect with authentic creators verified by our trust scoring algorithm.</p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Centralized Inbox</h3>
              <p className="text-gray-600">Manage all DMs and comments from all platforms in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - 100px black */}
      <footer className="bg-black text-white py-8 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="font-semibold">PulseHub</span>
              <span className="text-gray-500 text-sm">© 2024</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition">Terms</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}