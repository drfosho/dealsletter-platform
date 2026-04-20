'use client'

import { useState } from 'react'
import KanbanBoard from '@/components/v3/app/KanbanBoard'
import PipelineTable from '@/components/v3/app/PipelineTable'
import { PIPELINE } from '@/data/v3-deals'

type View = 'kanban' | 'table'

function ViewToggle({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: 2,
        background: 'var(--elevated)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
      }}
    >
      {(['kanban', 'table'] as const).map(v => {
        const active = v === value
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            style={{
              background: active ? 'var(--indigo)' : 'transparent',
              color: active ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              cursor: 'pointer',
              fontSize: 12.5,
              fontWeight: 500,
              textTransform: 'capitalize',
              transition: 'all 140ms ease',
            }}
          >
            {v}
          </button>
        )
      })}
    </div>
  )
}

export default function V3PipelinePage() {
  const [view, setView] = useState<View>('kanban')

  return (
    <div style={{ padding: '28px 28px 80px', maxWidth: 1440, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 22,
        }}
      >
        <ViewToggle value={view} onChange={setView} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="app-btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            CSV
          </button>
          <button type="button" className="app-btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>
          <button type="button" className="app-btn" style={{ padding: '8px 14px', fontSize: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Deal
          </button>
        </div>
      </div>

      {view === 'kanban' ? <KanbanBoard deals={PIPELINE} /> : <PipelineTable deals={PIPELINE} />}
    </div>
  )
}
