'use client'

import { Suspense, useState, useEffect, useRef, useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SignalBadge from '@/components/v3/public/SignalBadge'
import AnalysisAccordion from '@/components/v3/app/AnalysisAccordion'
import AddressAutocomplete from '@/components/v3/app/AddressAutocomplete'
import ThinkingUI, { type ThinkingStep } from '@/components/v3/app/ThinkingUI'
import DealParametersPanel, {
  dealDefaultsFor,
  apiLoanTypeFor,
  isCashLoan,
  type DealParams,
  type DealStrategy,
} from '@/components/v3/app/DealParametersPanel'
import { FlipChart, HoldChart } from '@/components/v3/app/ProjectionCharts'
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

type Strategy = DealStrategy
const STRATEGIES: Strategy[] = ['BRRRR', 'Fix & Flip', 'Buy & Hold', 'House Hack']

type ModelTier = 'speed' | 'balanced' | 'max'
const MODEL_OPTIONS: { key: ModelTier; label: string; sub: string }[] = [
  { key: 'speed', label: 'Speed', sub: 'GPT-4o-mini' },
  { key: 'balanced', label: 'Balanced', sub: 'Sonnet + GPT-4.1' },
  { key: 'max', label: 'Max IQ', sub: 'Opus + GPT-4o + Grok 3' },
]

type ArvConfidence = 'Low' | 'Mid' | 'High'

const PROPERTY_TYPES = ['Single Family', 'Multi-Family', 'Condo', 'Townhouse'] as const
type PropertyTypeOpt = (typeof PROPERTY_TYPES)[number]

type UnitRent = {
  unitNumber: number
  bedrooms: string
  bathrooms: string
  monthlyRent: string
}

type EditForm = {
  purchasePrice: string
  estimatedValue: string
  estimatedRent: string
  beds: string
  baths: string
  sqft: string
  yearBuilt: string
  arv: string
  arvConfidence: ArvConfidence
  rehabCost: string
  propertyType: string
  unitCount: string
  unitRents: UnitRent[]
}

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
    propertyTaxes?: number | null
    listing?: {
      price?: number | null
      listedDate?: string | null
      status?: string | null
    } | null
  }
  rental?: {
    rentEstimate?: number
    rentRangeLow?: number
    rentRangeHigh?: number
  }
  arvAnalysis?: {
    arvEstimate?: number
    arvLow?: number
    arvMid?: number
    arvHigh?: number
    compsUsed?: number
    confidence?: string
  }
  comparables?: {
    value?: number
    sales?: Array<Record<string, unknown>>
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
  if (n == null || !Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n).toLocaleString()}`
}

function fmtMoneyFull(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `$${Math.round(n).toLocaleString('en-US')}`
}

function fmtMonthly(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `${fmtMoney(n)}/mo`
}

function fmtYearly(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `${fmtMoney(n)}/yr`
}

function fmtPct(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `${n.toFixed(1)}%`
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

function inferUnitCount(propertyType: string | undefined): number {
  const pt = (propertyType || '').toLowerCase()
  if (pt.includes('duplex')) return 2
  if (pt.includes('triplex')) return 3
  if (
    pt.includes('fourplex') ||
    pt.includes('quadplex') ||
    pt.includes('4-plex') ||
    pt.includes('4 plex')
  )
    return 4
  return 1
}

function pickPurchasePrice(pd: PropertyData): number | undefined {
  const listing = pd.property?.listing?.price
  if (typeof listing === 'number' && listing > 0) return listing
  const avm = pd.property?.estimatedValue
  if (typeof avm === 'number' && avm > 0) return avm
  const comps = pd.comparables?.value
  if (typeof comps === 'number' && comps > 0) return comps
  return undefined
}

function pickListPrice(pd: PropertyData): number | undefined {
  const v = pd.property?.listing?.price ?? pd.property?.listPrice
  return typeof v === 'number' && v > 0 ? v : undefined
}

function pickAvm(pd: PropertyData): number | undefined {
  const v = pd.property?.estimatedValue ?? pd.comparables?.value
  return typeof v === 'number' && v > 0 ? v : undefined
}

function pickArvLowMidHigh(pd: PropertyData, avm: number | undefined) {
  const a = pd.arvAnalysis
  const baseLow = a?.arvLow ?? (avm ? avm * 1.05 : undefined)
  const baseMid = a?.arvMid ?? a?.arvEstimate ?? (avm ? avm * 1.15 : undefined)
  const baseHigh = a?.arvHigh ?? (avm ? avm * 1.25 : undefined)
  return {
    low: baseLow ? Math.round(baseLow) : undefined,
    mid: baseMid ? Math.round(baseMid) : undefined,
    high: baseHigh ? Math.round(baseHigh) : undefined,
  }
}

function pickArv(pd: PropertyData): number | undefined {
  return pickArvLowMidHigh(pd, pickAvm(pd)).mid
}

function inferPropertyTypeOpt(raw: string | undefined): string {
  const pt = (raw || '').toLowerCase()
  if (pt.includes('condo')) return 'Condo'
  if (pt.includes('town')) return 'Townhouse'
  if (
    pt.includes('duplex') ||
    pt.includes('triplex') ||
    pt.includes('fourplex') ||
    pt.includes('quadplex') ||
    pt.includes('multi') ||
    pt.includes('4-plex') ||
    pt.includes('4 plex') ||
    pt.includes('2 unit') ||
    pt.includes('3 unit') ||
    pt.includes('4 unit')
  ) {
    return 'Multi-Family'
  }
  return 'Single Family'
}

function seedUnitRents(count: number, totalRent: number, beds: string, baths: string): UnitRent[] {
  const perUnit = count > 0 ? Math.round(totalRent / count) : 0
  return Array.from({ length: Math.max(1, count) }, (_, i) => ({
    unitNumber: i + 1,
    bedrooms: beds,
    bathrooms: baths,
    monthlyRent: perUnit > 0 ? String(perUnit) : '',
  }))
}

function makeInitialForm(strategy: Strategy, pd: PropertyData): EditForm {
  const avm = pickAvm(pd)
  const purchase = pickPurchasePrice(pd) ?? avm ?? 0
  const arvMid = pickArvLowMidHigh(pd, avm).mid ?? (avm ? Math.round(avm * 1.15) : 0)
  const beds = pd.property?.beds ?? pd.property?.bedrooms
  const baths = pd.property?.baths ?? pd.property?.bathrooms
  const sqft = pd.property?.sqft ?? pd.property?.squareFootage
  const rent = pd.rental?.rentEstimate ?? pd.property?.estimatedRent
  const units = inferUnitCount(pd.property?.propertyType)
  const propertyType = inferPropertyTypeOpt(pd.property?.propertyType)
  const bedsStr = beds != null ? String(beds) : ''
  const bathsStr = baths != null ? String(baths) : ''
  return {
    purchasePrice: purchase ? String(purchase) : '',
    estimatedValue: avm ? String(avm) : purchase ? String(purchase) : '',
    estimatedRent: rent != null ? String(rent) : '',
    beds: bedsStr,
    baths: bathsStr,
    sqft: sqft != null ? String(sqft) : '',
    yearBuilt: pd.property?.yearBuilt != null ? String(pd.property.yearBuilt) : '',
    arv: arvMid ? String(arvMid) : '',
    arvConfidence: 'Mid',
    rehabCost: strategy === 'Fix & Flip' || strategy === 'BRRRR' ? '40000' : '0',
    propertyType,
    unitCount: String(units),
    unitRents: seedUnitRents(units, typeof rent === 'number' ? rent : 0, bedsStr, bathsStr),
  }
}

/* ------------------------ body builder ------------------------ */

function buildAnalyzeBody(
  address: string,
  strategy: Strategy,
  propertyData: PropertyData,
  form: EditForm,
  params: DealParams
): Record<string, unknown> {
  const purchasePrice = toNum(form.purchasePrice) ?? pickPurchasePrice(propertyData) ?? 0
  const estimatedValue =
    toNum(form.estimatedValue) ?? pickAvm(propertyData) ?? purchasePrice
  const arv = toNum(form.arv) ?? pickArv(propertyData) ?? estimatedValue
  const rehab = toNum(form.rehabCost) ?? 0
  const dpPercent = toNum(params.downPaymentPercent) ?? 20
  const interestRate = toNum(params.interestRate) ?? 7.5
  const term = toNum(params.loanTerm) ?? 30
  const points = toNum(params.points) ?? 0
  const holdingMonths = toNum(params.holdingMonths)
  const closingPct = toNum(params.closingCosts) ?? 3
  const sellClosingPct = toNum(params.sellClosingCosts) ?? 6
  const propertyTax = toNum(params.propertyTax)
  const insurance = toNum(params.insurance)

  const units = Math.max(1, toNum(form.unitCount) || 1)
  const isMultifamily = units > 1
  const rentRollTotal = isMultifamily
    ? form.unitRents.reduce((sum, u) => sum + (toNum(u.monthlyRent) || 0), 0)
    : 0
  const monthlyRent =
    isMultifamily && rentRollTotal > 0
      ? rentRollTotal
      : toNum(form.estimatedRent) ?? propertyData.rental?.rentEstimate

  const mergedPropertyData = {
    ...propertyData,
    property: {
      ...(propertyData.property || {}),
      bedrooms: toNum(form.beds) ?? propertyData.property?.bedrooms ?? propertyData.property?.beds,
      bathrooms: toNum(form.baths) ?? propertyData.property?.bathrooms ?? propertyData.property?.baths,
      squareFootage:
        toNum(form.sqft) ?? propertyData.property?.squareFootage ?? propertyData.property?.sqft,
      yearBuilt: toNum(form.yearBuilt) ?? propertyData.property?.yearBuilt,
      propertyType: form.propertyType || propertyData.property?.propertyType,
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

  const unitBreakdown = isMultifamily
    ? form.unitRents.slice(0, units).map(u => ({
        unitNumber: u.unitNumber,
        bedrooms: toNum(u.bedrooms) || 2,
        bathrooms: toNum(u.bathrooms) || 1,
        monthlyRent: toNum(u.monthlyRent) || 0,
      }))
    : undefined

  return {
    address,
    strategy: apiStrategyFor(strategy),
    purchasePrice,
    downPayment: Math.round(purchasePrice * (dpPercent / 100)),
    loanTerms: {
      interestRate,
      loanTerm: term,
      loanType: apiLoanTypeFor(params.loanType),
      points,
    },
    rehabCosts: strategy === 'BRRRR' || strategy === 'Fix & Flip' ? rehab : undefined,
    arv: strategy === 'BRRRR' || strategy === 'Fix & Flip' ? arv : undefined,
    holdingPeriod: holdingMonths,
    strategyDetails: {
      downPaymentPercent: dpPercent,
      exitStrategy: strategy === 'BRRRR' ? '75' : undefined,
      arvConfidence: strategy === 'BRRRR' || strategy === 'Fix & Flip' ? form.arvConfidence : undefined,
      loanType: params.loanType,
      timeline: holdingMonths != null ? String(holdingMonths) : undefined,
    },
    closingCostsPercent: closingPct,
    sellClosingCostsPercent: sellClosingPct,
    propertyTax,
    insurance,
    vacancyRate: toNum(params.vacancyRate) ?? 8,
    maintenancePercent: toNum(params.maintenancePercent) ?? 10,
    capexPercent: toNum(params.capexPercent) ?? 10,
    propertyManagementPercent: toNum(params.propertyManagementPercent) ?? 8,
    units,
    monthlyRent,
    propertyData: mergedPropertyData,
    ...(unitBreakdown ? { unitBreakdown } : {}),
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
  children: ReactNode
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

function AlertBox({ kind, children }: { kind: 'error' | 'warn' | 'info'; children: ReactNode }) {
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

function SectionLabel({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: color || 'var(--indigo-hover)',
        textTransform: 'uppercase',
        fontWeight: 600,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  )
}

/* --------------------- editable property panel --------------------- */

const pFieldLabel: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.08em',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}
const pFieldInput: React.CSSProperties = {
  width: '100%',
  background: 'var(--elevated)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '9px 12px',
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 140ms ease',
}

function PField({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label style={pFieldLabel}>{label}</label>
      {children}
    </div>
  )
}

function PInput({
  value,
  onChange,
  inputMode,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  inputMode?: 'numeric' | 'decimal' | 'text'
  placeholder?: string
}) {
  return (
    <input
      type="text"
      inputMode={inputMode || 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={pFieldInput}
      onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    />
  )
}

function PillRow<T extends string | number>({
  options,
  value,
  onChange,
  formatLabel,
  sublabels,
  prominent,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  formatLabel?: (v: T) => string
  sublabels?: Record<string, string>
  prominent?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = opt === value
        const label = formatLabel ? formatLabel(opt) : String(opt)
        const sub = sublabels?.[String(opt)]
        return (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              background: active
                ? prominent
                  ? 'var(--indigo)'
                  : 'var(--indigo-dim)'
                : 'var(--elevated)',
              color: active ? (prominent ? '#fff' : 'var(--indigo-hover)') : 'var(--text-secondary)',
              border: `1px solid ${active ? (prominent ? 'var(--indigo)' : 'var(--border-strong)') : 'var(--border)'}`,
              borderRadius: 8,
              padding: prominent ? '10px 20px' : '5px 12px',
              fontFamily: prominent ? 'var(--font-sans)' : 'var(--font-mono)',
              fontSize: prominent ? 14 : 11,
              fontWeight: prominent ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 140ms ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              minWidth: prominent ? 96 : undefined,
            }}
          >
            <span>{label}</span>
            {sub && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: active && prominent ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
                  fontWeight: 400,
                }}
              >
                {sub}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function QuickFillBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'var(--elevated)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '6px 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 140ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-strong)'
        e.currentTarget.style.color = 'var(--text)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      {label}
    </button>
  )
}

function EditablePanel({
  strategy,
  propertyData,
  form,
  onChange,
}: {
  strategy: Strategy
  propertyData: PropertyData
  form: EditForm
  onChange: (patch: Partial<EditForm>) => void
}) {
  const avm = pickAvm(propertyData)
  const listPrice = pickListPrice(propertyData)
  const arvValues = pickArvLowMidHigh(propertyData, toNum(form.estimatedValue) ?? avm)
  const sqft = toNum(form.sqft) ?? 0
  const rehabLight = Math.round(sqft * 15)
  const rehabStandard = Math.round(sqft * 35)
  const rehabExtensive = Math.round(sqft * 65)

  const showBrrrFlip = strategy === 'BRRRR' || strategy === 'Fix & Flip'

  const unitCount = Math.max(1, toNum(form.unitCount) || 1)
  const isMultifamily = unitCount > 1
  const rentRollTotal = form.unitRents.reduce((sum, u) => sum + (toNum(u.monthlyRent) || 0), 0)

  const setUnitCount = (raw: string) => {
    const parsed = parseInt(raw, 10)
    const next = Number.isFinite(parsed) && parsed >= 1 ? Math.min(parsed, 50) : 1
    let rents = form.unitRents.slice()
    if (next > rents.length) {
      const add = Array.from({ length: next - rents.length }, (_, i) => ({
        unitNumber: rents.length + i + 1,
        bedrooms: form.beds,
        bathrooms: form.baths,
        monthlyRent: rents[0]?.monthlyRent || '',
      }))
      rents = [...rents, ...add]
    } else if (next < rents.length) {
      rents = rents.slice(0, next)
    }
    onChange({ unitCount: String(next), unitRents: rents })
  }

  const updateUnitRent = (idx: number, patch: Partial<UnitRent>) => {
    const next = form.unitRents.map((u, i) => (i === idx ? { ...u, ...patch } : u))
    onChange({ unitRents: next })
  }

  const removeUnit = (idx: number) => {
    if (form.unitRents.length <= 1) return
    const next = form.unitRents.filter((_, i) => i !== idx).map((u, i) => ({ ...u, unitNumber: i + 1 }))
    onChange({ unitRents: next, unitCount: String(next.length) })
  }

  const applyFirstUnitRentToAll = () => {
    const first = form.unitRents[0]?.monthlyRent || ''
    onChange({ unitRents: form.unitRents.map(u => ({ ...u, monthlyRent: first })) })
  }

  const setArvFromConfidence = (c: ArvConfidence) => {
    const v = c === 'Low' ? arvValues.low : c === 'High' ? arvValues.high : arvValues.mid
    onChange({
      arvConfidence: c,
      ...(v && v > 0 ? { arv: String(v) } : {}),
    })
  }

  const arvHintValue =
    toNum(form.arv) ?? arvValues.mid ?? (avm ? Math.round(avm * 1.15) : undefined)

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 12,
        padding: 22,
        marginTop: 16,
      }}
    >
      <SectionLabel>PROPERTY DATA — VERIFY BEFORE ANALYSIS</SectionLabel>

      {/* purchase price */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ ...pFieldLabel, color: 'var(--indigo-hover)', fontWeight: 600, fontSize: 10 }}>
          PURCHASE PRICE
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={form.purchasePrice}
          onChange={e => onChange({ purchasePrice: e.target.value })}
          placeholder="0"
          style={{
            width: '100%',
            background: 'var(--bg)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            padding: '12px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text)',
            outline: 'none',
            transition: 'border-color 140ms ease, box-shadow 140ms ease',
          }}
          onFocus={e => {
            e.currentTarget.style.border = '2px solid var(--indigo)'
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--indigo-dim)'
          }}
          onBlur={e => {
            e.currentTarget.style.border = '1px solid var(--border-strong)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {listPrice && (
            <QuickFillBtn
              onClick={() => onChange({ purchasePrice: String(listPrice) })}
              label={`↑ Use List Price  ${fmtMoneyFull(listPrice)}`}
            />
          )}
          {avm && (
            <QuickFillBtn
              onClick={() => onChange({ purchasePrice: String(avm) })}
              label={`↑ Use AVM  ${fmtMoneyFull(avm)}`}
            />
          )}
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--hairline)',
          paddingTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}
      >
        <PField label="AVM / Estimated value">
          <PInput
            value={form.estimatedValue}
            onChange={v => onChange({ estimatedValue: v })}
            inputMode="numeric"
          />
        </PField>
        <PField label="Estimated rent / mo">
          <PInput
            value={form.estimatedRent}
            onChange={v => onChange({ estimatedRent: v })}
            inputMode="numeric"
          />
        </PField>
        <PField label="Year built">
          <PInput value={form.yearBuilt} onChange={v => onChange({ yearBuilt: v })} inputMode="numeric" />
        </PField>
        <PField label="Beds">
          <PInput value={form.beds} onChange={v => onChange({ beds: v })} inputMode="numeric" />
        </PField>
        <PField label="Baths">
          <PInput value={form.baths} onChange={v => onChange({ baths: v })} inputMode="decimal" />
        </PField>
        <PField label="Sqft">
          <PInput value={form.sqft} onChange={v => onChange({ sqft: v })} inputMode="numeric" />
        </PField>
      </div>

      {/* Property type selector */}
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--hairline)' }}>
        <PField label="Property Type">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PROPERTY_TYPES.map(pt => {
              const active = (form.propertyType || 'Single Family') === pt
              return (
                <button
                  key={pt}
                  type="button"
                  onClick={() => {
                    const inferredCount = pt === 'Multi-Family' ? Math.max(unitCount, 2) : 1
                    const patch: Partial<EditForm> = { propertyType: pt }
                    if (pt === 'Multi-Family' && unitCount < 2) {
                      const rents = seedUnitRents(
                        inferredCount,
                        toNum(form.estimatedRent) || 0,
                        form.beds,
                        form.baths
                      )
                      patch.unitCount = String(inferredCount)
                      patch.unitRents = rents
                    } else if (pt !== 'Multi-Family' && unitCount > 1) {
                      patch.unitCount = '1'
                      patch.unitRents = form.unitRents.slice(0, 1)
                    }
                    onChange(patch)
                  }}
                  style={{
                    background: active ? 'var(--indigo-dim)' : 'var(--elevated)',
                    color: active ? 'var(--indigo-hover)' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
                    borderRadius: 8,
                    padding: '7px 14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 140ms ease',
                  }}
                >
                  {pt}
                </button>
              )
            })}
          </div>
        </PField>
      </div>

      {/* Units + rent roll (all strategies) */}
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--hairline)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMultifamily ? '120px 1fr' : '120px 1fr',
            gap: 14,
            alignItems: 'end',
          }}
        >
          <PField label="Number of Units">
            <input
              type="text"
              inputMode="numeric"
              value={form.unitCount}
              onChange={e => {
                const raw = e.target.value.replace(/[^0-9]/g, '')
                onChange({ unitCount: raw })
              }}
              onBlur={() => {
                const n = parseInt(form.unitCount, 10)
                if (!Number.isFinite(n) || n < 1) setUnitCount('1')
                else if (n > 50) setUnitCount('50')
                else setUnitCount(String(n))
              }}
              placeholder="1"
              style={pFieldInput}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            />
          </PField>
          {!isMultifamily ? (
            <PField label="Monthly Rent">
              <PInput
                value={form.estimatedRent}
                onChange={v => onChange({ estimatedRent: v })}
                inputMode="numeric"
                placeholder="0"
              />
            </PField>
          ) : (
            <div>
              <label style={pFieldLabel}>Total Rent / mo (sum of rent roll)</label>
              <div
                style={{
                  ...pFieldInput,
                  fontWeight: 600,
                  color: rentRollTotal > 0 ? '#34D399' : 'var(--text-muted)',
                }}
              >
                ${rentRollTotal.toLocaleString()}/mo
              </div>
            </div>
          )}
        </div>

        {isMultifamily && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <SectionLabel color="var(--text-muted)">RENT ROLL</SectionLabel>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: rentRollTotal > 0 ? '#34D399' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                Total: ${rentRollTotal.toLocaleString()}/mo
              </span>
            </div>
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--hairline)',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 72px 72px 1fr 40px',
                  gap: 8,
                  padding: '8px 12px',
                  background: 'var(--elevated)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                <span>Unit</span>
                <span>Beds</span>
                <span>Baths</span>
                <span style={{ textAlign: 'right' }}>Rent/mo</span>
                <span />
              </div>
              {form.unitRents.map((u, idx) => {
                const cellStyle: React.CSSProperties = {
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--hairline)',
                  padding: '4px 6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--text)',
                  outline: 'none',
                  width: '100%',
                }
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '56px 72px 72px 1fr 40px',
                      gap: 8,
                      padding: '10px 12px',
                      alignItems: 'center',
                      borderTop: idx > 0 ? '1px solid var(--hairline)' : 'none',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                      Unit {u.unitNumber}
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={u.bedrooms}
                      onChange={e => updateUnitRent(idx, { bedrooms: e.target.value })}
                      placeholder="2"
                      style={cellStyle}
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={u.bathrooms}
                      onChange={e => updateUnitRent(idx, { bathrooms: e.target.value })}
                      placeholder="1"
                      style={cellStyle}
                    />
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: 6,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          pointerEvents: 'none',
                        }}
                      >
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={u.monthlyRent}
                        onChange={e => updateUnitRent(idx, { monthlyRent: e.target.value })}
                        placeholder="0"
                        style={{
                          ...cellStyle,
                          paddingLeft: 16,
                          textAlign: 'right',
                          fontWeight: 600,
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUnit(idx)}
                      disabled={form.unitRents.length <= 1}
                      title="Remove unit"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 4,
                        color: 'var(--text-muted)',
                        cursor: form.unitRents.length <= 1 ? 'not-allowed' : 'pointer',
                        opacity: form.unitRents.length <= 1 ? 0.3 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
            {form.unitRents.length > 1 && (
              <button
                type="button"
                onClick={applyFirstUnitRentToAll}
                style={{
                  marginTop: 8,
                  background: 'transparent',
                  border: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--indigo-hover)',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                ↑↓ Apply Unit 1 rent to all units
              </button>
            )}
          </div>
        )}
      </div>

      {showBrrrFlip && (
        <div
          style={{
            marginTop: 22,
            paddingTop: 20,
            borderTop: '1px solid var(--hairline)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div>
            <SectionLabel>ARV CONFIDENCE</SectionLabel>
            <PillRow
              options={['Low', 'Mid', 'High'] as const}
              value={form.arvConfidence}
              onChange={setArvFromConfidence}
              prominent
              sublabels={{
                Low: fmtMoneyFull(arvValues.low),
                Mid: fmtMoneyFull(arvValues.mid),
                High: fmtMoneyFull(arvValues.high),
              }}
            />
          </div>

          <PField
            label={
              arvHintValue && arvHintValue > 0
                ? `ARV (Est. ${fmtMoneyFull(arvHintValue)})`
                : 'After repair value (ARV)'
            }
          >
            <PInput value={form.arv} onChange={v => onChange({ arv: v })} inputMode="numeric" />
          </PField>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <SectionLabel>REHAB ESTIMATE</SectionLabel>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                }}
              >
                {sqft > 0 ? `Based on $/sqft · ${sqft.toLocaleString()} sqft` : 'Add sqft to use presets'}
              </span>
            </div>
            <PillRow
              options={['Light', 'Standard', 'Extensive'] as const}
              value={
                toNum(form.rehabCost) === rehabLight
                  ? 'Light'
                  : toNum(form.rehabCost) === rehabStandard
                    ? 'Standard'
                    : toNum(form.rehabCost) === rehabExtensive
                      ? 'Extensive'
                      : 'Standard'
              }
              onChange={c => {
                const v = c === 'Light' ? rehabLight : c === 'Extensive' ? rehabExtensive : rehabStandard
                onChange({ rehabCost: String(v) })
              }}
              prominent
              sublabels={{
                Light: sqft > 0 ? `~${fmtMoneyFull(rehabLight)}` : '$15/sqft',
                Standard: sqft > 0 ? `~${fmtMoneyFull(rehabStandard)}` : '$35/sqft',
                Extensive: sqft > 0 ? `~${fmtMoneyFull(rehabExtensive)}` : '$65/sqft',
              }}
            />
            <div style={{ marginTop: 10 }}>
              <PField label="Rehab cost">
                <PInput value={form.rehabCost} onChange={v => onChange({ rehabCost: v })} inputMode="numeric" />
              </PField>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}

/* ----------------------- status bar ----------------------- */

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

/* ------------------- empty state ------------------- */

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

type RecentDeal = {
  id: string
  address: string
  strategy: string
  cap: number | null
  coc: number | null
  signal: string
}

function AnalyzeEmpty({
  onPickStrategy,
  recentDeals,
}: {
  onPickStrategy: (s: Strategy) => void
  recentDeals: RecentDeal[]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36, marginTop: 8 }}>
      <section>
        <SectionLabel color="var(--text-muted)">Recent analyses</SectionLabel>
        {recentDeals.length === 0 ? (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-muted)',
              padding: '14px 0 4px',
            }}
          >
            Your analyses will appear here.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
            {recentDeals.map(d => {
              const shortAddr = (d.address || '').split(',')[0] || d.address || '—'
              return (
                <div
                  key={d.id}
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
                    {shortAddr}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--indigo-hover)',
                      background: 'var(--indigo-dim)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 4,
                      padding: '2px 8px',
                    }}
                  >
                    {d.strategy}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 18,
                        fontWeight: 600,
                        color: 'var(--indigo-hover)',
                      }}
                    >
                      {d.cap != null ? `${d.cap.toFixed(1)}%` : '—'}
                    </span>
                    <SignalBadge signal={d.signal as Signal} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <SectionLabel color="var(--text-muted)">Strategies</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-muted)', marginTop: 10, textTransform: 'uppercase' }}>
                {s.metricLabel}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: 'var(--indigo-hover)', marginTop: 2 }}>
                {s.metricValue}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel color="var(--text-muted)">How it works</SectionLabel>
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

/* --------------------- property-data fetch --------------------- */

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

/* ------------------ strategy-aware metrics builders ------------------ */

type MetricCell = { label: string; value: string; accent?: string }

function num(
  obj: Record<string, unknown> | undefined | null,
  key: string
): number | undefined {
  if (!obj) return undefined
  const v = (obj as Record<string, unknown>)[key]
  if (typeof v === 'number' && Number.isFinite(v)) return v
  return undefined
}

function aiFinOf(result: V3AnalysisResult): Record<string, number | null | undefined> {
  const fromRaw = ((result.raw as Record<string, unknown> | undefined)?.ai_analysis as
    | Record<string, unknown>
    | undefined)?.financial_metrics as Record<string, number | null | undefined> | undefined
  return fromRaw || {}
}

function pickHhNumber(result: V3AnalysisResult, keys: string[]): number | undefined {
  const raw = (result.raw || {}) as Record<string, unknown>
  const rawMetrics = (raw.metrics || {}) as Record<string, unknown>
  const rawCash = (raw.cashFlow || raw.cash_flow || {}) as Record<string, unknown>
  const fin = aiFinOf(result) as Record<string, unknown>
  const sources: Array<Record<string, unknown>> = [raw, rawMetrics, rawCash, fin]
  for (const src of sources) {
    for (const k of keys) {
      const v = src[k]
      if (typeof v === 'number' && Number.isFinite(v)) return v
    }
  }
  return undefined
}

function houseHackCashFlow(result: V3AnalysisResult): number | undefined {
  // cashFlow convention: positive = savings, negative = cost
  const direct =
    (result.cashFlow?.monthly as number | undefined) ??
    (result.cashFlow?.monthlyCashFlow as number | undefined)
  if (typeof direct === 'number' && Number.isFinite(direct)) return direct
  const savings = pickHhNumber(result, [
    'monthlyHousingSavings',
    'monthly_housing_savings',
    'housingOffset',
    'housing_offset',
  ])
  if (savings != null) return savings
  const cost = pickHhNumber(result, [
    'effectiveMortgage',
    'effective_mortgage',
    'outOfPocketHousingCost',
    'out_of_pocket_housing_cost',
    'effectiveHousingCost',
    'effective_housing_cost',
  ])
  if (cost != null) return -Math.abs(cost)
  return undefined
}

function primaryMetricsFor(
  strategy: Strategy,
  result: V3AnalysisResult,
  calc: Record<string, unknown> | null,
  form: EditForm | null,
  params: DealParams
): MetricCell[] {
  const fin = aiFinOf(result)
  const proForma = (result.proForma || {}) as Record<string, unknown>
  const purchase = toNum(form?.purchasePrice) ?? 0
  const rehab = toNum(form?.rehabCost) ?? 0
  const arv = toNum(form?.arv) ?? (result.metrics?.arvEstimate ?? 0)
  const closingPct = toNum(params.closingCosts) ?? 3
  const sellClosingPct = toNum(params.sellClosingCosts) ?? 6
  const holdingMonths = toNum(params.holdingMonths) ?? 6
  const dpPct = toNum(params.downPaymentPercent) ?? 20
  const rate = toNum(params.interestRate) ?? 7.5

  if (strategy === 'Fix & Flip') {
    const closing = purchase * (closingPct / 100)
    const loanBalance = purchase * (1 - dpPct / 100)
    const monthlyInterest = (loanBalance * (rate / 100)) / 12
    const holdingCost = monthlyInterest * holdingMonths
    const totalCost =
      num(calc, 'totalProjectCost') ??
      (num(proForma, 'totalCost') as number | undefined) ??
      purchase + rehab + closing + holdingCost
    const sellClosing = arv * (sellClosingPct / 100)
    const gross =
      (fin.gross_profit as number | undefined) ??
      (arv && totalCost ? arv - totalCost : undefined)
    const net =
      (fin.net_profit as number | undefined) ??
      (gross != null ? gross - sellClosing : undefined)
    const roi =
      (fin.roi_percent as number | undefined) ??
      (net != null && totalCost ? (net / totalCost) * 100 : undefined)
    const maxOffer = arv > 0 ? arv * 0.85 - rehab : 0
    return [
      { label: 'NET PROFIT', value: fmtMoney(net), accent: (net ?? 0) >= 0 ? '#34D399' : '#F87171' },
      { label: 'ROI', value: fmtPct(roi), accent: '#34D399' },
      {
        label: 'DEAL SCORE',
        value: result.dealScore != null ? `${result.dealScore}/10` : '—',
        accent: 'var(--indigo-hover)',
      },
      { label: 'MAX OFFER', value: fmtMoney(maxOffer), accent: 'var(--text)' },
    ]
  }

  if (strategy === 'House Hack') {
    const cf =
      houseHackCashFlow(result) ??
      pickHhNumber(result, ['monthlyNet', 'monthly_net', 'net'])
    const grossRent =
      result.cashFlow?.grossRent ??
      pickHhNumber(result, ['grossRent', 'gross_rent', 'gross', 'grossMonthly', 'gross_monthly']) ??
      toNum(form?.estimatedRent)
    const monthlyHousingCost = cf != null ? cf : null
    const offsetPct =
      (fin.offset_percent as number | undefined) ??
      pickHhNumber(result, ['offsetPercent', 'offset_percent']) ??
      (grossRent != null && monthlyHousingCost != null && grossRent > 0
        ? (grossRent / Math.max(1, grossRent - monthlyHousingCost)) * 100
        : undefined)
    const coc =
      result.metrics?.cashOnCash ??
      pickHhNumber(result, ['cash_on_cash', 'housingROI', 'housing_roi', 'housingCocReturn', 'housing_coc_return'])
    return [
      {
        label: 'HOUSING COST / MO',
        value:
          monthlyHousingCost != null
            ? monthlyHousingCost <= 0
              ? `+${fmtMoney(Math.abs(monthlyHousingCost))}`
              : fmtMoney(monthlyHousingCost)
            : '—',
        accent: (monthlyHousingCost ?? 1) <= 0 ? '#34D399' : '#FBBF24',
      },
      { label: 'OFFSET %', value: fmtPct(offsetPct), accent: 'var(--indigo-hover)' },
      { label: 'CASH-ON-CASH', value: fmtPct(coc), accent: '#34D399' },
      {
        label: 'DEAL SCORE',
        value: result.dealScore != null ? `${result.dealScore}/10` : '—',
        accent: 'var(--indigo-hover)',
      },
    ]
  }

  // BRRRR + Buy & Hold share the primary layout
  const monthly =
    result.cashFlow?.monthlyCashFlow != null
      ? result.cashFlow.monthlyCashFlow
      : (result.cashFlow?.monthly as number | undefined)
  const five =
    result.metrics?.fiveYearROI != null
      ? result.metrics.fiveYearROI
      : (result.metrics?.roi as number | undefined)

  return [
    { label: 'CAP RATE', value: fmtPct(result.metrics?.capRate), accent: '#34D399' },
    { label: 'CASH-ON-CASH', value: fmtPct(result.metrics?.cashOnCash), accent: '#34D399' },
    { label: 'CF / MONTH', value: fmtMoney(monthly), accent: 'var(--text)' },
    {
      label: strategy === 'BRRRR' ? 'DEAL SCORE' : '5-YR ROI',
      value:
        strategy === 'BRRRR'
          ? result.dealScore != null
            ? `${result.dealScore}/10`
            : '—'
          : fmtPct(five),
      accent: 'var(--indigo-hover)',
    },
  ]
}

function secondaryMetricsFor(
  strategy: Strategy,
  result: V3AnalysisResult,
  calc: Record<string, unknown> | null,
  form: EditForm | null,
  params: DealParams
): MetricCell[] {
  const fin = aiFinOf(result)
  const proForma = (result.proForma || {}) as Record<string, unknown>
  const purchase = toNum(form?.purchasePrice) ?? 0
  const rehab = toNum(form?.rehabCost) ?? 0
  const arv = toNum(form?.arv) ?? (result.metrics?.arvEstimate ?? 0)
  const closingPct = toNum(params.closingCosts) ?? 3
  const holdingMonths = toNum(params.holdingMonths) ?? 6
  const dpPct = toNum(params.downPaymentPercent) ?? 20
  const rate = toNum(params.interestRate) ?? 7.5

  if (strategy === 'Fix & Flip') {
    const closing = purchase * (closingPct / 100)
    const loanBalance = purchase * (1 - dpPct / 100)
    const monthlyInterest = (loanBalance * (rate / 100)) / 12
    const holdingCost = monthlyInterest * holdingMonths
    const totalCost =
      num(calc, 'totalProjectCost') ??
      (num(proForma, 'totalCost') as number | undefined) ??
      purchase + rehab + closing + holdingCost
    const projectedSale =
      num(proForma, 'projectedSalePrice') ?? arv
    return [
      { label: 'TOTAL COST', value: fmtMoney(totalCost) },
      { label: 'PROJECTED SALE', value: fmtMoney(projectedSale) },
      { label: 'GROSS PROFIT', value: fmtMoney(fin.gross_profit) },
      { label: 'HOLD PERIOD', value: `${holdingMonths} mo` },
    ]
  }

  if (strategy === 'BRRRR') {
    const refiProceeds = arv > 0 ? arv * 0.75 : undefined
    const totalIn =
      (num(proForma, 'totalInvestment') as number | undefined) ??
      (purchase && rehab ? purchase + rehab : undefined)
    const cashLeftIn =
      totalIn && refiProceeds ? Math.max(0, totalIn - refiProceeds) : undefined
    return [
      { label: 'ARV', value: fmtMoney(arv) },
      { label: 'REFI @ 75%', value: fmtMoney(refiProceeds) },
      { label: 'CASH LEFT IN', value: fmtMoney(cashLeftIn) },
      { label: 'EQUITY CAPTURE', value: fmtMoney(result.metrics?.equityCapture) },
    ]
  }

  if (strategy === 'House Hack') {
    const grossRent =
      result.cashFlow?.grossRent ??
      pickHhNumber(result, ['grossRent', 'gross_rent', 'gross', 'grossMonthly', 'gross_monthly']) ??
      toNum(form?.estimatedRent)
    const cf =
      houseHackCashFlow(result) ??
      pickHhNumber(result, ['monthlyNet', 'monthly_net', 'net'])
    const effectiveHousing = cf != null ? Math.abs(cf) : undefined
    const units = Math.max(1, toNum(form?.unitCount) || 1)
    const rentPerUnit = grossRent != null && units > 0 ? grossRent / units : undefined
    return [
      { label: 'GROSS RENT', value: fmtMonthly(grossRent) },
      { label: 'EFFECTIVE HOUSING', value: fmtMonthly(effectiveHousing) },
      { label: 'UNITS', value: String(units) },
      { label: 'RENT / UNIT', value: fmtMonthly(rentPerUnit) },
      {
        label: 'DEAL SCORE',
        value: result.dealScore != null ? `${result.dealScore}/10` : '—',
      },
      { label: 'CASH-ON-CASH', value: fmtPct(result.metrics?.cashOnCash) },
    ]
  }

  // Buy & Hold
  const monthlyRent = toNum(form?.estimatedRent) ?? 0
  const vacancyPct = toNum(params.vacancyRate) ?? 8
  const rawCash = (result.cashFlow || {}) as Record<string, unknown>
  const rawResult = result as unknown as Record<string, unknown>
  const grossRent =
    result.cashFlow?.grossRent ??
    (rawCash.gross as number | undefined) ??
    (monthlyRent > 0 ? monthlyRent : undefined)
  const vacancyLoss =
    result.cashFlow?.vacancyLoss ??
    (rawCash.vacancy as number | undefined) ??
    (monthlyRent > 0 ? -(monthlyRent * (vacancyPct / 100)) : undefined)
  const noi =
    result.metrics?.netOperatingIncome ??
    result.metrics?.noi ??
    (rawCash.netOperatingIncome as number | undefined) ??
    null
  const breakEvenArv =
    result.breakEvenArv ??
    (rawResult.break_even_arv as number | undefined) ??
    (rawResult.breakEven as number | undefined) ??
    null
  const fiveYearEquity =
    result.fiveYearEquity ??
    (rawResult.five_year_equity as number | undefined) ??
    null
  return [
    { label: 'GROSS RENT', value: fmtMonthly(grossRent) },
    { label: 'VACANCY LOSS', value: fmtMonthly(vacancyLoss) },
    { label: 'NOI', value: fmtYearly(noi) },
    { label: 'BREAK-EVEN ARV', value: fmtMoney(breakEvenArv) },
    { label: '5-YR EQUITY', value: fmtMoney(fiveYearEquity) },
    {
      label: 'DEAL SCORE',
      value: result.dealScore != null ? `${result.dealScore}/10` : '—',
    },
  ]
}

function renderBuyHoldWaterfall(
  result: V3AnalysisResult,
  _calc: Record<string, unknown> | null,
  form: EditForm | null,
  params: DealParams
) {
  const purchase = toNum(form?.purchasePrice) ?? 0
  const dpPct = toNum(params.downPaymentPercent) ?? 25
  const closingPct = toNum(params.closingCosts) ?? 3
  const downPayment = Math.round(purchase * (dpPct / 100))
  const closingCosts = Math.round(purchase * (closingPct / 100))
  const cashRequired = downPayment + closingCosts

  const rawCash = (result.cashFlow || {}) as Record<string, unknown>
  const grossRent =
    result.cashFlow?.grossRent ??
    (rawCash.gross as number | undefined) ??
    toNum(form?.estimatedRent) ??
    0
  const vacancyPct = toNum(params.vacancyRate) ?? 8
  const vacancyLoss =
    result.cashFlow?.vacancyLoss ?? -(grossRent * (vacancyPct / 100))
  const effectiveGrossIncome = grossRent + vacancyLoss
  const maintenancePct = toNum(params.maintenancePercent) ?? 10
  const capexPct = toNum(params.capexPercent) ?? 10
  const pmPct = toNum(params.propertyManagementPercent) ?? 8
  const propTax = toNum(params.propertyTax) ?? 0
  const insurance = toNum(params.insurance) ?? 0
  const maintenance = grossRent * (maintenancePct / 100)
  const capex = grossRent * (capexPct / 100)
  const pm = grossRent * (pmPct / 100)
  const totalOpEx =
    Math.abs(vacancyLoss) + maintenance + capex + pm + propTax / 12 + insurance / 12
  const noi =
    result.metrics?.netOperatingIncome ??
    result.metrics?.noi ??
    (effectiveGrossIncome - totalOpEx) * 12
  const annualDebtService = result.proForma?.annualDebtService ?? 0
  const monthlyCF =
    result.cashFlow?.monthlyCashFlow ?? result.cashFlow?.monthly ?? 0
  const capRate =
    result.metrics?.capRate ??
    (noi > 0 && purchase > 0 ? (noi / purchase) * 100 : null)
  const coc = result.metrics?.cashOnCash ?? null
  const dscr =
    noi > 0 && annualDebtService > 0 ? noi / annualDebtService : null
  const fiveYearROI =
    result.metrics?.fiveYearROI ??
    result.metrics?.roi ??
    (result as Record<string, unknown> & { metrics?: Record<string, unknown> })
      .metrics?.five_year_roi as number | null | undefined ??
    (result as Record<string, unknown>).roi as number | null | undefined ??
    null

  const fiveYearEquity =
    result.fiveYearEquity ??
    ((result as Record<string, unknown>).five_year_equity as number | null | undefined) ??
    (() => {
      // Client-side fallback: amortize the loan to month 60 and add 5y at 3%/yr appreciation.
      const p = toNum(form?.purchasePrice) ?? 0
      const dp = toNum(params.downPaymentPercent) ?? 25
      const rt = toNum(params.interestRate) ?? 7.5
      const termYears = toNum(params.loanTerm) ?? 30
      if (p <= 0) return null
      const loanBalance = p * (1 - dp / 100)
      const rMo = rt / 100 / 12
      const n = termYears * 12
      const monthlyPayment =
        rMo > 0
          ? (loanBalance * (rMo * Math.pow(1 + rMo, n))) /
            (Math.pow(1 + rMo, n) - 1)
          : loanBalance / n
      let bal = loanBalance
      for (let m = 0; m < 60; m++) {
        const interest = bal * rMo
        const principal = Math.min(bal, monthlyPayment - interest)
        bal = Math.max(0, bal - principal)
      }
      const propertyValue = p * Math.pow(1.03, 5)
      return Math.round(propertyValue - bal)
    })()

  const breakEvenArv =
    result.breakEvenArv ??
    ((result as Record<string, unknown>).break_even_arv as number | null | undefined) ??
    (() => {
      // Client-side fallback: price at which annual NOI matches annual debt service.
      // breakEvenArv = annualDebtService / capRate (if both known).
      const annualDS = result.proForma?.annualDebtService ?? 0
      const capR = (result.metrics?.capRate ?? 0) / 100
      if (annualDS > 0 && capR > 0) return Math.round(annualDS / capR)
      return null
    })()

  const Row = ({
    label,
    value,
    indent,
    bold,
    color,
    border,
  }: {
    label: string
    value: string
    indent?: boolean
    bold?: boolean
    color?: string
    border?: boolean
  }) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 12,
        padding: '9px 0',
        borderTop: border
          ? '1px solid var(--border-strong)'
          : '1px solid var(--hairline)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
      }}
    >
      <span
        style={{
          color: bold ? 'var(--text)' : 'var(--text-muted)',
          fontWeight: bold ? 600 : 400,
          paddingLeft: indent ? 16 : 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: color || (bold ? 'var(--text)' : 'var(--text-secondary)'),
          fontWeight: bold ? 600 : 500,
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Capital Required */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 10,
          padding: '4px 18px 12px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.12em',
            color: 'var(--indigo-hover)',
            textTransform: 'uppercase',
            padding: '12px 0 4px',
            fontWeight: 600,
          }}
        >
          Capital Required
        </div>
        <Row label="Purchase Price" value={fmtMoneyFull(purchase)} />
        <Row
          label={`Down Payment (${dpPct}%)`}
          value={fmtMoneyFull(downPayment)}
          indent
        />
        <Row
          label={`Closing Costs (${closingPct}%)`}
          value={fmtMoneyFull(closingCosts)}
          indent
        />
        <Row
          label="Cash to Close"
          value={fmtMoneyFull(cashRequired)}
          bold
          color="var(--indigo-hover)"
          border
        />
      </div>

      {/* Monthly P&L */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--hairline)',
          borderRadius: 10,
          padding: '4px 18px 12px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.12em',
            color: 'var(--indigo-hover)',
            textTransform: 'uppercase',
            padding: '12px 0 4px',
            fontWeight: 600,
          }}
        >
          Monthly Income & Expenses
        </div>
        <Row label="Gross Rent" value={fmtMonthly(grossRent)} color="var(--green)" />
        <Row
          label={`Vacancy (${vacancyPct}%)`}
          value={fmtMonthly(Math.abs(vacancyLoss))}
          indent
          color="var(--red)"
        />
        <Row
          label={`Maintenance (${maintenancePct}%)`}
          value={fmtMonthly(maintenance)}
          indent
          color="var(--red)"
        />
        <Row
          label={`CapEx Reserve (${capexPct}%)`}
          value={fmtMonthly(capex)}
          indent
          color="var(--red)"
        />
        <Row
          label={`Property Mgmt (${pmPct}%)`}
          value={fmtMonthly(pm)}
          indent
          color="var(--red)"
        />
        {propTax > 0 && (
          <Row
            label="Property Tax"
            value={fmtMonthly(propTax / 12)}
            indent
            color="var(--red)"
          />
        )}
        {insurance > 0 && (
          <Row
            label="Insurance"
            value={fmtMonthly(insurance / 12)}
            indent
            color="var(--red)"
          />
        )}
        <Row
          label="Mortgage (PITI)"
          value={
            annualDebtService > 0 ? fmtMonthly(annualDebtService / 12) : '—'
          }
          indent
          color="var(--red)"
        />
        <Row
          label="Net Cash Flow"
          value={fmtMonthly(monthlyCF)}
          bold
          color={(monthlyCF ?? 0) >= 0 ? 'var(--green)' : 'var(--red)'}
          border
        />
      </div>

      {/* Key Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
        }}
      >
        {[
          { label: 'CAP RATE', value: fmtPct(capRate), color: 'var(--indigo-hover)' },
          { label: 'CASH-ON-CASH', value: fmtPct(coc), color: 'var(--indigo-hover)' },
          {
            label: 'DSCR',
            value: dscr != null ? dscr.toFixed(2) : '—',
            color: (dscr ?? 0) >= 1.25 ? 'var(--green)' : 'var(--red)',
          },
          { label: '5-YR ROI', value: fmtPct(fiveYearROI), color: 'var(--indigo-hover)' },
          { label: 'BREAK-EVEN ARV', value: fmtMoney(breakEvenArv), color: 'var(--text)' },
          { label: '5-YR EQUITY', value: fmtMoney(fiveYearEquity), color: 'var(--green)' },
        ].map(m => (
          <div
            key={m.label}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--hairline)',
              borderRadius: 8,
              padding: 14,
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
                fontSize: 20,
                fontWeight: 600,
                color: m.color,
                marginTop: 6,
              }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* -------------------------- waterfall tables -------------------------- */

type WaterfallRow =
  | { kind: 'line'; label: string; value: string; emphasis?: boolean; accent?: string }
  | { kind: 'separator' }
  | { kind: 'subtle'; label: string }

function WaterfallTable({ title, rows }: { title: string; rows: WaterfallRow[] }) {
  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        padding: 18,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'var(--indigo-hover)',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((r, i) => {
          if (r.kind === 'separator') {
            return (
              <div
                key={i}
                style={{
                  borderTop: '1px dashed var(--hairline)',
                  margin: '6px 0',
                }}
              />
            )
          }
          if (r.kind === 'subtle') {
            return (
              <div
                key={i}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  padding: '3px 0 3px 12px',
                }}
              >
                {r.label}
              </div>
            )
          }
          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                padding: '6px 0',
                background: r.emphasis ? 'var(--indigo-dim)' : 'transparent',
                borderRadius: r.emphasis ? 6 : 0,
                paddingLeft: r.emphasis ? 10 : 0,
                paddingRight: r.emphasis ? 10 : 0,
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
              }}
            >
              <span
                style={{
                  color: r.emphasis ? 'var(--indigo-hover)' : 'var(--text-secondary)',
                  fontWeight: r.emphasis ? 600 : 400,
                }}
              >
                {r.label}
              </span>
              <span
                style={{
                  color: r.accent || (r.emphasis ? 'var(--indigo-hover)' : 'var(--text)'),
                  fontWeight: r.emphasis ? 700 : 500,
                }}
              >
                {r.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function buildBRRRRWaterfall(
  purchase: number,
  rehab: number,
  closingPct: number,
  arv: number,
  monthlyCF: number,
  cashOnCash: number | undefined
): WaterfallRow[] {
  const closing = purchase * (closingPct / 100)
  const totalIn = purchase + rehab + closing
  const refi = arv * 0.75
  const cashLeftIn = Math.max(0, totalIn - refi)
  return [
    { kind: 'line', label: 'Purchase Price', value: fmtMoneyFull(purchase) },
    { kind: 'line', label: 'Rehab Cost', value: `+ ${fmtMoneyFull(rehab)}` },
    { kind: 'line', label: `Closing Costs (${closingPct}%)`, value: `+ ${fmtMoneyFull(closing)}` },
    { kind: 'line', label: '= Total In', value: fmtMoneyFull(totalIn), emphasis: false, accent: 'var(--text)' },
    { kind: 'separator' },
    { kind: 'line', label: 'ARV', value: fmtMoneyFull(arv) },
    { kind: 'subtle', label: '× 75% LTV' },
    { kind: 'line', label: '= Refi Proceeds', value: fmtMoneyFull(refi), accent: 'var(--text)' },
    { kind: 'separator' },
    {
      kind: 'line',
      label: 'Cash Left In Deal',
      value: fmtMoneyFull(cashLeftIn),
      emphasis: true,
    },
    { kind: 'line', label: 'Monthly Cash Flow', value: fmtMoneyFull(monthlyCF), accent: monthlyCF >= 0 ? '#34D399' : '#F87171' },
    { kind: 'line', label: 'Cash-on-Cash', value: fmtPct(cashOnCash), accent: '#34D399' },
  ]
}

function buildFlipWaterfall(
  purchase: number,
  rehab: number,
  closingPct: number,
  sellClosingPct: number,
  holdingMonths: number,
  dpPct: number,
  rate: number,
  arv: number
): WaterfallRow[] {
  const closing = purchase * (closingPct / 100)
  const loanBalance = purchase * (1 - dpPct / 100)
  const monthlyInterest = (loanBalance * (rate / 100)) / 12
  const holdingCost = monthlyInterest * holdingMonths
  const totalCost = purchase + rehab + closing + holdingCost
  const sellClosing = arv * (sellClosingPct / 100)
  const netSale = arv - sellClosing
  const grossProfit = arv - totalCost
  const netProfit = netSale - totalCost
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0
  const maxOffer = arv * 0.85 - rehab
  return [
    { kind: 'line', label: 'Purchase Price', value: fmtMoneyFull(purchase) },
    { kind: 'line', label: 'Rehab Cost', value: `+ ${fmtMoneyFull(rehab)}` },
    { kind: 'line', label: `Closing Costs (${closingPct}%)`, value: `+ ${fmtMoneyFull(closing)}` },
    {
      kind: 'line',
      label: `Holding Costs (${holdingMonths}mo)`,
      value: `+ ${fmtMoneyFull(holdingCost)}`,
    },
    { kind: 'line', label: '= Total Project Cost', value: fmtMoneyFull(totalCost), accent: 'var(--text)' },
    { kind: 'separator' },
    { kind: 'line', label: 'ARV', value: fmtMoneyFull(arv) },
    {
      kind: 'line',
      label: `− Sell Closing (${sellClosingPct}%)`,
      value: fmtMoneyFull(sellClosing),
    },
    { kind: 'line', label: '= Net Sale Proceeds', value: fmtMoneyFull(netSale), accent: 'var(--text)' },
    { kind: 'separator' },
    { kind: 'line', label: 'Gross Profit', value: fmtMoneyFull(grossProfit) },
    {
      kind: 'line',
      label: 'Net Profit',
      value: fmtMoneyFull(netProfit),
      accent: netProfit >= 0 ? '#34D399' : '#F87171',
      emphasis: true,
    },
    { kind: 'line', label: 'ROI', value: fmtPct(roi), accent: '#34D399' },
    { kind: 'line', label: 'Max Offer (85% rule)', value: fmtMoneyFull(maxOffer) },
  ]
}

/* -------------------- pro forma + risk flags helpers -------------------- */

const PRO_FORMA_FIELDS: { key: string; label: string; kind: 'money' | 'moneyYear' | 'moneyMonth' | 'pct' }[] = [
  { key: 'purchasePrice', label: 'Purchase Price', kind: 'money' },
  { key: 'rehabCost', label: 'Rehab Cost', kind: 'money' },
  { key: 'totalInvestment', label: 'Total Investment', kind: 'money' },
  { key: 'arvEstimate', label: 'ARV', kind: 'money' },
  { key: 'grossRent', label: 'Gross Rent (annual)', kind: 'moneyYear' },
  { key: 'vacancy', label: 'Vacancy Loss', kind: 'moneyYear' },
  { key: 'netOperatingIncome', label: 'Net Operating Income', kind: 'moneyYear' },
  { key: 'annualDebtService', label: 'Annual Debt Service', kind: 'moneyYear' },
]

function ProFormaTable({ proForma }: { proForma: Record<string, unknown> | undefined }) {
  if (!proForma) return null
  const rows = PRO_FORMA_FIELDS.map(f => {
    const v = proForma[f.key]
    const n = typeof v === 'number' && Number.isFinite(v) ? v : null
    let value = '—'
    if (n != null) {
      if (f.kind === 'money') value = fmtMoneyFull(n)
      else if (f.kind === 'moneyYear') value = `${fmtMoneyFull(n)}/yr`
      else if (f.kind === 'moneyMonth') value = `${fmtMoneyFull(n)}/mo`
      else value = fmtPct(n)
    }
    return { label: f.label, value }
  })

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        padding: '6px 20px',
      }}
    >
      {rows.map((r, i) => (
        <div
          key={r.label}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            padding: '12px 0',
            borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--hairline)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ============================ PAGE ============================ */

function V3AnalyzePageInner() {
  const tierState = useV3Tier()
  const searchParams = useSearchParams()
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

  const [recentDeals, setRecentDeals] = useState<Array<{
    id: string
    address: string
    strategy: string
    cap: number | null
    coc: number | null
    signal: string
  }>>([])

  useEffect(() => {
    fetch('/api/v3/pipeline', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        type RawDeal = {
          id: string
          address: string
          strategy?: string | null
          cap?: number | null
          coc?: number | null
          signal?: string | null
          dealScore?: number | null
        }
        const deals: RawDeal[] = (data?.deals || []) as RawDeal[]
        setRecentDeals(
          deals.slice(0, 4).map(d => ({
            id: d.id,
            address: d.address,
            strategy: d.strategy || 'Buy & Hold',
            cap: d.cap ?? null,
            coc: d.coc ?? null,
            signal: d.signal || signalFromDealScore(d.dealScore ?? null),
          }))
        )
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const addrParam = searchParams.get('address')
    if (addrParam && !address) {
      setAddress(addrParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!hasInitModel && tierState.status === 'ready') {
      setModel(defaultModel)
      setHasInitModel(true)
    }
  }, [tierState.status, defaultModel, hasInitModel])

  const [propData, setPropData] = useState<PropertyData | null>(null)
  const [propLoading, setPropLoading] = useState(false)
  const [propError, setPropError] = useState('')
  const [form, setForm] = useState<EditForm | null>(null)
  const [params, setParams] = useState<DealParams>(dealDefaultsFor('BRRRR'))

  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [rateLimit, setRateLimit] = useState<{ retryAfter: number } | null>(null)
  const [result, setResult] = useState<V3AnalysisResult | null>(null)
  const [calculations, setCalculations] = useState<Record<string, unknown> | null>(null)
  const [progressSteps, setProgressSteps] = useState<ThinkingStep[]>([])

  const [dealStatus, setDealStatus] = useState<PipelineStatus>('Watching')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [expandedModelId, setExpandedModelId] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [inputsCollapsed, setInputsCollapsed] = useState(false)

  const proMax = useProMaxAnalysis()
  const isProMaxMode = tier === 'pro_max' && model === 'max'

  useEffect(() => {
    if (result?.dealScore != null) setDealStatus(defaultStatusFromScore(result.dealScore))
  }, [result?.dealScore])

  useEffect(() => {
    if (result || proMax.completedCount > 0) {
      setInputsCollapsed(true)
    }
  }, [result, proMax.completedCount])

  useEffect(() => {
    setInputsCollapsed(false)
  }, [address])

  // Strategy change: reset deal params to the strategy's defaults.
  useEffect(() => {
    setParams(dealDefaultsFor(strategy))
  }, [strategy])

  const onAddressFetch = async () => {
    if (!address.trim()) return
    setPropLoading(true)
    setPropError('')
    setPropData(null)
    setResult(null)
    setCalculations(null)
    setProgressSteps([])
    setAnalysisError('')
    setRateLimit(null)
    setForm(null)
    setSaveState('idle')
    setExpandedModelId(null)
    try {
      const data = await fetchPropertyData(address.trim(), strategy)
      setPropData(data)
      setForm(makeInitialForm(strategy, data))
    } catch (err) {
      setPropError(err instanceof Error ? err.message : 'Failed to fetch property data')
    } finally {
      setPropLoading(false)
    }
  }

  // Strategy change while property data loaded: reseed strategy-specific form.
  useEffect(() => {
    if (!propData || !form) return
    setForm(prev => {
      if (!prev) return prev
      const seeded = makeInitialForm(strategy, propData)
      return { ...seeded, ...prev, arvConfidence: seeded.arvConfidence }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy])

  const onAnalyze = async () => {
    if (!propData || !form) return
    const previewPrice = toNum(form.purchasePrice) ?? pickPurchasePrice(propData) ?? 0
    if (previewPrice < 10000) {
      setAnalysisError('Purchase price is required. Please verify the property data above.')
      return
    }
    setInputsCollapsed(true)
    setAnalysisLoading(true)
    setAnalysisError('')
    setRateLimit(null)
    setResult(null)
    setCalculations(null)
    setProgressSteps([])
    setExpandedModelId(null)
    setSaveState('idle')

    const body = buildAnalyzeBody(address, strategy, propData, form, params)

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
        setProgressSteps(prev => [...prev, { step, detail, timestamp: Date.now() }])
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
    const saveResult: V3AnalysisResult | null = isProMaxMode
      ? ((expandedModel?.parsedResult as V3AnalysisResult | null) ??
        (proMax.modelResults.find(m => m.status === 'complete')?.parsedResult as V3AnalysisResult | null) ??
        null)
      : result
    if (!saveResult) return
    setSaveState('saving')
    try {
      const monthlyCf =
        saveResult.cashFlow?.monthly ?? saveResult.cashFlow?.monthlyCashFlow ?? null
      const annualCf =
        saveResult.cashFlow?.annual ??
        saveResult.cashFlow?.annualCashFlow ??
        (monthlyCf != null ? monthlyCf * 12 : null)
      const payload = {
        address,
        strategy,
        metrics: saveResult.metrics,
        cashFlow: saveResult.cashFlow,
        proForma: saveResult.proForma,
        signal: signalFromDealScore(saveResult.dealScore),
        dealScore: saveResult.dealScore,
        propertyData: propData,
        status: dealStatus,
        aiAnalysis: {
          narrative: saveResult.narrative,
          marketContext: saveResult.marketContext,
          riskFlags: saveResult.riskFlags,
          financial_metrics: {
            cap_rate: saveResult.metrics?.capRate,
            cash_on_cash_return: saveResult.metrics?.cashOnCash,
            monthly_cash_flow: monthlyCf,
            annual_cash_flow: annualCf,
            arv: saveResult.metrics?.arvEstimate,
            roi: saveResult.metrics?.roi ?? saveResult.metrics?.fiveYearROI,
            ...aiFinOf(saveResult),
          },
        },
      }
      const res = await fetch('/api/v3/pipeline/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error('Save failed:', errData)
        throw new Error('save failed')
      }
      setSaveState('saved')
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => setSaveState('idle'), 4000)
    } catch (err) {
      console.error('Save error:', err)
      setSaveState('error')
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => setSaveState('idle'), 4000)
    }
  }

  const showEmpty =
    !propData && !propLoading && !propError && !result && !analysisLoading && !proMax.isRunning
  const isDev = process.env.NODE_ENV === 'development'

  const updateForm = (patch: Partial<EditForm>) => setForm(prev => (prev ? { ...prev, ...patch } : prev))
  const updateParams = (patch: Partial<DealParams>) => setParams(prev => ({ ...prev, ...patch }))

  const expandedModel = useMemo(() => {
    if (!expandedModelId) return null
    return proMax.modelResults.find(m => m.modelId === expandedModelId) || null
  }, [expandedModelId, proMax.modelResults])

  /* ---------------- render a full result view (reusable) ---------------- */

  const renderResultsView = (
    viewResult: V3AnalysisResult,
    viewCalc: Record<string, unknown> | null,
    modelLabel?: string,
    accentColor?: string
  ) => {
    const accent = accentColor || 'var(--indigo-hover)'
    const signal = signalFromDealScore(viewResult.dealScore)
    const narrativeBlurred = tier === 'free'
    const secondaryBlurred = tier === 'free'
    const primary = primaryMetricsFor(strategy, viewResult, viewCalc, form, params)
    const secondary = secondaryMetricsFor(strategy, viewResult, viewCalc, form, params)
    const arv = toNum(form?.arv) ?? (viewResult.metrics?.arvEstimate ?? 0)
    const rehab = toNum(form?.rehabCost) ?? 0
    const purchase = toNum(form?.purchasePrice) ?? 0
    const sellClosingPct = toNum(params.sellClosingCosts) ?? 6
    const dpPct = toNum(params.downPaymentPercent) ?? 20
    const rate = toNum(params.interestRate) ?? 7.5
    const term = toNum(params.loanTerm) ?? 30
    const holdingMonths = toNum(params.holdingMonths) ?? 6
    const closingPct = toNum(params.closingCosts) ?? 3
    const monthlyCF =
      viewResult.cashFlow?.monthlyCashFlow != null
        ? viewResult.cashFlow.monthlyCashFlow
        : (viewResult.cashFlow?.monthly ?? 0)
    const maxOffer = arv > 0 ? arv * 0.85 - rehab : 0
    const refiProceeds = arv > 0 ? arv * 0.75 : 0

    return (
      <>
        {/* Deal score strip */}
        <section style={{ marginBottom: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: modelLabel ? accent : 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: modelLabel ? 600 : 500,
                }}
              >
                {modelLabel ? `${modelLabel} · Deal score` : 'Deal score'}
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 40,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color:
                    viewResult.dealScore != null && viewResult.dealScore >= 7
                      ? '#34D399'
                      : viewResult.dealScore != null && viewResult.dealScore <= 4
                        ? '#F87171'
                        : '#FBBF24',
                  lineHeight: 1,
                  marginTop: 6,
                }}
              >
                {viewResult.dealScore != null ? `${viewResult.dealScore}/10` : '—'}
              </div>
            </div>
            <SignalBadge signal={signal as Signal} />
          </div>
        </section>

        {/* Primary metrics */}
        <section style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {primary.map(m => (
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
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: m.accent || 'var(--text)',
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

        {/* Chart */}
        {purchase > 0 && (
          <section style={{ marginBottom: 20 }}>
            {strategy === 'Fix & Flip' ? (
              <FlipChart
                purchasePrice={purchase}
                rehabCost={rehab}
                closingCostsPercent={closingPct}
                sellClosingCostsPercent={sellClosingPct}
                interestRate={rate}
                downPaymentPercent={dpPct}
                holdingMonths={holdingMonths}
                arv={arv}
              />
            ) : (
              <HoldChart
                purchasePrice={purchase}
                downPaymentPercent={dpPct}
                interestRate={rate}
                loanTermYears={term}
                monthlyCashFlow={monthlyCF}
              />
            )}
          </section>
        )}

        {/* Waterfall (strategy-specific) */}
        {(strategy === 'BRRRR' || strategy === 'Fix & Flip') && purchase > 0 && arv > 0 && (
          <section style={{ marginBottom: 20 }}>
            {strategy === 'BRRRR' ? (
              <WaterfallTable
                title="BRRRR Waterfall"
                rows={buildBRRRRWaterfall(
                  purchase,
                  rehab,
                  closingPct,
                  arv,
                  monthlyCF,
                  viewResult.metrics?.cashOnCash ?? undefined
                )}
              />
            ) : (
              <WaterfallTable
                title="Fix & Flip Waterfall"
                rows={buildFlipWaterfall(
                  purchase,
                  rehab,
                  closingPct,
                  sellClosingPct,
                  holdingMonths,
                  dpPct,
                  rate,
                  arv
                )}
              />
            )}
          </section>
        )}

        {/* Secondary metrics */}
        {(strategy === 'Buy & Hold' || strategy === 'BRRRR') ? (
          <section style={{ marginBottom: 20, position: 'relative' }}>
            <div style={{ marginBottom: 10 }}>
              <SectionLabel color="var(--text-muted)">
                {strategy === 'BRRRR' ? 'BRRRR Details' : 'Full Underwriting'}
              </SectionLabel>
            </div>
            <div
              style={{
                filter: tier === 'free' ? 'blur(4px)' : 'none',
                pointerEvents: tier === 'free' ? 'none' : 'auto',
              }}
            >
              {renderBuyHoldWaterfall(viewResult, viewCalc, form, params)}
            </div>
            {tier === 'free' && (
              <UpgradeOverlay message="Upgrade to Pro for full underwriting metrics" />
            )}
          </section>
        ) : (
          <section style={{ marginBottom: 20, position: 'relative' }}>
            <div style={{ marginBottom: 10 }}>
              <SectionLabel color="var(--text-muted)">
                {strategy === 'Fix & Flip'
                  ? 'Flip economics'
                  : strategy === 'House Hack'
                    ? 'House-hack breakdown'
                    : 'Full underwriting'}
              </SectionLabel>
            </div>
            <div
              style={{
                filter: secondaryBlurred ? 'blur(4px)' : 'none',
                pointerEvents: secondaryBlurred ? 'none' : 'auto',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 10,
                }}
              >
                {secondary.map(m => (
                  <div
                    key={m.label}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 8,
                      padding: 14,
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
                        fontSize: 20,
                        fontWeight: 600,
                        color: 'var(--text)',
                        marginTop: 6,
                      }}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {secondaryBlurred && <UpgradeOverlay message="Upgrade to Pro for full underwriting metrics" />}
          </section>
        )}

        {/* Max offer recommendation */}
        {(strategy === 'Fix & Flip' || strategy === 'BRRRR') && arv > 0 && (
          <section style={{ marginBottom: 12 }}>
            <div
              style={{
                background: 'var(--indigo-dim)',
                border: '1px solid var(--border-strong)',
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    color: 'var(--indigo-hover)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}
                >
                  {strategy === 'Fix & Flip' ? 'Recommended max offer' : 'Refi target @ 75% ARV'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--text)',
                    marginTop: 4,
                  }}
                >
                  {fmtMoneyFull(strategy === 'Fix & Flip' ? maxOffer : refiProceeds)}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.5 }}>
                {strategy === 'Fix & Flip'
                  ? `Formula: ARV × 85% − rehab. Stays under 70% rule with rehab of ${fmtMoneyFull(rehab)}.`
                  : `Expected cash back on refi, assuming 75% LTV against ARV of ${fmtMoneyFull(arv)}.`}
              </div>
            </div>
          </section>
        )}

        {/* Narrative + risk flags */}
        {(viewResult.narrative || (viewResult.riskFlags && viewResult.riskFlags.length > 0)) && (
          <section style={{ marginBottom: 20, position: 'relative' }}>
            <div
              style={{
                filter: narrativeBlurred ? 'blur(4px)' : 'none',
                pointerEvents: narrativeBlurred ? 'none' : 'auto',
              }}
            >
              {viewResult.narrative && (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 12,
                  }}
                >
                  <SectionLabel>AI NARRATIVE</SectionLabel>
                  <p style={{ margin: '10px 0 0', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    {viewResult.narrative}
                  </p>
                  {viewResult.marketContext && (
                    <>
                      <div style={{ marginTop: 14 }}>
                        <SectionLabel color="var(--text-muted)">Market context</SectionLabel>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        {viewResult.marketContext}
                      </p>
                    </>
                  )}
                </div>
              )}
              {viewResult.riskFlags && viewResult.riskFlags.length > 0 && (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <SectionLabel color="var(--text-muted)">RISK FLAGS</SectionLabel>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    {viewResult.riskFlags.map((flag, i) => (
                      <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            color:
                              flag.severity === 'high'
                                ? '#F87171'
                                : flag.severity === 'medium'
                                  ? '#FBBF24'
                                  : '#34D399',
                            background:
                              flag.severity === 'high'
                                ? 'rgba(239,68,68,0.12)'
                                : flag.severity === 'medium'
                                  ? 'rgba(245,158,11,0.12)'
                                  : 'rgba(16,185,129,0.12)',
                            padding: '3px 8px',
                            borderRadius: 4,
                            textTransform: 'uppercase',
                            flexShrink: 0,
                            height: 20,
                            alignSelf: 'flex-start',
                          }}
                        >
                          {flag.severity}
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

        {/* Pro Forma table */}
        {viewResult.proForma && (
          <section style={{ marginBottom: 12 }}>
            <AnalysisAccordion title="Pro Forma" subtitle="All line items">
              <ProFormaTable proForma={viewResult.proForma} />
            </AnalysisAccordion>
          </section>
        )}

        {/* Rent comps */}
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
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>{fmtMoneyFull(c.rent ?? null)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {c.distance != null ? `${c.distance.toFixed(2)} mi` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </AnalysisAccordion>
          </section>
        )}

        {/* Recommendation */}
        {viewResult.recommendation && (
          <section style={{ marginBottom: 12 }}>
            <AnalysisAccordion title="Offer Recommendation" subtitle="AI suggested action" defaultOpen>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {viewResult.recommendation}
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
              <>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 10, marginBottom: 4 }}>
                  cashFlow keys: {Object.keys(viewResult?.cashFlow || {}).join(', ') || '—'}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>
                  metrics keys: {Object.keys(viewResult?.metrics || {}).join(', ') || '—'}
                </div>
                <pre
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    background: 'var(--bg)',
                    border: '1px solid var(--hairline)',
                    padding: 12,
                    borderRadius: 8,
                    overflow: 'auto',
                    marginTop: 4,
                    color: 'var(--text-secondary)',
                    maxHeight: 500,
                  }}
                >
                  {JSON.stringify({ result: viewResult, calculations: viewCalc }, null, 2)}
                </pre>
              </>
            )}
          </section>
        )}
      </>
    )
  }

  /* ----------------------- render ----------------------- */

  return (
    <div style={{ padding: '28px 28px 80px', maxWidth: 1440, margin: '0 auto' }}>
      {/* Address input */}
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

      {/* Strategy + model */}
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

      {showEmpty && <AnalyzeEmpty onPickStrategy={setStrategy} recentDeals={recentDeals} />}

      {propLoading && (
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
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
              Pulling property data from RentCast…
            </span>
          </div>
        </div>
      )}

      {propError && (
        <div style={{ marginBottom: 22 }}>
          <AlertBox kind="error">{propError}</AlertBox>
        </div>
      )}

      {tier === 'free' && propData && (
        <div
          style={{
            background: 'var(--elevated)',
            border: '1px solid var(--hairline)',
            borderRadius: 8,
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          <span>Free plan · 3 analyses/month</span>
          <Link href="/pricing" style={{ color: 'var(--indigo-hover)', textDecoration: 'none' }}>
            Upgrade for unlimited →
          </Link>
        </div>
      )}

      {propData && form && (
        inputsCollapsed ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => setInputsCollapsed(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setInputsCollapsed(false)
              }
            }}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--hairline)',
              borderRadius: 10,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 12,
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', minWidth: 0 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {address}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                {strategy} · ${Number(form.purchasePrice || 0).toLocaleString()} · {params.loanType}
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--indigo-hover)', flexShrink: 0 }}>
              Edit inputs ↑
            </span>
          </div>
        ) : (
          <>
            <EditablePanel
              strategy={strategy}
              propertyData={propData}
              form={form}
              onChange={updateForm}
            />
            <DealParametersPanel
              strategy={strategy}
              value={params}
              onChange={updateParams}
              purchasePrice={toNum(form.purchasePrice) ?? 0}
              arv={toNum(form.arv) ?? 0}
              rehab={toNum(form.rehabCost) ?? 0}
              rentcastPropertyTax={propData.property?.propertyTaxes ?? null}
            />
            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="app-btn"
                onClick={onAnalyze}
                disabled={analysisLoading || proMax.isRunning || isCashLoan(params.loanType) === false && !form.purchasePrice}
                style={{ padding: '12px 22px', fontSize: 14 }}
              >
                {analysisLoading || proMax.isRunning ? 'Running…' : 'Run Analysis →'}
              </button>
              {(result || proMax.completedCount > 0) && (
                <button
                  type="button"
                  className="app-btn-ghost"
                  onClick={() => setInputsCollapsed(true)}
                  style={{ padding: '12px 16px', fontSize: 14 }}
                >
                  Back to results ↓
                </button>
              )}
            </div>
          </>
        )
      )}

      {(analysisLoading || proMax.isRunning) && (
        <ThinkingUI
          address={address}
          steps={
            isProMaxMode
              ? proMax.modelResults
                  .flatMap(mr =>
                    mr.progressSteps.map(ps => ({
                      step: `${mr.modelLabel}: ${ps.step}`,
                      detail: ps.detail,
                      timestamp: ps.timestamp,
                    }))
                  )
                  .slice(-8)
              : progressSteps.slice(-8)
          }
          extra={
            isProMaxMode ? (
              <div
                style={{
                  marginTop: 6,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                }}
              >
                {proMax.modelResults.map((mr, i) => {
                  const cfg = PRO_MAX_MODELS[i]
                  return (
                    <div
                      key={mr.modelId}
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
                        {cfg?.roleLabel || mr.role}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                        {mr.modelLabel}
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background:
                              mr.status === 'complete'
                                ? 'var(--green)'
                                : mr.status === 'error'
                                  ? 'var(--red)'
                                  : 'var(--blue)',
                            animation: mr.status === 'loading' ? 'v3-pulse 1.4s ease-in-out infinite' : 'none',
                          }}
                        />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                          {mr.status === 'loading'
                            ? mr.progressSteps.at(-1)?.detail || 'Running…'
                            : mr.status === 'complete'
                              ? 'Complete'
                              : mr.status === 'error'
                                ? 'Error'
                                : 'Pending'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : undefined
          }
        />
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

      {/* Pro Max expanded single-model view */}
      {isProMaxMode && expandedModel && expandedModel.parsedResult && (
        <div style={{ marginTop: 24 }}>
          <button
            type="button"
            onClick={() => setExpandedModelId(null)}
            className="app-btn-ghost"
            style={{ padding: '7px 14px', fontSize: 12, marginBottom: 16 }}
          >
            ← Back to comparison
          </button>
          <StatusBar value={dealStatus} onChange={setDealStatus} onSave={onSaveToPipeline} saveState={saveState} />
          {(() => {
            const expandedIdx = proMax.modelResults.findIndex(m => m.modelId === expandedModel.modelId)
            const expandedCfg = expandedIdx >= 0 ? PRO_MAX_MODELS[expandedIdx] : undefined
            return renderResultsView(
              expandedModel.parsedResult as V3AnalysisResult,
              expandedModel.serverCalculations as Record<string, unknown> | null,
              expandedModel.modelLabel,
              expandedCfg?.accentColor
            )
          })()}
        </div>
      )}

      {/* Pro Max 3-card comparison grid (collapsed) */}
      {isProMaxMode && !expandedModel && !proMax.isRunning && proMax.completedCount > 0 && (
        <section style={{ marginTop: 24 }}>
          <StatusBar value={dealStatus} onChange={setDealStatus} onSave={onSaveToPipeline} saveState={saveState} />
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
              AI CONSENSUS ({proMax.completedCount}/{proMax.totalModels}) · Click a card to expand
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {proMax.modelResults.map((mr, i) => {
              const cfg = PRO_MAX_MODELS[i]
              const parsed = mr.parsedResult as V3AnalysisResult | null
              const s = parsed ? signalFromDealScore(parsed.dealScore) : null
              const clickable = mr.status === 'complete' && parsed != null
              const accent = cfg?.accentColor || '#6366F1'
              const tintBg = cfg?.bgColor || 'var(--surface)'
              const tintBorder = cfg?.borderColor || 'var(--hairline)'

              // Strategy-specific 3 preview metrics
              const fin = parsed ? aiFinOf(parsed) : {}
              const preview: { label: string; value: string }[] =
                strategy === 'Fix & Flip'
                  ? [
                      {
                        label: 'SCORE',
                        value: parsed?.dealScore != null ? `${parsed.dealScore}/10` : '—',
                      },
                      { label: 'NET PROFIT', value: fmtMoney(fin.net_profit) },
                      { label: 'ROI', value: fmtPct((fin.roi_percent as number | undefined) ?? parsed?.metrics?.roi) },
                    ]
                  : strategy === 'BRRRR'
                    ? [
                        {
                          label: 'SCORE',
                          value: parsed?.dealScore != null ? `${parsed.dealScore}/10` : '—',
                        },
                        { label: 'CoC', value: fmtPct(parsed?.metrics?.cashOnCash) },
                        { label: 'CF/MO', value: fmtMoney(parsed?.cashFlow?.monthly ?? parsed?.cashFlow?.monthlyCashFlow) },
                      ]
                    : strategy === 'House Hack'
                      ? (() => {
                          const hhCf = parsed ? houseHackCashFlow(parsed) : undefined
                          const monthlyCost = hhCf != null ? -hhCf : undefined
                          const offsetPct =
                            (fin.offset_percent as number | undefined) ??
                            (parsed ? pickHhNumber(parsed, ['offsetPercent', 'offset_percent']) : undefined)
                          return [
                            {
                              label: 'SCORE',
                              value: parsed?.dealScore != null ? `${parsed.dealScore}/10` : '—',
                            },
                            { label: 'MONTHLY COST', value: fmtMonthly(monthlyCost) },
                            { label: 'OFFSET %', value: fmtPct(offsetPct) },
                          ]
                        })()
                      : [
                          {
                            label: 'SCORE',
                            value: parsed?.dealScore != null ? `${parsed.dealScore}/10` : '—',
                          },
                          { label: 'CF/MO', value: fmtMoney(parsed?.cashFlow?.monthly ?? parsed?.cashFlow?.monthlyCashFlow) },
                          { label: 'CAP RATE', value: fmtPct(parsed?.metrics?.capRate) },
                        ]

              const latencySec =
                mr.latencyMs != null ? (mr.latencyMs / 1000).toFixed(1) : null
              const fullNarrative = parsed?.narrative || parsed?.recommendation || ''
              const firstSentenceMatch = fullNarrative.match(/^([^.!?]+[.!?])\s*(.*)$/)
              const firstSentence = firstSentenceMatch ? firstSentenceMatch[1] : fullNarrative
              const restNarrative = firstSentenceMatch ? firstSentenceMatch[2] : ''

              return (
                <button
                  key={mr.modelId}
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && setExpandedModelId(mr.modelId)}
                  style={{
                    position: 'relative',
                    textAlign: 'left',
                    background: tintBg,
                    border: `1px solid ${tintBorder}`,
                    borderRadius: 10,
                    padding: 20,
                    paddingTop: 22,
                    overflow: 'hidden',
                    minHeight: 240,
                    cursor: clickable ? 'pointer' : 'default',
                    transition: 'border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease',
                  }}
                  onMouseEnter={e => {
                    if (clickable) {
                      e.currentTarget.style.borderColor = accent
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = `0 6px 18px ${tintBorder}`
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = tintBorder
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: accent,
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, color: accent }}>{cfg?.icon || '◆'}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                          {cfg?.roleLabel || `Model ${i + 1}`}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--text-muted)',
                          marginTop: 3,
                        }}
                      >
                        {mr.modelLabel}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      {s && <SignalBadge signal={s} />}
                      {latencySec && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 9,
                            letterSpacing: '0.06em',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {latencySec}s
                        </span>
                      )}
                    </div>
                  </div>

                  {cfg?.roleDescription && (
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        marginBottom: 10,
                        fontStyle: 'italic',
                      }}
                    >
                      {cfg.roleDescription}
                    </div>
                  )}

                  {mr.status === 'error' && <AlertBox kind="error">{mr.error || 'Model failed'}</AlertBox>}
                  {parsed && (
                    <>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span style={{ color: accent, fontWeight: 500 }}>{firstSentence}</span>
                        {restNarrative ? ` ${restNarrative}` : ''}
                      </p>
                      <div
                        style={{
                          borderTop: `1px solid ${tintBorder}`,
                          marginTop: 14,
                          paddingTop: 12,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 10,
                        }}
                      >
                        {preview.map(p => (
                          <div key={p.label}>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 8,
                                letterSpacing: '0.12em',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                              }}
                            >
                              {p.label}
                            </div>
                            <div
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 15,
                                fontWeight: 600,
                                color: 'var(--text)',
                                marginTop: 3,
                              }}
                            >
                              {p.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      {clickable && (
                        <div
                          style={{
                            marginTop: 12,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            letterSpacing: '0.1em',
                            color: accent,
                          }}
                        >
                          View full analysis →
                        </div>
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Standard single-model results */}
      {!isProMaxMode && result && (
        <div style={{ marginTop: 24 }}>
          <StatusBar value={dealStatus} onChange={setDealStatus} onSave={onSaveToPipeline} saveState={saveState} />
          {renderResultsView(result, calculations)}
        </div>
      )}
    </div>
  )
}

export default function V3AnalyzePage() {
  return (
    <Suspense fallback={null}>
      <V3AnalyzePageInner />
    </Suspense>
  )
}
