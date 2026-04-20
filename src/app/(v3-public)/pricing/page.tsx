'use client'

import { useState } from 'react'
import PricingTiers from '@/components/v3/public/PricingTiers'

const COMPARISON_ROWS = [
  { label: 'Analyses / mo', free: 'Unlimited (blurred)', pro: 'Unlimited', max: 'Unlimited' },
  { label: 'AI Models', free: '1 (GPT-4o-mini)', pro: '2 (Sonnet + GPT-4.1)', max: '3 (Opus + GPT-4o + Grok 3)' },
  { label: 'Deal Scout', free: 'x', pro: 'x', max: 'check' },
  { label: 'Saved Pipeline', free: '5 saves', pro: 'Unlimited', max: 'Unlimited' },
  { label: 'Market Intel', free: 'x', pro: 'x', max: '48 metros' },
  { label: 'PDF Export', free: 'x', pro: 'check', max: 'check' },
  { label: 'API Access', free: 'x', pro: 'x', max: 'check' },
  { label: 'Support', free: 'Community', pro: 'Email', max: 'Priority' },
]

const FAQ = [
  {
    q: 'How does the analysis work?',
    a: 'Drop an address, pick a strategy. Dealsletter pulls listing data, runs it through the AI model tier you\'re on, and returns cap rate, CoC, 5-year ROI, rent comps, and a written narrative. Pro Max runs three frontier models in parallel for a consensus signal.',
  },
  {
    q: 'What is Deal Scout?',
    a: 'An autonomous agent that scans MLS and off-market data nightly against criteria you set. Deals that clear every filter are emailed to you by 6 AM. Scout is a Pro Max feature.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel in your account settings — no questions. You keep access until the end of your billing period.',
  },
  {
    q: 'Is my data private?',
    a: 'Analyses you run are private to your account. We do not sell or share individual user data.',
  },
]

function Cell({ value, pro }: { value: string; pro?: boolean }) {
  const isCheck = value === 'check'
  const isCross = value === 'x'
  if (isCheck) {
    return (
      <span style={{ display: 'inline-flex', color: 'var(--indigo-hover)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    )
  }
  if (isCross) {
    return <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>✗</span>
  }
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: pro ? 'var(--text)' : 'var(--text-secondary)',
      }}
    >
      {value}
    </span>
  )
}

function FAQItem({ q, a, initialOpen = false }: { q: string; a: string; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen)
  return (
    <div style={{ borderBottom: '1px solid var(--hairline)' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'transparent',
          border: 'none',
          padding: '22px 0',
          cursor: 'pointer',
          color: 'var(--text)',
          fontSize: 16,
          fontWeight: 500,
          textAlign: 'left',
        }}
      >
        <span>{q}</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            color: 'var(--text-muted)',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 180ms ease',
            lineHeight: 1,
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          style={{
            fontSize: 13.5,
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            padding: '0 0 22px',
            maxWidth: 820,
          }}
        >
          {a}
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  return (
    <>
      <section style={{ padding: '72px 40px 40px', maxWidth: 1440, margin: '0 auto' }}>
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
          — PRICING
        </span>
        <h1
          style={{
            fontSize: 54,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.02,
            margin: '14px 0 12px',
            color: 'var(--text)',
          }}
        >
          Pay for the models you run.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 640, lineHeight: 1.55, margin: '0 0 40px' }}>
          Free lets you try any address. Pro unlocks full results and unlimited analyses. Pro Max runs three frontier models in parallel and enables Deal Scout.
        </p>

        <PricingTiers />
      </section>

      <section style={{ padding: '40px 40px 60px', maxWidth: 1440, margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
              padding: '14px 20px',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              borderBottom: '1px solid var(--hairline)',
            }}
          >
            <span>Feature</span>
            <span style={{ textAlign: 'center' }}>Free</span>
            <span
              style={{
                textAlign: 'center',
                color: 'var(--indigo-hover)',
              }}
            >
              Pro
            </span>
            <span style={{ textAlign: 'center' }}>Pro Max</span>
          </div>
          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
                padding: '14px 20px',
                alignItems: 'center',
                borderBottom:
                  i === COMPARISON_ROWS.length - 1 ? 'none' : '1px solid var(--hairline)',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{row.label}</span>
              <span style={{ textAlign: 'center' }}>
                <Cell value={row.free} />
              </span>
              <span
                style={{
                  textAlign: 'center',
                  background: 'var(--indigo-dim)',
                  padding: '8px 0',
                  margin: '-14px 0',
                  minHeight: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cell value={row.pro} pro />
              </span>
              <span style={{ textAlign: 'center' }}>
                <Cell value={row.max} />
              </span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '40px 40px 120px', maxWidth: 1440, margin: '0 auto' }}>
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
          — FAQ
        </span>
        <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', margin: '12px 0 28px', color: 'var(--text)' }}>
          Common questions.
        </h2>
        <div style={{ borderTop: '1px solid var(--hairline)' }}>
          {FAQ.map((item, i) => (
            <FAQItem key={item.q} q={item.q} a={item.a} initialOpen={i === 0} />
          ))}
        </div>
      </section>
    </>
  )
}
