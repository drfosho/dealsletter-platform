'use client'

import Link from 'next/link'
import Image from 'next/image'
import BlogNavigation from '@/components/BlogNavigation'

export default function LAQ12026Article() {
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
              <span className="text-sm text-muted">February 2026</span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">15 min read</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              LA Real Estate Q1 2026: The Market Isn&apos;t Crashing — It&apos;s Just Picky
            </h1>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="relative aspect-[5/3] bg-muted/10">
                <Image
                  src="/logos/LA QUARTER ONE.png"
                  alt="LA Real Estate Q1 2026: The Market Isn't Crashing — It's Just Picky"
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
                  The Big Picture: Selective, Not Collapsing
                </h2>
                <p className="text-primary mb-4">
                  Here&apos;s what&apos;s actually happening in Los Angeles real estate as we enter 2026, and what it means for investors right now.
                </p>
                <p className="text-primary mb-4">
                  <strong>The headline:</strong> LA real estate isn&apos;t &quot;crashing&quot; — it&apos;s just <em>picky</em>. Prices aren&apos;t running away, buyers have more breathing room, and the only properties that move quickly are the ones that feel like a no-brainer: good location, good condition, priced realistically. Everything else? It sits.
                </p>
                <p className="text-primary mb-0">
                  This is the most buyer-friendly window we&apos;ve seen since before the pandemic — but &quot;buyer-friendly&quot; doesn&apos;t mean &quot;cheap.&quot; It means negotiating power is back for those who show up prepared.
                </p>
              </div>

              {/* Methodology Note */}
              <div className="bg-muted/10 border border-border/40 p-4 rounded-lg my-6">
                <p className="text-sm text-muted mb-0">
                  <strong>Note on methodology:</strong> We used AI tools to pull market data and run sensitivity checks (rates, inventory, flip math), then cross-verified against public data sources including Freddie Mac PMMS, CAR reports, and county assessor records. All sources are cited throughout. This is how modern market research works — and we&apos;re transparent about our process.
                </p>
              </div>

              {/* Key Stats */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Q1 2026 By The Numbers
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">11,526</div>
                    <div className="text-sm text-muted">Active Listings</div>
                    <div className="text-sm text-muted">Dec 2025 (down from Aug peak)</div>
                  </div>
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">67 days</div>
                    <div className="text-sm text-muted">Median DOM</div>
                    <div className="text-sm text-muted">Negotiation is back</div>
                  </div>
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">$2,167</div>
                    <div className="text-sm text-muted">Median Rent</div>
                    <div className="text-sm text-red-500">4-year low</div>
                  </div>
                  <div className="bg-card border border-border/60 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">~6%</div>
                    <div className="text-sm text-muted">Mortgage Rates</div>
                    <div className="text-sm text-muted">The whole game right now</div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-primary mb-3">What this actually means:</h3>
                  <p className="mb-0">
                    Inventory isn&apos;t &quot;high&quot; by historical standards — even with more listings than the 2021 frenzy, this is still a constrained market. But days on market at 67 is real breathing room. The rent softness matters because it takes oxygen out of the &quot;I&apos;ll just rent it if it doesn&apos;t sell&quot; backup plan, and it complicates investor math across the board.
                  </p>
                </div>
              </div>

              {/* Three Lanes Theme */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  The Theme of Q1 2026: Three Lanes, Three Realities
                </h2>
                <p className="mb-4">
                  The LA market has fractured into three distinct lanes — and understanding which lane your target property sits in is everything:
                </p>

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <h4 className="font-bold text-green-600 mb-2">Lane 1: Turnkey + Priced Right</h4>
                    <p className="text-sm">These still move. Fast. Buyers are exhausted and don&apos;t want projects, permits, and surprises. If it checks all boxes, expect multiple offers.</p>
                  </div>
                  <div className="bg-yellow-500/10 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-600 mb-2">Lane 2: Overpriced or &quot;Weird&quot;</h4>
                    <p className="text-sm">60-120+ DOM homes. Not necessarily bad houses — just bad pricing, bad layouts, deferred maintenance, fire/insurance issues, or sellers anchored to 2022 prices.</p>
                  </div>
                  <div className="bg-purple-500/10 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-600 mb-2">Lane 3: Ultra-Luxury ($10M+)</h4>
                    <p className="text-sm">Its own planet. Strong activity even when the middle feels dead. Different buyer pool, different rules. Your $1.4M listing is not benefiting from this.</p>
                  </div>
                </div>

                <p className="mt-4 font-medium text-primary">
                  <strong>The real tell:</strong> The &quot;everything is collapsing&quot; narrative doesn&apos;t map cleanly to what&apos;s actually happening. It&apos;s more nuanced — and that nuance is where investors can find edge.
                </p>
              </div>

              {/* Submarket Breakdown */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Submarket Breakdown: Where Money Actually Flows
                </h2>

                {/* Westside */}
                <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-2">
                    Westside ($1.77M-$2.5M median)
                  </h3>
                  <p className="text-lg mb-3">Santa Monica, Venice, Brentwood, Pacific Palisades</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>YoY change: <strong className="text-green-600">+7.5% to +8.4%</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>DOM: 46-70 days</span>
                      </li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Active listings: 571</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Months supply: 3.2-4</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm bg-green-500/10 p-3 rounded">
                    <strong>Verdict:</strong> Still appreciating. Premium coastal locations remain insulated. High-net-worth buyers parking capital. Not a cash flow play — pure appreciation and lifestyle.
                  </p>
                </div>

                {/* San Fernando Valley */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-2">
                    San Fernando Valley ($935K-$3.5M range)
                  </h3>
                  <p className="text-lg mb-3">Sherman Oaks, Encino, Studio City, Woodland Hills</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>YoY change: <strong className="text-green-600">+8%</strong> (high-end skew)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>DOM: 41-144 days (wide variance)</span>
                      </li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Active listings: 1,763</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Months supply: 4-5.2</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm bg-muted/10 p-3 rounded">
                    <strong>Verdict:</strong> Bifurcated market. Premium pockets thriving, average homes sitting. Insurance costs rising 16%+ creating headwinds. Value-add plays possible in transitional neighborhoods.
                  </p>
                </div>

                {/* South Bay */}
                <div className="bg-blue-500/5 border-2 border-blue-500/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-2">
                    South Bay ($1.36M median)
                  </h3>
                  <p className="text-lg mb-3">Manhattan Beach, Hermosa, Redondo, Torrance</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-muted mr-2">•</span>
                        <span>YoY change: <strong>Flat to slight down</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>DOM: ~80 days</span>
                      </li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Sale-to-list: <strong>97.6%</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Months supply: 2</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm bg-blue-500/10 p-3 rounded">
                    <strong>Verdict:</strong> Tightest supply in LA County. Insurance spiking but demand stable. Aerospace and tech employer proximity supports fundamentals. Sellers getting 97.6% of ask.
                  </p>
                </div>

                {/* East LA */}
                <div className="bg-green-500/5 border-2 border-green-500/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-2">
                    East LA ($650K-$660K median)
                  </h3>
                  <p className="text-lg mb-3">Boyle Heights, El Sereno, Lincoln Heights</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>YoY change: <strong className="text-red-600">-13.3% to -2.3%</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Active listings: 10-21</span>
                      </li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>Cap rates: <strong className="text-green-600">5.5-6.5%</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>GRM: 11-12</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm bg-green-500/10 p-3 rounded">
                    <strong>Verdict:</strong> Value compression creating entry points. Highest cap rates in LA proper. Lower insurance costs. Best market for small investors seeking cash flow over appreciation.
                  </p>
                </div>

                {/* Downtown/Central */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-2">
                    Downtown/Central LA ($610K median)
                  </h3>
                  <p className="text-lg mb-3">DTLA, Arts District, Koreatown</p>
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>YoY change: <strong className="text-green-600">+3%</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>DOM: 90 days</span>
                      </li>
                    </ul>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Active listings: 279</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>Multifamily pipeline: 15K units (2025)</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm bg-muted/10 p-3 rounded">
                    <strong>Verdict:</strong> Heavy multifamily construction in 2025 adding supply. Condo market oversupplied. Rental yields compressed. Wait for pipeline absorption before aggressive positioning.
                  </p>
                </div>
              </div>

              {/* Investor Strategy Section */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Investor Reality Check: Strategy by Strategy
                </h2>

                {/* Flips */}
                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-primary mb-4">
                    Flips: Margin Is Everything Now
                  </h3>
                  <p className="mb-4">
                    If you&apos;re flipping in LA in 2026, you&apos;re not buying &quot;good deals&quot; — you&apos;re buying <em>margin</em>. And margin is being eaten alive by carry costs and extended DOM.
                  </p>

                  <div className="bg-card border border-border/40 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-primary mb-2">The math that matters:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Hard money at 10-12% + 2-3 points</li>
                      <li>• 67-day median DOM (add 30-60 days for staging, listing, close)</li>
                      <li>• Carrying costs eating $3-5K/month</li>
                      <li>• Sale-to-list at 97-100% means no &quot;pop&quot; above asking</li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-500/10 p-3 rounded">
                      <p className="text-sm font-medium text-green-600 mb-1">What actually works:</p>
                      <ul className="text-sm space-y-1">
                        <li>• Cosmetic-only + fast exit (sub-60 days)</li>
                        <li>• Deep discount acquisitions (foreclosures, estate sales)</li>
                        <li>• Markets with &lt;50 DOM median</li>
                      </ul>
                    </div>
                    <div className="bg-red-500/10 p-3 rounded">
                      <p className="text-sm font-medium text-red-600 mb-1">What doesn&apos;t:</p>
                      <ul className="text-sm space-y-1">
                        <li>• Deals assuming perfect resale in 21 days</li>
                        <li>• Heavy structural rehabs</li>
                        <li>• Anything requiring permits in LA (6+ month timeline)</li>
                      </ul>
                    </div>
                  </div>

                  <p className="mt-4 text-sm font-medium text-red-600">
                    <strong>Reality:</strong> If your deal only works assuming a perfect resale in 21 days, you don&apos;t have a deal. You have a prayer.
                  </p>
                </div>

                {/* Buy and Hold */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-primary mb-4">
                    Buy-and-Hold: The Return Profile Reality
                  </h3>
                  <p className="mb-4">
                    Buy-and-hold is still viable in LA, but you need to be honest about what you&apos;re actually buying:
                  </p>

                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Most LA buy-and-hold is <strong>equity + long-term appreciation</strong>, not immediate cash flow</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Rent softness (-4.2% YoY at the metro level) adds short-term pressure</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Cap rates averaging 5.5% countywide (4.5-6% range)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>GRM averaging 12.6 — meaning 12.6 years gross rent to equal purchase price</span>
                    </li>
                  </ul>

                  <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-600 mb-2">Where it pencils:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>East LA:</strong> Cap rates 5.5-6.5%, GRM 11-12</li>
                      <li>• <strong>South Bay:</strong> 2-month supply means appreciation upside</li>
                      <li>• <strong>SFV value pockets:</strong> Where 4-5 month supply creates negotiation room</li>
                    </ul>
                  </div>
                </div>

                {/* ADUs */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-primary mb-4">
                    ADUs: Still the Best Value-Add Play in California
                  </h3>
                  <p className="mb-4">
                    This is still one of the few &quot;real&quot; ways to manufacture value in LA without relying on the market to save you. California&apos;s ADU policy tailwinds are real — and people are still building them.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-card border border-border/40 p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-2">The reality check:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Build costs: $180K-$300K (600-1200 sqft)</li>
                        <li>• Timeline: 12-18 months realistic</li>
                        <li>• Permitting: LA is slow but streamlined vs. 2020</li>
                      </ul>
                    </div>
                    <div className="bg-card border border-border/40 p-4 rounded-lg">
                      <h4 className="font-semibold text-primary mb-2">The upside:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Additional rent: $1,800-$2,800/mo</li>
                        <li>• Property value increase: $100K-$250K</li>
                        <li>• Best for: Already-holding properties where you want income without selling</li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-sm font-medium">
                    <strong>Verdict:</strong> ADUs require patience and reserves. But in a market where forced appreciation is hard to find, adding 800 sqft of rentable space is one of the few reliable plays.
                  </p>
                </div>
              </div>

              {/* What We're Watching */}
              <div className="bg-muted/5 border border-border/20 p-6 rounded-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  What We&apos;re Watching: 3 Simple Tells
                </h2>
                <p className="mb-4">Our &quot;is this tightening or loosening?&quot; indicators heading into spring 2026:</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">📊</span>
                    <span><strong>Inventory trough → spring ramp:</strong> Does it ramp hard, or stay muted? A weak spring means buyers stay in control.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">⏱️</span>
                    <span><strong>DOM trend:</strong> Does it fall back under ~50 as spring hits? If DOM stays elevated, negotiating leverage persists.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-2xl mr-3">📈</span>
                    <span><strong>Rates staying under ~6.25%:</strong> If rates dip below 6%, demand wakes up fast. This is the single biggest variable for 2026.</span>
                  </li>
                </ul>
              </div>

              {/* Reference Table */}
              <div className="my-8 overflow-x-auto">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Quick Reference: LA County Submarket Data
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm min-w-[800px]">
                    <thead>
                      <tr className="bg-muted/10">
                        <th className="border border-border/40 px-3 py-2 text-left font-bold">Metric</th>
                        <th className="border border-border/40 px-3 py-2 text-center font-bold">LA County</th>
                        <th className="border border-border/40 px-3 py-2 text-center font-bold">Westside</th>
                        <th className="border border-border/40 px-3 py-2 text-center font-bold">SF Valley</th>
                        <th className="border border-border/40 px-3 py-2 text-center font-bold">South Bay</th>
                        <th className="border border-border/40 px-3 py-2 text-center font-bold">East LA</th>
                        <th className="border border-border/40 px-3 py-2 text-center font-bold">Downtown</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border/40 px-3 py-2 font-medium">Median Price</td>
                        <td className="border border-border/40 px-3 py-2 text-center">$890K-$942K</td>
                        <td className="border border-border/40 px-3 py-2 text-center">$1.77M-$2.5M</td>
                        <td className="border border-border/40 px-3 py-2 text-center">$935K-$3.5M</td>
                        <td className="border border-border/40 px-3 py-2 text-center">$1.36M</td>
                        <td className="border border-border/40 px-3 py-2 text-center">$650K-$660K</td>
                        <td className="border border-border/40 px-3 py-2 text-center">$610K</td>
                      </tr>
                      <tr className="bg-muted/5">
                        <td className="border border-border/40 px-3 py-2 font-medium">YoY Change</td>
                        <td className="border border-border/40 px-3 py-2 text-center">-2.4% to +0.6%</td>
                        <td className="border border-border/40 px-3 py-2 text-center text-green-500">+7.5% to +8.4%</td>
                        <td className="border border-border/40 px-3 py-2 text-center text-green-500">+8%</td>
                        <td className="border border-border/40 px-3 py-2 text-center">Flat</td>
                        <td className="border border-border/40 px-3 py-2 text-center text-red-500">-13.3% to -2.3%</td>
                        <td className="border border-border/40 px-3 py-2 text-center text-green-500">+3%</td>
                      </tr>
                      <tr>
                        <td className="border border-border/40 px-3 py-2 font-medium">Active Listings</td>
                        <td className="border border-border/40 px-3 py-2 text-center">12,380-16,655</td>
                        <td className="border border-border/40 px-3 py-2 text-center">571</td>
                        <td className="border border-border/40 px-3 py-2 text-center">1,763</td>
                        <td className="border border-border/40 px-3 py-2 text-center">Higher YoY</td>
                        <td className="border border-border/40 px-3 py-2 text-center">10-21</td>
                        <td className="border border-border/40 px-3 py-2 text-center">279</td>
                      </tr>
                      <tr className="bg-muted/5">
                        <td className="border border-border/40 px-3 py-2 font-medium">Months Supply</td>
                        <td className="border border-border/40 px-3 py-2 text-center">2.8-4</td>
                        <td className="border border-border/40 px-3 py-2 text-center">3.2-4</td>
                        <td className="border border-border/40 px-3 py-2 text-center">4-5.2</td>
                        <td className="border border-border/40 px-3 py-2 text-center font-bold text-green-500">2</td>
                        <td className="border border-border/40 px-3 py-2 text-center">N/A</td>
                        <td className="border border-border/40 px-3 py-2 text-center">N/A</td>
                      </tr>
                      <tr>
                        <td className="border border-border/40 px-3 py-2 font-medium">DOM</td>
                        <td className="border border-border/40 px-3 py-2 text-center">33-56</td>
                        <td className="border border-border/40 px-3 py-2 text-center">46-70</td>
                        <td className="border border-border/40 px-3 py-2 text-center">41-144</td>
                        <td className="border border-border/40 px-3 py-2 text-center">~80</td>
                        <td className="border border-border/40 px-3 py-2 text-center">N/A</td>
                        <td className="border border-border/40 px-3 py-2 text-center">90</td>
                      </tr>
                      <tr className="bg-muted/5">
                        <td className="border border-border/40 px-3 py-2 font-medium">Sale-to-List %</td>
                        <td className="border border-border/40 px-3 py-2 text-center">100%</td>
                        <td className="border border-border/40 px-3 py-2 text-center">N/A</td>
                        <td className="border border-border/40 px-3 py-2 text-center">N/A</td>
                        <td className="border border-border/40 px-3 py-2 text-center">97.6%</td>
                        <td className="border border-border/40 px-3 py-2 text-center">N/A</td>
                        <td className="border border-border/40 px-3 py-2 text-center">N/A</td>
                      </tr>
                      <tr>
                        <td className="border border-border/40 px-3 py-2 font-medium">Cap Rate</td>
                        <td className="border border-border/40 px-3 py-2 text-center">5.5% avg</td>
                        <td className="border border-border/40 px-3 py-2 text-center text-red-500">3.5-5%</td>
                        <td className="border border-border/40 px-3 py-2 text-center">5-6%</td>
                        <td className="border border-border/40 px-3 py-2 text-center">4-5.5%</td>
                        <td className="border border-border/40 px-3 py-2 text-center text-green-500">5.5-6.5%</td>
                        <td className="border border-border/40 px-3 py-2 text-center">5-6%</td>
                      </tr>
                      <tr className="bg-muted/5">
                        <td className="border border-border/40 px-3 py-2 font-medium">GRM</td>
                        <td className="border border-border/40 px-3 py-2 text-center">12.6 avg</td>
                        <td className="border border-border/40 px-3 py-2 text-center">12-16</td>
                        <td className="border border-border/40 px-3 py-2 text-center">11-12</td>
                        <td className="border border-border/40 px-3 py-2 text-center">12-13</td>
                        <td className="border border-border/40 px-3 py-2 text-center text-green-500">11-12</td>
                        <td className="border border-border/40 px-3 py-2 text-center">10-12</td>
                      </tr>
                      <tr>
                        <td className="border border-border/40 px-3 py-2 font-medium">Rent YoY</td>
                        <td className="border border-border/40 px-3 py-2 text-center text-red-500">-4.2%</td>
                        <td className="border border-border/40 px-3 py-2 text-center">N/A</td>
                        <td className="border border-border/40 px-3 py-2 text-center text-green-500">+3.5%</td>
                        <td className="border border-border/40 px-3 py-2 text-center">N/A</td>
                        <td className="border border-border/40 px-3 py-2 text-center">N/A</td>
                        <td className="border border-border/40 px-3 py-2 text-center">N/A</td>
                      </tr>
                      <tr className="bg-muted/5">
                        <td className="border border-border/40 px-3 py-2 font-medium">Insurance Est.</td>
                        <td className="border border-border/40 px-3 py-2 text-center">$2K-$3.6K/yr</td>
                        <td className="border border-border/40 px-3 py-2 text-center">Higher (risk)</td>
                        <td className="border border-border/40 px-3 py-2 text-center text-red-500">Up 16%</td>
                        <td className="border border-border/40 px-3 py-2 text-center">Spiking</td>
                        <td className="border border-border/40 px-3 py-2 text-center text-green-500">Lower</td>
                        <td className="border border-border/40 px-3 py-2 text-center">Variable</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-muted mt-2">
                  Sources: CAR, Freddie Mac PMMS, LA County Assessor, Zillow, Redfin, CoStar. Data as of December 2025 / January 2026.
                </p>
              </div>

              {/* Bottom Line */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-accent p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Bottom Line: The LA Investor Playbook for Q1 2026
                </h2>
                <p className="font-bold text-lg mb-4">LA isn&apos;t giving you easy mode anymore.</p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <h4 className="font-bold text-green-600 mb-2">What works:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Buying realistic sellers at 97-100% of market in low-DOM pockets</li>
                      <li>• ADU additions where rent supports the build cost</li>
                      <li>• East LA cash flow plays with 5.5-6.5% cap rates</li>
                      <li>• Patient long-term holds in supply-constrained South Bay</li>
                      <li>• Cosmetic-only flips with 25%+ ARV spread</li>
                    </ul>
                  </div>
                  <div className="bg-red-500/10 p-4 rounded-lg">
                    <h4 className="font-bold text-red-600 mb-2">What doesn&apos;t work:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Flips relying on quick resale and perfect execution</li>
                      <li>• Downtown condos (oversupplied)</li>
                      <li>• Westside for cash flow (3.5-5% cap rates)</li>
                      <li>• Anything requiring 6+ months of LA permits</li>
                      <li>• &quot;I&apos;ll just rent it&quot; as your Plan B</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <p>
                    <strong>For buyers:</strong> This is the best &quot;breathe and negotiate&quot; window in years. Unless you&apos;re shopping in the one submarket where everything is still a feeding frenzy (South Bay, premium Westside), you have leverage. Use it.
                  </p>
                  <p>
                    <strong>For sellers:</strong> If you price like it&apos;s 2022, you&apos;re going to donate 60 days of your life to Zillow saves and open houses. Price to market reality.
                  </p>
                  <p>
                    <strong>For investors:</strong> Underwrite like a pessimist and operate like a pro. The market is still there — it just punishes sloppy deals now.
                  </p>
                </div>
              </div>

              {/* Strong CTA Section */}
              <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <h2 className="text-3xl font-bold text-primary mb-4 text-center">
                  Want to Analyze LA Properties?
                </h2>

                <p className="text-center text-lg mb-4">
                  Use our AI-powered analysis tools at Dealsletter.io to break down any property with real numbers, ROI projections, and investment scores.
                </p>

                <p className="text-center text-muted mb-8">
                  Not subscribed yet? Get market analysis like this delivered to your inbox. Subscribe to Dealsletter — it&apos;s free. Join 1,700+ investors who rely on us for their edge.
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
                  Join thousands of investors making smarter LA real estate decisions
                </p>
              </div>

              {/* Related Articles */}
              <div className="mt-12 pt-8 border-t border-border/20">
                <h3 className="text-xl font-bold text-primary mb-4">Related Articles</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/blog/la-real-estate-market-2025" className="block p-4 bg-card border border-border/60 rounded-lg hover:border-accent/50 transition-colors">
                    <span className="text-xs text-accent font-medium">Market Analysis</span>
                    <h4 className="font-semibold text-primary mt-1">LA Real Estate Market 2025: Complete Breakdown</h4>
                    <p className="text-sm text-muted mt-2">Our previous LA deep dive with neighborhood breakdowns and investment playbook.</p>
                  </Link>
                  <Link href="/blog/bay-area-housing-eoy-2025" className="block p-4 bg-card border border-border/60 rounded-lg hover:border-accent/50 transition-colors">
                    <span className="text-xs text-accent font-medium">Market Analysis</span>
                    <h4 className="font-semibold text-primary mt-1">Bay Area Housing EOY 2025: All 9 Counties</h4>
                    <p className="text-sm text-muted mt-2">Comprehensive Bay Area analysis comparing all 9 counties with investor strategies.</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
