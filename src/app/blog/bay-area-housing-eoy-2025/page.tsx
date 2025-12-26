'use client'

import Link from 'next/link'
import Image from 'next/image'
import BlogNavigation from '@/components/BlogNavigation'

export default function BayAreaHousingEOY2025Article() {
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
              <span className="text-sm text-muted">December 2025</span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">15 min read</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              End of 2025 Bay Area Housing Deep Dive: All 9 Counties Analyzed
            </h1>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="relative aspect-[5/3] bg-muted/10">
                <Image
                  src="/logos/bay area article header.png"
                  alt="Bay Area Housing Market End of 2025 Analysis"
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
                  The Big Picture: Not One Market, But Nine
                </h2>
                <p className="text-primary mb-4">
                  Here&apos;s our end-of-year 2025 Bay Area market analysis with actual numbers across all 9 counties. Data runs through November 2025, giving us the most complete picture possible before year-end.
                </p>
                <p className="text-primary">
                  The pattern we keep seeing: the Bay is not &quot;one market.&quot; It&apos;s 9 different markets, and inside each county it splits again (turnkey vs fixer, SFH vs condo, prime school pocket vs not). If you&apos;re feeling whiplash reading headlines, it&apos;s because both bullish and bearish takes can be true depending on where you&apos;re looking.
                </p>
              </div>

              {/* Key Stats */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Bay Area Market Overview
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">$1.275M</div>
                    <div className="text-sm text-muted">Combined Median</div>
                    <div className="text-sm text-red-500 font-medium">-3.2% YoY</div>
                  </div>
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">2.2 mo</div>
                    <div className="text-sm text-muted">Inventory Supply</div>
                    <div className="text-sm text-muted">Still tight overall</div>
                  </div>
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">~6.2%</div>
                    <div className="text-sm text-muted">Mortgage Rates</div>
                    <div className="text-sm text-green-500">Down from peaks</div>
                  </div>
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">17%</div>
                    <div className="text-sm text-muted">CA Households</div>
                    <div className="text-sm text-muted">Can afford median</div>
                  </div>
                </div>

                <p className="mb-4">
                  The combined Bay Area median landed around <strong>$1.275M</strong> and is down about <strong>3.2% YoY</strong> — the largest decline in California by region. That sounds dramatic until you zoom in and realize it&apos;s partly a &quot;mix shift&quot; story (more transactions in the &quot;cheaper&quot; counties pulls the overall median down). Inventory is still tight overall at roughly 2.2 months supply, so this isn&apos;t 2008 vibes.
                </p>
                <p>
                  Rates cooled into the low 6&apos;s by late 2025 (around 6.2%), which helped bring buyers back off the sidelines, but affordability is still brutal. Only about 17% of CA households can afford the median home. That matters because it caps how crazy things can get unless rates drop meaningfully or incomes surge.
                </p>
              </div>

              {/* Bifurcation Theme */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  The Theme of 2025: Bifurcation
                </h2>
                <p className="mb-4">
                  This basically explains the entire Bay right now. The nicest, best-located, best-presented homes still move fast and often get overbid. The &quot;everything else&quot; bucket — dated, overpriced, funky layouts, busy streets, condos with big HOA/insurance issues — is where you&apos;re seeing longer days on market, price cuts, and credits.
                </p>
                <p className="font-medium text-primary">
                  So yes, buyers have leverage... but only in the parts of the market where sellers are forced to negotiate.
                </p>
              </div>

              {/* County Breakdown Section */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  County-by-County Breakdown
                </h2>

                {/* San Francisco */}
                <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    San Francisco: The Outlier That Sparks Debate
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Median: <strong>~$1.8M</strong> (+12.6% YoY)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Inventory: ~1.5 months supply (very tight)</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>SFH: Speed-running escrow when priced right</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Condos: Slower, financing-sensitive</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    <strong>Analysis:</strong> SF is the outlier. The fuel here is the high-end and the AI wealth effect, plus people who are sick of paying SF rent that&apos;s climbing again. Condos are the awkward cousin — they&apos;re not dead, but they&apos;re slower, and the &quot;why is my HOA $1,200/mo&quot; conversations are real. <strong>2026 outlook:</strong> SFH stays strong if rates drift down and the tech/AI money keeps flowing; condos stabilize but don&apos;t moonshot.
                  </p>
                </div>

                {/* San Mateo */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    San Mateo: Don&apos;t Be Fooled by the Numbers
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Median: <strong>~$2.0M</strong> (-8.8% YoY)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Structural demand: Schools, Caltrain, proximity</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Mix-sensitive: A few sales skew the median</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Ground feel: Still tight in desirable pockets</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    <strong>Analysis:</strong> This one looks &quot;down&quot; on paper, but we don&apos;t think it&apos;s a massive collapse. San Mateo is super sensitive to what actually sold that month. A few more &quot;normal&quot; sales can make it look like it fell off a cliff even if the actual feel on the ground is still tight. The peninsula still has that structural demand. <strong>2026 outlook:</strong> Slow grind higher if rates cooperate, with more negotiation than 2021 but not a giant correction unless the job market breaks.
                  </p>
                </div>

                {/* Santa Clara */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    Santa Clara: Flat But Spicy
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Median: <strong>~$1.935M</strong> (+0.2% YoY)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>SFH: Turnkey in right pockets = fast, above ask</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Condos/townhomes: Getting punched (inventory up, prices down)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Buyer behavior: Pickier on attached product</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    <strong>Analysis:</strong> Basically unchanged YoY, which is impressive considering how much rate pain we&apos;ve had. The real story is SFH vs condo/townhome divergence. SFHs that are turnkey in the right pockets still sell fast and above ask. Condos and attached product are struggling because HOA + insurance + &quot;I can rent instead&quot; math is hard to ignore. <strong>2026 outlook:</strong> SFH mildly up if rates sit ~6% or drop; condos still need time to work through supply.
                  </p>
                </div>

                {/* Alameda */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    Alameda: Where the Shift Is Felt Most
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Median: <strong>~$1.1925M</strong> (-7.2% YoY)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Inventory: Increased, buyers taking longer</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Hot pockets: Turnkey + safe + commute-friendly</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Sitting: Properties priced like it&apos;s 2022</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    <strong>Analysis:</strong> Alameda had one of the bigger YoY drops on paper. This is where people really feel the shift. Oakland/Berkeley/Albany/Fremont aren&apos;t all behaving the same at all. Some pockets still get competed on hard, but a lot more listings are sitting if they&apos;re priced like it&apos;s 2022. <strong>2026 outlook:</strong> &quot;Balanced market energy&quot; — not a crash, but you can negotiate if you&apos;re not chasing the best house on the block.
                  </p>
                </div>

                {/* Contra Costa */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    Contra Costa: The Most &quot;Normal&quot; Market
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Median: <strong>~$889K</strong> (-0.9% YoY)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>DOM: 30-45+ days depending on area</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Closer-in premium pockets: Holding better</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Outer commuter zones: More rate-sensitive</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    <strong>Analysis:</strong> This is the county that feels the most &quot;normal&quot; right now: not frozen, not euphoric. Walnut Creek is still Walnut Creek (basically its own little ecosystem). Outer areas feel more rate-sensitive. <strong>2026 outlook:</strong> Depends heavily on rates and how many move-up buyers decide to list — looks like modest stabilization.
                  </p>
                </div>

                {/* Marin */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    Marin: Looks Ugly, But Context Matters
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Median: <strong>~$1.47M</strong> (-9.5% YoY)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Worst decline in the Bay on paper</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>DOM: ~50 days</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Mix shift: Who sold matters a ton</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    <strong>Analysis:</strong> Marin looks ugly at first glance with the worst decline in the Bay. But again, Marin is another &quot;mix shift county&quot; where who sold matters a ton. Buyers are active but picky, and sellers can&apos;t just throw a number at the wall anymore. <strong>2026 outlook:</strong> Flat to slight recovery if rates drop, with more normal negotiating and less mania.
                  </p>
                </div>

                {/* Sonoma */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    Sonoma: Steady With Lifestyle Appeal
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Median: <strong>~$801K</strong> (-0.5% YoY)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Pace: Slower cadence, more seasonality</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Insurance: Wildfire factor always present</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Remote work: Still a magnet for partial WFH</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    <strong>Analysis:</strong> Sonoma has a slower cadence with longer days on market and more seasonality. The wildfire/insurance factor is always in the background. It&apos;s still a magnet for lifestyle buyers and people who can do partial remote work, but it&apos;s not the same &quot;line up and bid&quot; market as SFH pockets in the core Bay. <strong>2026 outlook:</strong> Stable unless insurance becomes a bigger deal or we get a recession hit.
                  </p>
                </div>

                {/* Napa - Highlighted */}
                <div className="bg-green-500/5 border-2 border-green-500/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    Napa: Prices Up, But Buyers Have Power
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Median: <strong>~$931.5K</strong> (+4.1% YoY)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Supply: 6-7 months at times</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>DOM: Longer than core Bay</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        <span>Leverage: Negotiate, ask for credits</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    <strong>Analysis:</strong> Napa is the weird combo of &quot;prices up&quot; but &quot;buyers have power.&quot; That&apos;s what a buyer&apos;s market looks like: you can negotiate, you can ask for credits, you can actually breathe. <strong>2026 outlook:</strong> The most buyer-friendly county in the Bay if you&apos;re shopping and not trying to compete with 20 offers.
                  </p>
                </div>

                {/* Solano - Highlighted */}
                <div className="bg-blue-500/5 border-2 border-blue-500/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    Solano: The Affordability Pressure Valve
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Median: <strong>~$580K</strong> (-2.8% YoY)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Buyer leverage: Clear and present</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Deals: Under-ask sales happening</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Tradeoff: Commute to job centers</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    <strong>Analysis:</strong> Solano is still the Bay&apos;s affordability pressure valve. This is where you&apos;re seeing the clearest buyer leverage — more under-ask deals, more negotiation, more &quot;let&apos;s try a wild offer and see if it sticks&quot; stories. The tradeoff is obvious: commute/job centers. <strong>2026 outlook:</strong> If rates drop, Solano probably benefits more than anyone because affordability math improves fast at this price point. If rates stay higher, it stays soft but still attractive relative to everything else.
                  </p>
                </div>
              </div>

              {/* 2026 Outlook */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  2026 Outlook: Our Base Case
                </h2>
                <p className="mb-4">
                  Our base case is boring (which is usually the right answer): <strong>stabilization</strong>. Not a crash, not a rocket ship.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-background/50 p-4 rounded-lg">
                    <h4 className="font-bold text-primary mb-2">Base Case</h4>
                    <p className="text-sm">If rates average ~6.0% as forecasts suggest: modest price growth in supply-constrained/core counties (SF, San Mateo, Santa Clara) and flatter performance in higher-supply counties (Napa, Sonoma, Solano).</p>
                  </div>
                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <h4 className="font-bold text-green-600 mb-2">Bull Case</h4>
                    <p className="text-sm">If rates drop into the mid-5&apos;s, the Bay goes right back into FOMO mode in the hottest pockets.</p>
                  </div>
                  <div className="bg-red-500/10 p-4 rounded-lg">
                    <h4 className="font-bold text-red-600 mb-2">Bear Case</h4>
                    <p className="text-sm">If we get a real recession + layoffs broaden + rates stay high, condos and far-out commuter counties feel it first.</p>
                  </div>
                </div>
              </div>

              {/* The Real Tell */}
              <div className="bg-muted/5 border border-border/20 p-6 rounded-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  The Real Tell: What We Watch
                </h2>
                <p className="mb-4">
                  Our personal &quot;tell&quot; for whether we&apos;re shifting more buyer-friendly or seller-friendly isn&apos;t the median price headline. It&apos;s the boring stuff:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">📊</span>
                    <span><strong>Days on market (DOM):</strong> Rising DOM = buyers gaining leverage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">📈</span>
                    <span><strong>Inventory levels:</strong> More supply = more negotiating room</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">💰</span>
                    <span><strong>Seller credits:</strong> When credits show up, the market is admitting reality even if the median price hasn&apos;t moved much yet</span>
                  </li>
                </ul>
              </div>

              {/* Summary Table */}
              <div className="my-8 overflow-x-auto">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Quick Reference: All 9 Counties
                </h2>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted/10">
                      <th className="border border-border/40 px-3 py-2 text-left font-bold">County</th>
                      <th className="border border-border/40 px-3 py-2 text-right font-bold">Median</th>
                      <th className="border border-border/40 px-3 py-2 text-right font-bold">YoY Change</th>
                      <th className="border border-border/40 px-3 py-2 text-left font-bold">Market Vibe</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border/40 px-3 py-2 font-medium">San Francisco</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$1.8M</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-green-600">+12.6%</td>
                      <td className="border border-border/40 px-3 py-2">SFH hot, condos slow</td>
                    </tr>
                    <tr className="bg-muted/5">
                      <td className="border border-border/40 px-3 py-2 font-medium">San Mateo</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$2.0M</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-red-500">-8.8%</td>
                      <td className="border border-border/40 px-3 py-2">Mix shift, still tight</td>
                    </tr>
                    <tr>
                      <td className="border border-border/40 px-3 py-2 font-medium">Santa Clara</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$1.935M</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-muted">+0.2%</td>
                      <td className="border border-border/40 px-3 py-2">Flat, SFH vs condo split</td>
                    </tr>
                    <tr className="bg-muted/5">
                      <td className="border border-border/40 px-3 py-2 font-medium">Alameda</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$1.1925M</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-red-500">-7.2%</td>
                      <td className="border border-border/40 px-3 py-2">Balanced, negotiable</td>
                    </tr>
                    <tr>
                      <td className="border border-border/40 px-3 py-2 font-medium">Contra Costa</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$889K</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-muted">-0.9%</td>
                      <td className="border border-border/40 px-3 py-2">Most &quot;normal&quot; feel</td>
                    </tr>
                    <tr className="bg-muted/5">
                      <td className="border border-border/40 px-3 py-2 font-medium">Marin</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$1.47M</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-red-500">-9.5%</td>
                      <td className="border border-border/40 px-3 py-2">Mix shift, picky buyers</td>
                    </tr>
                    <tr>
                      <td className="border border-border/40 px-3 py-2 font-medium">Sonoma</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$801K</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-muted">-0.5%</td>
                      <td className="border border-border/40 px-3 py-2">Lifestyle market, stable</td>
                    </tr>
                    <tr className="bg-muted/5">
                      <td className="border border-border/40 px-3 py-2 font-medium">Napa</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$931.5K</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-green-600">+4.1%</td>
                      <td className="border border-border/40 px-3 py-2">Buyer-friendly despite gains</td>
                    </tr>
                    <tr>
                      <td className="border border-border/40 px-3 py-2 font-medium">Solano</td>
                      <td className="border border-border/40 px-3 py-2 text-right">$580K</td>
                      <td className="border border-border/40 px-3 py-2 text-right text-red-500">-2.8%</td>
                      <td className="border border-border/40 px-3 py-2">Affordability play, leverage</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Key Takeaways */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Key Takeaways
                </h2>
                <ol className="space-y-3">
                  <li className="flex items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</span>
                    <span>The Bay Area is not one market — it&apos;s 9 different markets with different dynamics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</span>
                    <span>Bifurcation is the theme: turnkey/premium sells fast, everything else has leverage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3</span>
                    <span>SF is the outlier with strong SFH performance driven by AI wealth</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4</span>
                    <span>Napa and Solano offer the most buyer leverage in the Bay</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">5</span>
                    <span>2026 outlook: Stabilization is the base case, not a crash or a rocket ship</span>
                  </li>
                </ol>
              </div>

              {/* Strong CTA Section */}
              <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <h2 className="text-3xl font-bold text-primary mb-4 text-center">
                  Want to Analyze Specific Bay Area Properties?
                </h2>

                <p className="text-center text-lg mb-8">
                  Use our AI-powered analysis tools to break down any property in the Bay Area with real numbers, ROI projections, and investment scores.
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
                  Join thousands of investors making smarter Bay Area real estate decisions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
