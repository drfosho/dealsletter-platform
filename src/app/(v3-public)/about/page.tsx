import Link from 'next/link'

export const metadata = {
  title: 'About | Dealsletter',
  description:
    'Dealsletter was built by Kevin Godbey, a solo founder, EMT, and real estate investor, to give individual investors institutional-grade underwriting tools.',
}

const BIO_TAGS = [
  'EMT · Field Training Officer',
  'Active RE Investor',
  'Self-taught developer',
  'BRRRR · Fix & Flip · Buy & Hold',
]

const STATS = [
  { value: '2,200+', label: 'Newsletter subscribers' },
  { value: '150+', label: 'Issues published' },
  { value: '4', label: 'Years investing' },
  { value: '48', label: 'Metros covered' },
]

const TIMELINE = [
  {
    year: '2023',
    title: 'Newsletter launch',
    body: 'Started publishing weekly real estate deal breakdowns. First issue covered a Kansas City BRRRR. Grew to 2,200 subscribers across 150+ issues.',
  },
  {
    year: '2024',
    title: 'Platform V1',
    body: 'Built the first web app — address input, RentCast data pull, AI analysis. Solo-coded during night shifts.',
  },
  {
    year: 'Early 2025',
    title: 'V2 launch',
    body: 'Full SaaS rebuild: Pro and Pro Max tiers, multi-model AI (Claude + GPT + Grok), strategy-specific underwriting models, Stripe billing.',
  },
  {
    year: '2026',
    title: 'V3 — The Terminal',
    body: 'Complete redesign. Deal Scout autonomous agent, 48-metro market intelligence, saved deals pipeline, and the Bloomberg-style interface it was always meant to be.',
  },
]

function SectionLabel({ children, color }: { children: string; color?: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.14em',
        color: color || 'var(--indigo-hover)',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  )
}

export default function V3AboutPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px 120px' }}>
      <section>
        <SectionLabel>— ABOUT</SectionLabel>
        <h1
          style={{
            fontSize: 54,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text)',
            margin: '14px 0 16px',
            lineHeight: 1.05,
            maxWidth: 820,
          }}
        >
          Built by an investor, for investors.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0, maxWidth: 600 }}>
          Dealsletter started as a newsletter in 2023. It became a platform because I got tired of running the same spreadsheets over and over on deals that didn&apos;t pan out.
        </p>
      </section>

      <section
        style={{
          marginTop: 64,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 32,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            K
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', marginTop: 16, letterSpacing: '-0.01em' }}>
            Kevin Godbey
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              color: 'var(--indigo-hover)',
              marginTop: 6,
              textTransform: 'uppercase',
            }}
          >
            Founder · @KdogBuilds
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {BIO_TAGS.map(tag => (
              <span
                key={tag}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  color: 'var(--text-secondary)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                  padding: '4px 10px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          <p style={{ margin: '0 0 16px' }}>
            I&apos;m Kevin. I&apos;m an EMT and Field Training Officer at AMR by day, a real estate investor, and the solo developer behind Dealsletter.
          </p>
          <p style={{ margin: '0 0 16px' }}>
            I built this during night shifts because the tools I needed didn&apos;t exist. Running a BRRRR deal analysis used to mean an hour in Excel. Now it takes 27 seconds.
          </p>
          <p style={{ margin: 0 }}>
            Dealsletter started as a newsletter in 2023 — 150+ issues, 2,200 subscribers, covering deals in Kansas City, Memphis, Indianapolis, Tampa, and more. V2 added the AI analysis layer. V3 is the terminal I wish I&apos;d had from the start.
          </p>
        </div>
      </section>

      <section
        style={{
          marginTop: 64,
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 12,
          padding: 28,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
        }}
      >
        {STATS.map(s => (
          <div key={s.label}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginTop: 6,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </section>

      <section
        style={{
          marginTop: 64,
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 14,
          padding: '44px 44px 44px 60px',
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
        <SectionLabel color="var(--blue)">— THE MISSION</SectionLabel>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            lineHeight: 1.15,
            margin: '14px 0 0',
          }}
        >
          Serious underwriting tools, without the institutional price tag.
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65, margin: '16px 0 0', maxWidth: 680 }}>
          Institutional investors have Bloomberg terminals and underwriting teams. Individual investors have Excel and gut instinct. Dealsletter is the middle ground — frontier AI models running real underwriting logic on real market data, available to any investor at any scale.
        </p>
      </section>

      <section style={{ marginTop: 64 }}>
        <div style={{ marginBottom: 28 }}>
          <SectionLabel>— TIMELINE</SectionLabel>
        </div>
        <div
          style={{
            borderLeft: '2px solid var(--hairline)',
            paddingLeft: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {TIMELINE.map(ev => (
            <div key={ev.year} style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: -35,
                  top: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--indigo)',
                  border: '2px solid var(--bg)',
                }}
              />
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: 'var(--indigo-hover)',
                  textTransform: 'uppercase',
                }}
              >
                {ev.year}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>
                {ev.title}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '6px 0 0', maxWidth: 720 }}>
                {ev.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 64, textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          Ready to run your first analysis?
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 8 }}>
          Free. No credit card. 27 seconds.
        </div>
        <Link
          href="/v3/signup"
          className="app-btn"
          style={{ display: 'inline-flex', padding: '12px 28px', fontSize: 15, marginTop: 24 }}
        >
          Start free →
        </Link>
      </section>
    </div>
  )
}
