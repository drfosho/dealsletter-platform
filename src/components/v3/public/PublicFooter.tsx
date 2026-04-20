import Link from 'next/link'

function Logomark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#v3-footer-grad)" />
      <path d="M7 12l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="v3-footer-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              style={{
                fontSize: 12.5,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 140ms ease',
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const PRODUCT = [
  { label: 'Scout', href: '/scout' },
  { label: 'Analyze', href: '/how-it-works' },
  { label: 'Markets', href: '/markets' },
  { label: 'Pipeline', href: '/v3/signup' },
]
const DATA = [
  { label: 'Coverage', href: '/markets' },
  { label: 'Methodology', href: '/how-it-works' },
  { label: 'API', href: '/pricing' },
]
const COMPANY = [
  { label: 'About', href: '/how-it-works' },
  { label: 'Changelog', href: '/' },
  { label: 'Contact', href: '/contact' },
]
const LEGAL = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Disclosures', href: '/terms' },
]

export default function PublicFooter() {
  const today = new Date().toISOString().slice(0, 10)
  return (
    <footer
      style={{
        borderTop: '1px solid var(--hairline)',
        padding: '48px 40px 32px',
        background: 'var(--bg)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: 28,
          maxWidth: 1440,
          margin: '0 auto',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Logomark />
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)' }}>
              Dealsletter
            </span>
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              maxWidth: 320,
              lineHeight: 1.55,
            }}
          >
            The terminal for real estate investors. AI-native underwriting across 48 metros.
          </div>
        </div>
        <FooterCol title="Product" items={PRODUCT} />
        <FooterCol title="Data" items={DATA} />
        <FooterCol title="Company" items={COMPANY} />
        <FooterCol title="Legal" items={LEGAL} />
      </div>

      <div
        style={{
          maxWidth: 1440,
          margin: '24px auto 0',
          borderTop: '1px solid var(--hairline)',
          paddingTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}
      >
        <span>© 2026 DEALSLETTER · BUILT ON CLAUDE OPUS, GPT-4O, GROK 3</span>
        <span>v3.0.0 · {today}</span>
      </div>
    </footer>
  )
}
