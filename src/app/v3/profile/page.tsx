'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FREE_MONTHLY_ANALYSIS_LIMIT } from '@/lib/constants'

const getTierDisplayName = (tier: string): string => {
  if (tier === 'pro-plus' || tier === 'pro_plus' || tier === 'premium') return 'Pro Max'
  if (tier === 'pro' || tier === 'professional') return 'Pro'
  return 'Free'
}

const getTierColor = (tier: string): string => {
  const name = getTierDisplayName(tier)
  if (name === 'Pro Max') return '#FBBF24'
  if (name === 'Pro') return 'var(--indigo-hover)'
  return 'var(--text-muted)'
}

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const getModelLabel = (tierName: string): string => {
  if (tierName === 'Pro Max') return 'Max IQ (Opus + GPT-4o + Grok 3)'
  if (tierName === 'Pro') return 'Balanced (Sonnet / GPT-4.1)'
  return 'Speed (GPT-4o-mini)'
}

const getThrottleLabel = (tier: string): string => {
  if (tier === 'pro_max' || tier === 'pro_plus' || tier === 'pro-plus') return '30/hr · 150/day'
  if (tier === 'pro' || tier === 'professional') return '20/hr · 100/day'
  return '5/hr · 20/day'
}

export default function V3ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [usageInfo, setUsageInfo] = useState<any>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [billingLoading, setBillingLoading] = useState(false)
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { router.push('/v3/login'); return }
      setUser(session.user)

      try {
        const [usageRes] = await Promise.all([
          fetch('/api/analysis/usage')
        ])
        if (usageRes.ok) setUsageInfo(await usageRes.json())

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('cancel_at_period_end, current_period_end')
          .eq('id', session.user.id)
          .single()
        setCancelAtPeriodEnd(profile?.cancel_at_period_end || false)

        const { count } = await supabase
          .from('analyzed_properties')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
        setTotalCount(count ?? 0)

        const { data: recent } = await supabase
          .from('analyzed_properties')
          .select('id, address, deal_type, analysis_date')
          .eq('user_id', session.user.id)
          .order('analysis_date', { ascending: false })
          .limit(5)
        setRecentAnalyses(recent || [])
      } catch (err) {
        console.error('Profile load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const handleManageBilling = async () => {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnPath: '/v3/profile' }),
      })
      if (res.ok) {
        const { url } = await res.json()
        window.location.href = url
      }
    } catch (err) {
      console.error('Portal error:', err)
    } finally {
      setBillingLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/v3/login')
  }

  const tier = usageInfo?.subscription_tier || 'free'
  const tierName = getTierDisplayName(tier)
  const tierColor = getTierColor(tier)
  const isPaid = tierName === 'Pro' || tierName === 'Pro Max'
  const isTrialing = usageInfo?.subscription_status === 'trialing'
  const isAdmin = usageInfo?.is_admin
  const isFree = (usageInfo?.is_limited ?? tier === 'free') && !isAdmin
  const analysesThisMonth = usageInfo?.analyses_this_month || 0
  const monthlyRemaining: number | null = usageInfo?.monthly_remaining ?? null
  const used = usageInfo?.analyses_used || 0
  const firstName = user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Investor'
  const nextResetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  const nextResetLabel = nextResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const card: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--hairline)',
    borderRadius: 12,
    padding: '22px 24px',
    marginBottom: 14,
  }

  const cell: React.CSSProperties = {
    background: 'var(--elevated)',
    borderRadius: 8,
    padding: '14px 16px',
  }

  const cellLabel: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: 'var(--text-muted)',
    marginBottom: 6,
  }

  if (loading) return (
    <div style={{ padding: '40px 28px' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ height: 100, background: 'var(--surface)', borderRadius: 12, marginBottom: 14, opacity: 0.5 }} />
      ))}
    </div>
  )

  return (
    <div style={{ padding: '32px 28px 80px', maxWidth: 720, margin: '0 auto' }}>

      {/* A — Profile header */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: tierName === 'Pro Max'
            ? 'linear-gradient(135deg, #FBBF24, #F87171)'
            : tierName === 'Pro'
              ? 'linear-gradient(135deg, var(--indigo), var(--indigo-hover))'
              : 'var(--elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#fff',
        }}>
          {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{firstName}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
            Member since {formatDate(user?.created_at)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{
            background: `${tierColor}20`, border: `1px solid ${tierColor}66`,
            borderRadius: 8, padding: '5px 14px', fontSize: 13, fontWeight: 500, color: tierColor,
          }}>
            {tierName}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="app-btn-ghost"
            style={{ padding: '7px 14px', fontSize: 12 }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* B — Subscription */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Subscription</span>
          <span style={{
            background: isTrialing ? 'rgba(251,191,36,0.12)' : isPaid ? 'rgba(52,211,153,0.12)' : 'var(--elevated)',
            border: `1px solid ${isTrialing ? 'rgba(251,191,36,0.3)' : isPaid ? 'rgba(52,211,153,0.3)' : 'var(--hairline)'}`,
            borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 500,
            color: isTrialing ? '#FBBF24' : isPaid ? '#34D399' : 'var(--text-muted)',
          }}>
            {isAdmin ? 'Admin' : isTrialing ? 'Trialing' : isPaid ? 'Active' : 'Free'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
          <div style={cell}>
            <div style={cellLabel}>Plan</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: tierColor }}>{tierName}</div>
          </div>
          <div style={cell}>
            <div style={cellLabel}>Next billing</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
              {isTrialing ? `Trial ends ${formatDate(usageInfo?.trial_end)}` : isPaid ? formatDate(usageInfo?.current_period_end) : 'No billing'}
            </div>
          </div>
          <div style={cell}>
            <div style={cellLabel}>AI Model</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>
              {getModelLabel(tierName)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {!isPaid && !isAdmin && (
            <>
              <button type="button" className="app-btn" style={{ padding: '9px 18px', fontSize: 13 }}
                onClick={() => router.push('/pricing')}>
                Upgrade to Pro →
              </button>
              <button type="button" className="app-btn-ghost" style={{ padding: '9px 18px', fontSize: 13 }}
                onClick={() => router.push('/pricing')}>
                Compare plans
              </button>
            </>
          )}
          {isPaid && !isAdmin && (
            <>
              <button type="button" className="app-btn" style={{ padding: '9px 18px', fontSize: 13 }}
                onClick={handleManageBilling} disabled={billingLoading}>
                {billingLoading ? 'Opening...' : 'Manage billing →'}
              </button>
              {tierName === 'Pro' && (
                <button type="button" className="app-btn-ghost"
                  style={{ padding: '9px 18px', fontSize: 13, borderColor: '#FBBF24', color: '#FBBF24' }}
                  onClick={() => router.push('/pricing')}>
                  Upgrade to Pro Max
                </button>
              )}
              {cancelAtPeriodEnd && (
                <div style={{
                  width: '100%', background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8,
                  padding: '12px 16px', fontSize: 13, color: '#FBBF24', lineHeight: 1.5
                }}>
                  Subscription ends {formatDate(usageInfo?.current_period_end)}. Full access until then.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* C — Usage */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 18 }}>Usage this month</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {isFree ? (
            <>
              <div style={cell}>
                <div style={cellLabel}>Used this month</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{analysesThisMonth}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>of {FREE_MONTHLY_ANALYSIS_LIMIT} free</div>
              </div>
              <div style={cell}>
                <div style={cellLabel}>Remaining</div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700,
                  color: monthlyRemaining === 0 ? 'var(--red)' : (monthlyRemaining ?? 0) <= 1 ? 'var(--amber)' : 'var(--green)'
                }}>{monthlyRemaining ?? '—'}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>resets {nextResetLabel}</div>
              </div>
              <div style={cell}>
                <div style={cellLabel}>Total all-time</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{totalCount ?? 0}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>analyses run</div>
              </div>
            </>
          ) : (
            <>
              <div style={cell}>
                <div style={cellLabel}>All-time</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{used}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>analyses run</div>
              </div>
              <div style={cell}>
                <div style={cellLabel}>This month</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{analysesThisMonth}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>no monthly cap</div>
              </div>
              <div style={cell}>
                <div style={cellLabel}>Rate limit</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Unlimited</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{getThrottleLabel(tier)}</div>
              </div>
            </>
          )}
        </div>

        {isFree && (
          <div style={{ marginTop: 16 }}>
            <div style={{ height: 4, background: 'var(--elevated)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (analysesThisMonth / FREE_MONTHLY_ANALYSIS_LIMIT) * 100)}%`,
                background: monthlyRemaining === 0 ? 'var(--red)' : (monthlyRemaining ?? 0) <= 1 ? 'var(--amber)' : 'var(--indigo)',
                borderRadius: 4, transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              <span>{analysesThisMonth} of {FREE_MONTHLY_ANALYSIS_LIMIT} used</span>
              <span>Resets {nextResetLabel}</span>
            </div>
            <div style={{ marginTop: 16, background: 'var(--elevated)', border: '1px solid var(--hairline)', borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Want unlimited analyses?</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                Upgrade to Pro for unlimited analyses, full AI insights, saved history, and no caps. Try free for 7 days.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="app-btn" style={{ flex: 1, padding: '9px 16px', fontSize: 13 }}
                  onClick={() => router.push('/pricing')}>
                  See plans →
                </button>
                <button type="button" className="app-btn-ghost" style={{ flex: 1, padding: '9px 16px', fontSize: 13 }}
                  onClick={() => router.push('/pricing')}>
                  Compare plans
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* D — Recent analyses */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Recent analyses</div>
        {recentAnalyses.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            No analyses yet
          </div>
        ) : recentAnalyses.map((a, i) => (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: i < recentAnalyses.length - 1 ? '1px solid var(--hairline)' : 'none',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                {a.address?.split(',')[0] || a.address}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                {a.deal_type || 'Analysis'} · {a.analysis_date ? new Date(a.analysis_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </div>
            </div>
            <a href={`/v3/analyze?address=${encodeURIComponent(a.address || '')}`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--indigo-hover)', textDecoration: 'none' }}>
              Open →
            </a>
          </div>
        ))}
      </div>

      {/* E — Quick actions */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Quick actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { title: 'Run Analysis', sub: 'Analyze a property', href: '/v3/analyze' },
            { title: 'Pipeline', sub: 'View saved deals', href: '/v3/pipeline' },
            { title: 'Pricing & Plans', sub: 'Compare all tiers', href: '/pricing' },
            { title: 'Markets', sub: 'Browse metro data', href: '/v3/markets' },
          ].map(action => (
            <button key={action.title} type="button"
              onClick={() => router.push(action.href)}
              style={{
                background: 'var(--elevated)', border: '1px solid var(--hairline)',
                borderRadius: 10, padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                transition: 'border-color 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--hairline)'}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{action.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{action.sub}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
