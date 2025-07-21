'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // First, check the URL hash for tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const access_token = hashParams.get('access_token')
        const refresh_token = hashParams.get('refresh_token')
        
        if (access_token && refresh_token) {
          // Set the session with the tokens from the URL
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token
          })
          
          if (sessionError) {
            console.error('Error setting session:', sessionError)
            setError(sessionError.message)
            setStatus('error')
            return
          }
          
          if (sessionData.session?.user) {
            // Check if this is from email verification or regular login
            const isEmailVerification = searchParams.get('type') === 'signup'
            
            setStatus('success')
            
            if (isEmailVerification) {
              // Email verification flow - go to success page
              router.push('/auth/verify-success')
            } else {
              // Regular login - go directly to dashboard
              router.push('/dashboard')
            }
            return
          }
        }
        
        // If no tokens in URL, check for existing session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          setStatus('error')
          return
        }

        if (data.session?.user) {
          // Check if this is from email verification or regular login
          const isEmailVerification = searchParams.get('type') === 'signup'
          
          setStatus('success')
          
          if (isEmailVerification) {
            // Email verification flow - go to success page
            router.push('/auth/verify-success')
          } else {
            // Regular login - go directly to dashboard
            router.push('/dashboard')
          }
        } else {
          // No session, redirect to login
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError('Authentication failed. Please try again.')
        setStatus('error')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Verifying your email...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="bg-card rounded-lg border border-border/60 p-8 text-center">
            <div className="text-6xl mb-6">❌</div>
            
            <h1 className="text-2xl font-bold text-primary mb-4">
              Verification Failed
            </h1>
            
            <p className="text-muted mb-6">
              {error || 'There was an error verifying your email. Please try again.'}
            </p>

            <div className="space-y-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90"
              >
                Go to Login
              </button>
              
              <button
                onClick={() => router.push('/auth/signup')}
                className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                Try Signing Up Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}