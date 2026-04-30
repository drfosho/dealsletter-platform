'use client'

import { useRouter } from 'next/navigation'
import SignalBadge from '@/components/v3/public/SignalBadge'
import type { Deal } from '@/data/v3-deals'

function fmtMoney(n: number, k = true): string {
  if (!k) return `$${n.toLocaleString()}`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

function Sparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
    </svg>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 20,
          fontWeight: 600,
          color: color || 'var(--text)',
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default function DealCard({ deal }: { deal: Deal }) {
  const router = useRouter()
  const cap = deal.cap !== null ? `${deal.cap.toFixed(1)}%` : '—'
  const coc = deal.coc !== null ? `${deal.coc.toFixed(1)}%` : '—'
  const cfValue = deal.cashFlow !== null ? `$${deal.cashFlow.toLocaleString()}` : '—'
  const cfColor = deal.cashFlow !== null && deal.cashFlow < 0 ? 'var(--red)' : 'var(--text)'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/v3/analyze?address=${encodeURIComponent(deal.address)}`)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          router.push(`/v3/analyze?address=${encodeURIComponent(deal.address)}`)
        }
      }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 12,
        padding: 18,
        cursor: 'pointer',
        transition: 'transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'var(--border-strong)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--hairline)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, #6366F1, transparent)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text)',
              letterSpacing: '-0.01em',
            }}
          >
            {deal.address}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {deal.city} {deal.state}
          </div>
        </div>
        <SignalBadge signal={deal.signal} />
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
        <span
          style={{
            background: 'var(--indigo-dim)',
            color: 'var(--indigo-hover)',
            border: '1px solid var(--border-strong)',
            borderRadius: 999,
            padding: '3px 9px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em',
          }}
        >
          {deal.strategy}
        </span>
        <span
          style={{
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: '3px 9px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
          }}
        >
          {deal.beds}bd · {deal.baths}ba · {deal.sqft.toLocaleString()}sf
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginTop: 18,
          padding: '14px 0',
          borderTop: '1px solid var(--hairline)',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <Metric label="Cap rate" value={cap} color="var(--indigo-hover)" />
        <Metric label="Cash-on-cash" value={coc} />
        <Metric label="CF / mo" value={cfValue} color={cfColor} />
      </div>

      {deal.scoutReason && (
        <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'flex-start' }}>
          <Sparkle />
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {deal.scoutReason}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
            LIST <span style={{ color: 'var(--text)', fontWeight: 500 }}>{fmtMoney(deal.price)}</span>
          </span>
          {deal.arv != null && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
              ARV <span style={{ color: '#34D399', fontWeight: 500 }}>{fmtMoney(deal.arv)}</span>
            </span>
          )}
        </div>
        <button
          type="button"
          className="app-btn-ghost"
          style={{ padding: '6px 12px', fontSize: 12 }}
          onClick={e => {
            e.stopPropagation()
            router.push(`/v3/analyze?address=${encodeURIComponent(deal.address)}`)
          }}
        >
          Open →
        </button>
      </div>
    </div>
  )
}
