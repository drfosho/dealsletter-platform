import type { ReactNode } from 'react'

export type LegalSection = {
  heading: string
  body: ReactNode
}

export default function LegalPage({
  title,
  lastUpdated,
  sections,
}: {
  title: string
  lastUpdated: string
  sections: LegalSection[]
}) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px 40px 120px' }}>
      <div style={{ marginBottom: 20 }}>
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
          — LEGAL
        </span>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text)',
            margin: '14px 0 8px',
            lineHeight: 1.05,
          }}
        >
          {title}
        </h1>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
          }}
        >
          Last updated: {lastUpdated}
        </div>
      </div>

      <div>
        {sections.map((s, i) => (
          <section
            key={s.heading}
            style={{
              borderTop: i === 0 ? 'none' : '1px solid var(--hairline)',
              padding: '32px 0',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
              {s.heading}
            </h2>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
