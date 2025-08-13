import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface SubscriptionCheck {
  allowed: boolean
  message?: string
  tier?: string
  remainingAnalyses?: number
}

/**
 * Check if user can perform an analysis based on their subscription
 */
export async function checkSubscriptionLimit(userId: string): Promise<SubscriptionCheck> {
  const supabase = await createClient()

  try {
    // Get user's subscription details
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return {
        allowed: false,
        message: 'Unable to verify subscription status'
      }
    }

    // Free tier users cannot analyze
    if (profile.subscription_tier === 'free' || !profile.subscription_tier) {
      return {
        allowed: false,
        message: 'Upgrade to a paid plan to analyze properties',
        tier: 'free'
      }
    }

    // Check if subscription is active
    if (profile.subscription_status !== 'active' && profile.subscription_status !== 'trialing') {
      return {
        allowed: false,
        message: 'Your subscription is not active. Please update your billing.',
        tier: profile.subscription_tier
      }
    }

    // Check analysis limit using the database function
    const { data: limitCheck, error: limitError } = await supabase
      .rpc('check_analysis_limit', { p_user_id: userId })
      .single()

    if (limitError) {
      console.error('Error checking analysis limit:', limitError)
      return {
        allowed: false,
        message: 'Unable to verify analysis limit'
      }
    }

    if (!(limitCheck as any).can_analyze) {
      return {
        allowed: false,
        message: `You've reached your monthly limit of ${(limitCheck as any).tier_limit} analyses. Upgrade your plan to continue.`,
        tier: profile.subscription_tier,
        remainingAnalyses: 0
      }
    }

    return {
      allowed: true,
      tier: profile.subscription_tier,
      remainingAnalyses: (limitCheck as any).remaining_analyses
    }
  } catch (error) {
    console.error('Subscription check error:', error)
    return {
      allowed: false,
      message: 'An error occurred while checking your subscription'
    }
  }
}

/**
 * Increment analysis count after successful analysis
 */
export async function incrementAnalysisUsage(
  userId: string, 
  propertyId: string, 
  propertyAddress: string
): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .rpc('increment_analysis_count', {
        p_user_id: userId,
        p_property_id: propertyId,
        p_property_address: propertyAddress
      })

    if (error) {
      console.error('Error incrementing analysis count:', error)
      return false
    }

    return data === true
  } catch (error) {
    console.error('Error incrementing usage:', error)
    return false
  }
}

/**
 * Middleware to protect analysis endpoints
 */
export async function withSubscriptionCheck(
  request: Request,
  handler: (userId: string) => Promise<NextResponse>
) {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Check subscription limit
  const subscriptionCheck = await checkSubscriptionLimit(user.id)

  if (!subscriptionCheck.allowed) {
    return NextResponse.json(
      { 
        error: subscriptionCheck.message,
        tier: subscriptionCheck.tier,
        requiresUpgrade: true
      },
      { status: 403 }
    )
  }

  // Call the handler with the user ID
  return handler(user.id)
}