'use client'

import { useState, FormEvent, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell, {
  authInputStyle,
  authLabelStyle,
  GoogleButton,
  AuthDivider,
} from '@/components/v3/public/AuthShell'

function SignupInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [done, setDone] = useState(false)

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter your email and password')
      return
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      return
    }
    setErrorMsg('')
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setErrorMsg(error.message)
        return
      }
      if (data.session) {
        window.location.href = '/v3/dashboard'
      } else {
        setDone(true)
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setErrorMsg('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setErrorMsg(error.message)
  }

  if (done) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We sent a verification link."
        footer={
          <span>
            Wrong address?{' '}
            <Link href="/v3/signup" style={{ color: 'var(--indigo-hover)', textDecoration: 'none' }}>
              Try again
            </Link>
          </span>
        }
      >
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Click the link in the email we just sent to <strong style={{ color: 'var(--text)' }}>{email}</strong> to activate your account. The link opens the V3 terminal automatically.
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start analyzing deals in 30 seconds."
      footer={
        <span>
          Already have an account?{' '}
          <Link href="/v3/login" style={{ color: 'var(--indigo-hover)', textDecoration: 'none' }}>
            Sign in →
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={authLabelStyle} htmlFor="v3-signup-email">Email</label>
          <input
            id="v3-signup-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
            style={authInputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
          />
        </div>
        <div>
          <label style={authLabelStyle} htmlFor="v3-signup-password">Password</label>
          <input
            id="v3-signup-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            style={authInputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
          />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '0.04em' }}>
            Minimum 8 characters
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              fontSize: 12,
              color: '#F87171',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.22)',
              borderRadius: 8,
              padding: '9px 12px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          className="app-btn"
          disabled={submitting}
          style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: 14 }}
        >
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <AuthDivider />
      <GoogleButton onClick={handleGoogle} label="Continue with Google" />
    </AuthShell>
  )
}

export default function V3SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  )
}
