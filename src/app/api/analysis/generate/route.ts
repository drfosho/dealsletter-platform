import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { rentCastService } from '@/services/rentcast';
import { PropertyAnalysisRequest } from '@/types/rentcast';
// These types are imported but not used in this file
import { logError } from '@/utils/error-utils';
import Anthropic from '@anthropic-ai/sdk';
import { getAdminConfig } from '@/lib/admin-config';

console.log('[Generate] Module loaded, Anthropic SDK available:', !!Anthropic);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

console.log('[Generate] Anthropic client initialized');

export async function POST(request: NextRequest) {
  console.log('=== ANALYSIS GENERATION START ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);
  console.log('Request headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
  
  try {
    console.log('\n--- STEP 1: Environment Validation ---');
    
    console.log('Environment variables check:');
    console.log('- Anthropic API key exists:', !!process.env.ANTHROPIC_API_KEY);
    console.log('- Anthropic API key length:', process.env.ANTHROPIC_API_KEY?.length || 0);
    console.log('- Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('- Supabase URL value:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('- Supabase anon key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('- Supabase anon key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0);
    console.log('- RentCast API key exists:', !!process.env.RENTCAST_API_KEY);
    console.log('- Node environment:', process.env.NODE_ENV);
    
    // Validate API keys
    if (!process.env.RENTCAST_API_KEY || !process.env.ANTHROPIC_API_KEY) {
      console.error('[Generate] Missing API keys!');
      return NextResponse.json(
        { error: 'API services are not properly configured' },
        { status: 503 }
      );
    }

    console.log('\n--- STEP 2: Supabase Client Creation ---');
    console.log('Creating Supabase client...');
    
    let cookieStore;
    try {
      cookieStore = await cookies();
      console.log('Cookie store retrieved successfully');
    } catch (cookieError) {
      console.error('Failed to get cookie store:', cookieError);
      throw cookieError;
    }
    
    // Validate Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Creating Supabase client with URL:', supabaseUrl);
    
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            const cookies = cookieStore.getAll();
            console.log('Getting cookies:', cookies.length, 'cookies');
            return cookies;
          },
          setAll(cookiesToSet) {
            console.log('Setting cookies:', cookiesToSet.length, 'cookies');
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    console.log('Supabase client created successfully');
    console.log('Supabase client type:', typeof supabase);
    console.log('Supabase client methods:', Object.keys(supabase));

    console.log('\n--- STEP 3: Authentication Check ---');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check completed');
    console.log('User authenticated:', !!user);
    console.log('User ID:', user?.id);
    console.log('User email:', user?.email);
    console.log('Auth error:', authError?.message);
    
    if (authError || !user) {
      console.log('Authentication failed - returning 401');
      console.log('Auth error details:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminConfig = getAdminConfig(user.email);
    
    // Skip usage check for admins
    if (!adminConfig.bypassSubscriptionLimits) {
      // Check user's usage limits
      const { data: usageCheck, error: usageError } = await supabase
        .rpc('can_user_analyze', { p_user_id: user.id });
      
      if (usageError) {
        console.error('Usage check error:', usageError);
        return NextResponse.json(
          { error: 'Failed to check usage limits' },
          { status: 500 }
        );
      }
      
      if (!usageCheck?.can_analyze) {
        return NextResponse.json(
          { 
            error: 'Monthly analysis limit reached',
            message: usageCheck?.message || 'Please upgrade to Pro for more analyses',
            usage: usageCheck
          },
          { status: 403 }
        );
      }
    }

    console.log('\n--- STEP 4: Request Body Parsing ---');
    let body: PropertyAnalysisRequest;
    try {
      const requestText = await request.text();
      console.log('Raw request body:', requestText);
      body = JSON.parse(requestText);
      console.log('Request body parsed successfully');
      console.log('Parsed body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body', details: parseError instanceof Error ? parseError.message : 'Unknown parse error' },
        { status: 400 }
      );
    }
    
    console.log('Request body details:', {
      address: body.address,
      strategy: body.strategy,
      hasPropertyData: !!(body as any).propertyData,
      purchasePrice: body.purchasePrice,
      downPayment: body.downPayment,
      loanTerms: body.loanTerms
    });
    
    // Validate required fields
    if (!body.address || !body.strategy) {
      return NextResponse.json(
        { error: 'Address and investment strategy are required' },
        { status: 400 }
      );
    }

    // Validate strategy
    const validStrategies = ['rental', 'flip', 'brrrr', 'commercial'];
    if (!validStrategies.includes(body.strategy)) {
      return NextResponse.json(
        { error: 'Invalid investment strategy' },
        { status: 400 }
      );
    }

    console.log('\n--- STEP 5: Property Cache Check ---');
    console.log('Checking property cache for address:', body.address);
    const { data: cachedProperty, error: cacheError } = await supabase
      .from('property_cache')
      .select('*')
      .eq('address', body.address)
      .single();
    
    console.log('Cache check completed');
    console.log('Cached property found:', !!cachedProperty);
    console.log('Cache error:', cacheError?.message);

    let propertyData;
    let estimatedValue = 0;
    
    console.log('\n--- STEP 5.1: Property Data Retrieval ---');
    // Check if property data was passed from client (from wizard)
    if ((body as any).propertyData) {
      console.log('Property data provided in request body');
      propertyData = (body as any).propertyData;
      console.log('Property data type:', typeof propertyData);
      console.log('Property data keys:', propertyData ? Object.keys(propertyData) : 'null/undefined');
      
      // Extract estimated value from comparables
      if (propertyData && propertyData.comparables) {
        estimatedValue = propertyData.comparables.value || 0;
        console.log('Extracted estimated value from client data:', estimatedValue);
      }
    } else if (cachedProperty && new Date(cachedProperty.expires_at) > new Date()) {
      // Use cached data
      propertyData = {
        property: cachedProperty.property_data,
        rental: cachedProperty.rental_estimate,
        market: cachedProperty.market_data,
        comparables: cachedProperty.comparables
      };
      
      // Extract estimated value from cached comparables
      estimatedValue = cachedProperty.comparables?.value || 0;
      
      // Update cache hit count
      await supabase
        .from('property_cache')
        .update({ 
          cache_hit_count: cachedProperty.cache_hit_count + 1,
          last_accessed: new Date().toISOString()
        })
        .eq('id', cachedProperty.id);
    } else {
      // Get fresh data from RentCast
      try {
        propertyData = await rentCastService.getComprehensivePropertyData(body.address);
        
        // Extract estimated value from fresh data
        estimatedValue = propertyData.comparables?.value || 0;
        
        // Cache the property data
        await supabase
          .from('property_cache')
          .upsert({
            address: body.address,
            property_data: propertyData.property,
            rental_estimate: propertyData.rental,
            market_data: propertyData.market,
            comparables: propertyData.comparables,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          });
      } catch (err) {
        console.error('Failed to fetch property data:', err);
        return NextResponse.json(
          { error: 'Failed to fetch property data', details: err instanceof Error ? err.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    console.log('\n--- STEP 6: Preparing Analysis Record ---');
    const purchasePrice = body.purchasePrice || estimatedValue || 0;
    console.log('Purchase price:', purchasePrice);
    console.log('Estimated value:', estimatedValue);
    console.log('Property data available:', !!propertyData);
    console.log('Property data keys:', propertyData ? Object.keys(propertyData) : 'none');

    console.log('\n--- STEP 7: Creating Database Record ---');
    
    // Map strategy to deal_type for analyzed_properties table
    const strategyToDealType: Record<string, string> = {
      'rental': 'Buy & Hold',
      'flip': 'Fix & Flip',
      'brrrr': 'BRRRR',
      'commercial': 'Buy & Hold'
    };
    
    // Log the property data being stored
    console.log('[Analysis] Property data being stored:', {
      property: propertyData?.property ? {
        bedrooms: (propertyData.property as any).bedrooms,
        bathrooms: (propertyData.property as any).bathrooms,
        squareFootage: (propertyData.property as any).squareFootage,
        yearBuilt: (propertyData.property as any).yearBuilt,
        propertyType: (propertyData.property as any).propertyType,
        addressLine1: (propertyData.property as any).addressLine1
      } : null,
      rental: propertyData?.rental,
      comparables: propertyData?.comparables ? {
        value: (propertyData.comparables as any).value,
        valueRangeLow: (propertyData.comparables as any).valueRangeLow,
        valueRangeHigh: (propertyData.comparables as any).valueRangeHigh,
        comparablesCount: (propertyData.comparables as any).comparables?.length
      } : null,
      market: propertyData?.market
    });
    
    // Prepare data for both possible table schemas
    const insertData = {
      user_id: user.id,
      address: body.address,
      strategy: body.strategy,
      purchase_price: purchasePrice,
      down_payment_percent: body.downPayment && purchasePrice ? (body.downPayment / purchasePrice) * 100 : 20,
      loan_term: body.loanTerms?.loanTerm || 30,
      interest_rate: body.loanTerms?.interestRate || 7,
      rehab_costs: body.rehabCosts,
      property_data: propertyData?.property || null,
      market_data: propertyData?.market || null,
      rental_estimate: propertyData?.rental || null,
      comparables: propertyData?.comparables || null,
      status: 'generating',
      ai_analysis: { status: 'generating' }, // Placeholder - will be updated after generation
      // Additional fields for analyzed_properties table if needed
      roi: 0.0, // Will be calculated after AI analysis
      profit: 0, // Will be calculated after AI analysis
      deal_type: strategyToDealType[body.strategy] || 'Buy & Hold',
      analysis_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
      analysis_data: {} // Will be populated after AI analysis
    };
    
    console.log('Insert data prepared:', JSON.stringify(insertData, null, 2));
    
    // Test Supabase connection first
    console.log('\n--- STEP 7.1: Testing Supabase Connection ---');
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can query the table
    const { data: testData, error: testError } = await supabase
      .from('analyzed_properties')
      .select('count(*)')
      .limit(1);
    
    console.log('Supabase test query result:', { 
      hasData: !!testData, 
      data: testData,
      hasError: !!testError,
      error: testError,
      errorType: typeof testError,
      errorKeys: testError ? Object.keys(testError) : 'null'
    });
    
    // Test 2: List required columns for analyzed_properties
    console.log('Required columns for analyzed_properties table:');
    console.log('- user_id (UUID, required)');
    console.log('- address (TEXT, required)');
    console.log('- roi (DECIMAL, required)');
    console.log('- profit (INTEGER, required)');
    console.log('- deal_type (TEXT, required, must be one of allowed values)');
    console.log('- analysis_date (DATE, has default)');
    console.log('- analysis_data (JSONB, optional)');
    
    // Test 3: Try a simpler insert with minimal data
    console.log('\n--- STEP 7.2: Attempting Insert ---');
    console.log('Attempting insert to user_analyses table...');
    
    // Log the exact data being sent
    console.log('Exact insert payload:', JSON.stringify(insertData, null, 2));
    
    // Use analyzed_properties table directly (user_analyses doesn't exist)
    console.log('Using analyzed_properties table...');
    const { data: analysisRecord, error: createError } = await supabase
      .from('analyzed_properties')
      .insert({
        user_id: user.id,
        address: body.address,
        roi: 0.0, // Will be calculated after AI analysis
        profit: 0, // Will be calculated after AI analysis
        deal_type: strategyToDealType[body.strategy] || 'Buy & Hold',
        analysis_date: new Date().toISOString().split('T')[0],
        analysis_data: {
          strategy: body.strategy,
          purchase_price: purchasePrice,
          down_payment_percent: body.downPayment && purchasePrice ? (body.downPayment / purchasePrice) * 100 : 20,
          loan_term: body.loanTerms?.loanTerm || 30,
          interest_rate: body.loanTerms?.interestRate || 7,
          property_data: propertyData,
          status: 'generating'
        }
      })
      .select()
      .single();

    if (createError || !analysisRecord) {
      console.error('\n=== DATABASE INSERT ERROR ===');
      console.error('Failed to create analysis record');
      console.error('Error present:', !!createError);
      console.error('Record present:', !!analysisRecord);
      
      if (createError) {
        console.error('Error object:', createError);
        console.error('Error type:', typeof createError);
        console.error('Error constructor:', createError?.constructor?.name);
        console.error('Error is null:', createError === null);
        console.error('Error is undefined:', createError === undefined);
        console.error('Error keys:', Object.keys(createError || {}));
        console.error('Error own property names:', Object.getOwnPropertyNames(createError || {}));
        console.error('Error entries:', Object.entries(createError || {}));
        console.error('Error prototype:', Object.getPrototypeOf(createError));
        
        // Try to access properties directly
        console.error('Direct property access:');
        console.error('- message:', (createError as any)?.message);
        console.error('- code:', (createError as any)?.code);
        console.error('- details:', (createError as any)?.details);
        console.error('- hint:', (createError as any)?.hint);
        console.error('- error:', (createError as any)?.error);
        
        // Stringify with replacer to catch all properties
        console.error('Full error stringified:', JSON.stringify(createError, (key, value) => {
          console.log(`Stringifying key: ${key}, value type: ${typeof value}`);
          return value;
        }, 2));
        
        // Check if it's a PostgrestError
        console.error('Is PostgrestError:', createError?.constructor?.name === 'PostgrestError');
      }
      
      console.error('Attempted insert data:', {
        user_id: user.id,
        address: body.address,
        strategy: body.strategy,
        purchase_price: purchasePrice,
        propertyData: propertyData ? 'Present' : 'Missing',
        fields: {
          down_payment_percent: body.downPayment && purchasePrice ? (body.downPayment / purchasePrice) * 100 : 20,
          loan_term: body.loanTerms?.loanTerm || 30,
          interest_rate: body.loanTerms?.interestRate || 7,
        }
      });
      
      // Try to extract more error information
      let errorMessage = 'Unknown database error';
      let errorCode = null;
      let errorHint = null;
      
      if (createError) {
        errorMessage = createError.message || createError.details || errorMessage;
        errorCode = createError.code;
        errorHint = createError.hint;
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create analysis', 
          details: errorMessage,
          code: errorCode,
          hint: errorHint,
          table: 'user_analyses'
        },
        { status: 500 }
      );
    }

    console.log('\n--- STEP 8: AI Analysis Generation ---');
    try {
      console.log('Calling generatePropertyAnalysis function...');
      console.log('Property data passed:', !!propertyData);
      console.log('Request body passed:', !!body);
      
      const aiAnalysis = await generatePropertyAnalysis(propertyData, body);
      console.log('AI analysis generated successfully');
      console.log('AI analysis keys:', Object.keys(aiAnalysis));
      
      // Update analyzed_properties table with AI results
      console.log('Updating analyzed_properties table with AI analysis...');
      
      const updateData = {
        analysis_data: {
          ...analysisRecord.analysis_data,
          ai_analysis: aiAnalysis,
          status: 'completed'
        },
        roi: aiAnalysis.financial_metrics?.roi || 0,
        profit: aiAnalysis.financial_metrics?.total_profit || 0
      };
      
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      const { error: updateError } = await supabase
        .from('analyzed_properties')
        .update(updateData)
        .eq('id', analysisRecord.id);

      if (updateError) {
        console.error('Failed to update analysis:', updateError);
      }

      // Update user's usage count (including admin tracking)
      console.log('[Analysis] Incrementing usage count for user:', user.id);
      const { error: usageUpdateError } = await supabase
        .rpc('increment_analysis_usage', { p_user_id: user.id });
      
      if (usageUpdateError) {
        console.error('Failed to update usage count:', usageUpdateError);
        console.error('Usage update error details:', {
          code: usageUpdateError.code,
          message: usageUpdateError.message,
          details: usageUpdateError.details
        });
        // Don't fail the request, just log the error
      } else {
        console.log('[Analysis] Successfully incremented usage count');
      }

      // Return complete analysis
      return NextResponse.json({
        id: analysisRecord.id,
        address: body.address,
        strategy: body.strategy,
        propertyData,
        analysis: aiAnalysis,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      // Update analysis status to failed
      await supabase
        .from('analyzed_properties')
        .update({
          analysis_data: {
            ...analysisRecord.analysis_data,
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          }
        })
        .eq('id', analysisRecord.id);

      throw error;
    }

  } catch (error) {
    console.error('\n=== DETAILED ERROR INFORMATION ===');
    console.error('Error caught at:', new Date().toISOString());
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error cause:', error instanceof Error ? error.cause : 'No cause');
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    logError('Property Analysis API', error);
    
    if (error instanceof Error) {
      if (error.message?.includes('not found')) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }
      
      if (error.message?.includes('Rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to generate analysis', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate analysis', details: 'Unknown error' },
      { status: 500 }
    );
  }
}

interface PropertyData {
  property: Record<string, unknown>;
  rental?: Record<string, unknown>;
  market?: Record<string, unknown>;
  comparables?: Array<Record<string, unknown>>;
}

async function generatePropertyAnalysis(propertyData: PropertyData, request: PropertyAnalysisRequest) {
  console.log('\n[generatePropertyAnalysis] Starting AI analysis generation');
  console.log('[generatePropertyAnalysis] Property data received:', !!propertyData);
  console.log('[generatePropertyAnalysis] Request data received:', !!request);
  
  try {
    // Prepare context for AI
    console.log('[generatePropertyAnalysis] Preparing context...');
    const { context, calculatedMetrics } = prepareAnalysisContext(propertyData, request);
    console.log('[generatePropertyAnalysis] Context length:', context.length);
    console.log('[generatePropertyAnalysis] Context preview:', context.substring(0, 200) + '...');
    console.log('[generatePropertyAnalysis] Calculated metrics:', calculatedMetrics);
    
    // Generate analysis using Claude
    console.log('[generatePropertyAnalysis] Calling Claude API...');
    const claudeRequest = {
      model: "claude-3-5-sonnet-20241022", // Using latest available model
      max_tokens: 4000,
      temperature: 0.3,
      system: `You are a professional real estate investment analyst. Create a comprehensive, data-driven analysis for real estate investments. 

IMPORTANT: Tailor your analysis based on the investment strategy:

FOR FIX & FLIP PROPERTIES:
Your analysis must include:
1. Executive Summary (2-3 sentences focusing on profit potential)
2. Investment Recommendation (Buy/Hold/Pass based on profit margin and ARV)
3. Key Financial Metrics (Use EXACT values from FIX & FLIP ANALYSIS):
   - After Repair Value (ARV): $[exact value]
   - Total Investment: $[exact value]
   - Net Profit: $[exact value]
   - Return on Investment: [exact percentage]%
   - Profit Margin: [exact percentage]%
   - Holding Period: [months]
4. Risk Assessment (Focus on renovation risks, market timing, ARV accuracy)
5. Market Analysis (Focus on buyer demand and comparable sales)
6. Renovation Strategy (Timeline, scope, budget allocation)
7. 3-5 Key Opportunities (Value-add improvements, market trends)
8. 3-5 Key Risks (Construction delays, budget overruns, market shifts)
9. Exit Strategy & Action Items

DO NOT include monthly cash flow, cap rates, or rental income for fix & flip properties.

FOR RENTAL PROPERTIES:
Your analysis must include:
1. Executive Summary (2-3 sentences)
2. Investment Recommendation (Buy/Hold/Pass with clear reasoning)
3. Key Financial Metrics (Use EXACT values from CASH FLOW ANALYSIS):
   - Monthly Cash Flow: $[exact value]
   - Cap Rate: [exact percentage]%
   - Cash-on-Cash Return: [exact percentage]%
   - Total ROI: [calculated percentage]%
   - Annual NOI: $[calculated value]
4. Risk Assessment (Low/Medium/High with specific factors)
5. Market Analysis
6. Investment Strategy Details
7. 3-5 Key Opportunities
8. 3-5 Key Risks
9. Action Items for investor

CRITICAL: Use the EXACT numerical values from the calculations section provided. Do not recalculate or modify these numbers. Format monetary values with proper commas but preserve the exact amounts.`,
      messages: [
        {
          role: "user" as const,
          content: context
        }
      ]
    };
    
    console.log('[generatePropertyAnalysis] Claude request prepared');
    console.log('[generatePropertyAnalysis] Model:', claudeRequest.model);
    console.log('[generatePropertyAnalysis] Max tokens:', claudeRequest.max_tokens);
    
    const response = await anthropic.messages.create(claudeRequest);
    
    console.log('[generatePropertyAnalysis] Claude response received');
    console.log('[generatePropertyAnalysis] Response usage:', response.usage);
    console.log('[generatePropertyAnalysis] Response model:', response.model);
    
    const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
    console.log('[generatePropertyAnalysis] Analysis text length:', analysisText.length);
    console.log('[generatePropertyAnalysis] Raw Claude response preview:', analysisText.substring(0, 500) + '...');
    
    // Parse the analysis into structured format with calculated metrics as fallback
    const parsedAnalysis = parseAnalysisResponse(analysisText, request.strategy, calculatedMetrics);
    console.log('[generatePropertyAnalysis] Parsed analysis:', JSON.stringify(parsedAnalysis, null, 2));
    console.log('[generatePropertyAnalysis] Financial metrics:', parsedAnalysis.financial_metrics);
    
    return parsedAnalysis;
    
  } catch (error) {
    console.error('[generatePropertyAnalysis] ERROR occurred:');
    console.error('[generatePropertyAnalysis] Error type:', error?.constructor?.name);
    console.error('[generatePropertyAnalysis] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[generatePropertyAnalysis] Full error:', error);
    
    logError('AI Analysis Generation', error);
    
    if (error instanceof Error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
    throw new Error('Failed to generate AI analysis');
  }
}

function calculateMonthlyPayment(principal: number, interestRate: number, termYears: number, loanType?: string, rehabAmount?: number): number {
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = termYears * 12;
  
  // Hard money loans are typically interest-only
  if (loanType === 'hardMoney') {
    // Interest-only payment on purchase loan
    let payment = principal * monthlyRate;
    
    // Add interest on rehab loan if applicable
    if (rehabAmount && rehabAmount > 0) {
      payment += rehabAmount * monthlyRate;
    }
    
    return Math.round(payment);
  }
  
  // Traditional amortized loan calculation
  if (monthlyRate === 0) return principal / numPayments;
  
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return Math.round(payment);
}

function prepareAnalysisContext(propertyData: PropertyData, request: PropertyAnalysisRequest): { context: string; calculatedMetrics: FinancialData } {
  const { property: propertyDetails, rental: rentalEstimate, comparables, market: marketData } = propertyData;
  const property = (Array.isArray(propertyDetails) ? propertyDetails[0] : propertyDetails) as Record<string, unknown>;
  
  // Log for debugging
  console.log('[Context] Property details:', property);
  console.log('[Context] Rental estimate:', rentalEstimate);
  console.log('[Context] Comparables:', comparables);
  console.log('[Context] Market data:', marketData);
  console.log('[Context] Strategy:', request.strategy);
  
  // Check if this is a fix & flip strategy
  const isFlipStrategy = request.strategy === 'flip';
  
  let context = `Analyze this property for a ${request.strategy} investment strategy:

PROPERTY DETAILS:
- Address: ${property?.addressLine1}, ${property?.city}, ${property?.state} ${property?.zipCode}
- Type: ${property?.propertyType}
- Size: ${property?.squareFootage} sq ft
- Bedrooms: ${property?.bedrooms}, Bathrooms: ${property?.bathrooms}
- Year Built: ${property?.yearBuilt}
- Last Sale: $${property?.lastSalePrice?.toLocaleString() || 'Unknown'} on ${property?.lastSaleDate || 'Unknown'}

RENTAL ANALYSIS:
- Estimated Rent: $${(rentalEstimate as any)?.rentEstimate || 'N/A'}/month
- Rent Range: $${(rentalEstimate as any)?.rentRangeLow || 'N/A'} - $${(rentalEstimate as any)?.rentRangeHigh || 'N/A'}

MARKET DATA:
- Median Rent: $${(marketData as any)?.medianRent}
- Median Price: $${(marketData as any)?.medianSalePrice}
- Average Days on Market: ${(marketData as any)?.averageDaysOnMarket}

COMPARABLES:
- Estimated Value: $${(comparables as any)?.value?.toLocaleString() || 'N/A'}
- Value Range: $${(comparables as any)?.valueRangeLow?.toLocaleString() || 'N/A'} - $${(comparables as any)?.valueRangeHigh?.toLocaleString() || 'N/A'}
${(comparables as any)?.comparables && Array.isArray((comparables as any).comparables) ? 
  '\nRecent Sales:\n' + (comparables as any).comparables.slice(0, 3).map((comp: any) => 
    `- ${comp.address || 'Property'}: $${comp.price?.toLocaleString() || 'N/A'} (${comp.squareFootage || 'N/A'} sq ft)`
  ).join('\n') : ''}
`;

  // Add investment parameters
  const purchasePrice = request.purchasePrice || (comparables as any)?.price || (comparables as any)?.value || 0;
  if (purchasePrice > 0) {
    context += `\nINVESTMENT PARAMETERS:
- Purchase Price: $${purchasePrice.toLocaleString()}
- Down Payment: $${request.downPayment?.toLocaleString() || 'Not specified'}`;
  }

  if (request.loanTerms) {
    context += `\n- Interest Rate: ${request.loanTerms.interestRate}%
- Loan Term: ${request.loanTerms.loanTerm} years
- Loan Type: ${request.loanTerms.loanType}`;
  }

  if (request.rehabCosts) {
    context += `\n- Rehab Costs: $${request.rehabCosts.toLocaleString()}`;
  }

  if (request.arv && isFlipStrategy) {
    context += `\n- ARV (After Repair Value): $${request.arv.toLocaleString()}`;
  }

  // Calculate key metrics for context
  const effectivePurchasePrice = purchasePrice || 0;
  const downPayment = request.downPayment || (effectivePurchasePrice * 0.20);
  const loanAmount = effectivePurchasePrice - downPayment;
  const pointsCost = request.loanTerms?.points ? (loanAmount * request.loanTerms.points) / 100 : 0;
  
  let calculatedMetrics: FinancialData;
  
  if (isFlipStrategy) {
    // Fix & Flip specific calculations
    // Use provided ARV if available, otherwise use comparables or estimate
    const estimatedARV = request.arv || (comparables as any)?.value || effectivePurchasePrice * 1.3;
    const rehabCosts = request.rehabCosts || 0;
    const closingCosts = effectivePurchasePrice * 0.03; // 3% closing costs
    const holdingTime = request.loanTerms?.loanTerm || 0.5; // in years
    
    // For holding costs calculation
    const propertyTaxes = Math.round((effectivePurchasePrice * 0.01) / 12);
    const insurance = Math.round((effectivePurchasePrice * 0.004) / 12);
    
    const monthlyHoldingCosts = calculateMonthlyPayment(loanAmount, request.loanTerms?.interestRate || 10.45, holdingTime, request.loanTerms?.loanType, rehabCosts);
    const totalHoldingCosts = monthlyHoldingCosts * (holdingTime * 12) + (propertyTaxes * holdingTime * 12) + (insurance * holdingTime * 12);
    const sellingCosts = estimatedARV * 0.08; // 8% for realtor fees, closing costs
    const totalInvestment = downPayment + rehabCosts + closingCosts + pointsCost;
    const totalProjectCost = effectivePurchasePrice + rehabCosts + closingCosts + totalHoldingCosts + sellingCosts + pointsCost;
    const netProfit = estimatedARV - totalProjectCost;
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
    
    context += `\n\nFIX & FLIP ANALYSIS:
    
PURCHASE & FINANCING:
- Purchase Price: $${effectivePurchasePrice.toLocaleString()}
- Down Payment: $${downPayment.toLocaleString()} (${effectivePurchasePrice > 0 ? ((downPayment/effectivePurchasePrice) * 100).toFixed(1) : '20.0'}%)
- Loan Amount: $${loanAmount.toLocaleString()}
- Interest Rate: ${request.loanTerms?.interestRate || 10.45}%
- Loan Term: ${holdingTime * 12} months
- Loan Type: ${request.loanTerms?.loanType === 'hardMoney' ? 'Hard Money' : 'Conventional'}${request.loanTerms?.points ? `
- Points/Fees: ${request.loanTerms.points} points ($${Math.round(pointsCost).toLocaleString()})` : ''}

RENOVATION & COSTS:
- Rehab Budget: $${rehabCosts.toLocaleString()}
- Closing Costs (Purchase): $${Math.round(closingCosts).toLocaleString()}
- Monthly Holding Costs: $${monthlyHoldingCosts.toLocaleString()}
- Total Holding Costs: $${Math.round(totalHoldingCosts).toLocaleString()}
- Selling Costs (8%): $${Math.round(sellingCosts).toLocaleString()}

EXIT STRATEGY:
- After Repair Value (ARV): $${Math.round(estimatedARV).toLocaleString()}
- Total Project Cost: $${Math.round(totalProjectCost).toLocaleString()}
- Net Profit: $${Math.round(netProfit).toLocaleString()} ${netProfit < 0 ? '(LOSS)' : '(PROFIT)'}
- Cash Investment: $${Math.round(totalInvestment).toLocaleString()}
- Return on Investment: ${roi.toFixed(2)}%
- Profit Margin: ${estimatedARV > 0 ? ((netProfit / estimatedARV) * 100).toFixed(2) : '0.00'}%

Provide a comprehensive fix & flip analysis focusing on ARV, renovation costs, holding costs, and profit margins. Do NOT include rental income or cash flow calculations.`;

    calculatedMetrics = {
      totalInvestment: totalInvestment,
      totalProfit: netProfit,
      roi: roi,
      // Set rental-focused metrics to 0 or undefined for flips
      cashFlow: 0,
      capRate: 0,
      cocReturn: roi, // Use ROI instead
      annualNOI: 0
    };
    
  } else {
    // Rental property calculations - use user-specified rent if available
    const monthlyRent = request.monthlyRent || (rentalEstimate as any)?.rent || (rentalEstimate as any)?.rentEstimate || 0;
    const monthlyPayment = effectivePurchasePrice > 0 ? calculateMonthlyPayment(loanAmount, request.loanTerms?.interestRate || 7, request.loanTerms?.loanTerm || 30, request.loanTerms?.loanType, request.rehabCosts) : 0;
    
    // Calculate additional metrics for better analysis
    const propertyTaxes = Math.round((effectivePurchasePrice * 0.01) / 12);
    const insurance = Math.round((effectivePurchasePrice * 0.004) / 12);
    const hoa = 0; // Could be added as parameter
    const maintenance = Math.round(monthlyRent * 0.1); // 10% of rent for maintenance
    const propertyManagement = Math.round(monthlyRent * 0.08); // 8% for management
    const vacancy = Math.round(monthlyRent * 0.05); // 5% vacancy factor
    
    const totalExpenses = monthlyPayment + propertyTaxes + insurance + hoa + maintenance + propertyManagement + vacancy;
    const monthlyCashFlow = monthlyRent - totalExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const capRate = effectivePurchasePrice > 0 ? ((monthlyRent * 12 - (propertyTaxes + insurance + maintenance) * 12) / effectivePurchasePrice * 100) : 0;
    const cashOnCash = downPayment > 0 ? (annualCashFlow / downPayment * 100) : 0;
    
    const annualNOI = (monthlyRent * 12) - ((propertyTaxes + insurance + maintenance) * 12);
    
    context += `\n\nKEY CALCULATIONS:
INCOME:
- Monthly Rent: $${monthlyRent.toLocaleString()}
- Annual Rental Income: $${(monthlyRent * 12).toLocaleString()}

FINANCING:
- Purchase Price: $${effectivePurchasePrice.toLocaleString()}
- Down Payment: $${downPayment.toLocaleString()} (${effectivePurchasePrice > 0 ? ((downPayment/effectivePurchasePrice) * 100).toFixed(1) : '20.0'}%)
- Loan Amount: $${loanAmount.toLocaleString()}
- Interest Rate: ${request.loanTerms?.interestRate || 7}%
- Loan Term: ${request.loanTerms?.loanTerm || 30} ${request.loanTerms?.loanTerm && request.loanTerms.loanTerm < 2 ? 'year' : 'years'}
- Loan Type: ${request.loanTerms?.loanType === 'hardMoney' ? 'Hard Money' : 'Conventional'}${request.loanTerms?.points ? `
- Points/Fees: ${request.loanTerms.points} points ($${Math.round(pointsCost).toLocaleString()})` : ''}

MONTHLY EXPENSES:
- Mortgage Payment (P&I): $${monthlyPayment.toLocaleString()}
- Property Taxes: $${propertyTaxes.toLocaleString()}
- Insurance: $${insurance.toLocaleString()}
- Maintenance (10%): $${maintenance.toLocaleString()}
- Property Management (8%): $${propertyManagement.toLocaleString()}
- Vacancy Reserve (5%): $${vacancy.toLocaleString()}
- Total Monthly Expenses: $${totalExpenses.toLocaleString()}

CASH FLOW ANALYSIS:
- Monthly Cash Flow: $${monthlyCashFlow.toLocaleString()} ${monthlyCashFlow < 0 ? '(NEGATIVE)' : '(POSITIVE)'}
- Annual Cash Flow: $${annualCashFlow.toLocaleString()}
- Cap Rate: ${capRate.toFixed(2)}%
- Cash-on-Cash Return: ${cashOnCash.toFixed(2)}%
- Annual NOI: $${annualNOI.toLocaleString()}

Provide a comprehensive analysis following the format specified. Make sure to include ALL the financial metrics in your response with the exact calculations shown above.`;
    
    calculatedMetrics = {
      cashFlow: monthlyCashFlow,
      capRate: capRate,
      cocReturn: cashOnCash,
      roi: cashOnCash * 5, // Simple 5-year projection
      totalInvestment: downPayment + (request.rehabCosts || 0) + pointsCost,
      annualNOI: annualNOI,
      totalProfit: annualCashFlow * 5 // 5-year profit projection
    };
  }

  return { context, calculatedMetrics };
}

interface ParsedAnalysisResponse {
  summary: string;
  recommendation: string;
  risks: string[];
  opportunities: string[];
  financial_metrics: {
    monthly_cash_flow?: number;
    cap_rate?: number;
    cash_on_cash_return?: number;
    roi?: number;
    total_investment?: number;
    annual_noi?: number;
    total_profit?: number;
  };
  market_analysis: string;
  investment_strategy: {
    type: string;
    details: string;
  };
  full_analysis: string;
}

function parseAnalysisResponse(analysisText: string, strategy: string, calculatedMetrics?: FinancialData): ParsedAnalysisResponse {
  // Extract financial metrics
  const financialData = extractFinancialData(analysisText);
  
  // Use calculated metrics as fallback if extraction fails
  const finalMetrics = {
    cashFlow: financialData.cashFlow !== undefined ? financialData.cashFlow : calculatedMetrics?.cashFlow,
    capRate: financialData.capRate !== undefined ? financialData.capRate : calculatedMetrics?.capRate,
    cocReturn: financialData.cocReturn !== undefined ? financialData.cocReturn : calculatedMetrics?.cocReturn,
    roi: financialData.roi !== undefined ? financialData.roi : calculatedMetrics?.roi,
    totalInvestment: financialData.totalInvestment !== undefined ? financialData.totalInvestment : calculatedMetrics?.totalInvestment,
    annualNOI: financialData.annualNOI !== undefined ? financialData.annualNOI : calculatedMetrics?.annualNOI,
    totalProfit: financialData.totalProfit !== undefined ? financialData.totalProfit : calculatedMetrics?.totalProfit
  };
  
  // Extract sections more reliably
  const summary = extractSectionByHeader(analysisText, ['executive summary', 'summary', 'overview']) || 
                 analysisText.split('\n')[0];
  
  const recommendation = extractSectionByHeader(analysisText, ['recommendation', 'investment recommendation']) ||
                        extractRecommendation(analysisText);
  
  const marketAnalysis = extractSectionByHeader(analysisText, ['market analysis', 'market position', 'market overview']) || '';
  
  const strategyDetails = extractSectionByHeader(analysisText, [
    'investment strategy', 
    'strategy details',
    `${strategy} strategy`,
    `${strategy} analysis`
  ]) || '';
  
  // Log the extracted financial data for debugging
  console.log('[parseAnalysisResponse] Extracted financial data:', financialData);
  console.log('[parseAnalysisResponse] Calculated metrics (fallback):', calculatedMetrics);
  console.log('[parseAnalysisResponse] Final metrics:', finalMetrics);
  
  return {
    summary,
    recommendation,
    risks: extractRisks(analysisText),
    opportunities: extractOpportunities(analysisText),
    financial_metrics: {
      monthly_cash_flow: finalMetrics.cashFlow,
      cap_rate: finalMetrics.capRate,
      cash_on_cash_return: finalMetrics.cocReturn,
      roi: finalMetrics.roi,
      total_investment: finalMetrics.totalInvestment,
      annual_noi: finalMetrics.annualNOI,
      total_profit: finalMetrics.totalProfit
    },
    market_analysis: marketAnalysis,
    investment_strategy: {
      type: strategy,
      details: strategyDetails
    },
    full_analysis: analysisText
  };
}


function extractSectionByHeader(text: string, headers: string[]): string {
  for (const header of headers) {
    const regex = new RegExp(`(?:^|\\n)(?:\\d+\\.\\s*)?${header}[:\\s]+(.+?)(?=\\n\\d+\\.|\\n[A-Z][A-Z\\s]+:|$)`, 'is');
    const match = text.match(regex);
    if (match) {
      return match[1].trim();
    }
  }
  return '';
}

function extractRecommendation(text: string): string {
  const match = text.match(/recommendation[:\s]+(.*?)(?:\n\d\.|$)/is);
  return match ? match[1].trim() : '';
}

function extractRisks(text: string): string[] {
  const risks: string[] = [];
  const riskSection = text.match(/risk.*?:(.*?)(?:\n\d\.|$)/is);
  
  if (riskSection) {
    const lines = riskSection[1].split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s*/) && line.length > 10) {
        risks.push(line.replace(/^[-•*]\s*/, '').trim());
      }
    }
  }
  
  return risks;
}

function extractOpportunities(text: string): string[] {
  const opportunities: string[] = [];
  const oppSection = text.match(/opportunit.*?:(.*?)(?:\n\d\.|$)/is);
  
  if (oppSection) {
    const lines = oppSection[1].split('\n');
    for (const line of lines) {
      if (line.match(/^[-•*]\s*/) && line.length > 10) {
        opportunities.push(line.replace(/^[-•*]\s*/, '').trim());
      }
    }
  }
  
  return opportunities;
}

interface FinancialData {
  cashFlow?: number;
  capRate?: number;
  roi?: number;
  cocReturn?: number;
  totalInvestment?: number;
  annualNOI?: number;
  totalProfit?: number;
}

function extractFinancialData(text: string): FinancialData {
  console.log('[extractFinancialData] Starting extraction from text length:', text.length);
  const data: FinancialData = {};
  
  // Extract common financial metrics using regex with more variations
  const patterns = {
    cashFlow: [
      /(?:monthly\s+)?cash\s*flow[:\s]+\$?([\d,.-]+)/i,
      /monthly\s+cash\s+flow:\s*\$?([\d,.-]+)/i,
      /cash\s+flow\s*\(monthly\)[:\s]+\$?([\d,.-]+)/i,
      /monthly:\s*\$?([\d,.-]+)/i
    ],
    capRate: [
      /cap(?:\s+rate)?[:\s]+([\d.]+)%/i,
      /cap\s+rate:\s*([\d.]+)%/i,
      /capitalization\s+rate[:\s]+([\d.]+)%/i
    ],
    roi: [
      /(?:total\s+)?roi[:\s]+([\d.]+)%/i,
      /return\s+on\s+investment[:\s]+([\d.]+)%/i,
      /5[-\s]?year\s+roi[:\s]+([\d.]+)%/i,
      /total\s+roi.*?[:\s]+([\d.]+)%/i
    ],
    cocReturn: [
      /cash[- ]?on[- ]?cash(?:\s+return)?[:\s]+([\d.]+)%/i,
      /coc\s+return[:\s]+([\d.]+)%/i,
      /cash\s+on\s+cash:\s*([\d.]+)%/i,
      /cash-on-cash\s+return[:\s]+([\d.]+)%/i
    ],
    totalInvestment: [
      /total\s*investment[:\s]+\$?([\d,]+)/i,
      /initial\s+investment[:\s]+\$?([\d,]+)/i,
      /cash\s+required[:\s]+\$?([\d,]+)/i
    ],
    annualNOI: [
      /(?:annual\s+)?noi[:\s]+\$?([\d,]+)/i,
      /net\s+operating\s+income[:\s]+\$?([\d,]+)/i,
      /annual\s+noi[:\s]+\$?([\d,]+)/i
    ],
    totalProfit: [
      /total\s*profit[:\s]+\$?([\d,.-]+)/i,
      /net\s+profit[:\s]+\$?([\d,.-]+)/i,
      /profit[:\s]+\$?([\d,.-]+)/i
    ]
  };
  
  // Try each pattern array for each metric
  for (const [key, patternArray] of Object.entries(patterns)) {
    for (const pattern of patternArray) {
      const match = text.match(pattern);
      if (match) {
        const value = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(value)) {
          (data as any)[key] = value;
          console.log(`[extractFinancialData] Found ${key}: ${value}`);
          break; // Found a match, move to next metric
        }
      }
    }
  }
  
  // Try to extract from FIX & FLIP ANALYSIS section
  const flipSection = text.match(/FIX & FLIP ANALYSIS:([\s\S]+?)(?:\n\n|Provide|$)/i);
  if (flipSection) {
    console.log('[extractFinancialData] Found FIX & FLIP ANALYSIS section, extracting...');
    const flipText = flipSection[1];
    
    // Extract net profit
    const profitMatch = flipText.match(/Net Profit:\s*\$?([\d,.-]+)/i);
    if (profitMatch && !data.totalProfit) {
      data.totalProfit = parseFloat(profitMatch[1].replace(/,/g, ''));
      console.log('[extractFinancialData] Extracted net profit from flip analysis:', data.totalProfit);
    }
    
    // Extract ROI
    const roiMatch = flipText.match(/Return on Investment:\s*([\d.-]+)%/i);
    if (roiMatch && !data.roi) {
      data.roi = parseFloat(roiMatch[1]);
      console.log('[extractFinancialData] Extracted ROI from flip analysis:', data.roi);
    }
    
    // Extract total investment
    const investmentMatch = flipText.match(/Cash Investment:\s*\$?([\d,]+)/i);
    if (investmentMatch && !data.totalInvestment) {
      data.totalInvestment = parseFloat(investmentMatch[1].replace(/,/g, ''));
      console.log('[extractFinancialData] Extracted total investment from flip analysis:', data.totalInvestment);
    }
  }
  
  // Also try to extract from the CASH FLOW ANALYSIS section for rental properties
  const keyCalcsSection = text.match(/CASH FLOW ANALYSIS:([\s\S]+?)(?:\n\n|$)/i);
  if (keyCalcsSection) {
    console.log('[extractFinancialData] Found CASH FLOW ANALYSIS section, extracting...');
    const calcsText = keyCalcsSection[1];
    
    // Extract monthly cash flow with more patterns
    const cashFlowMatch = calcsText.match(/Monthly Cash Flow:\s*\$?([\d,.-]+)/i);
    if (cashFlowMatch && !data.cashFlow) {
      data.cashFlow = parseFloat(cashFlowMatch[1].replace(/,/g, ''));
      console.log('[extractFinancialData] Extracted monthly cash flow from calculations:', data.cashFlow);
    }
    
    // Extract cap rate
    const capRateMatch = calcsText.match(/Cap Rate:\s*([\d.]+)%/i);
    if (capRateMatch && !data.capRate) {
      data.capRate = parseFloat(capRateMatch[1]);
      console.log('[extractFinancialData] Extracted cap rate from calculations:', data.capRate);
    }
    
    // Extract cash-on-cash
    const cocMatch = calcsText.match(/Cash-on-Cash Return:\s*([\d.]+)%/i);
    if (cocMatch && !data.cocReturn) {
      data.cocReturn = parseFloat(cocMatch[1]);
      console.log('[extractFinancialData] Extracted CoC return from calculations:', data.cocReturn);
    }
  }
  
  // If we still don't have values, use the calculated values from the context
  // This is a fallback based on the calculations we provided to Claude
  if (!data.cashFlow && text.includes('Monthly Cash Flow:')) {
    console.log('[extractFinancialData] Using fallback extraction for cash flow');
    // Look for the value we calculated in prepareAnalysisContext
    const contextMatch = text.match(/Monthly Cash Flow:\s*\$?([\d,.-]+)\s*\(/i);
    if (contextMatch) {
      data.cashFlow = parseFloat(contextMatch[1].replace(/,/g, ''));
    }
  }
  
  // Log final extracted data
  console.log('[extractFinancialData] Final extracted data:', data);
  
  return data;
}