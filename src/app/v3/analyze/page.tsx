'use client'

import { useState, useEffect, useMemo, useRef, FormEvent } from 'react'
import Link from 'next/link'
import SignalBadge from '@/components/v3/public/SignalBadge'
import AnalysisAccordion from '@/components/v3/app/AnalysisAccordion'
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

/* ----------------------------- types ----------------------------- */

type Strategy = 'BRRRR' | 'Fix & Flip' | 'Buy & Hold' | 'House Hack'
const STRATEGIES: Strategy[] = ['BRRRR', 'Fix & Flip', 'Buy & Hold', 'House Hack']

type ModelTier = 'speed' | 'balanced' | 'max'
type ModelOption = { key: ModelTier; label: string; sub: string }
const MODEL_OPTIONS: ModelOption[] = [
  { key: 'speed', label: 'Speed', sub: 'GPT-4o-mini' },
  { key: 'balanced', label: 'Balanced', sub: 'Sonnet + GPT-4.1' },
  { key: 'max', label: 'Max IQ', sub: 'Opus + GPT-4o + Grok 3' },
]

type PropertyData = {
  isDemo?: boolean
  demo?: boolean
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
    arvLow?: number
    arvHigh?: number
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
  address?: string
}

/* --------------------------- strategy helpers --------------------------- */

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

/* --------------------------- UI pieces --------------------------- */

function Chip({
  active,
  onClick,
  disabled,
  children,
  subtitle,
  locked,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
  subtitle?: string
  locked?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={locked ? 'Upgrade to unlock' : undefined}
      style={{
        background: active ? 'var(--indigo-dim)' : 'var(--surface)',
        color: active ? 'var(--indigo-hover)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 999,
        padding: subtitle ? '5px 12px' : '6px 12px',
        fontSize: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.55 : 1,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 1,
        transition: 'all 140ms ease',
      }}
    >
      <span>{children}</span>
      {subtitle && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.08em',
            color: active ? 'var(--indigo-hover)' : 'var(--text-muted)',
          }}
        >
          {subtitle}
        </span>
      )}
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

/* ------------------------ property-data fetch ------------------------ */

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

function readNum(...candidates: Array<number | null | undefined>): number | undefined {
  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c) && c > 0) return c
  }
  return undefined
}

function buildAnalyzeBody(
  address: string,
  strategy: Strategy,
  propertyData: PropertyData
): Record<string, unknown> {
  const prop = propertyData.property || {}
  const list = readNum(prop.listPrice ?? null, prop.estimatedValue, propertyData.comparables?.value)
  const purchasePrice = list || 0
  const downPaymentPercent = 20
  const monthlyRent = readNum(propertyData.rental?.rentEstimate, prop.estimatedRent)
  const arv = readNum(propertyData.arvAnalysis?.arvEstimate, propertyData.comparables?.value)

  return {
    address,
    strategy: apiStrategyFor(strategy),
    purchasePrice,
    downPayment: Math.round(purchasePrice * (downPaymentPercent / 100)),
    loanTerms: {
      interestRate: 7.5,
      loanTerm: 30,
      loanType: 'conventional',
      points: 0,
    },
    rehabCosts: strategy === 'BRRRR' || strategy === 'Fix & Flip' ? 40000 : undefined,
    arv,
    strategyDetails: {
      downPaymentPercent,
      exitStrategy: strategy === 'BRRRR' ? '75' : undefined,
    },
    closingCostsPercent: 3,
    sellClosingCostsPercent: 6,
    units: 1,
    monthlyRent,
    propertyData,
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
  const [hasInit, setHasInit] = useState(false)

  useEffect(() => {
    if (!hasInit && tierState.status === 'ready') {
      setModel(defaultModel)
      setHasInit(true)
    }
  }, [tierState.status, defaultModel, hasInit])

  const [propData, setPropData] = useState<PropertyData | null>(null)
  const [propLoading, setPropLoading] = useState(false)
  const [propError, setPropError] = useState('')

  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [rateLimit, setRateLimit] = useState<{ retryAfter: number } | null>(null)
  const [result, setResult] = useState<V3AnalysisResult | null>(null)
  const [calculations, setCalculations] = useState<Record<string, unknown> | null>(null)
  const [progressStep, setProgressStep] = useState('')

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const proMax = useProMaxAnalysis()

  const isProMaxMode = tier === 'pro_max' && model === 'max'

  const onAddressSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!address.trim()) return
    setPropLoading(true)
    setPropError('')
    setPropData(null)
    setResult(null)
    setAnalysisError('')
    setRateLimit(null)
    try {
      const data = await fetchPropertyData(address.trim(), strategy)
      setPropData(data)
    } catch (err) {
      setPropError(err instanceof Error ? err.message : 'Failed to fetch property data')
    } finally {
      setPropLoading(false)
    }
  }

  const onAnalyze = async () => {
    if (!propData) return
    setAnalysisLoading(true)
    setAnalysisError('')
    setRateLimit(null)
    setResult(null)
    setCalculations(null)
    setProgressStep('')

    const body = buildAnalyzeBody(address, strategy, propData)

    if (isProMaxMode) {
      proMax.resetResults()
      try {
        await proMax.runParallelAnalysis(
          body,
          parseAnalysisStream,
          normalizeResult
        )
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
    setSaveStatus('saving')
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
      setSaveStatus('saved')
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const headerStats = useMemo(() => {
    if (!propData) return null
    const p = propData.property || {}
    return [
      { label: 'BEDS', value: String(p.bedrooms ?? p.beds ?? '—') },
      { label: 'BATHS', value: String(p.bathrooms ?? p.baths ?? '—') },
      { label: 'SQFT', value: p.squareFootage ?? p.sqft ? fmtInt(p.squareFootage ?? p.sqft) : '—' },
      { label: 'YEAR', value: p.yearBuilt ? String(p.yearBuilt) : '—' },
      { label: 'LIST', value: fmtMoney(p.listPrice ?? p.estimatedValue ?? null) },
      { label: 'ARV', value: fmtMoney(propData.arvAnalysis?.arvEstimate ?? null), color: '#34D399' as const },
    ]
  }, [propData])

  const signal = signalFromDealScore(result?.dealScore)
  const narrativeBlurred = tier === 'free' && result != null

  return (
    <div style={{ padding: '28px 28px 80px', maxWidth: 1440, margin: '0 auto' }}>
      <form
        onSubmit={onAddressSubmit}
        style={{
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
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Enter property address..."
          style={{
            flex: 1,
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            padding: '8px 0',
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          className="app-btn"
          style={{ borderRadius: 8, padding: '9px 16px' }}
          disabled={propLoading || !address.trim()}
        >
          {propLoading ? 'Loading…' : 'Fetch →'}
        </button>
      </form>

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

      {propData && (
        <section
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--hairline)',
            borderRadius: 12,
            padding: 22,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                PROPERTY
                {propData.isDemo || propData.demo ? ' · DEMO DATA' : ''}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 26,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                }}
              >
                {propData.address || address}
              </div>
              {headerStats && (
                <div style={{ display: 'flex', gap: 18, marginTop: 12, flexWrap: 'wrap' }}>
                  {headerStats.map(s => (
                    <div key={s.label}>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9,
                          letterSpacing: '0.12em',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 15,
                          fontWeight: 600,
                          color: (s as { color?: string }).color || 'var(--text)',
                          marginTop: 3,
                        }}
                      >
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {propData.rental?.rentEstimate && (
              <div
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 10,
                  padding: 14,
                  minWidth: 220,
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
                  RENTCAST DATA
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginTop: 6,
                  }}
                >
                  ${fmtInt(propData.rental.rentEstimate)}/mo
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Estimated market rent
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="app-btn"
              onClick={onAnalyze}
              disabled={analysisLoading || proMax.isRunning}
              style={{ padding: '10px 18px', fontSize: 13 }}
            >
              {analysisLoading || proMax.isRunning ? 'Running…' : 'Analyze →'}
            </button>
            {analysisLoading && progressStep && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                }}
              >
                {progressStep}
              </span>
            )}
          </div>
        </section>
      )}

      {rateLimit && (
        <div style={{ marginBottom: 18 }}>
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
        <div style={{ marginBottom: 18 }}>
          <AlertBox kind="error">{analysisError}</AlertBox>
        </div>
      )}

      {/* ------------- Pro Max 3-model comparison ------------- */}
      {isProMaxMode && (proMax.isRunning || proMax.completedCount > 0) && (
        <section style={{ marginBottom: 20 }}>
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
              const mSignal = parsed ? signalFromDealScore(parsed.dealScore) : null
              return (
                <div
                  key={mr.modelId}
                  style={{
                    position: 'relative',
                    background: 'var(--surface)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 10,
                    padding: 20,
                    overflow: 'hidden',
                    minHeight: 220,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: modelCfg?.accentColor || '#6366F1',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                        {modelCfg?.roleLabel || mr.role}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                        {mr.modelLabel}
                      </div>
                    </div>
                    {mSignal && <SignalBadge signal={mSignal} />}
                  </div>
                  {mr.status === 'loading' && (
                    <LoadingDot label={mr.progressSteps.at(-1)?.detail || 'Running…'} />
                  )}
                  {mr.status === 'error' && (
                    <AlertBox kind="error">{mr.error || 'Model failed'}</AlertBox>
                  )}
                  {parsed && mr.status === 'complete' && (
                    <>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
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
                        <div>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 8,
                              letterSpacing: '0.1em',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                            }}
                          >
                            CAP
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
                            {fmtPct(parsed.metrics?.capRate)}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 8,
                              letterSpacing: '0.1em',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                            }}
                          >
                            CoC
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
                            {fmtPct(parsed.metrics?.cashOnCash)}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 8,
                              letterSpacing: '0.1em',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                            }}
                          >
                            SCORE
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
                            {parsed.dealScore != null ? `${parsed.dealScore}/10` : '—'}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ------------- Standard single-model results ------------- */}
      {!isProMaxMode && result && (
        <>
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
                { label: 'CASH FLOW', value: result.cashFlow?.monthly != null ? fmtMoney(result.cashFlow.monthly) : '—', accent: 'var(--text)' },
                { label: '5-YEAR ROI', value: fmtPct(result.metrics?.roi), accent: 'var(--indigo-hover)' },
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

          {(result.narrative || result.riskFlags?.length) && (
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
                    { label: 'ARV', value: fmtMoney(result.proForma.arvEstimate as number | null | undefined ?? result.metrics?.arvEstimate) },
                    {
                      label: 'Refi (75% ARV)',
                      value:
                        result.proForma.arvEstimate
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

          <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="app-btn-ghost"
              style={{ padding: '10px 16px' }}
              onClick={onSaveToPipeline}
              disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            >
              {saveStatus === 'saving'
                ? 'Saving…'
                : saveStatus === 'saved'
                  ? '✓ Saved to pipeline'
                  : saveStatus === 'error'
                    ? 'Save failed — retry'
                    : 'Save to Pipeline'}
            </button>
            <button type="button" className="app-btn-ghost" style={{ padding: '10px 16px' }} disabled>
              Export PDF
            </button>
          </div>

          {calculations && process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: 20, color: 'var(--text-muted)', fontSize: 11 }}>
              <summary style={{ cursor: 'pointer' }}>Server calculations (dev)</summary>
              <pre
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  background: 'var(--bg)',
                  padding: 12,
                  borderRadius: 8,
                  overflow: 'auto',
                  marginTop: 8,
                }}
              >
                {JSON.stringify(calculations, null, 2)}
              </pre>
            </details>
          )}
        </>
      )}
    </div>
  )
}
