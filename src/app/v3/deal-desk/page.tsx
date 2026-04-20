'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import SignalBadge from '@/components/v3/public/SignalBadge'
import { signalFromDealScore, type Signal } from '@/lib/v3-analysis-parser'
import { dealBreakdownIssues, type DealBreakdownIssue, type DealProperty } from '@/data/deal-breakdown-issues'

type Tab = 'breakdowns' | 'resources'

const STRATEGY_LABEL: Record<string, string> = {
  brrrr: 'BRRRR',
  flip: 'Fix & Flip',
  buyhold: 'Buy & Hold',
  'buy-hold': 'Buy & Hold',
  househack: 'House Hack',
  'house-hack': 'House Hack',
}

function strategyLabel(raw: string | undefined): string {
  if (!raw) return 'Investment'
  return STRATEGY_LABEL[raw] || raw.toUpperCase()
}

function cashFlowPerMonth(p: DealProperty | undefined): string {
  if (!p?.annualCashFlow) return '—'
  return `$${Math.round(p.annualCashFlow / 12).toLocaleString()}/mo`
}

function capLabel(p: DealProperty | undefined): string {
  if (!p?.capRate) return '—'
  return `${p.capRate.toFixed(1)}%`
}

function cocLabel(p: DealProperty | undefined): string {
  if (!p?.coc) return '—'
  return `${p.coc.toFixed(1)}%`
}

function priceLabel(p: DealProperty | undefined): string {
  if (!p?.price) return '—'
  if (p.price >= 1_000_000) return `$${(p.price / 1_000_000).toFixed(2)}M`
  return `$${Math.round(p.price / 1000)}K`
}

function issueSignal(issue: DealBreakdownIssue): Signal {
  const top = issue.properties?.[0]
  if (!top) return 'WATCH'
  return signalFromDealScore(top.scoreValue)
}

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

function FeaturedIssue({ issue }: { issue: DealBreakdownIssue }) {
  const top = issue.properties?.[0]
  const signal = issueSignal(issue)
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
          Issue #{issue.issueNumber} · {issue.date}
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

      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.015em', color: 'var(--text)', marginTop: 12, lineHeight: 1.3 }}>
        {issue.title}
      </div>

      {top && (
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
            {strategyLabel(top.strategy)}
          </span>
          <SignalBadge signal={signal} />
        </div>
      )}

      <p style={{ margin: '16px 0 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {issue.previewText}
      </p>

      {top && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            marginTop: 20,
          }}
        >
          {[
            { label: 'CAP', value: capLabel(top) },
            { label: 'CoC', value: cocLabel(top) },
            { label: 'CF/MO', value: cashFlowPerMonth(top) },
            { label: 'PRICE', value: priceLabel(top) },
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
      )}

      <Link
        href={`/v2/deal-breakdown/${issue.slug}`}
        className="app-btn"
        style={{ marginTop: 20, padding: '10px 18px', fontSize: 13, display: 'inline-flex' }}
      >
        Read full breakdown →
      </Link>
    </section>
  )
}

function PastIssueCard({ issue }: { issue: DealBreakdownIssue }) {
  const top = issue.properties?.[0]
  const signal = issueSignal(issue)
  return (
    <Link
      href={`/v2/deal-breakdown/${issue.slug}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        padding: 18,
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
        Issue #{issue.issueNumber} · {issue.date}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--text)',
          marginTop: 8,
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {issue.title}
      </div>
      {top && (
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
            {strategyLabel(top.strategy)}
          </span>
          <SignalBadge signal={signal} />
        </div>
      )}
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
        <span>Cap {capLabel(top)}</span>
        <span>CoC {cocLabel(top)}</span>
        <span>{cashFlowPerMonth(top)}</span>
      </div>
    </Link>
  )
}

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

  const sorted = useMemo(
    () => [...dealBreakdownIssues].sort((a, b) => b.issueNumber - a.issueNumber),
    []
  )
  const latest = sorted[0]
  const rest = sorted.slice(1)

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
          {tab === 'breakdowns'
            ? latest
              ? `Issue #${latest.issueNumber} · Latest analysis`
              : 'Deal Breakdowns'
            : 'Playbooks, templates, and market intel'}
        </div>
      </div>

      <Tabs value={tab} onChange={setTab} />

      {tab === 'breakdowns' ? (
        <>
          {latest && <FeaturedIssue issue={latest} />}
          {rest.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
              }}
            >
              {rest.map(issue => (
                <PastIssueCard key={issue.slug} issue={issue} />
              ))}
            </div>
          )}
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
