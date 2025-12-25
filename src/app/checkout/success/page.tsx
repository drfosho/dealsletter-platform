'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'

type SessionStatus = 'loading' | 'complete' | 'open' | 'expired' | 'error'

interface SessionData {
  status: SessionStatus
  customerEmail?: string
  tier?: string
}

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [sessionData, setSessionData] = useState<SessionData>({ status: 'loading' })

  useEffect(() => {
    if (!sessionId) {
      setSessionData({ status: 'error' })
      return
    }

    // Verify the session
    fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'complete') {
          setSessionData({
            status: 'complete',
            customerEmail: data.customerEmail,
            tier: data.tier
          })
          // Redirect to analysis page after 5 seconds
          setTimeout(() => {
            router.push('/analysis')
          }, 5000)
        } else if (data.status === 'open') {
          setSessionData({ status: 'open' })
        } else {
          setSessionData({ status: data.status || 'error' })
        }
      })
      .catch(() => {
        setSessionData({ status: 'error' })
      })
  }, [sessionId, router])

  if (sessionData.status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-primary">Confirming your subscription...</h2>
          <p className="text-muted mt-2">Please wait while we verify your payment.</p>
        </div>
      </div>
    )
  }

  if (sessionData.status === 'complete') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-primary mb-4">
            Subscription Activated!
          </h1>

          <p className="text-lg text-muted mb-2">
            Welcome to Dealsletter {sessionData.tier || 'Pro'}!
          </p>

          {sessionData.customerEmail && (
            <p className="text-sm text-muted mb-6">
              A confirmation email has been sent to {sessionData.customerEmail}
            </p>
          )}

          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-primary mb-3">What&apos;s Next?</h3>
            <ul className="text-left text-muted space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Your 14-day free trial has started</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Full access to property analysis tools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>PDF exports and deal comparisons</span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-muted mb-4">
            Redirecting to analysis in 5 seconds...
          </p>

          <Link
            href="/analysis"
            className="inline-block px-8 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Start Analyzing Properties
          </Link>
        </div>
      </div>
    )
  }

  if (sessionData.status === 'open') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-primary mb-2">Payment Processing</h2>
          <p className="text-muted">
            Your payment is still being processed. This page will update automatically.
          </p>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-primary mb-4">
          Something Went Wrong
        </h1>

        <p className="text-muted mb-6">
          We couldn&apos;t verify your subscription. If you were charged, please contact support.
        </p>

        <div className="space-y-3">
          <Link
            href="/pricing"
            className="inline-block w-full px-8 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/contact"
            className="inline-block w-full px-8 py-3 bg-muted/10 text-primary font-semibold rounded-lg hover:bg-muted/20 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}

// Loading fallback
function SuccessLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-primary">Confirming your subscription...</h2>
        <p className="text-muted mt-2">Please wait while we verify your payment.</p>
      </div>
    </div>
  )
}

// Main export wrapped in Suspense
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
