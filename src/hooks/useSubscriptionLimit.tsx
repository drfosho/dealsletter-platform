'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  checkAnalysisLimit,
  incrementUsage,
  getSubscriptionWithUsage,
  type SubscriptionWithUsage,
  type SubscriptionTier
} from '@/lib/subscription/client';

interface SubscriptionLimitContextType {
  canAnalyze: boolean;
  currentUsage: number;
  usageLimit: number;
  tier: SubscriptionTier;
  remainingAnalyses: number;
  subscription: SubscriptionWithUsage | null;
  loading: boolean;
  checkLimit: () => Promise<boolean>;
  useAnalysis: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const SubscriptionLimitContext = createContext<SubscriptionLimitContextType | undefined>(undefined);

export function SubscriptionLimitProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    canAnalyze: boolean;
    currentUsage: number;
    usageLimit: number;
    tier: SubscriptionTier;
    subscription: SubscriptionWithUsage | null;
    loading: boolean;
  }>({
    canAnalyze: false,
    currentUsage: 0,
    usageLimit: 3,
    tier: 'free',
    subscription: null,
    loading: true
  });

  const loadSubscriptionData = async () => {
    try {
      const [limitCheck, subscriptionData] = await Promise.all([
        checkAnalysisLimit(),
        getSubscriptionWithUsage()
      ]);

      setState({
        canAnalyze: limitCheck.canAnalyze,
        currentUsage: limitCheck.currentUsage,
        usageLimit: limitCheck.limit,
        tier: limitCheck.tier,
        subscription: subscriptionData,
        loading: false
      });

      return limitCheck.canAnalyze;
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const checkLimit = async (): Promise<boolean> => {
    const canAnalyze = await loadSubscriptionData();
    return canAnalyze;
  };

  const useAnalysis = async (): Promise<boolean> => {
    // First check if we can analyze
    const canAnalyze = await checkLimit();
    if (!canAnalyze) {
      return false;
    }

    // Increment usage
    const success = await incrementUsage();
    if (success) {
      // Reload data to reflect new usage
      await loadSubscriptionData();
    }
    
    return success;
  };

  const refresh = async () => {
    setState(prev => ({ ...prev, loading: true }));
    await loadSubscriptionData();
  };

  const remainingAnalyses = Math.max(0, state.usageLimit - state.currentUsage);

  return (
    <SubscriptionLimitContext.Provider
      value={{
        ...state,
        remainingAnalyses,
        checkLimit,
        useAnalysis,
        refresh
      }}
    >
      {children}
    </SubscriptionLimitContext.Provider>
  );
}

export function useSubscriptionLimit() {
  const context = useContext(SubscriptionLimitContext);
  if (context === undefined) {
    throw new Error('useSubscriptionLimit must be used within a SubscriptionLimitProvider');
  }
  return context;
}

// Component to show usage limit warning
export function UsageLimitWarning() {
  const { canAnalyze, remainingAnalyses, tier, usageLimit } = useSubscriptionLimit();

  if (canAnalyze && remainingAnalyses > 3) {
    return null; // Don't show warning if plenty of analyses left
  }

  if (!canAnalyze) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Monthly Analysis Limit Reached
            </h3>
            <div className="mt-1 text-sm text-red-700 dark:text-red-300">
              <p>
                You've used all {usageLimit} analyses in your {tier} plan this month.
              </p>
              <div className="mt-2">
                <a
                  href="/pricing"
                  className="font-medium underline hover:no-underline"
                >
                  Upgrade your plan
                </a>
                {' to continue analyzing properties.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (remainingAnalyses <= 3) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Low on Analyses
            </h3>
            <div className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              <p>
                You have {remainingAnalyses} {remainingAnalyses === 1 ? 'analysis' : 'analyses'} remaining this month.
              </p>
              {tier !== 'premium' && (
                <div className="mt-2">
                  <a
                    href="/pricing"
                    className="font-medium underline hover:no-underline"
                  >
                    Upgrade your plan
                  </a>
                  {' for more analyses.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Usage tracker component
export function UsageTracker({ variant = 'compact' }: { variant?: 'compact' | 'detailed' }) {
  const { currentUsage, usageLimit, remainingAnalyses, tier, loading } = useSubscriptionLimit();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-muted/20 rounded w-24"></div>
      </div>
    );
  }

  const percentage = (currentUsage / usageLimit) * 100;
  const color = percentage >= 100 ? 'bg-red-500' : 
                percentage >= 80 ? 'bg-amber-500' : 
                percentage >= 50 ? 'bg-yellow-500' : 
                'bg-green-500';

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted">Analyses:</span>
        <span className={`font-medium ${remainingAnalyses === 0 ? 'text-red-600' : 'text-primary'}`}>
          {currentUsage} / {usageLimit}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-primary">Monthly Usage</h3>
        <span className="text-xs text-muted capitalize">{tier} Plan</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Used</span>
          <span className="font-medium">{currentUsage} / {usageLimit}</span>
        </div>
        
        <div className="w-full bg-muted/20 rounded-full h-2">
          <div 
            className={`${color} h-2 rounded-full transition-all`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-muted">Remaining</span>
          <span className={`font-medium ${remainingAnalyses === 0 ? 'text-red-600' : 'text-green-600'}`}>
            {remainingAnalyses} {remainingAnalyses === 1 ? 'analysis' : 'analyses'}
          </span>
        </div>
      </div>

      {tier !== 'premium' && remainingAnalyses <= 3 && (
        <div className="mt-3 pt-3 border-t border-border">
          <a 
            href="/pricing" 
            className="text-xs text-accent hover:underline"
          >
            Upgrade for more analyses →
          </a>
        </div>
      )}
    </div>
  );
}