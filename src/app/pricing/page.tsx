'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { Check } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PricingTier {
  name: string
  price: number
  description: string
  features: string[]
  limitations?: string[]
  ctaText: string
  popular?: boolean
  color: string
  icon: string
  priceId?: string
  priceIdYearly?: string
  analysisLimit: number | 'unlimited'
}

const pricingTiers: PricingTier[] = [
  {
    name: 'FREE',
    price: 0,
    description: 'Perfect for browsing and exploring deals',
    features: [
      'View all curated deals (unlimited)',
      'Basic deal comparison',
      '30-day archive access',
      'Market trend insights',
      'Newsletter subscription'
    ],
    ctaText: 'Get Started Free',
    color: 'from-green-500 to-emerald-500',
    icon: '🟢',
    analysisLimit: 0
  },
  {
    name: 'STARTER',
    price: 29,
    description: 'For serious investors getting started',
    features: [
      'Everything in Free',
      '12 personal property analyses per month',
      'Deal alerts and filters',
      'PDF exports',
      'Email support',
      '14-day free trial'
    ],
    ctaText: 'Start Free Trial',
    color: 'from-blue-500 to-cyan-500',
    icon: '🔵',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || process.env.STRIPE_PRICE_STARTER_MONTHLY,
    priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY || process.env.STRIPE_PRICE_STARTER_YEARLY,
    analysisLimit: 12
  },
  {
    name: 'PRO',
    price: 69,
    description: 'For active investors and professionals',
    features: [
      'Everything in Starter',
      '35 personal property analyses per month',
      'Advanced analytics dashboard',
      'Early deal access (24hrs before others)',
      'Priority support',
      'Market reports',
      '14-day free trial'
    ],
    ctaText: 'Start Free Trial',
    popular: true,
    color: 'from-purple-500 to-pink-500',
    icon: '🚀',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || process.env.STRIPE_PRICE_PRO_MONTHLY,
    priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || process.env.STRIPE_PRICE_PRO_YEARLY,
    analysisLimit: 35
  },
  {
    name: 'PREMIUM',
    price: 159,
    description: 'For power users and investment firms',
    features: [
      'Everything in Pro',
      'Unlimited analyses* (fair use policy)',
      'Weekly strategy sessions',
      'Custom deal sourcing',
      'Phone support',
      'API access',
      'Team collaboration tools',
      '14-day free trial'
    ],
    limitations: [
      '*Fair use: Overage at $2 per analysis beyond reasonable usage'
    ],
    ctaText: 'Start Free Trial',
    color: 'from-amber-500 to-orange-500',
    icon: '💎',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY || process.env.STRIPE_PRICE_PREMIUM_YEARLY,
    analysisLimit: 'unlimited'
  }
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const router = useRouter()

  const handleSubscribe = async (tier: PricingTier) => {
    if (tier.price === 0) {
      // Handle free tier - just redirect to signup
      router.push('/auth/signup')
      return
    }

    setLoading(tier.name)
    
    try {
      // Determine which price ID to use based on billing cycle
      const priceId = billingCycle === 'yearly' ? tier.priceIdYearly : tier.priceId
      
      console.log('[Pricing] Subscribe clicked:', {
        tier: tier.name,
        billingCycle,
        priceId,
        monthlyPriceId: tier.priceId,
        yearlyPriceId: tier.priceIdYearly
      })
      
      // Call our API to create a checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          tierName: tier.name,
          billingPeriod: billingCycle,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        console.error('Error creating checkout session:', error)
        alert('Something went wrong. Please try again.')
        return
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) {
        console.error('Stripe not loaded')
        return
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (stripeError) {
        console.error('Stripe redirect error:', stripeError)
        alert('Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-3 bg-background/80 backdrop-blur-xl z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="relative">
                <Logo 
                  width={300}
                  height={75}
                  className="h-12 md:h-16 w-auto"
                  priority
                />
                <div className="absolute top-1 md:top-2 -right-1 w-2 md:w-2.5 h-2 md:h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link href="/blog" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Blog
            </Link>
            <Link href="/pricing" className="px-6 py-3 text-primary transition-colors font-medium">
              Pricing
            </Link>
            <Link href="/contact" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Contact
            </Link>
            <Link href="/auth/login" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Log In
            </Link>
            <Link href="/auth/signup" className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Pricing Content */}
      <div className="pt-32 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Choose Your Investment Edge
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              From browsing deals to unlimited analysis, we have a plan that fits your investment strategy
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center bg-card rounded-lg border border-border/60 p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-secondary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-secondary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingTiers.map((tier) => {
              const displayPrice = billingCycle === 'yearly' 
                ? Math.floor(tier.price * 0.8 * 12) 
                : tier.price

              return (
                <div
                  key={tier.name}
                  className={`relative bg-card rounded-2xl border ${
                    tier.popular
                      ? 'border-primary shadow-xl scale-105'
                      : 'border-border/60'
                  } p-6 hover:shadow-xl transition-all duration-300`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-1 bg-primary text-secondary rounded-full text-sm font-semibold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Icon and Name */}
                  <div className="mb-4">
                    <div className="text-4xl mb-2">{tier.icon}</div>
                    <h3 className="text-2xl font-bold text-primary">{tier.name}</h3>
                    <p className="text-sm text-muted mt-1">{tier.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      {billingCycle === 'yearly' && tier.price > 0 ? (
                        <>
                          <span className="text-4xl font-bold text-primary">
                            ${displayPrice}
                          </span>
                          <span className="text-muted ml-2">/year</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-primary">
                            ${tier.price}
                          </span>
                          <span className="text-muted ml-2">/month</span>
                        </>
                      )}
                    </div>
                    {billingCycle === 'yearly' && tier.price > 0 && (
                      <div className="text-sm text-muted mt-1">
                        <span className="line-through">${tier.price * 12}</span>
                        <span className="text-accent ml-2">
                          Save ${tier.price * 12 - displayPrice}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Analysis Limit Badge */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${tier.color} text-white`}>
                      {tier.analysisLimit === 'unlimited' 
                        ? 'Unlimited Analyses*' 
                        : tier.analysisLimit === 0
                        ? 'View Deals Only'
                        : `${tier.analysisLimit} Analyses/month`}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-accent mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Limitations */}
                  {tier.limitations && (
                    <div className="mb-4 p-3 bg-muted/5 rounded-lg">
                      {tier.limitations.map((limitation, index) => (
                        <p key={index} className="text-xs text-muted italic">
                          {limitation}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(tier)}
                    disabled={loading === tier.name}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                      tier.popular
                        ? 'bg-primary text-secondary hover:bg-primary/90'
                        : tier.price === 0
                        ? 'bg-accent text-secondary hover:bg-accent/90'
                        : 'bg-muted/10 text-primary hover:bg-muted/20 border border-border/60'
                    } ${loading === tier.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading === tier.name ? 'Processing...' : tier.ctaText}
                  </button>
                </div>
              )
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-primary text-center mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border/60 p-6">
                <h3 className="font-semibold text-primary mb-2">
                  What's included in the free trial?
                </h3>
                <p className="text-muted">
                  All paid plans include a 14-day free trial with full access to all features. No credit card required to start.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border/60 p-6">
                <h3 className="font-semibold text-primary mb-2">
                  What counts as a property analysis?
                </h3>
                <p className="text-muted">
                  Each time you run a detailed analysis on a property (cash flow, ROI calculations, market comparisons), it counts as one analysis. Viewing curated deals doesn't count towards your limit.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border/60 p-6">
                <h3 className="font-semibold text-primary mb-2">
                  Can I change plans anytime?
                </h3>
                <p className="text-muted">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border/60 p-6">
                <h3 className="font-semibold text-primary mb-2">
                  What's the fair use policy for Premium?
                </h3>
                <p className="text-muted">
                  Premium includes unlimited analyses under fair use. If you exceed 200 analyses/month, additional analyses are $2 each. This ensures the service remains fast for all users.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center bg-primary/5 rounded-2xl border border-primary/20 p-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Ready to Level Up Your Real Estate Investing?
            </h2>
            <p className="text-muted mb-8 max-w-2xl mx-auto">
              Join thousands of investors using Dealsletter to find and analyze the best deals. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-all font-medium text-lg"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-card text-primary rounded-lg hover:bg-muted/10 transition-all font-medium text-lg border border-border/60"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}