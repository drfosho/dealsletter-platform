'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/supabase/profiles';
import { getCurrentMonthUsage, SUBSCRIPTION_LIMITS } from '@/lib/supabase/usage-tracking';

type SubscriptionTier = 'basic' | 'pro' | 'premium';

interface UsageData {
  analysisCount: number;
  monthYear: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('basic');
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Fetch profile
      const { data: profile } = await getUserProfile(user.id);
      if (profile) {
        setSubscriptionTier(profile.subscription_tier || 'basic');
      }

      // Fetch usage
      const { data: usage } = await getCurrentMonthUsage(user.id);
      if (usage) {
        setUsageData({
          analysisCount: usage.analysis_count,
          monthYear: usage.month_year
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
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

  const getTierDisplayName = () => {
    switch (subscriptionTier) {
      case 'premium':
      case 'pro':
        return 'Pro';
      default:
        return 'Free';
    }
  };

  const getTierColor = () => {
    switch (subscriptionTier) {
      case 'premium':
      case 'pro':
        return 'bg-gradient-to-r from-purple-500 to-blue-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getMonthlyLimit = () => {
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier];
    return limit === -1 ? 'Unlimited' : limit;
  };

  const getUsagePercentage = () => {
    if (!usageData || subscriptionTier === 'pro' || subscriptionTier === 'premium') return 0;
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier];
    if (limit === -1) return 0;
    return Math.min((usageData.analysisCount / limit) * 100, 100);
  };

  const getRemainingAnalyses = () => {
    if (!usageData) return 0;
    if (subscriptionTier === 'pro' || subscriptionTier === 'premium') return -1;
    const limit = SUBSCRIPTION_LIMITS[subscriptionTier];
    return Math.max(limit - usageData.analysisCount, 0);
  };

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
        <div className="max-w-4xl mx-auto px-6 py-12">
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

  const remaining = getRemainingAnalyses();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-6 py-12">
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
                    subscriptionTier === 'basic'
                      ? 'bg-gray-500/10 text-gray-600 border border-gray-500/20'
                      : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                  }`}>
                    {subscriptionTier === 'basic' ? 'Free' : 'Active'}
                  </span>
                </div>
                <p className="text-muted">
                  {subscriptionTier === 'basic'
                    ? '20 property analyses per month'
                    : 'Unlimited property analyses'}
                </p>
              </div>
              {subscriptionTier === 'basic' ? (
                <Link
                  href="/pricing"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-md shadow-purple-500/20"
                >
                  Upgrade to Pro
                </Link>
              ) : (
                <button
                  onClick={handleManageBilling}
                  disabled={isBillingLoading}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-muted/10 transition-colors font-medium disabled:opacity-50"
                >
                  {isBillingLoading ? 'Loading...' : 'Manage Billing'}
                </button>
              )}
            </div>

            {subscriptionTier === 'basic' && (
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <div className="font-medium text-primary mb-1">Upgrade to Pro for 30 analyses/month</div>
                    <p className="text-sm text-muted">
                      Get 30 property analyses per month, priority support, and detailed projections for just $49/month.
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
                  {usageData?.analysisCount || 0}
                </div>
                <div className="text-sm text-muted">Analyses Used</div>
              </div>

              <div className="text-center p-4 bg-muted/5 rounded-xl">
                <div className="text-3xl font-bold text-primary mb-1">
                  {getMonthlyLimit()}
                </div>
                <div className="text-sm text-muted">Monthly Limit</div>
              </div>

              <div className="text-center p-4 bg-muted/5 rounded-xl">
                <div className={`text-3xl font-bold mb-1 ${
                  remaining === -1 ? 'text-green-600' :
                  remaining === 0 ? 'text-red-600' :
                  remaining <= 5 ? 'text-orange-600' : 'text-primary'
                }`}>
                  {remaining === -1 ? '∞' : remaining}
                </div>
                <div className="text-sm text-muted">Remaining</div>
              </div>
            </div>

            {subscriptionTier === 'basic' && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Usage Progress</span>
                  <span className="font-medium">{usageData?.analysisCount || 0} / {SUBSCRIPTION_LIMITS.basic}</span>
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
                {getUsagePercentage() >= 100 && (
                  <p className="text-sm text-red-600 mt-2">
                    You&apos;ve reached your monthly limit. Upgrade to Pro for 30 analyses/month.
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
