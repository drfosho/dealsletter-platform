'use client';

import { useMemo } from 'react';

interface UsageStatsProps {
  usage: {
    used: number;
    limit: number;
    nextReset: Date;
  };
}

export default function UsageStats({ usage }: UsageStatsProps) {
  // Ensure we have valid numbers with fallbacks
  const safeUsed = typeof usage?.used === 'number' && !isNaN(usage.used) ? usage.used : 0;
  const safeLimit = typeof usage?.limit === 'number' && !isNaN(usage.limit) && usage.limit > 0 ? usage.limit : 3;
  const safeRemaining = Math.max(0, safeLimit - safeUsed);

  const { percentageUsed, daysUntilReset, isNearLimit } = useMemo(() => {
    const percentage = safeLimit > 0 ? (safeUsed / safeLimit) * 100 : 0;
    const now = new Date();
    const reset = usage?.nextReset ? new Date(usage.nextReset) : new Date();
    const days = Math.ceil((reset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      percentageUsed: isNaN(percentage) ? 0 : percentage,
      daysUntilReset: Math.max(0, isNaN(days) ? 0 : days),
      isNearLimit: percentage >= 80
    };
  }, [safeUsed, safeLimit, usage?.nextReset]);

  const getUsageColor = () => {
    if (percentageUsed >= 90) return 'text-red-600 bg-red-100';
    if (percentageUsed >= 80) return 'text-orange-600 bg-orange-100';
    if (percentageUsed >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getProgressColor = () => {
    if (percentageUsed >= 90) return 'bg-red-500';
    if (percentageUsed >= 80) return 'bg-orange-500';
    if (percentageUsed >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-1">Usage Statistics</h3>
          <p className="text-sm text-muted">
            {safeUsed} of {safeLimit} analyses used this month
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getUsageColor()}`}>
          {percentageUsed.toFixed(0)}% Used
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(100, percentageUsed)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{safeUsed}</p>
          <p className="text-sm text-muted">Analyses Used</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{safeRemaining}</p>
          <p className="text-sm text-muted">Remaining</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{daysUntilReset}</p>
          <p className="text-sm text-muted">Days Until Reset</p>
        </div>
      </div>

      {/* Warning Message */}
      {isNearLimit && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            You're approaching your monthly limit. Consider upgrading your plan for more analyses.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 flex gap-3">
        <button className="flex-1 px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 font-medium">
          Upgrade Plan
        </button>
        <button className="flex-1 px-4 py-2 bg-card border border-primary text-primary rounded-lg hover:bg-primary/5 font-medium">
          View Usage History
        </button>
      </div>
    </div>
  );
}