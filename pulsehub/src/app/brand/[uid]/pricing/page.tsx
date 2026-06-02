// src/app/(dashboard)/brand/pricing/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  CheckCircle,
  XCircle,
  Star,
  Zap,
  Users,
  BarChart3,
  Shield,
  Headphones,
  Globe,
  Rocket,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
  limitations: string[];
  highlighted: boolean;
  color: string;
  buttonText: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function BrandPricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans: Plan[] = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? '$49' : '$39',
      description: 'Perfect for small businesses getting started',
      features: [
        'Up to 3 social accounts',
        'Basic analytics & reporting',
        '50 influencer contacts/month',
        'Email support',
        '5 campaign templates',
        'Unlimited scheduled posts',
      ],
      limitations: [
        'No API access',
        'Limited to 1 team member',
        'Basic marketplace filters',
        'Standard trust scores',
      ],
      highlighted: false,
      color: 'from-blue-500 to-cyan-500',
      buttonText: 'Get Started',
    },
    {
      name: 'Professional',
      price: billingCycle === 'monthly' ? '$149' : '$129',
      description: 'For growing brands and agencies',
      features: [
        'Up to 10 social accounts',
        'Advanced analytics & insights',
        'Unlimited influencer contacts',
        'Priority email & chat support',
        '50 campaign templates',
        'AI-powered content suggestions',
        'Advanced marketplace filters',
        '3 team members included',
        'API access',
        'Custom reporting',
      ],
      limitations: [
        'No dedicated account manager',
        'Limited to 10,000 contacts',
      ],
      highlighted: true,
      color: 'from-primary-600 to-pink-600',
      buttonText: 'Try Free for 14 Days',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations with custom needs',
      features: [
        'Unlimited social accounts',
        'Enterprise-grade analytics',
        'Unlimited everything',
        '24/7 phone & priority support',
        'Custom campaign workflows',
        'Dedicated account manager',
        'SSO & advanced security',
        'Unlimited team members',
        'Custom integrations',
        'Onboarding & training',
        'SLA guarantee',
      ],
      limitations: [],
      highlighted: false,
      color: 'from-purple-600 to-indigo-600',
      buttonText: 'Contact Sales',
    },
  ];

  const features = [
    {
      icon: Users,
      title: 'Influencer Marketplace',
      description: 'Access to thousands of verified influencers',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track ROI, engagement, and campaign performance',
    },
    {
      icon: Shield,
      title: 'Trust Scoring',
      description: 'AI-powered fraud detection and authenticity verification',
    },
    {
      icon: Headphones,
      title: 'Priority Support',
      description: 'Dedicated support team for Pro and Enterprise plans',
    },
    {
      icon: Globe,
      title: 'Multi-Platform',
      description: 'Manage Instagram, Twitter, LinkedIn, TikTok, and more',
    },
    {
      icon: Rocket,
      title: 'Campaign Automation',
      description: 'Automate outreach, tracking, and reporting',
    },
  ];

  const faqs: FAQ[] = [
    {
      question: 'Can I change plans later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, the Professional plan includes a 14-day free trial. No credit card required.',
    },
    {
      question: 'How are influencer contacts counted?',
      answer: 'Each unique influencer you message counts as one contact. Re-messaging the same influencer does not count.',
    },
    {
      question: 'Do you offer discounts for non-profits?',
      answer: 'Yes, we offer special pricing for registered non-profit organizations. Contact our sales team.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. No long-term contracts required.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-secondary-900">Simple, Transparent Pricing</h1>
        <p className="text-secondary-600 mt-2 max-w-2xl mx-auto">
          Choose the perfect plan for your brand. All plans include our core features with no hidden fees.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center bg-secondary-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg transition ${
              billingCycle === 'monthly'
                ? 'bg-white shadow-sm text-secondary-900'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg transition ${
              billingCycle === 'yearly'
                ? 'bg-white shadow-sm text-secondary-900'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Yearly <span className="text-primary-600 ml-1">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative overflow-hidden ${
              plan.highlighted
                ? 'border-2 border-primary-500 shadow-xl transform scale-[1.02]'
                : ''
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-600 to-pink-600 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                Most Popular
              </div>
            )}
            
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl font-bold text-secondary-900">
                {plan.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== 'Custom' && (
                  <span className="text-secondary-600">/{billingCycle === 'monthly' ? 'month' : 'month'}</span>
                )}
              </div>
              <p className="text-secondary-600 mt-2">{plan.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Features */}
              <div>
                <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  What's Included
                </h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-secondary-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              {plan.limitations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3 flex items-center">
                    <XCircle className="w-5 h-5 text-secondary-400 mr-2" />
                    Limitations
                  </h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <XCircle className="w-5 h-5 text-secondary-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-secondary-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Button */}
              <Button
                className={`w-full py-3 text-lg font-semibold ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-700 hover:to-pink-700'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                }`}
              >
                {plan.buttonText}
                {plan.highlighted && <Rocket className="w-4 h-4 ml-2" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* All Features */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-secondary-900 text-center mb-8">
          All Plans Include
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start space-x-3 p-4 border border-secondary-200 rounded-lg">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900">{feature.title}</h3>
                  <p className="text-secondary-600 text-sm mt-1">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compare Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 text-secondary-600 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 text-secondary-600 font-medium">Starter</th>
                  <th className="text-center py-3 px-4 text-secondary-600 font-medium">Professional</th>
                  <th className="text-center py-3 px-4 text-secondary-600 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Social Accounts', '3', '10', 'Unlimited'],
                  ['Influencer Contacts', '50/month', 'Unlimited', 'Unlimited'],
                  ['Team Members', '1', '3', 'Unlimited'],
                  ['Support', 'Email', 'Priority', '24/7 Dedicated'],
                  ['Analytics', 'Basic', 'Advanced', 'Enterprise'],
                  ['API Access', '❌', '✅', '✅'],
                  ['Custom Integrations', '❌', 'Limited', '✅'],
                  ['SLA Guarantee', '❌', '❌', '✅'],
                  ['Dedicated Manager', '❌', '❌', '✅'],
                ].map((row, index) => (
                  <tr key={index} className="border-b border-secondary-100">
                    <td className="py-3 px-4 font-medium text-secondary-900">{row[0]}</td>
                    <td className="py-3 px-4 text-center">{row[1]}</td>
                    <td className="py-3 px-4 text-center">{row[2]}</td>
                    <td className="py-3 px-4 text-center">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-secondary-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <HelpCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-secondary-900 mb-2">{faq.question}</h3>
                    <p className="text-secondary-600">{faq.answer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <Card className="bg-gradient-to-r from-primary-50 to-pink-50 border-primary-200">
        <CardContent className="p-8 text-center">
          <Star className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Ready to transform your influencer marketing?
          </h2>
          <p className="text-secondary-600 mb-6 max-w-2xl mx-auto">
            Join thousands of brands already using PulseHub to grow their social presence and drive real results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-primary-600 to-primary-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Start 14-Day Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-sm text-secondary-500 mt-4">
            No credit card required • Cancel anytime • 30-day money-back guarantee
          </p>
        </CardContent>
      </Card>
    </div>
  );
}