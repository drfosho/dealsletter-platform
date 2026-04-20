'use client'

import { usePathname } from 'next/navigation'

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/v3/dashboard': { title: 'Deal Scout', subtitle: 'OVERNIGHT · 3 NEW MATCHES' },
  '/v3/analyze': { title: 'Run Analysis', subtitle: 'MULTI-MODEL UNDERWRITING' },
  '/v3/pipeline': { title: 'Saved Deals', subtitle: 'PIPELINE · 7 TRACKED' },
  '/v3/markets': { title: 'Market Intel', subtitle: '48 METROS · LIVE' },
  '/v3/deal-desk': { title: 'Deal Desk', subtitle: 'NEWSLETTER + RESOURCES' },
}

function metaFor(pathname: string): { title: string; subtitle: string } {
  if (PAGE_META[pathname]) return PAGE_META[pathname]
  const match = Object.keys(PAGE_META).find(k => pathname.startsWith(k + '/'))
  if (match) return PAGE_META[match]
  return { title: '', subtitle: '' }
}

export default function Topbar() {
  const pathname = usePathname() || ''
  const { title, subtitle } = metaFor(pathname)

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: 56,
        minHeight: 56,
        background: 'rgba(8, 8, 16, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--v3-hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        fontFamily: 'var(--v3-font-sans)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--v3-text)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: 'var(--v3-font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              color: 'var(--v3-text-muted)',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          aria-label="Notifications"
          style={{
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: '1px solid var(--v3-hairline)',
            borderRadius: 8,
            cursor: 'pointer',
            color: 'var(--v3-text-secondary)',
            padding: 0,
            transition: 'color 120ms ease, background 120ms ease, border-color 120ms ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--v3-text)'
            e.currentTarget.style.background = 'var(--v3-elevated)'
            e.currentTarget.style.borderColor = 'var(--v3-border)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--v3-text-secondary)'
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'var(--v3-hairline)'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>
    </header>
  )
}
