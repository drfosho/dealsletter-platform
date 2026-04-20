'use client'

import { useState, FormEvent } from 'react'
import ScoutTerminal from '@/components/v3/public/ScoutTerminal'

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

const STEPS = [
  {
    num: '01',
    tag: 'SET CRITERIA',
    title: 'Set criteria',
    body: 'Cap rate minimum, cash-on-cash, price ceiling, preferred metros, strategies. Takes 2 minutes.',
  },
  {
    num: '02',
    tag: 'NIGHTLY SCAN',
    title: 'Scout scans nightly',
    body: 'Every night at 04:00 PT, Scout ingests MLS listings, off-market data, and wholesale feeds across your selected metros.',
  },
  {
    num: '03',
    tag: 'FILTER',
    title: 'AI filters ruthlessly',
    body: 'Only deals clearing every single filter get scored. Roughly 3 per 2,800 listings ingested.',
  },
  {
    num: '04',
    tag: 'CONSENSUS',
    title: 'Three models review',
    body: 'Qualifying deals run through Claude Opus (Risk), GPT-4o (Sponsor), Grok 3 (Quant) for a consensus signal.',
  },
  {
    num: '05',
    tag: 'DELIVERED',
    title: 'Delivered by 6 AM',
    body: 'You wake up to a clean email with cap rate, CoC, cash flow, and a narrative. Click to open in the terminal.',
  },
]

function EmailCapture() {
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
      // silent
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: 4,
        background: 'var(--elevated)',
        border: '1px solid var(--border)',
        borderRadius: 999,
        maxWidth: 520,
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
  )
}

export default function ScoutPage() {
  return (
    <>
      <section style={{ position: 'relative', padding: '72px 40px 48px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={GRID_BG_STYLE} />
        <div style={{ position: 'relative', maxWidth: 820 }}>
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
              marginBottom: 22,
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
              SCOUT LIVE
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>Scanning 12 metros tonight</span>
          </span>

          <h1
            style={{
              fontSize: 60,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              margin: '0 0 18px',
              color: 'var(--text)',
            }}
          >
            Your autonomous deal sourcer.
          </h1>

          <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 28px', maxWidth: 640 }}>
            Set criteria once. Scout scans every night and delivers qualifying deals to your inbox by 6 AM.
          </p>
        </div>
      </section>

      <section style={{ padding: '0 40px 60px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 0 }}>
          {STEPS.map(step => (
            <div
              key={step.num}
              style={{
                display: 'contents',
              }}
            >
              <div
                style={{
                  borderBottom: '1px solid var(--hairline)',
                  padding: '28px 0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 42,
                  fontWeight: 700,
                  color: 'var(--indigo-hover)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {step.num}
              </div>
              <div
                style={{
                  borderBottom: '1px solid var(--hairline)',
                  padding: '28px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.14em',
                    color: 'var(--text-muted)',
                  }}
                >
                  {step.tag}
                </span>
                <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--text)' }}>
                  {step.title}
                </span>
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                    maxWidth: 720,
                  }}
                >
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 60px', maxWidth: 1440, margin: '0 auto' }}>
        <ScoutTerminal fullWidth />
      </section>

      <section style={{ padding: '0 40px 120px', maxWidth: 1440, margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '32px 36px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div>
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
              — Join the Scout waitlist
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '10px 0 0', color: 'var(--text)' }}>
              Be first to deploy Scout on your markets.
            </h2>
          </div>
          <EmailCapture />
        </div>
      </section>
    </>
  )
}
