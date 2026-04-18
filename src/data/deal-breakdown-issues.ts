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
    slug: 'issue-151-kc-multifamily-vegas-48-sonoma-oakland-flip',
    issueNumber: 151,
    date: 'April 2026',
    title: 'KC 8.8% CoC Multifamily + Vegas 48-Unit + Sonoma Wine Country + Oakland Bay Area Flip',
    previewText: 'Kansas City 12-unit at 8.2% cap on current rents. Vegas 48-unit fully renovated — great asset, thin margin. Sonoma 7-unit wine country income play. Oakland hillside flip at 287% ROI.',
    ctaStrategy: 'buyhold',
    sponsor: undefined,
    properties: [
      {
        address: '4009-4015 Charlotte St',
        city: 'Kansas City, MO 64110',
        price: 1375000,
        units: 12,
        capRate: 8.2,
        coc: 8.8,
        cashRequired: 385000,
        annualCashFlow: 33972,
        verdict: 'Buy at ask — 8.2% cap on current rents with $234/unit to market sitting untouched',
        score: '8/10',
        scoreValue: 8,
        tag: 'BUY & HOLD KC',
        tagColor: '#1D9E75',
        strategy: 'buyhold',
        listingUrl: 'https://www.loopnet.com/Listing/4009-4015-Charlotte-St-Kansas-City-MO/40193841/',
        opportunity: 'All 12 units are 2BR/1BA producing $1,116/unit against a $1,350 market rate — the upside is already there, it just needs lease turnover to capture it. At 8.2% cap on actual in-place rents the deal cash flows from Day 1 without touching a lease or spending a dollar on improvements. Streetcar extension proximity adds a genuine demand catalyst for professional tenants in one of KC\'s most established walkable corridors.',
        risk: 'Only 8 dedicated parking stalls for 12 units will require setting tenant expectations upfront for the 4 without a spot. Units lacking central HVAC will need upgrades before commanding full market rents — a manageable lift during natural turnover, not an emergency capex event.',
        fullVerdict: 'Buy at asking price, execute market rent increases as leases roll, and hold 10+ years. The 30-year income and equity trajectory on a fully stabilized 12-unit brick asset in a transit-adjacent KC neighborhood is the play.',
      },
      {
        address: '5286 E Tropicana Ave',
        city: 'Las Vegas, NV 89122',
        price: 6990000,
        units: 48,
        capRate: 6.2,
        coc: 2.0,
        cashRequired: 1957200,
        annualCashFlow: 38364,
        verdict: 'Conditional — quality asset, wrong rate environment for the price. Long-horizon operators only.',
        score: '5.5/10',
        scoreValue: 5.5,
        tag: 'LONG-TERM PLAY',
        tagColor: '#EF9F27',
        strategy: 'buyhold',
        listingUrl: 'https://www.loopnet.com/Listing/5286-E-Tropicana-Ave-Las-Vegas-NV/40165960/',
        opportunity: 'Every unit fully renovated in 2025 with new roofs in 2021 — no capex exposure for the foreseeable future on a 48-unit stabilized community with private gated patios, two pools, and on-site management already in place. At $145,625/unit you\'re entering well below Las Vegas replacement cost, and the 10 and 20-year equity trajectory ($5.9M and $12.4M respectively) is the real thesis for a patient, well-capitalized operator.',
        risk: 'The 6.5% rate on $5.24M leaves only $3,197/month in net cash flow across 48 units — $67/door. DCR sits at ~1.10, meaning occupancy needs to stay above 90% just to cover debt service with nothing left for surprises. The operating expenses are modeled as estimated — demand the actual T-12 before committing nearly $2M in cash.',
        fullVerdict: 'Conditional buy for a well-capitalized long-term operator who can verify expenses, confirm rents at or below market, and hold 10+ years through a rate environment that will eventually improve. Not a deal for anyone needing meaningful Day 1 income.',
      },
      {
        address: '595 Boyes Blvd',
        city: 'Sonoma, CA 95476',
        price: 1300000,
        units: 7,
        capRate: 8.9,
        coc: 11.5,
        cashRequired: 364000,
        annualCashFlow: 41772,
        verdict: 'Conditional buy — 8.9% cap in Sonoma is rare, 1960 vintage and AB 1482 require eyes wide open',
        score: '7/10',
        scoreValue: 7,
        tag: 'WINE COUNTRY INCOME',
        tagColor: '#EF9F27',
        strategy: 'buyhold',
        listingUrl: 'https://www.loopnet.com/Listing/595-Boyes-Blvd-Sonoma-CA/40193243/',
        opportunity: 'A 7-unit single-level complex in Sonoma at 8.9% cap rate and $3,481/mo net cash flow is a rare California find. The 1.57 DCR confirms positive leverage with meaningful debt service cushion, and the long-term Sonoma appreciation story on a low per-unit basis ($185,714) is the compounding equity engine underneath a strong income play. Max IQ consensus: Opus 7, GPT-4o 8, Grok 9 — all three models recommend buy.',
        risk: 'A 1960 family-held California asset means deferred maintenance across plumbing, electrical, roofing, and seismic systems, combined with AB 1482 rent control capping annual increases at ~6–7% with just-cause eviction requirements. The modeled 34% expense ratio is likely understated — budget for 45–50% in realistic scenario planning and bring $75–100K in reserves beyond the $364K investment.',
        fullVerdict: 'Conditional buy for an experienced California operator with proper reserves and a 10+ year hold conviction. Verify individual leases, complete a thorough physical inspection, and underwrite the conservative expense scenario before committing.',
      },
      {
        address: '3635 64th Ave',
        city: 'Oakland, CA 94605',
        price: 685000,
        units: 1,
        capRate: 0,
        coc: 287,
        cashRequired: 107444,
        annualCashFlow: 308356,
        verdict: 'Strong buy conditional on ARV verification — 287% ROI on $107K cash, $42K under 70% MAO',
        score: '8/10',
        scoreValue: 8,
        tag: 'BAY AREA FLIP',
        tagColor: '#1D9E75',
        strategy: 'flip',
        listingUrl: 'https://www.realtor.com/realestateandhomes-detail/3635-64th-Ave_Oakland_CA_94605_M19998-43959',
        opportunity: 'A 3,884 SF hillside home with Bay Area and SF views priced $42,288 below the conservative 70% MAO — the investor cushion is built in before the first dollar of rehab. At $107,444 total cash invested under a 90% LTC hard money structure, the deal produces $308,356 in projected profit and remains cashflow-positive even if ARV comes in at 85% of projection. A nearby 3,782 SF comparable traded near $1.8M anchoring the upper exit range.',
        risk: 'No interior access on a 1950 East Oakland hillside construction means the $110,000 rehab estimate carries significant variance — foundation, seismic retrofitting, and electrical on a 75-year-old structure can push costs well beyond budget. The ARV comp spread of $737K–$1,384K is too wide to act on without a licensed appraisal confirming $1.1M+ before submitting.',
        fullVerdict: 'Conditional strong buy — verify ARV with a licensed Bay Area appraisal, confirm your hard money lender will fund 90% LTC on this specific property, and get a GC through the building before budgeting $110K on a 1950 hillside structure. If all three check out, move fast.',
      },
    ],
    content: `
## This Week's Deals

Four properties across four markets — a clean KC multifamily buy with built-in rent upside, a fully renovated Vegas 48-unit with thin margins, a rare Sonoma wine country income play, and a high-leverage Oakland hillside flip. Each one teaches something different about how market context changes the same numbers.

---

## 🏢 Charlotte Apartments — Kansas City 12-Unit Buy & Hold

**4009-4015 Charlotte St, Kansas City, MO 64110**
**$1,375,000 ($114,583/unit) · 12 Units · All 2BR/1BA**

One of the cleaner multifamily setups at this price point in Kansas City. An 8.2% cap rate and 8.8% CoC on current, in-place rents — not proforma. The deal works before you do anything.

### The Numbers

| Metric | Value |
|--------|-------|
| Down Payment (25%) | $343,750 |
| Total Cash In | $385,000 |
| Gross Rent | $13,392/mo (12 × $1,116) |
| Annual Cash Flow | $33,972 ($2,831/mo) |
| Cap Rate | 8.2% |
| CoC Year 1 | 8.8% |
| DCR | 1.43 |
| Break-Even Ratio | 73.9% |
| Price Per Unit | $114,583 |

### Unit Mix

| Type | Units | Current Rent | Market Rent | Upside |
|------|-------|-------------|-------------|--------|
| 2BR/1BA | 12 | $1,116 | $1,350 | +$234/unit |

### Opportunity

The $234/unit gap to market is not speculative — it's a natural mark-to-market as leases roll with zero capex required. Executing rent-to-market on all 12 units adds ~$33,696/year to gross income and pushes stabilized NOI north of $145,000 annually, implying asset value closer to $1.65–1.75M at the same cap rate. That's $275,000–$375,000 in unrealized equity sitting in current leases.

**73.9% break-even means three vacancies at once and you're still cash flow positive.**

Streetcar extension proximity is the location bonus. South Hyde Park is not a transitional neighborhood — it's established, walkable, and the transit access will attract the same professional tenant profile that supports consistent rent growth.

### The 30-Year Picture

| Year | Annual CF | CoC | Property Value |
|------|-----------|-----|----------------|
| 1 | $33,972 | 8.8% | $1,375,000 |
| 5 | $38,447 | 10.0% | $1,609,700 |
| 10 | $44,600 | 11.6% | $1,959,000 |
| 20 | $59,900 | 15.6% | $2,899,000 |
| 30 | $80,500 | 20.9% | $4,296,000 |

30-year total profit (CF + equity, paid-off): ~$4.7M

### Risk

Only 8 off-street spots for 12 units means 4 residents compete for street parking. Units without central HVAC need upgrades before commanding market rent — budget $600–$1,200/unit during natural turnover.

### Verdict: 8/10 — Buy

Buy at ask. Execute rent-to-market as units turn. Hold 10+ years.

---

## 🏢 Tropicana Valley Apartments — Vegas 48-Unit Long-Term Play

**5286 E Tropicana Ave, Las Vegas, NV 89122**
**$6,990,000 ($145,625/unit) · 48 Units · Fully Renovated 2025**

A quality asset in a weak financial position at today's rate environment. The property is excellent. The 6.5% debt load on a 6.2% cap rate is the problem.

### The Numbers

| Metric | Value |
|--------|-------|
| Down Payment (25%) | $1,747,500 |
| Total Cash In | $1,957,200 |
| Gross Rent | $60,000/mo (48 × $1,250) |
| Annual Cash Flow | $38,364 ($3,197/mo) |
| Cap Rate | 6.2% |
| CoC Year 1 | 2.0% |
| DCR | ~1.10 |
| Cash Flow Per Door | $67/mo |
| Price Per Unit | $145,625 |

### Why the Asset Is Strong

Every unit fully renovated in 2025. New roofs in 2021. Private gated patios on every unit. Two pools. On-site management. At $145,625/unit you're buying well below Las Vegas replacement cost of $200,000–250,000/unit. Zero near-term capex exposure.

### Why the Numbers Are Tight

$397,632/year in debt service on a $5.24M loan at 6.5% is the anchor. Break-even occupancy sits near 90% — you need 43+ of 48 units occupied just to cover debt service. One bad quarter and this deal runs negative.

**If rates drop to 5.5%, CoC jumps to ~5–6%. This is a rate-environment bet as much as a real estate bet.**

### The Long-Term Case

| Year | Annual CF | CoC | Total Profit |
|------|-----------|-----|-------------|
| 5 | $103,764 | 5.3% | $1,482,030 |
| 10 | $198,441 | 10.1% | $4,473,861 |
| 20 | $440,466 | 22.5% | $13,922,305 |
| 30 | $773,837 | 39.5% | $29,905,307 |

By Year 10 you're at 10.1% CoC and $4.47M total profit. The compounding math is real — but you're funding two years of thin cash flow while income catches up to debt.

### Verdict: 5.5/10 — Conditional

Only if: (1) T-12 confirms actual expenses match the $248K shown, (2) current rents are at or below verified market rate for renovated 2BR in this corridor, and (3) buyer has $500K+ in reserves beyond the $1.96M investment.

---

## 🍷 595 Boyes Blvd — Sonoma Wine Country 7-Unit

**Sonoma, CA 95476 · 7 Units · $1,300,000 ($185,714/unit)**
**Max IQ: Claude Opus 7/10 · GPT-4o 8/10 · Grok 3 9/10**

An 8.9% cap rate in Sonoma, CA is not something you see often. The numbers are among the strongest for California multifamily at this price point. The 1960 vintage and AB 1482 are the honest counterweight.

### The Numbers

| Metric | Value |
|--------|-------|
| Down Payment (25%) | $325,000 |
| Total Cash In | $364,000 |
| Gross Rent | $14,700/mo (7 × $2,100) |
| Annual Cash Flow | $41,772 ($3,481/mo) |
| Cap Rate | 8.9% |
| CoC Year 1 | 11.5% |
| DCR | 1.57 |
| Cash Flow Per Door | $497/mo |
| Price Per Unit | $185,714 |

### What Max IQ Said

| Model | Role | Score | Verdict |
|-------|------|-------|---------|
| Claude Opus 4.6 | The Skeptic | 7/10 | Buy — stress test expenses, bring $50–100K reserves |
| GPT-4o | The Sponsor | 8/10 | Buy — strong cash flow, 12.8% CoC exceeds 8% benchmark |
| Grok 3 | The Quant | 9/10 | Buy with high confidence — numbers support moving forward |

All three models recommend buy. The divergence is in how much cushion they require you to bring.

### The California Reality Check

**AB 1482 rent control caps annual increases at 5% + CPI (currently ~6–7% max).** Just-cause eviction requirements make problem tenant removal expensive and slow. This is not a deal-breaker — but it materially limits income growth speed.

**Claude Opus stress-tested the expense ratio at 45–52% vs. the modeled 34%.** Under that scenario, actual Year 1 cash flow drops to $1,500–2,000/month. Budget the downside, don't assume the upside.

All units showing identical $2,100 rent is a red flag — get individual lease abstracts before closing to confirm actual vs. estimated rents.

### Verdict: 7/10 — Conditional Buy

Buy only if: (1) physical inspection confirms no immediate structural failures, (2) individual lease abstracts confirm actual rents, (3) buyer brings $75–100K in reserves beyond the $364K investment, and (4) long-term hold (10+ years) is the confirmed thesis.

---

## 🏠 3635 64th Ave — Oakland Hillside Flip

**Oakland, CA 94605 · 5BR/2.5BA · 3,884 SF · $685,000**
**Claude Opus Max IQ — 8/10 Downside Case**

The best Bay Area flip structure we've seen at this price point — if you can verify the ARV.

### The Numbers

| Metric | Value |
|--------|-------|
| Purchase Price | $685,000 |
| Hard Money (90% LTC) | $616,500 |
| Total Cash Invested | $107,444 |
| Rehab Budget | $110,000 |
| Hold Period | 4 months |
| ARV (base case) | $1,196,126 |
| Net Profit | $308,356 |
| ROI on Cash | 287% |
| 70% MAO | $727,288 |
| Purchase vs. MAO | $42,288 below |

### Holding Period Sensitivity

| Hold Period | Net Profit | ROI |
|-------------|-----------|-----|
| 3 months | ~$315,500 | 294% |
| 4 months | $308,356 | 287% |
| 6 months | ~$294,000 | 274% |
| 12 months | ~$250,000 | 233% |

Even at 12 months — three times the planned hold — this deal produces $250,000+ in profit.

### The ARV Problem

The platform identified comps spanning $737,000–$1,384,000 — a $647,000 spread. A nearby 3,782 SF comparable sold near $1.8M supporting the upper end. But that range is too wide to act on blindly.

**Even at 85% of projected ARV, profit drops to ~$128,000 — still a profitable flip, still above the 15% minimum threshold. But a very different return profile.**

You need a licensed Bay Area appraisal or tight comp set from a local Oakland Hills agent before submitting any offer.

### Verdict: 8/10 — Strong Buy (ARV Verification Required)

Get inside the property. Pull a licensed appraisal. Confirm your hard money lender will fund 90% LTC on this specific asset. Get a GC through the building before budgeting $110K on a 1950 hillside structure.

If verified ARV comes in at $1.1M+ — move immediately.

---

## Deal Rankings

| Property | Strategy | Cash In | Key Return | Score | Verdict |
|----------|----------|---------|-----------|-------|---------|
| Charlotte Apartments KC | Buy & Hold | $385K | 8.8% CoC | 8/10 | ✅ Buy |
| Tropicana Valley LV | Buy & Hold | $1.96M | 2.0% CoC | 5.5/10 | ⚠️ Conditional |
| 595 Boyes Blvd Sonoma | Buy & Hold | $364K | 11.5% CoC | 7/10 | ⚠️ Conditional |
| 3635 64th Ave Oakland | Fix & Flip | $107K | 287% ROI | 8/10 | ✅ Buy |

---

*Model any of these deals yourself at dealsletter.io — BRRRR, multifamily, fix & flip, and STR analysis powered by live market data. 3 free analyses/month, no card needed.*
`,
  },
  {
    slug: 'issue-150-vegas-micro-unit-tampa-str',
    issueNumber: 150,
    date: 'April 2026',
    title: 'Vegas Micro-Unit Density + Naked City Tax Trap + Tampa STR Portfolio',
    previewText: 'Downtown Vegas 83-unit delivering $33M Year 30. Naked City 24-unit property tax error breaks the model. Tampa STR 8.8% CoC with Florida regulatory protection.',
    ctaStrategy: 'multifamily',
    sponsor: {
      name: 'LP Conf',
      logo: 'https://xsiflgnnowyvkhxjwmuu.supabase.co/storage/v1/object/public/email-assets/150-sponsor.jpg',
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
