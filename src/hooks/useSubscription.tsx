'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAnalysisLimit } from '@/lib/stripe'

interface SubscriptionData {
  tier: string
  status: string
  analysisLimit: number
  analysisUsed: number
  canAnalyze: boolean
  remainingAnalyses: number
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setSubscription({
            tier: 'free',
            status: 'inactive',
            analysisLimit: 0,
            analysisUsed: 0,
            canAnalyze: false,
            remainingAnalyses: 0,
          })
          return
        }

        // Get user's profile with subscription info
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status')
          .eq('id', user.id)
          .single()

        const tier = profile?.subscription_tier || 'free'
        const status = profile?.subscription_status || 'inactive'

        // Get current period usage
        const currentPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM
        const { data: usage } = await supabase
          .from('usage_tracking')
          .select('analysis_count')
          .eq('user_id', user.id)
          .eq('period', currentPeriod)
          .single()

        const analysisUsed = usage?.analysis_count || 0
        const analysisLimit = getAnalysisLimit(tier)
        const canAnalyze = analysisLimit === -1 || analysisUsed < analysisLimit
        const remainingAnalyses = analysisLimit === -1 ? -1 : Math.max(0, analysisLimit - analysisUsed)

        setSubscription({
          tier,
          status,
          analysisLimit,
          analysisUsed,
          canAnalyze,
          remainingAnalyses,
        })
      } catch (error) {
        console.error('Error fetching subscription data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionData()

    // Subscribe to auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscriptionData()
    })

    return () => {
      authSubscription.unsubscribe()
    }
  }, [supabase])

  const checkAnalysisLimit = async (): Promise<boolean> => {
    if (!subscription) return false
    
    if (subscription.tier === 'free') {
      return false
    }

    if (subscription.analysisLimit === -1) {
      return true // Unlimited
    }

    return subscription.canAnalyze
  }

  const incrementAnalysisCount = async (propertyId: string, propertyAddress: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase.rpc('increment_analysis_count', {
        p_user_id: user.id,
        p_property_id: propertyId,
        p_property_address: propertyAddress,
      })

      if (error) {
        console.error('Error incrementing analysis count:', error)
        return false
      }

      // Refresh subscription data
      const currentPeriod = new Date().toISOString().slice(0, 7)
      const { data: usage } = await supabase
        .from('usage_tracking')
        .select('analysis_count')
        .eq('user_id', user.id)
        .eq('period', currentPeriod)
        .single()

      if (subscription) {
        const analysisUsed = usage?.analysis_count || 0
        const canAnalyze = subscription.analysisLimit === -1 || analysisUsed < subscription.analysisLimit
        const remainingAnalyses = subscription.analysisLimit === -1 ? -1 : Math.max(0, subscription.analysisLimit - analysisUsed)

        setSubscription({
          ...subscription,
          analysisUsed,
          canAnalyze,
          remainingAnalyses,
        })
      }

      return data
    } catch (error) {
      console.error('Error incrementing analysis count:', error)
      return false
    }
  }

  return {
    subscription,
    loading,
    checkAnalysisLimit,
    incrementAnalysisCount,
  }
}