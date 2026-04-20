'use client'

import { useMemo, useState } from 'react'
import MetroTile from '@/components/v3/public/MetroTile'
import MetroDrawer from '@/components/v3/app/MetroDrawer'
import { METROS, SIGNAL_LEGEND, type Metro, type Signal } from '@/data/v3-metros'

type FilterSignal = Signal | 'ALL'
const REGIONS = ['ALL', 'West', 'Midwest', 'South', 'Northeast'] as const
type Region = (typeof REGIONS)[number]

const METRO_REGION: Record<string, Exclude<Region, 'ALL'>> = {
  Memphis: 'South',
  Indianapolis: 'Midwest',
  Tampa: 'South',
  Charlotte: 'South',
  'Kansas City': 'Midwest',
  Jacksonville: 'South',
  Cleveland: 'Midwest',
  Detroit: 'Midwest',
}

// These counts describe the full 48-metro coverage, not just the 8 we render.
const SUMMARY_COUNTS: Record<Signal, number> = {
  'STRONG BUY': 8,
  HOT: 6,
  BUY: 18,
  WATCH: 12,
  CAUTION: 4,
}

function SignalTile({
  signal,
  color,
  count,
  active,
  onClick,
}: {
  signal: FilterSignal
  color: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? 'var(--elevated)' : 'var(--surface)',
        border: `1px solid ${active ? 'var(--border-strong)' : 'var(--hairline)'}`,
        borderRadius: 10,
        padding: 14,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 140ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}
        >
          {signal}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--text)',
          marginTop: 6,
          lineHeight: 1,
        }}
      >
        {count}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-muted)',
          marginTop: 4,
        }}
      >
        of 48 metros
      </div>
    </button>
  )
}

export default function V3MarketsPage() {
  const [signalFilter, setSignalFilter] = useState<FilterSignal>('ALL')
  const [region, setRegion] = useState<Region>('ALL')
  const [open, setOpen] = useState<Metro | null>(null)

  const allCount = Object.values(SUMMARY_COUNTS).reduce((a, b) => a + b, 0)

  const shown = useMemo(() => {
    return METROS.filter(m => {
      if (signalFilter !== 'ALL' && m.signal !== signalFilter) return false
      if (region !== 'ALL' && METRO_REGION[m.metro] !== region) return false
      return true
    })
  }, [signalFilter, region])

  return (
    <div style={{ padding: '28px 28px 80px', maxWidth: 1440, margin: '0 auto' }}>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
          marginBottom: 24,
        }}
      >
        <SignalTile
          signal="ALL"
          color="var(--text-secondary)"
          count={allCount}
          active={signalFilter === 'ALL'}
          onClick={() => setSignalFilter('ALL')}
        />
        {SIGNAL_LEGEND.slice(0, 4).map(entry => (
          <SignalTile
            key={entry.signal}
            signal={entry.signal}
            color={entry.color}
            count={SUMMARY_COUNTS[entry.signal]}
            active={signalFilter === entry.signal}
            onClick={() => setSignalFilter(entry.signal)}
          />
        ))}
      </section>

      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            REGION
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {REGIONS.map(r => {
              const active = r === region
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegion(r)}
                  style={{
                    background: active ? 'var(--indigo-dim)' : 'var(--surface)',
                    color: active ? 'var(--indigo-hover)' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
                    borderRadius: 999,
                    padding: '5px 12px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 140ms ease',
                  }}
                >
                  {r}
                </button>
              )
            })}
          </div>
        </div>
        <button type="button" className="app-btn-ghost" style={{ padding: '7px 13px', fontSize: 12 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          More filters
        </button>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 8,
        }}
      >
        {shown.map(m => (
          <div
            key={m.metro}
            onClick={() => setOpen(m)}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') setOpen(m)
            }}
          >
            <MetroTile metro={m} />
          </div>
        ))}
      </section>

      {shown.length === 0 && (
        <div
          style={{
            marginTop: 60,
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          No metros match this filter combination.
        </div>
      )}

      <MetroDrawer metro={open} onClose={() => setOpen(null)} />
    </div>
  )
}
