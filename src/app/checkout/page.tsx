'use client'

import { useCallback, useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tier = searchParams.get('tier')
  const period = searchParams.get('period') || 'monthly'

  const [error, setError] = useState<string | null>(null)

  // Redirect if no tier specified
  useEffect(() => {
    if (!tier) {
      router.push('/pricing')
    }
  }, [tier, router])

  const fetchClientSecret = useCallback(async () => {
    if (!tier) return ''

    try {
      const response = await fetch('/api/stripe/create-embedded-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, period })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      return data.clientSecret
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load checkout'
      setError(message)
      throw err
    }
  }, [tier, period])

  const getTierDisplayName = () => {
    switch (tier?.toLowerCase()) {
      case 'pro':
        return 'Pro'
      case 'pro_plus':
      case 'pro-plus':
        return 'Pro Plus'
      default:
        return tier
    }
  }

  const getPriceDisplay = () => {
    const isYearly = period === 'yearly' || period === 'annual'
    switch (tier?.toLowerCase()) {
      case 'pro':
        return isYearly ? '$278/year' : '$29/month'
      case 'pro_plus':
      case 'pro-plus':
        return isYearly ? '$566/year' : '$59/month'
      default:
        return ''
    }
  }

  if (!tier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <button
            onClick={() => router.push('/pricing')}
            className="flex items-center gap-2 text-muted hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </button>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
              Checkout Error
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/pricing')}
            className="flex items-center gap-2 text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </button>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">
            Complete Your Subscription
          </h1>
          <p className="text-muted">
            {getTierDisplayName()} Plan - {getPriceDisplay()}
            {period === 'yearly' && (
              <span className="ml-2 text-green-600 text-sm">(Save 20%)</span>
            )}
          </p>
        </div>

        {/* Embedded Checkout */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-muted">
          <p>Secure checkout powered by Stripe. Your payment info is encrypted.</p>
        </div>
      </div>
    </div>
  )
}

// Loading component for Suspense fallback
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
        <p className="text-muted">Loading checkout...</p>
      </div>
    </div>
  )
}

// Main export wrapped in Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  )
}
