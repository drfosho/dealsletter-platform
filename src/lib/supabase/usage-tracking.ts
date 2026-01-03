import { supabase } from '@/lib/supabase/client';

export interface UsageTracking {
  id: string;
  user_id: string;
  month_year: string; // Format: 'YYYY-MM'
  analysis_count: number;
  last_analysis_at?: string;
  created_at?: string;
  updated_at?: string;
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
      console.error('Error checking analysis usage:', JSON.stringify(error, null, 2));
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
    console.error('Error in checkAnalysisUsage:', error instanceof Error ? error.message : JSON.stringify(error));
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
    // Format as YYYY-MM to match database schema
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Query using month_year column (matches actual database schema)
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching current month usage:', JSON.stringify(error, null, 2));
      throw error;
    }

    // If no record exists, return a default one
    if (!data) {
      return {
        data: {
          analysis_count: 0,
          month_year: currentMonth
        },
        error: null
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getCurrentMonthUsage:', error instanceof Error ? error.message : JSON.stringify(error));
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
    // Calculate date range - generate list of month_year values
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // Generate month_year values for the range
    const monthYears: string[] = [];
    const current = new Date(startDate);
    while (current <= now) {
      monthYears.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
      current.setMonth(current.getMonth() + 1);
    }

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .in('month_year', monthYears)
      .order('month_year', { ascending: false });

    if (error) {
      console.error('Error fetching usage history:', JSON.stringify(error, null, 2));
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getUsageHistory:', error instanceof Error ? error.message : JSON.stringify(error));
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