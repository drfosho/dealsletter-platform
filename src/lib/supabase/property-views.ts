import { supabase } from '@/lib/supabase/client';

export interface PropertyView {
  id: string;
  user_id: string;
  property_id: number;
  viewed_at: string;
}

/**
 * Track a property view
 * @param userId - The user's ID
 * @param propertyId - The property ID from curated deals
 */
export async function trackPropertyView(userId: string, propertyId: number) {
  try {
    // Store in localStorage as a temporary solution
    const storageKey = `property_views_${userId}`;
    const stored = localStorage.getItem(storageKey);
    const views = stored ? JSON.parse(stored) : [];
    
    const now = new Date().toISOString();
    views.push({
      property_id: propertyId,
      viewed_at: now
    });
    
    localStorage.setItem(storageKey, JSON.stringify(views));
    
    // Uncomment when table is created in Supabase
    /*
    const { data, error } = await supabase
      .from('property_views')
      .insert({
        user_id: userId,
        property_id: propertyId,
        viewed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking property view:', error);
      return { data: null, error };
    }

    return { data, error: null };
    */
    
    return { data: null, error: null };
  } catch (error) {
    console.error('Error in trackPropertyView:', error);
    return { data: null, error };
  }
}

/**
 * Get property views count for current month
 * @param userId - The user's ID
 */
export async function getMonthlyViewCount(userId: string) {
  try {
    // Get from localStorage
    const storageKey = `property_views_${userId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      return { count: 0, error: null };
    }
    
    const views = JSON.parse(stored);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyViews = views.filter((view: any) => {
      return new Date(view.viewed_at) >= startOfMonth;
    });
    
    // Uncomment when table is created in Supabase
    /*
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('property_views')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('viewed_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error getting monthly view count:', error);
      return { count: 0, error };
    }

    return { count: count || 0, error: null };
    */
    
    return { count: monthlyViews.length, error: null };
  } catch (error) {
    console.error('Error in getMonthlyViewCount:', error);
    return { count: 0, error };
  }
}

/**
 * Get unique properties viewed this month
 * @param userId - The user's ID
 */
export async function getUniqueMonthlyViews(userId: string) {
  try {
    // Get from localStorage
    const storageKey = `property_views_${userId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      return { count: 0, error: null };
    }
    
    const views = JSON.parse(stored);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyViews = views.filter((view: any) => {
      return new Date(view.viewed_at) >= startOfMonth;
    });
    
    // Get unique property IDs
    const uniqueProperties = new Set(monthlyViews.map((v: any) => v.property_id));
    
    // Uncomment when table is created in Supabase
    /*
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('property_views')
      .select('property_id')
      .eq('user_id', userId)
      .gte('viewed_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error getting unique monthly views:', error);
      return { count: 0, error };
    }

    const uniqueProperties = new Set(data?.map(view => view.property_id) || []);
    return { count: uniqueProperties.size, error: null };
    */
    
    return { count: uniqueProperties.size, error: null };
  } catch (error) {
    console.error('Error in getUniqueMonthlyViews:', error);
    return { count: 0, error };
  }
}

/* 
SQL Schema for the property_views table:

CREATE TABLE property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_property_views_user_id ON property_views(user_id);
CREATE INDEX idx_property_views_property_id ON property_views(property_id);
CREATE INDEX idx_property_views_viewed_at ON property_views(viewed_at DESC);
CREATE INDEX idx_property_views_user_month ON property_views(user_id, viewed_at DESC);

-- Enable Row Level Security
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own property views" ON property_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own property views" ON property_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);
*/