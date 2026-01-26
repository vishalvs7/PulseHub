// src/app/(landing)/page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sparkles, Users, BarChart3, MessageSquare, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 font-montserrat">PulseHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-purple-600 font-medium transition">
              Sign In
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white border border-purple-200 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              No credit card required • Free for influencers
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Brands</span> Meet{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Authentic Influence</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Unify your social presence, discover vetted influencers, and drive real results—all from one beautiful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/register?role=brand" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                Start as a Brand
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register?role=influencer" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-purple-600 text-purple-600">
                Join as Influencer
              </Button>
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto">
            <Card className="p-2 border-2 border-purple-200 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {['Total Reach', 'Engagement Rate', 'Active Campaigns'].map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-900">124.5K</div>
                      <div className="text-sm text-gray-600">{stat}</div>
                    </div>
                  ))}
                </div>
                <div className="h-48 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200"></div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                One Platform
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Built for modern brands and influencers who want to focus on creating, not managing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: BarChart3,
                title: 'Unified Analytics',
                description: 'Track performance across Instagram, Twitter, LinkedIn, and Reddit from one dashboard.',
              },
              {
                icon: Users,
                title: 'Vetted Influencer Network',
                description: 'Connect with authentic creators verified by our trust scoring algorithm.',
              },
              {
                icon: MessageSquare,
                title: 'Centralized Inbox',
                description: 'Manage all DMs and comments from all platforms in one place.',
              },
            ].map((feature, idx) => (
              <Card key={idx} className="p-8 text-center" hover>
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Transform Your Social Presence?
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            {[
              'Free forever for influencers',
              'No credit card required',
              '14-day free trial for brands',
              'Cancel anytime',
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center justify-center gap-3 text-purple-100">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-white text-purple-900 hover:bg-gray-100">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-white text-white">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}