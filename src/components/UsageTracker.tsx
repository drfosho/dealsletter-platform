'use client'

import { useSubscription } from '@/hooks/useSubscription'
import { BarChart3, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'

export default function UsageTracker() {
  const { subscription, loading } = useSubscription()

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border/60 p-6 animate-pulse">
        <div className="h-4 bg-muted/20 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-muted/20 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-muted/20 rounded w-2/3"></div>
      </div>
    )
  }

  if (!subscription) return null

  const percentage = subscription.analysisLimit > 0 
    ? (subscription.analysisUsed / subscription.analysisLimit) * 100
    : 0

  const getStatusColor = () => {
    if (percentage >= 100) return 'text-red-500 bg-red-500'
    if (percentage >= 80) return 'text-amber-500 bg-amber-500'
    if (percentage >= 50) return 'text-yellow-500 bg-yellow-500'
    return 'text-green-500 bg-green-500'
  }

  const { text: textColor, bg: bgColor } = {
    text: getStatusColor().split(' ')[0],
    bg: getStatusColor().split(' ')[1]
  }

  return (
    <div className="bg-card rounded-xl border border-border/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-primary">Monthly Usage</h3>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          subscription.tier === 'free' ? 'bg-gray-500/10 text-gray-600' :
          subscription.tier === 'starter' ? 'bg-blue-500/10 text-blue-600' :
          subscription.tier === 'pro' ? 'bg-purple-500/10 text-purple-600' :
          'bg-amber-500/10 text-amber-600'
        }`}>
          {subscription.tier.toUpperCase()}
        </div>
      </div>

      {subscription.tier === 'free' ? (
        <div className="text-center py-8">
          <Zap className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-muted mb-4">
            Upgrade to start analyzing properties
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            View Plans
          </Link>
        </div>
      ) : subscription.analysisLimit === -1 ? (
        <div className="text-center py-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-primary">Unlimited</span>
          </div>
          <p className="text-sm text-muted">
            {subscription.analysisUsed} analyses this month
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-primary">
                {subscription.analysisUsed}
              </span>
              <span className="text-sm text-muted">
                of {subscription.analysisLimit} analyses
              </span>
            </div>
            
            <div className="w-full bg-muted/10 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${bgColor} transition-all duration-300`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {subscription.remainingAnalyses > 0 ? (
                <span>
                  <span className={textColor}>{subscription.remainingAnalyses}</span> remaining
                </span>
              ) : (
                <span className="text-red-500">Limit reached</span>
              )}
            </p>

            {percentage >= 80 && (
              <Link
                href="/pricing"
                className="text-sm text-accent hover:text-accent/80 font-medium"
              >
                Upgrade →
              </Link>
            )}
          </div>
        </>
      )}

      <div className="mt-4 pt-4 border-t border-border/20">
        <p className="text-xs text-muted">
          Resets on the 1st of each month
        </p>
      </div>
    </div>
  )
}