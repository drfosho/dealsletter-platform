import { createClient } from '@/lib/supabase/server';

export async function isUserAdmin(userId?: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get current user if no userId provided
    if (!userId) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return false;
      userId = user.id;
    }

    // Check admin emails from environment
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return false;

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (adminEmails.includes(user.email || '')) {
      return true;
    }

    // Check user metadata for admin role
    const userMetadata = user.user_metadata || {};
    if (userMetadata.role === 'admin' || userMetadata.is_admin === true) {
      return true;
    }

    // Check profiles table for admin role (if you have one)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_admin')
      .eq('id', userId)
      .single();

    if (!profileError && profile) {
      return profile.role === 'admin' || profile.is_admin === true;
    }

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function requireAdmin() {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
  return true;
}