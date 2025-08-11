'use client'

import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'
import { AlertCircle, Zap, TrendingUp } from 'lucide-react'

export default function SubscriptionBanner() {
  const { subscription, loading } = useSubscription()

  if (loading || !subscription) return null

  // Don't show banner for premium users with unlimited analyses
  if (subscription.tier === 'premium') return null

  // Show warning when approaching limit
  const showWarning = subscription.remainingAnalyses > 0 && subscription.remainingAnalyses <= 3
  const showLimit = subscription.remainingAnalyses === 0

  if (!showWarning && !showLimit && subscription.tier !== 'free') return null

  return (
    <div className={`
      fixed bottom-4 right-4 max-w-sm p-4 rounded-lg shadow-lg z-40
      ${showLimit ? 'bg-red-500/10 border border-red-500/30' : 
        showWarning ? 'bg-amber-500/10 border border-amber-500/30' : 
        'bg-primary/10 border border-primary/30'}
    `}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${
          showLimit ? 'bg-red-500/20' : 
          showWarning ? 'bg-amber-500/20' : 
          'bg-primary/20'
        }`}>
          {showLimit ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : showWarning ? (
            <TrendingUp className="w-5 h-5 text-amber-500" />
          ) : (
            <Zap className="w-5 h-5 text-primary" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-primary mb-1">
            {showLimit ? 'Analysis Limit Reached' : 
             showWarning ? `Only ${subscription.remainingAnalyses} analyses left` :
             'Upgrade Your Plan'}
          </h4>
          
          <p className="text-sm text-muted mb-3">
            {showLimit ? 
              `You've used all ${subscription.analysisLimit} analyses this month. Upgrade to continue analyzing properties.` :
             showWarning ? 
              `You're approaching your monthly limit of ${subscription.analysisLimit} analyses.` :
             subscription.tier === 'free' ?
              'Get access to personal property analysis and advanced features.' :
              'Unlock more analyses and premium features.'}
          </p>

          <div className="flex items-center space-x-2">
            <Link
              href="/pricing"
              className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              {subscription.tier === 'free' ? 'View Plans' : 'Upgrade Now'}
            </Link>
            
            {subscription.tier !== 'free' && (
              <div className="text-xs text-muted">
                {subscription.analysisUsed}/{subscription.analysisLimit} used
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}