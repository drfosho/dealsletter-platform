'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function TestSignup() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('testpassword123')
  const [result, setResult] = useState<{ error?: string; success?: boolean; message?: string; user?: unknown; users?: unknown[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const testSignup = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const metadata = {
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        investor_experience: 'none',
        deal_types: ['brrrr', 'fix-flip'],
        investment_goals: 'cash-flow',
        budget: '50k-100k',
        location: 'Los Angeles, CA',
      }

      console.log('Testing signup with:', { email, metadata })
      
      const { error } = await signUp(email, password, metadata)
      
      if (error) {
        console.error('Signup error:', error)
        setResult({ error: error.message })
      } else {
        console.log('Signup successful')
        setResult({ success: true, message: 'User created successfully! Check your email for verification.' })
      }
    } catch (err) {
      console.error('Signup error:', err)
      setResult({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
    
    setLoading(false)
  }

  const checkCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('Current user:', user)
      setResult({ user, error: error?.message })
    } catch (err) {
      console.error('Get user error:', err)
      setResult({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  const checkAllUsers = async () => {
    try {
      // This will only work if RLS is disabled for testing
      const { data, error } = await supabase
        .from('auth.users')
        .select('*')
      
      console.log('All users:', data)
      setResult({ users: data || undefined, error: error?.message })
    } catch (err) {
      console.error('Get all users error:', err)
      setResult({ error: err instanceof Error ? err.message : 'Cannot fetch users - need service role' })
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">Test Signup Flow</h1>
        
        <div className="bg-card rounded-lg border border-border/60 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test User Registration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={testSignup}
                disabled={loading}
                className="px-6 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Signup'}
              </button>
              
              <button
                onClick={checkCurrentUser}
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                Check Current User
              </button>
              
              <button
                onClick={checkAllUsers}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Check All Users
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-card rounded-lg border border-border/60 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Result</h2>
            <pre className="text-sm text-muted bg-background p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="bg-muted/10 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Environment Check</h3>
          <p className="text-sm text-muted">
            Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </p>
          <p className="text-sm text-muted">
            Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
          </p>
        </div>

        <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
          <h3 className="font-semibold mb-2 text-yellow-700">Troubleshooting Tips</h3>
          <ul className="text-sm text-muted space-y-1">
            <li>• Check Supabase dashboard → Authentication → Users</li>
            <li>• Users may need email verification to appear as &quot;confirmed&quot;</li>
            <li>• Check browser console for detailed error messages</li>
            <li>• Ensure email confirmation is disabled in Supabase Auth settings for testing</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <Link href="/auth/signup" className="text-accent hover:text-accent/80 transition-colors">
            ← Back to Full Signup Flow
          </Link>
        </div>
      </div>
    </div>
  )
}