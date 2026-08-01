import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="bg-primary-900 text-white mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-9 h-9 bg-accent-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PulseHub</span>
            </div>
            <p className="text-white/70 text-sm max-w-sm leading-relaxed">
              The unified platform for cross-platform publishing, influencer discovery, and campaign
              collaboration — for brands and creators.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/tools" className="text-white/70 hover:text-white text-sm transition">Free Tools</Link></li>
              <li><Link href="/academy" className="text-white/70 hover:text-white text-sm transition">Creator Academy</Link></li>
              <li><Link href="/pricing" className="text-white/70 hover:text-white text-sm transition">Pricing</Link></li>
              <li><Link href="/tools/rate-calculator" className="text-white/70 hover:text-white text-sm transition">Rate Calculator</Link></li>
              <li><Link href="/register?role=brand" className="text-white/70 hover:text-white text-sm transition">For Brands</Link></li>
              <li><Link href="/register?role=influencer" className="text-white/70 hover:text-white text-sm transition">For Influencers</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/90 mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-white/70 hover:text-white text-sm transition">Privacy</Link></li>
              <li><Link href="/terms" className="text-white/70 hover:text-white text-sm transition">Terms</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-white text-sm transition">Contact</Link></li>
              <li><Link href="/login" className="text-white/70 hover:text-white text-sm transition">Sign In</Link></li>
              <li><Link href="/register" className="text-white/70 hover:text-white text-sm transition">Get Started</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-white/50 text-sm">© {new Date().getFullYear()} PulseHub. All rights reserved.</span>
          <span className="text-white/50 text-sm">Instagram · X · LinkedIn · Reddit</span>
        </div>
      </div>
    </footer>
  );
}
