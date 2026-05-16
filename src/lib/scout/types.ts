export type ScoutConfig = {
  id: string
  user_id: string
  enabled: boolean
  strategy: string
  target_metros: string[]
  max_purchase_price: number | null
  min_deal_score: number | null
  min_cap_rate: number | null
  min_coc: number | null
  max_rehab_budget: number | null
  min_arv_margin: number | null
  property_types: string[]
  max_days_on_market: number | null
  min_beds: number | null
  zip_codes: string[] | null
}

export type ScoutResult = {
  user_id: string
  address: string
  city: string
  state: string
  metro: string
  strategy: string
  deal_score: number | null
  cap_rate: number | null
  coc: number | null
  purchase_price: number
  arv: number | null
  rehab_estimate: number | null
  monthly_cash_flow: number | null
  days_on_market: number
  property_type: string
  beds: number
  baths: number
  sqft: number
  signal: string | null
  ai_summary: string | null
  listing_url: string
  is_read: boolean
  is_saved: boolean
  run_date: string
}
