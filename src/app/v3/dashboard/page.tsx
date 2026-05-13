'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DealCard from '@/components/v3/app/DealCard'
import PipelineTable from '@/components/v3/app/PipelineTable'
import MetroTile from '@/components/v3/public/MetroTile'
import { METROS } from '@/data/v3-metros'
import type { Deal } from '@/data/v3-deals'
import { adaptPipelineRecord, type PipelineRecord } from '@/lib/v3-deal-adapter'
import { useV3Tier } from '@/hooks/useV3Tier'

const CRITERIA = [
  { label: 'METROS', value: 'KC · Memphis · Tampa · Indy' },
  { label: 'STRATEGY', value: 'BRRRR · Buy & Hold' },
  { label: 'MAX PRICE', value: '$400K' },
  { label: 'MIN CAP', value: '7.0%' },
  { label: 'MIN COC', value: '9.0%' },
]

function timeOfDayGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function Greeting({
  firstName,
  recentCount,
  scanTime,
}: {
  firstName: string | null
  recentCount: number
  scanTime: string
}) {
  const greeting = timeOfDayGreeting()
  return (
    <div style={{ marginBottom: 22 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: 'var(--text)',
        }}
      >
        {greeting}
        {firstName ? (
          <>
            ,{' '}
            <span style={{ color: 'var(--indigo-hover)' }}>{firstName}</span>.
          </>
        ) : (
          '.'
        )}
      </h2>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          letterSpacing: '0.02em',
          color: 'var(--text-secondary)',
          marginTop: 8,
        }}
      >
        {recentCount > 0 ? (
          <>
            Scout found{' '}
            <span style={{ color: '#34D399', fontWeight: 600 }}>
              {recentCount} recent {recentCount === 1 ? 'analysis' : 'analyses'}
            </span>{' '}
            from your last 30 days.
          </>
        ) : (
          <>No analyses yet — run your first deal to get started.</>
        )}{' '}
        · Last scan {scanTime} · 12 metros covered
      </div>
    </div>
  )
}

function ScoutStatusStrip() {
  // TODO: wire to real Scout scan state once Scout backend lands.
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 12,
        padding: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        flexWrap: 'wrap',
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--blue)',
            boxShadow: '0 0 0 6px rgba(59,130,246,0.12)',
            animation: 'v3-pulse 1.8s ease-in-out infinite',
          }}
        />
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'var(--blue)',
              fontWeight: 600,
            }}
          >
            SCOUT IS LIVE
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-secondary)',
              marginTop: 3,
            }}
          >
            Next scan in 19h 36m
          </div>
        </div>
      </div>

      <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--hairline)' }} />

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: 14,
        }}
      >
        {CRITERIA.map(c => (
          <div key={c.label}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text)',
                marginTop: 3,
              }}
            >
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="app-btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Configure Scout
      </button>
    </section>
  )
}

function SectionHeader({
  label,
  title,
  right,
}: {
  label: string
  title: string
  right?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 18,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text)', marginTop: 6 }}>{title}</div>
      </div>
      {right}
    </div>
  )
}

function EmptyState({
  text,
  href,
  cta,
}: {
  text: string
  href: string
  cta: string
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px dashed var(--hairline)',
        borderRadius: 12,
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 14 }}>{text}</div>
      <Link href={href} className="app-btn" style={{ padding: '8px 16px', fontSize: 12 }}>
        {cta}
      </Link>
    </div>
  )
}

function V3DashboardPageInner() {
  const searchParams = useSearchParams()
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShowUpgradeBanner(true)
      window.history.replaceState({}, '', '/v3/dashboard')
      const t = setTimeout(() => setShowUpgradeBanner(false), 6000)
      return () => clearTimeout(t)
    }
  }, [searchParams])

  return <V3DashboardPageBody showUpgradeBanner={showUpgradeBanner} onDismissBanner={() => setShowUpgradeBanner(false)} />
}

export default function V3DashboardPage() {
  return (
    <Suspense fallback={null}>
      <V3DashboardPageInner />
    </Suspense>
  )
}

function V3DashboardPageBody({
  showUpgradeBanner,
  onDismissBanner,
}: {
  showUpgradeBanner: boolean
  onDismissBanner: () => void
}) {
  const router = useRouter()
  const tierState = useV3Tier()
  const tier = tierState.status === 'ready' ? tierState.tier : 'free'
  const [recent, setRecent] = useState<Deal[]>([])
  const [pipeline, setPipeline] = useState<Deal[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [loadingPipeline, setLoadingPipeline] = useState(true)
  const [scanTime, setScanTime] = useState('04:24 PT')
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const d = new Date()
    const hh = d.getHours().toString().padStart(2, '0')
    const mm = d.getMinutes().toString().padStart(2, '0')
    setScanTime(`${hh}:${mm} PT`)
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadName = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user || cancelled) return

      const meta = session.user.user_metadata as Record<string, unknown> | null
      const metaFirst =
        (meta?.first_name as string | undefined) ||
        (meta?.firstName as string | undefined)
      const metaFull =
        (meta?.full_name as string | undefined) ||
        (meta?.name as string | undefined)

      let resolved: string | null = null
      if (metaFirst) resolved = metaFirst
      else if (metaFull) resolved = metaFull.split(' ')[0]
      else {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()
        const profileFull = profile?.full_name as string | undefined
        if (profileFull) resolved = profileFull.split(' ')[0]
      }

      if (!cancelled) setUserName(resolved)
    }
    loadName()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (tierState.status !== 'ready') return
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch('/api/v3/pipeline', { credentials: 'include' })
        console.log('[Dashboard] pipeline fetch status:', res.status)
        if (!res.ok) throw new Error(`pipeline ${res.status}`)
        const data = await res.json()
        console.log('[Dashboard] pipeline data:', data)
        const list: PipelineRecord[] = data?.deals || []
        const deals = list.map(adaptPipelineRecord)
        if (!cancelled) {
          setRecent(deals.slice(0, 3))
          setPipeline(deals.slice(0, 7))
        }
      } catch (err) {
        console.error('[Dashboard] pipeline fetch error:', err)
        if (!cancelled) {
          setRecent([])
          setPipeline([])
        }
      } finally {
        if (!cancelled) {
          setLoadingRecent(false)
          setLoadingPipeline(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [tierState.status])

  const firstName = userName

  return (
    <div style={{ padding: '28px 28px 80px', maxWidth: 1440, margin: '0 auto' }}>
      {showUpgradeBanner && (
        <div style={{
          background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
          borderRadius: 10, padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#34D399', marginBottom: 3 }}>
              Welcome to Pro! Your account is now active.
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Unlimited analyses, full AI insights, and all Pro features are now unlocked.
            </div>
          </div>
          <button type="button" onClick={onDismissBanner}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>
            ×
          </button>
        </div>
      )}
      <Greeting firstName={firstName} recentCount={recent.length} scanTime={scanTime} />
      <ScoutStatusStrip />

      {tier === 'free' && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
              Start your free 7-day Pro trial
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Unlimited analyses, full AI insights, saved history, and no monthly caps.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button
              type="button"
              className="app-btn"
              style={{ padding: '10px 20px', fontSize: 13, whiteSpace: 'nowrap' }}
              onClick={() => router.push('/pricing')}
            >
              Try Pro free →
            </button>
            <button
              type="button"
              className="app-btn-ghost"
              style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}
              onClick={() => router.push('/pricing')}
            >
              See plans
            </button>
          </div>
        </div>
      )}

      <section style={{ marginBottom: 40 }}>
        <SectionHeader
          label="Recent analyses"
          title={
            loadingRecent
              ? 'Loading…'
              : recent.length === 0
                ? 'No analyses yet'
                : `Your last ${recent.length} ${recent.length === 1 ? 'analysis' : 'analyses'}`
          }
          right={
            <Link href="/v3/analyze" className="app-btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>
              Run new analysis →
            </Link>
          }
        />
        {loadingRecent ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 12,
                  padding: 18,
                  height: 240,
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            text="No analyses yet."
            href="/v3/analyze"
            cta="Run your first deal →"
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {recent.map(d => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        )}
      </section>

      <section style={{ marginBottom: 40 }}>
        <SectionHeader
          label="Saved pipeline"
          title={
            loadingPipeline
              ? 'Loading…'
              : pipeline.length === 0
                ? 'No deals saved yet'
                : `${pipeline.length} ${pipeline.length === 1 ? 'deal' : 'deals'} tracked`
          }
          right={
            <Link href="/v3/pipeline" className="app-btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>
              Open pipeline →
            </Link>
          }
        />
        {loadingPipeline ? (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 10,
              height: 220,
              opacity: 0.5,
            }}
          />
        ) : pipeline.length === 0 ? (
          <EmptyState
            text="No deals saved yet. Analyze a deal and save it to your pipeline."
            href="/v3/analyze"
            cta="Run an analysis →"
          />
        ) : (
          <PipelineTable deals={pipeline.slice(0, 5)} compact />
        )}
      </section>

      <section>
        <SectionHeader
          label="Market intel · Live"
          title="Your watchlist"
          right={
            <Link href="/v3/markets" className="app-btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>
              All 48 markets →
            </Link>
          }
        />
        {/* TODO: Wire Parcl metro data in the Markets build phase. */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          {METROS.map(m => (
            <div key={m.metro} style={{ flex: '0 0 auto', minWidth: 220 }}>
              <MetroTile metro={m} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
