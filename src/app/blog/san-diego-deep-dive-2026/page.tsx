'use client'

import Link from 'next/link'
import Image from 'next/image'
import BlogNavigation from '@/components/BlogNavigation'

export default function SanDiegoDeepDive2026Article() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <BlogNavigation />

      {/* Article Content */}
      <div className="pt-32 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/blog" className="text-accent hover:text-accent/80 transition-colors text-sm flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Blog</span>
            </Link>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                Market Analysis
              </span>
              <span className="text-sm text-muted">January 2026</span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">18 min read</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              San Diego County Real Estate Deep Dive: 2025 Actuals + 2026 Investor Playbook
            </h1>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="relative aspect-[5/3] bg-muted/10">
                <Image
                  src="/logos/SAN DIEGO BLOG HEADER.png"
                  alt="San Diego Real Estate Market Deep Dive 2026"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-muted leading-relaxed space-y-6">

              {/* Executive Summary */}
              <div className="bg-accent/5 border-l-4 border-accent p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  The Big Picture: Stabilization, Not Speculation
                </h2>
                <p className="text-primary mb-4">
                  Here&apos;s what actually happened in San Diego in 2025, and what it means for your investment strategy in 2026.
                </p>
                <p className="text-primary mb-4">
                  <strong>The headline:</strong> San Diego&apos;s housing market normalized in 2025. Not crashed. Not moonshot. <em>Normalized.</em> Median prices held near $900K countywide, inventory climbed to healthier (but still tight) levels, and days on market stretched from 26 to 33.5 days. The market punished overpricing with 36-44% of listings taking price cuts, but rewarded realistic sellers and patient buyers with stable fundamentals.
                </p>
              </div>

              {/* Key Stats */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  2025 By The Numbers
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">$900K</div>
                    <div className="text-sm text-muted">Countywide Median</div>
                    <div className="text-sm text-green-500 font-medium">+2.3% YoY</div>
                  </div>
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">2.9 mo</div>
                    <div className="text-sm text-muted">Inventory Supply</div>
                    <div className="text-sm text-muted">Still seller-friendly</div>
                  </div>
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">6.1%</div>
                    <div className="text-sm text-muted">Mortgage Rates</div>
                    <div className="text-sm text-green-500">Down from 2024 peaks</div>
                  </div>
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">4.6%</div>
                    <div className="text-sm text-muted">Unemployment</div>
                    <div className="text-sm text-muted">Stable job market</div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-primary mb-3">What this actually means for investors in 2026:</h3>
                  <p className="mb-0">
                    The strategies that worked in 2020-2021 (buy anything, leverage hard, flip fast) will bleed cash. This is a <strong>precision market</strong> now. Winning plays require value-add repositioning with locked financing, ADU additions in high-rent submarkets, small multifamily with operational upside, and patient buy-and-hold in supply-constrained zones.
                  </p>
                </div>
              </div>

              {/* Two Markets Theme */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  The Theme of 2025: Two Markets Living Side-by-Side
                </h2>
                <p className="mb-4">
                  San Diego&apos;s 2025 story is a tale of two markets running simultaneously:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <h4 className="font-bold text-green-600 mb-2">Market A (Premium/Coastal)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Luxury homes above $2M: +8.5% YoY appreciation</li>
                      <li>• 68% cash buyers, 45-day DOM</li>
                      <li>• Coastal SFRs (La Jolla, Del Mar, Encinitas): Still competitive, still getting overbid</li>
                    </ul>
                  </div>
                  <div className="bg-red-500/10 p-4 rounded-lg">
                    <h4 className="font-bold text-red-600 mb-2">Market B (Everything Else)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• 78% of individual San Diego homes worth less than year-ago values</li>
                      <li>• Highest percentage since 2012</li>
                      <li>• Condos down 1.5% YoY, some downtown buildings seeing 6+ months supply</li>
                      <li>• 36-44% of listings taking price cuts</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-4 font-medium text-primary">
                  <strong>The real tell:</strong> Median price per square foot dropped 6.3% YoY. That&apos;s not a mix shift—that&apos;s genuine value compression. If you&apos;re running BRRRR or flip strategies based on 2022-2023 comps, you&apos;re overestimating exit values by 5-10%.
                </p>
              </div>

              {/* What Changed Section */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  What Changed in 2025: The Data That Matters
                </h2>

                {/* Pricing */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    Pricing: Held, But Fractured
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Countywide:</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start">
                          <span className="text-accent mr-2">•</span>
                          <span>All home types: <strong>$895K-$905K</strong> (depending on month)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-accent mr-2">•</span>
                          <span>SFR detached: <strong>$1.05M</strong> (+3.0% YoY)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-accent mr-2">•</span>
                          <span>Condos/attached: <strong>$660K</strong> (-1.5% YoY)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Seasonality was wild:</h4>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>May 2025: <strong>$1.04M</strong> (+6.1% YoY) — spring urgency</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>August 2025: <strong>$960K</strong> (-1.5% YoY) — summer inventory peak</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-muted mr-2">•</span>
                          <span>November: <strong>$895K</strong> (+1.1% YoY) — stabilized</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Liquidity */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    Liquidity: Breathing Room, Not Flooding
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Months of supply: <strong>2.9</strong> (up from sub-2.0 in the frenzy years)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Days on market: <strong>33.5 days</strong> average (up from 26)</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Sale-to-list ratio: <strong>97-98.3%</strong> (homes selling 2-3% below asking)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Active listings: <strong>Up 39-70% YoY</strong> depending on segment</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    <strong>Translation:</strong> Buyers gained negotiating leverage in 2025. The days of waiving contingencies and overbidding are over in the sub-$1.5M segment. But this wasn&apos;t a buyer&apos;s market—it was a realistic-pricing market. Well-priced homes in desirable areas still went pending in 20-30 days.
                  </p>
                </div>

                {/* Rental Market */}
                <div className="bg-green-500/5 border-2 border-green-500/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    Rental Market: The Snapback
                  </h3>
                  <p className="mb-4">
                    After a painful <span className="text-red-500 font-medium">-7% rent decline in 2024</span>, San Diego rents came roaring back:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Countywide rent growth: <strong className="text-green-600">+4.1%</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>City of San Diego proper: <strong className="text-green-600">+9.3%</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Vacancy collapsed from 6.36% to <strong className="text-green-600">3.6%</strong></span>
                      </li>
                    </ul>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Average rents by unit type:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Studio/1BR: <strong>$2,341</strong></li>
                        <li>• 2BR: <strong>$2,795-$3,132</strong></li>
                        <li>• SFR: <strong>$3,550-$4,150</strong></li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    <strong>Why this matters:</strong> Landlords regained pricing power. Vacancy at 3.6% is well below the 6% national average and firmly in landlord-favorable territory. Rent growth of 4-9% is sustainable into 2026 if vacancy stays sub-4%.
                  </p>
                </div>
              </div>

              {/* Submarket Breakdown */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Submarket Breakdown: Where the Deals Actually Are
                </h2>

                {/* Coastal Central */}
                <h3 className="text-xl font-bold text-primary mb-4 mt-8">Coastal Central: Premium Pricing, Thin Yields</h3>

                {/* La Jolla */}
                <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg mb-4">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    La Jolla ($2.3M median)
                  </h4>
                  <p className="text-xl mb-3">The Jewel. UCSD, biotech, coastal elite</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Gross rental yields: <strong>2-3%</strong></span>
                      </li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Appreciation historically: 5-7% annualized</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm bg-muted/10 p-3 rounded">
                    <strong>Verdict:</strong> Only for ultra-high-net-worth parking capital. Appreciation historically strong (5-7% annualized) but 2025 showed flattening.
                  </p>
                </div>

                {/* Pacific Beach */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    Pacific Beach ($1.34M median)
                  </h4>
                  <p className="text-xl mb-3">Beach lifestyle, younger demo, nightlife</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Strong rental market: SFR $4K-$5.5K/mo, condos $2.5K-$3.5K</span>
                      </li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Gross yields: <strong>3.5-4.5%</strong></span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm bg-muted/10 p-3 rounded">
                    <strong>Verdict:</strong> Strong rental fundamentals but high entry cost. STR caps limit new permits. Long-term rental is the play.
                  </p>
                </div>

                {/* Oceanside */}
                <div className="bg-blue-500/5 border-2 border-blue-500/20 p-6 rounded-lg mb-4">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    Oceanside ($845K-$963K median)
                  </h4>
                  <p className="text-xl mb-3">Most affordable coastal option, Camp Pendleton proximity</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Rents: <strong>$2,500-$3,500</strong> for SFR</span>
                      </li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Cap rates: <strong>4-5%</strong></span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm bg-blue-500/10 p-3 rounded">
                    <strong>Verdict:</strong> Best risk-adjusted coastal play. Military tenant base is gold—stable, high credit, housing allowance. Watch for gentrification upside in downtown corridor.
                  </p>
                </div>

                {/* Central/Mid-City */}
                <h3 className="text-xl font-bold text-primary mb-4 mt-8">Central/Mid-City: Urban Density, Rental Depth</h3>

                {/* North Park */}
                <div className="bg-green-500/5 border-2 border-green-500/20 p-6 rounded-lg mb-4">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    North Park (Rent focus: $2,650 for 2BR)
                  </h4>
                  <p className="text-xl mb-3">Walkability, brewery row, restaurants, young professionals</p>
                  <p className="text-sm bg-green-500/10 p-3 rounded">
                    <strong>Verdict:</strong> Top rental market in San Diego. High tenant demand, low vacancy. SFR gross yields 4-4.5%. Condos with low HOA fees can actually cash flow.
                  </p>
                </div>

                {/* Hillcrest */}
                <div className="bg-green-500/5 border-2 border-green-500/20 p-6 rounded-lg mb-4">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    Hillcrest ($2,395-$2,550 avg rent)
                  </h4>
                  <p className="text-xl mb-3">LGBTQ+ hub, hospitals nearby (UCSD, Scripps), healthcare workers</p>
                  <p className="text-sm bg-green-500/10 p-3 rounded">
                    <strong>Verdict:</strong> Condo market offers best value. 1BR condos $350K-$450K rent for $2.2K-$2.5K = <strong className="text-green-600">6-7% gross yield</strong>. This is where small investors can actually make money.
                  </p>
                </div>

                {/* Clairemont */}
                <div className="bg-blue-500/5 border-2 border-blue-500/20 p-6 rounded-lg mb-4">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    Clairemont (Under $700K entry)
                  </h4>
                  <p className="text-xl mb-3">Last remaining &quot;affordable&quot; central SD market</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Older tract homes (1960s-70s) need $40K-$80K updates</span>
                      </li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Post-rehab rents: <strong>$2,500-$3,200</strong></span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm bg-blue-500/10 p-3 rounded">
                    <strong>Verdict:</strong> Cap rates 5-6%. Best for small investors or first-time rental property buyers. Some plane noise, but the numbers work.
                  </p>
                </div>

                {/* South Bay */}
                <h3 className="text-xl font-bold text-primary mb-4 mt-8">South Bay: Affordability, Volume, Cash Flow</h3>

                {/* Chula Vista */}
                <div className="bg-green-500/5 border-2 border-green-500/20 p-6 rounded-lg mb-4">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    Chula Vista ($785K-$825K median)
                  </h4>
                  <p className="text-xl mb-3">Last affordable single-family option near SD core</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Rents: <strong>$2,500-$3,200</strong> for SFR</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Cap rates: <strong>5-6%</strong></span>
                      </li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Median DOM: 36 days</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Strong sales: 125/month</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm bg-green-500/10 p-3 rounded">
                    <strong>Verdict:</strong> Best volume market for buy-and-hold. Migration from Mexico + priced-out San Diegans = steady demand.
                  </p>
                </div>

                {/* National City */}
                <div className="bg-green-500/5 border-2 border-green-500/20 p-6 rounded-lg mb-4">
                  <h4 className="text-lg font-bold text-primary mb-2">
                    National City ($675K-$699K median)
                  </h4>
                  <p className="text-xl mb-3">Most affordable, port jobs, shipyards</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Rents: <strong>$2,200-$2,800</strong> for SFR</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Cap rates: <strong className="text-green-600">6-7%</strong></span>
                      </li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>DOM: 26 days</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm bg-green-500/10 p-3 rounded">
                    <strong>Verdict:</strong> Highest cash-on-cash returns in SD County. Stigma as &quot;rougher&quot; keeps prices low, but gentrification momentum from Downtown SD spillover is real.
                  </p>
                </div>

                {/* Imperial Beach - Warning */}
                <div className="bg-red-500/5 border-2 border-red-500/20 p-6 rounded-lg mb-4">
                  <h4 className="text-lg font-bold text-red-600 mb-2">
                    Imperial Beach
                  </h4>
                  <p className="text-red-600 font-bold mb-3">AVOID</p>
                  <p className="text-sm">
                    Tijuana sewage contamination closed beaches for extended periods in 2025. Property values crashed <strong className="text-red-600">-$41.5K YoY</strong>. Until border wastewater issues resolve, this market is un-investable.
                  </p>
                </div>
              </div>

              {/* Investor Strategy Section */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Investor Strategy Reality Check
                </h2>

                {/* Buy and Hold */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-primary mb-4">
                    Buy-and-Hold SFR: The Math That Actually Pencils
                  </h3>
                  <p className="mb-4">Let&apos;s be honest about what buy-and-hold looks like in San Diego in 2026.</p>

                  <div className="bg-card border border-border/40 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-primary mb-3">Typical scenario (Escondido, Chula Vista, National City):</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="mb-1">• Purchase: <strong>$800K</strong></p>
                        <p className="mb-1">• Down payment: 20% (<strong>$160K</strong>)</p>
                        <p className="mb-1">• Loan: $640K at 6.0% = <strong>$3,839/mo</strong></p>
                        <p className="mb-1">• Property tax: $792/mo (1.18% rate)</p>
                        <p className="mb-1">• Insurance: $125/mo</p>
                      </div>
                      <div>
                        <p className="mb-1">• Repairs/maintenance: $350/mo</p>
                        <p className="mb-1">• Management: 8% ($240/mo)</p>
                        <p className="mb-1">• Vacancy: 5% ($150/mo)</p>
                        <p className="mb-1">• <strong>Total monthly cost: $5,496</strong></p>
                        <p className="mb-1">• Expected rent: $2,800-$3,200/mo</p>
                        <p className="text-red-500 font-medium">• Monthly cash flow: -$2,296 to -$2,696</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-green-600 mb-2">BUT:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Annual principal paydown: ~$8K</li>
                      <li>• Appreciation (assume 3%/yr): $24K</li>
                      <li>• Tax benefits (depreciation): ~$6K-$9K value</li>
                      <li>• <strong>Total annual return: $38K-$41K on $160K = 24-26% total return</strong></li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-500/10 p-3 rounded text-center">
                      <p className="text-sm text-red-600 font-medium">Cash-on-cash: <strong>Negative 17%</strong></p>
                    </div>
                    <div className="bg-green-500/10 p-3 rounded text-center">
                      <p className="text-sm text-green-600 font-medium">Total return (incl. appreciation + paydown + tax): <strong>24-26%</strong></p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-medium">
                    <strong>This is the San Diego investor reality:</strong> You&apos;re betting on appreciation and tax benefits, not cash flow. This works if you can absorb negative cash flow from W-2 income and hold for 7-10+ years.
                  </p>
                </div>

                {/* Small Multifamily */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-primary mb-4">
                    Small Multifamily: The Elusive Holy Grail
                  </h3>
                  <p className="mb-4">
                    San Diego small multifamily (2-4 units) is scarce. Most were built pre-1980 and held by long-term owners. When they do trade, expect:
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Cap rates: <strong>4.5-5.5%</strong> stabilized, <strong>6-7%</strong> heavy value-add</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Median 2-4 unit price: <strong>$1.2M-$2.0M</strong></span>
                    </li>
                  </ul>

                  <div className="bg-card border border-border/40 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-3">Example value-add play (National City triplex):</h4>
                    <ul className="space-y-1 text-sm mb-3">
                      <li>• Purchase: <strong>$1.5M</strong></li>
                      <li>• Current rents: $2,200/unit x3 = $6,600/mo (80% of market)</li>
                      <li>• Rehab: $50K ($15K-20K/unit)</li>
                      <li>• Post-rehab rents: $2,600/unit x3 = <strong>$7,800/mo</strong></li>
                      <li>• You forced <strong>$14,400/year in NOI growth</strong></li>
                      <li>• At 5.5% cap rate = <strong className="text-green-600">$262K in forced appreciation</strong></li>
                      <li>• All-in: $375K down + $50K rehab = $425K</li>
                      <li>• <strong className="text-green-600">Equity created: 62% ROI</strong></li>
                    </ul>
                    <p className="text-sm font-medium">Then you refinance or sell and recycle capital into the next deal.</p>
                  </div>
                </div>

                {/* BRRRR */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-primary mb-4">
                    BRRRR: Does It Actually Work Here?
                  </h3>
                  <p className="mb-4">The classic BRRRR is possible in San Diego but requires surgical execution.</p>

                  <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-red-600 mb-2">The challenge: You need massive forced appreciation to make the refinance work.</h4>
                    <p className="text-sm mb-2"><strong>What ARV spread is required:</strong></p>
                    <ul className="space-y-1 text-sm">
                      <li>• Minimum: 20% (hard to achieve)</li>
                      <li>• Comfortable: 25-30% (very rare)</li>
                      <li>• Formula: Purchase + Rehab + Carry ≤ 75% of ARV</li>
                    </ul>
                    <p className="text-sm mt-2 text-red-600 font-medium">Realistic ARV spread in SD 2025-2026: 15-20% in most markets (not enough)</p>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-600 mb-2">Where BRRRR might work:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Escondido, Vista, El Cajon (more distressed inventory)</li>
                      <li>• Cosmetic-only rehabs (avoid foundation, roof, major systems)</li>
                      <li>• Consider <strong>&quot;Slow BRRRR&quot;</strong>: Hold 2-3 years before refinance to let appreciation grow into the deal</li>
                    </ul>
                  </div>
                </div>

                {/* ADU Strategy */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-primary mb-4">
                    ADU Strategy: The 10-Year Play
                  </h3>

                  <div className="bg-card border border-border/40 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-primary mb-2">True economics (600-800 sqft detached ADU in North Park/Hillcrest):</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• All-in cost: <strong>$200K-$282K</strong></li>
                      <li>• Timeline: 12-18 months realistic (8-12 best case)</li>
                      <li>• ADU rent: <strong>$1,800-$2,400/mo</strong></li>
                      <li>• Payback period: <strong>10+ years</strong> on cash basis</li>
                    </ul>
                  </div>

                  <p className="mb-4"><strong>But:</strong> Property value increases $30K-$80K from ADU addition, and main house rent potential improves.</p>

                  <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-600 mb-2">Best ADU scenarios:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>House-hack:</strong> Live in main, rent ADU for $2K/mo</li>
                      <li>• <strong>Dual rental:</strong> Main house $3,200 + ADU $2,000 = $5,200/mo combined = <strong>5.5-7% gross yield</strong></li>
                    </ul>
                    <p className="text-sm mt-2 font-medium">Verdict: ADUs are an appreciation play with modest cash flow enhancement. They work when you&apos;re already holding the property and want to add income without selling.</p>
                  </div>
                </div>

                {/* Flips */}
                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-primary mb-4">
                    Flips: Margin, Liquidity, DOM Risk
                  </h3>
                  <p className="mb-4">2025 was brutal for flippers. National average discount from list: <strong className="text-red-600">8.3%</strong> (vs. 0.9% in 2021).</p>

                  <div className="bg-card border border-border/40 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-primary mb-2">What flipping requires in SD 2026:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Minimum ARV spread: <strong>25-30%</strong> to net 8-12% ROI after all costs</li>
                      <li>• Target submarkets: &lt;40 days median DOM</li>
                      <li>• Realistic sale assumptions: Expect <strong>6% discount from list price</strong></li>
                      <li>• Timeline buffer: Budget 2 months of carry post-completion</li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-500/10 p-3 rounded">
                      <p className="text-sm font-medium text-green-600 mb-1">Where flips can work:</p>
                      <ul className="text-sm space-y-1">
                        <li>• South Bay (Chula Vista, National City)</li>
                        <li>• Escondido, Vista</li>
                      </ul>
                    </div>
                    <div className="bg-red-500/10 p-3 rounded">
                      <p className="text-sm font-medium text-red-600 mb-1">Avoid:</p>
                      <ul className="text-sm space-y-1">
                        <li>• Coastal (illiquid)</li>
                        <li>• Downtown condos (oversupplied)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Reference Table */}
              <div className="my-8 overflow-x-auto">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Quick Reference: Submarket Snapshot
                </h2>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/10">
                      <th className="border border-border/40 px-3 py-2 text-left font-bold">Submarket</th>
                      <th className="border border-border/40 px-3 py-2 text-right font-bold">Median SFR</th>
                      <th className="border border-border/40 px-3 py-2 text-right font-bold">Rent (2BR)</th>
                      <th className="border border-border/40 px-3 py-2 text-right font-bold">Cap Rate</th>
                      <th className="border border-border/40 px-3 py-2 text-left font-bold">Best Strategy</th>
                      <th className="border border-border/40 px-3 py-2 text-left font-bold">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border/40 px-3 py-2 font-medium">La Jolla</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$2.5M</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$3,500</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-red-500">2-3%</td>
                      <td className="border border-border/40 px-3 py-2">Appreciation hold</td>
                      <td className="border border-border/40 px-3 py-2">Low volatility, thin yield</td>
                    </tr>
                    <tr className="bg-muted/5">
                      <td className="border border-border/40 px-3 py-2 font-medium">Pacific Beach</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$1.6M</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$3,000</td>
                      <td className="border border-border/40 px-3 py-2 text-right">3.5-4.5%</td>
                      <td className="border border-border/40 px-3 py-2">Long-term rental</td>
                      <td className="border border-border/40 px-3 py-2">Moderate</td>
                    </tr>
                    <tr>
                      <td className="border border-border/40 px-3 py-2 font-medium">North Park</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$1.2M</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$2,650</td>
                      <td className="border border-border/40 px-3 py-2 text-right">4-4.5%</td>
                      <td className="border border-border/40 px-3 py-2">Buy-hold rental</td>
                      <td className="border border-border/40 px-3 py-2">Low risk, high demand</td>
                    </tr>
                    <tr className="bg-muted/5">
                      <td className="border border-border/40 px-3 py-2 font-medium">Hillcrest</td>
                      <td className="border border-border/40 px-3 py-2 text-right">N/A</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$2,550</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-green-500">6-7%*</td>
                      <td className="border border-border/40 px-3 py-2">Condo cash flow</td>
                      <td className="border border-border/40 px-3 py-2">Best small investor play</td>
                    </tr>
                    <tr>
                      <td className="border border-border/40 px-3 py-2 font-medium">Clairemont</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$700K</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$2,200</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-green-500">5-6%</td>
                      <td className="border border-border/40 px-3 py-2">Value-add SFR</td>
                      <td className="border border-border/40 px-3 py-2">Best entry-level market</td>
                    </tr>
                    <tr className="bg-muted/5">
                      <td className="border border-border/40 px-3 py-2 font-medium">Chula Vista</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$825K</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$2,500-$3,200</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-green-500">5-6%</td>
                      <td className="border border-border/40 px-3 py-2">Volume buy-hold</td>
                      <td className="border border-border/40 px-3 py-2">Best liquidity</td>
                    </tr>
                    <tr>
                      <td className="border border-border/40 px-3 py-2 font-medium">National City</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$699K</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$2,200-$2,800</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-green-500">6-7%</td>
                      <td className="border border-border/40 px-3 py-2">Highest cash flow</td>
                      <td className="border border-border/40 px-3 py-2">Stigma risk, best returns</td>
                    </tr>
                    <tr className="bg-muted/5">
                      <td className="border border-border/40 px-3 py-2 font-medium">Oceanside</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$963K</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$2,500-$3,500</td>
                      <td className="border border-border/40 px-3 py-2 text-right">4-5%</td>
                      <td className="border border-border/40 px-3 py-2">Coastal value play</td>
                      <td className="border border-border/40 px-3 py-2">Military tenant gold</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-sm text-muted mt-2">*Condos only</p>
              </div>

              {/* 2026 Outlook */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  2026 Outlook: Three Scenarios
                </h2>

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-background/50 p-4 rounded-lg border border-border/20">
                    <h4 className="font-bold text-primary mb-2">Base Case (50%)</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Prices: +1% to +3%</li>
                      <li>• Rents: +3% to +5%</li>
                      <li>• Rates: 5.8-6.4% average</li>
                    </ul>
                    <p className="text-sm mt-2">Value-add multifamily works. ADUs pencil. Slow BRRRR viable. Avoid over-leveraged plays.</p>
                  </div>
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <h4 className="font-bold text-green-600 mb-2">Bull Case (20%)</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Prices: +4% to +7%</li>
                      <li>• Rents: +5% to +8%</li>
                      <li>• Rates: 5.2-5.8% (breaks below 6%)</li>
                    </ul>
                    <p className="text-sm mt-2">All strategies work. Get positioned now before prices run. Coastal sees biggest gains.</p>
                  </div>
                  <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                    <h4 className="font-bold text-red-600 mb-2">Bear Case (30%)</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Prices: -2% to -5%</li>
                      <li>• Rents: 0% to +2%</li>
                      <li>• Unemployment: Breaks 6%</li>
                    </ul>
                    <p className="text-sm mt-2">Cash buyers picking up distress. Patient capital wins. 2026 Bear = 2027-2028 Bull setup.</p>
                  </div>
                </div>
              </div>

              {/* What We Watch */}
              <div className="bg-muted/5 border border-border/20 p-6 rounded-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  What We&apos;re Watching
                </h2>
                <p className="mb-4">Our personal &quot;tell&quot; for which way the market breaks:</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">📊</span>
                    <span><strong>Pending home sales:</strong> If Q1 drops &gt;10% YoY = Bear. If +10% = Bull building.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">📈</span>
                    <span><strong>Biotech job postings:</strong> Leading indicator for high-income renter demand</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">💼</span>
                    <span><strong>Unemployment rate:</strong> 4.5-5.0% = Base. &gt;5.5% = Bear. &lt;4.5% = Bull.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">🏠</span>
                    <span><strong>Days on market:</strong> If DOM spikes to 50+ days, trouble ahead</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">💰</span>
                    <span><strong>Rental vacancy:</strong> &lt;3% = tight, rents rise. &gt;5% = loosening, concessions return</span>
                  </li>
                </ul>
              </div>

              {/* Risks */}
              <div className="bg-red-500/5 border-2 border-red-500/20 p-6 rounded-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  The Risks You Can&apos;t Ignore
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-red-500 font-bold mr-3">⚠️</span>
                    <span><strong>Insurance crisis:</strong> Premiums up 20% in 2025. Budget $2K-$2.5K/year going forward, not historical $1.5K.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 font-bold mr-3">⚠️</span>
                    <span><strong>Rent control expansion:</strong> Political pressure rising. Small multifamily (2-4 units) could be swept into rent control in next 3-5 years.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 font-bold mr-3">⚠️</span>
                    <span><strong>Border policy risk (South Bay):</strong> Aggressive deportations could shrink tenant pools 10-20% in National City, Chula Vista.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 font-bold mr-3">⚠️</span>
                    <span><strong>Tenant protection costs:</strong> No-fault evictions now cost 2 months rent (3 months for seniors) in SD city limits. Budget $5K-$8K per eviction.</span>
                  </li>
                </ul>
              </div>

              {/* Bottom Line */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-accent p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Bottom Line: The San Diego Investor Playbook for 2026
                </h2>
                <p className="font-bold text-lg mb-4">This is not a volume market. It&apos;s a precision market.</p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <h4 className="font-bold text-green-600 mb-2">What works:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Value-add multifamily where you can force NOI growth</li>
                      <li>• ADU additions in high-rent central submarkets (if you can hold 7-10+ years)</li>
                      <li>• SFR buy-hold in cash-flowing markets (Escondido, South Bay) with W-2 income to absorb losses</li>
                      <li>• Small investor condo plays in Hillcrest/North Park with low HOAs</li>
                      <li>• Slow BRRRR with 2-3 year holds</li>
                    </ul>
                  </div>
                  <div className="bg-red-500/10 p-4 rounded-lg">
                    <h4 className="font-bold text-red-600 mb-2">What doesn&apos;t work:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Over-leveraged negative-cash-flow plays hoping for appreciation</li>
                      <li>• Premium condos &gt;$1M (oversupplied, especially downtown)</li>
                      <li>• Flips without 25%+ ARV spread</li>
                      <li>• Anything in Imperial Beach</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-6">
                  <strong>The reality check:</strong> San Diego rewards patience, precision, and realistic expectations—not speculation. If you&apos;re coming here expecting 10% cash-on-cash returns and quick flips, you&apos;ll get wrecked. But if you understand this is an appreciation market with stable fundamentals, decent job growth, and structural housing constraints, there&apos;s money to be made with the right strategy and timeline.
                </p>
                <p className="mt-4 font-medium text-primary">
                  The question isn&apos;t whether San Diego real estate is a good investment. It&apos;s whether your strategy and capital position match what this market actually delivers.
                </p>
              </div>

              {/* Strong CTA Section */}
              <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <h2 className="text-3xl font-bold text-primary mb-4 text-center">
                  Want to Analyze San Diego Properties?
                </h2>

                <p className="text-center text-lg mb-4">
                  Use our AI-powered analysis tools at Dealsletter.io to break down any property with real numbers, ROI projections, and investment scores.
                </p>

                <p className="text-center text-muted mb-8">
                  Not subscribed yet? Get market analysis like this delivered to your inbox. Subscribe to Dealsletter — it&apos;s free.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/signup"
                    className="px-8 py-4 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-all font-medium text-center text-lg"
                  >
                    Start Free Analysis
                  </Link>
                  <Link
                    href="/analysis"
                    className="px-8 py-4 bg-accent text-secondary rounded-lg hover:bg-accent/90 transition-all font-medium text-center text-lg"
                  >
                    Analyze a Property Now
                  </Link>
                </div>

                <p className="text-center text-sm text-muted mt-6">
                  Join thousands of investors making smarter San Diego real estate decisions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
