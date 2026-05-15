'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

function VerifySuccessInner() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNew = searchParams.get('new') === 'true'
  const destination = isNew ? '/v3/dashboard?new=true' : '/v3/dashboard'
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Redirect when countdown reaches 0
    if (countdown <= 0) {
      router.push(destination)
    }
  }, [countdown, router, destination])

  const handleGoNow = () => {
    router.push(destination)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-lg border border-border/60 p-8 text-center">
          <div className="text-6xl mb-6">✅</div>
          
          <h1 className="text-2xl font-bold text-primary mb-4">
            Email Verified Successfully!
          </h1>
          
          <p className="text-muted mb-6">
            Welcome to Dealsletter! Your account is now active and ready to use.
          </p>

          {user && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <p className="text-green-600 font-medium">
                Welcome, {user.user_metadata?.first_name || user.email}!
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoNow}
              className="w-full px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Analyzing Properties
            </button>

            <p className="text-sm text-muted">
              Redirecting automatically in {countdown} seconds...
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60">
            <h3 className="font-semibold text-primary mb-3">What&apos;s Next?</h3>
            <div className="text-sm text-muted space-y-2">
              <p>🏠 Analyze any property in seconds</p>
              <p>📊 Get AI-powered investment insights</p>
              <p>🔍 Compare investment opportunities</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/60">
            <Link href="/" className="text-accent hover:text-accent/80 text-sm">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifySuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifySuccessInner />
    </Suspense>
  )
}