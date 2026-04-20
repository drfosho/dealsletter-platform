import type { Deal, PipelineStatus, Strategy } from '@/data/v3-deals'
import { signalFromDealScore, type Signal } from '@/lib/v3-analysis-parser'

// Shape returned by GET /api/analysis/list (V2 endpoint, reused by V3).
export type ListRecord = {
  id: string
  address: string
  strategy?: string
  deal_type?: string
  created_at?: string
  analysis_date?: string
  roi?: number | null
  profit?: number | null
  purchase_price?: number | null
  monthly_cash_flow?: number | null
  cap_rate?: number | null
  cash_on_cash?: number | null
  arv?: number | null
  total_investment?: number | null
  monthly_rent?: number | null
  ai_analysis?: Record<string, unknown> | null
  property_data?: Record<string, unknown> | null
  analysis_data?: Record<string, unknown> | null
}

// Shape returned by GET /api/v3/pipeline.
export type PipelineRecord = {
  id: string
  address: string
  strategy?: string
  signal?: string | null
  dealScore?: number | null
  cap?: number | null
  coc?: number | null
  cashFlow?: number | null
  roi?: number | null
  addedDate?: string
  status?: string
  isFavorite?: boolean
}

const STRATEGY_LABELS: Record<string, Strategy> = {
  brrrr: 'BRRRR',
  BRRRR: 'BRRRR',
  flip: 'Fix & Flip',
  'fix-and-flip': 'Fix & Flip',
  fix_flip: 'Fix & Flip',
  'Fix & Flip': 'Fix & Flip',
  rental: 'Buy & Hold',
  buyhold: 'Buy & Hold',
  'buy-and-hold': 'Buy & Hold',
  'buy-hold': 'Buy & Hold',
  'Buy & Hold': 'Buy & Hold',
  househack: 'House Hack',
  'house-hack': 'House Hack',
  house_hack: 'House Hack',
  'House Hack': 'House Hack',
}

function normalizeStrategy(raw: string | undefined | null): Strategy {
  if (!raw) return 'Buy & Hold'
  const hit = STRATEGY_LABELS[raw] || STRATEGY_LABELS[raw.toLowerCase()]
  return hit || 'Buy & Hold'
}

function normalizeStatus(raw: string | undefined | null): PipelineStatus {
  if (!raw) return 'Watching'
  const map: Record<string, PipelineStatus> = {
    Watching: 'Watching',
    Reviewing: 'Reviewing',
    Saved: 'Saved',
    'Strong Buy': 'Strong Buy',
    Passed: 'Passed',
  }
  return map[raw] || 'Watching'
}

function parseCityState(address: string): { city: string; state: string } {
  const parts = address.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const tail = parts[parts.length - 1]
    const tailParts = tail.split(/\s+/)
    const state = tailParts[0] || ''
    const city = parts[parts.length - 2] || ''
    return { city, state }
  }
  return { city: '', state: '' }
}

function fmtRelative(iso: string | undefined | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const today = new Date()
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  if (sameDay) return 'Today'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function adaptListRecord(r: ListRecord): Deal {
  const { city, state } = parseCityState(r.address || '')
  const ad = (r.analysis_data || {}) as Record<string, unknown>
  const dealScore = (ad.dealScore as number | undefined) ?? null
  const status = normalizeStatus((ad.v3_pipeline_status as string | undefined) || 'Reviewing')
  const propertyTop = ((r.property_data as Record<string, unknown> | null)?.property || {}) as Record<string, unknown>
  const beds = Number(propertyTop.bedrooms || 0) || 0
  const baths = Number(propertyTop.bathrooms || 0) || 0
  const sqft = Number(propertyTop.squareFootage || 0) || 0

  return {
    id: r.id,
    address: (r.address || '').split(',')[0] || r.address || '—',
    city,
    state,
    strategy: normalizeStrategy(r.strategy || r.deal_type),
    beds,
    baths,
    sqft,
    cap: r.cap_rate ?? null,
    coc: r.cash_on_cash ?? null,
    cashFlow: r.monthly_cash_flow ?? null,
    price: r.purchase_price ?? 0,
    arv: r.arv ?? null,
    signal: signalFromDealScore(dealScore) as Signal,
    status,
    addedDate: fmtRelative(r.created_at || r.analysis_date),
  }
}

export function adaptPipelineRecord(r: PipelineRecord): Deal {
  const { city, state } = parseCityState(r.address || '')
  const signal = r.signal
    ? (r.signal as Signal)
    : signalFromDealScore(r.dealScore ?? null)
  return {
    id: r.id,
    address: (r.address || '').split(',')[0] || r.address || '—',
    city,
    state,
    strategy: normalizeStrategy(r.strategy),
    beds: 0,
    baths: 0,
    sqft: 0,
    cap: r.cap ?? null,
    coc: r.coc ?? null,
    cashFlow: r.cashFlow ?? null,
    price: 0,
    arv: null,
    signal,
    status: normalizeStatus(r.status),
    addedDate: fmtRelative(r.addedDate),
  }
}
