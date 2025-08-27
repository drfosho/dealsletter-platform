'use client'

import Link from 'next/link'
import Image from 'next/image'
import BlogNavigation from '@/components/BlogNavigation'

export default function MissouriCapitalGainsArticle() {
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
              <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm font-medium">
                Tax Strategy
              </span>
              <span className="text-sm text-muted">November 18, 2024</span>
              <span className="text-sm text-muted">•</span>
              <span className="text-sm text-muted">4 min read</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              Missouri Just Changed the Game for Investors&mdash;Here&apos;s What It Means for You
            </h1>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden">
              <div className="relative aspect-[5/3] bg-muted/10">
                <Image
                  src="/logos/article 4.png"
                  alt="Missouri Tax Strategy"
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
                Big news in the world of investing and wealth building&mdash;Missouri is about to become the first state in the nation to <strong>completely eliminate capital gains tax for individuals</strong>. And if you&apos;re paying attention, this isn&apos;t just a tax update&hellip; it&apos;s a massive shift in how smart investors should start thinking about where they do business.
              </p>

              <p>Let&apos;s break down why this matters, and why it&apos;s more than just a policy change.</p>

              <div className="bg-accent/10 rounded-lg p-6 border border-accent/20 my-8">
                <h3 className="text-xl font-semibold text-primary mb-3">What&apos;s Happening?</h3>
                <p>Starting in <strong>2025</strong>, Missourians can deduct <strong>100% of their capital gains income</strong> from their state taxes. That means no state tax on profits from selling real estate, stocks, crypto, or any other assets. Zero. Nada.</p>
                <p className="mt-3">And it doesn&apos;t stop there. Corporations might be next in line if Missouri&apos;s income tax rate drops further. In short, Missouri is planting its flag as <strong>the most investor-friendly state in the country</strong>.</p>
              </div>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Why This Matters for Real Estate Investors</h2>
              
              <p>If you&apos;re in real estate like I am, you know capital gains taxes are one of the biggest hurdles to building long-term wealth. Missouri just knocked that wall down.</p>

              <div className="bg-card rounded-lg border border-border/60 p-6 my-6">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="text-accent">•</span>
                    <span><strong>Selling a flip?</strong> No state tax on your profit.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-accent">•</span>
                    <span><strong>Cashing out of a BRRRR?</strong> Same story.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-accent">•</span>
                    <span><strong>Offloading investment properties to reposition your portfolio?</strong> Keep more of your earnings.</span>
                  </li>
                </ul>
              </div>

              <p>This is a <strong>huge win for real estate entrepreneurs</strong>, making Missouri one of the most attractive markets for long-term investing and wealth transfer strategies.</p>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Stocks, Crypto, and Digital Assets&mdash;It&apos;s All Covered</h2>
              
              <p>It&apos;s not just real estate. Whether you&apos;re trading crypto, managing a portfolio of stocks, or cashing out bonds, Missouri wants you to keep more of your gains.</p>

              <p>This policy isn&apos;t just about money&mdash;it&apos;s about attracting innovation. Missouri is now positioned to become a hub for blockchain startups, crypto investors, and high-net-worth individuals looking for a better tax environment.</p>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">A New Era of State Tax Competition</h2>
              
              <p>Missouri&apos;s move sends a clear message:</p>

              <blockquote className="border-l-4 border-accent pl-6 py-4 my-6 bg-accent/5 rounded-r-lg">
                <p className="text-lg italic text-primary">&quot;If you&apos;re building wealth, we want you here.&quot;</p>
              </blockquote>

              <p>While other states raise taxes and tighten regulations, Missouri is doing the opposite. And like any smart investor knows, you don&apos;t fight the trend&mdash;you follow the opportunity.</p>

              <h2 className="text-2xl font-bold text-primary mt-8 mb-4">So… What Should You Do?</h2>
              
              <p>If you&apos;re an investor, entrepreneur, or someone who&apos;s serious about building generational wealth, this is your wake-up call to start exploring opportunities beyond the usual markets.</p>

              <p>We are actively investing and growing our footprint in Missouri through <strong>Dealsletter</strong>, and we&apos;re seeing firsthand how this kind of policy unlocks new doors.</p>

              <p className="text-lg font-semibold text-primary">Whether it&apos;s buying your first rental, flipping homes, or repositioning your portfolio for tax efficiency&mdash;<strong>Missouri just became one of the most profitable places to do it</strong>.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-primary/5 rounded-xl border border-primary/20 p-8 text-center">
            <h3 className="text-2xl font-semibold text-primary mb-3">
              Ready to Explore Missouri Opportunities?
            </h3>
            <p className="text-muted mb-6">
              Join Dealsletter to get access to pre-vetted Missouri deals and tax-advantaged investment strategies.
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
              <Link href="/blog/big-beautiful-bill-tax-reform" className="group">
                <div className="bg-card rounded-lg border border-border/60 p-6 hover:shadow-lg transition-all duration-300">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-medium">
                    Policy Update
                  </span>
                  <h4 className="text-lg font-semibold text-primary mt-3 mb-2 group-hover:text-accent transition-colors">
                    The &quot;One Big, Beautiful Bill&quot; Just Passed
                  </h4>
                  <p className="text-muted text-sm">
                    What this sweeping tax reform means for investors, founders, and everyday people.
                  </p>
                </div>
              </Link>
              
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}