'use client'

import Link from 'next/link'
import Image from 'next/image'
import BlogNavigation from '@/components/BlogNavigation'

export default function SanDiegoMarket2025Article() {
  return (
    <div className="min-h-screen bg-background">
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
              <span className="text-sm text-muted">December 2024</span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">10 min read</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              San Diego Real Estate 2025: The Market Is Finally Taking a Breath
            </h1>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="relative aspect-[5/3] bg-muted/10">
                <Image
                  src="/logos/SAN DIEGO DEEP DIVE.png"
                  alt="San Diego Real Estate Deep Dive 2026"
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
                  The Market Is Shifting, Not Crashing
                </h2>
                <p className="text-primary">
                  We&apos;ve been working in San Diego real estate for a while now, and honestly, this is the first time in years it feels like the market is catching its breath. Not tanking. Not exploding. Just… shifting into something that actually feels balanced (well, as &quot;balanced&quot; as San Diego ever gets).
                </p>
              </div>

              {/* Current Market Snapshot */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  What&apos;s Actually Happening in the Market Right Now
                </h2>

                {/* Price Cooling */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    🌡️ Prices Are Finally Cooling Off
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Down about <strong>2.8–4.4%</strong> year-over-year</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Median single-family home: <strong>~$1.025M</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Median condo: <strong>~$660K</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span><strong>Reality check:</strong> Not exactly cheap living, but we&apos;re not climbing at the pandemic pace anymore</span>
                    </li>
                  </ul>
                </div>

                {/* Inventory Rising */}
                <div className="bg-primary/5 border-2 border-primary/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    📊 Inventory Is Creeping Up
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Nearly <strong>29% more homes</strong> for sale than this time last year</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Condos/townhomes especially jumped (<strong>38% increase</strong>)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span><strong>What this means:</strong> Buyers actually have choices again</span>
                    </li>
                  </ul>
                </div>

                {/* Days on Market */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    ⏰ Homes Are Sitting Longer
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Average <strong>22–28 DOM</strong> vs. 18 last year</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>That extra week might not sound like much, but in this market it&apos;s a sign the FOMO frenzy is gone</span>
                    </li>
                  </ul>
                </div>

                {/* Competition Level */}
                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    🤝 Offers Are Still Competitive, But Calmer
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Instead of 20 offers and $100K over, seeing <strong>2–3 offers</strong> and maybe a small discount off list</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>The bidding war madness has officially cooled down</span>
                    </li>
                  </ul>
                </div>

                {/* Rental Market */}
                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    💪 Rental Market Is Holding Strong
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Vacancy is just <strong>4.5%</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>Rents are ticking up again (Little Italy 1BRs are <strong>up 23%</strong> from last year)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span><strong>Investment angle:</strong> Strong rental demand = stable cash flow for investors</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* The Affordability Crisis */}
              <div className="bg-red-500/5 border-l-4 border-red-500 p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  The Real Problem: Affordability Is a Joke
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <h4 className="font-bold text-red-600 mb-2">The Numbers Don&apos;t Lie</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Only <strong>12%</strong> of households can afford median-priced home</li>
                      <li>• Need <strong>$266K</strong> annual income for median home</li>
                      <li>• Median household income: <strong>~$100K</strong></li>
                    </ul>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <h4 className="font-bold text-red-600 mb-2">The Gap Is Massive</h4>
                    <p className="text-sm">
                      There&apos;s a <strong>$166K income gap</strong> between what people make and what they need to buy. This is the core issue driving the market dynamics.
                    </p>
                  </div>
                </div>
              </div>

              {/* House Hacking Section */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  House Hacking: The Only Viable Entry Point for Most
                </h2>
                <p className="text-primary mb-4">
                  If you&apos;re a first-time buyer or small-scale investor trying to get into San Diego without lighting your savings on fire, house hacking a 2–4 unit is probably the smartest move in 2025.
                </p>
                
                <h3 className="text-xl font-bold text-primary mb-3">Here&apos;s Why It Works:</h3>
                
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <h4 className="font-bold text-accent mb-2">🏠 FHA Financing Magic</h4>
                    <p>FHA will let you get in for as little as <strong>3.5% down</strong> if you live in one unit. San Diego&apos;s high-cost loan limits mean you can still finance a lot of the duplex–fourplex inventory without going jumbo.</p>
                  </div>

                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <h4 className="font-bold text-accent mb-2">🛡️ Risk Mitigation</h4>
                    <p>You spread your risk — even if one tenant moves out, you&apos;ve still got other units covering part (or most) of your mortgage.</p>
                  </div>

                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <h4 className="font-bold text-accent mb-2">📈 Solid Returns</h4>
                    <p>Cap rates on small multifamily are in the <strong>mid-4% to low-5% range</strong>. While that&apos;s not insane cash flow on day one, it&apos;s stable. Vacancy is hovering around <strong>5%</strong>, which is solid.</p>
                  </div>

                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <h4 className="font-bold text-accent mb-2">🏗️ ADU Opportunity</h4>
                    <p>You can add one or two ADUs on many multifamily lots and boost gross rents by <strong>$2,200–$3,000 per unit</strong>.</p>
                  </div>

                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <h4 className="font-bold text-accent mb-2">💎 Value-Add Play</h4>
                    <p>The real juice is in value-add: renovate, re-tenant at market, maybe build ADUs, then refinance in 12–24 months once the NOI bumps.</p>
                  </div>
                </div>
              </div>

              {/* Target Submarkets */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Where to Look: The Smart Money Submarkets
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-primary mb-3">South Bay Opportunities</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">📍</span>
                        <span><strong>Chula Vista</strong> - Better per-unit pricing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">📍</span>
                        <span><strong>National City</strong> - Most upside potential</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-primary mb-3">East County Value</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-accent mr-2">📍</span>
                        <span><strong>El Cajon</strong> - Less competition from luxury supply</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2">📍</span>
                        <span><strong>Mid-City areas</strong> - Stable workforce rental demand</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Pro tip:</strong> It&apos;s not magic — you&apos;ve gotta run conservative numbers and account for higher insurance/maintenance. But compared to trying to buy a $1M SFH right now? House hacking actually pencils.
                  </p>
                </div>
              </div>

              {/* Investment Strategy Section */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  On the Investment Side: Where the Smart Money Is Going
                </h2>

                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-primary mb-3">
                      🏘️ Small Multifamily (2–4 units)
                    </h3>
                    <p>Still the cash flow sweet spot with <strong>4.5–5.8% cap rates</strong>. These properties offer the best balance of manageable scale and solid returns.</p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-primary mb-3">
                      📈 Emerging Areas
                    </h3>
                    <p>Places like <strong>Barrio Logan</strong>, <strong>Encanto</strong>, and <strong>National City</strong> have the most upside IMO. These areas are seeing infrastructure investment and gentrification pressure.</p>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-primary mb-3">
                      🏖️ Short-Term Rentals
                    </h3>
                    <p>Still printing money if you&apos;re in a permitted zone — but the city&apos;s capping supply hard. If you can get permitted, the returns are exceptional.</p>
                  </div>
                </div>
              </div>

              {/* The Wild Card */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500 p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  The Wild Card: Interest Rates
                </h2>
                <p className="text-primary">
                  If we slide into the low 6% range next year like some forecasts say, I think we see a mini feeding frenzy again, which could squeeze inventory and nudge prices back up. This is the X-factor that could change everything quickly.
                </p>
              </div>

              {/* Bottom Line */}
              <div className="bg-primary/10 border-2 border-primary p-8 rounded-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  The Bottom Line: Calm But Competitive
                </h2>
                <p className="text-primary text-lg mb-4">
                  So yeah… my take is that we&apos;re in this weird &quot;calm but competitive&quot; phase. Not enough pain to spook sellers, not enough bargains for buyers to high-five over — but the window is open if you&apos;re strategic.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">2-3</div>
                    <div className="text-sm text-muted">Offers per property (vs 20+)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">29%</div>
                    <div className="text-sm text-muted">More inventory YoY</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">4.5%</div>
                    <div className="text-sm text-muted">Vacancy rate</div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="my-8 p-6 bg-muted/5 border border-border/20 rounded-lg">
                <h3 className="text-xl font-bold text-primary mb-4">
                  🎯 Your Action Plan for 2025
                </h3>
                <ol className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-accent font-bold mr-2">1.</span>
                    <span><strong>If buying:</strong> Consider house hacking a duplex or fourplex with FHA financing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent font-bold mr-2">2.</span>
                    <span><strong>Target areas:</strong> Focus on Chula Vista, El Cajon, National City, or Mid-City for better value</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent font-bold mr-2">3.</span>
                    <span><strong>Run conservative numbers:</strong> Account for higher insurance and maintenance costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent font-bold mr-2">4.</span>
                    <span><strong>Watch interest rates:</strong> A drop to low 6% could reignite competition quickly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent font-bold mr-2">5.</span>
                    <span><strong>Move strategically:</strong> This balanced market won&apos;t last forever</span>
                  </li>
                </ol>
              </div>

              {/* Closing */}
              <div className="mt-12 pt-8 border-t border-border/20">
                <p className="text-muted italic">
                  The San Diego market is giving us a rare moment to catch our breath. Use it wisely. Whether you&apos;re looking to house hack your way into homeownership or add to your investment portfolio, the opportunities are there — you just need to know where to look and how to structure the deal.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}