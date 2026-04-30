'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type ProfileRow = {
  subscription_tier: string | null
  subscription_status: string | null
  monthly_analysis_count: number | null
  monthly_analysis_limit: number | null
}

export default function V3ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/v3/login')
        return
      }
      if (cancelled) return
      setUser(session.user)

      const { data } = await supabase
        .from('user_profiles')
        .select('subscription_tier, subscription_status, monthly_analysis_count, monthly_analysis_limit')
        .eq('id', session.user.id)
        .single()

      if (cancelled) return
      setProfile((data as ProfileRow | null) ?? null)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/v3/login')
  }

  if (loading) {
    return (
      <div style={{ padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        Loading…
      </div>
    )
  }

  const tier = profile?.subscription_tier || 'free'
  const tierLabel = tier === 'pro_max' ? 'Pro Max' : tier === 'pro' ? 'Pro' : 'Free'
  const used = profile?.monthly_analysis_count ?? 0
  const limit = profile?.monthly_analysis_limit ?? 3
  const fullName = (user?.user_metadata?.full_name as string | undefined) || ''

  return (
    <div style={{ padding: '32px 28px', maxWidth: 600 }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Your account
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}
        >
          {fullName || user?.email || 'Investor'}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginTop: 4,
          }}
        >
          {user?.email}
        </div>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Subscription
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{tierLabel}</div>
            {tier === 'free' && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginTop: 4,
                }}
              >
                {used} / {limit} analyses used this month
              </div>
            )}
          </div>
          {tier === 'free' ? (
            <button
              type="button"
              className="app-btn"
              style={{ padding: '9px 16px', fontSize: 13 }}
              onClick={() => router.push('/pricing')}
            >
              Upgrade →
            </button>
          ) : (
            <span
              style={{
                background: 'var(--indigo-dim)',
                color: 'var(--indigo-hover)',
                border: '1px solid var(--border-strong)',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
              }}
            >
              Active
            </span>
          )}
        </div>
        {tier === 'free' && (
          <div
            style={{
              marginTop: 12,
              background: 'var(--elevated)',
              borderRadius: 8,
              height: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, limit > 0 ? (used / limit) * 100 : 0)}%`,
                background: 'var(--indigo)',
                borderRadius: 8,
              }}
            />
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          className="app-btn-ghost"
          style={{ padding: '9px 16px', fontSize: 13, color: 'var(--red)' }}
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
