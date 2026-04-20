'use client'

import { useState, FormEvent } from 'react'
import SignalBadge from '@/components/v3/public/SignalBadge'
import AnalysisAccordion from '@/components/v3/app/AnalysisAccordion'
import type { Signal } from '@/data/v3-metros'

const STRATEGIES = ['BRRRR', 'Fix & Flip', 'Buy & Hold', 'House Hack'] as const
type Strategy = (typeof STRATEGIES)[number]

type ModelTier = 'speed' | 'balanced' | 'max'
const MODEL_OPTIONS: {
  key: ModelTier
  label: string
  sub: string
}[] = [
  { key: 'speed', label: 'Speed', sub: 'GPT-4o-mini' },
  { key: 'balanced', label: 'Balanced', sub: 'Sonnet + GPT-4.1' },
  { key: 'max', label: 'Max IQ', sub: 'Opus + GPT-4o + Grok 3' },
]

const HEADER_STATS = [
  { label: 'BEDS', value: '3' },
  { label: 'BATHS', value: '2' },
  { label: 'SQFT', value: '1,420' },
  { label: 'YEAR', value: '1952' },
  { label: 'LIST', value: '$178K' },
  { label: 'ARV', value: '$265K', color: '#34D399' },
]

type TopMetric = {
  label: string
  value: string
  signal: Signal
  sub: string
  accent: string
}

const TOP_METRICS: TopMetric[] = [
  { label: 'CAP RATE', value: '11.8%', signal: 'STRONG BUY', sub: 'vs 8.2% market', accent: '#34D399' },
  { label: 'CASH-ON-CASH', value: '14.2%', signal: 'STRONG BUY', sub: 'Year 1 post-refi', accent: '#34D399' },
  { label: 'CASH FLOW', value: '$842', signal: 'BUY', sub: 'per month stabilized', accent: 'var(--text)' },
  { label: '5-YEAR ROI', value: '188%', signal: 'STRONG BUY', sub: 'Incl. appreciation', accent: 'var(--indigo-hover)' },
]

type ModelCard = {
  role: string
  model: string
  signal: Signal
  accent: string
  body: string
  metrics: { label: string; value: string }[]
}

const MODEL_CARDS: ModelCard[] = [
  {
    role: 'Risk Analyst',
    model: 'Claude Opus',
    signal: 'BUY',
    accent: '#10B981',
    body: 'Thesis hinges on post-rehab rent reaching $1,850/mo in a Class C submarket with 12% rent growth. Stress test at $1,700/mo still yields 9.1% cap — margin of safety sufficient. Insurance exposure moderate; flood zone X.',
    metrics: [
      { label: 'CAP', value: '11.8%' },
      { label: 'MAX DRAWDOWN', value: '8.2%' },
      { label: 'STRESS CoC', value: '9.1%' },
    ],
  },
  {
    role: 'Deal Sponsor',
    model: 'GPT-4o',
    signal: 'STRONG BUY',
    accent: '#10B981',
    body: 'This is textbook BRRRR. Acquire at $178K, rehab $42K, refi at 75% of $265K ARV leaves $21K in the deal with $842/mo cash flow. Infinite ROI on stabilized capital. Memphis submarket trending with 4.3% YoY.',
    metrics: [
      { label: 'CoC', value: '14.2%' },
      { label: 'CF/MO', value: '$842' },
      { label: 'EQUITY', value: '$198K' },
    ],
  },
  {
    role: 'Quant Model',
    model: 'Grok 3',
    signal: 'BUY',
    accent: '#3B82F6',
    body: 'Monte Carlo (10K runs) returns P50 of $1,840 rent, P20 $1,610, P80 $2,080. Probability of negative cash flow <6%. IRR distribution: median 22%, lower quartile 14%. Deal clears 92% of historical BRRRR comps.',
    metrics: [
      { label: 'IRR P50', value: '22%' },
      { label: 'NEG CF PROB', value: '<6%' },
      { label: 'COMPS CLEARED', value: '92%' },
    ],
  },
]

const WATERFALL = [
  { label: 'Purchase', value: '$178,000' },
  { label: 'Rehab', value: '$42,000' },
  { label: 'Total In', value: '$220,000' },
  { label: 'ARV', value: '$265,000' },
  { label: 'Refi 75%', value: '$198,750' },
  { label: 'Cash Left In', value: '$21,250' },
  { label: 'Monthly Cash Flow', value: '$842' },
  { label: 'CoC Return', value: '47.5%' },
]

const RENT_COMPS = [
  { address: '2910 Magnolia Ave', bb: '3/2', rent: '$1,825', dist: '0.1 mi' },
  { address: '118 Poplar St', bb: '3/2', rent: '$1,890', dist: '0.3 mi' },
  { address: '744 Maple Ln', bb: '3/2', rent: '$1,770', dist: '0.4 mi' },
]

const STRESS = [
  { scenario: 'Base', cap: '11.8%', coc: '14.2%', cf: '$842' },
  { scenario: 'Conservative (-10%)', cap: '10.4%', coc: '11.3%', cf: '$636' },
  { scenario: 'Bear (-20%)', cap: '9.1%', coc: '8.4%', cf: '$430' },
]

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? 'var(--indigo-dim)' : 'var(--surface)',
        color: active ? 'var(--indigo-hover)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 999,
        padding: '6px 12px',
        fontSize: 12,
        cursor: 'pointer',
        transition: 'all 140ms ease',
      }}
    >
      {children}
    </button>
  )
}

function ModelToggle({
  value,
  onChange,
}: {
  value: ModelTier
  onChange: (v: ModelTier) => void
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 2,
        background: 'var(--elevated)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
      }}
    >
      {MODEL_OPTIONS.map(opt => {
        const active = value === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            style={{
              background: active ? 'var(--indigo)' : 'transparent',
              color: active ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
              transition: 'all 140ms ease',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500 }}>{opt.label}</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.08em',
                color: active ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
              }}
            >
              {opt.sub}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function V3AnalyzePage() {
  const [address, setAddress] = useState('2847 Magnolia Ave, Memphis TN 38104')
  const [strategy, setStrategy] = useState<Strategy>('BRRRR')
  const [model, setModel] = useState<ModelTier>('max')

  const onAnalyze = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <div style={{ padding: '28px 28px 80px', maxWidth: 1440, margin: '0 auto' }}>
      <form
        onSubmit={onAnalyze}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 12,
          padding: 5,
          marginBottom: 18,
        }}
      >
        <span style={{ padding: '0 14px', color: 'var(--text-muted)', display: 'inline-flex' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Enter property address..."
          style={{
            flex: 1,
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            padding: '8px 0',
            minWidth: 0,
          }}
        />
        <button type="submit" className="app-btn" style={{ borderRadius: 8, padding: '9px 16px' }}>
          Analyze →
        </button>
      </form>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STRATEGIES.map(s => (
            <Chip key={s} active={s === strategy} onClick={() => setStrategy(s)}>
              {s}
            </Chip>
          ))}
        </div>
        <ModelToggle value={model} onChange={setModel} />
      </div>

      <section
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 12,
          padding: 22,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
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
              PROPERTY · MEMPHIS TN 38104
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
              }}
            >
              2847 Magnolia Ave
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 12, flexWrap: 'wrap' }}>
              {HEADER_STATS.map(s => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.12em',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 16,
                      fontWeight: 600,
                      color: s.color || 'var(--text)',
                      marginTop: 3,
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--hairline)',
              borderRadius: 10,
              padding: 14,
              minWidth: 240,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.14em',
                color: 'var(--indigo-hover)',
                fontWeight: 600,
              }}
            >
              RENTCAST DATA
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text)',
                marginTop: 6,
              }}
            >
              $1,847/mo <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>estimated rent</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Based on 12 comps · 0.4mi radius
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginTop: 20,
          }}
        >
          {TOP_METRICS.map(m => (
            <div
              key={m.label}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--hairline)',
                borderRadius: 10,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                {m.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 32,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: m.accent,
                    lineHeight: 1,
                  }}
                >
                  {m.value}
                </div>
                <SignalBadge signal={m.signal} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            AI CONSENSUS
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.1em',
              padding: '5px 12px',
              borderRadius: 6,
              background: 'rgba(16,185,129,0.14)',
              color: '#34D399',
              textTransform: 'uppercase',
            }}
          >
            STRONG BUY
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {MODEL_CARDS.map(card => (
            <div
              key={card.role}
              style={{
                position: 'relative',
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                borderRadius: 10,
                padding: 20,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: card.accent,
                  borderRadius: '2px 2px 0 0',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{card.role}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                    {card.model}
                  </div>
                </div>
                <SignalBadge signal={card.signal} />
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{card.body}</p>
              <div
                style={{
                  borderTop: '1px solid var(--hairline)',
                  marginTop: 16,
                  paddingTop: 14,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                }}
              >
                {card.metrics.map(m => (
                  <div key={m.label}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 8,
                        letterSpacing: '0.1em',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {m.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text)',
                        marginTop: 3,
                      }}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <AnalysisAccordion title="BRRRR Waterfall" subtitle="Cash flow through acquisition to refi" defaultOpen>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
            {WATERFALL.map(row => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--hairline)',
                  padding: '8px 0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </AnalysisAccordion>

        <AnalysisAccordion title="Rent Comps" subtitle="Closest 3 matched rentals">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {RENT_COMPS.map((c, i) => (
              <div
                key={c.address}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: i === RENT_COMPS.length - 1 ? 'none' : '1px solid var(--hairline)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--text)' }}>{c.address}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{c.bb}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{c.rent}</span>
                <span style={{ color: 'var(--text-muted)' }}>{c.dist}</span>
              </div>
            ))}
          </div>
        </AnalysisAccordion>

        <AnalysisAccordion title="Stress Test" subtitle="Base / Conservative / Bear">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                gap: 12,
                padding: '8px 0',
                borderBottom: '1px solid var(--hairline)',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              <span>Scenario</span>
              <span>Cap</span>
              <span>CoC</span>
              <span>CF/mo</span>
            </div>
            {STRESS.map((s, i) => (
              <div
                key={s.scenario}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: i === STRESS.length - 1 ? 'none' : '1px solid var(--hairline)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--text)' }}>{s.scenario}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{s.cap}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{s.coc}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{s.cf}</span>
              </div>
            ))}
          </div>
        </AnalysisAccordion>

        <AnalysisAccordion title="Offer Recommendation" subtitle="Scout's suggested price ceiling">
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--indigo-hover)',
              marginBottom: 10,
            }}
          >
            Recommended max offer: $182,500
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Offer $4.5K above list to stay competitive on a STRONG BUY with 4.3% rent growth, but cap exposure at a price that preserves a 10.5% cap on Year 1 stabilized rents. Include an appraisal contingency and escrow an 18-week rehab timeline.
          </p>
        </AnalysisAccordion>
      </section>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="app-btn-ghost" style={{ padding: '10px 16px' }}>
          Save to Pipeline
        </button>
        <button type="button" className="app-btn-ghost" style={{ padding: '10px 16px' }}>
          Export PDF
        </button>
        <button type="button" className="app-btn" style={{ padding: '10px 16px' }}>
          Run New Analysis
        </button>
      </div>
    </div>
  )
}
