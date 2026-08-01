// src/app/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Zap, Sparkles, BarChart3, Users, MessageSquare, Calculator, Scissors, Clock, ArrowRight } from 'lucide-react';
import SiteNav from '@/components/SiteNav';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <SiteNav />

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white border border-primary-200 px-4 py-2 rounded-lg mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">14-day free trial • No credit card required</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">Brands</span> Meet{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-primary-600">Authentic Influence</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Unify your social presence, discover vetted influencers, and drive real results—all from one beautiful dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=brand">
              <Button size="lg">
                Start as a Brand
              </Button>
            </Link>
            <Link href="/register?role=influencer">
              <Button size="lg" variant="outline" className="border-primary-600 text-primary-600">
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
            <div className="bg-white rounded-lg p-8 shadow-lg border border-primary-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-primary-600 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Unified Analytics</h3>
              <p className="text-gray-600">Track performance across Instagram, Twitter, LinkedIn, and Reddit from one dashboard.</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white rounded-lg p-8 shadow-lg border border-primary-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-primary-600 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vetted Influencer Network</h3>
              <p className="text-gray-600">Connect with authentic creators verified by our trust scoring algorithm.</p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-white rounded-lg p-8 shadow-lg border border-primary-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-primary-600 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Centralized Inbox</h3>
              <p className="text-gray-600">Manage all DMs and comments from all platforms in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Tools Section */}
      <section className="py-16 px-6 bg-primary-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Free Tools You&apos;ll Use Every Day
            </h2>
            <p className="text-lg text-gray-600">
              No account required. The calculators and formatters creators search for daily.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/tools/rate-calculator" className="bg-white rounded-lg p-8 shadow-lg border border-primary-100 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Rate & ROI Calculator</h3>
              <p className="text-gray-600">Know what to charge per post, or what your campaign budget can buy.</p>
            </Link>
            <Link href="/tools/thread-splitter" className="bg-white rounded-lg p-8 shadow-lg border border-primary-100 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Thread Splitter</h3>
              <p className="text-gray-600">Turn long-form content into X threads, LinkedIn posts & IG captions.</p>
            </Link>
            <Link href="/tools/char-counter" className="bg-white rounded-lg p-8 shadow-lg border border-primary-100 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Character Counter</h3>
              <p className="text-gray-600">Validate captions against every platform limit in real time.</p>
            </Link>
          </div>

          <div className="text-center mt-10">
            <Link href="/tools">
              <Button variant="outline" className="border-primary-600 text-primary-600">
                Explore All Free Tools
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Monthly plans capped by the number of posts you publish. Start with a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$19',
                cap: '100 posts/month',
                features: [
                  'Unified inbox for comments & messages',
                  'Cross-platform scheduling',
                  'Marketplace access',
                  'Basic analytics',
                  'Email support',
                ],
                cta: 'Start Free Trial',
              },
              {
                name: 'Pro',
                price: '$49',
                cap: '1,000 posts/month',
                popular: true,
                features: [
                  'Everything in Starter',
                  'Advanced analytics & reporting',
                  'Influencer collaboration tools',
                  'Priority support',
                  'Custom branding',
                ],
                cta: 'Start Free Trial',
              },
              {
                name: 'Business',
                price: '$99',
                cap: 'Unlimited posts',
                features: [
                  'Everything in Pro',
                  'Unlimited team members',
                  'API access',
                  'Dedicated account manager',
                  'SLA & onboarding',
                ],
                cta: 'Contact Us',
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`bg-white rounded-lg p-8 shadow-lg border transition-shadow hover:shadow-xl relative ${
                  tier.popular ? 'border-primary-600 ring-2 ring-primary-600' : 'border-primary-100'
                }`}
              >
                {tier.popular && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-accent-600 text-white text-xs font-semibold rounded-lg">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{tier.name}</h3>
                <p className="text-sm text-gray-500 mb-6">{tier.cap}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start text-gray-600">
                      <span className="text-primary-600 mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    className={`w-full ${tier.popular ? 'bg-accent-600 hover:bg-accent-700' : 'border-primary-600 text-primary-600'}`}
                    variant={tier.popular ? undefined : 'outline'}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - 100px black */}
      <footer className="bg-black text-white py-8 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary-400" />
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