import Link from 'next/link'

type Tier = {
  name: string
  price: string
  period: string
  label: string
  models: string
  description: string
  features: string[]
  cta: string
  ctaHref: string
  highlight?: boolean
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    label: 'SPEED',
    models: 'GPT-4o-mini',
    description: 'Run analyses on any address. Results blurred — upgrade to unlock.',
    features: ['1 model', 'Blurred results', 'Public listings only', '5 saves / mo'],
    cta: 'Start free →',
    ctaHref: '/signup',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    label: 'BALANCED',
    models: 'Claude Sonnet + GPT-4.1',
    description: 'Full results, unlimited analyses, strategy-switching, saved pipeline.',
    features: ['2 models in parallel', 'Unlimited analyses', 'Full PDF export', 'Saved pipeline'],
    cta: 'Go Pro →',
    ctaHref: '/signup',
    highlight: true,
  },
  {
    name: 'Pro Max',
    price: '$79',
    period: '/mo',
    label: 'MAX IQ',
    models: 'Claude Opus + GPT-4o + Grok 3',
    description: 'Multi-model comparison, Deal Scout, Markets drilldown, API access.',
    features: [
      '3 frontier models',
      'Deal Scout (autonomous)',
      'Multi-model comparison',
      'Markets Intel · 48 metros',
      'API + webhooks',
    ],
    cta: 'Unlock Max IQ →',
    ctaHref: '/signup',
  },
]

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function PricingTiers() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 18,
        alignItems: 'stretch',
      }}
    >
      {TIERS.map(tier => {
        const highlight = !!tier.highlight
        return (
          <div
            key={tier.name}
            style={{
              position: 'relative',
              background: highlight ? 'var(--elevated)' : 'var(--surface)',
              border: `1px solid ${highlight ? 'var(--border-strong)' : 'var(--hairline)'}`,
              borderRadius: 12,
              padding: '26px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            {highlight && (
              <span
                style={{
                  position: 'absolute',
                  top: -10,
                  left: 24,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  fontWeight: 600,
                  color: '#fff',
                  background: 'var(--indigo)',
                  borderRadius: 4,
                  padding: '3px 8px',
                }}
              >
                MOST POPULAR
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{tier.name}</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: 'var(--indigo-hover)',
                }}
              >
                {tier.label}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 44,
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: 'var(--text)',
                  lineHeight: 1,
                }}
              >
                {tier.price}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-muted)' }}>
                {tier.period}
              </span>
            </div>

            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--hairline)',
                borderRadius: 6,
                padding: '10px 12px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  color: 'var(--text-muted)',
                  marginBottom: 4,
                }}
              >
                MODELS
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}>
                {tier.models}
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {tier.description}
            </p>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                borderTop: '1px solid var(--hairline)',
                paddingTop: 18,
                flex: 1,
              }}
            >
              {tier.features.map(f => (
                <li key={f} style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.ctaHref}
              className={highlight ? 'app-btn' : 'app-btn-ghost'}
              style={{ width: '100%', justifyContent: 'center', padding: '11px 16px' }}
            >
              {tier.cta}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
