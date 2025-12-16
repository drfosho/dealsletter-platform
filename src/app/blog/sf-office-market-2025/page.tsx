'use client'

import Link from 'next/link'
import Image from 'next/image'
import BlogNavigation from '@/components/BlogNavigation'

export default function SFOfficeMarket2025Article() {
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
              <span className="text-sm text-muted">Mid-2025</span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">12 min read</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              San Francisco Office Market: Signs of Life in a Struggling Sector
            </h1>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="relative aspect-[5/3] bg-muted/10">
                <Image
                  src="/logos/SF BLOG HEADER.png"
                  alt="San Francisco Office Market Analysis 2025"
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
                  At a Crossroads: Stabilization, Not Recovery
                </h2>
                <p className="text-primary">
                  The San Francisco office market in mid-to-late 2025 sits at a crossroads. After years of sustained vacancy increases and distressed headlines, the sector is showing signs of stabilization — but only in select corners of the market.
                </p>
              </div>

              {/* Vacancy Section */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Vacancy: Historically High, Slowly Stabilizing
                </h2>

                <div className="bg-red-500/5 border-2 border-red-500/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    📊 The Vacancy Reality Check
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Overall vacancy reached <strong>31.6%</strong> in Q2 2025 — seventh consecutive quarter above 30%</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Direct vacancy holds at <strong>27.1%</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Total availability measures <strong>37M square feet</strong></span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    ✅ The Silver Lining: Sublease Space Declining
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Sublease space fell to <strong>6.6M SF</strong> — a 20% YoY decline</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span>Dramatic improvement from 2020&apos;s peak when subleases made up over 40% of available inventory</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span><strong>What this means:</strong> Tenants are either reclaiming space for returning employees or landlords are shifting subleases into direct listings</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>The takeaway:</strong> While supply remains oversaturated, conditions are no longer deteriorating at the same pace.
                  </p>
                </div>
              </div>

              {/* Leasing Momentum Section */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Leasing Momentum: Strongest Run Since 2018
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-primary mb-3">📈 Volume Recovery</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Q1 2025: <strong>3.62M SF</strong> — highest since 2018</li>
                      <li>• Q2 2025: <strong>2.9M SF</strong></li>
                      <li>• YTD: <strong>5.7M SF</strong> — 50% increase vs H1 2024</li>
                    </ul>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-primary mb-3">🎯 Absorption Turns Positive</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Net absorption positive for <strong>3 straight quarters</strong></li>
                      <li>• Total: <strong>1.1M SF</strong> since Q4 2024</li>
                      <li>• First sustained positive run since 2019</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg">
                  <h4 className="font-bold text-primary mb-2">Tenant Mix Analysis</h4>
                  <p className="mb-3">While small tenants dominate (<strong>65% of transactions &lt;5K SF</strong>), there has been a <strong>28.8% increase</strong> in mid-sized deals (25K–50K SF).</p>
                  <p className="text-sm italic">This mix reflects cautious optimism: tenants are still hedging with smaller footprints but mid-sized firms are signaling expansion.</p>
                </div>
              </div>

              {/* AI Section - Highlighted */}
              <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-l-4 border-blue-500 p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  🤖 AI: The Catalyst for Recovery
                </h2>
                <p className="text-primary mb-4">
                  No sector has had more impact than artificial intelligence.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <h4 className="font-bold text-blue-600 mb-2">Historic Demand</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>5M+ SF</strong> leased since 2020</li>
                      <li>• <strong>16M SF</strong> projected by 2030</li>
                      <li>• <strong>800K SF</strong> absorbed in H1 2025 alone</li>
                    </ul>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-600 mb-2">Major Deals</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• OpenAI: <strong>626K SF</strong> in Mission Bay</li>
                      <li>• Anthropic: <strong>247K SF</strong> lease</li>
                      <li>• Majority of positive net absorption</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>💰 The Money Behind It:</strong> Over $100B in venture capital funding for AI companies since 2020, directly translating into hiring and office demand.
                  </p>
                </div>
              </div>

              {/* Flight to Quality Section */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Flight to Quality: A Bifurcated Market
                </h2>
                
                <p className="text-primary mb-4">San Francisco&apos;s office sector is increasingly two markets in one:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border-2 border-green-500/20 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-green-600 mb-3">🏆 Trophy/Class A Assets</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Vacancies at <strong>15.3%</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Commanding <strong>$73–$103 PSF</strong></span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Strong demand for premium "view suites"</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-500/10 border-2 border-red-500/20 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-red-600 mb-3">📉 Secondary Markets</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        <span>Vacancies exceeding <strong>40%</strong> in Yerba Buena</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        <span>High-30% ranges in SOMA</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-600 mr-2">✗</span>
                        <span>Mounting financial distress</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-muted/10 border border-border/20 rounded-lg">
                  <p className="text-sm italic">
                    The divergence suggests value will concentrate in the premium tier while Class B/C properties either undergo conversion or face ongoing decline.
                  </p>
                </div>
              </div>

              {/* Investment Activity Section */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Investment and Sales Activity
                </h2>

                <div className="bg-muted/5 border border-border/20 p-6 rounded-lg mb-4">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    💼 Market Metrics
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">$1.1B</div>
                      <div className="text-sm text-muted">H1 2025 Sales Volume</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">$230-264</div>
                      <div className="text-sm text-muted">PSF Pricing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">6.7%</div>
                      <div className="text-sm text-muted">Cap Rates (up from 5.9%)</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted">
                    San Francisco ranks 6th among top 25 U.S. office markets for transaction volume.
                  </p>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-primary mb-3">
                    ⚠️ Distress Remains Pervasive
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span><strong>35%</strong> of CMBS loans tied to SF office assets flagged distressed</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>Valuation declines of <strong>70–80%</strong> recorded (340 Bryant Street, SF Centre)</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Conversion Policy Section */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  🏗️ Policy: Conversions as a Lifeline
                </h2>
                <p className="text-primary mb-4">
                  San Francisco is aggressively pushing office-to-residential conversions:
                </p>
                
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <h4 className="font-bold text-accent mb-2">Scale of Opportunity</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>1,200</strong> eligible parcels identified across downtown</li>
                      <li>• Potential creation of <strong>61,603 housing units</strong></li>
                    </ul>
                  </div>

                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <h4 className="font-bold text-accent mb-2">Incentives Package</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Ministerial approvals</li>
                      <li>• Fee waivers</li>
                      <li>• Up to 30 years of property tax increment financing</li>
                    </ul>
                  </div>
                </div>
                
                <p className="text-sm italic mt-4">
                  This path offers investors and operators of struggling Class B/C buildings a viable exit strategy, while addressing the city&apos;s severe housing shortage.
                </p>
              </div>

              {/* Outlook Section */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Outlook: Gradual, Selective Recovery
                </h2>
                
                <p className="text-primary mb-4">Looking ahead into 2026, we expect:</p>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-accent font-bold mr-3">1.</span>
                    <span>Vacancy rates to hover near <strong>28–30%</strong>, with improvement contingent on AI absorption and RTO policies</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-accent font-bold mr-3">2.</span>
                    <span>Continued positive absorption driven by high-growth tenants</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-accent font-bold mr-3">3.</span>
                    <span>Investment bifurcation: Trophy/Class A assets remain resilient; distressed Class B/C assets see conversions or steep discounts</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-accent font-bold mr-3">4.</span>
                    <span>Interest rate shifts to play a major role in valuations and refinancing outcomes</span>
                  </div>
                </div>
              </div>

              {/* Bottom Line Box */}
              <div className="bg-primary/10 border-2 border-primary p-8 rounded-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Bottom Line
                </h2>
                <p className="text-primary text-lg mb-4">
                  San Francisco&apos;s office market remains structurally challenged, but for the first time since 2019, there is a credible case for stabilization. Investors who focus on quality assets, distressed acquisitions, or conversion opportunities stand to benefit most in this transitional cycle.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">31.6%</div>
                    <div className="text-sm text-muted">Current Vacancy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">+1.1M SF</div>
                    <div className="text-sm text-muted">Net Absorption (3 Quarters)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">5M+ SF</div>
                    <div className="text-sm text-muted">AI Leasing Since 2020</div>
                  </div>
                </div>
              </div>

              {/* Our Take Section */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500 p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Our Take
                </h2>
                <p className="text-primary mb-3">
                  <strong>It&apos;s still messy.</strong> Vacancy will probably hang above 30% into 2026. But — absorption is finally positive, sublease space is shrinking, and AI + RTO mandates are giving real demand back to the city. If rates cool a bit, this could be the start of a (very uneven) recovery.
                </p>
                <p className="text-primary italic">
                  Curious what others here think — real rebound or just a temporary sugar high?
                </p>
              </div>

              {/* Call to Action */}
              <div className="my-8 p-6 bg-accent/10 border-2 border-accent rounded-lg">
                <h3 className="text-xl font-bold text-primary mb-3">
                  📬 Don&apos;t Miss Out on Real Estate Opportunities
                </h3>
                <p className="text-primary mb-4">
                  If you aren&apos;t already subscribed to DealLetter, you&apos;re missing out on tons of real estate deals. Make sure you get on the list today for free!
                </p>
                <a 
                  href="https://www.dealsletter.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
                >
                  <span>Subscribe to DealLetter</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>

              {/* Closing */}
              <div className="mt-12 pt-8 border-t border-border/20">
                <p className="text-muted italic">
                  The San Francisco office market represents both the challenges and opportunities of modern commercial real estate. While vacancy remains elevated, the combination of AI-driven demand, policy support for conversions, and stabilizing sublease inventory suggests the worst may be behind us. Smart investors are already positioning for the recovery — the question is whether you&apos;ll join them.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}