'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import KanbanBoard from '@/components/v3/app/KanbanBoard'
import PipelineTable from '@/components/v3/app/PipelineTable'
import { adaptPipelineRecord, type PipelineRecord } from '@/lib/v3-deal-adapter'
import type { Deal, PipelineStatus } from '@/data/v3-deals'

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

function csvEscape(s: string | number | null | undefined): string {
  if (s == null) return ''
  const str = String(s)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function dealsToCsv(deals: Deal[]): string {
  const header = ['address', 'city', 'state', 'strategy', 'cap', 'coc', 'cashFlow', 'signal', 'status', 'added']
  const rows = deals.map(d =>
    [
      d.address,
      d.city,
      d.state,
      d.strategy,
      d.cap ?? '',
      d.coc ?? '',
      d.cashFlow ?? '',
      d.signal,
      d.status,
      d.addedDate,
    ]
      .map(csvEscape)
      .join(',')
  )
  return [header.join(','), ...rows].join('\n')
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function V3PipelinePage() {
  const router = useRouter()
  const [view, setView] = useState<View>('kanban')
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/v3/pipeline', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch pipeline')
      const data = await res.json()
      const list: PipelineRecord[] = data?.deals || []
      setDeals(list.map(adaptPipelineRecord))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pipeline')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onStatusChange = async (dealId: string, status: PipelineStatus) => {
    const prev = deals
    setDeals(current => current.map(d => (d.id === dealId ? { ...d, status } : d)))
    try {
      const res = await fetch('/api/v3/pipeline/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dealId, status }),
      })
      if (!res.ok) throw new Error('status patch')
    } catch {
      setDeals(prev)
    }
  }

  const onExport = () => {
    const csv = dealsToCsv(deals)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(csv, `dealsletter-pipeline-${stamp}.csv`)
  }

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
          <button
            type="button"
            className="app-btn-ghost"
            style={{ padding: '8px 14px', fontSize: 12 }}
            onClick={onExport}
            disabled={deals.length === 0}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            CSV
          </button>
          <button
            type="button"
            className="app-btn-ghost"
            style={{ padding: '8px 14px', fontSize: 12 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>
          <button
            type="button"
            className="app-btn"
            style={{ padding: '8px 14px', fontSize: 12 }}
            onClick={() => router.push('/v3/analyze')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Deal
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            fontSize: 12.5,
            color: '#F87171',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.22)',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}
        >
          Loading pipeline…
        </div>
      ) : deals.length === 0 ? (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px dashed var(--hairline)',
            borderRadius: 12,
            padding: '56px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500 }}>
            Your pipeline is empty.
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, maxWidth: 420, margin: '8px auto 0' }}>
            Run your first analysis and save the deal to start tracking opportunities here.
          </div>
          <button
            type="button"
            className="app-btn"
            style={{ marginTop: 18, padding: '10px 18px', fontSize: 13 }}
            onClick={() => router.push('/v3/analyze')}
          >
            Analyze a deal →
          </button>
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard deals={deals} onStatusChange={onStatusChange} />
      ) : (
        <PipelineTable deals={deals} />
      )}
    </div>
  )
}
