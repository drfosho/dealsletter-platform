'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

function VerifyEmailContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')
  const [checkingVerification, setCheckingVerification] = useState(false)

  useEffect(() => {
    // Get email from URL params or user object
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else if (user?.email) {
      setEmail(user.email)
    }

    // Check if user is already verified
    if (user?.email_confirmed_at) {
      router.push('/analysis')
    }
  }, [user, searchParams, router])

  // Check verification status periodically
  useEffect(() => {
    const checkVerification = async () => {
      if (!user) return

      const { data } = await supabase.auth.getUser()
      if (data?.user?.email_confirmed_at) {
        router.push('/analysis')
      }
    }

    // Check every 3 seconds
    const interval = setInterval(checkVerification, 3000)
    return () => clearInterval(interval)
  }, [user, router])

  const handleResendEmail = async () => {
    if (!email) return

    setResendLoading(true)
    setResendError('')
    setResendSuccess(false)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        setResendError(error.message)
      } else {
        setResendSuccess(true)
      }
    } catch {
      setResendError('Failed to resend email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleCheckNow = async () => {
    setCheckingVerification(true)
    
    try {
      const { data } = await supabase.auth.getUser()
      if (data?.user?.email_confirmed_at) {
        router.push('/analysis')
      } else {
        // Show a brief message that verification is still pending
        setTimeout(() => setCheckingVerification(false), 1000)
      }
    } catch {
      setCheckingVerification(false)
    }
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
          <div className="text-6xl mb-6">📧</div>
          
          <h1 className="text-2xl font-bold text-primary mb-4">
            Check Your Email
          </h1>
          
          <p className="text-muted mb-6">
            We&apos;ve sent a verification link to:
          </p>
          
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
            <p className="font-medium text-accent">{email}</p>
          </div>
          
          <p className="text-sm text-muted mb-8">
            Click the verification link in your email to complete your account setup. 
            Once verified, you&apos;ll be automatically redirected to your dashboard.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleCheckNow}
              disabled={checkingVerification}
              className="w-full px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {checkingVerification ? 'Checking...' : 'I&apos;ve Verified - Check Now'}
            </button>

            <button
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>

          {/* Status Messages */}
          {resendSuccess && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-600 text-sm">
                Verification email sent successfully! Check your inbox.
              </p>
            </div>
          )}

          {resendError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-600 text-sm">{resendError}</p>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-border/60">
            <h3 className="font-semibold text-primary mb-3">Need Help?</h3>
            <div className="text-sm text-muted space-y-2">
              <p>• Check your spam/junk folder</p>
              <p>• Make sure {email} is correct</p>
              <p>• Verification links expire in 24 hours</p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-border/60 flex justify-center space-x-4 text-sm">
            <Link href="/auth/login" className="text-accent hover:text-accent/80">
              Back to Login
            </Link>
            <span className="text-muted">•</span>
            <Link href="/auth/signup" className="text-accent hover:text-accent/80">
              Try Different Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}