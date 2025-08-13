import { createClient } from '@/lib/supabase/server';
import { staticDeals } from './staticDeals';

// Get published properties from Supabase
export async function getPublishedProperties() {
  try {
    const supabase = await createClient();
    
    // Get all non-draft, non-deleted properties
    const { data: dbProperties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_draft', false)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties from Supabase:', error);
      // Fallback to static deals if database fails
      return staticDeals;
    }

    // Combine database properties with static deals
    // Filter out any static deals that might already be in the database
    const dbPropertyIds = new Set(dbProperties?.map(p => p.id) || []);
    const uniqueStaticDeals = staticDeals.filter(deal => !dbPropertyIds.has(deal.id));
    
    return [...(dbProperties || []), ...uniqueStaticDeals];
  } catch (error) {
    console.error('Error in getPublishedProperties:', error);
    // Fallback to static deals
    return staticDeals;
  }
}

// Get all properties (including drafts) - for admin
export async function getAllProperties() {
  try {
    const supabase = await createClient();
    
    // Get all non-deleted properties
    const { data: dbProperties, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all properties from Supabase:', error);
      return staticDeals;
    }

    // Combine with static deals
    const dbPropertyIds = new Set(dbProperties?.map(p => p.id) || []);
    const uniqueStaticDeals = staticDeals.filter(deal => !dbPropertyIds.has(deal.id));
    
    return [...(dbProperties || []), ...uniqueStaticDeals];
  } catch (error) {
    console.error('Error in getAllProperties:', error);
    return staticDeals;
  }
}

// Get property by ID
export async function getPropertyById(id: string) {
  try {
    const supabase = await createClient();
    
    // First try to get from database
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (!error && property) {
      return property;
    }

    // If not found in database, check static deals
    return staticDeals.find(p => String(p.id) === String(id));
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    // Fallback to static deals
    return staticDeals.find(p => String(p.id) === String(id));
  }
}

// Create a new property
export async function createProperty(property: Record<string, unknown>) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Generate a unique ID if not provided
    const propertyId = property.id || `prop_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    const newProperty = {
      ...property,
      id: propertyId,
      created_by: user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([newProperty])
      .select()
      .single();

    if (error) {
      console.error('Error creating property:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createProperty:', error);
    throw error;
  }
}

// Update a property
export async function updateProperty(id: string, updates: Record<string, unknown>) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('properties')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating property:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateProperty:', error);
    throw error;
  }
}

// Delete a property (soft delete)
export async function deleteProperty(id: string) {
  try {
    const supabase = await createClient();
    
    // Soft delete by setting is_deleted to true
    const { error } = await supabase
      .from('properties')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting property:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProperty:', error);
    throw error;
  }
}