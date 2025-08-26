'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Zap } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

export default function PricingComparison() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async (plan: 'free' | 'pro') => {
    if (!user) {
      router.push('/auth/signup');
      return;
    }

    if (plan === 'pro') {
      setIsLoading(true);
      // Redirect to Stripe checkout
      router.push('/api/stripe/create-checkout-session');
    }
  };

  const features = [
    {
      category: 'Deal Discovery',
      items: [
        { name: 'Browse all curated properties', free: true, pro: true },
        { name: 'Basic property comparison', free: true, pro: true },
        { name: '30-day deal archive', free: true, pro: true },
        { name: 'Unlimited archive access', free: false, pro: true },
        { name: 'Market trend insights', free: true, pro: true },
        { name: 'Email newsletter', free: true, pro: true },
      ]
    },
    {
      category: 'Analysis Tools',
      items: [
        { name: 'Property analysis calculator', free: false, pro: true },
        { name: 'ROI & cash flow analysis', free: false, pro: true },
        { name: 'Cap rate calculator', free: false, pro: true },
        { name: 'Rehab cost estimator', free: false, pro: true },
        { name: 'Market comparison tools', free: false, pro: true },
        { name: 'Investment strategy optimizer', free: false, pro: true },
      ]
    },
    {
      category: 'Reports & Export',
      items: [
        { name: 'View analysis results', free: false, pro: true },
        { name: 'Download PDF reports', free: false, pro: true },
        { name: 'Export to spreadsheet', free: false, pro: true },
        { name: 'Share analysis links', free: false, pro: true },
        { name: 'Print-ready formats', free: false, pro: true },
      ]
    },
    {
      category: 'Support & Limits',
      items: [
        { name: 'Community support', free: true, pro: true },
        { name: 'Priority support', free: false, pro: true },
        { name: 'Unlimited analyses', free: false, pro: true },
        { name: 'API access', free: false, pro: true },
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-primary mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-muted max-w-2xl mx-auto">
          Start browsing deals for free. Upgrade to Pro for powerful analysis tools.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
        {/* Free Plan */}
        <div className="bg-card border border-border/60 rounded-2xl p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-primary mb-2">Free</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted">/month</span>
            </div>
            <p className="text-muted">
              Perfect for browsing and discovering investment opportunities
            </p>
          </div>

          <button
            onClick={() => handleGetStarted('free')}
            className="w-full py-3 px-4 border border-accent text-accent font-semibold rounded-lg hover:bg-accent/5 transition-colors mb-8"
          >
            {user ? 'Current Plan' : 'Get Started'}
          </button>

          <div className="space-y-3">
            {features[0].items.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                {item.free ? (
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <span className={item.free ? 'text-primary' : 'text-muted line-through'}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent rounded-2xl p-8 relative">
          {/* Popular Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-accent text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <Zap className="w-4 h-4" />
              MOST POPULAR
            </span>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-primary mb-2">Pro</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted">/month</span>
            </div>
            <p className="text-muted">
              Full access to analysis tools and unlimited property evaluations
            </p>
          </div>

          <button
            onClick={() => handleGetStarted('pro')}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Start 7-Day Free Trial'}
          </button>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-primary font-medium">Everything in Free, plus:</span>
            </div>
            {features[1].items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-primary">{item.name}</span>
              </div>
            ))}
          </div>

          {/* Trial Badge */}
          <div className="mt-6 p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm text-center">
              <span className="font-semibold">🎉 7-Day Free Trial</span>
              <br />
              <span className="text-muted">Cancel anytime, no questions asked</span>
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Feature Comparison */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
        <div className="bg-muted/5 px-8 py-6 border-b border-border/60">
          <h3 className="text-xl font-bold text-primary">Feature Comparison</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left px-8 py-4 text-sm font-semibold text-primary">Features</th>
                <th className="text-center px-8 py-4 text-sm font-semibold text-primary">Free</th>
                <th className="text-center px-8 py-4 text-sm font-semibold text-primary">Pro</th>
              </tr>
            </thead>
            <tbody>
              {features.map((category, categoryIndex) => (
                <React.Fragment key={categoryIndex}>
                  <tr className="bg-muted/5">
                    <td colSpan={3} className="px-8 py-3 text-sm font-semibold text-accent">
                      {category.category}
                    </td>
                  </tr>
                  {category.items.map((item, itemIndex) => (
                    <tr key={itemIndex} className="border-b border-border/40">
                      <td className="px-8 py-3 text-sm text-primary">{item.name}</td>
                      <td className="text-center px-8 py-3">
                        {item.free ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                      <td className="text-center px-8 py-3">
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold text-primary mb-8">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          <div>
            <h4 className="font-semibold text-primary mb-2">Can I cancel anytime?</h4>
            <p className="text-muted text-sm">
              Yes! You can cancel your subscription at any time from your account settings. No questions asked.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">What happens after the trial?</h4>
            <p className="text-muted text-sm">
              After your 7-day trial, you'll be charged $29/month. Cancel before the trial ends to avoid charges.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">Do I need a credit card for the free plan?</h4>
            <p className="text-muted text-sm">
              No! The free plan doesn't require a credit card. Just sign up and start browsing deals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">Can I switch plans later?</h4>
            <p className="text-muted text-sm">
              Absolutely! You can upgrade or downgrade your plan at any time from your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add React import for Fragment
import React from 'react';