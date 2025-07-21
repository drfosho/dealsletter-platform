'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function BayAreaRealEstateShift() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-xl">Dealsletter</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
            <Link href="/signup" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <article className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2">
              ← Back to Blog
            </Link>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full">Market Analysis</span>
              <span className="text-muted-foreground">October 15, 2025</span>
              <span className="text-muted-foreground">• 8 min read</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Bay Area Real Estate: The Market Shift Every Investor Must Know
            </h1>

            <div className="aspect-[5/3] relative rounded-lg overflow-hidden">
              <Image
                src="/logos/bay area article header.png"
                alt="Bay Area Real Estate Market Analysis"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="prose prose-lg max-w-none space-y-8">
              <div className="bg-accent/10 dark:bg-accent/20 border-l-4 border-accent p-6 rounded-r-lg">
                <h2 className="text-2xl font-bold mb-4">Executive Summary: The Market Has Shifted</h2>
                <p className="text-lg">
                  The Bay Area real estate market is experiencing its most significant transformation since the pandemic. After years of frenzied seller&apos;s markets, we&apos;re seeing increased inventory, moderate price corrections, and genuine buyer leverage for the first time in years. Here&apos;s what every buyer, seller, and investor needs to know.
                </p>
              </div>

              <section>
                <h2 className="text-3xl font-bold mb-6">County-by-County Breakdown: Where to Focus</h2>
                
                <div className="space-y-6">
                  <div className="bg-muted/30 dark:bg-muted/50 p-6 rounded-lg border border-border/20">
                    <h3 className="text-xl font-bold mb-3">San Francisco County: Luxury Resilience Amid Overall Cooling</h3>
                    <ul className="space-y-2">
                      <li>• Median home price: $1.8M (+7.6% YoY)</li>
                      <li>• Days on market: 13 days (houses) vs 23 days (condos)</li>
                      <li>• <strong>Key insight:</strong> The AI boom is creating a new wealth class driving luxury demand, while overall market moderates</li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 dark:bg-muted/50 p-6 rounded-lg border border-border/20">
                    <h3 className="text-xl font-bold mb-3">Santa Clara County: Silicon Valley Still Leading, But Cooling</h3>
                    <ul className="space-y-2">
                      <li>• Median home value: $1.69M (+7.2% YoY)</li>
                      <li>• Days on market: 9-15 days</li>
                      <li>• Forecast: 3.8% decline expected through April 2026</li>
                      <li>• <strong>Reality check:</strong> Even &quot;cooling&quot; Silicon Valley outperforms most markets</li>
                    </ul>
                  </div>

                  <div className="bg-primary/10 dark:bg-primary/20 border-2 border-primary p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-3">East Bay: The Value Play Everyone&apos;s Missing</h3>
                    <ul className="space-y-2">
                      <li>• Alameda County median: $1.125M (-7.2% YoY)</li>
                      <li>• Inventory surge: +31% active listings</li>
                      <li>• <strong>Why it matters:</strong> Biggest price corrections = biggest opportunities</li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 dark:bg-muted/50 p-6 rounded-lg border border-border/20">
                    <h3 className="text-xl font-bold mb-3">Peninsula (San Mateo): Gradual Normalization</h3>
                    <ul className="space-y-2">
                      <li>• Median sale price: ~$2M (down from $2.1M peak)</li>
                      <li>• Market status: Premium locations holding strong, overall moderating</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-8 rounded-lg">
                <h2 className="text-3xl font-bold mb-6">The East Bay Opportunity: Best Value in the Bay Area</h2>
                <p className="text-lg mb-4">Why the East Bay is the smart money play:</p>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-xl">•</span>
                    <span>Significant price corrections (3-7% vs other regions&apos; gains)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-xl">•</span>
                    <span>30-45% inventory increase = real buyer choice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-xl">•</span>
                    <span>Quality of life improvements in Union City, Newark, Fremont</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-xl">•</span>
                    <span>Long-term appreciation potential as region develops</span>
                  </li>
                </ul>
                <div className="mt-6 p-4 bg-background/50 dark:bg-background/30 rounded-lg">
                  <p className="text-muted-foreground">
                    <strong>The education factor:</strong> While school districts lag Santa Clara County, &quot;up and coming&quot; areas like Union City are perfect for young professionals planning ahead.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6">What&apos;s Driving the Market</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-card dark:bg-card/50 p-6 rounded-lg border border-border/60">
                    <h3 className="text-xl font-bold mb-3 text-primary">The Remote Work Revolution Continues</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• 60% of buyers now request dedicated home offices</li>
                      <li>• Suburban demand sustained even with return-to-office mandates</li>
                      <li>• Commute flexibility becoming premium amenity</li>
                    </ul>
                  </div>

                  <div className="bg-card dark:bg-card/50 p-6 rounded-lg border border-border/60">
                    <h3 className="text-xl font-bold mb-3 text-primary">AI Wealth Creation</h3>
                    <p className="text-sm mb-2">San Francisco&apos;s AI boom is creating a new class of high-income buyers, particularly in:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Mission Bay and SOMA neighborhoods</li>
                      <li>• Luxury market ($5M+) properties</li>
                      <li>• Tech-adjacent Peninsula locations</li>
                    </ul>
                  </div>

                  <div className="bg-card dark:bg-card/50 p-6 rounded-lg border border-border/60">
                    <h3 className="text-xl font-bold mb-3 text-primary">Interest Rate Reality</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Current rates: 6.7-7.0%</li>
                      <li>• Market impact: Significant purchasing power reduction</li>
                      <li>• Opportunity: Motivated sellers offering concessions</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="bg-accent/20 dark:bg-accent/30 p-8 rounded-lg">
                <h2 className="text-3xl font-bold mb-6">Perfect Timing: September-October Sweet Spot</h2>
                <p className="text-lg mb-4">Why fall 2025 is the buyer&apos;s moment:</p>
                <ol className="space-y-3">
                  <li className="flex items-start gap-4">
                    <span className="bg-accent dark:bg-accent/80 text-accent-foreground dark:text-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                    <span>Peak inventory as summer holdouts list properties</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-accent dark:bg-accent/80 text-accent-foreground dark:text-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                    <span>Motivated sellers wanting to close before year-end</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-accent dark:bg-accent/80 text-accent-foreground dark:text-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                    <span>Reduced competition from other buyers</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-accent dark:bg-accent/80 text-accent-foreground dark:text-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">4</span>
                    <span>Maximum negotiation leverage</span>
                  </li>
                </ol>
                <p className="mt-6 text-lg font-semibold">
                  This isn&apos;t just seasonal&mdash;it&apos;s a unique convergence of high inventory and constrained demand.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6">End-of-Year Predictions</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Valuations by December 2025:</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>San Francisco:</span>
                        <span className="font-mono text-red-600 dark:text-red-400">1.8-5.2% decline expected</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Silicon Valley:</span>
                        <span className="font-mono text-red-600 dark:text-red-400">0.2-3.8% decrease likely</span>
                      </li>
                      <li className="flex justify-between">
                        <span>East Bay:</span>
                        <span className="font-mono text-red-600 dark:text-red-400">3-7% additional corrections</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Peninsula:</span>
                        <span className="font-mono text-red-600 dark:text-red-400">2-4% modest adjustments</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-4">Market Dynamics:</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Days on market:</span>
                        <span className="font-mono text-orange-600 dark:text-orange-400">15-25% increase regionwide</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Inventory:</span>
                        <span className="font-mono text-green-600 dark:text-green-400">20-35% more listings than 2024</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Buyer activity:</span>
                        <span className="font-mono text-green-600 dark:text-green-400">Strongest fall market in years</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6">Strategic Recommendations</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4 text-green-700 dark:text-green-300">For Buyers:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Act in September-October for maximum selection and leverage</li>
                      <li>• Focus on East Bay for best value and future appreciation</li>
                      <li>• Negotiate aggressively in this inventory-rich environment</li>
                      <li>• Consider rate buydowns and seller concessions</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-300">For Sellers:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Price realistically given increased competition</li>
                      <li>• List by early September to capture peak fall activity</li>
                      <li>• Prepare for concessions including closing costs and repairs</li>
                      <li>• Professional staging essential in competitive environment</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-300">For Investors:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• East Bay multifamily properties near transit</li>
                      <li>• Cash buyers have significant advantages</li>
                      <li>• Long-term hold strategy positions for rate-driven recovery</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="bg-gradient-to-r from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 p-8 rounded-lg">
                <h2 className="text-3xl font-bold mb-6">Looking Ahead: 5-10 Year East Bay Evolution</h2>
                <p className="text-lg mb-4">The East Bay is positioned for significant transformation:</p>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">📈</span>
                    <span>Population rebound as job diversity increases</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🎓</span>
                    <span>School district improvements driving family investment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🏗️</span>
                    <span>Gentrification acceleration in Union City, Newark</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🚇</span>
                    <span>Infrastructure development boosting property values</span>
                  </li>
                </ul>
                <p className="mt-6 text-lg font-semibold text-primary">
                  Bottom line: Today&apos;s East Bay corrections become tomorrow&apos;s appreciation gains.
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6">Key Takeaways</h2>
                <ol className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="bg-primary dark:bg-primary/80 text-primary-foreground dark:text-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <span className="text-lg">Market has fundamentally shifted toward buyer advantages</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary dark:bg-primary/80 text-primary-foreground dark:text-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <span className="text-lg">Regional divergence creates specific opportunities</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary dark:bg-primary/80 text-primary-foreground dark:text-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <span className="text-lg">East Bay offers best risk-adjusted returns</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary dark:bg-primary/80 text-primary-foreground dark:text-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</span>
                    <span className="text-lg">Timing matters - fall 2025 is optimal entry point</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="bg-primary dark:bg-primary/80 text-primary-foreground dark:text-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">5</span>
                    <span className="text-lg">Rates staying high extends buyer advantages</span>
                  </li>
                </ol>
              </section>

              <section className="bg-muted/50 dark:bg-muted/30 p-8 rounded-lg border-2 border-muted">
                <h2 className="text-3xl font-bold mb-6">The Reality Check</h2>
                <p className="text-lg mb-4">While the Bay Area faces headwinds, fundamental drivers remain intact:</p>
                <ul className="grid md:grid-cols-2 gap-4 text-lg">
                  <li>✓ Limited land supply</li>
                  <li>✓ Strong employment base</li>
                  <li>✓ Lifestyle appeal</li>
                  <li>✓ Tech industry resilience</li>
                </ul>
                <p className="mt-6 text-lg font-semibold">
                  This isn&apos;t a crash&mdash;it&apos;s a rebalancing creating the first real opportunities in years.
                </p>
              </section>

              <div className="bg-primary dark:bg-primary/90 text-primary-foreground p-8 rounded-lg text-center">
                <p className="text-xl font-semibold mb-4">
                  Follow @Dealsletter for more real estate intelligence and investment opportunities.
                </p>
                <Link href="/signup" className="inline-block bg-white dark:bg-gray-900 text-primary dark:text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Join Dealsletter Today
                </Link>
              </div>
            </div>
          </div>

          <section className="mt-16 pt-16 border-t">
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/blog/real-state-housing-2025" className="group">
                <article className="h-full bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src="/logos/ARTICLE 1 (1).png"
                      alt="Real Estate & Housing 2025"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Market Analysis</span>
                    <h3 className="mt-3 font-semibold group-hover:text-primary transition-colors">
                      Real Estate & Housing 2025: Bold Predictions for the Year Ahead
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      What investors, buyers, and sellers need to know about the shifting landscape...
                    </p>
                  </div>
                </article>
              </Link>

              <Link href="/blog/june-property-recap-12-deals" className="group">
                <article className="h-full bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src="/logos/Article 2.png"
                      alt="June Property Recap"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-1 rounded">Deal Recap</span>
                    <h3 className="mt-3 font-semibold group-hover:text-primary transition-colors">
                      June Property Recap: 12 Deals That Define the Summer Market
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      From Miami penthouses to Austin tech campuses, here&apos;s what moved...
                    </p>
                  </div>
                </article>
              </Link>

              <Link href="/blog/missouri-capital-gains-elimination" className="group">
                <article className="h-full bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src="/logos/ARTICLE 4.png"
                      alt="Missouri Capital Gains"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">Policy Update</span>
                    <h3 className="mt-3 font-semibold group-hover:text-primary transition-colors">
                      Missouri&apos;s Capital Gains Elimination: A 15-Minute Deep Dive
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      What every real estate investor needs to know about Amendment 3...
                    </p>
                  </div>
                </article>
              </Link>
            </div>
          </section>
        </article>
      </main>

      <footer className="mt-24 bg-muted/50 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-muted-foreground">© 2025 Dealsletter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}