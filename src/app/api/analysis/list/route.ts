import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Fetch user analyses from analyzed_properties table
    const { data: rawAnalyses, error, count } = await supabase
      .from('analyzed_properties')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('analysis_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching analyses:', error);
      throw error;
    }

    // Map the data to match the expected format
    const analyses = (rawAnalyses || []).map(record => ({
      id: record.id,
      user_id: record.user_id,
      address: record.address,
      strategy: record.analysis_data?.strategy || record.deal_type?.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') || 'rental',
      created_at: record.analysis_date || record.created_at,
      roi: record.roi,
      profit: record.profit,
      deal_type: record.deal_type,
      property_data: record.analysis_data?.property_data || null,
      analysis_data: record.analysis_data
    }));

    return NextResponse.json({
      analyses,
      total: count || 0,
      page,
      limit
    });

  } catch (error) {
    console.error('List Analyses API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}