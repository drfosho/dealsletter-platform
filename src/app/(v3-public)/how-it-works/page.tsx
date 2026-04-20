import Link from 'next/link'

const STEPS = [
  {
    num: '01',
    tag: 'INGEST',
    title: 'Drop an address',
    body: 'Paste any US address into the terminal. Dealsletter pulls public record, tax, flood, MLS, and off-market data within seconds.',
  },
  {
    num: '02',
    tag: 'STRATEGY',
    title: 'Pick a strategy',
    body: 'Choose BRRRR, Fix & Flip, Buy & Hold, or House Hack. Each runs a different underwriting model with strategy-specific assumptions.',
  },
  {
    num: '03',
    tag: 'AI UNDERWRITE',
    title: 'Models review in parallel',
    body: 'On Pro Max, Claude Opus, GPT-4o, and Grok 3 each review the deal independently — Risk Analyst, Deal Sponsor, Quant Model — and return a consensus signal.',
  },
  {
    num: '04',
    tag: 'DECISION',
    title: 'Decision in 27 seconds',
    body: 'You get cap rate, cash-on-cash, 5-year ROI, a written narrative, stress tests, comps, and an offer recommendation.',
  },
  {
    num: '05',
    tag: 'AUTONOMOUS',
    title: 'Scout keeps watching',
    body: 'Set criteria once. Scout scans MLS + off-market every night and surfaces only deals that clear every filter. Delivered to your inbox by 6 AM.',
  },
]

const MODEL_STACK = [
  {
    label: 'SPEED · FREE',
    name: 'GPT-4o-mini',
    timing: '1 model · <8s',
  },
  {
    label: 'BALANCED · PRO',
    name: 'Claude Sonnet + GPT-4.1',
    timing: '2 models · ~18s',
  },
  {
    label: 'MAX IQ · PRO MAX',
    name: 'Opus + GPT-4o + Grok 3',
    timing: '3 models · ~27s',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <section style={{ padding: '72px 40px 48px', maxWidth: 1440, margin: '0 auto' }}>
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
          — PLAYBOOK
        </span>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.02,
            margin: '14px 0 18px',
            color: 'var(--text)',
            maxWidth: 960,
          }}
        >
          From address to{' '}
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'var(--indigo-hover)',
            }}
          >
            offer recommendation
          </span>{' '}
          in 27 seconds.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, maxWidth: 680 }}>
          Dealsletter V3 is an investment terminal, not a one-shot calculator. Here&apos;s what happens end-to-end.
        </p>
      </section>

      <section style={{ padding: '0 40px 60px', maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr' }}>
          {STEPS.map(step => (
            <div key={step.num} style={{ display: 'contents' }}>
              <div
                style={{
                  borderBottom: '1px solid var(--hairline)',
                  padding: '32px 0',
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
                  padding: '32px 0',
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
                    maxWidth: 520,
                  }}
                >
                  {step.body}
                </p>
              </div>
              <div
                style={{
                  borderBottom: '1px solid var(--hairline)',
                  padding: '32px 0 32px 32px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: 320,
                    height: 88,
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {step.tag}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 60px', maxWidth: 1440, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--indigo-hover)',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          — THE MODELS
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', margin: '10px 0 20px', color: 'var(--text)' }}>
          Pay for the IQ. Not for the API calls.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {MODEL_STACK.map(m => (
            <div
              key={m.label}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--hairline)',
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  color: 'var(--indigo-hover)',
                  marginBottom: 8,
                }}
              >
                {m.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                {m.name}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
                {m.timing}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 120px', maxWidth: 1440, margin: '0 auto', textAlign: 'center' }}>
        <Link
          href="/v3/signup"
          className="app-btn"
          style={{ padding: '12px 22px', fontSize: 14, display: 'inline-flex' }}
        >
          Run your first analysis →
        </Link>
      </section>
    </>
  )
}
