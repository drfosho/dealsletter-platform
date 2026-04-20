'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { label: 'Product', href: '/' },
  { label: 'Markets', href: '/markets' },
  { label: 'Scout', href: '/scout' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How it works', href: '/how-it-works' },
]

function Logomark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#v3-logo-grad)" />
      <path d="M7 12l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="v3-logo-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function PublicNav() {
  const pathname = usePathname() || '/'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        height: 64,
        background: 'rgba(8, 8, 16, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          color: 'var(--text)',
        }}
      >
        <Logomark />
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Dealsletter</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '2px 6px',
            letterSpacing: '0.08em',
          }}
        >
          V3
        </span>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {LINKS.map(link => {
          const active =
            link.href === '/'
              ? pathname === '/'
              : pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                position: 'relative',
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--text)' : 'var(--text-secondary)',
                textDecoration: 'none',
                paddingBottom: 4,
                borderBottom: active ? '2px solid var(--indigo)' : '2px solid transparent',
                transition: 'color 140ms ease, border-color 140ms ease',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/login" className="app-btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }}>
          Sign in
        </Link>
        <Link href="/signup" className="app-btn" style={{ padding: '7px 14px', fontSize: 13 }}>
          Start free
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </header>
  )
}
