'use client'

import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/Logo'
import { useState } from 'react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: 'Tax Strategy' | 'Market Analysis' | 'Deal Recap' | 'Policy Update'
  imageUrl: string
  slug: string
}

const blogPosts: BlogPost[] = [
  {
    id: '9',
    title: 'San Francisco Office Market: Signs of Life in a Struggling Sector',
    excerpt: 'SF office vacancy at 31.6% but finally stabilizing. AI firms have leased 5M+ SF with positive absorption for 3 quarters. Trophy assets thrive at $73-103 PSF while Class B/C face 40%+ vacancy. The bifurcated recovery is real.',
    date: 'Mid-2025',
    readTime: '12 min read',
    category: 'Market Analysis',
    imageUrl: '/logos/SF BLOG HEADER.png',
    slug: 'sf-office-market-2025'
  },
  {
    id: '8',
    title: 'San Diego Real Estate 2025: The Market Is Finally Taking a Breath',
    excerpt: 'The San Diego market is in a rare "calm but competitive" phase. Prices down 2.8-4.4% YoY, inventory up 29%, but affordability remains brutal at $266K income needed. House hacking 2-4 units is the smartest entry strategy for 2025.',
    date: 'December 2024',
    readTime: '10 min read',
    category: 'Market Analysis',
    imageUrl: '/logos/san diego blog header.png',
    slug: 'san-diego-market-2025'
  },
  {
    id: '6',
    title: 'Buying, investing, or just curious? Here is a no BS breakdown for the LA real estate market',
    excerpt: 'Median home price at $876K, inventory climbing, and nearly half of homes selling below asking. The LA market has shifted from panic-buying to buyer leverage. Here&apos;s your complete neighborhood breakdown and investment playbook.',
    date: 'January 3, 2025',
    readTime: '10 min read',
    category: 'Market Analysis',
    imageUrl: '/logos/la real estate article.png',
    slug: 'la-real-estate-market-2025'
  },
  {
    id: '7',
    title: 'CRE Market Deep Dive: Office is a bloodbath, industrial holding strong, retail surprisingly stable',
    excerpt: 'The most fragmented CRE market in 15+ years. Office vacancy hits 20.8%, $957B in loans maturing, but industrial and data centers are printing money. Here&apos;s our complete sector-by-sector breakdown with the numbers that matter.',
    date: 'January 11, 2025',
    readTime: '12 min read',
    category: 'Market Analysis',
    imageUrl: '/logos/CRE BLOG HEADER.png',
    slug: 'cre-market-deep-dive-2025'
  },
  {
    id: '1',
    title: 'Missouri Just Changed the Game for Investors &mdash; Here&apos;s What It Means for You',
    excerpt: 'Missouri is about to become the first state in the nation to completely eliminate capital gains tax for individuals. This massive shift will impact how smart investors think about where they do business.',
    date: 'November 18, 2024',
    readTime: '4 min read',
    category: 'Tax Strategy',
    imageUrl: '/api/placeholder/600/400',
    slug: 'missouri-capital-gains-elimination'
  },
  {
    id: '2',
    title: 'The &quot;One Big, Beautiful Bill&quot; Just Passed &mdash; What It Means for Investors, Founders, and People',
    excerpt: 'A sweeping tax reform that could reshape the game for entrepreneurs, investors, and working-class families alike. Here&apos;s what actually matters for your bottom line.',
    date: 'November 19, 2024',
    readTime: '6 min read',
    category: 'Policy Update',
    imageUrl: '/api/placeholder/600/400',
    slug: 'big-beautiful-bill-tax-reform'
  },
  {
    id: '3',
    title: 'June Property Recap &mdash; 12 Killer Real Estate Deals We Broke Down',
    excerpt: 'What&apos;s sold, what&apos;s pending, what&apos;s still available, and what this tells us about where the market is headed. A deep dive into 12 deals across multiple markets.',
    date: 'December 28, 2024',
    readTime: '8 min read',
    category: 'Deal Recap',
    imageUrl: '/api/placeholder/600/400',
    slug: 'june-property-recap-12-deals'
  },
  {
    id: '4',
    title: 'The Real State of Housing in 2025 (And Why We&apos;re Still Buying)',
    excerpt: 'The inflation-adjusted home price index hit 299.9 &mdash; higher than 2006. Everyone&apos;s saying &quot;bubble,&quot; but here&apos;s why this correction will unlock the best buying opportunities in over a decade.',
    date: 'December 27, 2024',
    readTime: '7 min read',
    category: 'Market Analysis',
    imageUrl: '/api/placeholder/600/400',
    slug: 'real-state-housing-2025'
  },
  {
    id: '5',
    title: 'Bay Area Real Estate: The Market Shift Every Investor Must Know',
    excerpt: 'The Bay Area real estate market is experiencing its most significant transformation since the pandemic. After years of frenzied seller&apos;s markets, we&apos;re seeing increased inventory, moderate price corrections, and genuine buyer leverage.',
    date: 'October 15, 2025',
    readTime: '8 min read',
    category: 'Market Analysis',
    imageUrl: '/logos/bay area article header.png',
    slug: 'bay-area-real-estate-shift'
  }
]

const categories = ['All', 'Tax Strategy', 'Market Analysis', 'Deal Recap', 'Policy Update']

export default function BlogPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-3 bg-background/80 backdrop-blur-xl z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="relative">
                <Logo 
                  width={300}
                  height={75}
                  className="h-12 md:h-16 w-auto"
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
            <Link href="/auth/signup" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-md shadow-purple-500/20">
              Start Analyzing Deals
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 text-primary hover:text-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-6 py-4 bg-background/95 backdrop-blur-xl border-b border-border/20">
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/" 
                  className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/blog"
                  className="px-6 py-3 text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg bg-primary/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link 
                  href="/contact"
                  className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  href="/faq"
                  className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
                <Link 
                  href="/auth/login"
                  className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium min-h-[44px] flex items-center justify-center shadow-md shadow-purple-500/20"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start Analyzing Deals
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Blog Content */}
      <div className="pt-32 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-semibold border border-purple-500/20 inline-block mb-4">
              Investment Education
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Dealsletter Insights
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Market analysis, tax strategies, deal breakdowns, and insider insights from the world of real estate investing.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors border ${
                  index === 0
                    ? 'bg-purple-500/10 text-purple-600 border-purple-500/30'
                    : 'bg-card text-muted hover:text-primary border-border/60 hover:border-purple-500/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Featured Article */}
          <div className="mb-16">
            <div className="bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="relative aspect-[5/3] bg-muted/10">
                    <Image
                      src={blogPosts[0].imageUrl}
                      alt={blogPosts[0].title}
                      fill
                      className="object-cover rounded-l-xl md:rounded-l-none"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 bg-accent/90 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                        {blogPosts[0].category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                      Featured
                    </span>
                    <span className="text-sm text-muted">{blogPosts[0].date}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-primary mb-4">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-muted mb-6 leading-relaxed">
                    {blogPosts[0].excerpt}
                  </p>
                  <Link
                    href={`/blog/${blogPosts[0].slug}`}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-md shadow-purple-500/20"
                  >
                    <span>Read Full Article</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="h-48 relative bg-muted/10">
                  {post.slug === 'big-beautiful-bill-tax-reform' ? (
                    <Image
                      src="/logos/Article 2.png"
                      alt="Tax Reform Legislation"
                      fill
                      className="object-cover"
                    />
                  ) : post.slug === 'june-property-recap-12-deals' ? (
                    <Image
                      src="/logos/ARTICLE 3.png"
                      alt="Property Deals Recap"
                      fill
                      className="object-cover"
                    />
                  ) : post.slug === 'cre-market-deep-dive-2025' ? (
                    <Image
                      src="/logos/CRE BLOG HEADER.png"
                      alt="CRE Market Analysis"
                      fill
                      className="object-cover"
                    />
                  ) : post.slug === 'missouri-capital-gains-elimination' ? (
                    <Image
                      src="/logos/ARTICLE 4.png"
                      alt="Missouri Tax Strategy"
                      fill
                      className="object-cover"
                    />
                  ) : post.slug === 'bay-area-real-estate-shift' ? (
                    <Image
                      src="/logos/bay area article header.png"
                      alt="Bay Area Real Estate Market"
                      fill
                      className="object-cover"
                    />
                  ) : post.slug === 'la-real-estate-market-2025' ? (
                    <Image
                      src="/logos/la real estate article.png"
                      alt="LA Real Estate Market Analysis"
                      fill
                      className="object-cover"
                    />
                  ) : post.slug === 'real-state-housing-2025' ? (
                    <Image
                      src="/logos/ARTICLE 1 (1).png"
                      alt="Housing Market Analysis 2025"
                      fill
                      className="object-cover"
                    />
                  ) : post.slug === 'san-diego-market-2025' ? (
                    <Image
                      src="/logos/san diego blog header.png"
                      alt="San Diego Real Estate Market 2025"
                      fill
                      className="object-cover"
                    />
                  ) : post.slug === 'sf-office-market-2025' ? (
                    <Image
                      src="/logos/SF BLOG HEADER.png"
                      alt="San Francisco Office Market 2025"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-2">
                          {post.category === 'Tax Strategy' && '💰'}
                          {post.category === 'Policy Update' && '📋'}
                          {post.category === 'Deal Recap' && '🏘️'}
                          {post.category === 'Market Analysis' && '📊'}
                        </div>
                        <p className="text-muted text-sm">{post.category}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.category === 'Tax Strategy' ? 'bg-green-500/90 text-white' :
                      post.category === 'Policy Update' ? 'bg-blue-500/90 text-white' :
                      post.category === 'Deal Recap' ? 'bg-purple-500/90 text-white' :
                      'bg-accent/90 text-white'
                    }`}>
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.category === 'Tax Strategy' ? 'bg-green-500/10 text-green-600' :
                      post.category === 'Policy Update' ? 'bg-blue-500/10 text-blue-600' :
                      post.category === 'Deal Recap' ? 'bg-purple-500/10 text-purple-600' :
                      'bg-accent/10 text-accent'
                    }`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-muted">{post.readTime}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-primary mb-3 group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted text-sm mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">{post.date}</span>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-accent hover:text-accent/80 transition-colors text-sm font-medium flex items-center space-x-1"
                    >
                      <span>Read More</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl border border-purple-500/20 p-8 text-center">
            <span className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-semibold border border-purple-500/20 inline-block mb-4">
              Stay Updated
            </span>
            <h3 className="text-2xl font-semibold text-primary mb-3">
              Want More Insights Like These?
            </h3>
            <p className="text-muted mb-6 max-w-2xl mx-auto">
              Get weekly market analysis, exclusive deal breakdowns, and tax strategies delivered straight to your inbox.
              Join 1,000+ investors who rely on Dealsletter for their edge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://dealsletter.io"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-md shadow-purple-500/20"
              >
                Subscribe to Newsletter
              </a>
              <Link
                href="/auth/signup"
                className="px-6 py-3 border-2 border-purple-500/30 hover:border-purple-500 text-primary rounded-lg hover:bg-purple-500/5 transition-all font-medium"
              >
                Join the Platform
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border/20 px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted">
            © 2024 Dealsletter Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}