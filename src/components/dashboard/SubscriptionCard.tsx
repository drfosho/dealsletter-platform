'use client'

import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'
import { 
  Zap, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  BarChart3
} from 'lucide-react'

export default function SubscriptionCard() {
  const { subscription, loading } = useSubscription()

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border/60 p-6 animate-pulse">
        <div className="h-6 bg-muted/20 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-muted/20 rounded w-full"></div>
          <div className="h-4 bg-muted/20 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!subscription) return null

  const percentage = subscription.analysisLimit > 0 
    ? (subscription.analysisUsed / subscription.analysisLimit) * 100
    : 0

  const getTierIcon = () => {
    switch (subscription.tier) {
      case 'free': return '🟢'
      case 'starter': return '🔵'
      case 'pro': return '🚀'
      case 'premium': return '💎'
      default: return '🟢'
    }
  }

  const getTierColor = () => {
    switch (subscription.tier) {
      case 'free': return 'from-green-500 to-emerald-500'
      case 'starter': return 'from-blue-500 to-cyan-500'
      case 'pro': return 'from-purple-500 to-pink-500'
      case 'premium': return 'from-amber-500 to-orange-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-amber-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getTierColor()} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getTierIcon()}</span>
            <div>
              <h3 className="font-semibold text-lg">
                {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
              </h3>
              <p className="text-sm opacity-90">
                {subscription.status === 'active' ? 'Active' : 
                 subscription.status === 'trialing' ? 'Trial' : 
                 subscription.status}
              </p>
            </div>
          </div>
          <Link
            href="/account/subscription"
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Usage Progress */}
        {subscription.tier !== 'free' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Monthly Usage</span>
              </span>
              <span className="text-sm font-medium text-primary">
                {subscription.analysisLimit === -1 
                  ? `${subscription.analysisUsed} analyses`
                  : `${subscription.analysisUsed} / ${subscription.analysisLimit}`}
              </span>
            </div>
            
            {subscription.analysisLimit > 0 && (
              <div className="w-full bg-muted/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${getProgressColor()} transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            )}

            {/* Note: All plans now have fixed limits (Free: 3, Pro: 30) */}
          </div>
        )}

        {/* Upgrade prompt for free users */}
        {subscription.tier === 'free' && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary mb-1">
                  Unlock Property Analysis
                </p>
                <p className="text-xs text-muted mb-3">
                  Upgrade to analyze properties and access advanced features
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center text-xs font-medium text-accent hover:text-accent/80"
                >
                  View Plans
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Warning when approaching limit */}
        {subscription.tier !== 'free' && 
         subscription.analysisLimit > 0 && 
         subscription.remainingAnalyses <= 3 && 
         subscription.remainingAnalyses > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <p className="text-xs text-amber-600">
                Only {subscription.remainingAnalyses} analyses remaining this month
              </p>
            </div>
          </div>
        )}

        {/* Limit reached warning */}
        {subscription.remainingAnalyses === 0 && subscription.analysisLimit > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-xs text-red-600">
                Monthly limit reached. Upgrade to continue analyzing.
              </p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 bg-muted/5 rounded-lg">
            <TrendingUp className="w-5 h-5 text-muted mx-auto mb-1" />
            <p className="text-xs text-muted">This Month</p>
            <p className="text-lg font-semibold text-primary">
              {subscription.analysisUsed}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/5 rounded-lg">
            <Zap className="w-5 h-5 text-muted mx-auto mb-1" />
            <p className="text-xs text-muted">Remaining</p>
            <p className="text-lg font-semibold text-primary">
              {subscription.remainingAnalyses}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/account/subscription"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            Manage Subscription
          </Link>
          {subscription.tier !== 'premium' && (
            <Link
              href="/pricing"
              className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              Upgrade →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}