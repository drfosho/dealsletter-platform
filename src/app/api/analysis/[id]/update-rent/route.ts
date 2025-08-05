import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { monthlyRent, rentPerUnit } = await request.json();
    
    if (!monthlyRent || monthlyRent < 0) {
      return NextResponse.json(
        { error: 'Invalid monthly rent value' },
        { status: 400 }
      );
    }
    
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
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // First, get the current analysis to verify ownership and get existing data
    const { data: currentAnalysis, error: fetchError } = await supabase
      .from('analyzed_properties')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError || !currentAnalysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }
    
    // Update the AI analysis with the new monthly rent
    const updatedAiAnalysis = {
      ...currentAnalysis.ai_analysis,
      financial_metrics: {
        ...currentAnalysis.ai_analysis?.financial_metrics,
        monthly_rent: monthlyRent
      }
    };
    
    // Update the analysis_data with the new values
    const updatedAnalysisData = {
      ...currentAnalysis.analysis_data,
      monthlyRent: monthlyRent,
      rentPerUnit: rentPerUnit
    };
    
    // Update the analysis in the database
    const { data: updatedAnalysis, error: updateError } = await supabase
      .from('analyzed_properties')
      .update({
        ai_analysis: updatedAiAnalysis,
        analysis_data: updatedAnalysisData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Failed to update analysis:', updateError);
      return NextResponse.json(
        { error: 'Failed to update analysis' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      analysis: updatedAnalysis
    });
    
  } catch (error) {
    console.error('Error updating rent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}