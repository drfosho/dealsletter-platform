'use client'

import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/Logo'
import { useState } from 'react'
import { blogPosts, getBlogCategories } from '@/data/blog-posts'

const categories = getBlogCategories()

export default function BlogPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-4 sm:px-6 py-3 bg-background/80 backdrop-blur-xl z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="relative">
                <Logo
                  className="h-9 sm:h-10 md:h-12 w-auto"
                  priority
                />
                <div className="absolute top-0.5 sm:top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
            <div className="px-4 sm:px-6 py-4 bg-background/95 backdrop-blur-xl border-b border-border/20">
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
      <div className="pt-24 sm:pt-32 px-4 sm:px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-semibold border border-purple-500/20 inline-block mb-4">
              Investment Education
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
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
                      src="/logos/SAN DIEGO BLOG HEADER.png"
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
                  ) : post.slug === 'bay-area-housing-eoy-2025' ? (
                    <Image
                      src="/logos/BAY AREA DEEP DIVE.png"
                      alt="Bay Area Housing End of 2025 Deep Dive"
                      fill
                      className="object-cover"
                    />
                  ) : post.slug === 'san-diego-deep-dive-2026' ? (
                    <Image
                      src="/logos/SAN DIEGO DEEP DIVE.png"
                      alt="San Diego County Real Estate Deep Dive 2026"
                      fill
                      className="object-cover"
                    />
                  ) : post.slug === 'la-real-estate-q1-2026' ? (
                    <Image
                      src="/logos/LA QUARTER ONE.png"
                      alt="LA Real Estate Q1 2026: The Market Isn't Crashing"
                      fill
                      className="object-cover"
                    />
                  ) : post.slug === 'bay-area-q1-2026' ? (
                    <Image
                      src="/logos/BAY AREA Q1.png"
                      alt="Bay Area Real Estate Q1 2026: Tight, Split, and Still Moving"
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
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
          <p>
            © {new Date().getFullYear()} Dealsletter. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}