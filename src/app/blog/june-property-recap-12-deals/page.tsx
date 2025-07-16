'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function JunePropertyRecapArticle() {
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
              <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-sm font-medium">
                Deal Recap
              </span>
              <span className="text-sm text-muted">December 28, 2024</span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">8 min read</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              June Property Recap — 12 Killer Real Estate Deals We Broke Down (And Where They Stand Now)
            </h1>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="relative aspect-[5/3] bg-muted/10">
                <Image
                  src="/logos/article 3.png"
                  alt="Property Deals Recap"
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
                What's sold. What's pending. What's still available, and what this tells us about where the market is headed.
              </p>

              <p>Here's the details:</p>

              {/* Deal Grid */}
              <div className="grid grid-cols-1 gap-6 my-12">
                {/* Deal 1 */}
                <div className="bg-card rounded-lg border border-border/60 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">1. San Francisco BRRRR / Flip</h3>
                      <p className="text-sm text-muted">409–413 Tehama St</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-medium">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">
                    A classic SOMA duplex with a massive garage, priced $841K below value. The upside was real: vacant unit, income from the other, and ARV comps well into the mid-$1Ms.
                  </p>
                  <div className="text-lg font-semibold text-green-600">ROI: 143%</div>
                </div>

                {/* Deal 2 */}
                <div className="bg-card rounded-lg border border-border/60 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">2. Walnut Creek Cosmetic Flip</h3>
                      <p className="text-sm text-muted">1801 San Luis Rd</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-medium">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">
                    One-story layout, bonus suite, no major repairs, and picked up $50K under asking.
                  </p>
                  <div className="text-lg font-semibold text-green-600">ROI: 48%</div>
                </div>

                {/* Deal 3 */}
                <div className="bg-card rounded-lg border border-border/60 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">3. Tampa Extensive Rehab Flip</h3>
                      <p className="text-sm text-muted">2914 N 17th St</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-medium">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">
                    Just $61 per sq. ft. for a 2,960 sq. ft. home on two parcels. Rehab-heavy but packed with upside.
                  </p>
                  <div className="text-lg font-semibold text-green-600">ROI: 312%</div>
                </div>

                {/* Deal 4 */}
                <div className="bg-card rounded-lg border border-border/60 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">4. San Jose Light Flip</h3>
                      <p className="text-sm text-muted">82 Hollywood Ave</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">
                    Fully cosmetic. Great layout, near Google Village. Still available and move-in ready post-flip.
                  </p>
                  <div className="text-lg font-semibold text-green-600">ROI: 100%</div>
                </div>

                {/* Deal 5 */}
                <div className="bg-card rounded-lg border border-border/60 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">5. San Diego House Hack with 2.75% VA Loan</h3>
                      <p className="text-sm text-muted">535 60th St</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">
                    Newer construction. House + ADU. The assumable VA loan makes the numbers insane.
                  </p>
                  <div className="text-lg font-semibold text-accent">Cap Rate: 5.64%</div>
                </div>

                {/* Deal 6 */}
                <div className="bg-card rounded-lg border border-border/60 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">6. San Diego BRRRR + Expansion Strategy</h3>
                      <p className="text-sm text-muted">3026–28 Comstock St</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3">
                    RM-1-1 zoning allows a 3rd unit. $260K back on refi + $160K in built-in equity.
                  </p>
                  <div className="text-sm text-muted">Cash-on-cash: strong. Long-term hold: even stronger.</div>
                </div>
              </div>

              {/* Continue with more deals... */}
              <div className="bg-accent/10 rounded-lg p-6 border border-accent/20 my-8">
                <h3 className="text-xl font-semibold text-primary mb-4">Deals 7-12 Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm"><strong>7. Oakland BRRRR Duplex</strong> - 10711 Russet St (Active) - ROI: 166%</p>
                    <p className="text-sm"><strong>8. Lee's Summit Flip</strong> - 4407 SW Briarbrook Dr (Active) - ROI: 85%</p>
                    <p className="text-sm"><strong>9. Warrensburg BRRRR/Flip</strong> - 603 Broad St (Pending) - COC: 18.5%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>10. Kansas City Duplex</strong> - 2105/07 Askew Ave (Active) - Cap Rate: 12.8%</p>
                    <p className="text-sm"><strong>11. Indianapolis Group Home</strong> - 5222 E Washington St (Fully Rented) - Cap Rate: 8.7%</p>
                    <p className="text-sm"><strong>12. Kansas City 67-Unit</strong> - 3000 E 49th St (Active) - IRR: 18%+</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">What We Learned from June:</h2>
              
              <div className="bg-card rounded-lg border border-border/60 p-6 my-6">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-accent">•</span>
                    <span>Deals under $200K and over $1M are moving the fastest</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-accent">•</span>
                    <span>Cosmetic flips continue to outperform, especially in desirable neighborhoods</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-accent">•</span>
                    <span>Turnkey BRRRRs with rent-ready units are in high demand</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-accent">•</span>
                    <span>Creative value-add strategies (like zoning plays and house hacks) are the strongest long-term wealth builders</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Want deals like this before they hit the market?</h2>
              
              <p>Free version is stacked, and always here! Want more? $12/mo or $99/year!</p>

              <div className="bg-primary/10 rounded-lg p-6 border border-primary/20 my-8">
                <h3 className="text-lg font-semibold text-primary mb-3">Dealsletter PRO was built for serious investors who want to move faster, analyze smarter, and stop wasting time on bad deals.</h3>
                
                <div className="space-y-2 text-sm">
                  <p>With PRO, you'll get:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• 2–3x more vetted BRRRRs, flips, and house hacks each week</li>
                    <li>• Early access to exclusive off-market deals before they go public</li>
                    <li>• Full transparency: every deal includes ARV logic, COC, DSCR, rehab cost, refinance math, and rental projections</li>
                    <li>• A personalized deal analysis from our lead underwriter</li>
                    <li>• Access to our Premium Discord with real-time alerts and deal discussions</li>
                    <li>• Our full investor guidebook (instant download)</li>
                    <li>• Priority email support from our team</li>
                    <li>• And a 14-day no-questions-asked refund policy</li>
                  </ul>
                </div>
              </div>

              <p className="text-lg font-semibold text-primary">If you're trying to build a real portfolio, this is the edge.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-primary/5 rounded-xl border border-primary/20 p-8 text-center">
            <h3 className="text-2xl font-semibold text-primary mb-3">
              Ready for Exclusive Deal Access?
            </h3>
            <p className="text-muted mb-6">
              Join Dealsletter to get pre-vetted deals with full financial analysis before they hit the market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Start Analyzing Deals
              </Link>
              <a 
                href="https://dealsletter.io/upgrade"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
              >
                Upgrade to PRO
              </a>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-primary mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/blog/real-state-housing-2025" className="group">
                <div className="bg-card rounded-lg border border-border/60 p-6 hover:shadow-lg transition-all duration-300">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                    Market Analysis
                  </span>
                  <h4 className="text-lg font-semibold text-primary mt-3 mb-2 group-hover:text-accent transition-colors">
                    The Real State of Housing in 2025
                  </h4>
                  <p className="text-muted text-sm">
                    Why this correction will unlock the best buying opportunities in over a decade.
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
                    How Missouri's capital gains tax elimination creates new opportunities.
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