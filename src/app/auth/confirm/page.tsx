'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const email = searchParams.get('email') || ''

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError('')

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5) {
      const fullCode = newCode.join('')
      if (fullCode.length === 6) {
        handleVerify(fullCode)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newCode = [...code]
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || ''
    }
    setCode(newCode)

    // Focus the next empty input or last input
    const nextEmpty = newCode.findIndex(d => !d)
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus()

    // Auto-submit if all 6 digits pasted
    if (pasted.length === 6) {
      handleVerify(pasted)
    }
  }

  const handleVerify = async (otp?: string) => {
    const token = otp || code.join('')
    if (token.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    if (!email) {
      setError('Email address is missing. Please go back and try again.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })

      if (verifyError) {
        setError(verifyError.message === 'Token has expired or is invalid'
          ? 'Invalid or expired code. Please try again or request a new one.'
          : verifyError.message
        )
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        return
      }

      if (data?.session?.user) {
        // Ensure user_profiles row exists
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', data.session.user.id)
            .single()

          if (!profile) {
            await supabase.from('user_profiles').insert({
              id: data.session.user.id,
              full_name: (data.session.user.user_metadata?.full_name as string) || '',
              first_name: (data.session.user.user_metadata?.first_name as string) || '',
              last_name: (data.session.user.user_metadata?.last_name as string) || '',
              subscription_tier: 'free',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          }
          // Welcome email is sent from /auth/verify-success (single trigger point)
        } catch {
          // Non-fatal
        }

        router.push('/auth/verify-success')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('No email address available. Please go back to signup.')
      return
    }

    setResendLoading(true)
    setResendSuccess(false)
    setError('')

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (resendError) {
        const msg = resendError.message?.toLowerCase() || ''
        if (msg.includes('email') && (msg.includes('send') || msg.includes('smtp') || msg.includes('deliver'))) {
          setError('Email delivery is temporarily unavailable. Please try again in a few minutes.')
        } else if (msg.includes('rate') || msg.includes('limit')) {
          setError('Please wait a minute before requesting another code.')
        } else {
          setError(resendError.message)
        }
      } else {
        setResendSuccess(true)
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch {
      setError('Failed to resend code. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/websiteMainLogoLight.png"
              alt="Dealsletter Logo"
              className="block dark:hidden h-12 w-auto mx-auto"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/websiteMainLogo.png"
              alt="Dealsletter Logo"
              className="hidden dark:block h-12 w-auto mx-auto"
            />
          </Link>
        </div>

        <div className="bg-card rounded-xl border border-border/60 p-8 shadow-lg">
          {/* Icon */}
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-3">
              Enter Confirmation Code
            </h1>
            <p className="text-muted mb-2">
              We sent a 6-digit code to:
            </p>
            {email && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-6">
                <p className="font-semibold text-accent break-all text-sm">{email}</p>
              </div>
            )}
            {!email && (
              <p className="text-sm text-amber-500 mb-6">
                No email detected.{' '}
                <Link href="/auth/signup" className="text-accent hover:text-accent/80 underline">
                  Go back to signup
                </Link>
              </p>
            )}
          </div>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={loading}
                className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-bold rounded-lg border-2 transition-colors
                  bg-background text-primary
                  ${error ? 'border-red-500' : digit ? 'border-accent' : 'border-border'}
                  focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none
                  disabled:opacity-50`}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || code.join('').length !== 6}
            className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium min-h-[48px] flex items-center justify-center mb-3"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={resendLoading || resendSuccess}
            className="w-full px-6 py-3 border border-border text-primary rounded-lg hover:bg-muted/5 disabled:opacity-50 transition-colors font-medium min-h-[48px]"
          >
            {resendLoading ? 'Sending...' : resendSuccess ? 'Code Sent!' : 'Resend Code'}
          </button>

          {/* Status Messages */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-600 text-sm flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{error}</span>
              </p>
            </div>
          )}

          {resendSuccess && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-600 text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                New code sent! Check your inbox.
              </p>
            </div>
          )}

          {/* Help */}
          <div className="mt-8 pt-6 border-t border-border/40">
            <p className="text-sm text-muted mb-2">
              Check your spam folder if you don&apos;t see the email. You can also click the link in the email instead of entering the code.
            </p>
            <p className="text-sm text-muted">
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
            <span className="text-muted">&#8226;</span>
            <Link href="/auth/signup" className="text-accent hover:text-accent/80">
              Use Different Email
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted flex justify-center gap-4">
          <span>&copy; {new Date().getFullYear()} Dealsletter</span>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthConfirm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
