'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, user, session } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user && session) {
      console.log('User already logged in, redirecting to analysis')
      router.push('/analysis')
    }
  }, [user, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Login form submitted with email:', email)
      const { error, session } = await signIn(email, password)
      
      if (error) {
        console.error('Login failed with error:', error)
        // Check for specific error cases
        if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before signing in. Check your inbox for the verification link.')
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else {
          setError(error.message)
        }
        setLoading(false)
      } else if (session) {
        console.log('Login successful, session created, redirecting...')
        // Use window.location for a hard redirect to ensure the session is picked up
        window.location.href = '/analysis'
      } else {
        console.error('No error but no session either')
        setError('An unexpected error occurred. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image 
              src="/logos/Copy of Dealsletter Official Logo Black.svg"
              alt="Dealsletter Logo"
              width={200}
              height={50}
              className="h-12 w-auto mx-auto"
            />
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-xl border border-border/60 p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-muted">Sign in to your Dealsletter account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 min-h-[44px]"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-accent focus:ring-accent/20 border-border/60 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-muted">
                  Remember me
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-accent hover:text-accent/80 transition-colors font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted">
          <p>© 2024 Dealsletter Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}