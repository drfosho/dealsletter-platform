import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  subscription_tier: 'basic' | 'pro' | 'premium';
  investor_experience?: string;
  deal_types?: string[];
  investment_goals?: string;
  budget?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get user profile with subscription tier
 * @param userId - The user's ID
 * @returns User profile or null
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return { data: null, error };
  }
}

/**
 * Update user's subscription tier
 * @param userId - The user's ID
 * @param tier - New subscription tier
 * @returns Updated profile or error
 */
export async function updateSubscriptionTier(
  userId: string, 
  tier: 'basic' | 'pro' | 'premium'
) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        subscription_tier: tier,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription tier:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateSubscriptionTier:', error);
    return { data: null, error };
  }
}

/**
 * Get or create user profile
 * @param userId - The user's ID
 * @param userData - Initial user data
 * @returns User profile
 */
export async function getOrCreateUserProfile(userId: string, userData?: Partial<UserProfile>) {
  try {
    // Try to get existing profile
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // If profile doesn't exist, create it
    if (fetchError && fetchError.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert([{
          id: userId,
          subscription_tier: 'basic',
          ...userData
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return { data: null, error: createError };
      }

      return { data: newProfile, error: null };
    } else if (fetchError) {
      return { data: null, error: fetchError };
    }

    return { data: profile, error: null };
  } catch (error) {
    console.error('Error in getOrCreateUserProfile:', error);
    return { data: null, error };
  }
}