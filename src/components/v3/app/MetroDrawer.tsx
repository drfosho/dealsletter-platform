'use client'

import { useEffect } from 'react'
import SignalBadge from '@/components/v3/public/SignalBadge'
import type { Metro } from '@/data/v3-metros'

function BigSparkline({ data, color }: { data: number[]; color: string }) {
  const w = 400
  const h = 80
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const points = data.map((v, i) => {
    const x = i * step
    const y = h - ((v - min) / range) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const line = points.join(' ')
  const area = `${points[0]} ${line} ${w},${h} 0,${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: h }}>
      <defs>
        <linearGradient id={`v3-drawer-spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#v3-drawer-spark-${color.replace('#', '')})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function commentary(metro: Metro): string {
  const strong = metro.cap >= 10
  const compressed = metro.cap < 6.5
  const inventoryFast = metro.dom < 25
  const rising = metro.yoy > 0

  const health = compressed
    ? 'have compressed below 6%'
    : strong
      ? 'remain institutional-grade'
      : 'sit in a balanced range'
  const yoyDir = rising ? 'expansion' : 'decline'
  const inventory = inventoryFast ? 'turning quickly' : 'sitting longer than average'
  const flagged = metro.signal === 'STRONG BUY' ? 4 : metro.signal === 'HOT' ? 3 : metro.signal === 'BUY' ? 2 : 1

  return `${metro.metro} is showing ${strong ? 'continued strength' : 'mixed signals'} across rentals with ${Math.abs(metro.yoy).toFixed(1)}% YoY ${yoyDir}. Cap rates ${health}, and inventory is ${inventory}. Scout flagged ${flagged} deals here in the last 30 days.`
}

function DrawerMetric({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
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
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default function MetroDrawer({
  metro,
  onClose,
}: {
  metro: Metro | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!metro) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [metro, onClose])

  if (!metro) return null

  const sparkColor = metro.yoy >= 0 ? '#10B981' : '#EF4444'
  const yoyColor = metro.yoy >= 0 ? '#34D399' : '#F87171'
  const yoySign = metro.yoy >= 0 ? '+' : ''
  const inventory = metro.dom < 22 ? 'Tight' : metro.dom < 30 ? 'Balanced' : 'Building'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />
      <aside
        style={{
          position: 'relative',
          width: 480,
          maxWidth: '100%',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border-strong)',
          padding: 28,
          overflowY: 'auto',
          color: 'var(--text)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="app-btn-ghost"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            padding: '4px 10px',
            fontSize: 12,
          }}
        >
          ✕
        </button>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}
        >
          {metro.state}
        </div>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '6px 0 14px',
            color: 'var(--text)',
          }}
        >
          {metro.metro}
        </h2>
        <SignalBadge signal={metro.signal} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 14,
            marginTop: 22,
          }}
        >
          <DrawerMetric label="Cap · median" value={`${metro.cap.toFixed(1)}%`} color="var(--indigo-hover)" />
          <DrawerMetric label="CoC · median" value={`${metro.coc.toFixed(1)}%`} />
          <DrawerMetric label="YoY price" value={`${yoySign}${metro.yoy.toFixed(1)}%`} color={yoyColor} />
          <DrawerMetric label="Days on market" value={`${metro.dom}d`} />
          <DrawerMetric label="Median list" value={`$${metro.price}K`} />
          <DrawerMetric label="Inventory" value={inventory} />
        </div>

        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--hairline)',
            borderRadius: 10,
            padding: 18,
            marginTop: 22,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Cap rate · 12M trend
          </div>
          <BigSparkline data={metro.spark} color={sparkColor} />
        </div>

        <div
          style={{
            marginTop: 22,
            padding: 16,
            background: 'var(--bg)',
            borderLeft: '2px solid var(--indigo)',
            borderRadius: 4,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              color: 'var(--indigo-hover)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            AI Commentary
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {commentary(metro)}
          </p>
        </div>
      </aside>
    </div>
  )
}
