// Subscription tier management and feature gating
import { createClient } from '@/lib/supabase/client';

export type SubscriptionTier = 'free' | 'trial' | 'pro' | 'premium';

// Admin email addresses with full access
const ADMIN_EMAILS = [
  'kevin@dealsletter.io',
  // Add more admin emails here as needed
];

// Check if user is an admin
export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_tier: SubscriptionTier;
  trial_end_date?: string | null;
  subscription_end_date?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Feature access definitions
export const FEATURE_ACCESS = {
  // Free tier access
  free: {
    viewDeals: true,
    basicComparison: true,
    archiveAccess: 30, // days
    marketInsights: true,
    newsletter: true,
    propertyAnalysis: false,
    exportData: false,
    advancedCalculators: false,
    unlimitedAnalyses: false,
    prioritySupport: false,
  },
  
  // Trial tier (same as pro but time-limited)
  trial: {
    viewDeals: true,
    basicComparison: true,
    archiveAccess: 365, // days
    marketInsights: true,
    newsletter: true,
    propertyAnalysis: true,
    exportData: true,
    advancedCalculators: true,
    unlimitedAnalyses: true,
    prioritySupport: false,
  },
  
  // Pro tier
  pro: {
    viewDeals: true,
    basicComparison: true,
    archiveAccess: 365, // days
    marketInsights: true,
    newsletter: true,
    propertyAnalysis: true,
    exportData: true,
    advancedCalculators: true,
    unlimitedAnalyses: true,
    prioritySupport: true,
  },
  
  // Premium tier (future expansion)
  premium: {
    viewDeals: true,
    basicComparison: true,
    archiveAccess: -1, // unlimited
    marketInsights: true,
    newsletter: true,
    propertyAnalysis: true,
    exportData: true,
    advancedCalculators: true,
    unlimitedAnalyses: true,
    prioritySupport: true,
  },
};

// Get user's current subscription
export async function getUserSubscription(userId?: string): Promise<UserSubscription | null> {
  if (!userId) return null;
  
  const supabase = createClient();
  
  try {
    // First check if user is admin
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.email && isAdminUser(userData.user.email)) {
      // Return admin/pro tier for admin users
      return {
        id: 'admin-' + userId,
        user_id: userId,
        subscription_tier: 'pro', // Give admins pro tier access
        trial_end_date: null,
        subscription_end_date: null,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching subscription:', error);
      // Return free tier if no subscription found
      return {
        id: 'free-' + userId,
        user_id: userId,
        subscription_tier: 'free',
        trial_end_date: null,
        subscription_end_date: null,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    
    // Check if trial has expired
    if (data.subscription_tier === 'trial' && data.trial_end_date) {
      const trialEndDate = new Date(data.trial_end_date);
      if (trialEndDate < new Date()) {
        // Trial expired, downgrade to free
        return {
          ...data,
          subscription_tier: 'free',
        };
      }
    }
    
    // Check if subscription has expired
    if (data.subscription_end_date) {
      const subEndDate = new Date(data.subscription_end_date);
      if (subEndDate < new Date()) {
        // Subscription expired, downgrade to free
        return {
          ...data,
          subscription_tier: 'free',
        };
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    return null;
  }
}

// Check if user has access to a specific feature
export async function hasFeatureAccess(
  userId: string | undefined,
  feature: keyof typeof FEATURE_ACCESS.free
): Promise<boolean> {
  if (!userId) return FEATURE_ACCESS.free[feature] === true;
  
  // Check if user is admin first
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.email && isAdminUser(userData.user.email)) {
    return true; // Admins have access to everything
  }
  
  const subscription = await getUserSubscription(userId);
  const tier = subscription?.subscription_tier || 'free';
  
  // For pro tier (which includes admins), grant all access
  if (tier === 'pro' || tier === 'premium') {
    return true;
  }
  
  return FEATURE_ACCESS[tier][feature] === true;
}

// Get user's tier
export async function getUserTier(userId?: string): Promise<SubscriptionTier> {
  if (!userId) return 'free';
  
  // Check if user is admin first
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.email && isAdminUser(userData.user.email)) {
    return 'pro'; // Admins get pro tier
  }
  
  const subscription = await getUserSubscription(userId);
  return subscription?.subscription_tier || 'free';
}

// Check if user can perform analysis
export async function canPerformAnalysis(userId?: string): Promise<{
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
}> {
  if (!userId) {
    return {
      allowed: false,
      reason: 'Please sign in to use the analysis tool',
      upgradeRequired: false,
    };
  }
  
  // Check if user is admin first
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.email && isAdminUser(userData.user.email)) {
    return {
      allowed: true,
    };
  }
  
  const tier = await getUserTier(userId);
  
  if (tier === 'free') {
    return {
      allowed: false,
      reason: 'Property analysis is a Pro feature',
      upgradeRequired: true,
    };
  }
  
  return {
    allowed: true,
  };
}

// Check if user can export data
export async function canExportData(userId?: string): Promise<boolean> {
  if (!userId) return false;
  
  // Check if user is admin first
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user?.email && isAdminUser(userData.user.email)) {
    return true;
  }
  
  const tier = await getUserTier(userId);
  return tier !== 'free';
}

// Create or update user subscription
export async function createOrUpdateSubscription(
  userId: string,
  tier: SubscriptionTier,
  trialDays?: number
): Promise<UserSubscription | null> {
  const supabase = createClient();
  
  const subscriptionData: Partial<UserSubscription> = {
    user_id: userId,
    subscription_tier: tier,
    updated_at: new Date().toISOString(),
  };
  
  // Set trial end date if starting a trial
  if (tier === 'trial' && trialDays) {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);
    subscriptionData.trial_end_date = trialEndDate.toISOString();
  }
  
  // Set subscription end date for paid tiers (monthly)
  if (tier === 'pro' || tier === 'premium') {
    const subEndDate = new Date();
    subEndDate.setMonth(subEndDate.getMonth() + 1);
    subscriptionData.subscription_end_date = subEndDate.toISOString();
  }
  
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        ...subscriptionData,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating/updating subscription:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createOrUpdateSubscription:', error);
    return null;
  }
}