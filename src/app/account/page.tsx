'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UsageInfo {
  can_analyze: boolean;
  analyses_used: number;
  tier_limit: number;
  remaining: number;
  subscription_tier: string;
  subscription_status: string;
  trial_end: string | null;
  current_period_end: string | null;
  is_admin: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/analysis/usage');
      if (res.ok) {
        const data = await res.json();
        setUsageInfo(data);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchUserData();
    }
  }, [user, authLoading, router, fetchUserData]);

  // Re-fetch when user returns to this tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchUserData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, fetchUserData]);

  const handleManageBilling = async () => {
    setIsBillingLoading(true);
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create billing portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setIsBillingLoading(false);
    }
  };

  const tier = usageInfo?.subscription_tier || 'free';
  const isAdmin = usageInfo?.is_admin || false;
  const isPaid = tier === 'pro' || tier === 'pro-plus' || tier === 'premium' || tier === 'enterprise';

  const getTierDisplayName = () => {
    if (isAdmin) return 'Admin';
    switch (tier) {
      case 'pro-plus': return 'Pro Plus';
      case 'premium':
      case 'pro': return 'Pro';
      case 'enterprise': return 'Enterprise';
      default: return 'Free';
    }
  };

  const getTierColor = () => {
    if (isAdmin) return 'bg-gradient-to-r from-amber-500 to-orange-600';
    switch (tier) {
      case 'pro-plus': return 'bg-gradient-to-r from-indigo-500 to-purple-600';
      case 'premium':
      case 'pro': return 'bg-gradient-to-r from-purple-500 to-blue-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getMonthlyLimitDisplay = () => {
    if (isAdmin) return 'Unlimited';
    return usageInfo?.tier_limit ?? 10;
  };

  const getUsagePercentage = () => {
    if (!usageInfo || isAdmin) return 0;
    if (usageInfo.tier_limit <= 0) return 0;
    return Math.min((usageInfo.analyses_used / usageInfo.tier_limit) * 100, 100);
  };

  const getRemainingDisplay = () => {
    if (isAdmin) return '\u221E'; // infinity symbol
    return usageInfo?.remaining ?? 0;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isTrialing = usageInfo?.subscription_status === 'trialing' && usageInfo?.trial_end;
  const trialEndDate = formatDate(usageInfo?.trial_end ?? null);
  const nextBillingDate = formatDate(usageInfo?.current_period_end ?? null);

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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-muted/20 rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-muted/20 rounded-xl mb-6"></div>
            <div className="h-48 bg-muted/20 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <h1 className="text-3xl font-bold text-primary mb-8">Account</h1>

        {/* Account Details Card */}
        <div className="bg-card rounded-xl border border-border/60 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border/40 bg-muted/5">
            <h2 className="text-lg font-semibold text-primary">Account Details</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${getTierColor()}`}>
                {getInitials()}
              </div>
              <div>
                <div className="text-xl font-semibold text-primary">{getUserDisplayName()}</div>
                <div className="text-muted">{user.email}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted block mb-1">Email Address</label>
                <div className="text-primary font-medium">{user.email}</div>
              </div>
              <div>
                <label className="text-sm text-muted block mb-1">Account Created</label>
                <div className="text-primary font-medium">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="bg-card rounded-xl border border-border/60 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border/40 bg-muted/5">
            <h2 className="text-lg font-semibold text-primary">Subscription</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl font-bold text-primary">{getTierDisplayName()} Plan</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    isTrialing
                      ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                      : !isPaid && !isAdmin
                        ? 'bg-gray-500/10 text-gray-600 border border-gray-500/20'
                        : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                  }`}>
                    {isAdmin ? 'Admin' : isTrialing ? 'Trial' : !isPaid ? 'Free' : 'Active'}
                  </span>
                </div>
                <p className="text-muted">
                  {isAdmin
                    ? 'Unlimited property analyses'
                    : `${usageInfo?.tier_limit ?? 10} property analyses per month`
                  }
                </p>
                {/* Trial / Billing date info */}
                {isTrialing && trialEndDate && (
                  <p className="text-sm text-blue-600 mt-1">
                    Free trial ends: {trialEndDate}
                  </p>
                )}
                {!isTrialing && isPaid && nextBillingDate && (
                  <p className="text-sm text-muted mt-1">
                    Next billing date: {nextBillingDate}
                  </p>
                )}
              </div>
              {!isPaid && !isAdmin ? (
                <Link
                  href="/pricing"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-md shadow-purple-500/20"
                >
                  Upgrade to Pro
                </Link>
              ) : !isAdmin ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/account/subscription"
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-md shadow-purple-500/20"
                  >
                    Manage Subscription
                  </Link>
                  <button
                    onClick={handleManageBilling}
                    disabled={isBillingLoading}
                    className="px-6 py-2 border border-border rounded-lg hover:bg-muted/10 transition-colors font-medium disabled:opacity-50"
                  >
                    {isBillingLoading ? 'Loading...' : 'Billing Portal'}
                  </button>
                </div>
              ) : null}
            </div>

            {!isPaid && !isAdmin && (
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <div className="font-medium text-primary mb-1">Upgrade to Pro for 50 analyses/month</div>
                    <p className="text-sm text-muted">
                      Get 50 property analyses per month, priority support, and detailed projections for just $29/month.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Stats Card */}
        <div className="bg-card rounded-xl border border-border/60 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border/40 bg-muted/5">
            <h2 className="text-lg font-semibold text-primary">Usage This Month</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/5 rounded-xl">
                <div className="text-3xl font-bold text-primary mb-1">
                  {usageInfo?.analyses_used ?? 0}
                </div>
                <div className="text-sm text-muted">Analyses Used</div>
              </div>

              <div className="text-center p-4 bg-muted/5 rounded-xl">
                <div className="text-3xl font-bold text-primary mb-1">
                  {getMonthlyLimitDisplay()}
                </div>
                <div className="text-sm text-muted">Monthly Limit</div>
              </div>

              <div className="text-center p-4 bg-muted/5 rounded-xl">
                <div className={`text-3xl font-bold mb-1 ${
                  isAdmin ? 'text-green-600' :
                  (usageInfo?.remaining ?? 0) === 0 ? 'text-red-600' :
                  (usageInfo?.remaining ?? 0) <= 5 ? 'text-orange-600' : 'text-primary'
                }`}>
                  {getRemainingDisplay()}
                </div>
                <div className="text-sm text-muted">Remaining</div>
              </div>
            </div>

            {/* Usage progress bar — show for all non-admin users */}
            {!isAdmin && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Usage Progress</span>
                  <span className="font-medium">
                    {usageInfo?.analyses_used ?? 0} / {usageInfo?.tier_limit ?? 10} used this month
                  </span>
                </div>
                <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      getUsagePercentage() >= 100 ? 'bg-red-500' :
                      getUsagePercentage() >= 75 ? 'bg-orange-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${getUsagePercentage()}%` }}
                  />
                </div>
                {getUsagePercentage() >= 100 && !isPaid && (
                  <p className="text-sm text-red-600 mt-2">
                    You&apos;ve reached your monthly limit. <Link href="/pricing" className="underline font-medium">Upgrade to Pro</Link> for 50 analyses/month.
                  </p>
                )}
                {getUsagePercentage() >= 100 && isPaid && (
                  <p className="text-sm text-red-600 mt-2">
                    You&apos;ve reached your monthly limit. Usage resets on your next billing date.
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-muted mt-4">
              Usage resets on the 1st of each month.
            </p>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40 bg-muted/5">
            <h2 className="text-lg font-semibold text-primary">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/analysis/new"
                className="flex items-center gap-3 p-4 border border-border/60 rounded-lg hover:bg-purple-500/5 hover:border-purple-500/40 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-primary">New Analysis</div>
                  <div className="text-sm text-muted">Analyze a new property</div>
                </div>
              </Link>

              <Link
                href="/analysis/history"
                className="flex items-center gap-3 p-4 border border-border/60 rounded-lg hover:bg-muted/5 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-primary">Analysis History</div>
                  <div className="text-sm text-muted">View past analyses</div>
                </div>
              </Link>

              <Link
                href="/account/subscription"
                className="flex items-center gap-3 p-4 border border-border/60 rounded-lg hover:bg-purple-500/5 hover:border-purple-500/40 transition-colors"
              >
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-primary">Subscription & Billing</div>
                  <div className="text-sm text-muted">Manage your plan & payments</div>
                </div>
              </Link>

              <Link
                href="/blog"
                className="flex items-center gap-3 p-4 border border-border/60 rounded-lg hover:bg-muted/5 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-primary">Read Blog</div>
                  <div className="text-sm text-muted">Investment insights & guides</div>
                </div>
              </Link>

              <button
                onClick={() => signOut()}
                className="flex items-center gap-3 p-4 border border-border/60 rounded-lg hover:bg-red-500/5 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-primary">Sign Out</div>
                  <div className="text-sm text-muted">Sign out of your account</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
