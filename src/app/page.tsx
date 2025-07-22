'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-3 bg-background/80 backdrop-blur-xl z-50 border-b border-border/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="relative">
                <Logo 
                  width={400}
                  height={100}
                  className="h-16 md:h-20 w-auto"
                  priority
                />
                <div className="absolute top-1 md:top-2 -right-1 w-2 md:w-2.5 h-2 md:h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link href="/dashboard" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center">
                  Dashboard
                </Link>
                <Link href="/profile" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center">
                  My Portfolio
                </Link>
                <Link href="/pricing" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center">
                  Pricing
                </Link>
                <Link href="/blog" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center">
                  Blog
                </Link>
                <Link href="/contact" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center">
                  Contact
                </Link>
                <Link href="/faq" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center">
                  FAQ
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/pricing" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center">
                  Pricing
                </Link>
                <Link href="/blog" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center">
                  Blog
                </Link>
                <Link href="/contact" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center">
                  Contact
                </Link>
                <Link href="/faq" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center">
                  FAQ
                </Link>
                <Link href="/auth/login" className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[44px] flex items-center">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 text-muted hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                {user ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/profile"
                      className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Portfolio
                    </Link>
                    <Link 
                      href="/pricing" 
                      className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link 
                      href="/blog" 
                      className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
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
                    <button 
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10 text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/pricing" 
                      className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link 
                      href="/blog" 
                      className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
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
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 pt-36">
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm font-medium">
              Active Investment Deals Daily
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 tracking-tight">
            Get Real Estate Deals
            <span className="block text-accent">That Actually Work</span>
          </h1>
          <p className="text-lg md:text-xl text-muted mb-10 max-w-3xl mx-auto leading-relaxed">
            Join 1,000+ investors receiving pre-analyzed real estate investment opportunities 
            with an average ROI of 50%+. Stop searching, start investing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup" className="group px-8 py-4 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium flex items-center justify-center space-x-2 min-h-[44px]">
              <span>Start Analyzing Deals</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <button 
              onClick={() => document.getElementById('sample-deals')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border border-border text-primary rounded-lg hover:bg-muted/5 transition-all duration-200 font-medium min-h-[44px] flex items-center justify-center"
            >
              See Sample Deals
            </button>
          </div>
          
          {/* Modern Testimonial */}
          <div className="relative mt-16">
            <div className="mx-auto max-w-3xl">
              {/* Quote Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              {/* Testimonial Content */}
              <div className="text-center">
                <p className="text-xl md:text-2xl font-medium text-primary leading-relaxed mb-8">
                  &ldquo;Dealsletter filters out the junk and gives me deals that actually make sense. I&apos;ve already underwrote 3 BRRRRs from the platform that I&apos;m actively pursuing.&rdquo;
                </p>
                
                {/* Customer Info */}
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
                    <span className="text-accent font-semibold text-lg">C</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-primary">Carter</div>
                    <div className="text-sm text-muted">SFH Investor</div>
                  </div>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-border/30">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-muted font-medium">Verified Investor</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-xs text-muted font-medium">3 Active Deals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 bg-muted/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                400+
              </div>
              <div className="text-muted font-medium">Deals Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                $300M+
              </div>
              <div className="text-muted font-medium">Total Deal Value</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                50%+
              </div>
              <div className="text-muted font-medium">Avg. ROI</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                1,000+
              </div>
              <div className="text-muted font-medium">Active Investors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              How Dealsletter Works
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Built by investors, for investors. We eat our own cooking.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-card rounded-xl border border-border/60 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-3">
                Pre-Analyzed Deals
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Every deal comes fully analyzed with cash flow projections, cap rates, and ROI calculations already done for you.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-3">
                Curated Opportunities
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                We get plenty of off-market deals from wholesalers. That doesn&apos;t mean they&apos;re good. We analyze every deal and rip apart garbage listings.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-3">
                Transparency First
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                We don&apos;t hype deals, we break them down. Every risk and every return. Real numbers, not marketing fluff.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60 hover:shadow-lg transition-all duration-200 relative">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zm6-2V1a1 1 0 00-1-1H6a1 1 0 00-1 1v4h4z" />
                </svg>
              </div>
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-md font-medium">Coming Soon</span>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-3">
                Deal Alerts
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Get notified instantly when deals matching your criteria hit our desk. Premium members get early access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="px-6 py-20 bg-muted/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                This Week&apos;s Top Deals
              </h2>
              <p className="text-lg text-muted">
                Fresh investment opportunities delivered to our members
              </p>
            </div>
            <Link href="/auth/signup" className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center space-x-2">
              <span>View All Deals</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Clean Deal Cards */}
            <div className="group bg-card rounded-xl border border-border/60 hover:border-accent/30 transition-all duration-200 p-6 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-muted">ACTIVE</span>
                </div>
                <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-md font-medium">
                  Opportunity Zone
                </span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-1">
                853 S 32nd Street
              </h3>
              <p className="text-sm text-muted mb-6">
                San Diego, CA • 4 Units • Corner Lot
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Purchase Price</span>
                  <span className="font-semibold text-primary">$1,295,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Down Payment</span>
                  <span className="font-semibold text-primary">$647,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Current Cap Rate</span>
                  <span className="font-semibold text-muted">3.39%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Pro Forma Cap Rate</span>
                  <span className="font-semibold text-accent">5.63%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Rent Upside</span>
                  <span className="font-semibold text-green-600">+$2,495/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Pro Forma Cash Flow</span>
                  <span className="font-semibold text-green-600">$1,938/mo</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-border/40">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-muted/10 text-muted rounded-md">Promise Zone</span>
                  <span className="text-xs px-2 py-1 bg-muted/10 text-muted rounded-md">Transit Priority</span>
                  <span className="text-xs px-2 py-1 bg-muted/10 text-muted rounded-md">ADU Potential</span>
                </div>
              </div>
            </div>

            <div className="group bg-card rounded-xl border border-border/60 hover:border-accent/30 transition-all duration-200 p-6 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-muted">FLIP ONLY</span>
                </div>
                <span className="text-xs px-2 py-1 bg-orange-500/10 text-orange-600 rounded-md font-medium">
                  High ROI
                </span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-1">
                2570 68th Ave
              </h3>
              <p className="text-sm text-muted mb-6">
                Oakland, CA • 3BR/1.5BA • 1920s Character
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Purchase Price</span>
                  <span className="font-semibold text-primary">$410,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Down Payment</span>
                  <span className="font-semibold text-primary">$41,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Rehab Budget</span>
                  <span className="font-semibold text-muted">$79,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">ARV</span>
                  <span className="font-semibold text-primary">$615,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Net Profit</span>
                  <span className="font-semibold text-green-600">$65,172</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Annualized ROI</span>
                  <span className="font-semibold text-accent">147.17%</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-border/40">
                <p className="text-xs text-orange-600 font-medium">Hard Money • 4-Month Timeline • Experienced Flippers Only</p>
              </div>
            </div>

            <div className="group bg-card rounded-xl border border-border/60 hover:border-accent/30 transition-all duration-200 p-6 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-muted">PREMIER</span>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 rounded-md font-medium">
                  Multifamily
                </span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-1">
                Hyde Park Arbors
              </h3>
              <p className="text-sm text-muted mb-6">
                Tampa, FL • 16 Units • South Tampa Location
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Purchase Price</span>
                  <span className="font-semibold text-primary">$3,350,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Price/Unit</span>
                  <span className="font-semibold text-primary">$209,375</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Down Payment</span>
                  <span className="font-semibold text-primary">$837,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Cap Rate</span>
                  <span className="font-semibold text-accent">6.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Monthly Income</span>
                  <span className="font-semibold text-green-600">$29,600</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Cash Flow</span>
                  <span className="font-semibold text-green-600">$1,708/mo</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-border/40">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-muted/10 text-muted rounded-md">8x 1BR</span>
                  <span className="text-xs px-2 py-1 bg-muted/10 text-muted rounded-md">8x 2BR</span>
                  <span className="text-xs px-2 py-1 bg-muted/10 text-muted rounded-md">Value-Add</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantage Section */}
      <section className="px-6 py-20 bg-muted/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm font-medium mb-4">
              The Difference
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              How We Stand Out
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Not all deal platforms are created equal. Here&apos;s what makes Dealsletter different.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Modern Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Dealsletter Card */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl blur-sm"></div>
                <div className="relative bg-card rounded-xl border-2 border-accent/20 p-8 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <Image 
                      src="/logos/Copy of Dealsletter Official Logo Black.svg" 
                      alt="Dealsletter Logo" 
                      width={120}
                      height={32}
                      className="h-8 w-auto"
                      suppressHydrationWarning
                    />
                    <div className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-semibold">
                      ✨ Premium
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-primary">Real numbers, full ROI, ARV, and rehab costs</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-primary">Matched to BRRRR, flip, house hack strategies</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-primary">Premium members get deals early</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-primary">Created by active investors, not marketers</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-primary">Handpicked deals sent weekly to your inbox</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted">Quality Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-green-500 rounded-full"></div>
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-green-600">5/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Others Card */}
              <div className="relative">
                <div className="bg-card rounded-xl border border-border/60 p-8 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-muted">
                      Other Platforms
                    </h3>
                    <div className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-sm font-semibold">
                      ⚠️ Basic
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-primary">Raw leads—you still underwrite yourself</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-primary">Random listings without strategy matching</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-primary">Public listings, already picked over</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-primary">Hand you a list—then leave you alone</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-primary">You pay extra for skip tracing and calling</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border/40">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted">Quality Score</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-red-500 rounded-full"></div>
                          ))}
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-muted/30 rounded-full"></div>
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-red-600">2/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Deals Preview Section */}
      <section id="sample-deals" className="px-6 py-24 bg-muted/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm font-medium">
                Sample Deals Preview
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Exclusive Deals Our Members Are Analyzing Right Now
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Get a sneak peek at the caliber of deals our members receive. Full analysis available to subscribers only.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Deal Card 1 - San Diego */}
            <div className="relative bg-card rounded-xl border border-border/60 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
              
              <div className="p-6 relative z-20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-1">
                      853 S 32nd Street
                    </h3>
                    <p className="text-sm text-muted">San Diego, CA</p>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-600 rounded-md text-xs font-medium">
                    HIGH ROI
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Strategy</span>
                    <span className="font-medium text-primary">BRRRR</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Purchase Price</span>
                    <span className="font-medium text-primary">$1,295,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Projected ROI</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted/20 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-muted/40 to-muted/20 animate-pulse"></div>
                      </div>
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4">
                  <p className="text-xs text-muted mb-3">
                    🔒 Full analysis includes cap rates, cash flow projections, and renovation budget
                  </p>
                  <button 
                    onClick={() => {
                      console.log('Unlock Full Access clicked');
                      router.push('/auth/signup');
                    }}
                    className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm min-h-[44px] flex items-center justify-center cursor-pointer"
                    type="button"
                  >
                    Unlock Full Access
                  </button>
                </div>
              </div>
            </div>

            {/* Deal Card 2 - Oakland */}
            <div className="relative bg-card rounded-xl border border-border/60 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
              
              <div className="p-6 relative z-20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-1">
                      2570 68th Ave
                    </h3>
                    <p className="text-sm text-muted">Oakland, CA</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded-md text-xs font-medium">
                    QUICK FLIP
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Strategy</span>
                    <span className="font-medium text-primary">Fix & Flip</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Purchase Price</span>
                    <span className="font-medium text-primary">$410,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Est. Profit</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted/20 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-muted/40 to-muted/20 animate-pulse"></div>
                      </div>
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4">
                  <p className="text-xs text-muted mb-3">
                    🔒 Full analysis includes ARV, rehab costs, and timeline breakdown
                  </p>
                  <button 
                    onClick={() => {
                      console.log('Unlock Full Access clicked');
                      router.push('/auth/signup');
                    }}
                    className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm min-h-[44px] flex items-center justify-center cursor-pointer"
                    type="button"
                  >
                    Unlock Full Access
                  </button>
                </div>
              </div>
            </div>

            {/* Deal Card 3 - Tampa */}
            <div className="relative bg-card rounded-xl border border-border/60 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
              
              <div className="p-6 relative z-20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-1">
                      Hyde Park Arbors
                    </h3>
                    <p className="text-sm text-muted">Tampa, FL</p>
                  </div>
                  <span className="px-2 py-1 bg-accent/20 text-accent rounded-md text-xs font-medium">
                    CASH FLOW
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Type</span>
                    <span className="font-medium text-primary">16-Unit Multifamily</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Purchase Price</span>
                    <span className="font-medium text-primary">$3,350,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Cap Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted/20 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-muted/40 to-muted/20 animate-pulse"></div>
                      </div>
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4">
                  <p className="text-xs text-muted mb-3">
                    🔒 Full analysis includes NOI, cash flow, and value-add opportunities
                  </p>
                  <button 
                    onClick={() => {
                      console.log('Unlock Full Access clicked');
                      router.push('/auth/signup');
                    }}
                    className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm min-h-[44px] flex items-center justify-center cursor-pointer"
                    type="button"
                  >
                    Unlock Full Access
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 rounded-2xl p-8 border border-accent/20">
            <h3 className="text-2xl font-bold text-primary mb-3">
              Ready to See Complete Deal Analysis?
            </h3>
            <p className="text-muted mb-6 max-w-2xl mx-auto">
              Get instant access to full financial breakdowns, market analysis, and investment strategies for all deals. Join 1,000+ investors who never miss a profitable opportunity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup" className="px-8 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center">
                Start Free Trial
              </Link>
              <span className="text-sm text-muted">No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Image */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80 z-10"></div>
              <Logo 
                width={500}
                height={400}
                className="w-full h-auto opacity-90"
              />
            </div>
            
            {/* Right side - Content */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Stop Searching. 
                <span className="block text-accent">Start Receiving Deals.</span>
              </h2>
              <p className="text-lg text-muted mb-8 max-w-2xl">
                Join 1,000+ investors who receive pre-vetted, high-ROI real estate investment opportunities delivered weekly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth/signup" className="px-8 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-all duration-200 font-semibold text-lg flex items-center justify-center">
                  Get Your First Deal Alert
                </Link>
              </div>
              <p className="text-sm text-muted mt-6">
                ✓ Free to join • ✓ New deals every week • ✓ Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-border/20 bg-muted/5">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/logos/Copy of Dealsletter Official Logo Black.svg" 
              alt="Dealsletter Logo" 
              width={120}
              height={32}
              className="h-8 w-auto"
              suppressHydrationWarning
            />
          </div>
          <p className="text-muted mb-4">
            Professional real estate analysis tools for serious investors
          </p>
          <p className="text-muted text-sm">
            © 2024 Dealsletter Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}