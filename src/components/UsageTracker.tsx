'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  checkAnalysisUsage, 
  getCurrentMonthUsage,
  type UsageCheckResult 
} from '@/lib/supabase/usage-tracking';

interface UsageTrackerProps {
  userId: string;
  subscriptionTier: string;
  variant?: 'compact' | 'detailed';
  showUpgradeButton?: boolean;
}

export default function UsageTracker({ 
  userId, 
  subscriptionTier, 
  variant = 'compact',
  showUpgradeButton = true 
}: UsageTrackerProps) {
  const [usage, setUsage] = useState<UsageCheckResult | null>(null);
  const [currentCount, setCurrentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get usage check result
      const usageResult = await checkAnalysisUsage(userId);
      setUsage(usageResult);

      // Get current month count
      const { data: monthData } = await getCurrentMonthUsage(userId);
      if (monthData) {
        setCurrentCount(monthData.analysis_count);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUsage();
  }, [userId, fetchUsage]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-muted/20 rounded w-32"></div>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const getProgressColor = () => {
    if (subscriptionTier === 'premium') return 'bg-green-600';
    if (subscriptionTier === 'basic') return 'bg-gray-400';
    
    const percentage = usage.remaining_analyses === -1 ? 100 : 
      ((15 - currentCount) / 15) * 100;
    
    if (percentage > 50) return 'bg-green-600';
    if (percentage > 20) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getUsagePercentage = () => {
    if (subscriptionTier === 'premium') return 100;
    if (subscriptionTier === 'basic') return 0;
    return ((15 - currentCount) / 15) * 100;
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <span className="text-muted">Analyses: </span>
          <span className={`font-medium ${usage.can_analyze ? 'text-primary' : 'text-red-500'}`}>
            {subscriptionTier === 'premium' ? '∞' : 
             subscriptionTier === 'basic' ? '0' :
             `${usage.remaining_analyses}/15`}
          </span>
        </div>
        {showUpgradeButton && subscriptionTier !== 'premium' && (
          <Link 
            href="/pricing"
            className="text-xs text-accent hover:text-accent/80 transition-colors"
          >
            Upgrade
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">Analysis Usage</h3>
        <span className="px-3 py-1 bg-accent/10 text-accent rounded-md text-sm font-medium capitalize">
          {subscriptionTier} Plan
        </span>
      </div>

      <div className="space-y-4">
        {/* Usage Message */}
        <p className="text-sm text-muted">
          {usage && typeof usage.message === 'string' ? usage.message : 'Loading...'}
        </p>

        {/* Progress Bar */}
        {subscriptionTier !== 'basic' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">This Month</span>
              <span className="font-medium">
                {subscriptionTier === 'premium' ? 
                  `${currentCount} analyzed` : 
                  `${currentCount} / 15`}
              </span>
            </div>
            <div className="w-full bg-muted/20 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${getUsagePercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 bg-muted/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {currentCount}
            </div>
            <div className="text-xs text-muted">Analyzed This Month</div>
          </div>
          <div className="text-center p-3 bg-muted/5 rounded-lg">
            <div className="text-2xl font-bold text-accent">
              {subscriptionTier === 'premium' ? '∞' : 
               subscriptionTier === 'basic' ? '0' :
               usage?.remaining_analyses || 0}
            </div>
            <div className="text-xs text-muted">Remaining</div>
          </div>
        </div>

        {/* Upgrade CTA */}
        {showUpgradeButton && subscriptionTier !== 'premium' && (
          <div className="pt-4 border-t border-border/20">
            <Link 
              href="/pricing"
              className="w-full px-4 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm text-center block"
            >
              {subscriptionTier === 'basic' ? 
                'Upgrade to Pro for 15 analyses/month' : 
                'Upgrade to Premium for unlimited analyses'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}