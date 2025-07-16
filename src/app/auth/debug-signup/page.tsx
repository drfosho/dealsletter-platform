'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function DebugSignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSignup = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('Attempting signup with:', { email, password })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            full_name: 'Test User',
            investor_experience: 'none',
            deal_types: ['brrrr', 'fix-flip'],
            investment_goals: 'cash-flow',
            budget: '50k-100k',
            location: 'Los Angeles, CA',
          },
        },
      })
      
      console.log('Signup result:', { data, error })
      setResult({ data, error })
    } catch (err) {
      console.error('Signup error:', err)
      setResult({ error: err })
    }
    
    setLoading(false)
  }

  const checkUsers = async () => {
    try {
      const { data, error } = await supabase.auth.getUser()
      console.log('Current user:', { data, error })
      setResult({ currentUser: data, error })
    } catch (err) {
      console.error('Get user error:', err)
      setResult({ error: err })
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-6">Debug Signup</h1>
        
        <div className="bg-card rounded-lg border border-border/60 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Signup</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="test@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="password123"
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
                onClick={checkUsers}
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                Check Current User
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-card rounded-lg border border-border/60 p-6">
            <h2 className="text-lg font-semibold mb-4">Result</h2>
            <pre className="text-sm text-muted bg-background p-4 rounded-lg overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 bg-muted/10 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Environment Check</h3>
          <p className="text-sm text-muted">
            Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </p>
          <p className="text-sm text-muted">
            Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
          </p>
        </div>
      </div>
    </div>
  )
}