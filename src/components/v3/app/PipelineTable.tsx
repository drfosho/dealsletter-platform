'use client'

import { useState, useMemo } from 'react'
import SignalBadge from '@/components/v3/public/SignalBadge'
import type { Deal, PipelineStatus } from '@/data/v3-deals'

type SortKey = 'address' | 'strategy' | 'addedDate' | 'cap' | 'coc' | 'cashFlow' | 'signal' | 'status'
type SortDir = 'asc' | 'desc'

type Column = {
  key: SortKey
  label: string
}

const COLUMNS: Column[] = [
  { key: 'address', label: 'Address' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'addedDate', label: 'Added' },
  { key: 'cap', label: 'Cap' },
  { key: 'coc', label: 'CoC' },
  { key: 'cashFlow', label: 'CF/mo' },
  { key: 'signal', label: 'AI Signal' },
  { key: 'status', label: 'Status' },
]

const SIGNAL_ORDER: Record<string, number> = {
  'STRONG BUY': 5,
  HOT: 4,
  BUY: 3,
  WATCH: 2,
  CAUTION: 1,
}

function StatusBadge({ status }: { status: PipelineStatus }) {
  const map: Record<PipelineStatus, { bg: string; color: string }> = {
    Reviewing: { bg: 'rgba(99,102,241,0.1)', color: 'var(--indigo-hover)' },
    Saved: { bg: 'rgba(153,148,184,0.08)', color: 'var(--text-secondary)' },
    Watching: { bg: 'rgba(153,148,184,0.08)', color: 'var(--text-secondary)' },
    'Strong Buy': { bg: 'rgba(16,185,129,0.12)', color: '#34D399' },
    Passed: { bg: 'rgba(239,68,68,0.1)', color: '#F87171' },
  }
  const s = map[status]
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: 4,
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  )
}

export default function PipelineTable({
  deals,
  compact = false,
}: {
  deals: Deal[]
  compact?: boolean
}) {
  const [sortKey, setSortKey] = useState<SortKey>('addedDate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    const copy = [...deals]
    copy.sort((a, b) => {
      let av: number | string = 0
      let bv: number | string = 0
      switch (sortKey) {
        case 'address':
          av = a.address
          bv = b.address
          break
        case 'strategy':
          av = a.strategy
          bv = b.strategy
          break
        case 'addedDate':
          av = a.addedDate === 'Today' ? 9999 : Date.parse(`2026 ${a.addedDate}`)
          bv = b.addedDate === 'Today' ? 9999 : Date.parse(`2026 ${b.addedDate}`)
          break
        case 'cap':
          av = a.cap ?? -1
          bv = b.cap ?? -1
          break
        case 'coc':
          av = a.coc ?? -1
          bv = b.coc ?? -1
          break
        case 'cashFlow':
          av = a.cashFlow ?? -99999
          bv = b.cashFlow ?? -99999
          break
        case 'signal':
          av = SIGNAL_ORDER[a.signal]
          bv = SIGNAL_ORDER[b.signal]
          break
        case 'status':
          av = a.status
          bv = b.status
          break
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [deals, sortKey, sortDir])

  const onHeaderClick = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const gridTemplate = '22% 1fr 1fr 1fr 1fr 1fr 1fr 1fr'
  const rowPadding = compact ? '11px 20px' : '14px 20px'

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          padding: '12px 20px',
          borderBottom: '1px solid var(--hairline)',
          gap: 8,
        }}
      >
        {COLUMNS.map(col => {
          const active = sortKey === col.key
          return (
            <button
              key={col.key}
              type="button"
              onClick={() => onHeaderClick(col.key)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.12em',
                color: active ? 'var(--indigo-hover)' : 'var(--text-muted)',
                textTransform: 'uppercase',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: active ? 600 : 400,
              }}
            >
              {col.label}
              {active && <span>{sortDir === 'asc' ? '▴' : '▾'}</span>}
            </button>
          )
        })}
      </div>

      {sorted.map((deal, i) => (
        <div
          key={deal.id}
          style={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            padding: rowPadding,
            borderBottom: i === sorted.length - 1 ? 'none' : '1px solid var(--hairline)',
            gap: 8,
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'background 120ms ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.04)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
                color: 'var(--text)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {deal.address}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              {deal.city} {deal.state}
            </div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
            {deal.strategy}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
            {deal.addedDate}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>
            {deal.cap != null ? `${deal.cap.toFixed(1)}%` : '—'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>
            {deal.coc != null ? `${deal.coc.toFixed(1)}%` : '—'}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: deal.cashFlow != null && deal.cashFlow < 0 ? 'var(--red)' : 'var(--text)',
            }}
          >
            {deal.cashFlow != null ? `$${deal.cashFlow.toLocaleString()}` : deal.strategy === 'Fix & Flip' ? 'Flip' : '—'}
          </span>
          <span>
            <SignalBadge signal={deal.signal} />
          </span>
          <span>
            <StatusBadge status={deal.status} />
          </span>
        </div>
      ))}
    </div>
  )
}
