'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  firstName: string
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
        {greeting},{' '}
        <span style={{ color: 'var(--indigo-hover)' }}>{firstName}</span>.
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

export default function V3DashboardPage() {
  const tierState = useV3Tier()
  const [recent, setRecent] = useState<Deal[]>([])
  const [pipeline, setPipeline] = useState<Deal[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [loadingPipeline, setLoadingPipeline] = useState(true)
  const [scanTime, setScanTime] = useState('04:24 PT')

  useEffect(() => {
    const d = new Date()
    const hh = d.getHours().toString().padStart(2, '0')
    const mm = d.getMinutes().toString().padStart(2, '0')
    setScanTime(`${hh}:${mm} PT`)
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

  const firstName = tierState.status === 'ready' ? tierState.firstName : 'there'

  return (
    <div style={{ padding: '28px 28px 80px', maxWidth: 1440, margin: '0 auto' }}>
      <Greeting firstName={firstName} recentCount={recent.length} scanTime={scanTime} />
      <ScoutStatusStrip />

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
