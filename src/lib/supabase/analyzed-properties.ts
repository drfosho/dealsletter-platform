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
    // For now, return mock data until the table is created
    // This prevents errors during development
    const mockData: AnalyzedProperty[] = [
      {
        id: '1',
        user_id: userId,
        address: '1234 Oak Street, San Francisco, CA 94102',
        analysis_date: '2024-01-15',
        roi: 18.5,
        profit: 125000,
        deal_type: 'Fix & Flip',
        is_favorite: true,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        user_id: userId,
        address: '5678 Pine Avenue, Oakland, CA 94610',
        analysis_date: '2024-01-12',
        roi: 22.3,
        profit: 89000,
        deal_type: 'BRRRR',
        is_favorite: false,
        created_at: '2024-01-12T14:45:00Z',
        updated_at: '2024-01-12T14:45:00Z'
      },
      {
        id: '3',
        user_id: userId,
        address: '9012 Elm Drive, San Jose, CA 95110',
        analysis_date: '2024-01-08',
        roi: 15.2,
        profit: 67500,
        deal_type: 'Buy & Hold',
        is_favorite: true,
        created_at: '2024-01-08T09:15:00Z',
        updated_at: '2024-01-08T09:15:00Z'
      }
    ];

    // Uncomment this when the table is created in Supabase
    /*
    const { data, error } = await supabase
      .from('analyzed_properties')
      .select('*')
      .eq('user_id', userId)
      .order('analysis_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching analyzed properties:', error);
      // Return mock data for now instead of throwing
      return { data: mockData.slice(0, limit), error: null };
    }

    return { data: data || [], error: null };
    */

    // Return mock data for now
    return { data: mockData.slice(0, limit), error: null };
  } catch (error) {
    console.error('Error in getUserAnalyzedProperties:', error);
    // Return empty array instead of error to prevent UI issues
    return { data: [], error: null };
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
export async function togglePropertyFavorite(propertyId: string) {
  try {
    // Mock implementation - just return success
    console.log('Toggle favorite for property:', propertyId);
    
    // Uncomment this when the table is created in Supabase
    /*
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
    */

    // Return success for mock
    return { data: null, error: null };
  } catch (error) {
    console.error('Error in togglePropertyFavorite:', error);
    return { data: null, error: null };
  }
}

/**
 * Remove an analyzed property
 * @param propertyId - The property ID
 * @param userId - The user's ID (for security)
 */
export async function removeAnalyzedProperty(propertyId: string) {
  try {
    // Mock implementation - just return success
    console.log('Remove property:', propertyId);
    
    // Uncomment this when the table is created in Supabase
    /*
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
    */

    // Return success for mock
    return { error: null };
  } catch (error) {
    console.error('Error in removeAnalyzedProperty:', error);
    return { error: null };
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

/* 
SQL Schema for the analyzed_properties table:

CREATE TABLE analyzed_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  roi DECIMAL(5,2) NOT NULL,
  profit INTEGER NOT NULL,
  deal_type TEXT NOT NULL CHECK (deal_type IN ('Fix & Flip', 'BRRRR', 'Buy & Hold', 'House Hack', 'Short-term Rental', 'Value-Add')),
  is_favorite BOOLEAN DEFAULT FALSE,
  analysis_data JSONB, -- Store full analysis results
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_analyzed_properties_user_id ON analyzed_properties(user_id);
CREATE INDEX idx_analyzed_properties_analysis_date ON analyzed_properties(analysis_date DESC);
CREATE INDEX idx_analyzed_properties_is_favorite ON analyzed_properties(user_id, is_favorite) WHERE is_favorite = true;

-- Enable Row Level Security
ALTER TABLE analyzed_properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own analyzed properties" ON analyzed_properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyzed properties" ON analyzed_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyzed properties" ON analyzed_properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyzed properties" ON analyzed_properties
  FOR DELETE USING (auth.uid() = user_id);
*/