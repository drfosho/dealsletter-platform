'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import SignalBadge from '@/components/v3/public/SignalBadge'
import AnalysisAccordion from '@/components/v3/app/AnalysisAccordion'
import AddressAutocomplete from '@/components/v3/app/AddressAutocomplete'
import PropertyEditCard, {
  makeInitialEditable,
  inferUnitCount,
  type EditableProperty,
} from '@/components/v3/app/PropertyEditCard'
import { useV3Tier } from '@/hooks/useV3Tier'
import {
  useProMaxAnalysis,
  PRO_MAX_MODELS,
} from '@/hooks/useProMaxAnalysis'
import {
  parseAnalysisStream,
  normalizeResult,
  signalFromDealScore,
  type V3AnalysisResult,
  type Signal,
} from '@/lib/v3-analysis-parser'
import type { PipelineStatus } from '@/data/v3-deals'

/* ----------------------------- types ----------------------------- */

type Strategy = 'BRRRR' | 'Fix & Flip' | 'Buy & Hold' | 'House Hack'
const STRATEGIES: Strategy[] = ['BRRRR', 'Fix & Flip', 'Buy & Hold', 'House Hack']

type ModelTier = 'speed' | 'balanced' | 'max'
const MODEL_OPTIONS: { key: ModelTier; label: string; sub: string }[] = [
  { key: 'speed', label: 'Speed', sub: 'GPT-4o-mini' },
  { key: 'balanced', label: 'Balanced', sub: 'Sonnet + GPT-4.1' },
  { key: 'max', label: 'Max IQ', sub: 'Opus + GPT-4o + Grok 3' },
]

type PropertyData = {
  isDemo?: boolean
  demo?: boolean
  address?: string
  property?: {
    beds?: number
    baths?: number
    sqft?: number
    bedrooms?: number
    bathrooms?: number
    squareFootage?: number
    yearBuilt?: number
    propertyType?: string
    estimatedValue?: number
    estimatedRent?: number
    listPrice?: number | null
  }
  rental?: {
    rentEstimate?: number
    rentRangeLow?: number
    rentRangeHigh?: number
  }
  arvAnalysis?: {
    arvEstimate?: number
    compsUsed?: number
    confidence?: string
  }
  comparables?: {
    value?: number
    sales?: Array<{
      address?: string
      formattedAddress?: string
      bedrooms?: number
      bathrooms?: number
      squareFootage?: number
      price?: number
      distance?: number
    }>
    rentals?: Array<{
      address?: string
      formattedAddress?: string
      bedrooms?: number
      bathrooms?: number
      rent?: number
      distance?: number
    }>
  }
}

/* --------------------------- helpers --------------------------- */

function apiStrategyFor(strategy: Strategy): string {
  if (strategy === 'BRRRR') return 'brrrr'
  if (strategy === 'Fix & Flip') return 'flip'
  if (strategy === 'Buy & Hold') return 'rental'
  return 'house-hack'
}

function fmtMoney(n: number | null | undefined): string {
  if (n == null) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n).toLocaleString()}`
}

function fmtPct(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${n.toFixed(1)}%`
}

function fmtInt(n: number | null | undefined): string {
  if (n == null) return '—'
  return Math.round(n).toLocaleString()
}

function toNum(s: string | undefined | null): number | undefined {
  if (s == null) return undefined
  const n = parseFloat(String(s).replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

function defaultStatusFromScore(score: number | null | undefined): PipelineStatus {
  if (score == null) return 'Watching'
  if (score >= 8) return 'Strong Buy'
  if (score >= 6) return 'Reviewing'
  return 'Watching'
}

/* ------------------------ body builder ------------------------ */

function buildAnalyzeBody(
  address: string,
  strategy: Strategy,
  propertyData: PropertyData,
  edited: EditableProperty
): Record<string, unknown> {
  const purchasePrice = toNum(edited.listPrice) || 0
  const estimatedValue = toNum(edited.estimatedValue) || purchasePrice
  const monthlyRent = toNum(edited.estimatedRent)
  const arv = toNum(edited.arv) || estimatedValue
  const rehab = toNum(edited.rehabCost) ?? 0
  const dpPercent = toNum(edited.downPaymentPercent) ?? 20
  const interestRate = toNum(edited.interestRate) ?? 7.5
  const term = edited.loanTerm || 30
  const units =
    strategy === 'House Hack'
      ? toNum(edited.units) || inferUnitCount(propertyData.property?.propertyType)
      : 1
  const apiLoanType = 'conventional'

  const mergedPropertyData = {
    ...propertyData,
    property: {
      ...(propertyData.property || {}),
      bedrooms: toNum(edited.beds) ?? propertyData.property?.bedrooms ?? propertyData.property?.beds,
      bathrooms: toNum(edited.baths) ?? propertyData.property?.bathrooms ?? propertyData.property?.baths,
      squareFootage:
        toNum(edited.sqft) ?? propertyData.property?.squareFootage ?? propertyData.property?.sqft,
      yearBuilt: toNum(edited.yearBuilt) ?? propertyData.property?.yearBuilt,
      estimatedValue,
    },
    rental: {
      ...(propertyData.rental || {}),
      rentEstimate: monthlyRent ?? propertyData.rental?.rentEstimate,
    },
    comparables: {
      ...(propertyData.comparables || {}),
      value: estimatedValue,
    },
  }

  return {
    address,
    strategy: apiStrategyFor(strategy),
    purchasePrice,
    downPayment: Math.round(purchasePrice * (dpPercent / 100)),
    loanTerms: {
      interestRate,
      loanTerm: term,
      loanType: apiLoanType,
      points: 0,
    },
    rehabCosts: strategy === 'BRRRR' || strategy === 'Fix & Flip' ? rehab : undefined,
    arv: strategy === 'BRRRR' || strategy === 'Fix & Flip' ? arv : undefined,
    strategyDetails: {
      downPaymentPercent: dpPercent,
      exitStrategy: strategy === 'BRRRR' ? '75' : undefined,
      arvConfidence: strategy === 'BRRRR' || strategy === 'Fix & Flip' ? edited.arvConfidence : undefined,
      loanType: strategy === 'House Hack' ? edited.loanType : undefined,
    },
    closingCostsPercent: 3,
    sellClosingCostsPercent: 6,
    units,
    monthlyRent,
    propertyData: mergedPropertyData,
  }
}

/* ------------------------- streaming analyze ------------------------- */

type StreamResult = {
  result: V3AnalysisResult
  calculations: Record<string, unknown> | null
}

async function runStandardAnalysis(
  body: Record<string, unknown>,
  onProgress: (step: string, detail: string) => void
): Promise<StreamResult> {
  const res = await fetch('/api/analysis/generate', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-V2-Request': 'true' },
    body: JSON.stringify(body),
  })
  if (!res.ok && res.status === 429) {
    const retryAfter = Number(res.headers.get('retry-after')) || 60
    const err = new Error('RATE_LIMIT')
    ;(err as unknown as { retryAfter: number }).retryAfter = retryAfter
    throw err
  }
  if (!res.body) throw new Error('No response body')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let raw = ''
  let lineBuffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    raw += chunk
    lineBuffer += chunk
    const lines = lineBuffer.split('\n')
    lineBuffer = lines.pop() || ''
    for (const line of lines) {
      if (line.startsWith('PROGRESS:')) {
        try {
          const ev = JSON.parse(line.slice(9))
          if (ev?.type === 'progress') onProgress(ev.step, ev.detail)
        } catch {}
      }
    }
  }

  let resultJson = ''
  let calculations: Record<string, unknown> | null = null
  const allLines = raw.split('\n')
  for (const line of allLines) {
    if (line.startsWith('CALCULATIONS:')) {
      try {
        calculations = JSON.parse(line.slice(13))
      } catch {}
    } else if (line.startsWith('RESULT:')) {
      resultJson = line.slice(7)
    } else if (line.startsWith('ERROR:')) {
      try {
        const errPayload = JSON.parse(line.slice(6))
        if (errPayload?.code === 'RATE_LIMITED') {
          const e = new Error('RATE_LIMIT')
          ;(e as unknown as { retryAfter: number }).retryAfter = errPayload.retryAfter || 60
          throw e
        }
        throw new Error(errPayload?.message || 'Analysis failed')
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message === 'RATE_LIMIT') throw parseErr
        throw parseErr instanceof Error ? parseErr : new Error('Analysis failed')
      }
    } else if (
      resultJson &&
      line.trim() &&
      !line.startsWith('PROGRESS:') &&
      !line.startsWith('MODEL:') &&
      !line.startsWith('CALCULATIONS:') &&
      !line.startsWith('ERROR:')
    ) {
      resultJson += line
    }
  }

  if (!resultJson) {
    const marker = raw.indexOf('RESULT:')
    if (marker !== -1) {
      const after = raw.slice(marker + 7)
      const lastBrace = after.lastIndexOf('}')
      if (lastBrace !== -1) resultJson = after.slice(0, lastBrace + 1)
    }
  }

  const parsed = parseAnalysisStream(resultJson)
  if (!parsed) throw new Error('Could not parse analysis response')
  return { result: normalizeResult(parsed), calculations }
}

/* --------------------------- UI primitives --------------------------- */

function Chip({
  active,
  onClick,
  disabled,
  children,
  locked,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  locked?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={locked ? 'Upgrade required' : undefined}
      style={{
        background: active ? 'var(--indigo-dim)' : 'var(--surface)',
        color: active ? 'var(--indigo-hover)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 999,
        padding: '6px 12px',
        fontSize: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.55 : 1,
        transition: 'all 140ms ease',
      }}
    >
      {children}
    </button>
  )
}

function ModelToggle({
  value,
  onChange,
  allowed,
}: {
  value: ModelTier
  onChange: (v: ModelTier) => void
  allowed: Record<ModelTier, boolean>
}) {
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
      {MODEL_OPTIONS.map(opt => {
        const active = value === opt.key
        const locked = !allowed[opt.key]
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            disabled={locked}
            title={locked ? 'Upgrade required' : undefined}
            style={{
              background: active ? 'var(--indigo)' : 'transparent',
              color: active ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              cursor: locked ? 'not-allowed' : 'pointer',
              opacity: locked ? 0.45 : 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
              transition: 'all 140ms ease',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500 }}>{opt.label}</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.08em',
                color: active ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
              }}
            >
              {opt.sub}
              {locked ? ' · Pro' : ''}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function AlertBox({
  kind,
  children,
}: {
  kind: 'error' | 'warn' | 'info'
  children: React.ReactNode
}) {
  const colors =
    kind === 'error'
      ? { color: '#F87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.22)' }
      : kind === 'warn'
        ? { color: '#FBBF24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.22)' }
        : { color: 'var(--text-secondary)', bg: 'var(--surface)', border: 'var(--hairline)' }
  return (
    <div
      style={{
        fontSize: 13,
        color: colors.color,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: '10px 14px',
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  )
}

function LoadingDot({ label }: { label: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'var(--blue)',
          boxShadow: '0 0 0 6px rgba(59,130,246,0.14)',
          animation: 'v3-pulse 1.8s ease-in-out infinite',
        }}
      />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
        {label}
      </span>
    </div>
  )
}

function UpgradeOverlay({ message }: { message: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'rgba(8,8,16,0.55)',
        backdropFilter: 'blur(2px)',
        borderRadius: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{message}</div>
        <Link
          href="/pricing"
          className="app-btn"
          style={{ marginTop: 14, display: 'inline-flex', padding: '9px 16px', fontSize: 13 }}
        >
          Go Pro →
        </Link>
      </div>
    </div>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        color: 'var(--text-muted)',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 200ms ease',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

/* ----------------------- status bar (Fix 5) ----------------------- */

const PIPELINE_STATUSES: PipelineStatus[] = ['Watching', 'Reviewing', 'Strong Buy', 'Passed']

function statusColor(status: PipelineStatus) {
  if (status === 'Strong Buy') return { fill: 'rgba(16,185,129,0.14)', text: '#34D399' }
  if (status === 'Reviewing') return { fill: 'var(--indigo-dim)', text: 'var(--indigo-hover)' }
  if (status === 'Passed') return { fill: 'rgba(239,68,68,0.12)', text: '#F87171' }
  return { fill: 'var(--surface)', text: 'var(--text-secondary)' }
}

function StatusBar({
  value,
  onChange,
  onSave,
  saveState,
}: {
  value: PipelineStatus
  onChange: (v: PipelineStatus) => void
  onSave: () => void
  saveState: 'idle' | 'saving' | 'saved' | 'error'
}) {
  const saved = saveState === 'saved'
  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 20,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}
      >
        Save this deal
      </span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
        {PIPELINE_STATUSES.map(s => {
          const active = s === value
          const c = statusColor(s)
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.04em',
                background: active ? c.fill : 'var(--surface)',
                color: active ? c.text : 'var(--text-secondary)',
                border: `1px solid ${active ? 'var(--border-strong)' : 'var(--hairline)'}`,
                cursor: 'pointer',
                transition: 'all 140ms ease',
              }}
            >
              {s}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={onSave}
        className="app-btn"
        disabled={saveState === 'saving' || saved}
        style={{
          padding: '9px 16px',
          fontSize: 13,
          background: saved ? 'var(--green)' : undefined,
          borderColor: saved ? 'var(--green)' : undefined,
        }}
      >
        {saved ? '✓ Saved' : saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Retry save' : 'Save →'}
      </button>
    </section>
  )
}

/* ------------------- empty state content (Fix 6) ------------------- */

const EMPTY_STATE_DEALS = [
  { address: '2847 Magnolia Ave', city: 'Memphis TN', strategy: 'BRRRR', cap: '11.8%', signal: 'STRONG BUY' as Signal },
  { address: '1290 N Prospect Rd', city: 'Indianapolis IN', strategy: 'Buy & Hold', cap: '9.4%', signal: 'BUY' as Signal },
  { address: '3104 Clearwater Blvd', city: 'Tampa FL', strategy: 'BRRRR', cap: '10.1%', signal: 'STRONG BUY' as Signal },
  { address: '412 Birch St', city: 'Kansas City MO', strategy: 'BRRRR', cap: '10.2%', signal: 'STRONG BUY' as Signal },
]

const STRATEGY_CARDS: {
  name: Strategy
  tag: string
  metricLabel: string
  metricValue: string
}[] = [
  { name: 'BRRRR', tag: 'Buy · Rehab · Rent · Refi · Repeat', metricLabel: 'ROI', metricValue: '188% avg' },
  { name: 'Fix & Flip', tag: 'Acquire · Renovate · Exit', metricLabel: 'PROFIT', metricValue: '$88K avg' },
  { name: 'Buy & Hold', tag: 'Long-term cash flow', metricLabel: 'CAP RATE', metricValue: '9.4% avg' },
  { name: 'House Hack', tag: 'Live-in value-add', metricLabel: 'NET COST', metricValue: '-$180/mo avg' },
]

function AnalyzeEmpty({
  onPickStrategy,
}: {
  onPickStrategy: (s: Strategy) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36, marginTop: 8 }}>
      <section>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.14em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Recent analyses
        </div>
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 6,
          }}
        >
          {EMPTY_STATE_DEALS.map(d => (
            <div
              key={d.address}
              style={{
                flex: '0 0 auto',
                minWidth: 200,
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                borderRadius: 8,
                padding: 12,
              }}
            >
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
                {d.address}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                {d.city} · {d.strategy}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--indigo-hover)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {d.cap}
                </span>
                <SignalBadge signal={d.signal} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.14em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Strategies
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}
        >
          {STRATEGY_CARDS.map(s => (
            <button
              key={s.name}
              type="button"
              onClick={() => onPickStrategy(s.name)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--hairline)',
                borderRadius: 10,
                padding: 16,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'transform 160ms ease, border-color 160ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = 'var(--border-strong)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--hairline)'
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, minHeight: 30 }}>
                {s.tag}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  color: 'var(--text-muted)',
                  marginTop: 10,
                  textTransform: 'uppercase',
                }}
              >
                {s.metricLabel}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--indigo-hover)',
                  marginTop: 2,
                  letterSpacing: '-0.01em',
                }}
              >
                {s.metricValue}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.14em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          How it works
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-secondary)',
          }}
        >
          <span>
            <span style={{ color: 'var(--indigo-hover)', fontWeight: 600 }}>①</span> Enter address
          </span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span>
            <span style={{ color: 'var(--indigo-hover)', fontWeight: 600 }}>②</span> AI underwrites in 27s
          </span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span>
            <span style={{ color: 'var(--indigo-hover)', fontWeight: 600 }}>③</span> Save to pipeline
          </span>
        </div>
      </section>
    </div>
  )
}

/* ------------------- Pro Max expandable card (Fix 4) ------------------- */

function ProMaxCard({
  idx,
  cfg,
  modelLabel,
  parsed,
  status,
  error,
  progressDetail,
  expanded,
  onToggle,
}: {
  idx: number
  cfg: (typeof PRO_MAX_MODELS)[number] | undefined
  modelLabel: string
  parsed: V3AnalysisResult | null
  status: 'pending' | 'loading' | 'complete' | 'error'
  error: string | null
  progressDetail: string
  expanded: boolean
  onToggle: () => void
}) {
  const s = parsed ? signalFromDealScore(parsed.dealScore) : null
  const expandable = status === 'complete' && parsed != null
  return (
    <div
      style={{
        position: 'relative',
        background: expanded ? 'var(--elevated)' : 'var(--surface)',
        border: `1px solid ${expanded ? 'var(--border-strong)' : 'var(--hairline)'}`,
        borderRadius: 10,
        padding: 20,
        overflow: 'hidden',
        minHeight: 220,
        transition: 'background 200ms ease, border-color 200ms ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: cfg?.accentColor || '#6366F1',
        }}
      />

      <button
        type="button"
        onClick={expandable ? onToggle : undefined}
        disabled={!expandable}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          width: '100%',
          textAlign: 'left',
          cursor: expandable ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
            {cfg?.roleLabel || `Model ${idx + 1}`}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
            {modelLabel}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {s && <SignalBadge signal={s} />}
          {expandable && <Chevron open={expanded} />}
        </div>
      </button>

      {status === 'loading' && <LoadingDot label={progressDetail || 'Running…'} />}
      {status === 'error' && <AlertBox kind="error">{error || 'Model failed'}</AlertBox>}

      {parsed && status === 'complete' && (
        <>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              display: expanded ? 'block' : '-webkit-box',
              WebkitLineClamp: expanded ? undefined : 2,
              WebkitBoxOrient: 'vertical',
              overflow: expanded ? 'visible' : 'hidden',
            }}
          >
            {parsed.narrative || parsed.recommendation || 'No narrative returned.'}
          </p>

          <div
            style={{
              borderTop: '1px solid var(--hairline)',
              marginTop: 16,
              paddingTop: 14,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {[
              { label: 'CAP', value: fmtPct(parsed.metrics?.capRate) },
              { label: 'CoC', value: fmtPct(parsed.metrics?.cashOnCash) },
              {
                label: 'SCORE',
                value: parsed.dealScore != null ? `${parsed.dealScore}/10` : '—',
              },
            ].map(m => (
              <div key={m.label}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginTop: 3,
                  }}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {expanded && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--hairline)' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  color: 'var(--indigo-hover)',
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                FULL METRICS
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 8, letterSpacing: '0.1em' }}>CF/MO</div>
                  <div style={{ color: 'var(--text)', marginTop: 3 }}>
                    {fmtMoney(parsed.cashFlow?.monthly)}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 8, letterSpacing: '0.1em' }}>5-YR ROI</div>
                  <div style={{ color: 'var(--text)', marginTop: 3 }}>{fmtPct(parsed.metrics?.roi)}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 8, letterSpacing: '0.1em' }}>ARV</div>
                  <div style={{ color: 'var(--text)', marginTop: 3 }}>
                    {fmtMoney(parsed.metrics?.arvEstimate)}
                  </div>
                </div>
              </div>

              {parsed.riskFlags && parsed.riskFlags.length > 0 && (
                <>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.14em',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      marginTop: 14,
                      marginBottom: 8,
                      textTransform: 'uppercase',
                    }}
                  >
                    Risk flags
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    {parsed.riskFlags.map((flag, i) => (
                      <li key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            letterSpacing: '0.1em',
                            color:
                              flag.severity === 'high'
                                ? '#F87171'
                                : flag.severity === 'medium'
                                  ? '#FBBF24'
                                  : 'var(--text-muted)',
                            textTransform: 'uppercase',
                            marginRight: 6,
                          }}
                        >
                          [{flag.severity}]
                        </span>
                        <strong style={{ color: 'var(--text)', fontWeight: 500 }}>{flag.flag}</strong>
                        {flag.detail ? ` — ${flag.detail}` : ''}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {parsed.marketContext && (
                <>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.14em',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      marginTop: 14,
                      marginBottom: 6,
                      textTransform: 'uppercase',
                    }}
                  >
                    Market context
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {parsed.marketContext}
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* --------------------------- property-data fetch --------------------------- */

async function fetchPropertyData(address: string, strategy: Strategy): Promise<PropertyData> {
  const res = await fetch('/api/v2/property-data', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, strategy: apiStrategyFor(strategy) }),
  })
  if (!res.ok) {
    let msg = `Failed to fetch property data (${res.status})`
    try {
      const data = await res.json()
      if (data?.error) msg = data.error
    } catch {}
    throw new Error(msg)
  }
  return (await res.json()) as PropertyData
}

/* ============================ PAGE ============================ */

export default function V3AnalyzePage() {
  const tierState = useV3Tier()
  const tier = tierState.status === 'ready' ? tierState.tier : 'free'

  const allowedModels: Record<ModelTier, boolean> = {
    speed: true,
    balanced: tier !== 'free',
    max: tier === 'pro_max',
  }

  const defaultModel: ModelTier = tier === 'pro_max' ? 'max' : tier === 'pro' ? 'balanced' : 'speed'

  const [address, setAddress] = useState('')
  const [strategy, setStrategy] = useState<Strategy>('BRRRR')
  const [model, setModel] = useState<ModelTier>(defaultModel)
  const [hasInitModel, setHasInitModel] = useState(false)

  useEffect(() => {
    if (!hasInitModel && tierState.status === 'ready') {
      setModel(defaultModel)
      setHasInitModel(true)
    }
  }, [tierState.status, defaultModel, hasInitModel])

  const [propData, setPropData] = useState<PropertyData | null>(null)
  const [propLoading, setPropLoading] = useState(false)
  const [propError, setPropError] = useState('')
  const [edited, setEdited] = useState<EditableProperty | null>(null)

  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [rateLimit, setRateLimit] = useState<{ retryAfter: number } | null>(null)
  const [result, setResult] = useState<V3AnalysisResult | null>(null)
  const [calculations, setCalculations] = useState<Record<string, unknown> | null>(null)
  const [progressStep, setProgressStep] = useState('')

  const [dealStatus, setDealStatus] = useState<PipelineStatus>('Watching')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [expandedModel, setExpandedModel] = useState<number | null>(null)
  const [showRaw, setShowRaw] = useState(false)

  const proMax = useProMaxAnalysis()

  const isProMaxMode = tier === 'pro_max' && model === 'max'

  useEffect(() => {
    if (result?.dealScore != null) setDealStatus(defaultStatusFromScore(result.dealScore))
  }, [result?.dealScore])

  const onAddressFetch = async () => {
    if (!address.trim()) return
    setPropLoading(true)
    setPropError('')
    setPropData(null)
    setResult(null)
    setCalculations(null)
    setAnalysisError('')
    setRateLimit(null)
    setEdited(null)
    setSaveState('idle')
    try {
      const data = await fetchPropertyData(address.trim(), strategy)
      setPropData(data)
      const source = {
        beds: data.property?.beds ?? data.property?.bedrooms,
        baths: data.property?.baths ?? data.property?.bathrooms,
        sqft: data.property?.sqft ?? data.property?.squareFootage,
        yearBuilt: data.property?.yearBuilt,
        propertyType: data.property?.propertyType,
        listPrice: data.property?.listPrice,
        estimatedValue: data.property?.estimatedValue,
        estimatedRent: data.rental?.rentEstimate ?? data.property?.estimatedRent,
      }
      setEdited(makeInitialEditable(strategy, source))
    } catch (err) {
      setPropError(err instanceof Error ? err.message : 'Failed to fetch property data')
    } finally {
      setPropLoading(false)
    }
  }

  // When strategy changes while property data is loaded, re-seed strategy-specific
  // defaults but preserve universal overrides the user may have typed.
  useEffect(() => {
    if (!propData || !edited) return
    setEdited(prev => {
      if (!prev) return prev
      const source = {
        beds: toNum(prev.beds),
        baths: toNum(prev.baths),
        sqft: toNum(prev.sqft),
        yearBuilt: toNum(prev.yearBuilt),
        propertyType: propData.property?.propertyType,
        listPrice: toNum(prev.listPrice),
        estimatedValue: toNum(prev.estimatedValue),
        estimatedRent: toNum(prev.estimatedRent),
      }
      const seeded = makeInitialEditable(strategy, source)
      return { ...seeded, ...prev, arvConfidence: seeded.arvConfidence, loanTerm: seeded.loanTerm, loanType: seeded.loanType }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy])

  const onAnalyze = async () => {
    if (!propData || !edited) return
    setAnalysisLoading(true)
    setAnalysisError('')
    setRateLimit(null)
    setResult(null)
    setCalculations(null)
    setProgressStep('')
    setExpandedModel(null)
    setSaveState('idle')

    const body = buildAnalyzeBody(address, strategy, propData, edited)

    if (isProMaxMode) {
      proMax.resetResults()
      try {
        await proMax.runParallelAnalysis(body, parseAnalysisStream, normalizeResult)
      } catch (err) {
        setAnalysisError(err instanceof Error ? err.message : 'Parallel analysis failed')
      } finally {
        setAnalysisLoading(false)
      }
      return
    }

    try {
      const { result: res, calculations: calc } = await runStandardAnalysis(body, (step, detail) => {
        setProgressStep(detail || step)
      })
      setResult(res)
      setCalculations(calc)
    } catch (err) {
      if (err instanceof Error && err.message === 'RATE_LIMIT') {
        const retry = (err as unknown as { retryAfter?: number }).retryAfter || 60
        setRateLimit({ retryAfter: retry })
      } else {
        setAnalysisError(err instanceof Error ? err.message : 'Analysis failed')
      }
    } finally {
      setAnalysisLoading(false)
    }
  }

  const onSaveToPipeline = async () => {
    if (!result) return
    setSaveState('saving')
    try {
      const payload = {
        address,
        strategy,
        metrics: result.metrics,
        cashFlow: result.cashFlow,
        proForma: result.proForma,
        signal: signalFromDealScore(result.dealScore),
        dealScore: result.dealScore,
        propertyData: propData,
        status: dealStatus,
        aiAnalysis: {
          narrative: result.narrative,
          marketContext: result.marketContext,
          riskFlags: result.riskFlags,
          financial_metrics: {
            cap_rate: result.metrics?.capRate,
            cash_on_cash_return: result.metrics?.cashOnCash,
            monthly_cash_flow: result.cashFlow?.monthly,
            arv: result.metrics?.arvEstimate,
          },
        },
      }
      const res = await fetch('/api/v3/pipeline/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('save failed')
      setSaveState('saved')
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => setSaveState('idle'), 3000)
    } catch {
      setSaveState('error')
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  const signal = signalFromDealScore(result?.dealScore)
  const narrativeBlurred = tier === 'free' && result != null

  const showEmpty = !propData && !propLoading && !propError && !result && !analysisLoading && !proMax.isRunning
  const isDev = process.env.NODE_ENV === 'development'

  const updateEdited = (patch: Partial<EditableProperty>) => {
    setEdited(prev => (prev ? { ...prev, ...patch } : prev))
  }

  return (
    <div style={{ padding: '28px 28px 80px', maxWidth: 1440, margin: '0 auto' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 12,
          padding: 5,
          marginBottom: 18,
        }}
      >
        <span style={{ padding: '0 14px', color: 'var(--text-muted)', display: 'inline-flex' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <AddressAutocomplete
          value={address}
          onChange={setAddress}
          onSubmit={onAddressFetch}
          disabled={propLoading}
        />
        <button
          type="button"
          className="app-btn"
          style={{ borderRadius: 8, padding: '9px 16px' }}
          disabled={propLoading || !address.trim()}
          onClick={onAddressFetch}
        >
          {propLoading ? 'Loading…' : 'Fetch →'}
        </button>
      </div>

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
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STRATEGIES.map(s => (
            <Chip key={s} active={s === strategy} onClick={() => setStrategy(s)}>
              {s}
            </Chip>
          ))}
        </div>
        <ModelToggle value={model} onChange={setModel} allowed={allowedModels} />
      </div>

      {showEmpty && <AnalyzeEmpty onPickStrategy={setStrategy} />}

      {propLoading && (
        <div style={{ marginBottom: 22 }}>
          <LoadingDot label="Pulling property data from RentCast..." />
        </div>
      )}

      {propError && (
        <div style={{ marginBottom: 22 }}>
          <AlertBox kind="error">{propError}</AlertBox>
        </div>
      )}

      {propData && edited && (
        <PropertyEditCard
          strategy={strategy}
          value={edited}
          onChange={updateEdited}
          onRunAnalysis={onAnalyze}
          submitting={analysisLoading || proMax.isRunning}
        />
      )}

      {propData && (analysisLoading || proMax.isRunning) && (
        <div style={{ marginTop: 16 }}>
          <LoadingDot
            label={
              isProMaxMode
                ? `Running parallel analysis (${proMax.completedCount}/${proMax.totalModels})…`
                : progressStep || 'Running analysis…'
            }
          />
        </div>
      )}

      {rateLimit && (
        <div style={{ marginTop: 18 }}>
          <AlertBox kind="warn">
            Rate limit reached. Please wait {Math.ceil(rateLimit.retryAfter / 60)} minute
            {rateLimit.retryAfter >= 120 ? 's' : ''} before running another analysis.
            {tier === 'free' && (
              <>
                {' '}
                <Link href="/pricing" style={{ color: 'var(--indigo-hover)', textDecoration: 'none' }}>
                  Upgrade to Pro for unlimited analyses →
                </Link>
              </>
            )}
          </AlertBox>
        </div>
      )}

      {analysisError && !rateLimit && (
        <div style={{ marginTop: 18 }}>
          <AlertBox kind="error">{analysisError}</AlertBox>
        </div>
      )}

      {/* ------------- Pro Max 3-model comparison (Fix 4) ------------- */}
      {isProMaxMode && (proMax.isRunning || proMax.completedCount > 0) && (
        <section style={{ marginTop: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              AI CONSENSUS ({proMax.completedCount}/{proMax.totalModels})
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {proMax.modelResults.map((mr, i) => {
              const modelCfg = PRO_MAX_MODELS[i]
              const parsed = mr.parsedResult as V3AnalysisResult | null
              return (
                <ProMaxCard
                  key={mr.modelId}
                  idx={i}
                  cfg={modelCfg}
                  modelLabel={mr.modelLabel}
                  parsed={parsed}
                  status={mr.status}
                  error={mr.error}
                  progressDetail={mr.progressSteps.at(-1)?.detail || ''}
                  expanded={expandedModel === i}
                  onToggle={() => setExpandedModel(prev => (prev === i ? null : i))}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* ------------- Standard single-model results ------------- */}
      {!isProMaxMode && result && (
        <div style={{ marginTop: 24 }}>
          <StatusBar
            value={dealStatus}
            onChange={setDealStatus}
            onSave={onSaveToPipeline}
            saveState={saveState}
          />

          <section style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                Deal score · {result.dealScore != null ? `${result.dealScore}/10` : '—'}
              </span>
              <SignalBadge signal={signal as Signal} />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
              }}
            >
              {[
                { label: 'CAP RATE', value: fmtPct(result.metrics?.capRate), accent: '#34D399' },
                { label: 'CASH-ON-CASH', value: fmtPct(result.metrics?.cashOnCash), accent: '#34D399' },
                {
                  label: 'CF / MO',
                  value:
                    result.cashFlow?.monthlyCashFlow != null
                      ? fmtMoney(result.cashFlow.monthlyCashFlow)
                      : fmtMoney(result.cashFlow?.monthly),
                  accent: 'var(--text)',
                },
                {
                  label: '5-YR ROI',
                  value:
                    result.metrics?.fiveYearROI != null
                      ? fmtPct(result.metrics.fiveYearROI)
                      : fmtPct(result.metrics?.roi),
                  accent: 'var(--indigo-hover)',
                },
              ].map(m => (
                <div
                  key={m.label}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 10,
                    padding: 16,
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
                      fontSize: 30,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      color: m.accent,
                      lineHeight: 1,
                      marginTop: 8,
                    }}
                  >
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {(result.narrative || (result.riskFlags && result.riskFlags.length > 0)) && (
            <section style={{ marginBottom: 20, position: 'relative' }}>
              <div
                style={{
                  filter: narrativeBlurred ? 'blur(4px)' : 'none',
                  pointerEvents: narrativeBlurred ? 'none' : 'auto',
                }}
              >
                {result.narrative && (
                  <div
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 12,
                      padding: 20,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        color: 'var(--indigo-hover)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      AI NARRATIVE
                    </div>
                    <p style={{ margin: '10px 0 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                      {result.narrative}
                    </p>
                    {result.marketContext && (
                      <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        {result.marketContext}
                      </p>
                    )}
                  </div>
                )}
                {result.riskFlags && result.riskFlags.length > 0 && (
                  <div
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 12,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.12em',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        marginBottom: 10,
                      }}
                    >
                      RISK FLAGS
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {result.riskFlags.map((flag, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 9,
                              letterSpacing: '0.1em',
                              color:
                                flag.severity === 'high'
                                  ? '#F87171'
                                  : flag.severity === 'medium'
                                    ? '#FBBF24'
                                    : 'var(--text-muted)',
                              textTransform: 'uppercase',
                              flexShrink: 0,
                              marginTop: 3,
                            }}
                          >
                            [{flag.severity}]
                          </span>
                          <span>
                            <strong style={{ color: 'var(--text)', fontWeight: 500 }}>{flag.flag}</strong>
                            {flag.detail ? ` — ${flag.detail}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {narrativeBlurred && <UpgradeOverlay message="Upgrade to Pro to unlock full analysis" />}
            </section>
          )}

          {strategy === 'BRRRR' && result.proForma && (
            <section style={{ marginBottom: 12 }}>
              <AnalysisAccordion title="BRRRR Waterfall" subtitle="Acquisition → rehab → refi" defaultOpen>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                  {[
                    { label: 'Purchase', value: fmtMoney(result.proForma.purchasePrice as number | null | undefined) },
                    { label: 'Rehab', value: fmtMoney(result.proForma.rehabCost as number | null | undefined) },
                    { label: 'Total In', value: fmtMoney(result.proForma.totalInvestment as number | null | undefined) },
                    {
                      label: 'ARV',
                      value: fmtMoney(
                        (result.proForma.arvEstimate as number | null | undefined) ?? result.metrics?.arvEstimate
                      ),
                    },
                    {
                      label: 'Refi (75% ARV)',
                      value: result.proForma.arvEstimate
                        ? fmtMoney((result.proForma.arvEstimate as number) * 0.75)
                        : '—',
                    },
                    {
                      label: 'Cash Left In',
                      value: fmtMoney(
                        result.proForma.totalInvestment && result.proForma.arvEstimate
                          ? (result.proForma.totalInvestment as number) -
                              (result.proForma.arvEstimate as number) * 0.75
                          : null
                      ),
                    },
                    { label: 'Monthly Cash Flow', value: fmtMoney(result.cashFlow?.monthly) },
                    { label: 'CoC Return', value: fmtPct(result.metrics?.cashOnCash) },
                  ].map(row => (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--hairline)',
                        padding: '8px 0',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </AnalysisAccordion>
            </section>
          )}

          {propData?.comparables?.rentals && propData.comparables.rentals.length > 0 && (
            <section style={{ marginBottom: 12 }}>
              <AnalysisAccordion title="Rent Comps" subtitle="Closest matched rentals">
                <div>
                  {propData.comparables.rentals.slice(0, 3).map((c, i, arr) => (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        gap: 12,
                        padding: '10px 0',
                        borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--hairline)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: 'var(--text)' }}>{c.formattedAddress || c.address || '—'}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {c.bedrooms ?? '?'}/{c.bathrooms ?? '?'}
                      </span>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{fmtMoney(c.rent ?? null)}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {c.distance != null ? `${c.distance.toFixed(2)} mi` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </AnalysisAccordion>
            </section>
          )}

          {result.metrics?.capRate != null && result.metrics.cashOnCash != null && result.cashFlow?.monthly != null && (
            <section style={{ marginBottom: 12 }}>
              <AnalysisAccordion title="Stress Test" subtitle="Base / Conservative / Bear">
                <div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                      gap: 12,
                      padding: '8px 0',
                      borderBottom: '1px solid var(--hairline)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.12em',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>Scenario</span>
                    <span>Cap</span>
                    <span>CoC</span>
                    <span>CF/mo</span>
                  </div>
                  {[
                    { name: 'Base', factor: 1.0 },
                    { name: 'Conservative (−10%)', factor: 0.9 },
                    { name: 'Bear (−20%)', factor: 0.8 },
                  ].map((sc, i, arr) => (
                    <div
                      key={sc.name}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                        gap: 12,
                        padding: '10px 0',
                        borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--hairline)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: 'var(--text)' }}>{sc.name}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                        {fmtPct((result.metrics?.capRate ?? 0) * sc.factor)}
                      </span>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                        {fmtPct((result.metrics?.cashOnCash ?? 0) * sc.factor)}
                      </span>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                        {fmtMoney((result.cashFlow?.monthly ?? 0) * sc.factor)}
                      </span>
                    </div>
                  ))}
                </div>
              </AnalysisAccordion>
            </section>
          )}

          {result.recommendation && (
            <section style={{ marginBottom: 12 }}>
              <AnalysisAccordion title="Offer Recommendation" subtitle="AI suggested action">
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {result.recommendation}
                </p>
              </AnalysisAccordion>
            </section>
          )}

          {isDev && (
            <section style={{ marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setShowRaw(v => !v)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--hairline)',
                  color: 'var(--text-muted)',
                  borderRadius: 6,
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                }}
              >
                {showRaw ? 'Hide raw response' : 'Show raw response (dev)'}
              </button>
              {showRaw && (
                <pre
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    background: 'var(--bg)',
                    border: '1px solid var(--hairline)',
                    padding: 12,
                    borderRadius: 8,
                    overflow: 'auto',
                    marginTop: 8,
                    color: 'var(--text-secondary)',
                    maxHeight: 500,
                  }}
                >
                  {JSON.stringify({ result, calculations }, null, 2)}
                </pre>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
