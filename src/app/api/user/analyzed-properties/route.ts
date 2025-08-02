import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '4');
    
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

    // Fetch user's analyzed properties
    const { data, error } = await supabase
      .from('analyzed_properties')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);


    if (error) {
      console.error('[Analyzed Properties API] Database error:', error);
      throw error;
    }

    // Transform data to match the expected format
    const transformedData = (data || []).map(analysis => {
      // Extract financial metrics from analysis_data JSON
      const analysisData = analysis.analysis_data || {};
      const aiAnalysis = analysisData.ai_analysis || {};
      const financialMetrics = aiAnalysis.financial_metrics || {};
      
      return {
        id: analysis.id,
        address: analysis.address,
        deal_type: analysis.deal_type || 'Buy & Hold',
        is_favorite: analysis.is_favorite || false,
        analysis_date: analysis.analysis_date || analysis.created_at,
        roi: analysis.roi || financialMetrics.roi || 0,
        profit: analysis.profit || financialMetrics.total_profit || 0,
        property_data: analysisData.property_data || {},
        purchase_price: analysisData.purchase_price || 0,
        strategy: analysisData.strategy || 'rental'
      };
    });

    return NextResponse.json({
      data: transformedData,
      total: transformedData.length
    });

  } catch (error) {
    console.error('Fetch Analyzed Properties Error:', error);
    
    // Check if it's a table not found error
    if ((error as any)?.code === '42P01' || (error as any)?.message?.includes('relation "analyzed_properties" does not exist')) {
      return NextResponse.json(
        { 
          error: 'Database table not found',
          message: 'The analyzed_properties table has not been created yet. Please run the migration.',
          data: []
        },
        { status: 200 } // Return 200 with empty data instead of 500
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch analyzed properties' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { propertyId } = await request.json();
    
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

    // Delete the analysis
    const { error } = await supabase
      .from('analyzed_properties')
      .delete()
      .eq('id', propertyId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete Analyzed Property Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { propertyId, is_favorite } = await request.json();
    
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

    // Update favorite status
    const { error } = await supabase
      .from('analyzed_properties')
      .update({ is_favorite })
      .eq('id', propertyId)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Toggle Favorite Error:', error);
    return NextResponse.json(
      { error: 'Failed to update favorite status' },
      { status: 500 }
    );
  }
}