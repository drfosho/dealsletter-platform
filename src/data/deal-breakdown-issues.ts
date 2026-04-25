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
    slug: 'issue-153-chicago-15unit-vegas-100unit-cape-coral-str-vista-adu',
    issueNumber: 153,
    date: 'April 2026',
    title: 'Chicago 20% CoC 15-Unit + Vegas 100-Unit Condo Play + Cape Coral STR + Vista ADU House Hack',
    previewText: 'Chicago 15-unit at 20.7% CoC and 1.91 DCR. Vegas 100-unit with individual parcel condo conversion exit. Cape Coral 5-unit STR play near Jaycee Park. Vista ADU house hack with approved permits.',
    ctaStrategy: 'buyhold',
    sponsor: undefined,
    properties: [
      {
        address: '3725 W Grand Ave',
        city: 'Chicago, IL 60651',
        price: 1600000,
        units: 15,
        capRate: 10.9,
        coc: 20.7,
        cashRequired: 400000,
        annualCashFlow: 82926,
        verdict: 'Conditional buy — appraisal, PCA, and lease abstracts required before closing',
        score: '7/10',
        scoreValue: 7,
        tag: 'MIDWEST CASH FLOW',
        tagColor: '#1D9E75',
        strategy: 'buyhold',
        listingUrl: 'https://www.loopnet.com/Listing/3725-W-Grand-Ave-Chicago-IL/40285920/',
        opportunity: 'A tenant-heated 15-unit generating $6,911/month net cash flow at a 10.9% cap rate on $400K invested — the kind of cash-on-cash return that simply does not exist in coastal markets at this price point. The 1.91 DCR provides genuine operational cushion across multiple simultaneous vacancies, and 100-amp electrical upgrades and renovated interiors reduce the most common near-term capex triggers on a Humboldt Park multifamily.',
        risk: 'Comparable sales in the area ran $54,900–$99,999 against a $1,600,000 purchase price — a gap that requires a mandatory third-party MAI appraisal before any offer proceeds. The 1929 construction carries deferred maintenance exposure beyond the 5% CapEx reserve, and all 15 units showing identical $1,434 rents suggests estimated rather than verified lease data.',
        fullVerdict: 'Conditional buy with a clear verification checklist: MAI appraisal, property condition assessment, and individual lease abstracts. If the income is real and the building condition matches the listing — buy at asking price. The cash flow and DCR justify the price if verified.',
      },
      {
        address: '3909-3949 N Nellis Blvd',
        city: 'Las Vegas, NV 89115',
        price: 17000000,
        units: 100,
        capRate: 6.55,
        coc: 3.06,
        cashRequired: 4760000,
        annualCashFlow: 145746,
        verdict: 'Conditional buy — right operator, right capital, right time horizon. Condo conversion is the real exit.',
        score: '6.5/10',
        scoreValue: 6.5,
        tag: 'CONDO CONVERSION PLAY',
        tagColor: '#7F77DD',
        strategy: 'buyhold',
        listingUrl: 'https://www.loopnet.com/Listing/3909-3949-N-Nellis-Blvd-Las-Vegas-NV/40285640/',
        opportunity: 'Individual parcel numbers on all 100 units create a condo conversion path to $20M–$25M gross exit on a $17M basis — a structural advantage this asset carries that no standard apartment building can replicate. The 84-unit 2BR/2BA mix with oversized 1,005 SF units, in-unit W/D on every door, gated access, and $118,400/yr in ancillary income positions this asset well above standard Sunrise Manor inventory.',
        risk: '22 of 100 units are currently vacant — you are buying a lease-up project, not a stabilized asset. The bridge from 78% to 95%+ occupancy requires 6–12 months of active leasing and $150,000–$200,000 in reserves beyond the $4.76M cash-in. At full stabilization the 1.15 DCR still leaves narrow debt service cushion.',
        fullVerdict: 'Conditional buy for a well-capitalized Las Vegas operator with local leasing capacity, verified stabilization path, and a 7–10 year hold conviction anchored by the condo conversion exit. Verify T-12 expenses, confirm 17-unit lease-up with a local PM, and bring reserves beyond the investment capital.',
      },
      {
        address: '4015 SE 19th Ave',
        city: 'Cape Coral, FL 33904',
        price: 950000,
        units: 5,
        capRate: 6.82,
        coc: 4.0,
        cashRequired: 266000,
        annualCashFlow: 10762,
        verdict: 'Conditional buy — get FL insurance quotes first, rebuild the expense model, confirm STR activation path',
        score: '6.5/10',
        scoreValue: 6.5,
        tag: 'STR PLAY — FL ALLOWABLE',
        tagColor: '#1D9E75',
        strategy: 'str',
        listingUrl: 'https://www.loopnet.com/Listing/4015-SE-19th-Ave-Cape-Coral-FL/40284114/',
        opportunity: 'SE Cape Coral STR-allowable zoning and proximity to the renovated Jaycee Park waterfront position this 5-unit for short-term rental returns that LTR cannot match — 4 two-bedroom units converted to STR at 55% occupancy push gross revenue from $107,400 to $160,560 annually, producing 11.6% CoC and a 1.57 DCR. Updated roof and mechanicals reduce near-term capex risk.',
        risk: 'The OM shows $12,955 in total annual expenses — a 12.1% expense ratio that does not survive contact with Florida\'s post-Ian insurance market. Rebuild the full expense stack before submitting any offer. Realistic LTR expenses run $37,000+/yr, compressing CoC to 4% and leaving a 1.2 DCR that requires 3–6 months of reserves.',
        fullVerdict: 'Conditional buy for an active SW Florida operator who can execute the STR play and has verified the full expense stack with real insurance quotes. The upside is real — the OM-presented numbers are not. Know which deal you\'re buying before you submit.',
      },
      {
        address: '615-617 Truly Ter',
        city: 'Vista, CA 92084',
        price: 1200000,
        units: 2,
        capRate: 4.1,
        coc: 0,
        cashRequired: 96000,
        annualCashFlow: 0,
        verdict: 'Conditional buy — ADU permits approved, get owner move-in clearance and GC bid before close',
        score: '7.5/10',
        scoreValue: 7.5,
        tag: 'ADU DEVELOPMENT PLAY',
        tagColor: '#7F77DD',
        strategy: 'buyhold',
        listingUrl: 'https://www.loopnet.com/Listing/615-617-Truly-Terrace-Vista-CA/40268410/',
        opportunity: 'City of Vista-approved permits for the 615A ADU conversion eliminate the most unpredictable element of California development — the permitting process. At 5% down the owner enters a $1.2M North County San Diego asset for $60,000, rents Unit 615 at $2,860 immediately, and executes the 820 SF ADU build to bring effective housing cost to $3,009/mo. Zoning supports a 4th unit outright and a 5th via Bonus Density Rules — documented $1.2M → $2.1M+ asset value path.',
        risk: 'Unit 617 is currently tenant-occupied — owner move-in requires California AB 1482-compliant just-cause procedures and potential relocation assistance. Phase 1 carrying cost of $5,484/mo runs $2,800 above Vista market rent until the ADU is built. Validate the $100K ADU build estimate with a GC bid — SD County costs may push total build to $125–170K.',
        fullVerdict: 'Conditional buy for a North County SD owner-operator who can execute the owner move-in legally, validate ADU construction costs with a GC bid, and budget Phase 1 carrying costs. The approved permits and multi-phase ADU expansion path make this one of the cleaner development-backed house hacks in the San Diego market.',
      },
    ],
    content: `
## This Week's Deals

Four properties across four markets — a Chicago 15-unit with exceptional cash flow numbers, a Las Vegas 100-unit with a condo conversion exit, a Cape Coral STR play near Jaycee Park, and a Vista ADU house hack with City-approved permits already in hand.

---

## 🏢 3725 W Grand Ave — Chicago 15-Unit Midwest Cash Flow

**Humboldt Park, Chicago, IL 60651 · 15 Units · $1,600,000 ($106,667/unit)**
**Claude Sonnet Auto — 7/10**

One of the strongest cash-flowing multifamily deals we've seen at this price point in any major market. The income math is exceptional. The comp mismatch is the verification gate.

### The Numbers

| Metric | Value |
|--------|-------|
| Down Payment (25%) | $400,000 |
| Total Cash In | $400,000 |
| Gross Rent | $21,510/mo (15 × $1,434) |
| Annual Cash Flow | $82,926 ($6,911/mo) |
| Cap Rate | 10.9% |
| CoC Year 1 | 20.7% |
| DCR | 1.91 |
| NOI | $173,946/yr |
| Price Per Unit | $106,667 |

### Why the Income Math Works

**10.9% cap against 6.5% debt = positive leverage.** Every financed dollar is working productively for the investor. The 1.91 DCR means the deal can absorb multiple simultaneous vacancies and still cover debt service. $6,911/month in take-home net cash flow on a $400,000 investment — 20.7% cash-on-cash — clears the 8% benchmark by more than double.

**Tenant-heated building.** Tenants pay heat. This eliminates one of the most volatile operating expense lines in Midwest multifamily — a genuine structural advantage on a 15-unit.

**100-amp electrical per unit already upgraded.** One of the most expensive and common capital items on pre-WWII Chicago buildings is done.

### The Comp Mismatch — The Only Gate

The platform flagged this HIGH severity. Nearby comparable sales: $54,900–$99,999. Purchase price: $1,600,000.

| Explanation | Implication |
|-------------|-------------|
| Comps are SFR/1–2 unit, not 15-unit MF | Income approach at 10.9% cap is correct methodology |
| Comps are genuinely comparable 15-unit MF | $1.6M is dramatically overpriced |

The income-based valuation is almost certainly correct — a stabilized 15-unit generating $173,946 NOI is not valued like a single-family home. But a mandatory third-party MAI appraisal with income approach methodology is non-negotiable before closing $1.6M on a 1929 Humboldt Park building.

### The 30-Year Picture

| Year | Annual CF | CoC | Property Value |
|------|-----------|-----|----------------|
| 5 | $93,400 | 23.4% | $1,799,600 |
| 10 | $108,300 | 27.1% | $2,088,000 |
| 20 | $145,700 | 36.4% | $2,813,000 |
| 30 | $196,000 | 49.0% | $3,788,000 |

Total wealth impact approaching $7M by Year 30.

### Risk

All 15 units showing identical $1,434/month is a red flag — request individual lease abstracts before any offer. 1929 construction requires a full property condition assessment and $50–100K in reserves beyond the down payment. Chicago's RLTO adds tenant protection complexity on any vacancy or dispute.

### Verdict: 7/10 — Conditional Buy

Get the MAI appraisal. Get the PCA. Get the lease abstracts. All three clear: move fast — Humboldt Park deals at 10.9% cap on verified income don't sit.

---

## 🏢 Terravita Apartments — Vegas 100-Unit Condo Conversion Play

**3909-3949 N Nellis Blvd, Las Vegas, NV 89115 · 100 Units · $17,000,000**

The structural differentiator: every one of the 100 units carries its own individual parcel number. This is the condo conversion optionality that makes this deal genuinely multi-layered.

### Current Reality vs. Pro Forma

| Scenario | Vacancy | Monthly CF | DCR |
|----------|---------|-----------|-----|
| Current (22 vacant) | 22% | -$17,540 | 0.78 |
| Halfway stabilized | 11% | -$2,700 | 0.97 |
| Pro Forma (5 vacant) | 5% | $12,146 | 1.15 |

**You are buying a lease-up project, not a stabilized asset.** 22 units vacant means the bridge from current to pro forma requires leasing 17 units and $150–200K in reserves to cover the monthly deficit during stabilization.

### The Numbers (Stabilized Pro Forma)

| Metric | Value |
|--------|-------|
| Down Payment (25%) | $4,250,000 |
| Total Cash In | $4,760,000 |
| NOI (stabilized) | $1,112,862/yr |
| Annual Cash Flow | $145,746 ($12,146/mo) |
| Cap Rate | 6.55% |
| CoC | 3.06% |
| DCR | 1.15 |
| Price Per Unit | $170,000 |

### Unit Mix

| Type | Units | SF | Pro Forma Rent |
|------|-------|----|----------------|
| 1BR/1BA | 16 | 555–770 SF | $1,175/mo |
| 2BR/2BA | 84 | 906–1,005 SF | $1,350/mo |

73 of the 84 two-bedroom units are oversized at 1,005 SF. In-unit W/D on all 100 units — $9,500/mo in W/D rental income alone.

### The Condo Conversion Exit

| Exit Strategy | Projected Value |
|--------------|----------------|
| Hold as rental (10+ yr) | ~$18.5M at 6% exit cap |
| Partial condo sale | $20M–$25M gross |
| Full condo conversion | $22M–$28M gross |

A buyer who stabilizes first then converts to condos has a legitimate path to $20M–$25M+ exit on a $17M basis. That's the upside that makes this deal interesting beyond its near-term cash flow math.

### Verdict: 6.5/10 — Conditional Buy

Right operator, right capital, right time horizon — this is a buy. Requires: local LV PM confirming 17-unit lease-up is executable in 6–12 months, full T-12 itemized expenses, $150–200K in reserves beyond the $4.76M cash-in, and 7–10 year hold conviction.

---

## 🌴 Cape Cottages SE — Cape Coral 5-Unit STR Play

**4015 SE 19th Ave, Cape Coral, FL 33904 · 5 Units · $950,000**

STR-allowable zoning in SE Cape Coral near the newly renovated Jaycee Park waterfront. The OM expense structure is the problem — not the asset.

### The Expense Problem

| Expense Line | OM Pro Forma | Realistic Build |
|-------------|-------------|----------------|
| Property Tax | $6,400 | $6,400 |
| Property Insurance (post-Ian) | Included in $6,555 | $10,000–$15,000 |
| Property Management (8%) | Included | $8,592 |
| Maintenance + CapEx (10%) | Included | $10,740 |
| Landscaping/misc | Included | $1,500 |
| **Total** | **$12,955** | **$37,232+** |

Post-Ian SW Florida insurance on a 5-unit in Cape Coral runs $10,000–$15,000/yr alone. The OM's $6,555 for ALL operating expenses beyond taxes is not a realistic number.

### Three Scenarios

| Metric | OM Pro Forma | Realistic LTR | STR Play |
|--------|-------------|--------------|---------|
| Cap Rate | 9.94% | 6.82% | 8.93% |
| CoC | 15.2% | 4.0% | 11.6% |
| DCR | 1.748 | 1.199 | 1.569 |
| Annual CF | $40,409 | $10,762 | $30,816 |

### The STR Thesis

SE Cape Coral allows short-term rentals — not universal in FL municipalities.

| 4 units STR at 55% occupancy | Value |
|------------------------------|-------|
| ADR | $155/night |
| Nights/month | ~16.5 |
| Revenue per unit | $2,558/mo |
| Total STR gross | $10,232/mo |
| vs. LTR at market | $7,000/mo |
| **Additional gross revenue** | **+$3,232/mo** |

Florida state preemption protects STR rights from outright municipal bans. Jaycee Park proximity is a legitimate booking draw — waterfront park, boat launch, year-round events.

### Verdict: 6.5/10 — Conditional Buy

Get binding FL insurance quotes first. Everything flows from that number. If realistic LTR (4% CoC, 1.2 DCR) is acceptable as a foundation with STR upside on top — this is a buy. If you need the OM-projected 15% CoC — this is not the deal.

---

## 🏠 615-617 Truly Terrace — Vista ADU House Hack

**Vista, CA 92084 · 2 Current / 3 Post-ADU / 4–5 Potential · $1,200,000**
**5% Down Owner-Occupied · $60,000 Initial Cash In**

ADU permits already approved by the City of Vista. The hardest part of California development is done for the buyer.

### The Three-Phase Model

| Phase | Status | Effective Housing Cost |
|-------|--------|----------------------|
| Phase 1 — 615 rented, owner in 617 | Day 1 | $5,484/mo |
| Phase 2 — 615 + 615A rented | 6–12 months | $3,009/mo |
| Phase 3 — All 3 units rented | Full investment | -$887/mo (negative) |

**Phase 2 is the target state.** $3,009/month — roughly $300–600 above Vista market rent — while two tenants cover 79% of the mortgage and the owner holds a $1.3M+ San Diego County asset.

### The ADU Math

| Item | Value |
|------|-------|
| Permit status | ✅ Approved by City of Vista |
| OM build estimate | $100,000 |
| Realistic SD County cost | $123,000–$168,000 |
| Projected ADU rent | $2,775/mo |
| Asset value created (6% cap) | ~$555,000 |
| Net forced appreciation | ~$400,000 |

Even at $168K build cost: $555K in asset value for $168K deployed = 3.3x forced appreciation multiple.

### Full Value-Add Stack

| Lever | Impact |
|-------|--------|
| ADU 615A build | +$2,775/mo / +$555K asset value |
| 4th ADU (zoning approved) | +$2,750–$3,250/mo / +$500K+ |
| 5th ADU (Bonus Density) | Additional unit — longer timeline |
| Full build-out path | $1.2M → $2.1M+ asset value |

### Long-Term Projections

| Year | Effective Housing Cost | Property Value | Total Equity |
|------|----------------------|----------------|-------------|
| 1 (post-ADU) | $3,009/mo | $1,400,000+ | $200,000+ |
| 5 | $2,440/mo | $1,825,000 | $680,000 |
| 10 | $1,890/mo | $2,220,000 | $1,220,000 |

### Verdict: 7.5/10 — Conditional Buy

Three gates before close: (1) real estate attorney clears owner move-in on 617, (2) GC bid validates the $100K ADU build estimate, (3) Phase 1 carrying cost of $5,484/mo explicitly budgeted for 6–12 months. All three check out — strong buy for the right North County SD owner-operator.

---

## Deal Rankings

| Property | Strategy | Cash In | Key Return | Score | Verdict |
|----------|----------|---------|-----------|-------|---------|
| Chicago 15-Unit | Buy & Hold | $400K | 20.7% CoC | 7/10 | ⚠️ Conditional |
| Vista ADU House Hack | House Hack | $96K | $3,009/mo eff. cost | 7.5/10 | ⚠️ Conditional |
| Terravita LV 100-Unit | Buy & Hold | $4.76M | Condo exit | 6.5/10 | ⚠️ Conditional |
| Cape Coral STR | STR | $266K | 11.6% CoC (STR) | 6.5/10 | ⚠️ Conditional |

---

*Model any of these deals yourself at dealsletter.io — multifamily, house hack, STR, BRRRR, and fix & flip analysis with live market data. 3 free analyses/month, no card needed.*
  `,
  },
  {
    slug: 'issue-152-berkeley-student-housing-sf-house-hack-san-diego-duplex-spring-valley-48',
    issueNumber: 152,
    date: 'April 2026',
    title: 'Berkeley Student Housing + SF House Hack + San Diego Duplex + Spring Valley 48-Unit',
    previewText: 'Berkeley 18-bed student housing at $400/bed below market. SF SOMA house hack for $135K down. San Diego City Heights duplex with ADU play. Spring Valley 48-unit — great asset, 1.06 DCR.',
    ctaStrategy: 'buyhold',
    sponsor: undefined,
    properties: [
      {
        address: '2633 Regent St',
        city: 'Berkeley, CA 94704',
        price: 2500000,
        units: 3,
        capRate: 5.67,
        coc: 0,
        cashRequired: 700000,
        annualCashFlow: 58836,
        verdict: 'Conditional buy — elite student market, breakeven at Day 1 until rents repositioned to market',
        score: '6/10',
        scoreValue: 6,
        tag: 'STUDENT HOUSING',
        tagColor: '#7F77DD',
        strategy: 'buyhold',
        listingUrl: 'https://www.loopnet.com/Listing/2633-Regent-St-Berkeley-CA/40217185/',
        opportunity: 'A 10-year operating student housing business in Elmwood Berkeley — 18 beds grossing $250,000/yr with an established brand and direct walking distance to UC Berkeley. Current $1,157/bed average sits $250–$400 below the 94704 market rate, and annual student lease cycles give a new owner a full rent reset every August — the clean market-rate path that California rent control eliminates on traditional LTR properties.',
        risk: 'Day 1 math is breakeven — 5.67% cap against 6.5% debt produces near-zero cash flow until repositioning is executed over 1–2 lease cycles. Managing 18 individual student leases demands active experienced oversight, and Berkeley\'s local rent ordinance must be verified against the by-the-room structure before close to preserve the annual turnover advantage.',
        fullVerdict: 'Exceptional student housing asset in the wrong hands — transformational in the right ones. Conditional buy for an experienced operator who can verify rent control compliance, push rents to market through natural August cycles, and hold 10+ years in one of the most supply-constrained university markets in the country.',
      },
      {
        address: '519 Natoma St',
        city: 'San Francisco, CA 94103',
        price: 1698000,
        units: 4,
        capRate: 4.4,
        coc: 0,
        cashRequired: 135840,
        annualCashFlow: -41244,
        verdict: 'Buy with legal clearance — $135K into a $1.7M SOMA 4-unit, effective housing cost at market rent',
        score: '7.5/10',
        scoreValue: 7.5,
        tag: 'SF HOUSE HACK',
        tagColor: '#7F77DD',
        strategy: 'buyhold',
        listingUrl: 'https://www.loopnet.com/Listing/519-Natoma-St-San-Francisco-CA/40199061/',
        opportunity: 'Owner-occupied financing at 5% down unlocks a $1.698M SOMA 4-unit for $135,840 total cash — the same building requires $424,500 from an investor. Three remodeled 1BR units generate $8,136/month, reducing effective housing cost to $3,437/mo in a market where comparable 1BR rentals run $3,200–$4,000+. You\'re paying market rate to live in SOMA and receiving a $1.7M San Francisco asset, three income streams, and long-term equity compounding in return.',
        risk: 'SF Rent Control likely applies — the owner move-in eviction process on Unit D requires legal compliance, relocation assistance, and a 36-month primary residency commitment before the unit can ever be re-rented at market rate. Any two-unit vacancy period materially increases monthly out-of-pocket exposure, and true effective housing cost with maintenance reserves runs closer to $3,800–4,000/mo.',
        fullVerdict: 'One of the most efficient entries into San Francisco real estate at this price point — conditional on legal clearance of the owner move-in process. Get a local SF attorney to confirm the path on Unit D before submitting. If cleared, straightforward buy for any SF-based professional who would otherwise be paying market rent with nothing to show for it.',
      },
      {
        address: '3613-15 Central Ave',
        city: 'San Diego, CA 92105',
        price: 825000,
        units: 2,
        capRate: 3.11,
        coc: 0,
        cashRequired: 66000,
        annualCashFlow: -45654,
        verdict: 'Conditional buy — ADU permit is the move that makes this deal, not the Day 1 cash flow',
        score: '6/10',
        scoreValue: 6,
        tag: 'SD HOUSE HACK',
        tagColor: '#EF9F27',
        strategy: 'buyhold',
        listingUrl: 'https://www.loopnet.com/Listing/3613-Central-Ave-San-Diego-CA/40216597/',
        opportunity: 'Owner-occupied financing at 5% down turns a $206K investor entry into a $66K door — the mechanical advantage that makes San Diego real estate accessible at this price point. Unit B at $2,300/mo offsets a meaningful portion of the $4,952 mortgage, and the double-car garage plus existing unpermitted 1BR represent an immediately actionable ADU play that, once permitted and rented at $1,600/mo, drops effective housing cost to approximately $2,200/month — below City Heights market rent.',
        risk: 'Without the ADU, effective housing cost of $3,805/mo runs $1,700+ above what renting a comparable 2BR in City Heights costs. The unpermitted unit is a liability until permitted — do not rent it in its current status. SD permitting timelines run 6–18 months, and a single vacancy in Unit B puts the full $4,952 mortgage on the owner with zero offset.',
        fullVerdict: 'Conditional buy for a long-term San Diego holder with the financial stability to carry $3,805/mo effective housing cost and the initiative to activate the ADU immediately post-close. The wealth accumulation math works over a 5–10 year hold — but only if the owner executes the ADU play and treats this as an equity-building position, not a cash flow investment.',
      },
      {
        address: '9249 Birch St',
        city: 'Spring Valley, CA 91977',
        price: 16390000,
        units: 48,
        capRate: 6.03,
        coc: 1.21,
        cashRequired: 4589200,
        annualCashFlow: 55680,
        verdict: 'Conditional — quality 2025-renovated asset, 1.06 DCR leaves almost no operational cushion',
        score: '5/10',
        scoreValue: 5,
        tag: 'LONG-TERM PLAY',
        tagColor: '#EF9F27',
        strategy: 'buyhold',
        listingUrl: 'https://www.loopnet.com/Listing/9249-Birch-St-Spring-Valley-CA/40215393/',
        opportunity: 'A 2025-renovated 48-unit with new roof, in-unit laundry, A/C, and contemporary finishes in an established Spring Valley workforce corridor. The 65% two-bedroom unit mix drives tenant retention, and a garage/storage ADU conversion creates a 49th income unit at a 15%+ return on conversion capital — $520,000 in asset value for ~$200K deployed. The 10-year equity trajectory reaches $13M+ on a San Diego County hold in a supply-constrained East County submarket.',
        risk: 'A 1.06 DCR means four vacancies away from not covering debt service. California Prop 13 means the current owner\'s property tax basis may significantly understate what a new buyer pays post-purchase at $16.39M. If taxes reset and true expenses run 35%+ of EGI, this deal goes cash flow negative. The 27.1% expense ratio needs T-12 verification — industry standard for a 48-unit in California runs 35–45% of EGI.',
        fullVerdict: 'Conditional buy for a large patient capital operator who can verify the expense basis, confirm property tax assumptions, carry reserves beyond the $4.59M cash in, and hold 10+ years while rent growth closes the gap between cap rate and debt cost. The asset quality justifies the thesis — the margin does not justify shortcuts on due diligence.',
      },
    ],
    content: `
## This Week's Deals

Four California deals — a Berkeley student housing operation, a SOMA San Francisco house hack, a San Diego City Heights duplex with ADU potential, and a fully renovated 48-unit in Spring Valley. Different strategies, same thread: California real estate rewards patience and punishes shortcuts on due diligence.

---

## 🎓 2633 Regent St — Berkeley By-the-Room Student Housing

**Elmwood, Berkeley, CA 94704 · 3 Structures / 18 Beds · $2,500,000**

This isn't a traditional multifamily — it's a student housing business. Ten years of operating history, an established brand, and structural demand permanence from UC Berkeley's 45,000-student enrollment in a neighborhood that cannot be replicated.

### The Three-Scenario Model

| Metric | Current (18 Beds) | Proforma (21 Beds) | Market Rate ($1,500/bed) |
|--------|-------------------|-------------------|--------------------------|
| Cap Rate | 5.67% | 8.04% | 9.05% |
| CoC | ~0% | 8.4% | 12.0% |
| DCR | 1.00 | 1.41 | 1.59 |
| Annual CF | -$614 | $58,836 | $84,036 |

### The Numbers

| Metric | Value |
|--------|-------|
| Down Payment (25%) | $625,000 |
| Total Cash In | $700,000 |
| Current Gross Income | $250,000/yr (verified) |
| Current Avg Rent | $1,157/bed/mo |
| Market Rate | $1,400–$1,600/bed |
| Upside per Bed | $243–$443/mo |

### Why the Annual Lease Structure Matters

Unlike AB 1482-protected long-term tenants who can never realistically be reset to market, student leases turn naturally every August. Every vacancy is a market-rate opportunity. The rent control trap that plagues most California multifamily simply does not apply here — the operating structure is the competitive advantage.

**Current $1,157/bed in Elmwood Berkeley is $250–$400 below comparable student rooms in the 94704 zip.** The upside is sitting in the existing lease structure, not in a speculative thesis.

### Risk

Day 1 math is breakeven — 5.67% cap against 6.5% debt produces near-zero cash flow until repositioning executes. Berkeley's local rent control ordinance is more aggressive than state AB 1482 and needs to be verified against the by-the-room lease structure before close. Managing 18 individual student leases requires active, experienced oversight.

### Verdict: 6/10 — Conditional Buy

Exceptional asset in the wrong hands — transformational in the right ones. Experienced student housing operators only.

---

## 🏙️ 519 Natoma St — SOMA San Francisco House Hack

**San Francisco, CA 94103 · 4 Units (3 Rental + Owner-Occupied) · $1,698,000**
**Cash In: $135,840 (5% owner-occupied financing)**

The negative numbers in the model are not the story. The story is: $135,840 into a $1.698M SOMA 4-unit.

### The House Hack Math

| Metric | Value |
|--------|-------|
| Full Mortgage Payment | $9,671/mo |
| Rental Income (3 units) | -$8,136/mo |
| **Effective Housing Cost** | **$3,437/mo** |
| Comparable 1BR rent in SOMA | $3,200–$4,000/mo |
| Down Payment Required (investor) | $424,500 |
| Down Payment Required (owner-occ) | $84,900 |

### Unit Mix

| Unit | Type | Monthly Rent | Status |
|------|------|-------------|--------|
| A | 1BR/1BA | $2,900 | Tenant — retain |
| B | 1BR/1BA | $2,636 | Tenant — retain |
| C | 1BR/1BA | $2,600 | Tenant — retain |
| D | 1BR/1BA | Lowest | Owner moves in |

You are paying $3,437/month to live in SOMA — at or below what the rental market charges for a single 1BR in the same neighborhood. Except you own a $1.7M San Francisco asset and your three tenants pay down your mortgage every month.

### The 10-Year Picture

| Year | Effective Housing Cost | Property Value | Total Equity |
|------|----------------------|----------------|-------------|
| 1 | $41,244/yr | $1,698,000 | $84,900 |
| 5 | $29,800/yr | $1,984,573 | $410,000 |
| 10 | $13,400/yr | $2,414,000 | $980,000 |

By Year 10 rent growth has nearly eliminated your monthly housing cost — you're essentially living in SOMA for free while sitting on nearly $1M in equity.

### The Critical Legal Gate

**SF Rent Control likely covers this building.** The owner move-in eviction process on Unit D requires: intent to occupy as primary residence for 36+ months, relocation assistance to the displaced tenant, and strict notification compliance. Get a San Francisco real estate attorney to clear this process before submitting any offer.

One call to a local attorney is the only gate between you and a very strong long-term buy.

### Verdict: 7.5/10 — Buy (Legal Clearance Required)

Cleared legally — buy immediately.

---

## 🌴 3613-15 Central Ave — San Diego City Heights House Hack

**San Diego, CA 92105 · 2 Legal Units + Unpermitted ADU · $825,000**
**Cash In: $66,000 (5% owner-occupied financing)**

The honest version of this deal: effective housing cost runs $1,700–$1,900 above market rent for a 2BR in City Heights. That's the price of ownership — and in San Diego, the wealth accumulation math covers it.

### The Real Comparison

| Option | Monthly Cost | What You Get |
|--------|-------------|-------------|
| Rent a 2BR in City Heights | $1,900–$2,100 | No equity, no ownership |
| This house hack | $3,805 effective | $825K asset, appreciation, paydown |
| Traditional investor purchase | $4,952 + $231K down | Full rental income |

### The ADU Play — This Changes Everything

| Scenario | Action | Effective Housing Cost |
|----------|--------|----------------------|
| Current (Unit B only) | $2,300/mo offset | $3,805/mo |
| ADU permitted + rented | +$1,600/mo income | ~$2,200/mo |
| Full execution | Units B + ADU rented | Deal turns positive |

**Permitting the ADU is Priority 1 after close.** SD permitting runs 6–18 months — do not model ADU income in Year 1. But if legalized, the house hack goes from paying a premium to own to living in City Heights below market rent.

### The 5-Year Equity Case

| Year | Property Value | Total Equity |
|------|----------------|-------------|
| 1 | $825,000 | $41,250 |
| 5 | $1,004,000 | $345,000 |
| 10 | $1,221,000 | $770,000 |

$345,000 in equity on a $66,000 investment by Year 5. Do not rent the unpermitted unit without permits — the liability is not worth it.

### Verdict: 6/10 — Conditional Buy

Wealth-building tool, not housing cost arbitrage. Know which one you're buying.

---

## 🏢 Birch Terrace Apartments — Spring Valley 48-Unit

**9249 Birch St, Spring Valley, CA 91977 · 48 Units · $16,390,000**

A quality asset in a structurally difficult position at today's rates. The same story as the Vegas 48-unit from last week — great real estate, wrong rate environment for the price.

### The Numbers

| Metric | Value |
|--------|-------|
| Down Payment (25%) | $4,097,500 |
| Total Cash In | $4,589,200 |
| NOI | $988,236/yr |
| Annual Cash Flow | $55,680 ($4,640/mo) |
| Cap Rate | 6.03% |
| CoC Year 1 | 1.21% |
| DCR | 1.06 |
| Price Per Unit | $341,458 |

### The Critical Property Tax Flag

California Prop 13 means the current owner's taxes are based on their historical purchase price — not $16.39M.

| Scenario | Annual Taxes | Adjusted DCR | Adjusted CoC |
|----------|-------------|-------------|-------------|
| OM as-presented | Unknown basis | 1.06 | 1.21% |
| Tax reset at purchase | ~$180,290 | 0.95–0.97 | Negative |
| Tax reset + 2 vacancies | ~$180,290 | 0.94 | Negative |

**Demand the actual current tax bill before submitting any offer.** This single line item determines whether the deal cash flows or goes negative on Day 1.

### Unit Mix

| Type | Units | Est. Market Rent | Monthly Gross |
|------|-------|-----------------|---------------|
| 1BR/1BA | 16 | ~$2,200 | $35,200 |
| 2BR/1BA | 31 | ~$2,600 | $80,600 |
| 3BR/1.5BA | 1 | ~$3,100 | $3,100 |

### The ADU Opportunity

Garage and storage unit conversion to 2BR ADU (~800 SF):
- Conversion cost: $150,000–$250,000
- Additional income: $2,600/mo ($31,200/yr)
- Capitalized value at 6% cap: +$520,000
- Return on conversion capital: 15.6%

### Long-Term Equity

| Year | CoC | Property Value | Total Equity |
|------|-----|----------------|-------------|
| 5 | 4.3% | $19,161,000 | $7,254,000 |
| 10 | 8.4% | $23,308,000 | $13,050,000 |
| 20 | 16.4% | $34,500,000 | $28,200,000 |

The long-hold equity story is real. This is an asset that takes 3–5 years to grow into its purchase price at current rates.

### Verdict: 5/10 — Conditional

Only if: (1) T-12 obtained and verified, (2) property tax bill at current assessed value confirmed, (3) expense ratio stress-tested at 35% EGI still produces positive cash flow, and (4) buyer has $500K+ in reserves beyond the $4.59M cash in.

---

## Deal Rankings

| Property | Strategy | Cash In | Key Return | Score | Verdict |
|----------|----------|---------|-----------|-------|---------|
| 519 Natoma St SF | House Hack | $135K | $3,437/mo effective rent | 7.5/10 | ✅ Buy |
| 2633 Regent St Berkeley | Student Housing | $700K | 8.4% CoC repositioned | 6/10 | ⚠️ Conditional |
| 3613 Central Ave SD | House Hack | $66K | ADU play required | 6/10 | ⚠️ Conditional |
| Birch Terrace Spring Valley | Buy & Hold | $4.59M | 1.21% CoC | 5/10 | ⚠️ Conditional |

---

*Model any of these deals yourself at dealsletter.io — house hack, multifamily, fix & flip, BRRRR, and STR analysis powered by live market data. 3 free analyses/month, no card needed.*
  `,
  },
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
