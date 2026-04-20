'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AuthShell, {
  authInputStyle,
  authLabelStyle,
  GoogleButton,
  AuthDivider,
} from '@/components/v3/public/AuthShell'

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter your email and password')
      return
    }
    setErrorMsg('')
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setErrorMsg('Please verify your email before signing in. Check your inbox for the link.')
        } else if (error.message.includes('Invalid login credentials')) {
          setErrorMsg('Invalid email or password.')
        } else {
          setErrorMsg(error.message)
        }
        return
      }
      if (data.session) {
        const dest = searchParams?.get('redirect') || '/v3/dashboard'
        window.location.href = dest
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.')
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Sign in failed')
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

  return (
    <AuthShell
      title="Sign in to Dealsletter"
      subtitle="Access your terminal."
      footer={
        <span>
          Don&apos;t have an account?{' '}
          <Link href="/v3/signup" style={{ color: 'var(--indigo-hover)', textDecoration: 'none' }}>
            Start free →
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={authLabelStyle} htmlFor="v3-login-email">Email</label>
          <input
            id="v3-login-email"
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <label style={{ ...authLabelStyle, margin: 0 }} htmlFor="v3-login-password">Password</label>
            <Link href="/auth/forgot-password" style={{ fontSize: 11, color: 'var(--indigo-hover)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          <input
            id="v3-login-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            style={authInputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
          />
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
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <AuthDivider />
      <GoogleButton onClick={handleGoogle} label="Continue with Google" />
    </AuthShell>
  )
}

export default function V3LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
