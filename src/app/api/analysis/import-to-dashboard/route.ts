import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { analysisId } = await request.json();
    
    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

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
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // Handle error in Server Component
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the analysis
    const { data: analysis, error: fetchError } = await supabase
      .from('user_analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Transform analysis data to property format
    const propertyData = {
      title: analysis.address,
      address: analysis.address,
      city: analysis.property_data?.property?.[0]?.city || 'Unknown',
      state: analysis.property_data?.property?.[0]?.state || 'Unknown',
      zipCode: analysis.property_data?.property?.[0]?.zipCode || '00000',
      price: analysis.purchase_price,
      propertyType: analysis.property_data?.property?.[0]?.propertyType || 'Single Family',
      investmentStrategy: analysis.strategy,
      downPayment: (analysis.purchase_price * analysis.down_payment_percent) / 100,
      downPaymentPercent: analysis.down_payment_percent,
      interestRate: analysis.interest_rate,
      loanTerm: analysis.loan_term,
      monthlyRent: analysis.rental_estimate?.rent || 0,
      bedrooms: analysis.property_data?.property?.[0]?.bedrooms || 0,
      bathrooms: analysis.property_data?.property?.[0]?.bathrooms || 0,
      sqft: analysis.property_data?.property?.[0]?.squareFootage || 0,
      yearBuilt: analysis.property_data?.property?.[0]?.yearBuilt || 0,
      lotSize: analysis.property_data?.property?.[0]?.lotSize || 0,
      rehabCosts: analysis.rehab_costs || 0,
      monthlyCashFlow: analysis.ai_analysis?.financial_metrics?.monthly_cash_flow || 0,
      capRate: analysis.ai_analysis?.financial_metrics?.cap_rate || 0,
      totalROI: analysis.ai_analysis?.financial_metrics?.roi || 0,
      confidence: 'high',
      status: 'active',
      riskLevel: 'medium',
      features: [],
      images: [],
      description: analysis.ai_analysis?.summary || '',
      neighborhood: analysis.property_data?.property?.[0]?.neighborhood || '',
      source: 'analysis',
      analysisId: analysisId
    };

    // Insert into properties table
    const { data: property, error: insertError } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting property:', insertError);
      return NextResponse.json(
        { error: 'Failed to import property' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      property,
      message: 'Property imported successfully' 
    });
  } catch (error) {
    console.error('Error importing analysis:', error);
    return NextResponse.json(
      { error: 'Failed to import analysis' },
      { status: 500 }
    );
  }
}