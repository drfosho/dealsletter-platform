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

type RecentAnalysis = {
  id: string
  address: string | null
  deal_type: string | null
  analysis_date: string | null
}

export default function V3ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [recent, setRecent] = useState<RecentAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [billingLoading, setBillingLoading] = useState(false)

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

      const profilePromise = supabase
        .from('user_profiles')
        .select('subscription_tier, subscription_status, monthly_analysis_count, monthly_analysis_limit')
        .eq('id', session.user.id)
        .single()

      const countPromise = supabase
        .from('analyzed_properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)

      const recentPromise = supabase
        .from('analyzed_properties')
        .select('id, address, deal_type, analysis_date')
        .eq('user_id', session.user.id)
        .order('analysis_date', { ascending: false })
        .limit(5)

      const [{ data: profileData }, { count }, { data: recentData }] = await Promise.all([
        profilePromise,
        countPromise,
        recentPromise,
      ])

      if (cancelled) return
      setProfile((profileData as ProfileRow | null) ?? null)
      setTotalCount(count ?? 0)
      setRecent((recentData as RecentAnalysis[] | null) ?? [])
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

  const handleManageBilling = async () => {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnPath: '/v3/profile' }),
      })
      const data = await res.json().catch(() => ({}))
      const url = (data as { url?: string }).url
      if (url) {
        window.location.href = url
      } else {
        router.push('/pricing')
      }
    } catch {
      router.push('/pricing')
    } finally {
      setBillingLoading(false)
    }
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
  const displayName = fullName || user?.email || 'Investor'
  const avatarLetter = (fullName || user?.email || 'U').charAt(0).toUpperCase()
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'

  return (
    <div style={{ padding: '32px 28px', maxWidth: 600 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--indigo)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 16,
        }}
      >
        {avatarLetter}
      </div>

      <div style={{ marginBottom: 28 }}>
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
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          {displayName}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              <button
                type="button"
                className="app-btn-ghost"
                style={{ padding: '8px 14px', fontSize: 12 }}
                onClick={handleManageBilling}
                disabled={billingLoading}
              >
                {billingLoading ? 'Opening…' : 'Manage billing →'}
              </button>
            </div>
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Total Analyses
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--indigo-hover)',
              marginTop: 6,
            }}
          >
            {totalCount ?? 0}
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Member Since
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text)',
              marginTop: 6,
            }}
          >
            {memberSince}
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Recent Analyses
        </div>
        {recent.length === 0 ? (
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '16px 0',
            }}
          >
            No analyses yet
          </div>
        ) : (
          recent.map((a, i) => {
            const dateLabel = a.analysis_date
              ? new Date(a.analysis_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '—'
            return (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < recent.length - 1 ? '1px solid var(--hairline)' : 'none',
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text)',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {a.address || '—'}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      marginTop: 2,
                    }}
                  >
                    {a.deal_type || 'Analysis'} · {dateLabel}
                  </div>
                </div>
                <a
                  href={`/v3/analyze?address=${encodeURIComponent(a.address || '')}`}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--indigo-hover)',
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  Open →
                </a>
              </div>
            )
          })
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
