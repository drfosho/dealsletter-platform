'use client';

import { useEffect, useState } from 'react';

interface UsageDisplayProps {
  userId: string;
  className?: string;
}

interface UsageData {
  analyses_used: number;
  tier_limit: number;
  subscription_tier: string;
  remaining: number;
  can_analyze: boolean;
  is_admin?: boolean;
}

export default function UsageDisplay({ userId, className = '' }: UsageDisplayProps) {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/analysis/usage');
        if (response.ok) {
          const data = await response.json();
          setUsageData(data);
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUsage();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-muted/20 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-muted/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!usageData) {
    return null;
  }

  const percentage = usageData.tier_limit > 0 
    ? (usageData.analyses_used / usageData.tier_limit) * 100 
    : 0;

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`bg-card rounded-xl border border-border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">Monthly Analysis Usage</h3>
        {usageData.is_admin && (
          <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded-full">
            Admin
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold text-primary">
            {usageData.analyses_used}
          </span>
          <span className="text-sm text-muted">
            / {usageData.tier_limit === 9999 ? '∞' : usageData.tier_limit} analyses
          </span>
        </div>
        
        {usageData.tier_limit !== 9999 && (
          <>
            <div className="w-full bg-muted/20 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            
            <p className="text-sm text-muted">
              {usageData.remaining > 0 
                ? `${usageData.remaining} analyses remaining this month`
                : 'Monthly limit reached'
              }
            </p>
          </>
        )}
        
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted">
            Plan: <span className="font-medium text-primary capitalize">
              {usageData.subscription_tier}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}