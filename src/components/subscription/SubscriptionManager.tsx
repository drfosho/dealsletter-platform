'use client';

import { useState, useEffect } from 'react';
import { 
  getSubscriptionWithUsage, 
  cancelSubscription, 
  resumeSubscription,
  type SubscriptionWithUsage 
} from '@/lib/subscription/client';
import { CheckCircle, AlertCircle, CreditCard, BarChart3, Calendar } from 'lucide-react';

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState<SubscriptionWithUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }

    setActionLoading(true);
    try {
      const success = await cancelSubscription();
      if (success) {
        await loadSubscriptionData();
        alert('Subscription canceled successfully. You will still have access until the end of your billing period.');
      } else {
        alert('Failed to cancel subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setActionLoading(true);
    try {
      const success = await resumeSubscription();
      if (success) {
        await loadSubscriptionData();
        alert('Subscription resumed successfully!');
      } else {
        alert('Failed to resume subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        alert('Failed to open billing portal. Please try again.');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
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
  const isActive = sub?.status === 'active' || sub?.status === 'trialing';
  const willCancel = sub?.cancel_at_period_end;

  return (
    <div className="space-y-6">
      {/* Subscription Status Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">Subscription Status</h2>
          {isActive ? (
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
          </div>

          {/* Usage */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Monthly Usage</span>
            </div>
            <p className="text-2xl font-bold">
              {usage?.analysis_count || 0} / {limits?.analysis_limit || 3}
            </p>
            <div className="w-full bg-muted/20 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min(100, ((usage?.analysis_count || 0) / (limits?.analysis_limit || 3)) * 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Billing Period */}
          {sub?.current_period_end && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Next Billing Date</span>
              </div>
              <p className="text-lg font-semibold">
                {new Date(sub.current_period_end).toLocaleDateString()}
              </p>
              {willCancel && (
                <p className="text-sm text-amber-600">Cancels on this date</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
          <button
            onClick={handleUpdatePayment}
            disabled={actionLoading || !isActive}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Manage Billing
          </button>

          {isActive && !willCancel && (
            <button
              onClick={handleCancelSubscription}
              disabled={actionLoading}
              className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel Subscription
            </button>
          )}

          {willCancel && (
            <button
              onClick={handleResumeSubscription}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Resume Subscription
            </button>
          )}

          {tier !== 'premium' && (
            <a
              href="/pricing"
              className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
            >
              Upgrade Plan
            </a>
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
    </div>
  );
}