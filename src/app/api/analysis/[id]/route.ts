import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Await params before accessing
    const resolvedParams = await params;
    
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

    // Fetch the specific analysis from analyzed_properties table
    const { data: analysis, error } = await supabase
      .from('analyzed_properties')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id) // Ensure user owns this analysis
      .single();

    if (error || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Log the raw data for debugging
    console.log('[Analysis GET] Raw analysis data:', {
      id: analysis.id,
      hasAnalysisData: !!analysis.analysis_data,
      analysisDataKeys: analysis.analysis_data ? Object.keys(analysis.analysis_data) : [],
      hasPropertyData: !!analysis.analysis_data?.property_data,
      propertyDataKeys: analysis.analysis_data?.property_data ? Object.keys(analysis.analysis_data.property_data) : []
    });

    // Transform the data to match the expected format
    // CRITICAL: Preserve all original analysis_data for component access
    const aiAnalysis = analysis.analysis_data?.ai_analysis || {};
    const financialMetrics = aiAnalysis?.financial_metrics || {};

    // Helper to get first non-null/undefined value (0 is valid)
    const getFirstDefined = (...values: (number | undefined | null)[]): number => {
      for (const v of values) {
        if (v !== undefined && v !== null) return v;
      }
      return 0;
    };

    const transformedAnalysis = {
      id: analysis.id,
      user_id: analysis.user_id,
      address: analysis.address,
      analysis_date: analysis.analysis_date,
      // CRITICAL: Use saved roi/profit from database (updated after AI analysis)
      // Use nullish check to properly handle 0 as a valid value
      roi: getFirstDefined(analysis.roi, financialMetrics?.roi),
      profit: getFirstDefined(analysis.profit, financialMetrics?.total_profit, financialMetrics?.net_profit),
      deal_type: analysis.deal_type,
      is_favorite: analysis.is_favorite,
      created_at: analysis.created_at,
      updated_at: analysis.updated_at,
      // Extract data from analysis_data JSONB field
      strategy: analysis.analysis_data?.strategy || analysis.deal_type?.toLowerCase().replace(' & ', ''),
      purchase_price: analysis.analysis_data?.purchase_price || 0,
      down_payment_percent: analysis.analysis_data?.down_payment_percent || 20,
      loan_term: analysis.analysis_data?.loan_term || 30,
      interest_rate: analysis.analysis_data?.interest_rate || 7,
      rehab_costs: analysis.analysis_data?.rehab_costs || 0,
      // Property data might be stored directly or nested
      property_data: analysis.analysis_data?.property_data || analysis.property_data || {},
      rental_estimate: analysis.analysis_data?.rental_estimate || analysis.rental_estimate || {},
      comparables: analysis.analysis_data?.comparables || analysis.comparables || {},
      market_data: analysis.analysis_data?.market_data || analysis.market_data || {},
      // CRITICAL: Include full ai_analysis with financial_metrics
      // Use getFirstDefined to properly preserve 0 as a valid value
      ai_analysis: {
        ...aiAnalysis,
        financial_metrics: {
          ...financialMetrics,
          // Ensure key values are present (0 is valid, only default to 0 if truly missing)
          monthly_rent: getFirstDefined(financialMetrics?.monthly_rent, analysis.analysis_data?.monthlyRent),
          monthly_cash_flow: getFirstDefined(financialMetrics?.monthly_cash_flow),
          cap_rate: getFirstDefined(financialMetrics?.cap_rate),
          cash_on_cash_return: getFirstDefined(financialMetrics?.cash_on_cash_return),
          roi: getFirstDefined(financialMetrics?.roi, analysis.roi),
          total_profit: getFirstDefined(financialMetrics?.total_profit, analysis.profit),
          net_profit: getFirstDefined(financialMetrics?.net_profit, financialMetrics?.total_profit, analysis.profit),
          arv: getFirstDefined(financialMetrics?.arv, analysis.analysis_data?.arv)
        }
      },
      // CRITICAL: Include full analysis_data so components can access all original values
      analysis_data: analysis.analysis_data || {},
      status: analysis.analysis_data?.status || 'completed'
    };

    console.log('[Analysis GET] Financial metrics in response:', {
      roi: transformedAnalysis.roi,
      profit: transformedAnalysis.profit,
      aiAnalysisFinancialMetrics: transformedAnalysis.ai_analysis?.financial_metrics
    });
    
    console.log('[Analysis GET] Transformed analysis:', {
      hasPropertyData: !!transformedAnalysis.property_data,
      propertyDataKeys: Object.keys(transformedAnalysis.property_data),
      hasMarketData: !!transformedAnalysis.market_data,
      marketDataKeys: Object.keys(transformedAnalysis.market_data)
    });

    return NextResponse.json(transformedAnalysis);

  } catch (error) {
    console.error('Get Analysis API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Await params before accessing
    const resolvedParams = await params;
    
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

    // Delete the analysis from analyzed_properties table
    const { error } = await supabase
      .from('analyzed_properties')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id); // Ensure user owns this analysis

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete Analysis API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}