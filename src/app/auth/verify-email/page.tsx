'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

function VerifyEmailContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')
  const [checkingVerification, setCheckingVerification] = useState(false)
  const [verificationPending, setVerificationPending] = useState(false)

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
        // Hide success message after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch {
      setResendError('Failed to resend email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleCheckNow = async () => {
    setCheckingVerification(true)
    setVerificationPending(false)

    try {
      // Refresh the session first
      await supabase.auth.refreshSession()

      const { data } = await supabase.auth.getUser()
      if (data?.user?.email_confirmed_at) {
        router.push('/analysis')
      } else {
        // Show pending message
        setVerificationPending(true)
        setCheckingVerification(false)
        // Hide message after 5 seconds
        setTimeout(() => setVerificationPending(false), 5000)
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logos/Copy of Dealsletter Official Logo Black.svg"
              alt="Dealsletter Logo"
              width={180}
              height={45}
              className="h-10 w-auto mx-auto"
            />
          </Link>
        </div>

        <div className="bg-card rounded-xl border border-border/60 p-8 shadow-lg">
          {/* Icon */}
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-3">
              Verify Your Email
            </h1>

            <p className="text-muted mb-6">
              We&apos;ve sent a verification link to:
            </p>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <p className="font-semibold text-accent break-all">{email || 'your email'}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/5 border border-border/40 rounded-lg p-5 mb-6">
            <h3 className="font-semibold text-primary mb-3 flex items-center">
              <span className="text-accent mr-2">Next Steps:</span>
            </h3>
            <ol className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">1</span>
                <span>Check your email inbox (and spam folder)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">2</span>
                <span>Click the verification link in the email</span>
              </li>
              <li className="flex items-start">
                <span className="bg-accent text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0 mt-0.5">3</span>
                <span>Return here and click the button below</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCheckNow}
              disabled={checkingVerification}
              className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors font-medium min-h-[48px] flex items-center justify-center"
            >
              {checkingVerification ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Checking...</span>
                </div>
              ) : (
                "I've Verified My Email"
              )}
            </button>

            <button
              onClick={handleResendEmail}
              disabled={resendLoading || resendSuccess}
              className="w-full px-6 py-3 border border-border text-primary rounded-lg hover:bg-muted/5 disabled:opacity-50 transition-colors font-medium min-h-[48px]"
            >
              {resendLoading ? 'Sending...' : resendSuccess ? 'Email Sent!' : 'Resend Verification Email'}
            </button>
          </div>

          {/* Status Messages */}
          {verificationPending && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-600 text-sm flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Email not verified yet. Please check your inbox and click the verification link first.</span>
              </p>
            </div>
          )}

          {resendSuccess && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-600 text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Verification email sent! Check your inbox.
              </p>
            </div>
          )}

          {resendError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-600 text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {resendError}
              </p>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-border/40">
            <h3 className="font-semibold text-primary mb-3 text-sm">Didn&apos;t receive the email?</h3>
            <ul className="text-sm text-muted space-y-2">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-muted mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Check your spam or junk folder</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-muted mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Make sure <strong className="text-primary">{email || 'your email'}</strong> is correct</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-muted mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Verification links expire in 24 hours</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted">
              Still having issues?{' '}
              <a href="mailto:support@dealsletter.io" className="text-accent hover:text-accent/80">
                Contact Support
              </a>
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-border/40 flex justify-center space-x-4 text-sm">
            <Link href="/auth/login" className="text-accent hover:text-accent/80">
              Back to Login
            </Link>
            <span className="text-muted">•</span>
            <Link href="/auth/signup" className="text-accent hover:text-accent/80">
              Use Different Email
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted flex justify-center gap-4">
          <span>© {new Date().getFullYear()} Dealsletter</span>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
