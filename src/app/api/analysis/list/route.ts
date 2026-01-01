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
    // CRITICAL: Include all necessary fields for comparison modal and other UIs
    const analyses = (rawAnalyses || []).map(record => {
      const analysisData = record.analysis_data || {};
      const aiMetrics = analysisData?.ai_analysis?.financial_metrics || {};

      return {
        id: record.id,
        user_id: record.user_id,
        address: record.address,
        strategy: analysisData?.strategy || record.deal_type?.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-') || 'rental',
        created_at: record.analysis_date || record.created_at,

        // Top-level ROI and profit from DB columns
        roi: record.roi || aiMetrics?.roi || 0,
        profit: record.profit || aiMetrics?.net_profit || aiMetrics?.total_profit || 0,
        deal_type: record.deal_type,

        // CRITICAL: Include purchase_price at top level for comparison modal
        purchase_price: analysisData?.purchase_price || 0,

        // Include financial metrics for display
        monthly_cash_flow: aiMetrics?.monthly_cash_flow || 0,
        cap_rate: aiMetrics?.cap_rate || 0,
        cash_on_cash: aiMetrics?.cash_on_cash_return || 0,
        arv: aiMetrics?.arv || analysisData?.arv || 0,
        total_investment: aiMetrics?.total_investment || aiMetrics?.cash_required || 0,
        monthly_rent: aiMetrics?.monthly_rent || analysisData?.monthlyRent || 0,

        // Include ai_analysis for detailed access
        ai_analysis: analysisData?.ai_analysis || null,

        // Original data for fallback
        property_data: analysisData?.property_data || null,
        analysis_data: analysisData
      };
    });

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