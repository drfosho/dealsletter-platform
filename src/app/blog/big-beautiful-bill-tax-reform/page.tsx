'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function BigBeautifulBillArticle() {
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
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-sm font-medium">
                Policy Update
              </span>
              <span className="text-sm text-muted">November 19, 2024</span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">6 min read</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              The &quot;One Big, Beautiful Bill&quot; Just Passed &mdash; What It Means for Investors, Founders, and People
            </h1>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="relative aspect-[5/3] bg-muted/10">
                <Image
                  src="/logos/article 2.png"
                  alt="Tax Reform Legislation"
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
                On May 22, the House passed what they&apos;re calling the &quot;One Big, Beautiful Bill&quot;&mdash;a sweeping tax reform that could reshape the game for entrepreneurs, investors, and working-class families alike.
              </p>

              <p>As the founder of Dealsletter and an active real estate investor, I&apos;ve spent the last 48 hours diving deep into this bill. Here&apos;s what actually matters:</p>

              <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20 my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">Business Owners Win Big</h2>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600">•</span>
                    <span>The 199A QBI deduction just got juiced&mdash;from 20% to 23%, and it&apos;s permanent now.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600">•</span>
                    <span>100% bonus depreciation is back from 2025–2028, letting us write off the full cost of eligible business assets immediately.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-green-600">•</span>
                    <span>Section 179 just doubled. Now you can expense $2M instantly, with a $4M phase-out limit.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-accent/10 rounded-lg p-6 border border-accent/20 my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">Real Estate Investors: Pay Attention</h2>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-accent">•</span>
                    <span>Bonus depreciation applies to qualified improvements again. Big for value-add strategies.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-accent">•</span>
                    <span>Opportunity Zones are getting beefed up with new zones, higher deferrals, and extra incentives for rural plays.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-accent">•</span>
                    <span>While 1031 wasn&apos;t touched, exchanges will heat up&mdash;especially as rate cuts approach.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/20 my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">Everyday Workers</h2>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-600">•</span>
                    <span>Overtime and tipped wages are temporarily tax-free (yes, you read that right).</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-600">•</span>
                    <span>SALT deduction cap raised to $40K—huge for folks in high-tax states like CA and NY.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-600">•</span>
                    <span>Child tax credit jumps to $2,500, and seniors get a $4K write-off.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-blue-600">•</span>
                    <span>Standard deduction gets a temporary bump ($30K for couples filing jointly).</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/20 my-8">
                <h2 className="text-2xl font-bold text-primary mb-4">Estate & Wealth Strategy</h2>
                <p>The estate tax exemption doubles to <strong>$15M per person</strong> starting in 2026. That&apos;s generational wealth planning unlocked.</p>
              </div>

              <div className="bg-red-500/10 rounded-lg p-6 border border-red-500/20 my-8">
                <p className="text-lg font-semibold text-primary">
                  But here&apos;s the kicker: this bill adds between <strong>$3.3T and $4.6T to the deficit</strong>. It passed the House, but the Senate&apos;s gonna be a battleground.
                </p>
              </div>

              <p>Whether you&apos;re flipping homes, building a startup, or just grinding a 9-to-5&mdash;these changes affect you.</p>

              <p>At <strong>Dealsletter</strong>, we&apos;re building more than a newsletter. We&apos;re building an ecosystem that makes navigating things like this <em>automatic</em>. If you invest, you need to be paying attention now&mdash;not in 2026 when it&apos;s too late to plan.</p>

              <blockquote className="border-l-4 border-accent pl-6 py-4 my-8 bg-accent/5 rounded-r-lg">
                <p className="text-lg text-primary font-medium">What do you think&mdash;smart tax strategy or political bait-and-switch?</p>
              </blockquote>

              <div className="bg-card rounded-lg border border-border/60 p-6 my-8">
                <h3 className="text-xl font-semibold text-primary mb-4">Key Takeaways for Investors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Immediate Actions:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Review your QBI deduction eligibility</li>
                      <li>• Plan for enhanced bonus depreciation</li>
                      <li>• Consider Opportunity Zone investments</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Long-term Planning:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Estate planning with higher exemptions</li>
                      <li>• Business asset acquisition timing</li>
                      <li>• Tax-loss harvesting strategies</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-primary/5 rounded-xl border border-primary/20 p-8 text-center">
            <h3 className="text-2xl font-semibold text-primary mb-3">
              Stay Ahead of Policy Changes
            </h3>
            <p className="text-muted mb-6">
              Join Dealsletter to get analysis of how tax and policy changes affect your real estate investments.
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
              <Link href="/blog/missouri-capital-gains-elimination" className="group">
                <div className="bg-card rounded-lg border border-border/60 p-6 hover:shadow-lg transition-all duration-300">
                  <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                    Tax Strategy
                  </span>
                  <h4 className="text-lg font-semibold text-primary mt-3 mb-2 group-hover:text-accent transition-colors">
                    Missouri Just Changed the Game for Investors
                  </h4>
                  <p className="text-muted text-sm">
                    How Missouri&apos;s capital gains tax elimination creates new opportunities for investors.
                  </p>
                </div>
              </Link>
              
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}