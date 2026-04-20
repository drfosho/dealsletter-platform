'use client'

import { useMemo, useState } from 'react'
import MetroTile from '@/components/v3/public/MetroTile'
import { METROS, SIGNAL_LEGEND, type Signal } from '@/data/v3-metros'

const FILTERS: ('ALL' | Signal)[] = ['ALL', 'STRONG BUY', 'HOT', 'BUY', 'WATCH', 'CAUTION']

const GRID_BG_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  backgroundImage:
    'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
  maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent 70%)',
  WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.6), transparent 70%)',
}

function HeroStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 22,
          fontWeight: 600,
          color: 'var(--text)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default function MarketsPage() {
  const [filter, setFilter] = useState<'ALL' | Signal>('ALL')

  const convictionCount = METROS.filter(m => m.signal === 'STRONG BUY' || m.signal === 'HOT').length

  const sortedMetros = useMemo(() => [...METROS].sort((a, b) => b.cap - a.cap), [])

  const shown = useMemo(
    () => (filter === 'ALL' ? sortedMetros : sortedMetros.filter(m => m.signal === filter)),
    [filter, sortedMetros]
  )

  const signalCounts = useMemo(() => {
    const counts: Record<Signal, number> = {
      'STRONG BUY': 0,
      HOT: 0,
      BUY: 0,
      WATCH: 0,
      CAUTION: 0,
    }
    METROS.forEach(m => (counts[m.signal] += 1))
    return counts
  }, [])

  return (
    <>
      <section style={{ position: 'relative', padding: '72px 40px 48px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={GRID_BG_STYLE} />
        <div style={{ position: 'relative' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              color: 'var(--indigo-hover)',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            — COVERAGE
          </span>

          <h1
            style={{
              fontSize: 60,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              margin: '14px 0 18px',
              color: 'var(--text)',
            }}
          >
            48 metros.{' '}
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--indigo-hover)',
              }}
            >
              One signal
            </span>{' '}
            for each.
          </h1>

          <p
            style={{
              fontSize: 16,
              color: 'var(--text-secondary)',
              maxWidth: 720,
              lineHeight: 1.55,
              margin: '0 0 34px',
            }}
          >
            Every night, Dealsletter ingests MLS, tax records, and rental data across all 48 covered metros and assigns a single signal — Strong Buy, Hot, Buy, Watch, or Caution — based on cap rates, rent growth, days-on-market, and inventory.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 34 }}>
            <HeroStat value="48" label="Metros covered" />
            <HeroStat value={convictionCount} label="Conviction markets" />
            <HeroStat value="3.6M" label="Data points / wk" />
            <HeroStat value="Nightly" label="Refresh · 04:00 PT" />
          </div>
        </div>
      </section>

      <section style={{ padding: '0 40px 32px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {SIGNAL_LEGEND.map(entry => (
            <div
              key={entry.signal}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                borderLeft: `2px solid ${entry.color}`,
                borderRadius: 8,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: entry.color,
                  marginBottom: 6,
                }}
              >
                {entry.signal}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                {entry.description}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--text)',
                  }}
                >
                  {signalCounts[entry.signal]}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  metros
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 20px', maxWidth: 1440, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => {
              const active = f === filter
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    background: active ? 'var(--indigo-dim)' : 'var(--surface)',
                    color: active ? 'var(--indigo-hover)' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
                    borderRadius: 999,
                    padding: '6px 12px',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 140ms ease',
                  }}
                >
                  {f}
                </button>
              )
            })}
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            Sorted by cap rate · Desc
          </span>
        </div>
      </section>

      <section style={{ padding: '0 40px 120px', maxWidth: 1440, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 10,
          }}
        >
          {shown.map(m => (
            <MetroTile key={m.metro} metro={m} />
          ))}
        </div>
        {shown.length === 0 && (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            No metros match this signal right now.
          </div>
        )}
      </section>
    </>
  )
}
