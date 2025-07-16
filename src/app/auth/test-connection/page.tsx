'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestConnection() {
  const [status, setStatus] = useState<string>('Testing connection...')
  const [error, setError] = useState<string>('')

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setError(error.message)
        setStatus('Connection failed')
      } else {
        setStatus('Connection successful!')
        console.log('Supabase connection working:', data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('Connection failed')
    }
  }

  // Test connection on component mount
  useState(() => {
    testConnection()
  })

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border/60 p-8 shadow-lg text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Supabase Connection Test</h1>
        
        <div className="space-y-4">
          <div className={`p-3 rounded-lg ${
            status === 'Connection successful!' 
              ? 'bg-green-500/10 border border-green-500/20'
              : status === 'Connection failed'
              ? 'bg-red-500/10 border border-red-500/20'
              : 'bg-muted/10 border border-border/20'
          }`}>
            <p className={`font-medium ${
              status === 'Connection successful!' 
                ? 'text-green-600'
                : status === 'Connection failed'
                ? 'text-red-600'
                : 'text-muted'
            }`}>
              {status}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="text-sm text-muted">
            <p>Project URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p>API Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
          </div>

          <button
            onClick={testConnection}
            className="w-full px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Test Again
          </button>
        </div>
      </div>
    </div>
  )
}