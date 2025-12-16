'use client'

import Link from 'next/link'
import Image from 'next/image'
import BlogNavigation from '@/components/BlogNavigation'

export default function LAMarketAnalysisArticle() {
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
              <span className="text-sm text-muted">January 3, 2025</span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">10 min read</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              Buying, investing, or just curious? Here is a no BS breakdown for the LA real estate market
            </h1>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="relative aspect-[5/3] bg-muted/10">
                <Image
                  src="/logos/la real estate article.png"
                  alt="LA Real Estate Market Analysis 2025"
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
                I&apos;ve been neck-deep researching the LA housing market lately. Not for clicks. Not to sell a course. Just because I&apos;m obsessed with real estate, tech, and understanding how the market actually works. This is for my own benefit and figured I&apos;d share it like I usually do.
              </p>

              <p>I&apos;m also building something around this space, so I&apos;m constantly gathering as much info as I can to stay sharp and help others navigate it better.</p>

              {/* TLDR Section */}
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 my-8">
                <h2 className="text-xl font-bold text-primary mb-4">TLDR:</h2>
                <ul className="space-y-2 text-muted">
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Median home price in LA City is around <strong className="text-primary">$876,000</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Year-over-year growth sits between <strong className="text-primary">2.8% and 3.8%</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Nearly half of all homes are selling <strong className="text-primary">below asking</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Inventory is climbing, but still tight historically</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Multifamily and industrial are the investor darlings right now</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    <span>Mortgage rates are still high (~6.7%), keeping demand in check</span>
                  </li>
                </ul>
                <p className="mt-4 text-primary font-medium">
                  LA isn&apos;t frozen, but it&apos;s definitely past the panic-buying phase. The leverage has shifted back to the buyer in most cases.
                </p>
              </div>

              {/* Pricing, Inventory, and Buyer Leverage */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-primary mb-4">Pricing, Inventory, and Buyer Leverage</h2>
                
                <p>Properties are sitting longer—averaging <strong className="text-primary">34 to 48 days</strong> on market. Compare that to the 2021 feeding frenzy, and it&apos;s clear buyers have room to breathe.</p>

                <p>Inventory is finally up, hitting over <strong className="text-primary">15,000 active listings</strong> in LA County. Month-over-month, that&apos;s a 4.8% increase. Year-to-date, new listings have jumped 16%. More homeowners are testing the market again now that some feel less &quot;locked-in&quot; by their sub-4% mortgage rates.</p>

                <p className="text-accent font-medium">But it&apos;s still LA. Entry is hard, and real affordability hasn&apos;t returned.</p>
              </div>

              {/* Neighborhood Rundown */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-primary mb-6">Neighborhood Rundown</h2>
                
                {/* Westside */}
                <div className="mb-8 pl-4 border-l-4 border-accent/30">
                  <h3 className="text-xl font-bold text-primary mb-2">Westside (Santa Monica, Brentwood, Pacific Palisades):</h3>
                  <p>High-end is holding up, but not without volatility. Median prices are <strong className="text-primary">$1.8M to $3.5M</strong>. Brentwood homes jumped to $5.1M due to wildfire displacement demand. Some neighborhoods saw price drops, like Pacific Palisades which dipped over 20%.</p>
                </div>

                {/* Eastside */}
                <div className="mb-8 pl-4 border-l-4 border-accent/30">
                  <h3 className="text-xl font-bold text-primary mb-2">Eastside (Lincoln Heights, Boyle Heights, El Sereno):</h3>
                  <p>Still relatively affordable. Prices range <strong className="text-primary">$750K to $850K</strong>. Gentrification continues to push growth here—Lincoln Heights saw over 12% YoY price appreciation. Surprisingly, a majority of homes here still sell over asking.</p>
                </div>

                {/* San Fernando Valley */}
                <div className="mb-8 pl-4 border-l-4 border-accent/30">
                  <h3 className="text-xl font-bold text-primary mb-2">San Fernando Valley:</h3>
                  <p>Good balance of price and stability. Median prices sit between <strong className="text-primary">$903K and $932K</strong> with modest growth. Properties move faster, and investors are pouring into multifamily deals, especially value-add plays.</p>
                </div>

                {/* South Bay */}
                <div className="mb-8 pl-4 border-l-4 border-accent/30">
                  <h3 className="text-xl font-bold text-primary mb-2">South Bay (Torrance, Redondo Beach, Hermosa, Manhattan):</h3>
                  <p>Coastal fundamentals are strong. Torrance leads appreciation with <strong className="text-primary">13.6% YoY growth</strong>. Average time on market is under 30 days. There&apos;s a mix of luxury, live-in flips, and long-term rental upside.</p>
                </div>
              </div>

              {/* Asset Types */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-primary mb-6">Asset Types</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Multifamily */}
                  <div className="bg-muted/5 rounded-xl p-6 border border-border/20">
                    <h3 className="text-lg font-bold text-accent mb-2">Multifamily:</h3>
                    <p className="text-sm">Occupancy is over <strong className="text-primary">95%</strong>. Class B and C properties offer the best value right now. Rent growth is steady, especially in working-class pockets.</p>
                  </div>

                  {/* Single-Family */}
                  <div className="bg-muted/5 rounded-xl p-6 border border-border/20">
                    <h3 className="text-lg font-bold text-accent mb-2">Single-Family:</h3>
                    <p className="text-sm">Performance varies. Smaller homes have dipped slightly in price, while 4-bedroom homes appreciated <strong className="text-primary">4.5%</strong>. The build-to-rent trend is alive, mostly in areas like the Inland Empire.</p>
                  </div>

                  {/* Condos */}
                  <div className="bg-muted/5 rounded-xl p-6 border border-border/20">
                    <h3 className="text-lg font-bold text-accent mb-2">Condos:</h3>
                    <p className="text-sm">Downtown high-rises are oversupplied and underwhelming. Vacancy hovers around <strong className="text-primary">13%</strong>. Lower-tier condos in working-class neighborhoods are doing better.</p>
                  </div>

                  {/* Commercial */}
                  <div className="bg-muted/5 rounded-xl p-6 border border-border/20">
                    <h3 className="text-lg font-bold text-accent mb-2">Commercial:</h3>
                    <p className="text-sm">Office space is still in pain. Vacancy in Downtown LA is over <strong className="text-primary">31%</strong>. Industrial is strong, and retail is steady, especially grocery-anchored centers.</p>
                  </div>
                </div>
              </div>

              {/* Regular Homebuyer Tips */}
              <div className="mt-12 bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-primary mb-4">Regular Homebuyer Tips (Not Just for Investors)</h2>
                
                <p className="mb-4">If you&apos;re not investing and just want a place to live, this market has finally calmed down enough to give you some breathing room. But it&apos;s still tricky. Here&apos;s how to approach it:</p>

                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Take your time. Bidding wars are no longer automatic.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Negotiate hard. A lot of homes are selling under asking.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Get fully underwritten early. Don&apos;t rely on basic pre-approvals.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Inspect everything. Especially for older homes with potential retrofitting needs.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Expand your search. East Side and Valley neighborhoods offer way more value than most coastal areas.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Don&apos;t overlook ADUs. Buying a house with an ADU could give you extra rental income or space for family.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span>Work with someone who knows LA zoning, rent control, and permit laws. It matters more here than in most cities.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">✓</span>
                    <span className="font-bold text-primary">And above all else, if you can house hack... DO IT! That&apos;s how you win in this market.</span>
                  </li>
                </ul>

                <p className="mt-4 text-accent font-medium">Patience and education will serve you better than urgency or FOMO in this cycle.</p>
              </div>

              {/* Investor Takeaways */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-primary mb-6">Investor Takeaways</h2>
                
                <p className="mb-6">If you&apos;re buying in LA as an investor, here&apos;s the broad playbook:</p>

                {/* Investment Tiers */}
                <div className="space-y-6">
                  {/* Under $1M */}
                  <div className="bg-gradient-to-r from-green-500/5 to-green-600/5 rounded-xl p-6 border border-green-500/20">
                    <h3 className="text-lg font-bold text-green-600 mb-3">If you have under $1M:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Look for SFR flips in gentrifying East Side neighborhoods</li>
                      <li>• Consider BRRRR in rent control-exempt areas</li>
                      <li>• Join syndications to access bigger deals</li>
                      <li>• Try ADU plays where local policy supports it</li>
                    </ul>
                  </div>

                  {/* $1M-$5M */}
                  <div className="bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-xl p-6 border border-blue-500/20">
                    <h3 className="text-lg font-bold text-blue-600 mb-3">If you have $1M–$5M:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Target Class B multifamily with cosmetic rehab needs</li>
                      <li>• Look into light industrial near logistics hubs</li>
                      <li>• Mixed-use in transit zones is worth watching</li>
                    </ul>
                  </div>

                  {/* $5M+ */}
                  <div className="bg-gradient-to-r from-purple-500/5 to-purple-600/5 rounded-xl p-6 border border-purple-500/20">
                    <h3 className="text-lg font-bold text-purple-600 mb-3">If you have $5M+:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Trophy assets in prime coastal zip codes still hold</li>
                      <li>• Development deals with entitlements locked are king</li>
                      <li>• Opportunity Zone tax breaks can still be worth the headache</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="mt-12 bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-primary mb-4">Risk Factors to Watch</h2>
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">⚠</span>
                    <span>Insurance costs are up, and some carriers are leaving California entirely</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">⚠</span>
                    <span>Rent control and eviction restrictions make landlording more complicated</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">⚠</span>
                    <span>Wildfire rebuild zones come with red tape and rising costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">⚠</span>
                    <span>Construction and permitting delays in LA will test your patience</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">⚠</span>
                    <span>Refinancing during high-rate cycles can kill BRRRR returns if you didn&apos;t buy right</span>
                  </li>
                </ul>
              </div>

              {/* Final Thoughts */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-primary mb-4">Final Thoughts</h2>
                
                <p>The 2025 LA real estate market is no longer red-hot, but that might be the best thing to happen in a while. There&apos;s room for smarter plays, longer due diligence, and less emotion-driven chaos. But you still need to understand the layers: rent laws, supply trends, zoning, environmental risks.</p>

                <p className="font-medium text-primary">Whether you&apos;re a first-time homebuyer or a long-time investor, this market rewards patience and punishes shortcuts. Know your neighborhood, know your numbers, and don&apos;t chase 2021 returns.</p>
              </div>

              {/* CTA Section */}
              <div className="mt-16 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-8 text-center border border-accent/20">
                <h3 className="text-2xl font-bold text-primary mb-4">Stay Ahead of the LA Market</h3>
                <p className="mb-6">Sign up for DealLetter to stay updated on the latest LA real estate opportunities. Get exclusive access to deals before they hit the mainstream market. Whether you&apos;re looking for flips, BRRRR investments, or house hacks to enter this competitive market, we&apos;ve got you covered!</p>
                <Link 
                  href="/auth/signup" 
                  className="inline-block px-8 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-all transform hover:scale-105"
                >
                  Get Started with DealLetter
                </Link>
              </div>

              {/* Author Bio */}
              <div className="mt-12 pt-8 border-t border-border/20">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <span className="text-accent font-bold">DL</span>
                  </div>
                  <div>
                    <p className="font-medium text-primary">DealLetter Team</p>
                    <p className="text-sm text-muted">Real estate insights, data analysis, and investment opportunities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-background/80 backdrop-blur-xl border-t border-border/20 px-4 py-3 z-40">
        <div className="flex items-center justify-around">
          <Link href="/" className="text-muted hover:text-primary transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <Link href="/blog" className="text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </Link>
          <Link href="/auth/signup" className="text-accent">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}