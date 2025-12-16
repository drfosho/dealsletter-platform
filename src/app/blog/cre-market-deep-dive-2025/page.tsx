'use client'

import Link from 'next/link'
import Image from 'next/image'
import BlogNavigation from '@/components/BlogNavigation'

export default function CREMarketDeepDiveArticle() {
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
              <span className="text-sm text-muted">January 11, 2025</span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">12 min read</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              CRE Market Deep Dive: Office is a bloodbath, industrial holding strong, retail surprisingly stable
            </h1>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="relative aspect-[5/3] bg-muted/10">
                <Image
                  src="/logos/CRE BLOG HEADER.png"
                  alt="Commercial Real Estate Market Analysis 2025"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-muted leading-relaxed space-y-6">
              <p className="text-lg font-medium text-primary">
                Over the past few weeks, the DealLetter team has been digging into national market reports, CMBS data, and broker intel to see where commercial real estate is headed. The short answer? The market is as fragmented as we&apos;ve ever seen it.
              </p>

              <p>
                We&apos;ve analyzed the latest CBRE and JLL reports alongside data from our network of brokers and lenders. Here&apos;s the breakdown:
              </p>

              {/* Office Sector Section */}
              <div className="bg-red-500/5 border-l-4 border-red-500 p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Office sector is a complete shitshow (but hear me out)
                </h2>
                
                <p className="text-primary mb-4">
                  Vacancy just hit <span className="font-bold text-red-500">20.8% nationally</span>, with some markets in free fall:
                </p>

                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span><strong>SF Bay Area:</strong> 28%+ in older Class B buildings</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span><strong>Austin:</strong> 25% and climbing as tech cutbacks ripple through</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span><strong>Dallas Class B:</strong> 22% (overall market around 18%)</span>
                  </li>
                </ul>

                <p className="mb-4">
                  Delinquency rates are at <span className="font-bold text-red-500">11.08%</span> according to CMBS data—meaning a wave of distressed office assets is coming.
                </p>

                <div className="bg-background/50 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Example:</strong> A 180,000 sq. ft. downtown Houston building likely to trade at $45/sq. ft., down from $185/sq. ft. just three years ago. If you have the stomach for risk, the math is getting interesting.
                  </p>
                </div>
              </div>

              {/* Loans Maturing Section */}
              <div className="bg-yellow-500/5 border-l-4 border-yellow-500 p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Loans maturing in 2025
                </h2>
                
                <p className="text-primary mb-4">
                  <span className="font-bold text-yellow-600 text-3xl">$957 billion</span> in CRE loans mature in 2025. That&apos;s not a typo.
                </p>

                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Hotels are getting crushed with <strong>35%</strong> of their loans coming due</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Office is <strong>24%</strong></span>
                  </li>
                </ul>

                <p>
                  My lender buddy told me last week they&apos;re seeing loan modifications left and right because nobody can refi at current rates. Prime + 200-300 bps when these guys originally got prime + 50.
                </p>
              </div>

              {/* Industrial Section */}
              <div className="bg-green-500/5 border-l-4 border-green-500 p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Industrial is holding up better than everything else
                </h2>
                
                <p className="mb-4">
                  Vacancy ticked up to <span className="font-bold text-green-600">8.5%</span> but rent growth is still at <span className="font-bold text-green-600">2.5%</span> - highest among all property types. The thing is, e-commerce is projected to hit 25% of total retail sales by 2025 and that&apos;s driving everything.
                </p>

                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Cleveland&apos;s at <strong>2.6% vacancy</strong> with $4 PSF asking rents</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Nashville and DFW are absolute machines right now</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Even with construction slowing, demand is nuts</span>
                  </li>
                </ul>

                <div className="bg-background/50 p-4 rounded-lg">
                  <p className="font-medium">
                    Cap rates averaging <span className="text-green-600 font-bold">6.4%</span> vs <span className="text-red-500 font-bold">8.9%</span> for office. Do the math.
                  </p>
                </div>
              </div>

              {/* Retail Section */}
              <div className="bg-blue-500/5 border-l-4 border-blue-500 p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Retail has been surprisingly stable
                </h2>
                
                <p className="mb-4">
                  Vacancy around <span className="font-bold text-blue-600">5.2-5.8%</span> depending on format - still among the lowest of any sector.
                </p>

                <p className="mb-4">
                  The weird thing? All those Party City and Rue21 closures actually helped. TJX Companies, Hobby Lobby, and Dollar General are expanding like crazy into those spaces. Grocery-anchored centers are printing money.
                </p>

                {/* Social Proof */}
                <div className="bg-background/50 p-4 rounded-lg mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">JH</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <strong>Jack Hayes</strong> <span className="text-muted">@JackHayesSH • Aug 5</span>
                      </p>
                      <p className="mt-1">
                        Nothing in commercial real estate has pricing power potential like high end retail. Maybe Hotels, but that&apos;s a much harder way to make a dollar.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-background/50 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Example:</strong> A strip mall in suburban Phoenix trading at a 7.2% cap, anchored by Kroger with 12 years left. Sometimes boring wins.
                  </p>
                </div>
              </div>

              {/* Multifamily Section */}
              <div className="bg-purple-500/5 border-l-4 border-purple-500 p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Multifamily is where it gets interesting
                </h2>
                
                <p className="mb-4">
                  Net absorption hit <span className="font-bold text-purple-600">100,600 units</span> in Q1 - highest Q1 since 2000. But here&apos;s the kicker: housing affordability crisis is driving rental demand like I&apos;ve never seen.
                </p>

                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Austin and Phoenix are still digesting 2024 oversupply</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Dallas-Fort Worth and Atlanta are absolutely eating</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Rent growth back to <strong>1.7% nationally</strong> and accelerating</span>
                  </li>
                </ul>

                {/* Social Proof */}
                <div className="bg-background/50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">RH</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <strong>Robbie Hendricks</strong> <span className="text-muted">@roberthendricks • Jul 16</span>
                      </p>
                      <p className="mt-1">
                        My sister is the CFO of a multifamily firm that owns and manages 35k units. Asked her for an update - they&apos;re building like crazy. New deals in Seattle, Denver, Boca, Orlando, Boston. Their thesis is simple: renter nation is here.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Centers Section */}
              <div className="bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border-l-4 border-cyan-500 p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  The sector nobody&apos;s talking about: Data centers
                </h2>
                
                <p className="mb-4">
                  This is where the real money is moving. <span className="font-bold text-cyan-600">1.6% vacancy rate</span>. <span className="font-bold text-cyan-600 text-xl">THIRTY-FIVE TO FORTY-FOUR PERCENT</span> rent growth since 2021.
                </p>

                <p className="mb-4">
                  AI revolution + cloud computing + 5G deployment = perfect storm. Cap rates at <span className="font-bold">5.8%</span> and dropping.
                </p>

                <div className="bg-background/50 p-4 rounded-lg">
                  <p>
                    I know a guy who bought a data center in Northern Virginia last year for $180M. Just got an unsolicited offer for $275M.
                  </p>
                </div>
              </div>

              {/* What We're Doing Section */}
              <div className="my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  What we&apos;re actually doing with the money:
                </h2>

                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">📊</span>
                    <span>Watching office distress - not buying yet but man, some of these deals are tempting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">🏭</span>
                    <span>Still heavy on industrial - especially last-mile delivery in Sun Belt markets</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">🏨</span>
                    <span>Eyeing hotel plays - occupancy back to 63%, ADR around $160. Extended stay is killing it</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">🚫</span>
                    <span>Zero new development unless it&apos;s shovel-ready with locked financing</span>
                  </li>
                </ul>
              </div>

              {/* Key Numbers Section */}
              <div className="bg-gradient-to-r from-red-500/5 to-orange-500/5 border-l-4 border-orange-500 p-6 rounded-r-lg my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  The numbers that keep us up at night:
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background/50 p-4 rounded-lg">
                    <p className="text-sm text-muted mb-1">Commercial mortgage rates:</p>
                    <ul className="space-y-1">
                      <li className="text-sm">• Multifamily: <strong>5.34%</strong></li>
                      <li className="text-sm">• Industrial/Office/Retail: <strong>6.38%</strong></li>
                      <li className="text-sm">• Hotels: <strong>7.50%</strong></li>
                    </ul>
                  </div>
                  
                  <div className="bg-background/50 p-4 rounded-lg">
                    <p className="text-sm text-muted mb-1">CMBS delinquencies:</p>
                    <ul className="space-y-1">
                      <li className="text-sm">• Overall: <strong>7.13%</strong></li>
                      <li className="text-sm">• Office: <strong className="text-red-500">10.3%</strong></li>
                    </ul>
                  </div>
                </div>

                <div className="bg-background/50 p-4 rounded-lg mt-4">
                  <p className="text-sm">
                    Private equity sitting on <span className="font-bold text-orange-600 text-lg">$350B+</span> in dry powder waiting for the bottom
                  </p>
                </div>
              </div>

              {/* Conclusion */}
              <div className="mt-12 p-6 bg-muted/5 rounded-lg border border-border/20">
                <p className="text-lg font-medium text-primary mb-4">
                  This is the most bifurcated CRE market we&apos;ve seen in 15+ years. You&apos;re either buying trophy assets at premium pricing—or scooping up distress. The middle ground is thin.
                </p>

                <p className="text-primary font-medium mb-4">
                  What are you seeing out there?
                </p>

                <p>
                  Are you actively pursuing office right now? Any surprising retail trends locally? Drop your observations in the comments or DM us.
                </p>
              </div>

              {/* Strong CTA Section */}
              <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <h2 className="text-3xl font-bold text-primary mb-4 text-center">
                  Stay ahead of the market
                </h2>
                
                <p className="text-center text-lg mb-8">
                  Get data-backed CRE insights and hand-picked investment opportunities delivered directly to your inbox—free.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/auth/signup" 
                    className="px-8 py-4 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-all font-medium text-center text-lg"
                  >
                    Start Your Free Analysis
                  </Link>
                  <Link
                    href="/analysis"
                    className="px-8 py-4 bg-accent text-secondary rounded-lg hover:bg-accent/90 transition-all font-medium text-center text-lg"
                  >
                    Start Analyzing Properties
                  </Link>
                </div>

                <p className="text-center text-sm text-muted mt-6">
                  Join 1,000+ investors getting smarter about commercial real estate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}