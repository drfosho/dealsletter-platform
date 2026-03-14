'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  variant?: 'default';
}

interface UsageInfo {
  analyses_used: number;
  tier_limit: number;
  remaining: number;
  subscription_tier: string;
  is_admin: boolean;
}

export default function Navigation({ variant: _variant = 'default' }: NavigationProps) {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const subscriptionTier = usageInfo?.subscription_tier || 'free';
  const isAdmin = usageInfo?.is_admin || false;

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await fetch('/api/analysis/usage');
      if (res.ok) {
        const data = await res.json();
        setUsageInfo(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id, fetchUserData]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = () => {
    const firstName = user?.user_metadata?.first_name;
    const lastName = user?.user_metadata?.last_name;
    const email = user?.email;

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    const firstName = user?.user_metadata?.first_name;
    const lastName = user?.user_metadata?.last_name;
    const email = user?.email;

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (email) {
      return email.split('@')[0];
    }
    return 'User';
  };

  const getTierColor = () => {
    if (isAdmin) return 'bg-gradient-to-r from-amber-500 to-orange-600';
    switch (subscriptionTier) {
      case 'pro-plus':
      case 'premium':
      case 'pro':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getTierBadgeColor = () => {
    if (isAdmin) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    switch (subscriptionTier) {
      case 'pro-plus':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'premium':
      case 'pro':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getTierDisplayName = () => {
    if (isAdmin) return 'Admin';
    switch (subscriptionTier) {
      case 'pro-plus': return 'Pro Plus';
      case 'premium':
      case 'pro': return 'Pro';
      default: return 'Free';
    }
  };

  const isPaid = subscriptionTier === 'pro' || subscriptionTier === 'pro-plus' || subscriptionTier === 'premium' || subscriptionTier === 'enterprise';

  return (
    <header className="bg-card border-b border-border/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="relative h-10 sm:h-11 md:h-14 max-w-[160px] sm:max-w-[200px] md:max-w-none overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logos/websiteMainLogoLight.png"
                  alt="Dealsletter Logo"
                  className="block dark:hidden h-full w-auto max-h-full object-contain"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logos/websiteMainLogo.png"
                  alt="Dealsletter Logo"
                  className="hidden dark:block h-full w-auto max-h-full object-contain"
                />
                <div className="absolute top-0 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/analysis" className="px-4 py-2 text-accent hover:text-accent/80 transition-colors font-semibold">
              Property Analysis
            </Link>
            <Link href="/blog" className="px-4 py-2 text-muted hover:text-primary transition-colors font-medium">
              Blog
            </Link>
            <Link href="/pricing" className="px-4 py-2 text-muted hover:text-primary transition-colors font-medium">
              Pricing
            </Link>
            <Link href="/faq" className="px-4 py-2 text-muted hover:text-primary transition-colors font-medium">
              FAQ
            </Link>

            {user ? (
              <>
                {/* Analyses Remaining Indicator */}
                {usageInfo && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/10 rounded-lg">
                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {isAdmin ? 'Unlimited' : `${usageInfo.analyses_used}/${usageInfo.tier_limit}`}
                    </span>
                  </div>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-muted/10 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getTierColor()}`}>
                      {getInitials()}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-primary">{getUserDisplayName()}</div>
                      <div className={`text-xs px-2 py-0.5 rounded-md border ${getTierBadgeColor()} inline-flex items-center`}>
                        {getTierDisplayName()}
                      </div>
                    </div>
                    <svg className={`w-4 h-4 text-muted transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 sm:w-64 bg-card rounded-xl shadow-lg border border-border/60 overflow-hidden">
                      <div className="p-4 border-b border-border/20">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getTierColor()}`}>
                            {getInitials()}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-primary">{getUserDisplayName()}</div>
                            <div className="text-sm text-muted">{user?.email}</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          href="/analysis"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-muted/10 rounded-lg transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          New Analysis
                        </Link>

                        <Link
                          href="/analysis/history"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-muted/10 rounded-lg transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          My Analyses
                        </Link>

                        <Link
                          href="/account"
                          className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-muted/10 rounded-lg transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Account
                        </Link>

                        <div className="my-2 border-t border-border/20"></div>

                        <div className="px-3 py-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-muted">Monthly Usage</span>
                            <span className="text-xs font-medium">
                              {isAdmin ? 'Unlimited' :
                               `${usageInfo?.analyses_used ?? 0} / ${usageInfo?.tier_limit ?? 3}`}
                            </span>
                          </div>
                          {!isAdmin && usageInfo && (
                            <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-accent transition-all duration-300"
                                style={{
                                  width: `${usageInfo.tier_limit > 0
                                    ? Math.min((usageInfo.analyses_used / usageInfo.tier_limit) * 100, 100)
                                    : 0}%`
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {!isPaid && !isAdmin && (
                          <Link
                            href="/pricing"
                            className="flex items-center justify-center gap-2 mx-3 mt-2 px-3 py-2 bg-primary text-secondary text-sm rounded-lg hover:bg-primary/90 transition-colors font-medium"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            Upgrade to Pro
                          </Link>
                        )}

                        <div className="my-2 border-t border-border/20"></div>

                        <button
                          onClick={() => {
                            signOut();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-muted hover:text-primary hover:bg-muted/10 rounded-lg transition-colors w-full"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-muted hover:text-primary transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-6 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Get Started Free
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
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 sm:px-6 py-4 bg-card/95 backdrop-blur-xl border-b border-border/20">
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/20">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getTierColor()}`}>
                  {getInitials()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-primary">{getUserDisplayName()}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-md border ${getTierBadgeColor()} inline-flex items-center`}>
                      {getTierDisplayName()}
                    </span>
                    <span className="text-xs text-muted">
                      {isAdmin ? 'Unlimited analyses' :
                       usageInfo ? `${usageInfo.analyses_used}/${usageInfo.tier_limit} analyses` :
                       '...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-3">
              <Link
                href="/analysis"
                className="px-6 py-3 text-accent bg-accent/10 rounded-lg font-medium min-h-[44px] flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Property Analysis
              </Link>

              {user && (
                <Link
                  href="/analysis/history"
                  className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center gap-3 rounded-lg hover:bg-muted/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  My Analyses
                </Link>
              )}

              <Link
                href="/blog"
                className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>

              <Link
                href="/pricing"
                className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>

              <Link
                href="/faq"
                className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>

              {user ? (
                <>
                  <Link
                    href="/account"
                    className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Account
                  </Link>

                  {!isPaid && !isAdmin && (
                    <Link
                      href="/pricing"
                      className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium min-h-[44px] flex items-center justify-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Upgrade to Pro
                    </Link>
                  )}

                  <div className="pt-3 border-t border-border/20">
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10 text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-6 py-3 text-muted hover:text-primary transition-colors font-medium min-h-[44px] flex items-center rounded-lg hover:bg-muted/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-semibold min-h-[44px] flex items-center justify-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
