'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
  const [heroVisualType, setHeroVisualType] = useState<'dashboard' | 'map' | 'carousel'>('dashboard');
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  // Animated counters
  const weeklyDeals = useAnimatedCounter(23, 2000);
  const totalDeals = useAnimatedCounter(412, 3000);
  const totalInvestors = useAnimatedCounter(1247, 2500);
  
  // Scroll detection for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Current page detection (simplified for homepage)
  const currentPage = '/';
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation */}
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
          
          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center ${
                    currentPage === '/dashboard' 
                      ? 'text-accent bg-accent/10 shadow-sm' 
                      : 'text-primary/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  Dashboard
                  {currentPage === '/dashboard' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/profile" 
                  className={`relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center ${
                    currentPage === '/profile' 
                      ? 'text-accent bg-accent/10 shadow-sm' 
                      : 'text-primary/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  My Portfolio
                  {currentPage === '/profile' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/pricing" 
                  className={`relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center ${
                    currentPage === '/pricing' 
                      ? 'text-accent bg-accent/10 shadow-sm' 
                      : 'text-primary/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  Pricing
                  {currentPage === '/pricing' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/blog" 
                  className={`relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center ${
                    currentPage === '/blog' 
                      ? 'text-accent bg-accent/10 shadow-sm' 
                      : 'text-primary/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  Blog
                  {currentPage === '/blog' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/contact" 
                  className={`relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center ${
                    currentPage === '/contact' 
                      ? 'text-accent bg-accent/10 shadow-sm' 
                      : 'text-primary/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  Contact
                  {currentPage === '/contact' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/faq" 
                  className={`relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center ${
                    currentPage === '/faq' 
                      ? 'text-accent bg-accent/10 shadow-sm' 
                      : 'text-primary/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  FAQ
                  {currentPage === '/faq' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                  )}
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
                  href="/pricing" 
                  className={`relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center ${
                    currentPage === '/pricing' 
                      ? 'text-accent bg-accent/10 shadow-sm' 
                      : 'text-primary/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  Pricing
                  {currentPage === '/pricing' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/blog" 
                  className={`relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center ${
                    currentPage === '/blog' 
                      ? 'text-accent bg-accent/10 shadow-sm' 
                      : 'text-primary/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  Blog
                  {currentPage === '/blog' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/contact" 
                  className={`relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center ${
                    currentPage === '/contact' 
                      ? 'text-accent bg-accent/10 shadow-sm' 
                      : 'text-primary/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  Contact
                  {currentPage === '/contact' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/faq" 
                  className={`relative px-4 py-3 rounded-lg transition-all duration-200 font-semibold min-h-[44px] flex items-center ${
                    currentPage === '/faq' 
                      ? 'text-accent bg-accent/10 shadow-sm' 
                      : 'text-primary/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  FAQ
                  {currentPage === '/faq' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
                  )}
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
                  <span>Get Started</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* Enhanced Mobile Menu Button */}
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

        {/* Enhanced Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="px-6 py-6 bg-background/98 backdrop-blur-xl border-b border-border/30 shadow-xl">
              <div className="flex flex-col space-y-2">
                {user ? (
                  <>
                    <Link 
                      href="/dashboard"
                      className={`relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center ${
                        currentPage === '/dashboard' 
                          ? 'text-accent bg-accent/15 shadow-sm border border-accent/20' 
                          : 'text-primary/80 hover:text-primary hover:bg-primary/8'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                      </svg>
                      Dashboard
                      {currentPage === '/dashboard' && (
                        <div className="absolute right-4 w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </Link>
                    <Link 
                      href="/profile"
                      className={`relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center ${
                        currentPage === '/profile' 
                          ? 'text-accent bg-accent/15 shadow-sm border border-accent/20' 
                          : 'text-primary/80 hover:text-primary hover:bg-primary/8'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Portfolio
                      {currentPage === '/profile' && (
                        <div className="absolute right-4 w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </Link>
                    <Link 
                      href="/pricing"
                      className={`relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center ${
                        currentPage === '/pricing' 
                          ? 'text-accent bg-accent/15 shadow-sm border border-accent/20' 
                          : 'text-primary/80 hover:text-primary hover:bg-primary/8'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Pricing
                      {currentPage === '/pricing' && (
                        <div className="absolute right-4 w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </Link>
                    <Link 
                      href="/blog"
                      className={`relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center ${
                        currentPage === '/blog' 
                          ? 'text-accent bg-accent/15 shadow-sm border border-accent/20' 
                          : 'text-primary/80 hover:text-primary hover:bg-primary/8'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      Blog
                      {currentPage === '/blog' && (
                        <div className="absolute right-4 w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </Link>
                    <Link 
                      href="/contact"
                      className={`relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center ${
                        currentPage === '/contact' 
                          ? 'text-accent bg-accent/15 shadow-sm border border-accent/20' 
                          : 'text-primary/80 hover:text-primary hover:bg-primary/8'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact
                      {currentPage === '/contact' && (
                        <div className="absolute right-4 w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </Link>
                    <Link 
                      href="/faq"
                      className={`relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center ${
                        currentPage === '/faq' 
                          ? 'text-accent bg-accent/15 shadow-sm border border-accent/20' 
                          : 'text-primary/80 hover:text-primary hover:bg-primary/8'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      FAQ
                      {currentPage === '/faq' && (
                        <div className="absolute right-4 w-2 h-2 bg-accent rounded-full"></div>
                      )}
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
                      href="/pricing"
                      className={`relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center ${
                        currentPage === '/pricing' 
                          ? 'text-accent bg-accent/15 shadow-sm border border-accent/20' 
                          : 'text-primary/80 hover:text-primary hover:bg-primary/8'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Pricing
                      {currentPage === '/pricing' && (
                        <div className="absolute right-4 w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </Link>
                    <Link 
                      href="/blog"
                      className={`relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center ${
                        currentPage === '/blog' 
                          ? 'text-accent bg-accent/15 shadow-sm border border-accent/20' 
                          : 'text-primary/80 hover:text-primary hover:bg-primary/8'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      Blog
                      {currentPage === '/blog' && (
                        <div className="absolute right-4 w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </Link>
                    <Link 
                      href="/contact"
                      className={`relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center ${
                        currentPage === '/contact' 
                          ? 'text-accent bg-accent/15 shadow-sm border border-accent/20' 
                          : 'text-primary/80 hover:text-primary hover:bg-primary/8'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact
                      {currentPage === '/contact' && (
                        <div className="absolute right-4 w-2 h-2 bg-accent rounded-full"></div>
                      )}
                    </Link>
                    <Link 
                      href="/faq"
                      className={`relative px-4 py-4 rounded-xl transition-all duration-200 font-semibold min-h-[52px] flex items-center ${
                        currentPage === '/faq' 
                          ? 'text-accent bg-accent/15 shadow-sm border border-accent/20' 
                          : 'text-primary/80 hover:text-primary hover:bg-primary/8'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      FAQ
                      {currentPage === '/faq' && (
                        <div className="absolute right-4 w-2 h-2 bg-accent rounded-full"></div>
                      )}
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
                      <span>Get Started</span>
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
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left column - Text content */}
            <div className="text-center lg:text-left">
              <div className="inline-block mb-6">
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-sm font-medium">
                  Active Investment Deals Daily
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 tracking-tight">
                Get Real Estate Deals
                <span className="block text-accent">That Actually Work</span>
              </h1>
              <p className="text-lg md:text-xl text-muted mb-10 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                Join 1,000+ investors receiving pre-analyzed real estate investment opportunities 
                with an average 
                {/* Prominent ROI badge */}
                <span className="inline-flex items-center mx-1 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-700 dark:text-green-400 rounded-full text-lg font-bold shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  50%+ ROI
                </span>
                . Stop searching, start investing.
              </p>
              <div className="space-y-6 mb-10">
                {/* Primary CTA - Larger and more prominent */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link 
                    href="/auth/signup" 
                    className="group relative overflow-hidden px-12 py-5 bg-gradient-to-r from-primary to-primary/90 text-secondary rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-300 font-bold text-lg flex items-center justify-center space-x-3 min-h-[60px] shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-primary/20"
                  >
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="relative z-10">Start Free</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  
                  {/* Secondary CTA */}
                  <button 
                    onClick={() => document.getElementById('sample-deals')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group px-10 py-5 border-2 border-border hover:border-accent text-primary rounded-xl hover:bg-accent/5 transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 min-h-[60px] hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Sample Deals</span>
                  </button>
                </div>
                
                {/* Micro-copy and trust indicators */}
                <div className="text-center lg:text-left space-y-2">
                  <div className="flex items-center justify-center lg:justify-start space-x-4 text-sm text-muted">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Free to join</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted/70">
                    Join 1,247+ investors already receiving weekly deal alerts
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Interactive Visual Elements */}
            <div className="hidden lg:flex items-center justify-center relative">
              <div className="relative w-96 h-80">
                {/* Visual Element Switcher */}
                <div className="absolute -top-12 left-0 flex space-x-2 z-10">
                  <button
                    onClick={() => setHeroVisualType('dashboard')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      heroVisualType === 'dashboard' 
                        ? 'bg-accent text-white' 
                        : 'bg-muted/20 text-muted hover:bg-muted/30'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setHeroVisualType('map')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      heroVisualType === 'map' 
                        ? 'bg-accent text-white' 
                        : 'bg-muted/20 text-muted hover:bg-muted/30'
                    }`}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setHeroVisualType('carousel')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      heroVisualType === 'carousel' 
                        ? 'bg-accent text-white' 
                        : 'bg-muted/20 text-muted hover:bg-muted/30'
                    }`}
                  >
                    B&A
                  </button>
                </div>

                {/* Dashboard View */}
                {heroVisualType === 'dashboard' && (
                  <>
                    <div className="relative bg-card rounded-2xl border border-border/60 shadow-2xl overflow-hidden">
                      {/* Dashboard Header */}
                      <div className="bg-gradient-to-r from-accent/10 to-primary/5 px-4 py-3 border-b border-border/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold text-primary">Live Analysis</span>
                          </div>
                          <div className="text-xs text-muted">2570 68th Ave, Oakland</div>
                        </div>
                      </div>
                      
                      {/* Dashboard Content */}
                      <div className="p-4 space-y-4">
                        {/* Property Info Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-primary text-sm">3BR/1.5BA</div>
                              <div className="text-xs text-muted">Fix & Flip</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">$410K</div>
                            <div className="text-xs text-muted">Purchase</div>
                          </div>
                        </div>
                        
                        {/* ROI Highlight */}
                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 rounded-xl p-4 border border-green-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted">Projected ROI</span>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <span className="text-xs text-green-600 font-medium">High</span>
                            </div>
                          </div>
                          <div className="text-2xl font-black text-green-600 mb-1">147.17%</div>
                          <div className="text-xs text-green-700/80">Annualized return</div>
                        </div>
                        
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/5 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-primary">$65K</div>
                            <div className="text-xs text-muted">Net Profit</div>
                          </div>
                          <div className="bg-muted/5 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-primary">$615K</div>
                            <div className="text-xs text-muted">ARV</div>
                          </div>
                        </div>
                        
                        {/* Analysis Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Analysis Complete</span>
                            <span className="text-accent font-medium">100%</span>
                          </div>
                          <div className="w-full bg-muted/20 rounded-full h-2">
                            <div className="bg-gradient-to-r from-accent to-green-500 h-2 rounded-full w-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Notification */}
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full p-2 shadow-lg animate-bounce">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    
                    {/* Weekly Counter */}
                    <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-4 py-3 shadow-xl">
                      <div className="text-center">
                        <div className="text-xs font-medium text-muted mb-1">This Week</div>
                        <div className="text-xl font-bold text-accent">{weeklyDeals}</div>
                        <div className="text-xs text-muted">Deals Analyzed</div>
                      </div>
                    </div>
                  </>
                )}

                {/* Map View */}
                {heroVisualType === 'map' && (
                  <>
                    <div className="relative bg-card rounded-2xl border border-border/60 shadow-2xl overflow-hidden">
                      {/* Map Header */}
                      <div className="bg-gradient-to-r from-accent/10 to-primary/5 px-4 py-3 border-b border-border/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold text-primary">Deal Locations</span>
                          </div>
                          <div className="text-xs text-muted">California Markets</div>
                        </div>
                      </div>
                      
                      {/* Map Content */}
                      <div className="relative h-64 bg-gradient-to-br from-blue-50/50 to-green-50/50 dark:from-blue-900/10 dark:to-green-900/10">
                        {/* Simplified map background */}
                        <div className="absolute inset-0 opacity-20">
                          <svg viewBox="0 0 400 300" className="w-full h-full">
                            {/* California-like coastline */}
                            <path
                              d="M50 50 Q100 80 120 150 Q140 200 160 280 L180 300 L200 290 Q220 250 240 200 Q260 120 280 80 Q300 60 350 50 L350 20 L50 20 Z"
                              fill="currentColor"
                              className="text-accent/10"
                            />
                          </svg>
                        </div>
                        
                        {/* Deal pins */}
                        <div className="absolute inset-0 p-4">
                          {/* San Diego pin */}
                          <div className="absolute bottom-16 left-12 group">
                            <div className="relative">
                              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse cursor-pointer"></div>
                              <div className="absolute -top-2 -left-2 w-8 h-8 bg-green-500/20 rounded-full animate-ping"></div>
                              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <div className="text-xs font-medium text-primary">San Diego</div>
                                <div className="text-xs text-green-600">$1.2M • 62% ROI</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Oakland pin */}
                          <div className="absolute top-16 left-20 group">
                            <div className="relative">
                              <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg animate-pulse cursor-pointer"></div>
                              <div className="absolute -top-2 -left-2 w-8 h-8 bg-yellow-500/20 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <div className="text-xs font-medium text-primary">Oakland</div>
                                <div className="text-xs text-yellow-600">$410K • 147% ROI</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Los Angeles pin */}
                          <div className="absolute bottom-24 left-24 group">
                            <div className="relative">
                              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse cursor-pointer"></div>
                              <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500/20 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <div className="text-xs font-medium text-primary">Los Angeles</div>
                                <div className="text-xs text-blue-600">$850K • 89% ROI</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Sacramento pin */}
                          <div className="absolute top-20 left-32 group">
                            <div className="relative">
                              <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-lg animate-pulse cursor-pointer"></div>
                              <div className="absolute -top-2 -left-2 w-8 h-8 bg-purple-500/20 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
                              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <div className="text-xs font-medium text-primary">Sacramento</div>
                                <div className="text-xs text-purple-600">$520K • 73% ROI</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Fresno pin */}
                          <div className="absolute top-32 left-28 group">
                            <div className="relative">
                              <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse cursor-pointer"></div>
                              <div className="absolute -top-2 -left-2 w-8 h-8 bg-orange-500/20 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
                              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <div className="text-xs font-medium text-primary">Fresno</div>
                                <div className="text-xs text-orange-600">$385K • 95% ROI</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Map Stats */}
                      <div className="p-4 border-t border-border/40">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-primary">5</div>
                            <div className="text-xs text-muted">Active Markets</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-accent">23</div>
                            <div className="text-xs text-muted">This Week</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">89%</div>
                            <div className="text-xs text-muted">Avg ROI</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Map Legend */}
                    <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-xl px-3 py-2 shadow-xl">
                      <div className="text-xs font-medium text-muted mb-2">Deal Types</div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-muted">BRRRR</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs text-muted">Flip</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Before/After Carousel */}
                {heroVisualType === 'carousel' && (
                  <>
                    <div className="relative bg-card rounded-2xl border border-border/60 shadow-2xl overflow-hidden">
                      {/* Carousel Header */}
                      <div className="bg-gradient-to-r from-accent/10 to-primary/5 px-4 py-3 border-b border-border/40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold text-primary">Transformation</span>
                          </div>
                          <div className="text-xs text-muted">2570 68th Ave, Oakland</div>
                        </div>
                      </div>
                      
                      {/* Carousel Content */}
                      <div className="relative h-64 overflow-hidden">
                        {/* Before/After Slider */}
                        <div className="relative w-full h-full">
                          <div className="absolute inset-0 flex">
                            {/* Before Image Mockup */}
                            <div className="relative w-1/2 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-800/10">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-red-200/50 dark:bg-red-800/30 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                    <svg className="w-8 h-8 text-red-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </div>
                                  <div className="text-sm font-semibold text-red-700 mb-1">BEFORE</div>
                                  <div className="text-xs text-red-600/80">Distressed Property</div>
                                </div>
                              </div>
                              {/* Property issues overlay */}
                              <div className="absolute top-4 left-4 space-y-2">
                                <div className="flex items-center space-x-1 bg-red-100/80 dark:bg-red-900/40 rounded-full px-2 py-1">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                  <span className="text-xs text-red-700">Roof Issues</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-red-100/80 dark:bg-red-900/40 rounded-full px-2 py-1">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                  <span className="text-xs text-red-700">Kitchen Dated</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-red-100/80 dark:bg-red-900/40 rounded-full px-2 py-1">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                  <span className="text-xs text-red-700">Flooring</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* After Image Mockup */}
                            <div className="relative w-1/2 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-green-200/50 dark:bg-green-800/30 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                    <svg className="w-8 h-8 text-green-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                                    </svg>
                                  </div>
                                  <div className="text-sm font-semibold text-green-700 mb-1">AFTER</div>
                                  <div className="text-xs text-green-600/80">Renovated Property</div>
                                </div>
                              </div>
                              {/* Property improvements overlay */}
                              <div className="absolute top-4 right-4 space-y-2">
                                <div className="flex items-center space-x-1 bg-green-100/80 dark:bg-green-900/40 rounded-full px-2 py-1">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-green-700">New Roof</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-green-100/80 dark:bg-green-900/40 rounded-full px-2 py-1">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-green-700">Modern Kitchen</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-green-100/80 dark:bg-green-900/40 rounded-full px-2 py-1">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-green-700">Hardwood</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Divider */}
                          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-border/0 via-border to-border/0 transform -translate-x-0.5"></div>
                        </div>
                      </div>
                      
                      {/* Carousel Stats */}
                      <div className="p-4 border-t border-border/40">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-primary">$79K</div>
                            <div className="text-xs text-muted">Rehab Cost</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-accent">4 Mo</div>
                            <div className="text-xs text-muted">Timeline</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">+50%</div>
                            <div className="text-xs text-muted">Value Add</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* ROI Callout */}
                    <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl px-4 py-3 shadow-xl">
                      <div className="text-center">
                        <div className="text-xs font-medium mb-1">Est. Profit</div>
                        <div className="text-xl font-bold">$65K</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Modern Testimonial - centered below both columns */}
          <div className="relative mt-16 lg:col-span-2">
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
                {totalDeals}+
              </div>
              <div className="text-muted font-medium">Deals Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                $300M+
              </div>
              <div className="text-muted font-medium">Total Deal Value</div>
            </div>
            <div className="text-center relative">
              {/* Enhanced ROI stat with special styling */}
              <div className="relative p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl border-2 border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-3">
                  50%+
                </div>
                <div className="text-green-700 dark:text-green-400 font-bold text-lg">Avg. ROI</div>
                <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mt-2"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {totalInvestors}+
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
            <Link href="/auth/signup" className="group px-6 py-3 bg-primary text-secondary rounded-xl hover:bg-primary/90 transition-all duration-300 font-semibold flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]">
              <span>View All Deals</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="group w-full px-4 py-3 bg-gradient-to-r from-accent to-accent/90 text-white rounded-xl hover:from-accent/90 hover:to-accent/80 transition-all duration-300 font-semibold text-sm min-h-[48px] flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    type="button"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span>Unlock Full Access</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
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
                    className="group w-full px-4 py-3 bg-gradient-to-r from-accent to-accent/90 text-white rounded-xl hover:from-accent/90 hover:to-accent/80 transition-all duration-300 font-semibold text-sm min-h-[48px] flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    type="button"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span>Unlock Full Access</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
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
                    className="group w-full px-4 py-3 bg-gradient-to-r from-accent to-accent/90 text-white rounded-xl hover:from-accent/90 hover:to-accent/80 transition-all duration-300 font-semibold text-sm min-h-[48px] flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    type="button"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span>Unlock Full Access</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA - Enhanced */}
          <div className="text-center bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 rounded-2xl p-10 border border-accent/20 shadow-lg">
            <h3 className="text-3xl font-bold text-primary mb-4">
              Ready to See Complete Deal Analysis?
            </h3>
            <p className="text-lg text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
              Get instant access to full financial breakdowns, market analysis, and investment strategies for all deals. Join 1,247+ investors who never miss a profitable opportunity.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/auth/signup" 
                  className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-primary to-primary/90 text-secondary rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-300 font-bold text-xl flex items-center justify-center space-x-3 min-h-[56px] shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="relative z-10">Start Free Trial</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link 
                  href="/pricing" 
                  className="group px-8 py-4 border-2 border-accent text-accent rounded-xl hover:bg-accent hover:text-white transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-2 min-h-[56px] hover:shadow-lg"
                >
                  <span>View Pricing</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="flex items-center justify-center space-x-6 text-sm text-muted">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Setup in 2 minutes</span>
                </div>
              </div>
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
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link 
                    href="/auth/signup" 
                    className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-primary to-primary/90 text-secondary rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-300 font-bold text-xl flex items-center justify-center space-x-3 min-h-[56px] shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19l5-5 5 5" />
                    </svg>
                    <span className="relative z-10">Get Your First Deal Alert</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Free to join</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>New deals every week</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
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