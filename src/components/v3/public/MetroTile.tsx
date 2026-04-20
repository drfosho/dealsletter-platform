'use client'

import type { Metro } from '@/data/v3-metros'
import SignalBadge from './SignalBadge'

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 72
  const h = 24
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const points = data
    .map((v, i) => {
      const x = i * step
      const y = h - ((v - min) / range) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function MetroTile({ metro }: { metro: Metro }) {
  const sparkColor = metro.yoy >= 0 ? '#10B981' : '#EF4444'
  const yoyColor = metro.yoy >= 0 ? '#34D399' : '#F87171'
  const yoySign = metro.yoy >= 0 ? '+' : ''

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        padding: 14,
        transition: 'transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
        cursor: 'default',
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap' }}>
            {metro.metro}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            {metro.state}
          </span>
        </div>
        <SignalBadge signal={metro.signal} />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--text)',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            {metro.cap.toFixed(1)}%
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Cap rate
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <Sparkline data={metro.spark} color={sparkColor} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: yoyColor }}>
            {yoySign}
            {metro.yoy.toFixed(1)}% YoY
          </span>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--hairline)',
          paddingTop: 10,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-secondary)',
        }}
      >
        <span>${metro.price}K median</span>
        <span>{metro.dom}d DOM</span>
      </div>
    </div>
  )
}
