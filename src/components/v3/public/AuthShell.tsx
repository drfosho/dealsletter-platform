'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

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

function Logomark() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#v3-auth-grad)" />
      <path d="M7 12l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="v3-auth-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}
    >
      <div style={GRID_BG_STYLE} />
      <div
        style={{
          position: 'relative',
          width: 400,
          maxWidth: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 14,
          padding: 36,
          boxShadow: '0 40px 80px -20px rgba(99,102,241,0.2)',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <Logomark />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.14em',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '2px 8px',
            }}
          >
            V3 · TERMINAL
          </span>
        </Link>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--text)',
            margin: '20px 0 0',
            textAlign: 'center',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            margin: '8px 0 0',
            textAlign: 'center',
          }}
        >
          {subtitle}
        </p>

        <div style={{ marginTop: 28 }}>{children}</div>

        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: '1px solid var(--hairline)',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  )
}

export const authInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--elevated)',
  border: '1px solid var(--hairline)',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 13,
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  transition: 'border-color 140ms ease',
}

export const authLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.1em',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

export function GoogleButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="app-btn-ghost"
      style={{
        width: '100%',
        justifyContent: 'center',
        gap: 10,
        padding: '11px 16px',
        fontSize: 13,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z" fill="#34A853" />
        <path d="M5.85 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.44 1.18 4.95l3.67-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.67 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335" />
      </svg>
      {label}
    </button>
  )
}

export function AuthDivider() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '20px 0',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.14em',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
      or
      <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
    </div>
  )
}
