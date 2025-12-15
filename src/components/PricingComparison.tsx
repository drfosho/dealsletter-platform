'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Zap } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with proper error handling
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

type PlanTier = 'free' | 'pro';
type BillingPeriod = 'monthly' | 'yearly';

export default function PricingComparison() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<PlanTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const handleCheckout = async (tier: PlanTier) => {
    if (tier === 'free') {
      // Free tier just needs signup
      if (!user) {
        router.push('/auth/signup');
      } else {
        router.push('/analysis');
      }
      return;
    }

    setIsLoading(tier);
    setError(null);

    try {
      console.log('[PricingComparison] Starting checkout for:', tier, billingPeriod);

      // Create checkout session - let backend handle price ID resolution
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierName: 'PRO',
          email: user?.email,
          billingPeriod
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[PricingComparison] Checkout session error:', errorData);
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      console.log('[PricingComparison] Session created:', sessionId);

      // Redirect to Stripe Checkout
      if (!stripePromise) {
        throw new Error('Stripe is not configured. Please check your environment variables.');
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      console.error('[PricingComparison] Checkout error:', err);
      setError(errorMessage);
      setIsLoading(null);
    }
  };

  const handleGetStarted = async (tier: PlanTier) => {
    if (!user && tier !== 'free') {
      // Store intended plan in session storage for post-signup redirect
      sessionStorage.setItem('intendedPlan', tier);
      sessionStorage.setItem('intendedBilling', billingPeriod);
      router.push('/auth/signup');
      return;
    }

    await handleCheckout(tier);
  };

  const plans = [
    {
      tier: 'free' as PlanTier,
      name: 'Free',
      description: 'Get started with property analysis',
      price: 0,
      yearlyPrice: 0,
      icon: '🆓',
      color: 'bg-gray-500',
      borderColor: 'border-gray-500',
      bgGradient: 'from-gray-500/5 to-gray-500/10',
      features: [
        '3 property analyses per month',
        'Basic property insights',
        'Access to blog content',
        'Email support',
        'PDF export',
      ],
      notIncluded: [
        '30 analyses/month',
        'Priority support',
      ],
      buttonText: user ? 'Start Analyzing' : 'Get Started Free',
    },
    {
      tier: 'pro' as PlanTier,
      name: 'Pro',
      icon: '🚀',
      description: '30 analyses/month for serious investors',
      price: 49,
      yearlyPrice: Math.floor(49 * 12 * 0.8), // 20% discount = $470/year
      color: 'bg-accent',
      borderColor: 'border-accent',
      bgGradient: 'from-accent/5 to-accent/10',
      popular: true,
      trialDays: 14,
      features: [
        '14-day free trial',
        '30 property analyses per month',
        'Detailed investment projections',
        'AI-powered investment insights',
        'Analysis history & comparison',
        'PDF export functionality',
        'Priority email support',
      ],
      notIncluded: [],
      buttonText: 'Start 14-Day Free Trial',
      valueProposition: 'Just $1.63 per analysis',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-primary mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
          Analyze any property in seconds. Start free with 3 analyses per month, or try Pro free for 14 days.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-primary' : 'text-muted'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-7 w-14 items-center rounded-full bg-muted/20 border border-border/60 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-accent transition-transform ${
                billingPeriod === 'yearly' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-primary' : 'text-muted'}`}>
            Yearly
            <span className="ml-1 text-green-500 text-xs font-semibold">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
        {plans.map((plan) => (
          <div
            key={plan.tier}
            className={`relative bg-card border-2 ${
              plan.popular ? plan.borderColor : 'border-border/60'
            } rounded-2xl p-8 ${
              plan.popular ? `bg-gradient-to-br ${plan.bgGradient}` : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className={`${plan.color} text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
                  <Zap className="w-4 h-4" />
                  RECOMMENDED
                </span>
              </div>
            )}

            <div className="mb-6">
              {/* Plan Icon and Name */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{plan.icon}</span>
                <h3 className="text-2xl font-bold text-primary">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">
                  ${plan.tier === 'free' ? '0' : (
                    billingPeriod === 'monthly'
                      ? plan.price
                      : Math.floor(plan.yearlyPrice / 12)
                  )}
                </span>
                <span className="text-muted">
                  /month
                </span>
              </div>
              {billingPeriod === 'yearly' && plan.tier !== 'free' && (
                <p className="text-sm text-green-500 mb-3">
                  ${plan.yearlyPrice}/year (save ${plan.price * 12 - plan.yearlyPrice})
                </p>
              )}
              <p className="text-muted">{plan.description}</p>
              {plan.tier === 'pro' && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  14-day free trial
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleGetStarted(plan.tier)}
              disabled={isLoading === plan.tier}
              className={`w-full py-3 px-4 font-semibold rounded-lg transition-colors mb-6 ${
                plan.tier === 'free'
                  ? 'border-2 border-gray-300 text-primary hover:bg-gray-50'
                  : `${plan.color} text-white hover:opacity-90`
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading === plan.tier ? (
                'Loading...'
              ) : (
                plan.buttonText
              )}
            </button>

            {/* Features */}
            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-primary">{feature}</span>
                </div>
              ))}
              {plan.notIncluded.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-muted line-through">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden max-w-3xl mx-auto">
        <div className="bg-muted/5 px-8 py-6 border-b border-border/60">
          <h3 className="text-xl font-bold text-primary">Feature Comparison</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left px-6 py-4 text-sm font-semibold text-primary">Features</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-primary">
                  🆓 Free
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-primary">
                  🚀 Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Analysis Features */}
              <tr className="bg-muted/5">
                <td colSpan={3} className="px-6 py-3 text-sm font-semibold text-accent">
                  Property Analysis
                </td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Monthly analyses</td>
                <td className="text-center px-6 py-3 text-sm font-semibold">3</td>
                <td className="text-center px-6 py-3 text-sm font-semibold">30</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Financial metrics & projections</td>
                <td className="text-center px-6 py-3"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                <td className="text-center px-6 py-3"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">AI-powered investment insights</td>
                <td className="text-center px-6 py-3"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                <td className="text-center px-6 py-3"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Analysis history & comparison</td>
                <td className="text-center px-6 py-3"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                <td className="text-center px-6 py-3"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
              </tr>

              {/* Export Features */}
              <tr className="bg-muted/5">
                <td colSpan={3} className="px-6 py-3 text-sm font-semibold text-accent">
                  Export & Reports
                </td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">PDF export</td>
                <td className="text-center px-6 py-3"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                <td className="text-center px-6 py-3"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Spreadsheet export</td>
                <td className="text-center px-6 py-3"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                <td className="text-center px-6 py-3"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
              </tr>

              {/* Support */}
              <tr className="bg-muted/5">
                <td colSpan={3} className="px-6 py-3 text-sm font-semibold text-accent">
                  Support
                </td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Support level</td>
                <td className="text-center px-6 py-3 text-sm text-muted">Email</td>
                <td className="text-center px-6 py-3 text-sm font-semibold">Priority Email</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="px-8 py-4 bg-muted/5 border-t border-border/60">
          <p className="text-xs text-muted">
            Pro plan includes 30 property analyses per month - just $1.63 per analysis.
            Need more? Contact us at support@dealsletter.io for enterprise pricing.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold text-primary mb-8">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          <div>
            <h4 className="font-semibold text-primary mb-2">How does the 14-day free trial work?</h4>
            <p className="text-muted text-sm">
              Start your Pro trial with full access to all features. You won&apos;t be charged until day 15. Cancel anytime during the trial at no cost.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">Can I change plans anytime?</h4>
            <p className="text-muted text-sm">
              Yes! You can upgrade to Pro at any time. Downgrades take effect at the next billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">What happens when I reach my limit?</h4>
            <p className="text-muted text-sm">
              Free users can upgrade to Pro for 30 analyses/month. Pro users who need more can contact us for enterprise pricing. Limits reset monthly.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">What counts as a property analysis?</h4>
            <p className="text-muted text-sm">
              Each time you run our AI-powered analysis on a property address, it counts as one analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
