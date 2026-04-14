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
}

export const dealBreakdownIssues: DealBreakdownIssue[] = [
  {
    slug: 'issue-150-vegas-micro-unit-tampa-str',
    issueNumber: 150,
    date: 'April 2026',
    title: 'Vegas Micro-Unit Density + Naked City Tax Trap + Tampa STR Portfolio',
    previewText: 'Downtown Vegas 83-unit delivering $33M Year 30, micro-unit density play. Vegas Naked City 24-unit property tax CRITICAL error. Tampa STR 8.8% CoC Florida protected.',
    ctaStrategy: 'brrrr',
    properties: [
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
      },
    ],
    content: `
## This Week's Deals

Three-property portfolio spanning Vegas micro-unit density, a tax trap warning, and a Tampa STR operating business. Each deal teaches something different about how experienced investors stress test assumptions before deploying capital.

---

## 🏢 Vegas Carson View — 83-Unit Micro-Unit Density Play

**200 S 8th St, Downtown Las Vegas, NV 89101**
**$6,900,000 ($83,133/unit) · 83 Units · Motel Conversion**

This is an urban density operating business, not a passive apartment investment. 228 SF average unit size, exterior corridor 1963 motel conversion, on-site staff, owner-paid utilities — the format requires an experienced operator who understands what they're managing.

### The Numbers

| Metric | Value |
|--------|-------|
| Down Payment (25%) | $1,725,000 |
| Total Cash Required | $1,932,000 |
| Gross Rent | $73,940/mo ($891/unit avg) |
| Annual Cash Flow | $109,176 ($9,098/mo) |
| Year 1 CoC | 5.7% |
| Cap Rate | 7.3% |
| Debt Coverage | 1.28 |
| Break-Even Ratio | 81.1% |
| Year 30 Property Value | $22,379,443 |
| Year 30 Total Profit | $32,966,494 |

### Unit Mix

| Type | Units | Avg Rent | Monthly |
|------|-------|----------|---------|
| Studio Tier A | 2 | $725 | $1,450 |
| Studio Tier B | 59 | $900 | $53,100 |
| Studio Tier C | 12 | $825 | $9,900 |
| 1BR/1BA | 10 | $949 | $9,490 |
| **Total** | **83** | **$891 avg** | **$73,940** |

### Why It Works

**$83,133/unit is genuinely cheap for 83 doors in Vegas.** Fremont Street adjacency, irreplaceable density on 0.35 acres downtown — this basis doesn't get replicated. 7.3% cap above current Vegas urban multifamily average. 81.1% break-even ratio means occupancy only needs to exceed 18.9% to cover all costs and debt service. Proven through COVID with full occupancy.

**Kitchen conversion upside is documented, not speculative.** Nearby operators have achieved $150-250/unit rent premiums post-kitchen on comparable units. Conservative math: 59 Tier B studios × $150 increase = $8,850/mo additional revenue. At 7.3% cap that's $1,454,794 in implied asset value on $708K in capex — 105% ROI on the conversion.

### The Risks

**$8,279/mo owner-paid utilities is major exposure.** 11.8% of gross rent. Audit exactly what's owner-paid immediately — submetering feasibility could recover $3-4K/month and add $493-658K in asset value at current cap rate.

**Financing is genuinely complex.** Many conventional multifamily lenders won't touch sub-250 SF average units or motel conversions. Confirm 75% LTV 30-year amortizing terms are locked with an actual lender who has reviewed unit sizes and property history BEFORE going under contract. Bridge/DSCR lenders are the realistic path and may come at higher rates.

**1963 wood-frame deferred maintenance.** PCA is mandatory. $44,364/year CapEx reserve may prove insufficient on aging systems.

### Verdict: 7/10 — Buy, Experienced Urban Operator Only

Legitimate urban density play at one of Las Vegas's most active revitalization corridors. The kitchen conversion alpha is real. The complexity is also real — this is an actively staffed operating business, not a passive hold. Right hands, reserve $300-400K beyond the down payment.

---

## 🏢 Vegas Fortune Villas — Property Tax Error Breaks the Model

**2216-2224 Tam Dr, Las Vegas, NV 89102**
**$2,850,000 ($118,750/unit) · 24 Units · Naked City**

This deal has a single line item that may destroy the entire investment thesis. The property tax assumption in the model is almost certainly wrong.

### The Numbers — Modeled vs Tax-Corrected

| Metric | As Modeled | Tax Corrected |
|--------|-----------|---------------|
| Down Payment (25%) | $712,500 | $712,500 |
| Total Cash Required | $798,000 | $798,000 |
| Property Taxes | $450/mo ($5,400/yr) | ~$1,425/mo ($17,100/yr) |
| Annual Cash Flow | $17,304 | ~$5,604 |
| CoC | 2.2% | ~0.7% |
| Cap Rate | 6.3% | ~5.9% |
| DCR | 1.11 | ~1.04 |
| Monthly Cash Flow | $1,442 | ~$467 |

### The Tax Problem

Nevada assessors typically value at 35% taxable value with approximately 3.2% levy, producing an effective rate of 0.5-0.7% of market value. At 0.6% on a $2.85M purchase, actual post-sale taxes are approximately $17,100/year — more than 3x the modeled $5,400.

If taxes correct to $17,100/year: annual NOI drops $11,700, monthly cash flow falls from $1,442 to $467, CoC drops from 2.2% to 0.7%, DCR falls from 1.11 to 1.04.

**This is not a rounding error. This single line item eliminates the cash flow thesis.**

**MANDATORY before offer:** Call Clark County Assessor at (702) 455-3882. Ask for the actual assessed value and tax obligation on a property purchased at $2,850,000. The $5,400/year figure is almost certainly the current owner's legacy basis — it will not survive a sale.

### What Could Make This Interesting

At $2,400-2,500K with verified taxes, the deal potentially becomes interesting again. R-4 zoning on 0.48 acres near the Strip carries long-term redevelopment optionality. RUBS utility recovery ($50-60/unit) adds $1,200-1,440/mo in effective NOI. Renovation upside on unrenovated units adds additional value.

### Verdict: 4.5/10 — Hard Pass Until Tax Verified

Price reduced signals seller motivation. Negotiate hard if taxes verify or correct to $2.4-2.5M. At current ask with unverified taxes, the risk-adjusted return doesn't justify deploying $798K in Naked City with 1.11 DCR and a modeled figure that's almost certainly wrong.

---

## 🏖️ Tampa STR 4-Unit — 8.8% CoC, 62% Expense Ratio Reality

**4513 W McElroy Ave, South Tampa, FL 33611**
**$850,000 ($212,500/unit) · 4 Studios · Turnkey Airbnb**

The 62% expense ratio is not a flaw. It's the cost of operating an STR. Understanding why it's justified is what separates investors who buy this correctly from those who get surprised after closing.

### The Numbers

| Metric | Value |
|--------|-------|
| Down Payment (25%) | $212,500 |
| Total Cash Required | $238,000 |
| Gross STR Revenue | $16,000/mo ($4,000/unit avg) |
| Annual Cash Flow | $21,000 ($1,750/mo) |
| CoC | 8.8% |
| Cap Rate | 8.2% |
| Debt Coverage | 1.43 |
| Operating Expense Ratio | 62% of EGI |

### Why 62% OpEx Is Justified

| | LTR Model | STR Model |
|--|-----------|-----------|
| Gross Revenue | $6,000/mo | $16,000/mo |
| Expense Ratio | 40-45% | 62% |
| NOI | ~$3,300/mo | ~$5,780/mo |
| **STR advantage** | | **+$2,480/mo (+75%)** |

Three cost centers exist in STR that don't exist in LTR: Airbnb platform fees (14.1% of gross), cleaning per-stay (8.1%), and STR management (15.1%). Those three line items total 37.2% of gross revenue. The $16,000/month gross compensates for all of it and then some.

### The Florida Advantage

Florida Statute 509 provides state-level preemption — cities and counties cannot prohibit short-term rentals outright. This removes the existential regulatory risk that makes most urban STR investments fragile. You're not buying an Airbnb that a city council vote can eliminate next year.

### What Breaks the Model

Revenue needs to stay at $16,000/month. If gross drops to $13,000/month the deal approaches breakeven. The 1.43 DCR means income can drop 30% before missing a loan payment — meaningful cushion — but the operating model requires active management, strong reviews, and dynamic pricing to maintain occupancy.

**Verify trailing 12-month revenue before closing.** Request actual Airbnb/VRBO payout history for all 4 units. The $16,000/month is a modeled figure — confirm it's documented performance, not a projection.

Self-managing removes the $2,417/month management fee entirely. At $0 management cost, monthly cash flow jumps from $1,750 to $4,167 and CoC reaches approximately 21%.

### Verdict: 7.5/10 — Buy Contingent Revenue Verification

Strong South Tampa STR asset with state-level regulatory protection, diversified demand base (tourism + corporate + MacDill AFB government travel), and genuine optionality to pivot STR/MTR/LTR. The 62% expense ratio is the structure, not the problem. Contingent on T12 revenue verification confirming $180K+ annual gross.

---

## Deal Rankings

| Property | Strategy | Cash In | Day 1 CoC | Units | Verdict |
|----------|----------|---------|-----------|-------|---------|
| Vegas Carson View | Multifamily | $1.932M | 5.7% | 83 | 7/10 ✅ |
| Vegas Fortune Villas | Multifamily | $798K | 2.2% (0.7% corrected) | 24 | 4.5/10 ❌ |
| Tampa STR 4-Unit | STR | $238K | 8.8% | 4 | 7.5/10 ⚠️ |

---

*Model these deals at dealsletter.io — BRRRR, multifamily, STR, and house hack analysis powered by live market data. 3 free analyses/month, no card needed.*
    `,
  },
]

export function getIssueBySlug(slug: string): DealBreakdownIssue | undefined {
  return dealBreakdownIssues.find(issue => issue.slug === slug)
}

export function getLatestIssue(): DealBreakdownIssue | undefined {
  return dealBreakdownIssues[0]
}
