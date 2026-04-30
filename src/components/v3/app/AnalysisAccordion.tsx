'use client'

import { useState, ReactNode } from 'react'

export default function AnalysisAccordion({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [hover, setHover] = useState(false)
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hover ? 'var(--border-strong)' : 'var(--hairline)'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color 160ms ease',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          background: hover ? 'var(--elevated)' : 'transparent',
          border: 'none',
          padding: '16px 20px',
          cursor: 'pointer',
          color: 'var(--text)',
          textAlign: 'left',
          transition: 'background 160ms ease',
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{title}</div>
          {subtitle && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase' }}>
              {subtitle}
            </div>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            borderTop: '1px solid var(--hairline)',
            padding: '18px 20px',
          }}
        >
          {children}
        </div>
      )}
    </section>
  )
}
