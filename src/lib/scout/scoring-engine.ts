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

  if (config.max_purchase_price && candidate.price > config.max_purchase_price) {
    reasons.push(`Price $${candidate.price.toLocaleString()} exceeds max $${config.max_purchase_price.toLocaleString()}`)
  }

  if (config.min_beds && candidate.beds < config.min_beds) {
    reasons.push(`${candidate.beds} beds below minimum ${config.min_beds}`)
  }

  if (config.max_days_on_market && candidate.daysOnMarket > config.max_days_on_market) {
    reasons.push(`${candidate.daysOnMarket} DOM exceeds max ${config.max_days_on_market}`)
  }

  if (config.property_types && config.property_types.length > 0) {
    const typeMatch = config.property_types.some(t =>
      candidate.propertyType.toLowerCase().includes(t.toLowerCase()) ||
      t.toLowerCase().includes(candidate.propertyType.toLowerCase()) ||
      (t === 'SFR' && candidate.propertyType.toLowerCase().includes('single'))
    )
    if (!typeMatch) {
      reasons.push(`Property type ${candidate.propertyType} not in ${config.property_types.join(', ')}`)
    }
  }

  return {
    ...candidate,
    passedFilters: reasons.length === 0,
    filterFailReasons: reasons,
  }
}
