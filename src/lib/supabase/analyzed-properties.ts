import { supabase } from '@/lib/supabase/client';

export interface AnalyzedProperty {
  id: string;
  user_id: string;
  address: string;
  analysis_date: string;
  roi: number;
  profit: number;
  deal_type: string;
  is_favorite: boolean;
  analysis_data?: Record<string, unknown>; // Store full analysis results as JSON
  created_at: string;
  updated_at: string;
}

/**
 * Get user's analyzed properties (most recent first)
 * @param userId - The user's ID
 * @param limit - Number of properties to return (default: 4)
 */
export async function getUserAnalyzedProperties(userId: string, limit: number = 4) {
  try {
    const { data, error } = await supabase
      .from('analyzed_properties')
      .select('*')
      .eq('user_id', userId)
      .order('analysis_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching analyzed properties:', error);
      // Check if table doesn't exist
      if (error.code === '42P01') {
        console.log('Analyzed properties table not yet created. Run the migration in Supabase.');
        return { data: [], error: null }; // Return empty data instead of error
      }
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getUserAnalyzedProperties:', error);
    return { data: [], error };
  }
}

/**
 * Get all user's analyzed properties with pagination
 * @param userId - The user's ID
 * @param page - Page number (0-based)
 * @param pageSize - Number of items per page
 */
export async function getAllUserAnalyzedProperties(
  userId: string, 
  page: number = 0, 
  pageSize: number = 20
) {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('analyzed_properties')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('analysis_date', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching all analyzed properties:', error);
      throw error;
    }

    return { 
      data: data || [], 
      error: null, 
      total: count || 0,
      page,
      pageSize 
    };
  } catch (error) {
    console.error('Error in getAllUserAnalyzedProperties:', error);
    return { data: [], error, total: 0, page, pageSize };
  }
}

/**
 * Save a new analyzed property
 * @param property - The property analysis data
 */
export async function saveAnalyzedProperty(property: Omit<AnalyzedProperty, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('analyzed_properties')
      .insert([{
        ...property,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving analyzed property:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in saveAnalyzedProperty:', error);
    return { data: null, error };
  }
}

/**
 * Toggle favorite status of an analyzed property
 * @param propertyId - The property ID
 * @param userId - The user's ID (for security)
 */
export async function togglePropertyFavorite(propertyId: string, userId: string) {
  try {
    // First get the current favorite status
    const { data: currentData, error: fetchError } = await supabase
      .from('analyzed_properties')
      .select('is_favorite')
      .eq('id', propertyId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching property:', fetchError);
      throw fetchError;
    }

    // Toggle the favorite status
    const { data, error } = await supabase
      .from('analyzed_properties')
      .update({ 
        is_favorite: !currentData.is_favorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in togglePropertyFavorite:', error);
    return { data: null, error };
  }
}

/**
 * Remove an analyzed property
 * @param propertyId - The property ID
 * @param userId - The user's ID (for security)
 */
export async function removeAnalyzedProperty(propertyId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('analyzed_properties')
      .delete()
      .eq('id', propertyId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing analyzed property:', error);
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Error in removeAnalyzedProperty:', error);
    return { error };
  }
}

/**
 * Get analytics stats for user's analyzed properties
 * @param userId - The user's ID
 */
export async function getAnalyzedPropertiesStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('analyzed_properties')
      .select('roi, profit, deal_type, analysis_date')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching property stats:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return {
        totalAnalyzed: 0,
        averageROI: 0,
        bestROI: 0,
        totalProfit: 0,
        favoriteCount: 0,
        error: null
      };
    }

    // Calculate stats
    const totalAnalyzed = data.length;
    const averageROI = data.reduce((sum, prop) => sum + prop.roi, 0) / totalAnalyzed;
    const bestROI = Math.max(...data.map(prop => prop.roi));
    const totalProfit = data.reduce((sum, prop) => sum + prop.profit, 0);

    // Get favorite count
    const { count: favoriteCount } = await supabase
      .from('analyzed_properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_favorite', true);

    return {
      totalAnalyzed,
      averageROI: Math.round(averageROI * 10) / 10, // Round to 1 decimal
      bestROI: Math.round(bestROI * 10) / 10,
      totalProfit,
      favoriteCount: favoriteCount || 0,
      error: null
    };
  } catch (error) {
    console.error('Error in getAnalyzedPropertiesStats:', error);
    return {
      totalAnalyzed: 0,
      averageROI: 0,
      bestROI: 0,
      totalProfit: 0,
      favoriteCount: 0,
      error
    };
  }
}

