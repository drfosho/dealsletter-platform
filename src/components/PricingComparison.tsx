'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Zap, Star, Crown } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PlanTier = 'free' | 'starter' | 'professional' | 'premium';
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
        router.push('/dashboard');
      }
      return;
    }

    setIsLoading(tier);
    setError(null);

    try {
      console.log('[PricingComparison] Starting checkout for:', tier, billingPeriod);
      
      // Get the correct price ID based on tier
      // Note: In Next.js, env vars must be accessed directly, not dynamically
      let priceId: string | undefined;
      let envTier: string;
      
      switch(tier) {
        case 'starter':
          priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER;
          envTier = 'STARTER';
          break;
        case 'professional':
          priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;  // Map Professional to PRO env var
          envTier = 'PRO';
          break;
        case 'premium':
          priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM;
          envTier = 'PREMIUM';
          break;
        default:
          envTier = tier.toUpperCase();
      }

      console.log('[PricingComparison] Price ID for', tier, ':', priceId);

      if (!priceId) {
        throw new Error(`Price ID not found for ${tier} plan`);
      }

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          tierName: envTier,
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
    } catch (err: any) {
      console.error('[PricingComparison] Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
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
      description: 'Browse deals and explore the platform',
      price: 0,
      yearlyPrice: 0,
      icon: '🆓',
      color: 'bg-gray-500',
      borderColor: 'border-gray-500',
      bgGradient: 'from-gray-500/5 to-gray-500/10',
      features: [
        'View all curated deals on dashboard',
        'Deal comparison tool',
        'Save up to 4 properties',
        'Basic market insights',
      ],
      notIncluded: [
        'Property analysis calculator',
        'Deal alerts & custom filters',
        'PDF exports',
        'Priority support',
      ],
      buttonText: user ? 'Current Plan' : 'Get Started Free',
      trialDays: 0,
    },
    {
      tier: 'starter' as PlanTier,
      name: 'Starter',
      icon: '⭐',
      description: 'Perfect for individual investors',
      price: 29,
      yearlyPrice: Math.floor(29 * 12 * 0.8), // 20% discount
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
      bgGradient: 'from-blue-500/5 to-blue-500/10',
      features: [
        'Everything in Free (unlimited saves)',
        '12 personal property analyses/month',
        'Deal alerts & custom filters',
        'PDF exports',
        'Priority email support',
      ],
      notIncluded: [
        'Advanced filtering options',
        'Deal history & analytics',
        'Early access to deals',
      ],
      buttonText: 'Start 14-Day Free Trial',
      trialDays: 14,
    },
    {
      tier: 'professional' as PlanTier,
      name: 'Professional',
      icon: '🚀',
      description: 'For active real estate investors',
      price: 69,
      yearlyPrice: Math.floor(69 * 12 * 0.8), // 20% discount
      color: 'bg-accent',
      borderColor: 'border-accent',
      bgGradient: 'from-accent/5 to-accent/10',
      popular: true,
      features: [
        'Everything in Starter',
        '25 personal property analyses/month',
        'Advanced filtering options',
        'Deal history & analytics',
        'Export to spreadsheet formats',
      ],
      notIncluded: [
        'Unlimited analyses',
        'Early access to best deals',
      ],
      buttonText: 'Start 14-Day Free Trial',
      trialDays: 14,
    },
    {
      tier: 'premium' as PlanTier,
      name: 'Premium',
      icon: '💎',
      description: 'For power users and firms',
      price: 159,
      yearlyPrice: Math.floor(159 * 12 * 0.8), // 20% discount
      color: 'bg-purple-500',
      borderColor: 'border-purple-500',
      bgGradient: 'from-purple-500/5 to-purple-500/10',
      features: [
        'Everything in Professional',
        'Unlimited analyses (fair usage cap)',
        'Early access to best deals (24hr head start)',
        'Access to upcoming features',
        'API access (coming soon)',
        'Property lead notification tool (coming soon)',
      ],
      notIncluded: [],
      buttonText: 'Start 14-Day Free Trial',
      trialDays: 14,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-primary mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
          Start free and upgrade as you grow. No hidden fees, cancel anytime.
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
      <div className="grid md:grid-cols-4 gap-6 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.tier}
            className={`relative bg-card border-2 ${
              plan.popular ? plan.borderColor : 'border-border/60'
            } rounded-2xl p-6 ${
              plan.popular ? `bg-gradient-to-br ${plan.bgGradient}` : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className={`${plan.color} text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
                  <Zap className="w-4 h-4" />
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="mb-6">
              {/* Plan Icon and Name */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{plan.icon}</span>
                <h3 className="text-xl font-bold text-primary">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold">
                  ${plan.tier === 'free' ? '0' : (
                    billingPeriod === 'monthly' 
                      ? plan.price 
                      : Math.floor(plan.yearlyPrice)
                  )}
                </span>
                <span className="text-muted">
                  /{billingPeriod === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingPeriod === 'yearly' && plan.tier !== 'free' && (
                <p className="text-xs text-green-500 mb-3">
                  Save ${Math.floor(plan.price * 12 - plan.yearlyPrice)}/year
                </p>
              )}
              <p className="text-muted text-sm">{plan.description}</p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleGetStarted(plan.tier)}
              disabled={isLoading === plan.tier}
              className={`w-full py-2.5 px-4 font-semibold rounded-lg transition-colors mb-6 text-sm ${
                plan.tier === 'free' 
                  ? 'border border-gray-300 text-primary hover:bg-gray-50'
                  : plan.popular
                  ? `${plan.color} text-white hover:opacity-90`
                  : `border-2 ${plan.borderColor} text-primary hover:${plan.bgGradient} hover:bg-gradient-to-br`
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading === plan.tier ? (
                'Loading...'
              ) : (
                plan.buttonText
              )}
            </button>

            {/* Features */}
            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-primary text-xs">{feature}</span>
                </div>
              ))}
              {plan.notIncluded.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-muted line-through text-xs">{feature}</span>
                </div>
              ))}
            </div>

            {/* Trial Badge - Only for paid plans */}
            {plan.trialDays > 0 && (
              <div className="mt-4 p-2 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-xs text-center">
                  <span className="font-semibold">14-Day Free Trial</span>
                  <br />
                  <span className="text-muted text-xs">Cancel anytime</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
        <div className="bg-muted/5 px-8 py-6 border-b border-border/60">
          <h3 className="text-xl font-bold text-primary">Detailed Feature Comparison</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left px-6 py-4 text-sm font-semibold text-primary">Features</th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-primary">
                  🆓 Free
                </th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-primary">
                  ⭐ Starter
                </th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-primary">
                  🚀 Professional
                </th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-primary">
                  💎 Premium
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Core Features */}
              <tr className="bg-muted/5">
                <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-accent">
                  Core Features
                </td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">View curated deals</td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Deal comparison tool</td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Saved properties</td>
                <td className="text-center px-4 py-3 text-sm text-muted">Up to 4</td>
                <td className="text-center px-4 py-3 text-sm font-semibold">Unlimited</td>
                <td className="text-center px-4 py-3 text-sm font-semibold">Unlimited</td>
                <td className="text-center px-4 py-3 text-sm font-semibold">Unlimited</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Basic market insights</td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>

              {/* Analysis Features */}
              <tr className="bg-muted/5">
                <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-accent">
                  Analysis & Tools
                </td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Property analyses per month</td>
                <td className="text-center px-4 py-3 text-sm text-muted">-</td>
                <td className="text-center px-4 py-3 text-sm font-semibold">12</td>
                <td className="text-center px-4 py-3 text-sm font-semibold">25</td>
                <td className="text-center px-4 py-3 text-sm font-semibold">Unlimited*</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Deal alerts & custom filters</td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Advanced filtering options</td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Deal history & analytics</td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>

              {/* Export & Reports */}
              <tr className="bg-muted/5">
                <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-accent">
                  Export & Reports
                </td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">PDF exports</td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Export to spreadsheet</td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>

              {/* Access & Support */}
              <tr className="bg-muted/5">
                <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-accent">
                  Access & Support
                </td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Early access to deals (24hr)</td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Support level</td>
                <td className="text-center px-4 py-3 text-sm text-muted">Basic</td>
                <td className="text-center px-4 py-3 text-sm text-muted">Priority Email</td>
                <td className="text-center px-4 py-3 text-sm font-semibold">Priority Email</td>
                <td className="text-center px-4 py-3 text-sm font-semibold">Priority Email</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Access to upcoming features</td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">API access</td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3 text-sm text-muted">Coming Soon</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-6 py-3 text-sm text-primary">Property lead notification tool</td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3"><X className="w-4 h-4 text-gray-400 mx-auto" /></td>
                <td className="text-center px-4 py-3 text-sm text-muted">Coming Soon</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-4 bg-muted/5 border-t border-border/60">
          <p className="text-xs text-muted">
            * Premium plan includes unlimited property analyses for normal business use. 
            Fair usage policy applies to prevent system abuse. Users consistently 
            exceeding 100+ analyses monthly may be contacted for usage review.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold text-primary mb-8">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          <div>
            <h4 className="font-semibold text-primary mb-2">Can I change plans anytime?</h4>
            <p className="text-muted text-sm">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">What happens after the 14-day trial?</h4>
            <p className="text-muted text-sm">
              After your trial ends, you'll be charged the plan price. Cancel before the trial ends to avoid charges.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">What counts as a property analysis?</h4>
            <p className="text-muted text-sm">
              Each time you run our analysis calculator on a property, it counts as one analysis against your monthly limit.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">How does the fair usage policy work?</h4>
            <p className="text-muted text-sm">
              Premium plans have unlimited analyses for normal business use. The fair usage cap prevents automated bulk processing that could affect service quality for other users. Users exceeding fair usage will be contacted for enterprise pricing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}