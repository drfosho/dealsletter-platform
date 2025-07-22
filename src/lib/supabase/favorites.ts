import { supabase } from '@/lib/supabase/client';

export interface FavoriteProperty {
  id: string;
  user_id: string;
  property_id: number; // ID from your curated deals
  saved_at: string;
  // Property details (joined from deals)
  property?: {
    title: string;
    location: string;
    price: number;
    type: string;
    imageUrl?: string;
    roi?: number;
    cashFlow?: number;
  };
}

/**
 * Save a property to favorites
 * @param userId - The user's ID
 * @param propertyId - The property ID from curated deals
 */
export async function savePropertyToFavorites(userId: string, propertyId: number) {
  try {
    // Mock implementation - just log and return success
    console.log('Mock: Saving property to favorites:', { userId, propertyId });
    
    // Store in localStorage as a temporary solution
    const storageKey = `favorites_${userId}`;
    const stored = localStorage.getItem(storageKey);
    const favorites = stored ? JSON.parse(stored) : [];
    
    if (!favorites.includes(propertyId)) {
      favorites.push(propertyId);
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    }
    
    // Uncomment this when the table is created in Supabase
    /*
    const { data, error } = await supabase
      .from('favorite_properties')
      .insert({
        user_id: userId,
        property_id: propertyId,
        saved_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate error gracefully
      if (error.code === '23505') {
        console.log('Property already in favorites');
        return { data: null, error: null, alreadyExists: true };
      }
      console.error('Error saving to favorites:', error);
      throw error;
    }

    return { data, error: null, alreadyExists: false };
    */

    return { data: null, error: null, alreadyExists: false };
  } catch (error) {
    console.error('Error in savePropertyToFavorites:', error);
    return { data: null, error: null, alreadyExists: false };
  }
}

/**
 * Remove a property from favorites
 * @param userId - The user's ID
 * @param propertyId - The property ID from curated deals
 */
export async function removePropertyFromFavorites(userId: string, propertyId: number) {
  try {
    // Mock implementation - just log and return success
    console.log('Mock: Removing property from favorites:', { userId, propertyId });
    
    // Remove from localStorage
    const storageKey = `favorites_${userId}`;
    const stored = localStorage.getItem(storageKey);
    const favorites = stored ? JSON.parse(stored) : [];
    
    const updatedFavorites = favorites.filter((id: number) => id !== propertyId);
    localStorage.setItem(storageKey, JSON.stringify(updatedFavorites));
    
    // Uncomment this when the table is created in Supabase
    /*
    const { error } = await supabase
      .from('favorite_properties')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }

    return { error: null };
    */

    return { error: null };
  } catch (error) {
    console.error('Error in removePropertyFromFavorites:', error);
    return { error: null };
  }
}

/**
 * Check if a property is favorited by user
 * @param userId - The user's ID
 * @param propertyId - The property ID from curated deals
 */
export async function isPropertyFavorited(userId: string, propertyId: number) {
  try {
    // Mock implementation - check localStorage
    const storageKey = `favorites_${userId}`;
    const stored = localStorage.getItem(storageKey);
    
    // Initialize with some defaults if empty
    if (!stored) {
      const defaultFavorites = [1, 4, 6]; // Default mock favorites
      localStorage.setItem(storageKey, JSON.stringify(defaultFavorites));
      return { isFavorited: defaultFavorites.includes(propertyId), error: null };
    }
    
    const favorites = JSON.parse(stored);
    const isFavorited = favorites.includes(propertyId);
    
    // Uncomment this when the table is created in Supabase
    /*
    const { data, error } = await supabase
      .from('favorite_properties')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking favorite status:', error);
      throw error;
    }

    return { isFavorited: !!data, error: null };
    */

    return { isFavorited, error: null };
  } catch (error) {
    console.error('Error in isPropertyFavorited:', error);
    return { isFavorited: false, error: null };
  }
}

/**
 * Get all favorited properties for a user
 * @param userId - The user's ID
 */
export async function getUserFavoriteProperties(userId: string) {
  try {
    // Mock implementation using localStorage
    const storageKey = `favorites_${userId}`;
    const stored = localStorage.getItem(storageKey);
    
    // Initialize with defaults if empty
    if (!stored) {
      const defaultFavorites = [1, 4, 6];
      localStorage.setItem(storageKey, JSON.stringify(defaultFavorites));
    }
    
    const favoriteIds = stored ? JSON.parse(stored) : [1, 4, 6];
    
    // Convert to FavoriteProperty format
    const mockFavorites: FavoriteProperty[] = favoriteIds.map((id: number, index: number) => ({
      id: `fav_${id}`,
      user_id: userId,
      property_id: id,
      saved_at: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString() // Stagger dates
    }));

    // Uncomment this when the table is created in Supabase
    /*
    const { data: favorites, error } = await supabase
      .from('favorite_properties')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorite properties:', error);
      // Return mock data for now
      return { data: mockFavorites, error: null };
    }

    return { data: favorites || [], error: null };
    */

    // Return mock data for now
    return { data: mockFavorites, error: null };
  } catch (error) {
    console.error('Error in getUserFavoriteProperties:', error);
    return { data: [], error: null };
  }
}

/**
 * Get favorite status for multiple properties at once
 * @param userId - The user's ID
 * @param propertyIds - Array of property IDs
 */
export async function getBulkFavoriteStatus(userId: string, propertyIds: number[]) {
  try {
    const { data, error } = await supabase
      .from('favorite_properties')
      .select('property_id')
      .eq('user_id', userId)
      .in('property_id', propertyIds);

    if (error) {
      console.error('Error fetching bulk favorite status:', error);
      throw error;
    }

    // Convert to a Set for O(1) lookup
    const favoriteIds = new Set(data?.map(fav => fav.property_id) || []);
    
    return { favoriteIds, error: null };
  } catch (error) {
    console.error('Error in getBulkFavoriteStatus:', error);
    return { favoriteIds: new Set<number>(), error };
  }
}

/* 
SQL Schema for the favorite_properties table:

CREATE TABLE favorite_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id) -- Prevent duplicate favorites
);

-- Create indexes for better performance
CREATE INDEX idx_favorite_properties_user_id ON favorite_properties(user_id);
CREATE INDEX idx_favorite_properties_property_id ON favorite_properties(property_id);
CREATE INDEX idx_favorite_properties_saved_at ON favorite_properties(saved_at DESC);

-- Enable Row Level Security
ALTER TABLE favorite_properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own favorites" ON favorite_properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" ON favorite_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorite_properties
  FOR DELETE USING (auth.uid() = user_id);
*/