import type { ScoutConfig } from './types'

export type ScoredCandidate = {
  address: string
  city: string
  state: string
  metro: string
  price: number
  beds: number
  baths: number
  sqft: number
  propertyType: string
  daysOnMarket: number
  listingUrl: string
  source: 'zillow' | 'perplexity'
  description: string | null
  zestimate: number | null
  rentZestimate: number | null
  passedFilters: boolean
  filterFailReasons: string[]
}

export function scoreAgainstCriteria(
  candidate: Omit<ScoredCandidate, 'passedFilters' | 'filterFailReasons'>,
  config: ScoutConfig
): ScoredCandidate {
  const reasons: string[] = []

  // Price filter — available from Zillow.
  // Skip when price is 0 (Perplexity results sometimes missing price); allow
  // through so we can enrich later instead of dropping unknown leads.
  if (config.max_purchase_price && candidate.price > 0 && candidate.price > config.max_purchase_price) {
    reasons.push(`Price $${candidate.price.toLocaleString()} exceeds max $${config.max_purchase_price.toLocaleString()}`)
  }

  // Beds filter — available from Zillow.
  if (config.min_beds && candidate.beds > 0 && candidate.beds < config.min_beds) {
    reasons.push(`${candidate.beds} beds below minimum ${config.min_beds}`)
  }

  // DOM filter — available from Zillow.
  if (config.max_days_on_market && candidate.daysOnMarket > 0 && candidate.daysOnMarket > config.max_days_on_market) {
    reasons.push(`${candidate.daysOnMarket} DOM exceeds max ${config.max_days_on_market}`)
  }

  // Property type filter — available from Zillow.
  if (config.property_types && config.property_types.length > 0 && candidate.propertyType) {
    const typeMatch = config.property_types.some(t =>
      candidate.propertyType.toLowerCase().includes(t.toLowerCase()) ||
      t.toLowerCase().includes(candidate.propertyType.toLowerCase()) ||
      (t === 'SFR' && (
        candidate.propertyType.toLowerCase().includes('single') ||
        candidate.propertyType.toLowerCase().includes('house') ||
        candidate.propertyType.toLowerCase().includes('residential')
      )) ||
      (t === 'Duplex' && candidate.propertyType.toLowerCase().includes('duplex')) ||
      (t === 'Multi-Family' && candidate.propertyType.toLowerCase().includes('multi'))
    )
    if (!typeMatch) {
      reasons.push(`Property type ${candidate.propertyType} not in ${config.property_types.join(', ')}`)
    }
  }

  // NOTE: cap_rate, coc, deal_score filters are applied AFTER AI analysis
  // — we don't have those values yet at discovery time.

  return {
    ...candidate,
    passedFilters: reasons.length === 0,
    filterFailReasons: reasons,
  }
}
