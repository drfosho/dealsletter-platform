/**
 * Client-side subscription utilities
 */

import { createClient } from '@/lib/supabase/client';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'premium';
export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'trialing' 
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancel_at: string | null;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UsageLimit {
  tier: SubscriptionTier;
  analysis_limit: number;
  features: {
    deal_alerts: boolean;
    basic_analysis?: boolean;
    advanced_analysis?: boolean;
    pdf_export: boolean;
    priority_support: boolean;
    email_support?: boolean;
    phone_support?: boolean;
    early_access?: boolean;
    api_access?: boolean;
    team_collaboration?: boolean;
  };
}

export interface UsageTracking {
  id: string;
  user_id: string;
  subscription_id: string | null;
  period_start: string;
  period_end: string;
  analysis_count: number;
  last_analysis_at: string | null;
}

export interface SubscriptionWithUsage {
  subscription: Subscription | null;
  usage: UsageTracking | null;
  limits: UsageLimit | null;
  canAnalyze: boolean;
  remainingAnalyses: number;
}

// Get user's current subscription
export async function getUserSubscription(): Promise<Subscription | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
}

// Get usage limits for a tier
export async function getUsageLimits(tier: SubscriptionTier): Promise<UsageLimit | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('usage_limits')
    .select('*')
    .eq('tier', tier)
    .single();

  if (error) {
    console.error('Error fetching usage limits:', error);
    return null;
  }

  return data;
}

// Get current usage for the user
export async function getCurrentUsage(): Promise<UsageTracking | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const { data, error } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', user.id)
    .gte('period_start', periodStart.toISOString())
    .lt('period_end', periodEnd.toISOString())
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching usage:', error);
    return null;
  }

  return data || {
    id: '',
    user_id: user.id,
    subscription_id: null,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    analysis_count: 0,
    last_analysis_at: null
  };
}

// Get subscription with usage information
export async function getSubscriptionWithUsage(): Promise<SubscriptionWithUsage> {
  const [subscription, usage] = await Promise.all([
    getUserSubscription(),
    getCurrentUsage()
  ]);

  const tier = subscription?.tier || 'free';
  const limits = await getUsageLimits(tier);

  const analysisLimit = limits?.analysis_limit || 3; // Default to free tier
  const analysisUsed = usage?.analysis_count || 0;
  const remainingAnalyses = Math.max(0, analysisLimit - analysisUsed);
  const canAnalyze = remainingAnalyses > 0;

  return {
    subscription,
    usage,
    limits,
    canAnalyze,
    remainingAnalyses
  };
}

// Check if user can perform analysis
export async function checkAnalysisLimit(): Promise<{
  canAnalyze: boolean;
  currentUsage: number;
  limit: number;
  tier: SubscriptionTier;
}> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      canAnalyze: false,
      currentUsage: 0,
      limit: 0,
      tier: 'free'
    };
  }

  const { data, error } = await supabase
    .rpc('check_analysis_limit', { user_uuid: user.id })
    .single();

  if (error) {
    console.error('Error checking analysis limit:', error);
    return {
      canAnalyze: false,
      currentUsage: 0,
      limit: 3,
      tier: 'free'
    };
  }

  return {
    canAnalyze: (data as any).can_analyze,
    currentUsage: (data as any).current_usage,
    limit: (data as any).usage_limit,
    tier: (data as any).tier
  };
}

// Increment usage count
export async function incrementUsage(): Promise<boolean> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .rpc('increment_usage', { user_uuid: user.id });

  if (error) {
    console.error('Error incrementing usage:', error);
    return false;
  }

  return true;
}

// Get billing history
export async function getBillingHistory() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('billing_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching billing history:', error);
    return [];
  }

  return data;
}

// Cancel subscription
export async function cancelSubscription(): Promise<boolean> {
  try {
    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return true;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
}

// Resume subscription
export async function resumeSubscription(): Promise<boolean> {
  try {
    const response = await fetch('/api/stripe/resume-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to resume subscription');
    }

    return true;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return false;
  }
}

// Update payment method
export async function updatePaymentMethod(): Promise<string | null> {
  try {
    const response = await fetch('/api/stripe/create-setup-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to create setup session');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating setup session:', error);
    return null;
  }
}