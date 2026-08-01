import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowLeft, Wrench } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export default function ToolLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      <SiteNav />

      <section className="py-12 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8">
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-700 transition">
              <ArrowLeft className="w-4 h-4" />
              Back to all tools
            </Link>
          </div>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white border border-primary-200 px-4 py-2 rounded-lg mb-4 shadow-sm">
              <Wrench className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Free tool · No account required</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
          </div>
          {children}

          <div className="mt-12 text-center bg-white rounded-lg border border-primary-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Love this tool?</h2>
            <p className="text-gray-600 mb-4">
              Create a free account to save your drafts, unlock premium tools, and manage all your socials in one place.
            </p>
            <Link href="/register">
              <button className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition">
                Start Free Trial
              </button>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
