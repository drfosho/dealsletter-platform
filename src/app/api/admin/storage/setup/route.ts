import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (implement your own admin check logic)
    // For now, we'll check if the user email is in an admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = adminEmails.includes(user.email || '');
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Create the storage bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return NextResponse.json({ error: 'Failed to check storage' }, { status: 500 });
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'properties');

    if (!bucketExists) {
      const { data, error: createError } = await supabase.storage.createBucket('properties', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return NextResponse.json({ error: 'Failed to create storage bucket' }, { status: 500 });
      }

      console.log('Storage bucket created:', data);
    }

    // Set up storage policies (RLS)
    // Note: These policies need to be set up in Supabase dashboard for proper security
    // Only authenticated users can upload, everyone can view

    return NextResponse.json({ 
      success: true, 
      message: 'Storage bucket is ready',
      bucketExists: true 
    });

  } catch (error) {
    console.error('Storage setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}