'use client'

import SignalBadge from '@/components/v3/public/SignalBadge'
import type { Deal } from '@/data/v3-deals'

type Column = {
  key: string
  name: string
  accent: string
  match: (d: Deal) => boolean
}

const COLUMNS: Column[] = [
  {
    key: 'watching',
    name: 'Watching',
    accent: 'var(--text-secondary)',
    match: d => d.status === 'Watching' || d.status === 'Saved',
  },
  {
    key: 'reviewing',
    name: 'Reviewing',
    accent: 'var(--indigo-hover)',
    match: d => d.status === 'Reviewing',
  },
  {
    key: 'strong-buy',
    name: 'Strong Buy',
    accent: '#34D399',
    match: d => d.status === 'Strong Buy',
  },
  {
    key: 'passed',
    name: 'Passed',
    accent: '#F87171',
    match: d => d.status === 'Passed',
  },
]

function KanbanCard({ deal }: { deal: Deal }) {
  const cap = deal.cap != null ? `${deal.cap.toFixed(1)}%` : '—'
  const coc = deal.coc != null ? `${deal.coc.toFixed(1)}%` : '—'
  const cf = deal.cashFlow != null ? `$${deal.cashFlow}` : '—'
  const cfColor = deal.cashFlow != null && deal.cashFlow < 0 ? 'var(--red)' : 'var(--text)'

  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--hairline)',
        borderRadius: 8,
        padding: 12,
        cursor: 'pointer',
        transition: 'transform 180ms ease, border-color 180ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--hairline)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span
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
        </span>
        <SignalBadge signal={deal.signal} />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
        {deal.city} {deal.state}
      </div>

      <span
        style={{
          display: 'inline-block',
          marginTop: 8,
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
    </div>
  )
}

export default function KanbanBoard({ deals }: { deals: Deal[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {COLUMNS.map(col => {
        const items = deals.filter(col.match)
        return (
          <div
            key={col.key}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 10,
              padding: 14,
              minHeight: 500,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
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
              items.map(deal => <KanbanCard key={deal.id} deal={deal} />)
            )}
          </div>
        )
      })}
    </div>
  )
}
