// Ported from src/app/v2/analyze/page.tsx so V3 can consume the same streaming
// response shape emitted by /api/analysis/generate without touching V2 code.

export type V3AnalysisResult = {
  strategyType?: string
  recommendation?: string
  metrics?: {
    capRate?: number | null
    cashOnCash?: number | null
    roi?: number | null
    arvEstimate?: number | null
    equityCapture?: number | null
    monthlyRent?: number | null
    monthlyExpenses?: number | null
    noi?: number | null
  }
  cashFlow?: { monthly?: number | null; annual?: number | null }
  proForma?: Record<string, number | null | undefined>
  riskFlags?: Array<{ severity: 'low' | 'medium' | 'high'; flag: string; detail?: string }>
  narrative?: string
  marketContext?: string
  dealScore?: number
  breakEvenArv?: number | null
  capitalRecoveryPercent?: number | null
  effectiveMonthlyCost?: number | null
  grm?: number | null
  fiveYearEquity?: number | null
  projectionNotes?: string
  [k: string]: unknown
}

export function parseAnalysisStream(raw: string): V3AnalysisResult | null {
  if (!raw || raw.trim().length === 0) return null
  const trimmed = raw.trim()

  try {
    let cleaned = raw
    if (cleaned.charCodeAt(0) === 0xfeff) cleaned = cleaned.slice(1)
    cleaned = cleaned.trim()
    const first = cleaned.indexOf('{')
    const last = cleaned.lastIndexOf('}')
    if (first !== -1 && last !== -1 && last > first) {
      const parsed = JSON.parse(cleaned.slice(first, last + 1))
      if (parsed && typeof parsed === 'object') {
        if (parsed.analysis && typeof parsed.analysis === 'object') return parsed.analysis
        return parsed as V3AnalysisResult
      }
    }
  } catch {
    // fall through
  }

  try {
    const stripped = trimmed
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
    const parsed = JSON.parse(stripped)
    if (parsed && typeof parsed === 'object') return parsed as V3AnalysisResult
  } catch {
    // fall through
  }

  try {
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      const parsed = JSON.parse(trimmed.slice(start, end + 1))
      if (parsed && typeof parsed === 'object') return parsed as V3AnalysisResult
    }
  } catch {
    // fall through
  }

  return null
}

type Raw = Record<string, unknown>

export function normalizeResult(raw: V3AnalysisResult | Raw): V3AnalysisResult {
  const r = raw as Raw
  const metrics = (r.metrics || {}) as Raw
  return {
    ...(r as V3AnalysisResult),
    dealScore: (r.dealScore ?? r.deal_score) as number | undefined,
    strategyType: (r.strategyType ?? r.strategy_type) as string | undefined,
    metrics: r.metrics
      ? {
          ...(metrics as V3AnalysisResult['metrics']),
          capRate: (metrics.capRate ?? metrics.cap_rate) as number | null | undefined,
          cashOnCash: (metrics.cashOnCash ?? metrics.cash_on_cash) as number | null | undefined,
          arvEstimate: (metrics.arvEstimate ?? metrics.arv_estimate) as number | null | undefined,
          equityCapture: (metrics.equityCapture ?? metrics.equity_capture) as number | null | undefined,
          monthlyRent: (metrics.monthlyRent ?? metrics.monthly_rent) as number | null | undefined,
        }
      : undefined,
    cashFlow: (r.cashFlow ?? r.cash_flow) as V3AnalysisResult['cashFlow'],
    proForma: (r.proForma ?? r.pro_forma) as V3AnalysisResult['proForma'],
    riskFlags: (r.riskFlags ?? r.risk_flags) as V3AnalysisResult['riskFlags'],
    marketContext: (r.marketContext ?? r.market_context) as string | undefined,
  }
}

export type Signal = 'STRONG BUY' | 'HOT' | 'BUY' | 'WATCH' | 'CAUTION'

export function signalFromDealScore(score: number | null | undefined): Signal {
  if (score == null) return 'WATCH'
  if (score >= 8) return 'STRONG BUY'
  if (score >= 6) return 'BUY'
  if (score >= 4) return 'WATCH'
  return 'CAUTION'
}
