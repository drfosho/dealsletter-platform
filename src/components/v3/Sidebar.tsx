'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type NavItem = {
  label: string
  href: string
}

const NAV: NavItem[] = [
  { label: 'Deal Scout', href: '/v3/dashboard' },
  { label: 'Run Analysis', href: '/v3/analyze' },
  { label: 'Saved Deals', href: '/v3/pipeline' },
  { label: 'Market Intel', href: '/v3/markets' },
  { label: 'Deal Desk', href: '/v3/deal-desk' },
]

function initialsFor(email: string | null | undefined): string {
  if (!email) return 'DL'
  const name = email.split('@')[0]
  const parts = name.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function nameFor(email: string | null | undefined): string {
  if (!email) return 'Operator'
  return email.split('@')[0]
}

export default function Sidebar({
  email,
  tier,
}: {
  email: string | null
  tier: string
}) {
  const pathname = usePathname() || ''
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const [scanTime, setScanTime] = useState('')
  useEffect(() => {
    const d = new Date()
    const hh = d.getHours().toString().padStart(2, '0')
    const mm = d.getMinutes().toString().padStart(2, '0')
    setScanTime(`${hh}:${mm} PT`)
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/v2/login')
  }

  return (
    <aside
      style={{
        width: 228,
        minWidth: 228,
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100vh',
        background: 'var(--v3-surface)',
        borderRight: '1px solid var(--v3-hairline)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px 16px',
        fontFamily: 'var(--v3-font-sans)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '2px 6px 24px' }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--v3-text)',
            lineHeight: 1,
          }}
        >
          Dealsletter
        </div>
        <div
          style={{
            marginTop: 6,
            fontFamily: 'var(--v3-font-mono)',
            fontSize: 10,
            letterSpacing: '0.12em',
            color: 'var(--v3-text-muted)',
            textTransform: 'uppercase',
          }}
        >
          V3 · Terminal
        </div>
      </div>

      {/* Section label */}
      <div
        style={{
          padding: '0 8px 10px',
          fontFamily: 'var(--v3-font-mono)',
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'var(--v3-text-muted)',
          textTransform: 'uppercase',
        }}
      >
        Navigate
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                position: 'relative',
                display: 'block',
                padding: '9px 12px',
                borderRadius: 6,
                fontSize: 13.5,
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--v3-text)' : 'var(--v3-text-secondary)',
                background: active ? 'var(--v3-elevated)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 120ms ease, color 120ms ease',
              }}
            >
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 6,
                    bottom: 6,
                    width: 2,
                    background: 'var(--v3-indigo)',
                    borderRadius: 2,
                  }}
                />
              )}
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Scout Live widget */}
      <div
        style={{
          background: 'var(--v3-elevated)',
          border: '1px solid var(--v3-hairline)',
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--v3-blue)',
              boxShadow: '0 0 8px rgba(59,130,246,0.6)',
              animation: 'v3-pulse 1.8s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--v3-font-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'var(--v3-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            Scout Live
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--v3-font-mono)',
            fontSize: 10.5,
            lineHeight: 1.5,
            color: 'var(--v3-text-muted)',
          }}
        >
          Last scan {scanTime || '04:12 PT'} · 12 metros · 3 matches
        </div>
      </div>

      {/* User row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 6px 0',
          borderTop: '1px solid var(--v3-hairline)',
          paddingTop: 12,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}
        >
          {initialsFor(email)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 12.5,
              color: 'var(--v3-text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {nameFor(email)}
          </div>
          <div
            style={{
              fontFamily: 'var(--v3-font-mono)',
              fontSize: 9.5,
              letterSpacing: '0.1em',
              color: 'var(--v3-indigo-hover)',
              textTransform: 'uppercase',
              marginTop: 1,
            }}
          >
            {tier}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          title="Sign out"
          aria-label="Sign out"
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 6,
            cursor: signingOut ? 'wait' : 'pointer',
            color: 'var(--v3-text-muted)',
            padding: 0,
            transition: 'color 120ms ease, background 120ms ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--v3-text-secondary)'
            e.currentTarget.style.background = 'var(--v3-elevated)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--v3-text-muted)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
