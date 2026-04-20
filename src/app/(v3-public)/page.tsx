'use client'

import { useState, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProductPreview from '@/components/v3/public/ProductPreview'
import MetroTile from '@/components/v3/public/MetroTile'
import SignalBadge from '@/components/v3/public/SignalBadge'
import ScoutTerminal from '@/components/v3/public/ScoutTerminal'
import PricingTiers from '@/components/v3/public/PricingTiers'
import { METROS, type Signal } from '@/data/v3-metros'

const STRATEGIES = ['BRRRR', 'Fix & Flip', 'Buy & Hold', 'House Hack'] as const
type Strategy = (typeof STRATEGIES)[number]

const TICKER_ITEMS = [
  'Memphis · 11.8% Cap · BRRRR · STRONG BUY',
  'Indianapolis · 9.4% Cap · Buy & Hold · BUY',
  'Tampa · 8.7% Cap · Fix & Flip · HOT',
  'Charlotte · 7.9% Cap · BRRRR · BUY',
  'Kansas City · 10.2% Cap · BRRRR · STRONG BUY',
  'Jacksonville · 8.1% Cap · Buy & Hold · BUY',
]

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

/* ----------------------------- HERO ----------------------------- */

function Hero() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [strategy, setStrategy] = useState<Strategy>('BRRRR')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    router.push('/v3/signup')
  }

  return (
    <section style={{ position: 'relative', padding: '64px 40px 40px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={GRID_BG_STYLE} />

      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 48,
          alignItems: 'center',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 999,
              padding: '5px 10px',
              fontSize: 11,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--blue)',
                boxShadow: '0 0 6px rgba(59,130,246,0.6)',
                animation: 'v3-pulse 1.8s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--blue)',
                letterSpacing: '0.14em',
                fontWeight: 600,
              }}
            >
              DEAL SCOUT
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Autonomous agent — now in Pro Max
            </span>
          </span>

          <h1
            style={{
              fontSize: 58,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              margin: '22px 0 18px',
              color: 'var(--text)',
            }}
          >
            The AI that{' '}
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'var(--indigo-hover)',
              }}
            >
              underwrites
            </span>{' '}
            your next deal before you make an offer.
          </h1>

          <p
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              maxWidth: 560,
              lineHeight: 1.55,
              margin: '0 0 28px',
            }}
          >
            Enter any address. In under 30 seconds, Dealsletter returns cap rate, cash flow, 5-year ROI, and a narrative written by three frontier models reviewing the deal side-by-side.
          </p>

          <form
            onSubmit={onSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--elevated)',
              border: '1px solid var(--border-strong)',
              borderRadius: 999,
              padding: 5,
              maxWidth: 560,
              boxShadow: '0 0 0 6px rgba(99,102,241,0.06)',
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
              placeholder="2847 Magnolia Ave, Memphis TN 38104"
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
            <button
              type="submit"
              className="app-btn"
              style={{ borderRadius: 999, padding: '9px 16px' }}
            >
              Analyze →
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {STRATEGIES.map(s => {
              const active = s === strategy
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStrategy(s)}
                  style={{
                    background: active ? 'var(--indigo-dim)' : 'var(--surface)',
                    color: active ? 'var(--indigo-hover)' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
                    borderRadius: 999,
                    padding: '4px 10px',
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 140ms ease',
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              marginTop: 38,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            <HeroStat value="14,230" label="Analyses · 30d" />
            <HeroDivider />
            <HeroStat value="48" label="Metros tracked" />
            <HeroDivider />
            <HeroStat value="27s" label="Median analysis" />
          </div>
        </div>

        <div>
          <ProductPreview />
        </div>
      </div>
    </section>
  )
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 18,
          fontWeight: 500,
          color: 'var(--text)',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  )
}

function HeroDivider() {
  return <span style={{ width: 1, background: 'var(--hairline)', alignSelf: 'stretch' }} />
}

/* --------------------------- TICKER --------------------------- */

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div
      style={{
        borderTop: '1px solid var(--hairline)',
        borderBottom: '1px solid var(--hairline)',
        padding: '10px 0',
        overflow: 'hidden',
        background: 'var(--surface)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 32,
          whiteSpace: 'nowrap',
          animation: 'v3-marquee 80s linear infinite',
          width: 'max-content',
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ color: 'var(--indigo-hover)' }}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ----------------------- MARKETS PREVIEW ----------------------- */

function MarketsPreview() {
  return (
    <section style={{ padding: '80px 40px 40px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 32 }}>
        <div style={{ maxWidth: 720 }}>
          <SectionLabel>— 01 · MARKET INTEL</SectionLabel>
          <h2 style={sectionH2}>48 metros. One signal per cell.</h2>
          <p style={{ margin: '14px 0 0', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Every night Dealsletter ingests MLS, tax records, and rental comps across all covered metros and assigns a single signal — Strong Buy, Hot, Buy, Watch, or Caution.
          </p>
        </div>
        <Link href="/markets" className="app-btn-ghost" style={{ flexShrink: 0 }}>
          Open full markets →
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        {METROS.map(m => (
          <MetroTile key={m.metro} metro={m} />
        ))}
      </div>
    </section>
  )
}

/* --------------------------- STRATEGIES --------------------------- */

type StrategyCard = {
  name: string
  tag: string
  metricLabel: string
  metricValue: string
  note: string
  signal: Signal
}

const STRATEGY_CARDS: StrategyCard[] = [
  {
    name: 'BRRRR',
    tag: 'Buy · Rehab · Rent · Refinance · Repeat',
    metricLabel: 'ROI (YR 1)',
    metricValue: '188%',
    note: 'Post-refi cash flow: $842/mo',
    signal: 'STRONG BUY',
  },
  {
    name: 'Fix & Flip',
    tag: 'Acquire · Renovate · Exit in 6 months',
    metricLabel: 'PROFIT',
    metricValue: '$102K',
    note: '22% return on cost · 18-wk timeline',
    signal: 'BUY',
  },
  {
    name: 'Buy & Hold',
    tag: 'Long-term appreciation and cash flow',
    metricLabel: 'CAP RATE',
    metricValue: '11.2%',
    note: 'Stabilized rents 6% under market',
    signal: 'BUY',
  },
  {
    name: 'House Hack',
    tag: 'Live-in value-add with FHA financing',
    metricLabel: 'NET HOUSING',
    metricValue: '-$180/mo',
    note: '3-unit · 3.5% down · $1,220 PITI offset',
    signal: 'WATCH',
  },
]

function StrategiesSection() {
  return (
    <section style={{ padding: '80px 40px 40px', maxWidth: 1440, margin: '0 auto' }}>
      <SectionLabel>— 02 · STRATEGIES</SectionLabel>
      <h2 style={{ ...sectionH2, marginBottom: 40 }}>Four playbooks. One underwriting engine.</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STRATEGY_CARDS.map(card => (
          <div
            key={card.name}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 10,
              padding: 20,
              transition: 'transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'var(--hairline)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: 'var(--indigo-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--indigo-hover)',
                }}
              >
                {card.name[0]}
              </div>
              <SignalBadge signal={card.signal} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{card.name}</div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                marginTop: 6,
                minHeight: 36,
                lineHeight: 1.5,
              }}
            >
              {card.tag}
            </div>
            <div style={{ borderTop: '1px solid var(--hairline)', margin: '16px 0 14px' }} />
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.14em',
                color: 'var(--text-muted)',
              }}
            >
              {card.metricLabel}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                marginTop: 4,
              }}
            >
              {card.metricValue}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{card.note}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* --------------------------- SCOUT TEASER --------------------------- */

function ScoutTeaser() {
  const formRef = useRef<HTMLFormElement>(null)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || submitting) return
    setSubmitting(true)
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subscribeNewsletter: true, skipWelcomeEmail: true }),
      })
    } catch {
      // silent — waitlist capture is best-effort from marketing page
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <section style={{ padding: '60px 40px', maxWidth: 1440, margin: '0 auto' }}>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 14,
          padding: '44px 44px 44px 60px',
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: 40,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: 'linear-gradient(180deg, #6366F1, #3B82F6)',
          }}
        />

        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--blue)',
                boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                animation: 'v3-pulse 1.8s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--blue)',
                letterSpacing: '0.14em',
                fontWeight: 600,
              }}
            >
              DEAL SCOUT · PRO MAX
            </span>
          </div>

          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 16px', color: 'var(--text)' }}>
            Your autonomous underwriter. Scanning every night while you sleep.
          </h2>

          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 22px' }}>
            Set your criteria once — cap rate, cash-on-cash, price ceiling, preferred metros, strategy. Scout watches MLS, off-market, and wholesale feeds, then surfaces deals that clear every filter. Delivered to your inbox by 6 AM.
          </p>

          <form
            ref={formRef}
            onSubmit={onSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: 4,
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
              borderRadius: 999,
              maxWidth: 480,
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={submitted ? 'Thanks — we will be in touch' : 'you@firm.com'}
              disabled={submitted}
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text)',
                padding: '8px 14px',
                minWidth: 0,
              }}
            />
            <button
              type="submit"
              className="app-btn"
              disabled={submitting || submitted}
              style={{ borderRadius: 999, padding: '8px 14px' }}
            >
              {submitted ? '✓ Joined' : submitting ? 'Joining…' : 'Join waitlist →'}
            </button>
          </form>
        </div>

        <ScoutTerminal />
      </div>
    </section>
  )
}

/* --------------------------- PRICING TEASER --------------------------- */

function PricingTeaser() {
  return (
    <section style={{ padding: '80px 40px 120px', maxWidth: 1440, margin: '0 auto' }}>
      <SectionLabel>— 03 · PRICING</SectionLabel>
      <h2 style={{ ...sectionH2, marginBottom: 40 }}>Pay for the models you run.</h2>
      <PricingTiers />
    </section>
  )
}

/* --------------------------- SHARED --------------------------- */

const sectionH2: React.CSSProperties = {
  fontSize: 40,
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.05,
  color: 'var(--text)',
  margin: '10px 0 0',
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.14em',
        color: 'var(--indigo-hover)',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  )
}

/* --------------------------- PAGE --------------------------- */

export default function V3LandingPage() {
  return (
    <>
      <Hero />
      <Ticker />
      <MarketsPreview />
      <StrategiesSection />
      <ScoutTeaser />
      <PricingTeaser />
    </>
  )
}
