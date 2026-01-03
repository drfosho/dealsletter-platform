import { supabase } from '@/lib/supabase/client';

export interface UsageTracking {
  id: string;
  user_id: string;
  subscription_id?: string;
  period_start: string;
  period_end: string;
  analysis_count: number;
  last_analysis_at?: string;
  created_at?: string;
  updated_at?: string;
  // For backwards compatibility in display functions
  month_year?: string;
}

export interface UsageCheckResult {
  can_analyze: boolean;
  remaining_analyses: number;
  message: string;
}

export interface SubscriptionLimits {
  basic: number;
  pro: number;
  'pro-plus': number;
  premium: number;
  [key: string]: number;
}

// NEW PRICING STRUCTURE (December 2024):
// - FREE: 3 analyses/month
// - PRO: 50 analyses/month @ $29/month
// - PRO PLUS: 200 analyses/month @ $59/month
export const SUBSCRIPTION_LIMITS: SubscriptionLimits = {
  basic: 3,        // Free tier: 3 analyses per month
  pro: 50,         // Pro tier: 50 analyses per month @ $29/month
  'pro-plus': 200, // Pro Plus tier: 200 analyses per month @ $59/month
  premium: 50      // Legacy - grandfathered Pro users get same 50 limit
};

/**
 * Check if a user can perform an analysis based on their subscription tier and usage
 * @param userId - The user's ID
 * @returns Object with can_analyze boolean, remaining analyses, and message
 */
export async function checkAnalysisUsage(userId: string): Promise<UsageCheckResult> {
  try {
    const { data, error } = await supabase
      .rpc('can_user_analyze', { p_user_id: userId })
      .single();

    if (error) {
      console.error('Error checking analysis usage:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return {
        can_analyze: false,
        remaining_analyses: 0,
        message: 'Error checking usage limits. Please try again.'
      };
    }

    // Ensure we're returning the correct format
    console.log('[checkAnalysisUsage] Raw RPC response:', data);
    
    // If data is wrapped in an array or has a different structure, handle it
    const result = Array.isArray(data) ? data[0] : data;
    
    return {
      can_analyze: result.can_analyze || false,
      remaining_analyses: result.remaining_analyses || 0,
      message: result.message || 'Unknown status'
    } as UsageCheckResult;
  } catch (error) {
    const err = error as { message?: string; code?: string; details?: string; hint?: string };
    console.error('Error in checkAnalysisUsage:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint
    });
    return {
      can_analyze: false,
      remaining_analyses: 0,
      message: 'Error checking usage limits. Please try again.'
    };
  }
}

/**
 * Increment the analysis usage count for the current month
 * @param userId - The user's ID
 * @returns Updated usage record or error
 */
export async function incrementAnalysisUsage(userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('increment_analysis_usage', { p_user_id: userId });

    if (error) {
      console.error('Error incrementing analysis usage:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in incrementAnalysisUsage:', error);
    return { data: null, error };
  }
}

/**
 * Get current month's usage for a user
 * @param userId - The user's ID
 * @returns Usage record for current month
 */
export async function getCurrentMonthUsage(userId: string) {
  try {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format for display
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Query using period_start/period_end columns (matches database schema)
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('period_start', periodStart.toISOString())
      .lt('period_end', periodEnd.toISOString())
      .order('period_start', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching current month usage:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    // If no record exists, return a default one
    if (!data) {
      return {
        data: {
          analysis_count: 0,
          month_year: currentMonth,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          remaining_analyses: 0
        },
        error: null
      };
    }

    // Add month_year for backwards compatibility
    return {
      data: {
        ...data,
        month_year: currentMonth
      },
      error: null
    };
  } catch (error) {
    const err = error as { message?: string; code?: string; details?: string; hint?: string };
    console.error('Error in getCurrentMonthUsage:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint
    });
    return { data: null, error };
  }
}

/**
 * Get usage history for a user (last 12 months)
 * @param userId - The user's ID
 * @returns Array of usage records
 */
export async function getUsageHistory(userId: string, months: number = 12) {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Use first day of start month and first day of month after end month
    const periodStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const periodEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1);

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('period_start', periodStart.toISOString())
      .lt('period_end', periodEnd.toISOString())
      .order('period_start', { ascending: false });

    if (error) {
      console.error('Error fetching usage history:', error);
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getUsageHistory:', error);
    return { data: [], error };
  }
}

/**
 * Calculate remaining analyses for the current month
 * @param subscriptionTier - User's subscription tier
 * @param currentUsage - Current month's usage count
 * @returns Number of remaining analyses (-1 for unlimited)
 */
export function calculateRemainingAnalyses(
  subscriptionTier: string,
  currentUsage: number
): number {
  const limit = SUBSCRIPTION_LIMITS[subscriptionTier as keyof SubscriptionLimits] || 0;
  
  // If unlimited (premium)
  if (limit === -1) {
    return -1;
  }
  
  // Calculate remaining
  const remaining = limit - currentUsage;
  return Math.max(0, remaining);
}

/**
 * Get a formatted message about remaining analyses
 * @param subscriptionTier - User's subscription tier
 * @param remaining - Number of remaining analyses
 * @returns Formatted message string
 */
export function getRemainingAnalysesMessage(
  subscriptionTier: string,
  remaining: number
): string {
  // Pro Plus users have 200 analyses per month
  if (subscriptionTier === 'pro-plus') {
    if (remaining === 0) {
      return 'Monthly limit reached. Contact us for enterprise pricing.';
    }
    return `${remaining} of 200 analyses remaining this month`;
  }

  // Pro and premium users have 50 analyses per month
  if (subscriptionTier === 'pro' || subscriptionTier === 'premium') {
    if (remaining === 0) {
      return 'Monthly limit reached. Upgrade to Pro Plus for 200 analyses/month';
    }
    return `${remaining} of 50 analyses remaining this month`;
  }

  if (remaining === 0) {
    return 'Monthly limit reached. Upgrade to Pro for 50 analyses/month';
  }

  if (remaining === 1) {
    return '1 analysis remaining this month';
  }

  return `${remaining} of 3 analyses remaining this month`;
}

/**
 * Format month_year string to readable format
 * @param monthYear - Month in YYYY-MM format
 * @returns Formatted month string (e.g., "January 2024")
 */
export function formatMonthYear(monthYear: string): string {
  const [year, month] = monthYear.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}