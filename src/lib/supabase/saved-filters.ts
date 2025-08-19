import { supabase } from '@/lib/supabase/client';

export interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  filters: {
    location?: string[];
    propertyType?: string[];
    priceMin?: number;
    priceMax?: number;
    strategy?: string[];
    capRateMin?: number;
    cashFlowMin?: number;
  };
  notifications: boolean;
  isDraft: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get all saved filters for a user
 * @param userId - The user's ID
 */
export async function getUserSavedFilters(userId: string) {
  try {
    // Use localStorage as temporary solution
    const storageKey = `saved_filters_${userId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      // Initialize with some default filters
      const defaultFilters: SavedFilter[] = [
        {
          id: 'filter_1',
          user_id: userId,
          name: 'High ROI Deals',
          filters: {
            strategy: ['Buy & Hold'],
            capRateMin: 8,
            cashFlowMin: 500
          },
          notifications: true,
          isDraft: false,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'filter_2',
          user_id: userId,
          name: 'Fix & Flip Opportunities',
          filters: {
            strategy: ['Fix & Flip'],
            priceMax: 300000
          },
          notifications: false,
          isDraft: false,
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem(storageKey, JSON.stringify(defaultFilters));
      return { data: defaultFilters, error: null };
    }
    
    const filters = JSON.parse(stored);
    
    // Uncomment when table is created in Supabase
    /*
    const { data, error } = await supabase
      .from('saved_filters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved filters:', error);
      return { data: [], error };
    }

    return { data: data || [], error: null };
    */
    
    return { data: filters, error: null };
  } catch (error) {
    console.error('Error in getUserSavedFilters:', error);
    return { data: [], error };
  }
}

/**
 * Get count of active filters (with notifications enabled)
 * @param userId - The user's ID
 */
export async function getActiveFiltersCount(userId: string) {
  try {
    const { data, error } = await getUserSavedFilters(userId);
    
    if (error) {
      return { count: 0, error };
    }
    
    const activeCount = data.filter(f => f.notifications && !f.isDraft).length;
    
    return { count: activeCount, error: null };
  } catch (error) {
    console.error('Error in getActiveFiltersCount:', error);
    return { count: 0, error };
  }
}

/**
 * Save or update a filter
 * @param filter - The filter to save
 */
export async function saveFilter(filter: Partial<SavedFilter> & { user_id: string }) {
  try {
    const storageKey = `saved_filters_${filter.user_id}`;
    const stored = localStorage.getItem(storageKey);
    const filters = stored ? JSON.parse(stored) : [];
    
    if (filter.id) {
      // Update existing filter
      const index = filters.findIndex((f: SavedFilter) => f.id === filter.id);
      if (index !== -1) {
        filters[index] = { ...filters[index], ...filter, updated_at: new Date().toISOString() };
      }
    } else {
      // Create new filter
      const newFilter: SavedFilter = {
        id: `filter_${Date.now()}`,
        name: filter.name || 'New Filter',
        filters: filter.filters || {},
        notifications: filter.notifications || false,
        isDraft: filter.isDraft || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: filter.user_id
      };
      filters.push(newFilter);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(filters));
    
    // Uncomment when table is created in Supabase
    /*
    if (filter.id) {
      const { data, error } = await supabase
        .from('saved_filters')
        .update({
          ...filter,
          updated_at: new Date().toISOString()
        })
        .eq('id', filter.id)
        .select()
        .single();
      
      return { data, error };
    } else {
      const { data, error } = await supabase
        .from('saved_filters')
        .insert({
          ...filter,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      return { data, error };
    }
    */
    
    return { data: filter, error: null };
  } catch (error) {
    console.error('Error in saveFilter:', error);
    return { data: null, error };
  }
}

/**
 * Delete a saved filter
 * @param userId - The user's ID
 * @param filterId - The filter ID
 */
export async function deleteFilter(userId: string, filterId: string) {
  try {
    const storageKey = `saved_filters_${userId}`;
    const stored = localStorage.getItem(storageKey);
    const filters = stored ? JSON.parse(stored) : [];
    
    const updatedFilters = filters.filter((f: SavedFilter) => f.id !== filterId);
    localStorage.setItem(storageKey, JSON.stringify(updatedFilters));
    
    // Uncomment when table is created in Supabase
    /*
    const { error } = await supabase
      .from('saved_filters')
      .delete()
      .eq('id', filterId)
      .eq('user_id', userId);
    
    return { error };
    */
    
    return { error: null };
  } catch (error) {
    console.error('Error in deleteFilter:', error);
    return { error };
  }
}

/* 
SQL Schema for the saved_filters table:

CREATE TABLE saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  notifications BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_saved_filters_user_id ON saved_filters(user_id);
CREATE INDEX idx_saved_filters_notifications ON saved_filters(notifications);
CREATE INDEX idx_saved_filters_created_at ON saved_filters(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own filters" ON saved_filters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own filters" ON saved_filters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filters" ON saved_filters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own filters" ON saved_filters
  FOR DELETE USING (auth.uid() = user_id);
*/