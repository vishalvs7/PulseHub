import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel — brand / image */}
      <div className="hidden lg:flex w-1/2 bg-primary-700 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-[30rem] h-[30rem] bg-accent-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <span className="text-2xl font-bold">PulseHub</span>
          </Link>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-lg mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">14-day free trial · No credit card</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-6 text-white">
              Plan, publish, and get paid — all from one place.
            </h1>

            <ul className="space-y-4">
              {[
                'Cross-post to Instagram, X, and LinkedIn in one click',
                'Find creators and run influencer campaigns with built-in chat',
                'Free SEO tools: rate calculator, thread splitter, and more',
                'Creator Academy with monetization and growth playbooks',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-white/90 mt-0.5 shrink-0" />
                  <span className="text-white/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-white/60 text-sm">
            Trusted by creators and brands · Manrope everywhere · INR pricing
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-primary-50">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg">{children}</div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-primary-700 transition">Privacy</Link>
            <Link href="/terms" className="hover:text-primary-700 transition">Terms</Link>
            <Link href="/tools" className="hover:text-primary-700 transition">Free Tools</Link>
            <Link href="/academy" className="hover:text-primary-700 transition">Academy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
