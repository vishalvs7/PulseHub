import Link from 'next/link';
import type { Metadata } from 'next';
import { Calculator, Scissors, TextCursorInput, Clock, MessageSquare, Wrench, ArrowRight, Lock } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Free Social Media Tools | PulseHub',
  description:
    'Free tools for creators and brands: influencer rate calculator, X thread splitter, and multi-platform character & hashtag counter. No account required.',
};

const publicTools = [
  {
    href: '/tools/rate-calculator',
    title: 'Influencer Rate & ROI Calculator',
    desc: 'Find out what to charge per post, or what reach your campaign budget can buy.',
    icon: Calculator,
    effort: 'Free · No signup',
  },
  {
    href: '/tools/thread-splitter',
    title: 'Caption Trimmer & Thread Splitter',
    desc: 'Turn long-form content into a numbered X thread, a clean LinkedIn post, or an IG caption with a hidden hashtag block.',
    icon: Scissors,
    effort: 'Free · No signup',
  },
  {
    href: '/tools/char-counter',
    title: 'Character & Hashtag Counter',
    desc: 'Validate your caption in real time against X, TikTok, Instagram and LinkedIn limits.',
    icon: TextCursorInput,
    effort: 'Free · No signup',
  },
];

const premiumTools = [
  {
    title: 'Best Time to Post Heatmaps',
    desc: 'Hour-by-hour audience activity per connected account with one-click peak-time scheduling.',
    icon: Clock,
  },
  {
    title: 'Comment-to-DM Automation',
    desc: 'Automatically DM followers who comment a trigger keyword on your posts.',
    icon: MessageSquare,
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      <SiteNav />

      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white border border-primary-200 px-4 py-2 rounded-lg mb-6 shadow-sm">
              <Wrench className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Free tools · No account required</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Free Social Media Tools
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The exact calculators and formatters creators and brands search for every day. Quick, private, and free.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {publicTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="bg-white rounded-lg p-8 shadow-lg border border-primary-100 hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className="w-14 h-14 bg-primary-600 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    {tool.title}
                    <ArrowRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-gray-600 mb-4">{tool.desc}</p>
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 rounded-lg px-3 py-1">
                    {tool.effort}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Premium tools — unlock with a free account
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {premiumTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div key={tool.title} className="bg-white rounded-lg p-8 shadow-lg border border-primary-100">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                        <Lock className="w-3 h-3" /> Requires login
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{tool.title}</h3>
                    <p className="text-gray-600 mb-4">{tool.desc}</p>
                    <Link href="/register" className="text-primary-600 hover:text-primary-800 text-sm font-semibold">
                      Create free account →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
