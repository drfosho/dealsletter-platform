// Ported from src/app/v2/analyze/page.tsx so V3 can consume the same streaming
// response shape emitted by /api/analysis/generate without touching V2 code.
// Extended to tolerate both the canonical API keys (cashFlow.monthly,
// metrics.roi) and the design-doc aliases (cashFlow.monthlyCashFlow,
// metrics.fiveYearROI).

export type V3Metrics = {
  capRate?: number | null
  cashOnCash?: number | null
  roi?: number | null
  fiveYearROI?: number | null
  arvEstimate?: number | null
  equityCapture?: number | null
  monthlyRent?: number | null
  monthlyExpenses?: number | null
  noi?: number | null
  netOperatingIncome?: number | null
}

export type V3CashFlow = {
  monthly?: number | null
  annual?: number | null
  monthlyCashFlow?: number | null
  annualCashFlow?: number | null
  grossRent?: number | null
  vacancyLoss?: number | null
  operatingExpenses?: number | null
}

export type V3RiskFlag = {
  severity: 'low' | 'medium' | 'high'
  flag: string
  detail?: string
}

export type V3AnalysisResult = {
  strategyType?: string
  recommendation?: string
  metrics?: V3Metrics
  cashFlow?: V3CashFlow
  proForma?: Record<string, number | null | undefined>
  riskFlags?: V3RiskFlag[]
  narrative?: string
  marketContext?: string
  dealScore?: number
  breakEvenArv?: number | null
  capitalRecoveryPercent?: number | null
  effectiveMonthlyCost?: number | null
  grm?: number | null
  fiveYearEquity?: number | null
  projectionNotes?: string
  raw?: Record<string, unknown>
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

function firstNumber(
  obj: Raw | undefined,
  keys: string[]
): number | null | undefined {
  if (!obj) return undefined
  for (const k of keys) {
    const v = obj[k]
    if (v === null) return null
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return undefined
}

function firstString(obj: Raw | undefined, keys: string[]): string | undefined {
  if (!obj) return undefined
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return undefined
}

export function normalizeResult(raw: V3AnalysisResult | Raw): V3AnalysisResult {
  const r = raw as Raw
  const rawMetrics = (r.metrics || {}) as Raw
  const rawCash = ((r.cashFlow ?? r.cash_flow) || {}) as Raw
  const rawProForma = ((r.proForma ?? r.pro_forma) || {}) as Raw

  const capRate = firstNumber(rawMetrics, ['capRate', 'cap_rate'])
  const cashOnCash = firstNumber(rawMetrics, ['cashOnCash', 'cash_on_cash'])
  const roi = firstNumber(rawMetrics, ['roi', 'fiveYearROI', 'five_year_roi'])
  const arvEstimate = firstNumber(rawMetrics, ['arvEstimate', 'arv_estimate'])
  const noi = firstNumber(rawMetrics, ['noi', 'netOperatingIncome', 'net_operating_income'])
  const monthly = firstNumber(rawCash, ['monthly', 'monthlyCashFlow', 'monthly_cash_flow'])
  const annual = firstNumber(rawCash, ['annual', 'annualCashFlow', 'annual_cash_flow'])

  const metrics: V3Metrics = {
    ...(rawMetrics as V3Metrics),
    capRate: capRate as V3Metrics['capRate'],
    cashOnCash: cashOnCash as V3Metrics['cashOnCash'],
    roi: roi as V3Metrics['roi'],
    fiveYearROI: roi as V3Metrics['fiveYearROI'],
    arvEstimate: arvEstimate as V3Metrics['arvEstimate'],
    equityCapture: firstNumber(rawMetrics, ['equityCapture', 'equity_capture']) as V3Metrics['equityCapture'],
    monthlyRent: firstNumber(rawMetrics, ['monthlyRent', 'monthly_rent']) as V3Metrics['monthlyRent'],
    monthlyExpenses: firstNumber(rawMetrics, ['monthlyExpenses', 'monthly_expenses']) as V3Metrics['monthlyExpenses'],
    noi: noi as V3Metrics['noi'],
    netOperatingIncome: noi as V3Metrics['netOperatingIncome'],
  }

  const cashFlow: V3CashFlow = {
    ...(rawCash as V3CashFlow),
    monthly: monthly as V3CashFlow['monthly'],
    monthlyCashFlow: monthly as V3CashFlow['monthlyCashFlow'],
    annual: annual as V3CashFlow['annual'],
    annualCashFlow: annual as V3CashFlow['annualCashFlow'],
    grossRent: firstNumber(rawCash, ['grossRent', 'gross_rent']) as V3CashFlow['grossRent'],
    vacancyLoss: firstNumber(rawCash, ['vacancyLoss', 'vacancy_loss', 'vacancy']) as V3CashFlow['vacancyLoss'],
    operatingExpenses: firstNumber(rawCash, ['operatingExpenses', 'operating_expenses']) as V3CashFlow['operatingExpenses'],
  }

  return {
    ...(r as V3AnalysisResult),
    dealScore: (r.dealScore ?? r.deal_score) as number | undefined,
    strategyType: (r.strategyType ?? r.strategy_type) as string | undefined,
    recommendation: firstString(r, ['recommendation']),
    narrative: firstString(r, ['narrative']),
    marketContext: firstString(r, ['marketContext', 'market_context']),
    metrics,
    cashFlow,
    proForma: rawProForma as V3AnalysisResult['proForma'],
    riskFlags: (r.riskFlags ?? r.risk_flags) as V3RiskFlag[] | undefined,
    breakEvenArv: (r.breakEvenArv ?? r.break_even_arv) as number | null | undefined,
    fiveYearEquity: (r.fiveYearEquity ?? r.five_year_equity) as number | null | undefined,
    raw: r,
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
