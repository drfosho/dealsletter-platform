'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

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
  const hasRun = useRef(false)

  const [sessionData, setSessionData] = useState<SessionData>({ status: 'loading' })

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const run = async () => {
      // Step 1: Restore Supabase session if lost during Stripe redirect
      let sessionRestored = false
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (!currentSession) {
        console.log('[CheckoutSuccess] No active session — attempting to restore from backup')
        const backup = localStorage.getItem('checkout_session_backup')

        if (backup) {
          try {
            const { access_token, refresh_token } = JSON.parse(backup)
            const { data, error: restoreError } = await supabase.auth.setSession({
              access_token,
              refresh_token
            })
            if (restoreError) {
              console.error('[CheckoutSuccess] Session restore failed:', restoreError.message)
            } else if (data.session) {
              console.log('[CheckoutSuccess] Session restored successfully')
              sessionRestored = true
            }
          } catch (err) {
            console.error('[CheckoutSuccess] Failed to parse session backup:', err)
          }
        } else {
          console.warn('[CheckoutSuccess] No session backup found')
        }
      } else {
        console.log('[CheckoutSuccess] Session is already active')
        sessionRestored = true
      }

      // Clean up backup regardless
      localStorage.removeItem('checkout_session_backup')

      // If session couldn't be restored, store redirect target for post-login
      if (!sessionRestored) {
        console.warn('[CheckoutSuccess] Session not available — will redirect to login after verification')
        localStorage.setItem('post_login_redirect', '/analysis')
      }

      // Step 2: Verify the Stripe checkout session
      if (!sessionId) {
        setSessionData({ status: 'error' })
        return
      }

      try {
        const res = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        const data = await res.json()

        if (data.status === 'complete') {
          setSessionData({
            status: 'complete',
            customerEmail: data.customerEmail,
            tier: data.tier
          })
          // Redirect after 5 seconds using full page navigation
          // (router.push won't send the restored session cookies to middleware)
          setTimeout(() => {
            if (sessionRestored) {
              window.location.href = '/analysis'
            } else {
              window.location.href = '/auth/login?redirect=/analysis'
            }
          }, 5000)
        } else if (data.status === 'open') {
          setSessionData({ status: 'open' })
        } else {
          setSessionData({ status: data.status || 'error' })
        }
      } catch {
        setSessionData({ status: 'error' })
      }
    }

    run()
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
                <span>Your subscription is now active</span>
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

          <a
            href="/analysis"
            className="inline-block px-8 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Start Analyzing Properties
          </a>
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
