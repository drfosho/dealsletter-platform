'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SignalBadge from '@/components/v3/public/SignalBadge'
import type { Deal, PipelineStatus } from '@/data/v3-deals'

type Column = {
  key: string
  name: string
  accent: string
  status: PipelineStatus
  match: (d: Deal) => boolean
}

const STATUS_OPTIONS: PipelineStatus[] = ['Watching', 'Reviewing', 'Strong Buy', 'Passed']

const COLUMNS: Column[] = [
  {
    key: 'watching',
    name: 'Watching',
    accent: 'var(--text-secondary)',
    status: 'Watching',
    match: d => d.status === 'Watching' || d.status === 'Saved',
  },
  {
    key: 'reviewing',
    name: 'Reviewing',
    accent: 'var(--indigo-hover)',
    status: 'Reviewing',
    match: d => d.status === 'Reviewing',
  },
  {
    key: 'strong-buy',
    name: 'Strong Buy',
    accent: '#34D399',
    status: 'Strong Buy',
    match: d => d.status === 'Strong Buy',
  },
  {
    key: 'passed',
    name: 'Passed',
    accent: '#F87171',
    status: 'Passed',
    match: d => d.status === 'Passed',
  },
]

function statusBadgeColors(status: PipelineStatus): { bg: string; color: string } {
  if (status === 'Strong Buy') return { bg: 'rgba(16,185,129,0.12)', color: '#34D399' }
  if (status === 'Reviewing') return { bg: 'rgba(99,102,241,0.14)', color: 'var(--indigo-hover)' }
  if (status === 'Passed') return { bg: 'rgba(239,68,68,0.12)', color: '#F87171' }
  return { bg: 'rgba(153,148,184,0.08)', color: 'var(--text-secondary)' }
}

function KanbanCard({
  deal,
  onStatusChange,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  deal: Deal
  onStatusChange?: (dealId: string, status: PipelineStatus) => void
  isDragging?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const cap = deal.cap != null ? `${deal.cap.toFixed(1)}%` : '—'
  const coc = deal.coc != null ? `${deal.coc.toFixed(1)}%` : '—'
  const cf = deal.cashFlow != null ? `$${deal.cashFlow}` : '—'
  const cfColor = deal.cashFlow != null && deal.cashFlow < 0 ? 'var(--red)' : 'var(--text)'
  const statusBadge = statusBadgeColors(deal.status)

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', deal.id)
        onDragStart?.()
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={() => router.push('/v3/analyze')}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          router.push('/v3/analyze')
        }
      }}
      style={{
        position: 'relative',
        background: 'var(--bg)',
        border: '1px solid var(--hairline)',
        borderRadius: 8,
        padding: 12,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.4 : 1,
        transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, opacity 120ms ease',
      }}
      onMouseEnter={e => {
        if (isDragging) return
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.borderColor = 'var(--border-strong)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--hairline)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: statusBadge.color,
            background: statusBadge.bg,
            borderRadius: 4,
            padding: '2px 7px',
          }}
        >
          {deal.status}
        </span>
        <SignalBadge signal={deal.signal} />
        {onStatusChange && (
          <button
            type="button"
            aria-label="Change status"
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(v => !v)
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0 4px',
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ⋯
          </button>
        )}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text)',
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.06em',
            color: 'var(--indigo-hover)',
            background: 'var(--indigo-dim)',
            border: '1px solid var(--border-strong)',
            borderRadius: 999,
            padding: '2px 7px',
          }}
        >
          {deal.strategy}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          borderTop: '1px solid var(--hairline)',
          marginTop: 10,
          paddingTop: 10,
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            CAP
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
            {cap}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            CoC
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
            {coc}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            CF
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: cfColor }}>
            {cf}
          </div>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 8 }}>
        Added {deal.addedDate}
      </div>

      {menuOpen && onStatusChange && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 34,
            right: 8,
            background: 'var(--elevated)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            padding: 4,
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 132,
          }}
        >
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onStatusChange(deal.id, s)
                setMenuOpen(false)
              }}
              disabled={s === deal.status}
              style={{
                background: s === deal.status ? 'var(--indigo-dim)' : 'transparent',
                color: s === deal.status ? 'var(--indigo-hover)' : 'var(--text)',
                border: 'none',
                textAlign: 'left',
                padding: '7px 10px',
                borderRadius: 6,
                cursor: s === deal.status ? 'default' : 'pointer',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function KanbanBoard({
  deals,
  onStatusChange,
}: {
  deals: Deal[]
  onStatusChange?: (dealId: string, status: PipelineStatus) => void
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<PipelineStatus | null>(null)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {COLUMNS.map(col => {
        const items = deals.filter(col.match)
        const over = dragOverColumn === col.status
        return (
          <div
            key={col.key}
            onDragOver={e => {
              if (!draggingId) return
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              if (dragOverColumn !== col.status) setDragOverColumn(col.status)
            }}
            onDragLeave={e => {
              const next = e.relatedTarget as Node | null
              if (next && e.currentTarget.contains(next)) return
              setDragOverColumn(prev => (prev === col.status ? null : prev))
            }}
            onDrop={e => {
              e.preventDefault()
              const dropId = draggingId || e.dataTransfer.getData('text/plain') || null
              if (dropId && onStatusChange) {
                const dragged = deals.find(d => d.id === dropId)
                if (!dragged || dragged.status !== col.status) {
                  onStatusChange(dropId, col.status)
                }
              }
              setDraggingId(null)
              setDragOverColumn(null)
            }}
            style={{
              background: over ? 'var(--indigo-dim)' : 'var(--surface)',
              border: `1px solid ${over ? 'var(--border-strong)' : 'var(--hairline)'}`,
              borderRadius: 10,
              padding: 14,
              minHeight: 500,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              transition: 'background 150ms ease, border-color 150ms ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
                paddingBottom: 10,
                borderBottom: `1px solid ${col.accent}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: col.accent,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text)',
                    fontWeight: 500,
                  }}
                >
                  {col.name}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                {items.length}
              </span>
            </div>

            {items.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed var(--hairline)',
                  borderRadius: 6,
                  padding: 14,
                  fontSize: 11,
                  color: 'var(--text-muted)',
                }}
              >
                Empty
              </div>
            ) : (
              items.map(deal => (
                <KanbanCard
                  key={deal.id}
                  deal={deal}
                  onStatusChange={onStatusChange}
                  isDragging={draggingId === deal.id}
                  onDragStart={() => setDraggingId(deal.id)}
                  onDragEnd={() => {
                    setDraggingId(null)
                    setDragOverColumn(null)
                  }}
                />
              ))
            )}
          </div>
        )
      })}
    </div>
  )
}
