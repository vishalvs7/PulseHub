import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    cap: '30 posts/month',
    description: 'For hobbyists trying out multi-platform publishing.',
    features: [
      'AI caption generator (single)',
      'Auto video resizer',
      'Unified inbox & cross-platform scheduling',
      'Marketplace access',
      'Community support',
    ],
    cta: 'Start Free',
    free: true,
  },
  {
    name: 'Starter',
    price: '$19',
    cap: '100 posts/month',
    description: 'For solo creators getting started with multi-platform publishing.',
    features: [
      'Everything in Free',
      'Best-time-to-post heatmaps',
      'Comment-to-DM automation',
      'Advanced analytics & reporting',
      'Email support',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Pro',
    price: '$49',
    cap: '1,000 posts/month',
    popular: true,
    description: 'For growing creators and small teams that need deeper insights.',
    features: [
      'Everything in Starter',
      'Per-Platform AI Caption Tuner (4 variations)',
      'Video Transcript-to-Clip Analyzer',
      'Unlimited team members',
      'Priority support',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Business',
    price: '$99',
    cap: 'Unlimited posts',
    description: 'For agencies and brands publishing at scale.',
    features: [
      'Everything in Pro',
      'Unified analytics pipeline (6–12h polling)',
      'API access',
      'Dedicated account manager',
      'SLA & onboarding',
    ],
    cta: 'Contact Us',
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteNav />
      <main className="flex-1">
      {/* Hero */}
      <section className="py-20 px-6 bg-primary-50">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-600 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Monthly plans capped by the number of posts you publish. Start with a 14-day free trial — no credit card required.
          </p>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-white border rounded-lg p-8 transition-colors hover:shadow-lg relative ${
                  tier.popular ? 'border-accent-500 ring-2 ring-accent-600' : 'border-primary-200'
                }`}
              >
                {tier.popular && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-accent-600 text-white text-xs font-semibold rounded-lg">
                    Most Popular
                  </span>
                )}
                {tier.free && (
                  <span className="absolute top-4 right-4 px-3 py-1 bg-sage-600 text-white text-xs font-semibold rounded-lg">
                    Free
                  </span>
                )}
                <h3 className="text-xl font-bold text-primary-600 mb-1">{tier.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{tier.description}</p>
                <p className="text-sm font-medium text-gray-500 mb-6">{tier.cap}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary-600">{tier.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-sage-600 mr-2 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button
                    className={`w-full ${tier.popular ? 'bg-accent-600 hover:bg-accent-700' : 'bg-primary-600 hover:bg-primary-700'}`}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-primary-50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-primary-600 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Is there a free trial?',
                a: 'Yes — every plan starts with a 14-day free trial. No credit card required to get started.',
              },
              {
                q: 'Can I switch plans later?',
                a: 'Absolutely. You can upgrade or downgrade at any time and we will prorate the difference.',
              },
              {
                q: 'What counts as a post?',
                a: 'Each platform you publish to counts as one post. A single cross-post to Instagram and X counts as two.',
              },
              {
                q: 'Do you offer custom plans?',
                a: 'Yes, for agencies and large brands. Reach out via the Contact Us option on the Business plan.',
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white border border-primary-100 rounded-lg p-6">
                <h3 className="font-semibold text-primary-600 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </main>
      <SiteFooter />
    </div>
  );
}
