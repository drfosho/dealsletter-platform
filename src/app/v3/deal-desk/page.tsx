'use client'

import { useState } from 'react'
import SignalBadge from '@/components/v3/public/SignalBadge'
import type { Signal } from '@/data/v3-metros'

type Tab = 'breakdowns' | 'resources'

type Issue = {
  number: number
  date: string
  city: string
  state: string
  strategy: string
  signal: Signal
  cap: string
  secondary: string
}

const PAST_ISSUES: Issue[] = [
  { number: 149, date: 'Mar 28, 2026', city: 'Charlotte', state: 'NC', strategy: 'Fix & Flip', signal: 'BUY', cap: '—', secondary: 'Profit $88K' },
  { number: 148, date: 'Mar 21, 2026', city: 'Indianapolis', state: 'IN', strategy: 'Buy & Hold', signal: 'BUY', cap: 'Cap 9.4%', secondary: 'CF $612/mo' },
  { number: 147, date: 'Mar 14, 2026', city: 'Kansas City', state: 'MO', strategy: 'BRRRR', signal: 'STRONG BUY', cap: 'Cap 10.2%', secondary: 'CF $890/mo' },
]

type Resource = {
  category: string
  title: string
  description: string
}

const RESOURCES: Resource[] = [
  { category: 'PLAYBOOK', title: 'BRRRR Calculator Guide', description: 'Step-by-step walkthrough of the BRRRR strategy — acquisition, rehab budget, refi math, stabilized returns.' },
  { category: 'TEMPLATE', title: 'Fix & Flip Pro Forma', description: 'Spreadsheet template with ARV, rehab, carry cost, selling cost, and profit projections.' },
  { category: 'PLAYBOOK', title: 'Buy & Hold Underwriting', description: 'How to underwrite long-term rentals: rent comps, cap rate, cash-on-cash, vacancy, and CapEx reserves.' },
  { category: 'PLAYBOOK', title: 'House Hack Playbook', description: 'Live-in value-add strategies for FHA buyers — 2–4 unit analysis, PITI offset, and exit scenarios.' },
  { category: 'EXPLAINER', title: 'Cap Rate vs CoC Explained', description: 'When to use cap rate, when to use cash-on-cash, and why the two metrics disagree on leveraged deals.' },
  { category: 'MARKET', title: 'Memphis Market Deep Dive', description: 'Submarket-by-submarket breakdown of Memphis rent growth, cap compression, and inventory trends.' },
]

function Tabs({ value, onChange }: { value: Tab; onChange: (v: Tab) => void }) {
  const items: { key: Tab; label: string }[] = [
    { key: 'breakdowns', label: 'Deal Breakdowns' },
    { key: 'resources', label: 'Resources' },
  ]
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: 2,
        background: 'var(--elevated)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        marginBottom: 24,
      }}
    >
      {items.map(item => {
        const active = value === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            style={{
              background: active ? 'var(--indigo)' : 'transparent',
              color: active ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 8,
              padding: '9px 18px',
              cursor: 'pointer',
              fontSize: 12.5,
              fontWeight: 500,
              transition: 'all 140ms ease',
            }}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function FeaturedIssue() {
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 12,
        padding: 24,
        marginBottom: 28,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}
        >
          Issue #150 · Apr 4, 2026
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: '#fff',
            background: 'var(--indigo)',
            borderRadius: 4,
            padding: '3px 8px',
          }}
        >
          LATEST
        </span>
      </div>

      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--text)', marginTop: 12 }}>
        2847 Magnolia Ave, Memphis TN
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.06em',
            color: 'var(--indigo-hover)',
            background: 'var(--indigo-dim)',
            border: '1px solid var(--border-strong)',
            borderRadius: 999,
            padding: '3px 9px',
          }}
        >
          BRRRR
        </span>
        <SignalBadge signal="STRONG BUY" />
      </div>

      <p style={{ margin: '16px 0 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        Full BRRRR breakdown — acquisition at $178K, $42K rehab, refinance to pull out equity, stabilized at $842/mo cash flow. Three-model consensus with stress testing.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginTop: 20,
        }}
      >
        {[
          { label: 'CAP', value: '11.8%' },
          { label: 'CoC', value: '14.2%' },
          { label: 'CF/MO', value: '$842' },
          { label: 'ARV', value: '$265K' },
        ].map(m => (
          <div
            key={m.label}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--hairline)',
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text)',
                marginTop: 4,
              }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="app-btn" style={{ marginTop: 20, padding: '10px 18px', fontSize: 13 }}>
        Read full breakdown →
      </button>
    </section>
  )
}

function PastIssueCard({ issue }: { issue: Issue }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        padding: 18,
        cursor: 'pointer',
        transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
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
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}
      >
        Issue #{issue.number} · {issue.date}
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginTop: 8 }}>
        {issue.city} {issue.state}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.06em',
            color: 'var(--indigo-hover)',
            background: 'var(--indigo-dim)',
            border: '1px solid var(--border-strong)',
            borderRadius: 999,
            padding: '2px 9px',
          }}
        >
          {issue.strategy}
        </span>
        <SignalBadge signal={issue.signal} />
      </div>
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 16,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-secondary)',
        }}
      >
        <span>{issue.cap}</span>
        <span>{issue.secondary}</span>
      </div>
    </div>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.14em',
          color: 'var(--indigo-hover)',
          fontWeight: 600,
        }}
      >
        {resource.category}
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{resource.title}</div>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55, flex: 1 }}>
        {resource.description}
      </p>
      <button
        type="button"
        className="app-btn-ghost"
        style={{ padding: '7px 12px', fontSize: 12, alignSelf: 'flex-start' }}
      >
        Download PDF →
      </button>
    </div>
  )
}

export default function V3DealDeskPage() {
  const [tab, setTab] = useState<Tab>('breakdowns')

  return (
    <div style={{ padding: '28px 28px 80px', maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}
        >
          DEAL DESK
        </div>
        <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)', marginTop: 8 }}>
          {tab === 'breakdowns' ? 'Issue #150 · Latest analysis' : 'Playbooks, templates, and market intel'}
        </div>
      </div>

      <Tabs value={tab} onChange={setTab} />

      {tab === 'breakdowns' ? (
        <>
          <FeaturedIssue />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
            }}
          >
            {PAST_ISSUES.map(issue => (
              <PastIssueCard key={issue.number} issue={issue} />
            ))}
          </div>
        </>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
          }}
        >
          {RESOURCES.map(r => (
            <ResourceCard key={r.title} resource={r} />
          ))}
        </div>
      )}
    </div>
  )
}
