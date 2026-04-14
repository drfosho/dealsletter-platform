export interface DealProperty {
  address: string
  city: string
  price: number
  units: number
  capRate: number
  coc: number
  cashRequired: number
  annualCashFlow: number
  verdict: string
  score: string
  scoreValue: number
  tag: string
  tagColor: string
  strategy: string
  listingUrl?: string
  opportunity?: string
  risk?: string
  fullVerdict?: string
}

export interface IssueSponsor {
  name: string
  logo: string
  headline: string
  body: string
  cta: string
  ctaUrl: string
  tag?: string
}

export interface DealBreakdownIssue {
  slug: string
  issueNumber: number
  date: string
  title: string
  previewText: string
  properties: DealProperty[]
  content: string
  ctaStrategy: string
  sponsor?: IssueSponsor
}

export const dealBreakdownIssues: DealBreakdownIssue[] = [
  {
    slug: 'issue-150-vegas-micro-unit-tampa-str',
    issueNumber: 150,
    date: 'April 2026',
    title: 'Vegas Micro-Unit Density + Naked City Tax Trap + Tampa STR Portfolio',
    previewText: 'Downtown Vegas 83-unit delivering $33M Year 30. Naked City 24-unit property tax error breaks the model. Tampa STR 8.8% CoC with Florida regulatory protection.',
    ctaStrategy: 'multifamily',
    sponsor: {
      name: 'LP Conf',
      logo: 'https://dealsletter.io/logos/150-sponsor.jpg',
      headline: 'Network with 50+ LPs & family offices on Zoom',
      body: 'Free virtual LP Conf on April 30. Vanderbilt Family Office, Hilton FO, Rothschild FO, and Pinegrove ($10B AUM FoF) confirmed as speakers. Network directly with active LPs across 20+ themed breakout rooms covering how top FoFs screen 1,000+ managers, family office allocation trends in 2026, and LP perspectives on AI and European VC.',
      cta: 'Register free — Virtual LP Conf',
      ctaUrl: 'https://lpconf.com/?57',
      tag: 'SPONSORED',
    },
    properties: [
      {
        address: '371 E William St',
        city: 'San Jose, CA 95112',
        price: 800000,
        units: 1,
        capRate: 0,
        coc: 88,
        cashRequired: 120140,
        annualCashFlow: 105675,
        verdict: 'Conditional Buy — Verify ARV and Rehab Budget',
        score: '6/10',
        scoreValue: 6,
        tag: 'FIX & FLIP',
        tagColor: '#EF9F27',
        strategy: 'flip',
        listingUrl: 'https://www.zillow.com/homedetails/371-E-William-St-San-Jose-CA-95112/19711857_zpid/',
        opportunity: 'Strong ROI on a small cash position. 88% cash-on-cash return on $120K deployed at the $775K offer price. Located one block from SJSU with commercial zoning — opens the buyer pool to investors, house-hackers, and development plays.',
        risk: 'Model disagreement — Claude scored 4/10 (hold), GPT-4o and Grok scored 7/10 (buy). Thin ~10% margin on resale leaves minimal cushion for rehab overruns. $85K rehab budget must be contractor-verified before offering.',
        fullVerdict: 'Conditional buy at or below $775K with verified rehab and confirmed ARV comps. Every $25K over ask compresses an already thin margin.',
      },
      {
        address: '200 S 8th St',
        city: 'Downtown Las Vegas, NV',
        price: 6900000,
        units: 83,
        capRate: 7.3,
        coc: 5.7,
        cashRequired: 1932000,
        annualCashFlow: 109176,
        verdict: 'Buy — Experienced Urban Operator Only',
        score: '7/10',
        scoreValue: 7,
        tag: 'URBAN DENSITY PLAY',
        tagColor: '#1D9E75',
        strategy: 'multifamily',
        listingUrl: 'https://www.loopnet.com/Listing/200-S-8th-St-Las-Vegas-NV/40106069/',
        opportunity: '83 doors at $83K/unit on the Fremont corridor with 6 years of proven occupancy including through COVID. Kitchen conversions on 59 studios at $150/unit bump produce $1.45M implied asset value on ~$708K capex — 105% ROI on the conversion alone.',
        risk: 'Staffed operating business, not a passive hold. On-site payroll $8,600/mo + owner-paid utilities $8,300/mo. Sub-250 SF average unit size creates financing complexity — confirm lender terms before going under contract.',
        fullVerdict: 'Buy for an experienced urban operator with $300-400K reserves beyond the down payment. Not suitable for passive or first-time investors.',
      },
      {
        address: '2216 Tam Dr',
        city: 'Las Vegas, NV',
        price: 2850000,
        units: 24,
        capRate: 6.3,
        coc: 2.2,
        cashRequired: 798000,
        annualCashFlow: 17304,
        verdict: 'Hard Pass — Property Tax Error Breaks Model',
        score: '4.5/10',
        scoreValue: 4.5,
        tag: 'TAX TRAP ⚠️',
        tagColor: '#f09595',
        strategy: 'multifamily',
        listingUrl: 'https://www.loopnet.com/Listing/2216-2224-Tam-Dr-Las-Vegas-NV/39661604/',
        opportunity: '24 units near the Strip with R-4 zoning and a motivated seller — price already reduced. RUBS utility recovery could add $14-17K/yr in NOI at minimal cost. At $2.4-2.5M with verified taxes the deal potentially becomes interesting.',
        risk: 'Property tax in the OM is almost certainly wrong. Modeled at $5,400/yr — Nevada effective rate puts post-sale taxes at ~$17,100/yr. That correction drops monthly cash flow from $1,442 to $467 and DCR from 1.11 to 1.04. Call Clark County: (702) 455-3882.',
        fullVerdict: 'Hard pass at $2,850,000 until taxes independently confirmed. Walk unless price corrects to $2.4-2.5M.',
      },
      {
        address: '4513 W McElroy Ave',
        city: 'South Tampa, FL',
        price: 850000,
        units: 4,
        capRate: 8.2,
        coc: 8.8,
        cashRequired: 238000,
        annualCashFlow: 21000,
        verdict: 'Buy — Contingent Revenue Verification',
        score: '7.5/10',
        scoreValue: 7.5,
        tag: 'STR BUSINESS',
        tagColor: '#7F77DD',
        strategy: 'str',
        listingUrl: 'https://www.loopnet.com/Listing/4513-W-McElroy-Ave-Tampa-FL/40090503/',
        opportunity: '8.8% CoC on $238K deployed with Florida state preemption removing the regulatory risk that kills most STR investments. Turnkey operation — existing listing, reviews, and search ranking transfer at close. MacDill AFB + cruise port + Amalie Arena drive year-round demand.',
        risk: '62% expense ratio is structurally normal for STR — platform fees (14%), cleaning (8%), management (15%). The model only works at $16K/mo gross. A drop to $13K approaches breakeven. No trailing revenue confirmed yet.',
        fullVerdict: 'Buy contingent on 12-month Airbnb payout history confirming $180K+ annual gross. If numbers check out, move confidently.',
      },
    ],
    content: `
## This Week's Deals

Four properties across two markets — a San Jose fix & flip with a Max IQ model disagreement, an 83-unit Vegas micro-unit density play, a Naked City 24-unit with a critical tax error, and a turnkey Tampa STR with state-level regulatory protection.

---

## 🏠 San Jose Fix & Flip — 371 E William St

**San Jose, CA 95112 · 3bd/2ba · 956 sqft · Built 1910**
**List $800,000 · Offer modeled at $775,000 · Hard money 10% down**

This one was run through Max IQ — three models, three perspectives. The result was a split verdict.

### Max IQ Results

| Model | Score | Verdict |
|-------|-------|---------|
| Claude Opus (Skeptic) | 4/10 | Hold |
| GPT-4o (Sponsor) | 7/10 | Buy |
| Grok 3 (Quant) | 7/10 | Buy |
| **Average** | **6/10** | **Conditional Buy** |

### The Numbers

| Metric | Value |
|--------|-------|
| Offer Price | $775,000 |
| Down Payment (10%) | $77,500 |
| Total Cash In | $120,140 |
| Rehab Budget | $85,000 |
| ARV (modeled) | $1,055,827 |
| Net Profit | $105,675 |
| ROI on Cash | 88% |

### Opportunity

Strong ROI on a relatively small cash position. At $775K, the model produces 88% cash-on-cash return on $120K deployed. Located one block from SJSU with commercial zoning — opens the buyer pool to investors, house-hackers, and development plays. ARV modeled at $1,055,827 based on recent area comps.

### Risk

**The model disagreement is the story.** Claude scored it 4/10 (hold) while GPT-4o and Grok scored 7/10 (buy). The disagreement comes from ARV uncertainty and a thin profit margin of approximately 10% on resale value — minimal cushion for rehab overruns or any market softness. The $85,000 rehab budget must be contractor-verified before offering.

### Verdict: 6/10 — Conditional Buy

At or below $775K with a verified rehab budget and confirmed ARV comps. Do not overpay — every $25K over ask compresses an already thin margin.

---

## 🏢 Vegas Carson View — 83-Unit Micro-Unit Density

**200 S 8th St, Downtown Las Vegas, NV 89101**
**$6,900,000 ($83,133/unit) · 83 Units · Motel Conversion**

### The Numbers

| Metric | Value |
|--------|-------|
| Down Payment (25%) | $1,725,000 |
| Total Cash Required | $1,932,000 |
| Gross Rent | $73,940/mo ($891/unit avg) |
| Annual Cash Flow | $109,176 |
| Day 1 CoC | 5.7% |
| Cap Rate | 7.3% |
| DCR | 1.28 |
| Break-Even Occupancy | 81.1% |
| Year 30 Total Profit | $32,966,494 |

### Opportunity

83 doors at $83K/unit on the Fremont corridor with 6 years of proven occupancy including through COVID. Kitchen conversions on 59 studios at a conservative $150/unit bump produce $1.45M in implied asset value on ~$708K capex — a 105% ROI without touching the remaining 24 units. 81.1% break-even ratio means you only need to exceed 18.9% vacancy to cover all costs and debt service.

### Risk

**Staffed operating business, not a passive hold.** On-site payroll runs $8,600/mo and owner-paid utilities add $8,300/mo. Average unit size of 228 SF creates financing complexity — many conventional lenders won't touch sub-250 SF. Confirm lender terms before going under contract.

### Verdict: 7/10 — Buy, Experienced Operator Only

Strong urban density play at an irreplaceable basis. Right hands, with $300-400K in reserves beyond the down payment.

---

## 🏢 Vegas Fortune Villas — Property Tax Error Breaks the Model

**2216-2224 Tam Dr, Las Vegas, NV 89102 · Naked City**
**$2,850,000 ($118,750/unit) · 24 Units · 91% Occupied**

### Modeled vs Tax-Corrected

| Metric | As Modeled | Tax Corrected |
|--------|-----------|---------------|
| Property Taxes | $450/mo | ~$1,425/mo |
| Annual Cash Flow | $17,304 | ~$5,604 |
| CoC | 2.2% | ~0.7% |
| DCR | 1.11 | ~1.04 |
| Monthly Cash Flow | $1,442 | ~$467 |

### The Tax Problem

Nevada's effective rate on a $2.85M purchase puts actual post-sale taxes at approximately $17,100/year — more than 3x the modeled $5,400. That single correction drops monthly cash flow from $1,442 to $467 and DCR from 1.11 to 1.04.

**At 1.04 DCR one bad month turns negative.**

**MANDATORY before offer:** Call Clark County Assessor at (702) 455-3882. Ask for the actual assessed value and tax obligation on a property purchased at $2,850,000.

### Opportunity

24 units near the Strip with R-4 zoning and a motivated seller. RUBS utility recovery adds $14-17K/yr in NOI at minimal cost. Renovation upside on unrenovated units. At $2.4-2.5M with verified taxes the deal potentially becomes interesting.

### Verdict: 4.5/10 — Hard Pass at Current Ask

Walk unless taxes verify or price corrects to $2.4-2.5M.

---

## 🏖️ Tampa STR 4-Unit — 8.8% CoC, Florida Protected

**4513 W McElroy Ave, South Tampa, FL 33611**
**$850,000 ($212,500/unit) · 4 Studios · Turnkey Airbnb**

### The Numbers

| Metric | Value |
|--------|-------|
| Down Payment (25%) | $212,500 |
| Total Cash Required | $238,000 |
| Gross STR Revenue | $16,000/mo |
| Annual Cash Flow | $21,000 |
| CoC | 8.8% |
| Cap Rate | 8.2% |
| DCR | 1.43 |
| Expense Ratio | 62% |

### Why 62% Expense Ratio Is Not a Problem

| | LTR | STR |
|--|-----|-----|
| Gross Revenue | $6,000/mo | $16,000/mo |
| Expense Ratio | 40-45% | 62% |
| NOI | ~$3,300/mo | ~$5,780/mo |

The 62% comes from three STR-specific costs that don't exist in LTR: Airbnb fees (14%), cleaning per-stay (8%), and management (15%). The $16K gross compensates for all of it and produces 75% higher NOI than the equivalent LTR.

### The Florida Advantage

Florida Statute 509 provides state-level preemption — cities and counties cannot prohibit short-term rentals outright. This removes the existential regulatory risk that makes most urban STR investments fragile.

### Risk

**The model only works at $16K/month gross.** A drop to $13K approaches breakeven. Verify trailing 12-month Airbnb payout history before closing.

### Verdict: 7.5/10 — Buy Contingent Revenue Verification

Confirm $180K+ annual gross from actual payout history. If verified, move confidently.

---

*3 free analyses/month at dealsletter.io — no card needed. Model any of these deals yourself with live market data.*
    `,
  },
]

export function getIssueBySlug(slug: string): DealBreakdownIssue | undefined {
  return dealBreakdownIssues.find(issue => issue.slug === slug)
}

export function getLatestIssue(): DealBreakdownIssue | undefined {
  return dealBreakdownIssues[0]
}
