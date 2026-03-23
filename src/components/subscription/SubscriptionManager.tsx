'use client';

import { useState, useEffect } from 'react';
import {
  getSubscriptionWithUsage,
  resumeSubscription,
  type SubscriptionWithUsage
} from '@/lib/subscription/client';
import { CheckCircle, AlertCircle, CreditCard, BarChart3, Calendar } from 'lucide-react';
import CancelSubscriptionModal from './CancelSubscriptionModal';

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState<SubscriptionWithUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradePreview, setUpgradePreview] = useState<{
    prorationAmount: number;
    newRecurringAmount: number;
    totalDueToday: number;
  } | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const data = await getSubscriptionWithUsage();
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleCanceled = async (accessUntilDate: string) => {
    setShowCancelModal(false);
    await loadSubscriptionData();
    setToast(`Subscription canceled — access continues until ${accessUntilDate}`);
    setTimeout(() => setToast(null), 6000);
  };

  const handleResumeSubscription = async () => {
    setActionLoading(true);
    console.log('[SubscriptionManager] Resuming subscription...');
    try {
      const success = await resumeSubscription();
      console.log('[SubscriptionManager] Resume result:', success);
      if (success) {
        await loadSubscriptionData();
        alert('Subscription resumed successfully! Your plan will continue without interruption.');
      } else {
        alert('Failed to resume subscription. Please try again or contact support.');
      }
    } catch (error) {
      console.error('[SubscriptionManager] Error resuming subscription:', error);
      alert('An error occurred while resuming. Please try again or contact support.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    setActionLoading(true);
    try {
      console.log('[SubscriptionManager] Opening billing portal...');
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('[SubscriptionManager] Billing portal response:', response.status, data);

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400 && data.error?.includes('No billing account')) {
          alert('You need to subscribe to a plan before accessing the billing portal. Redirecting to pricing...');
          window.location.href = '/pricing';
          return;
        }
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        console.log('[SubscriptionManager] Redirecting to:', data.url);
        window.location.href = data.url;
      } else {
        alert('Failed to open billing portal. Please try again.');
      }
    } catch (error) {
      console.error('[SubscriptionManager] Error opening billing portal:', error);
      alert('An error occurred while opening the billing portal. Please try again or contact support.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgradeClick = async () => {
    setUpgradeLoading(true);
    setUpgradePreview(null);
    try {
      const res = await fetch('/api/stripe/preview-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier: 'PRO_PLUS' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUpgradePreview(data);
      setShowUpgradeModal(true);
    } catch (error) {
      console.error('[SubscriptionManager] Preview upgrade error:', error);
      alert('Failed to load upgrade preview. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleConfirmUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const res = await fetch('/api/stripe/upgrade-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier: 'PRO_PLUS' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowUpgradeModal(false);
      setUpgradePreview(null);
      await loadSubscriptionData();
      setToast('Upgraded to Pro Plus! Your new limits are now active.');
      setTimeout(() => setToast(null), 6000);
    } catch (error) {
      console.error('[SubscriptionManager] Upgrade error:', error);
      alert('Failed to upgrade. Please try again or contact support.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 animate-pulse">
        <div className="h-8 bg-muted/20 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-muted/20 rounded w-full"></div>
          <div className="h-4 bg-muted/20 rounded w-3/4"></div>
          <div className="h-4 bg-muted/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const { subscription: sub, usage, limits, remainingAnalyses } = subscription || {};
  const tier = sub?.tier || 'free';
  const isFree = !sub || tier === 'free' || tier === 'basic' || tier === 'starter';
  const isActive = sub?.status === 'active' || sub?.status === 'trialing';
  const willCancel = sub?.cancel_at_period_end;
  const hasBilling = !!sub?.stripe_customer_id;

  return (
    <div className="space-y-6">
      {/* Subscription Status Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Subscription Status</h2>
          {isFree ? (
            <div className="flex items-center gap-2 text-muted">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Free Plan</span>
            </div>
          ) : isActive ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Inactive</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">Current Plan</span>
            </div>
            <p className="text-2xl font-bold capitalize">{tier}</p>
            {sub?.status === 'trialing' && (
              <p className="text-sm text-amber-600">Trial Period</p>
            )}
            {willCancel && (
              <p className="text-sm text-amber-600">Canceling at period end</p>
            )}
          </div>

          {/* Usage */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Monthly Usage</span>
            </div>
            <p className="text-2xl font-bold">
              {usage?.analysis_count || 0} / {limits?.analysis_limit || 10}
            </p>
            <div className="w-full bg-muted/20 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((usage?.analysis_count || 0) / (limits?.analysis_limit || 10)) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Billing Period */}
          {sub?.current_period_end ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{willCancel ? 'Access Until' : 'Next Billing Date'}</span>
              </div>
              <p className="text-lg font-semibold">
                {new Date(sub.current_period_end).toLocaleDateString()}
              </p>
              {willCancel && (
                <p className="text-sm text-amber-600">Subscription ends on this date</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Billing</span>
              </div>
              <p className="text-lg font-semibold text-muted">No active billing</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
          {/* Manage Billing — only for users with a Stripe customer */}
          {hasBilling && (
            <button
              onClick={handleUpdatePayment}
              disabled={actionLoading}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading ? 'Loading...' : 'Manage Billing'}
            </button>
          )}

          {/* Cancel — for active paid subscriptions not already canceling */}
          {isActive && !willCancel && !isFree && (
            <button
              onClick={handleCancelClick}
              disabled={actionLoading}
              className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading ? 'Canceling...' : 'Cancel Subscription'}
            </button>
          )}

          {/* Resume — for subscriptions scheduled to cancel */}
          {willCancel && (
            <button
              onClick={handleResumeSubscription}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading ? 'Resuming...' : 'Resume Subscription'}
            </button>
          )}

          {/* Upgrade — for free users, link to pricing */}
          {isFree && (
            <a
              href="/pricing"
              className="px-4 py-2 rounded-lg transition-colors bg-accent text-white hover:bg-accent/90"
            >
              Upgrade to Pro
            </a>
          )}

          {/* Upgrade — for Pro users, upgrade to Pro Plus with proration */}
          {!isFree && isActive && !willCancel && tier === 'pro' && (
            <button
              onClick={handleUpgradeClick}
              disabled={upgradeLoading}
              className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {upgradeLoading ? 'Loading...' : 'Upgrade to Pro Plus'}
            </button>
          )}
        </div>
      </div>

      {/* Features */}
      {limits?.features && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Plan Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(limits.features).map(([key, value]) => {
              if (typeof value !== 'boolean') return null;
              const featureName = key.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
              
              return (
                <div key={key} className="flex items-center gap-2">
                  {value ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted" />
                  )}
                  <span className={value ? 'text-primary' : 'text-muted line-through'}>
                    {featureName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Usage Details */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Usage Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted">Analyses Used This Month</span>
            <span className="font-semibold">{usage?.analysis_count || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted">Remaining Analyses</span>
            <span className="font-semibold text-green-600">{remainingAnalyses || 0}</span>
          </div>
          {usage?.last_analysis_at && (
            <div className="flex justify-between items-center">
              <span className="text-muted">Last Analysis</span>
              <span className="text-sm">
                {new Date(usage.last_analysis_at).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="text-muted">Billing Period</span>
            <span className="text-sm">
              {usage?.period_start && usage?.period_end && (
                <>
                  {new Date(usage.period_start).toLocaleDateString()} - 
                  {new Date(usage.period_end).toLocaleDateString()}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade confirmation modal */}
      {showUpgradeModal && upgradePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUpgradeModal(false)} />
          <div className="relative bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-primary mb-2">Upgrade to Pro Plus</h3>
            <p className="text-muted text-sm mb-6">
              Your plan will be upgraded immediately with prorated billing.
            </p>

            <div className="bg-muted/10 rounded-lg p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted">Prorated charge today</span>
                <span className="font-semibold text-primary">
                  ${upgradePreview.totalDueToday.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-muted">Then going forward</span>
                <span className="font-semibold text-primary">
                  ${upgradePreview.newRecurringAmount.toFixed(2)}/month
                </span>
              </div>
            </div>

            <p className="text-xs text-muted mb-6">
              You&apos;ll be charged approximately ${upgradePreview.totalDueToday.toFixed(2)} today
              for the remainder of this billing period, then ${upgradePreview.newRecurringAmount.toFixed(2)}/month going forward.
              Your analysis limit increases from 50 to 200 per month immediately.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2.5 border border-border text-primary rounded-lg hover:bg-muted/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                disabled={upgradeLoading}
                className="flex-1 px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors font-medium"
              >
                {upgradeLoading ? 'Upgrading...' : 'Confirm Upgrade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel subscription modal */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onCanceled={handleCanceled}
        tier={tier}
        accessEndDate={sub?.current_period_end || null}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 bg-[#141418] border border-[#2a2a3a] rounded-xl px-5 py-3.5 shadow-2xl">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-[#d1d5db]">{toast}</span>
            <button onClick={() => setToast(null)} className="text-[#6b7280] hover:text-white ml-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}