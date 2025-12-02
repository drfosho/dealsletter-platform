'use client';

import Link from 'next/link';
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
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0)',
              backgroundSize: '20px 20px'
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium">
                AI-Powered Property Analysis
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 tracking-tight">
              Analyze Any Property
              <span className="block text-accent">In Seconds</span>
            </h1>
            <p className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
              Get instant investment analysis with projected ROI, cash flow, and AI-powered insights.
              Make confident real estate decisions backed by data.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href={user ? "/analysis/new" : "/auth/signup"}
                className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-primary to-primary/90 text-secondary rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-300 font-bold text-lg flex items-center justify-center space-x-3 min-h-[60px] shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-primary/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="relative z-10">{user ? "Start Analysis" : "Get Started Free"}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <Link
                href="/pricing"
                className="group px-10 py-5 border-2 border-border hover:border-accent text-primary rounded-xl hover:bg-accent/5 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 min-h-[60px] hover:shadow-lg"
              >
                <span>View Pricing</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>20 free analyses/month</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-muted/5 border-y border-border/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">{analysesCount.toLocaleString()}+</div>
              <div className="text-muted">Properties Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">{avgROI}%</div>
              <div className="text-muted">Avg. ROI Found</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">30s</div>
              <div className="text-muted">Avg. Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">5</div>
              <div className="text-muted">Investment Strategies</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Get comprehensive investment analysis in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-card rounded-2xl border border-border/60 hover:border-accent/40 transition-colors">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-accent">1</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Enter Address</h3>
              <p className="text-muted">
                Simply enter any property address. We&apos;ll fetch the property details automatically.
              </p>
            </div>

            <div className="text-center p-8 bg-card rounded-2xl border border-border/60 hover:border-accent/40 transition-colors">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-accent">2</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Choose Strategy</h3>
              <p className="text-muted">
                Select from BRRRR, Fix & Flip, Buy & Hold, House Hack, or Commercial strategies.
              </p>
            </div>

            <div className="text-center p-8 bg-card rounded-2xl border border-border/60 hover:border-accent/40 transition-colors">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Get Insights</h3>
              <p className="text-muted">
                Receive detailed ROI projections, cash flow analysis, and AI-powered investment recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-muted/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Powerful Analysis Features
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Everything you need to make informed investment decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-xl border border-border/60">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">ROI Projections</h3>
              <p className="text-muted text-sm">
                Calculate potential returns with detailed 5, 10, and 30-year projections based on market data.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Cash Flow Analysis</h3>
              <p className="text-muted text-sm">
                Detailed monthly cash flow breakdowns including all expenses, vacancy, and management costs.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">AI Insights</h3>
              <p className="text-muted text-sm">
                Get intelligent recommendations and risk assessments powered by advanced AI analysis.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Compare Analyses</h3>
              <p className="text-muted text-sm">
                Save and compare multiple property analyses to find the best investment opportunities.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">PDF Export</h3>
              <p className="text-muted text-sm">
                Download professional PDF reports to share with partners, lenders, or keep for your records.
              </p>
            </div>

            <div className="p-6 bg-card rounded-xl border border-border/60">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Analysis History</h3>
              <p className="text-muted text-sm">
                Access all your past analyses anytime. Track your research and compare opportunities over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Investment Insights
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Learn investment strategies from our educational blog content
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Link href="/blog/cre-market-deep-dive-2025" className="group">
              <div className="bg-card rounded-xl border border-border/60 overflow-hidden hover:border-accent/40 transition-colors">
                <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                <div className="p-6">
                  <span className="text-xs font-medium text-accent">Market Analysis</span>
                  <h3 className="text-lg font-bold text-primary mt-2 mb-2 group-hover:text-accent transition-colors">
                    CRE Market Deep Dive 2025
                  </h3>
                  <p className="text-sm text-muted line-clamp-2">
                    Commercial real estate trends and opportunities in the current market.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/blog/missouri-capital-gains-elimination" className="group">
              <div className="bg-card rounded-xl border border-border/60 overflow-hidden hover:border-accent/40 transition-colors">
                <div className="h-48 bg-gradient-to-br from-green-500/20 to-emerald-500/20"></div>
                <div className="p-6">
                  <span className="text-xs font-medium text-accent">Tax Strategy</span>
                  <h3 className="text-lg font-bold text-primary mt-2 mb-2 group-hover:text-accent transition-colors">
                    Missouri Capital Gains Changes
                  </h3>
                  <p className="text-sm text-muted line-clamp-2">
                    How the new tax policy affects real estate investors in Missouri.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/blog/bay-area-real-estate-shift" className="group">
              <div className="bg-card rounded-xl border border-border/60 overflow-hidden hover:border-accent/40 transition-colors">
                <div className="h-48 bg-gradient-to-br from-orange-500/20 to-red-500/20"></div>
                <div className="p-6">
                  <span className="text-xs font-medium text-accent">Regional Update</span>
                  <h3 className="text-lg font-bold text-primary mt-2 mb-2 group-hover:text-accent transition-colors">
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
              className="inline-flex items-center px-6 py-3 border-2 border-border hover:border-accent text-primary rounded-xl hover:bg-accent/5 transition-all font-semibold"
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
      <section className="py-24 px-6 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
            Ready to Analyze Your Next Investment?
          </h2>
          <p className="text-lg text-muted mb-10 max-w-2xl mx-auto">
            Join thousands of investors making data-driven decisions. Start with 20 free analyses every month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={user ? "/analysis/new" : "/auth/signup"}
              className="group px-10 py-5 bg-gradient-to-r from-primary to-primary/90 text-secondary rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-300 font-bold text-lg flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <span>{user ? "Analyze a Property" : "Get Started Free"}</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
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
