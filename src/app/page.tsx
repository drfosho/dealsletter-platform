'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();

  // Animated counters
  const analysesCount = useAnimatedCounter(15000, 2500);
  const avgROI = useAnimatedCounter(42, 2000);

  // Scroll detection for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full px-6 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-2 bg-background/95 backdrop-blur-xl border-b border-border/40 shadow-lg'
          : 'py-3 bg-background/80 backdrop-blur-xl border-b border-border/20'
      }`}>
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
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  href="/analysis"
                  className="relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center text-accent hover:bg-accent/5"
                >
                  Analyze Property
                </Link>
                <Link
                  href="/analysis/history"
                  className="relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/5"
                >
                  My Analyses
                </Link>
                <Link
                  href="/blog"
                  className="relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/5"
                >
                  Blog
                </Link>
                <Link
                  href="/pricing"
                  className="relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/5"
                >
                  Pricing
                </Link>
                <Link
                  href="/account"
                  className="relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/5"
                >
                  Account
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-3 text-primary/80 hover:text-primary hover:bg-red-500/5 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/analysis"
                  className="relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/5"
                >
                  Property Analysis
                </Link>
                <Link
                  href="/blog"
                  className="relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/5"
                >
                  Blog
                </Link>
                <Link
                  href="/pricing"
                  className="relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/5"
                >
                  Pricing
                </Link>
                <Link
                  href="/faq"
                  className="relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/5"
                >
                  FAQ
                </Link>
                <Link
                  href="/auth/login"
                  className="px-4 py-3 text-primary/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="group ml-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-secondary rounded-lg hover:from-primary/90 hover:to-primary/80 transition-all duration-200 font-bold min-h-[44px] flex items-center shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  <span>Get Started Free</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-3 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isMobileMenuOpen
                  ? 'text-accent bg-accent/10 shadow-sm'
                  : 'text-primary hover:text-accent hover:bg-accent/5'
              }`}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="px-6 py-6 bg-background/98 backdrop-blur-xl border-b border-border/30 shadow-xl">
              <div className="flex flex-col space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/analysis"
                      className="relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center text-accent bg-accent/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Analyze Property
                    </Link>
                    <Link
                      href="/analysis/history"
                      className="relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/8"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      My Analyses
                    </Link>
                    <Link
                      href="/blog"
                      className="relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/8"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      Blog
                    </Link>
                    <Link
                      href="/pricing"
                      className="relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/8"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Pricing
                    </Link>
                    <Link
                      href="/account"
                      className="relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/8"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-4 py-4 text-primary/80 hover:text-red-600 hover:bg-red-500/5 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center text-left"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/analysis"
                      className="relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/8"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Property Analysis
                    </Link>
                    <Link
                      href="/blog"
                      className="relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/8"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      Blog
                    </Link>
                    <Link
                      href="/pricing"
                      className="relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/8"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Pricing
                    </Link>
                    <Link
                      href="/faq"
                      className="relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center text-primary/80 hover:text-primary hover:bg-primary/8"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      FAQ
                    </Link>
                    <Link
                      href="/auth/login"
                      className="px-4 py-4 text-primary/80 hover:text-primary hover:bg-primary/8 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="group mt-2 px-4 py-4 bg-gradient-to-r from-primary to-primary/90 text-secondary rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-200 font-bold min-h-[52px] flex items-center justify-center shadow-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Get Started Free</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 pt-36 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(147, 51, 234, 0.15) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-semibold border border-purple-500/20">
                AI-Powered Investment Analysis
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-4 tracking-tight leading-[1.1]">
              Analyze real estate deals
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">that actually work.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary/70 mb-4 max-w-2xl mx-auto leading-relaxed">
              AI-Powered Property Analysis for Real Estate Investors & Agents
            </p>
            <p className="text-base text-muted mb-10 max-w-xl mx-auto">
              Get instant ROI projections, cash flow analysis, and AI-powered insights. Make confident investment decisions backed by data.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href={user ? "/analysis/new" : "/auth/signup"}
                className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-bold text-lg flex items-center justify-center space-x-3 min-h-[60px] shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="relative z-10">{user ? "Start Your Analysis" : "Start Your Free Analysis"}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <Link
                href="/pricing"
                className="group px-10 py-5 border-2 border-purple-500/30 hover:border-purple-500 text-primary rounded-xl hover:bg-purple-500/5 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 min-h-[60px] hover:shadow-lg"
              >
                <span>View Pricing</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
              <div className="flex items-center space-x-2 bg-green-500/5 px-3 py-1.5 rounded-full border border-green-500/20">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600 font-medium">3 free analyses/month</span>
              </div>
              <div className="flex items-center space-x-2 bg-green-500/5 px-3 py-1.5 rounded-full border border-green-500/20">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600 font-medium">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2 bg-purple-500/5 px-3 py-1.5 rounded-full border border-purple-500/20">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-purple-600 font-medium">Pro: 30/month @ $49</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-purple-500/5 to-transparent border-y border-purple-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center p-6 bg-card rounded-2xl border border-border/60 hover:border-purple-500/40 transition-colors">
              <div className="w-14 h-14 mx-auto mb-4 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">{analysesCount.toLocaleString()}+</div>
              <div className="text-muted font-medium">Properties Analyzed</div>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl border border-border/60 hover:border-green-500/40 transition-colors">
              <div className="w-14 h-14 mx-auto mb-4 bg-green-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">{avgROI}%</div>
              <div className="text-muted font-medium">Avg. ROI Found</div>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl border border-border/60 hover:border-blue-500/40 transition-colors">
              <div className="w-14 h-14 mx-auto mb-4 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">30s</div>
              <div className="text-muted font-medium">Avg. Analysis Time</div>
            </div>
            <div className="text-center p-6 bg-card rounded-2xl border border-border/60 hover:border-purple-500/40 transition-colors">
              <div className="w-14 h-14 mx-auto mb-4 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">5</div>
              <div className="text-muted font-medium">Investment Strategies</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-semibold border border-purple-500/20 inline-block mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Get comprehensive investment analysis in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-purple-500/20 via-purple-500/40 to-purple-500/20"></div>

            <div className="text-center p-8 bg-card rounded-2xl border border-border/60 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/5 relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="absolute top-4 right-4 w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">1</span>
              <h3 className="text-xl font-bold text-primary mb-3">Enter Address</h3>
              <p className="text-muted">
                Simply enter any property address. We&apos;ll fetch the property details automatically from public records.
              </p>
            </div>

            <div className="text-center p-8 bg-card rounded-2xl border border-border/60 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/5 relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="absolute top-4 right-4 w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center text-sm font-bold text-purple-600">2</span>
              <h3 className="text-xl font-bold text-primary mb-3">Choose Strategy</h3>
              <p className="text-muted mb-4">
                Select your investment approach for tailored analysis.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="group relative px-2.5 py-1 bg-purple-500/10 text-purple-600 rounded-full text-xs font-medium cursor-help">
                  BRRRR
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Buy, Rehab, Rent, Refinance, Repeat
                  </span>
                </span>
                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-medium">Fix & Flip</span>
                <span className="px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">Buy & Hold</span>
                <span className="px-2.5 py-1 bg-orange-500/10 text-orange-600 rounded-full text-xs font-medium">House Hack</span>
              </div>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-2xl border-2 border-purple-500/30 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="absolute top-4 right-4 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-sm font-bold text-green-600">3</span>
              <h3 className="text-xl font-bold text-primary mb-3">Get Insights</h3>
              <p className="text-muted mb-4">
                Receive detailed ROI projections, cash flow analysis, and AI-powered investment recommendations.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Results in ~30 seconds
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-purple-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-semibold border border-purple-500/20 inline-block mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Powerful Analysis Features
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Everything you need to make informed investment decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Priority Feature - ROI */}
            <div className="p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl border-2 border-green-500/20 hover:border-green-500/40 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">ROI Projections</h3>
              <p className="text-muted text-sm">
                Calculate potential returns with detailed 5, 10, and 30-year projections based on market data.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Cash Flow Analysis</h3>
              <p className="text-muted text-sm">
                Detailed monthly cash flow breakdowns including all expenses, vacancy, and management costs.
              </p>
            </div>

            {/* Priority Feature - AI Insights */}
            <div className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl border-2 border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">AI Insights</h3>
              <p className="text-muted text-sm">
                Get intelligent recommendations and risk assessments powered by advanced AI analysis.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Compare Analyses</h3>
              <p className="text-muted text-sm">
                Save and compare multiple property analyses to find the best investment opportunities.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">PDF Export</h3>
              <p className="text-muted text-sm">
                Download professional PDF reports to share with partners, lenders, or keep for your records.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Analysis History</h3>
              <p className="text-muted text-sm">
                Access all your past analyses anytime. Track your research and compare opportunities over time.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href={user ? "/analysis/new" : "/auth/signup"} className="inline-flex items-center text-purple-600 hover:text-purple-500 font-medium">
              See Features in Action
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-purple-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-semibold border border-purple-500/20 inline-block mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Trusted by Real Estate Investors
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              See what investors are saying about Dealsletter
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-2xl border border-border/60 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-primary mb-4">
                &quot;Saved me hours on deal analysis. The AI insights helped me identify a BRRRR opportunity I would have missed otherwise.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  MJ
                </div>
                <div>
                  <div className="font-semibold text-primary">Michael J.</div>
                  <div className="text-sm text-muted">Real Estate Investor, TX</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card rounded-2xl border border-border/60 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-primary mb-4">
                &quot;The ROI projections are incredibly accurate. I&apos;ve closed 3 deals this year using Dealsletter&apos;s analysis.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  SR
                </div>
                <div>
                  <div className="font-semibold text-primary">Sarah R.</div>
                  <div className="text-sm text-muted">Property Manager, CA</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card rounded-2xl border border-border/60 hover:border-purple-500/40 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-primary mb-4">
                &quot;As a new investor, this tool gives me the confidence to make data-driven decisions. Worth every penny.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 font-bold">
                  DK
                </div>
                <div>
                  <div className="font-semibold text-primary">David K.</div>
                  <div className="text-sm text-muted">First-Time Investor, FL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm font-semibold border border-purple-500/20 inline-block mb-4">
              Free for All Users
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Investment Insights & Education
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Learn investment strategies from our educational blog content
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Link href="/blog/cre-market-deep-dive-2025" className="group">
              <div className="bg-card rounded-xl border border-border/60 overflow-hidden hover:border-purple-500/40 transition-all hover:shadow-lg">
                <div className="h-48 relative bg-muted/10">
                  <Image
                    src="/logos/CRE BLOG HEADER.png"
                    alt="CRE Market Deep Dive"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-purple-500/90 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                      Market Analysis
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-purple-600 bg-purple-500/10 px-2 py-1 rounded">Market Analysis</span>
                    <span className="text-xs text-muted">12 min read</span>
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-purple-600 transition-colors">
                    CRE Market Deep Dive 2025
                  </h3>
                  <p className="text-sm text-muted line-clamp-2">
                    Office at 20.8% vacancy, industrial thriving, retail stable. Complete sector breakdown.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/blog/la-real-estate-market-2025" className="group">
              <div className="bg-card rounded-xl border border-border/60 overflow-hidden hover:border-purple-500/40 transition-all hover:shadow-lg">
                <div className="h-48 relative bg-muted/10">
                  <Image
                    src="/logos/la real estate article.png"
                    alt="LA Real Estate Market"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-blue-500/90 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                      Market Analysis
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-500/10 px-2 py-1 rounded">Market Analysis</span>
                    <span className="text-xs text-muted">10 min read</span>
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-purple-600 transition-colors">
                    LA Real Estate Market 2025
                  </h3>
                  <p className="text-sm text-muted line-clamp-2">
                    Median at $876K, inventory climbing. Complete neighborhood breakdown and playbook.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/blog/bay-area-real-estate-shift" className="group">
              <div className="bg-card rounded-xl border border-border/60 overflow-hidden hover:border-purple-500/40 transition-all hover:shadow-lg">
                <div className="h-48 relative bg-muted/10">
                  <Image
                    src="/logos/bay area article header.png"
                    alt="Bay Area Real Estate Market"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-purple-500/90 text-white rounded-full text-xs font-medium backdrop-blur-sm">
                      Regional Update
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-purple-600 bg-purple-500/10 px-2 py-1 rounded">Regional Update</span>
                    <span className="text-xs text-muted">8 min read</span>
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-purple-600 transition-colors">
                    Bay Area Market Shift
                  </h3>
                  <p className="text-sm text-muted line-clamp-2">
                    Understanding the changing dynamics of Bay Area real estate.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 border-2 border-purple-500/30 hover:border-purple-500 text-primary rounded-xl hover:bg-purple-500/5 transition-all font-semibold"
            >
              View All Articles
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-purple-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-semibold border border-green-500/20">
              No Credit Card Required
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            Ready to Analyze Your Next Investment?
          </h2>
          <p className="text-lg text-muted mb-4 max-w-2xl mx-auto">
            Join thousands of investors making data-driven decisions.
          </p>
          <p className="text-base text-purple-600 font-medium mb-10">
            Start with 3 free analyses/month. Upgrade to Pro for 30 analyses @ $49/mo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={user ? "/analysis/new" : "/auth/signup"}
              className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-bold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="relative z-10">{user ? "Start Your Analysis Now" : "Start Your Free Analysis Now"}</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="px-10 py-5 border-2 border-purple-500/30 hover:border-purple-500 text-primary rounded-xl hover:bg-purple-500/5 transition-all duration-300 font-semibold text-lg flex items-center justify-center"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo
                width={160}
                height={40}
                className="h-10 w-auto mb-4"
              />
              <p className="text-sm text-muted">
                AI-powered property analysis for smarter real estate investments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/analysis" className="text-muted hover:text-primary transition-colors">Property Analysis</Link></li>
                <li><Link href="/pricing" className="text-muted hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/blog" className="text-muted hover:text-primary transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="text-muted hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/faq" className="text-muted hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-primary mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/login" className="text-muted hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link href="/auth/signup" className="text-muted hover:text-primary transition-colors">Get Started</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted">
            <p>&copy; {new Date().getFullYear()} Dealsletter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
