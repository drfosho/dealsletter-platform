'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function RealStateHousingArticle() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-3 bg-background/80 backdrop-blur-xl z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="relative">
                <Image 
                  src="/logos/Footer2.svg" 
                  alt="Dealsletter Logo" 
                  width={400}
                  height={100}
                  className="h-16 md:h-20 w-auto"
                  priority
                />
                <div className="absolute top-1 md:top-2 -right-1 w-2 md:w-2.5 h-2 md:h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link href="/blog" className="px-6 py-3 text-primary transition-colors font-medium">
              Blog
            </Link>
            <Link href="/contact" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Contact
            </Link>
            <Link href="/faq" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              FAQ
            </Link>
            <Link href="/auth/login" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium">
              Log In
            </Link>
            <Link href="/auth/signup" className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Start Analyzing Deals
            </Link>
          </div>
        </div>
      </nav>

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
              <span className="text-sm text-muted">December 27, 2024</span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">7 min read</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              The Real State of Housing in 2025 (And Why We&apos;re Still Buying)
            </h1>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="relative aspect-[5/3] bg-muted/10">
                <Image
                  src="/logos/article 1 (1).png"
                  alt="Housing Market Analysis 2025"
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
                Last week, I was reviewing the latest Case-Shiller data and something stopped me cold: the inflation-adjusted home price index hit <strong>299.9</strong>. That&apos;s not just higher than 2020. It&apos;s <strong>higher than 2006</strong> &mdash; by a wide margin.
              </p>

              <p>Everyone&apos;s throwing around the word &quot;bubble.&quot; And I get it. There are serious warning signs flashing red &mdash; affordability at record lows, price cuts ramping up, and homebuilder sentiment in free fall.</p>

              <p>But here&apos;s the truth I&apos;m seeing: <strong>This isn&apos;t 2008.</strong> And for strategic investors, this correction is going to unlock some of the best buying opportunities we&apos;ve seen in over a decade.</p>

              <p>Let&apos;s break it down.</p>

              <div className="bg-accent/10 rounded-lg p-6 border border-accent/20 my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">Personal Take: I&apos;ve Seen This Movie Before &mdash; But the Ending Is Different</h2>
                <p>I started digging into real estate after the 2008 collapse, and I&apos;ve been tracking market psychology ever since. The fear right now is real &mdash; I&apos;ve felt it too. But it&apos;s also familiar.</p>
                
                <div className="mt-4">
                  <p className="font-semibold text-primary mb-2">The difference this time?</p>
                  <ul className="space-y-1">
                    <li>• Lending is tighter.</li>
                    <li>• Credit scores are higher.</li>
                    <li>• Supply is finally starting to catch up in overheated markets.</li>
                  </ul>
                </div>
                
                <p className="mt-4">And yet &mdash; <strong>investor opportunity is exploding</strong>, especially in markets like Florida, Arizona, and Texas where the post-COVID sugar high is wearing off.</p>
              </div>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">What the Data Actually Says: A Tale of Two Markets</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                <div className="bg-red-500/10 rounded-lg p-6 border border-red-500/20">
                  <h3 className="text-lg font-semibold text-primary mb-3">1. Affordability Has Collapsed</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Median monthly housing cost is now <strong>$2,412</strong></li>
                    <li>• You need <strong>$116,986</strong> in income to buy the average U.S. home — up nearly <strong>50% since 2020</strong></li>
                    <li>• In California? Try <strong>$234,000</strong> just to break in</li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-primary mb-3">2. Inventory Is Surging</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Inventory is up <strong>31.5% year-over-year</strong></li>
                    <li>• Active listings finally passed <strong>1 million</strong> for the first time since 2019</li>
                    <li>• Some Sunbelt cities (Austin, Phoenix, Tampa) are seeing <strong>price cuts on 30%+ of listings</strong></li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/20">
                  <h3 className="text-lg font-semibold text-primary mb-3">3. Builders Are Pulling Back Hard</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Builder sentiment is at the lowest levels since 2012</li>
                    <li>• Spec homes are sitting — <strong>385,000 unsold units</strong>, the most since the GFC</li>
                  </ul>
                </div>
              </div>

              <p>All of this paints a clear picture: <strong>We&apos;re in a correction. Not a crash.</strong></p>

              <p>But corrections are where <strong>real investors make their moves.</strong></p>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Where the Opportunity Is (and Isn&apos;t)</h2>
              
              <p>Here&apos;s where I&apos;m focusing with Dealsletter:</p>

              <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20 my-6">
                <h3 className="text-lg font-semibold text-primary mb-3">✅ Distressed Submarkets in the Sunbelt</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Think outer-ring suburbs of Phoenix, Tampa, Austin &mdash; places with 20-25% price corrections</li>
                  <li>• Great for cash-flow BRRRRs or 12-18 month flips with forced appreciation</li>
                </ul>
              </div>

              <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20 my-6">
                <h3 className="text-lg font-semibold text-primary mb-3">✅ Undervalued Multifamily in Secondary Cities</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Kansas City, Indianapolis, Memphis &mdash; supply-constrained but still affordable</li>
                  <li>• Cap rates still make sense. Rents are sticky. Good operators will win.</li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/20 my-6">
                <h3 className="text-lg font-semibold text-primary mb-3">⚠️ Avoid High-Flying Luxury Without a Plan</h3>
                <ul className="space-y-2 text-sm">
                  <li>• West Coast flips still work &mdash; but only if you have the team and comps dialed in</li>
                  <li>• Don&apos;t speculate. Underwrite everything conservatively with a 10-15% drop buffer</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">5 Moves Investors Should Make Right Now</h2>
              
              <div className="bg-card rounded-lg border border-border/60 p-6 my-6">
                <ol className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</span>
                    <div>
                      <strong className="text-primary">Build your watchlist of price-cut markets</strong> &mdash; Track cities where 20%+ of listings have reductions. That&apos;s where pain (and deals) are coming.
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</span>
                    <div>
                      <strong className="text-primary">Line up financing flexibility</strong> &mdash; Hard money lenders, DSCR loans, HELOCs. Get liquid or get left behind.
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</span>
                    <div>
                      <strong className="text-primary">Partner with local experts</strong> &mdash; Don&apos;t fly blind. Agents, GCs, PMs are your eyes and ears in unfamiliar markets.
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">4</span>
                    <div>
                      <strong className="text-primary">Get conservative with underwriting</strong> &mdash; Bake in higher holding costs, longer days on market, and refinance rates around 6.5%-7%.
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">5</span>
                    <div>
                      <strong className="text-primary">Subscribe to sources that cut through noise</strong> &mdash; (That&apos;s why we created Dealsletter &mdash; to deliver underwritten, real deals, not hype.)
                    </div>
                  </li>
                </ol>
              </div>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Final Word: The Next 12 Months Are for Builders (Not Bystanders)</h2>
              
              <p>We are entering the <strong>great reset</strong> of the housing market. And while it won&apos;t be easy, it will be <strong>lucrative</strong> for those who move smart and early.</p>

              <p>The headlines will scream &quot;bubble.&quot; But smart investors will recognize the pattern: prices correcting in frothy areas, demand getting priced back in, and inventory finally returning to normal.</p>

              <p className="text-lg font-semibold text-primary">Don&apos;t wait for the bottom to be obvious. That&apos;s when the deals are already gone.</p>

              <blockquote className="border-l-4 border-accent pl-6 py-4 my-8 bg-accent/5 rounded-r-lg">
                <p className="text-lg text-primary">👉 What opportunities are you seeing in your local market? Drop a comment &mdash; let&apos;s talk shop.</p>
              </blockquote>

              <p>And if you want to see what I&apos;m personally tracking each week, head to <a href="https://www.dealsletter.io" className="text-accent hover:text-accent/80" target="_blank" rel="noopener noreferrer">www.dealsletter.io</a> and join the list.</p>

              <p className="text-lg font-semibold text-primary">Let&apos;s ride this cycle the right way &mdash; together.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-primary/5 rounded-xl border border-primary/20 p-8 text-center">
            <h3 className="text-2xl font-semibold text-primary mb-3">
              Navigate the Market Reset With Expert Analysis
            </h3>
            <p className="text-muted mb-6">
              Join Dealsletter to get weekly market insights and pre-vetted opportunities in the correction markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Start Analyzing Deals
              </Link>
              <a 
                href="https://dealsletter.io"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
              >
                Subscribe to Newsletter
              </a>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-primary mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/blog/june-property-recap-12-deals" className="group">
                <div className="bg-card rounded-lg border border-border/60 p-6 hover:shadow-lg transition-all duration-300">
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-xs font-medium">
                    Deal Recap
                  </span>
                  <h4 className="text-lg font-semibold text-primary mt-3 mb-2 group-hover:text-accent transition-colors">
                    June Property Recap — 12 Killer Real Estate Deals
                  </h4>
                  <p className="text-muted text-sm">
                    What&apos;s sold, what&apos;s pending, and what this tells us about the market.
                  </p>
                </div>
              </Link>
              
              <Link href="/blog/missouri-capital-gains-elimination" className="group">
                <div className="bg-card rounded-lg border border-border/60 p-6 hover:shadow-lg transition-all duration-300">
                  <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                    Tax Strategy
                  </span>
                  <h4 className="text-lg font-semibold text-primary mt-3 mb-2 group-hover:text-accent transition-colors">
                    Missouri Just Changed the Game for Investors
                  </h4>
                  <p className="text-muted text-sm">
                    How Missouri&apos;s capital gains tax elimination creates opportunities.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}