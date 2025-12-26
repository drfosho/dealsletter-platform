import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { rentCastService } from '@/services/rentcast';
import { PropertyAnalysisRequest } from '@/types/rentcast';
// These types are imported but not used in this file
import { logError } from '@/utils/error-utils';
import Anthropic from '@anthropic-ai/sdk';
import { getAdminConfig } from '@/lib/admin-config';
import { calculateBRRRR, type BRRRRInputs } from '@/utils/brrrr-calculator';
import {
  parsePrice,
  parsePercentage,
  parseInteger,
  calculateMonthlyMortgage as calculateMortgagePayment,
  calculateMonthlyRevenue,
  validateInputs as validateFinancialInputs,
  calculateFlipReturns,
  type FlipCalculationInputs
} from '@/utils/financial-calculations';

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

    // Validate financial inputs using centralized validation
    const parsedPurchasePrice = parsePrice(body.purchasePrice);
    const parsedDownPayment = parsePrice(body.downPayment);
    const parsedInterestRate = parsePercentage(body.loanTerms?.interestRate);
    const parsedLoanTerm = parseInteger(body.loanTerms?.loanTerm);
    const parsedUnits = parseInteger(body.units) || 1;
    const parsedMonthlyRent = parsePrice(body.monthlyRent);

    console.log('\n--- STEP 4.1: Financial Input Validation ---');
    console.log('Parsed financial values:', {
      purchasePrice: parsedPurchasePrice,
      downPayment: parsedDownPayment,
      downPaymentPercent: parsedPurchasePrice > 0 ? (parsedDownPayment / parsedPurchasePrice * 100).toFixed(1) + '%' : 'N/A',
      interestRate: parsedInterestRate,
      loanTerm: parsedLoanTerm,
      units: parsedUnits,
      monthlyRent: parsedMonthlyRent
    });

    // Validate using centralized utility
    const validationResult = validateFinancialInputs({
      purchasePrice: parsedPurchasePrice,
      downPaymentPercent: parsedPurchasePrice > 0 ? (parsedDownPayment / parsedPurchasePrice) * 100 : 20,
      interestRate: parsedInterestRate || 7,
      loanTermYears: parsedLoanTerm || 30,
      numberOfUnits: parsedUnits,
      rentPerUnit: parsedMonthlyRent / Math.max(1, parsedUnits)
    });

    if (!validationResult.isValid) {
      console.error('[Validation] Input validation failed:', validationResult.errors);
      return NextResponse.json(
        {
          error: 'Invalid financial inputs',
          details: validationResult.errors.join('; '),
          warnings: validationResult.warnings
        },
        { status: 400 }
      );
    }

    if (validationResult.warnings.length > 0) {
      console.warn('[Validation] Input warnings:', validationResult.warnings);
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
    
    // Ensure property data is properly structured
    let structuredPropertyData = propertyData;
    if (propertyData && !propertyData.property && propertyData.listing) {
      // If we have listing data but no property key, restructure it
      structuredPropertyData = {
        ...propertyData,
        property: propertyData.listing
      };
    }
    
    // Log the property data being stored
    console.log('[Analysis] Property data being stored:', {
      hasProperty: !!structuredPropertyData?.property,
      hasListing: !!structuredPropertyData?.listing,
      property: structuredPropertyData?.property ? {
        bedrooms: (structuredPropertyData.property as any).bedrooms,
        bathrooms: (structuredPropertyData.property as any).bathrooms,
        squareFootage: (structuredPropertyData.property as any).squareFootage,
        yearBuilt: (structuredPropertyData.property as any).yearBuilt,
        propertyType: (structuredPropertyData.property as any).propertyType,
        addressLine1: (structuredPropertyData.property as any).addressLine1,
        images: (structuredPropertyData.property as any).images?.length || 0
      } : null,
      rental: structuredPropertyData?.rental,
      comparables: structuredPropertyData?.comparables ? {
        value: (structuredPropertyData.comparables as any).value,
        valueRangeLow: (structuredPropertyData.comparables as any).valueRangeLow,
        valueRangeHigh: (structuredPropertyData.comparables as any).valueRangeHigh,
        comparablesCount: (structuredPropertyData.comparables as any).comparables?.length
      } : null,
      market: structuredPropertyData?.market
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
      rehab_costs: body.rehabCosts || 0,
      property_data: structuredPropertyData || null,
      market_data: structuredPropertyData?.market || null,
      rental_estimate: structuredPropertyData?.rental || null,
      comparables: structuredPropertyData?.comparables || null,
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
          property_data: structuredPropertyData,
          rehab_costs: body.rehabCosts || 0,
          strategy_details: (body as any).strategyDetails || {},
          flip_timeline_months: (body as any).strategyDetails?.timeline || null,
          status: 'generating',
          units: body.units || 1,
          monthlyRent: body.monthlyRent || 0,
          rentPerUnit: body.rentPerUnit || 0
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

      // CRITICAL: Extract ROI and profit from AI analysis with explicit logging
      const extractedRoi = aiAnalysis.financial_metrics?.roi;
      const extractedProfit = aiAnalysis.financial_metrics?.total_profit ||
                              aiAnalysis.financial_metrics?.net_profit;

      console.log('[Generate] Extracted financial metrics for DB update:', {
        roi: extractedRoi,
        roiType: typeof extractedRoi,
        profit: extractedProfit,
        profitType: typeof extractedProfit,
        fullFinancialMetrics: aiAnalysis.financial_metrics
      });

      // Use the extracted values, defaulting to 0 only if undefined/null
      const finalRoi = extractedRoi ?? 0;
      const finalProfit = extractedProfit ?? 0;

      console.log('[Generate] Final values for DB:', { finalRoi, finalProfit });

      const updateData = {
        analysis_data: {
          ...analysisRecord.analysis_data,
          ai_analysis: aiAnalysis,
          status: 'completed'
        },
        roi: finalRoi,
        profit: finalProfit
      };

      console.log('[Generate] Update data ROI/Profit:', {
        roi: updateData.roi,
        profit: updateData.profit
      });

      const { data: updateResult, error: updateError } = await supabase
        .from('analyzed_properties')
        .update(updateData)
        .eq('id', analysisRecord.id)
        .select('roi, profit')
        .single();

      if (updateError) {
        console.error('[Generate] CRITICAL: Failed to update analysis:', updateError);
        console.error('[Generate] Update error details:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details
        });
      } else {
        console.log('[Generate] Successfully updated analysis. Verified values:', updateResult);
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
    // Optimized system prompt - strategy-specific to reduce token usage
    // QUALITY GUIDELINES for all prompts:
    // - Professional, grammatically correct English
    // - No markdown formatting (**, *, --, #, etc.)
    // - Clear, complete sentences
    // - Concise and actionable recommendations
    const systemPrompts: Record<string, string> = {
      brrrr: `You are a professional real estate investment analyst providing clear, actionable analysis.

CRITICAL REQUIREMENTS:
- Use EXACT numerical values from "BRRRR STRATEGY ANALYSIS" section
- Write in professional, grammatically correct English
- DO NOT use any markdown formatting (no **, *, --, #, bullet points)
- Use complete, well-structured sentences
- Be concise but thorough

OUTPUT FORMAT:

SUMMARY: [2-3 sentences explaining the investment opportunity and capital recovery potential]

RECOMMENDATION: [BUY, HOLD, or PASS] - [One clear sentence explaining why]

BRRRR PHASES:
Phase 1 (Acquisition): Cash required: [exact value]
Phase 2 (Refinance): Cash returned: [exact value]
Phase 3 (Rental): Monthly cash flow: [exact value]

KEY METRICS: Total Investment: [value], Cash Returned: [value], Cash Remaining: [value], Monthly Cash Flow: [value], Cash-on-Cash Return: [value], 5-Year ROI: [value]

RISK LEVEL: [Low/Medium/High] - [Brief explanation of main risk factors including ARV accuracy, refinance approval likelihood, and potential delays]

OPPORTUNITIES: [3-5 specific opportunities as complete sentences]

RISKS: [3-5 specific risks as complete sentences]

NEXT STEPS: [2-3 specific, actionable items]

Use provided values verbatim. Write naturally without any formatting symbols.`,

      flip: `You are a professional real estate investment analyst providing clear, actionable analysis.

CRITICAL REQUIREMENTS:
- Use EXACT values from "FIX & FLIP ANALYSIS" section
- Write in professional, grammatically correct English
- DO NOT use any markdown formatting (no **, *, --, #, bullet points)
- Use complete, well-structured sentences
- Focus on flip-specific metrics only (no rental metrics)

OUTPUT FORMAT:

SUMMARY: [2-3 sentences explaining the profit potential and project scope]

RECOMMENDATION: [BUY, HOLD, or PASS] - [One clear sentence explaining why based on the numbers]

KEY METRICS: ARV: [value], Total Investment: [value], Net Profit: [value], ROI: [value]%, Profit Margin: [value]%, Holding Period: [value] months

RISK LEVEL: [Low/Medium/High] - [Brief explanation covering renovation risk, market timing, and ARV accuracy]

MARKET ANALYSIS: [2-3 sentences on buyer demand and comparable sales in the area]

RENOVATION STRATEGY: [2-3 sentences on the recommended approach based on renovation level]

OPPORTUNITIES: [3-5 specific opportunities as complete sentences]

RISKS: [3-5 specific risks as complete sentences]

EXIT STRATEGY: [Recommended exit approach and 2-3 action items]

Write naturally in plain text. No markdown, bullets, or special formatting.`,

      rental: `You are a professional real estate investment analyst providing clear, actionable analysis.

CRITICAL REQUIREMENTS:
- Use EXACT values from "CASH FLOW ANALYSIS" section
- Write in professional, grammatically correct English
- DO NOT use any markdown formatting (no **, *, --, #, bullet points)
- Use complete, well-structured sentences
- Be concise but thorough

OUTPUT FORMAT:

SUMMARY: [2-3 sentences explaining the rental investment opportunity]

RECOMMENDATION: [BUY, HOLD, or PASS] - [One clear sentence explaining why based on cash flow and returns]

KEY METRICS: Monthly Cash Flow: [value], Cap Rate: [value]%, Cash-on-Cash Return: [value]%, Total ROI: [value]%, Annual NOI: [value]

RISK LEVEL: [Low/Medium/High] - [Brief explanation of main risk factors]

MARKET ANALYSIS: [2-3 sentences on rental market conditions and demand]

INVESTMENT STRATEGY: [2-3 sentences on recommended approach for this property]

OPPORTUNITIES: [3-5 specific opportunities as complete sentences]

RISKS: [3-5 specific risks as complete sentences]

NEXT STEPS: [2-3 specific, actionable items]

Format monetary values with commas. Write in plain text without any formatting symbols.`
    };

    const claudeRequest = {
      model: "claude-sonnet-4-5-20250929", // Using Claude Sonnet 4.5
      max_tokens: 3000, // Reduced from 4000 - analysis doesn't need that much
      temperature: 0.3,
      system: systemPrompts[request.strategy] || systemPrompts.rental,
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
  // Use centralized calculation utility for consistency
  const payment = calculateMortgagePayment(
    parsePrice(principal),
    parsePercentage(interestRate),
    parseInteger(termYears) || 30,
    loanType as 'conventional' | 'hardMoney',
    parsePrice(rehabAmount || 0)
  );

  // Log calculation for debugging
  console.log('[calculateMonthlyPayment] Calculation:', {
    principal: parsePrice(principal),
    interestRate: parsePercentage(interestRate),
    termYears: parseInteger(termYears),
    loanType,
    rehabAmount: parsePrice(rehabAmount || 0),
    payment: Math.round(payment)
  });

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

  if (request.rehabCosts && request.rehabCosts > 0) {
    context += `\n- Rehab Costs: $${request.rehabCosts.toLocaleString()}`;
  } else if (isFlipStrategy && !request.rehabCosts) {
    // Calculate rehab costs if not provided but needed for flip
    const squareFootage = (property?.squareFootage as number) || 0;
    const renovationLevel = (request as any).renovationLevel || 'moderate';
    const rehabMultipliers: Record<string, number> = {
      cosmetic: 20,
      moderate: 40,
      extensive: 80,
      gut: 125
    };
    const estimatedRehab = squareFootage * (rehabMultipliers[renovationLevel] || 40);
    context += `\n- Rehab Costs (Estimated): $${estimatedRehab.toLocaleString()}`;
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
  
  // Check if this is a BRRRR strategy
  const isBRRRRStrategy = request.strategy === 'brrrr';
  
  if (isBRRRRStrategy) {
    // BRRRR specific calculations using dedicated calculator
    console.log('[BRRRR] Starting BRRRR-specific calculations with dedicated calculator');
    
    // Prepare inputs for BRRRR calculator
    const brrrrInputs: BRRRRInputs = {
      purchasePrice: effectivePurchasePrice,
      downPaymentPercent: (downPayment / effectivePurchasePrice) * 100,
      renovationCosts: request.rehabCosts || 0,
      monthlyRent: request.monthlyRent || (rentalEstimate as any)?.rentEstimate || 0,
      arv: request.arv || (comparables as any)?.value || undefined,
      refinanceLTV: parseInt((request as any).strategyDetails?.exitStrategy || '75') / 100,
      initialLoanType: request.loanTerms?.loanType as 'hardMoney' | 'conventional' | undefined,
      initialInterestRate: request.loanTerms?.interestRate,
      refinanceInterestRate: 7, // Standard conventional rate
      renovationMonths: parseInt((request as any).strategyDetails?.timeline) || 6,
      closingCostPercent: 0.03
    };
    
    // Calculate BRRRR results
    const brrrrResults = calculateBRRRR(brrrrInputs);
    const { phase1, phase2, phase3, summary, timeline } = brrrrResults;
    
    console.log('[BRRRR] Calculation Results:', {
      phase1: {
        totalCashInvested: phase1.totalCashInvested,
        monthlyHoldingCosts: phase1.monthlyHoldingCosts
      },
      phase2: {
        arv: phase2.arv,
        cashReturned: phase2.cashReturned,
        cashLeftInDeal: phase2.cashLeftInDeal,
        capitalRecoveryPercent: phase2.capitalRecoveryPercent
      },
      phase3: {
        monthlyCashFlow: phase3.monthlyCashFlow,
        cashOnCashReturn: phase3.cashOnCashReturn,
        capRate: phase3.capRate
      },
      summary: {
        totalROI: summary.totalROI,
        isInfiniteReturn: summary.isInfiniteReturn,
        brrrrRating: summary.brrrrRating
      }
    });
    
    context += `\n\nBRRRR STRATEGY ANALYSIS:
    
PHASE 1 - ACQUISITION & RENOVATION:
- Purchase Price: $${phase1.purchasePrice.toLocaleString()}
- Down Payment: $${phase1.downPayment.toLocaleString()} (${((phase1.downPayment/phase1.purchasePrice) * 100).toFixed(1)}%)
- Initial Loan: $${phase1.initialLoanAmount.toLocaleString()}
- Renovation Budget: $${phase1.renovationCosts.toLocaleString()}
- Renovation Timeline: ${phase1.renovationMonths} months
- Monthly Holding Costs: $${phase1.monthlyHoldingCosts.toLocaleString()}
- Total Holding Costs: $${phase1.totalHoldingCosts.toLocaleString()}
- TOTAL CASH INVESTED: $${phase1.totalCashInvested.toLocaleString()}

PHASE 2 - REFINANCE:
- After Repair Value (ARV): $${phase2.arv.toLocaleString()}
- Refinance LTV: ${(phase2.refinanceLTV * 100).toFixed(0)}%
- Refinance Amount: $${phase2.refinanceAmount.toLocaleString()}
- Initial Loan Payoff: $${phase2.initialLoanPayoff.toLocaleString()}
- CASH RETURNED: $${phase2.cashReturned.toLocaleString()} ${phase2.cashReturned > phase1.totalCashInvested ? '(MORE THAN INVESTED!)' : ''}

CAPITAL ANALYSIS:
- Total Cash Invested: $${phase1.totalCashInvested.toLocaleString()}
- Cash Returned at Refinance: $${phase2.cashReturned.toLocaleString()}
- Cash Left in Deal: $${phase2.cashLeftInDeal.toLocaleString()} ${phase2.cashLeftInDeal <= 0 ? '(ALL CASH RETURNED OR MORE!)' : ''}
- Capital Recovery: ${phase2.capitalRecoveryPercent.toFixed(1)}%

PHASE 3 - RENTAL INCOME:
- Monthly Rent: $${phase3.monthlyRent.toLocaleString()}
- New Loan Payment (30yr): $${phase3.newLoanPayment.toLocaleString()}
- Operating Expenses: $${phase3.monthlyOperatingExpenses.toLocaleString()}
- Monthly Cash Flow: $${phase3.monthlyCashFlow.toLocaleString()} ${phase3.monthlyCashFlow < 0 ? '(NEGATIVE)' : '(POSITIVE)'}
- Annual Cash Flow: $${phase3.annualCashFlow.toLocaleString()}

KEY METRICS:
- Cash-on-Cash Return: ${phase3.cashOnCashReturn === Infinity ? 'INFINITE (No cash left in deal!)' : phase3.cashOnCashReturn === -Infinity ? 'N/A (Negative equity)' : phase3.cashOnCashReturn.toFixed(2) + '%'}
- Cap Rate (on ARV): ${phase3.capRate.toFixed(2)}%
- Annual NOI: $${phase3.annualNOI.toLocaleString()}
- 5-Year Total ROI: ${summary.totalROI.toFixed(2)}%

BRRRR ADVANTAGE:
${summary.recommendation}

TIMELINE:
${timeline.map(t => `Year ${t.year}: ${t.description} - Cash Flow: $${t.cashFlow.toLocaleString()}`).join('\n')}

Provide a comprehensive BRRRR analysis focusing on the three phases: acquisition/renovation, refinance cash-out, and long-term rental returns.`;

    calculatedMetrics = {
      totalInvestment: phase1.totalCashInvested,
      cashFlow: phase3.monthlyCashFlow,
      capRate: phase3.capRate,
      cocReturn: phase3.cashOnCashReturn, // Keep Infinity as is, handle in display
      roi: summary.totalROI,
      annualNOI: phase3.annualNOI,
      totalProfit: phase2.cashReturned + (phase3.annualCashFlow * 5),
      holdingCosts: phase1.totalHoldingCosts,
      monthlyRent: phase3.monthlyRent,
      // Add BRRRR-specific metrics
      cashReturned: phase2.cashReturned,
      cashLeftInDeal: phase2.cashLeftInDeal,
      capitalRecoveryPercent: phase2.capitalRecoveryPercent,
      isInfiniteReturn: summary.isInfiniteReturn
    };
    
  } else if (isFlipStrategy) {
    // Fix & Flip specific calculations using CENTRALIZED calculator
    console.log('[Fix & Flip] Using centralized calculateFlipReturns function');

    // Use provided ARV if available, otherwise use comparables or estimate
    const estimatedARV = request.arv || (comparables as any)?.value || effectivePurchasePrice * 1.3;

    // Calculate rehab costs if not provided
    let rehabCosts = request.rehabCosts || 0;
    if (rehabCosts === 0) {
      const squareFootage = (property?.squareFootage as number) || 0;
      const renovationLevel = (request as any).renovationLevel || 'moderate';
      const rehabMultipliers: Record<string, number> = {
        cosmetic: 20,
        moderate: 40,
        extensive: 80,
        gut: 125
      };
      rehabCosts = squareFootage > 0 ? squareFootage * (rehabMultipliers[renovationLevel] || 40) : effectivePurchasePrice * 0.15;
      console.log('[Context] Calculated rehab costs:', { squareFootage, renovationLevel, rehabCosts });
    }

    // Get holding period from strategy details
    let holdingTimeInMonths = 6; // Default to 6 months
    const rawTimeline = (request as any).strategyDetails?.timeline;
    if (rawTimeline) {
      const parsedTimeline = parseInt(rawTimeline);
      if (!isNaN(parsedTimeline) && parsedTimeline > 0 && parsedTimeline <= 18) {
        holdingTimeInMonths = parsedTimeline;
      }
    } else if (request.loanTerms?.loanTerm) {
      holdingTimeInMonths = Math.min(Math.round(request.loanTerms.loanTerm * 12), 12);
    }
    holdingTimeInMonths = Math.min(holdingTimeInMonths, 18);
    console.log('[Fix & Flip] Final holding time:', holdingTimeInMonths, 'months');

    // Prepare inputs for centralized calculator
    const flipInputs: FlipCalculationInputs = {
      purchasePrice: effectivePurchasePrice,
      downPaymentPercent: (downPayment / effectivePurchasePrice) * 100,
      interestRate: request.loanTerms?.interestRate || 10.45,
      loanTermYears: 1,
      renovationCosts: rehabCosts,
      arv: estimatedARV,
      holdingPeriodMonths: holdingTimeInMonths,
      loanType: request.loanTerms?.loanType as 'conventional' | 'hardMoney' || 'hardMoney',
      points: request.loanTerms?.points || 2.5,
      isHardMoney: request.loanTerms?.loanType === 'hardMoney' ||
                   (request.loanTerms?.points !== undefined && request.loanTerms.points >= 2)
    };

    console.log('[Fix & Flip] Calculator inputs:', flipInputs);

    // Use centralized calculator with full validation
    const flipResults = calculateFlipReturns(flipInputs);

    // Check for validation errors
    if (!flipResults.validation.isValid) {
      console.error('[Fix & Flip] VALIDATION ERRORS:', flipResults.validation.errors);
    }
    if (flipResults.validation.warnings.length > 0) {
      console.warn('[Fix & Flip] VALIDATION WARNINGS:', flipResults.validation.warnings);
    }

    // Build context string using validated results
    context += `\n\nFIX & FLIP ANALYSIS:

PURCHASE & FINANCING:
- Purchase Price: $${effectivePurchasePrice.toLocaleString()}
- Down Payment: $${Math.round(flipResults.downPayment).toLocaleString()} (${((flipResults.downPayment/effectivePurchasePrice) * 100).toFixed(1)}%)
- Acquisition Loan: $${Math.round(flipResults.acquisitionLoan).toLocaleString()}
- Interest Rate: ${flipInputs.interestRate}%
- Loan Term: ${holdingTimeInMonths} months
- Loan Type: ${flipResults.isHardMoney ? 'Hard Money (with rehab holdback)' : 'Conventional'}${flipInputs.points ? `
- Points/Fees: ${flipInputs.points} points ($${Math.round(flipResults.closingCostsBreakdown.lenderPoints).toLocaleString()})` : ''}

RENOVATION & COSTS:
- Rehab Budget: $${rehabCosts.toLocaleString()}${flipResults.isHardMoney ? ' (100% funded via lender holdback)' : ' (investor cash)'}
- Closing Costs (Purchase): $${Math.round(flipResults.closingCosts).toLocaleString()}

${flipResults.isHardMoney ? `FINANCING STRUCTURE:
- Down Payment (${((flipResults.downPayment/effectivePurchasePrice) * 100).toFixed(1)}%): $${Math.round(flipResults.downPayment).toLocaleString()}
- Acquisition Loan: $${Math.round(flipResults.acquisitionLoan).toLocaleString()}
- Rehab Holdback: $${Math.round(flipResults.rehabHoldback).toLocaleString()} (lender funds)
- Total Loan Amount: $${Math.round(flipResults.totalLoan).toLocaleString()}

` : ''}HOLDING COSTS:
- Total Holding Costs: $${Math.round(flipResults.holdingCosts).toLocaleString()} (${holdingTimeInMonths} months)

SELLING COSTS:
- Realtor Fees & Closing (8%): $${Math.round(flipResults.sellingCosts).toLocaleString()}

INVESTMENT SUMMARY:
- Cash Required: $${Math.round(flipResults.cashRequired).toLocaleString()} (what investor brings)
- Total Investment: $${Math.round(flipResults.totalInvestment).toLocaleString()} (all-in cost)
- Total Project Cost: $${Math.round(flipResults.totalProjectCost).toLocaleString()} (including selling)

EXIT STRATEGY:
- After Repair Value (ARV): $${Math.round(estimatedARV).toLocaleString()}
- Net Profit: $${Math.round(flipResults.netProfit).toLocaleString()} ${flipResults.netProfit < 0 ? '(LOSS)' : '(PROFIT)'}
- Return on Investment (ROI): ${flipResults.roi.toFixed(2)}% (on cash invested)
- Profit Margin: ${flipResults.profitMargin.toFixed(2)}% (of ARV)

${flipResults.validation.errors.length > 0 ? `
VALIDATION ERRORS:
${flipResults.validation.errors.map(e => `- ${e}`).join('\n')}
` : ''}${flipResults.validation.warnings.length > 0 ? `
VALIDATION WARNINGS:
${flipResults.validation.warnings.map(w => `- ${w}`).join('\n')}
` : ''}
Provide a comprehensive fix & flip analysis focusing on ARV, renovation costs, holding costs, and profit margins. Do NOT include rental income or cash flow calculations.`;

    calculatedMetrics = {
      totalInvestment: flipResults.cashRequired, // Use cash required for investment metric
      totalProfit: flipResults.netProfit,
      roi: flipResults.roi,
      holdingCosts: flipResults.holdingCosts,
      // Set rental-focused metrics to 0 or undefined for flips
      cashFlow: 0,
      capRate: 0,
      cocReturn: flipResults.roi, // Use ROI instead
      annualNOI: 0
    };

    // Log the final validated results
    console.log('[Fix & Flip] FINAL VALIDATED RESULTS:', {
      isValid: flipResults.validation.isValid,
      netProfit: flipResults.netProfit,
      roi: flipResults.roi,
      profitMargin: flipResults.profitMargin,
      cashRequired: flipResults.cashRequired,
      errors: flipResults.validation.errors,
      warnings: flipResults.validation.warnings
    });

  } else {
    // Rental property calculations - use user-specified rent if available
    // CRITICAL: Properly handle multi-family properties by multiplying rent by units

    // Get property type for multi-family detection
    const propertyType = (property?.propertyType as string) || '';

    // Get number of units (from request or property data)
    const units = parseInteger(request.units) ||
                  parseInteger((property as any)?.units) ||
                  parseInteger((property as any)?.numberOfUnits) ||
                  1;

    // Get rent per unit from various sources
    const rentPerUnitFromRequest = parsePrice(request.rentPerUnit);
    const rentFromRentCast = parsePrice((rentalEstimate as any)?.rentEstimate || (rentalEstimate as any)?.rent || 0);

    // Determine rent per unit
    const rentPerUnit = rentPerUnitFromRequest > 0 ? rentPerUnitFromRequest : rentFromRentCast;

    // Calculate total monthly rent using centralized utility
    // This ensures proper multiplication for multi-family properties
    let monthlyRent: number;

    // If request.monthlyRent is provided and matches expected total, use it
    const requestMonthlyRent = parsePrice(request.monthlyRent);
    if (requestMonthlyRent > 0) {
      // Verify it's the total (not per-unit)
      if (units > 1 && requestMonthlyRent < rentPerUnit * 2) {
        // Looks like per-unit rent was passed - multiply by units
        console.log('[prepareAnalysisContext] monthlyRent appears to be per-unit, multiplying by units');
        monthlyRent = calculateMonthlyRevenue(requestMonthlyRent, units, propertyType);
      } else {
        monthlyRent = requestMonthlyRent;
      }
    } else {
      // Calculate from rent per unit
      monthlyRent = calculateMonthlyRevenue(rentPerUnit, units, propertyType);
    }

    console.log('[prepareAnalysisContext] Rental revenue calculation:', {
      propertyType,
      units,
      rentPerUnit,
      requestMonthlyRent,
      calculatedMonthlyRent: monthlyRent,
      calculation: `$${rentPerUnit.toLocaleString()} × ${units} = $${monthlyRent.toLocaleString()}`
    });

    const monthlyPayment = effectivePurchasePrice > 0 ? calculateMonthlyPayment(loanAmount, request.loanTerms?.interestRate || 7, request.loanTerms?.loanTerm || 30, request.loanTerms?.loanType, request.rehabCosts) : 0;
    
    // Calculate additional metrics for better analysis
    // Using same rates as fix & flip for consistency
    const propertyTaxes = Math.round((effectivePurchasePrice * 0.012) / 12); // 1.2% annually
    const insurance = Math.round((effectivePurchasePrice * 0.0035) / 12); // 0.35% annually
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
${units > 1 ? `- Number of Units: ${units}
- Rent Per Unit: $${Math.round(rentPerUnit).toLocaleString()}/month
- Total Monthly Rent: $${monthlyRent.toLocaleString()}
- Annual Rental Income: $${(monthlyRent * 12).toLocaleString()}` : `- Monthly Rent: $${monthlyRent.toLocaleString()}
- Annual Rental Income: $${(monthlyRent * 12).toLocaleString()}`}

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
      totalProfit: annualCashFlow * 5, // 5-year profit projection
      monthlyRent: monthlyRent // Add monthly rent to metrics
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
    net_profit?: number; // Alias for total_profit (compatibility)
    holding_costs?: number;
    monthly_rent?: number;
    // BRRRR-specific metrics
    cash_returned?: number;
    cash_left_in_deal?: number;
    capital_recovery_percent?: number;
    is_infinite_return?: boolean;
  };
  market_analysis: string;
  investment_strategy: {
    type: string;
    details: string;
  };
  full_analysis: string;
}

function parseAnalysisResponse(analysisText: string, strategy: string, calculatedMetrics?: FinancialData): ParsedAnalysisResponse {
  // Extract financial metrics from AI response text
  const financialData = extractFinancialData(analysisText);

  // CRITICAL FIX: Helper function to get best value
  // Use extracted value only if it's a valid non-zero number
  // Otherwise use calculated metrics (which are always accurate)
  const getBestValue = (extracted: number | undefined, calculated: number | undefined): number | undefined => {
    // If extracted value is a valid positive number, use it
    if (typeof extracted === 'number' && extracted > 0 && isFinite(extracted)) {
      return extracted;
    }
    // Otherwise use calculated value (even if 0, as 0 can be valid for cash flow)
    if (typeof calculated === 'number' && isFinite(calculated)) {
      return calculated;
    }
    // For special cases like infinite return, keep the calculated value
    return calculated;
  };

  // Merge extracted and calculated metrics - prefer calculated for accuracy
  // CRITICAL: calculatedMetrics are computed server-side and always accurate
  // AI extraction can miss or misparse values, so use calculatedMetrics as primary
  const finalMetrics = {
    cashFlow: getBestValue(financialData.cashFlow, calculatedMetrics?.cashFlow),
    capRate: getBestValue(financialData.capRate, calculatedMetrics?.capRate),
    cocReturn: calculatedMetrics?.cocReturn ?? financialData.cocReturn, // Use calculated first for CoC
    roi: calculatedMetrics?.roi ?? getBestValue(financialData.roi, calculatedMetrics?.roi), // Use calculated for ROI
    totalInvestment: calculatedMetrics?.totalInvestment ?? getBestValue(financialData.totalInvestment, calculatedMetrics?.totalInvestment),
    annualNOI: getBestValue(financialData.annualNOI, calculatedMetrics?.annualNOI),
    totalProfit: calculatedMetrics?.totalProfit ?? getBestValue(financialData.totalProfit, calculatedMetrics?.totalProfit), // Use calculated for profit
    holdingCosts: calculatedMetrics?.holdingCosts ?? getBestValue(financialData.holdingCosts, calculatedMetrics?.holdingCosts),
    monthlyRent: calculatedMetrics?.monthlyRent ?? getBestValue(financialData.monthlyRent, calculatedMetrics?.monthlyRent),
    // BRRRR-specific metrics - always use calculated
    cashReturned: calculatedMetrics?.cashReturned,
    cashLeftInDeal: calculatedMetrics?.cashLeftInDeal,
    capitalRecoveryPercent: calculatedMetrics?.capitalRecoveryPercent,
    isInfiniteReturn: calculatedMetrics?.isInfiniteReturn
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
      total_profit: finalMetrics.totalProfit,
      net_profit: finalMetrics.totalProfit, // Alias for compatibility
      holding_costs: finalMetrics.holdingCosts,
      monthly_rent: finalMetrics.monthlyRent,
      // BRRRR-specific metrics
      cash_returned: finalMetrics.cashReturned,
      cash_left_in_deal: finalMetrics.cashLeftInDeal,
      capital_recovery_percent: finalMetrics.capitalRecoveryPercent,
      is_infinite_return: finalMetrics.isInfiniteReturn
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
    // Try multiple regex patterns to match various Claude output formats
    const patterns = [
      // Pattern 1: Numbered sections like "1. Executive Summary:" or "## 1. Executive Summary"
      new RegExp(`(?:^|\\n)(?:#{1,3}\\s*)?(?:\\d+\\.\\s*)?${header}[:\\s]*\\n?([\\s\\S]+?)(?=\\n(?:#{1,3}\\s*)?\\d+\\.|\\n#{1,3}\\s|\\n[A-Z][A-Z\\s]{3,}:|$)`, 'i'),
      // Pattern 2: Markdown headers like "## Executive Summary"
      new RegExp(`(?:^|\\n)#{1,3}\\s*${header}\\s*\\n([\\s\\S]+?)(?=\\n#{1,3}\\s|\\n\\d+\\.|$)`, 'i'),
      // Pattern 3: Bold headers like "**Executive Summary**" or "**Executive Summary:**"
      new RegExp(`(?:^|\\n)\\*\\*${header}\\*\\*:?\\s*\\n?([\\s\\S]+?)(?=\\n\\*\\*|\\n#{1,3}\\s|\\n\\d+\\.|$)`, 'i'),
      // Pattern 4: Simple colon-delimited headers
      new RegExp(`(?:^|\\n)${header}:\\s*\\n?([^\\n]+(?:\\n(?![A-Z][A-Z\\s]{3,}:|\\d+\\.|#{1,3}\\s|\\*\\*)[^\\n]+)*)`, 'i')
    ];

    for (const regex of patterns) {
      const match = text.match(regex);
      if (match && match[1]) {
        // Clean up the extracted text
        let result = match[1].trim();
        // Remove leading/trailing markdown formatting
        result = result.replace(/^\s*[-*]\s*/, '');
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n'); // Normalize multiple newlines
        // Limit to first meaningful paragraph for summary
        if (headers.includes('executive summary') || headers.includes('summary')) {
          const paragraphs = result.split(/\n\n+/);
          if (paragraphs[0] && paragraphs[0].length > 50) {
            return paragraphs[0].trim();
          }
        }
        return result;
      }
    }
  }
  return '';
}

function extractRecommendation(text: string): string {
  // Try multiple patterns to find the recommendation
  const patterns = [
    /(?:investment\s+)?recommendation[:\s]*\n?([^\n]+(?:\n(?!#{1,3}|\d+\.|key\s+risks?|opportunities)[^\n]+)*)/i,
    /\*\*(?:investment\s+)?recommendation\*\*[:\s]*\n?([^\n]+(?:\n(?!\*\*)[^\n]+)*)/i,
    /#{1,3}\s*(?:investment\s+)?recommendation[:\s]*\n([^\n]+(?:\n(?!#{1,3})[^\n]+)*)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let result = match[1].trim();
      // Clean up markdown formatting
      result = result.replace(/\*\*/g, '');
      result = result.replace(/^[-•*]\s*/, '');
      // Get first meaningful sentence/paragraph
      const firstParagraph = result.split(/\n\n+/)[0];
      if (firstParagraph && firstParagraph.length > 20) {
        return firstParagraph.trim();
      }
      return result;
    }
  }

  // Fallback: look for buy/hold/pass keywords
  const buyMatch = text.match(/\b(buy|proceed|invest|recommended|strong\s+buy)\b[^.]*\./i);
  const passMatch = text.match(/\b(pass|avoid|not\s+recommended|skip)\b[^.]*\./i);

  if (buyMatch) return buyMatch[0].trim();
  if (passMatch) return passMatch[0].trim();

  return '';
}

function extractRisks(text: string): string[] {
  const risks: string[] = [];

  // Try multiple patterns to find the risks section
  const patterns = [
    /(?:key\s+)?risks?(?:\s+assessment)?[:\s]*\n([\s\S]+?)(?=\n(?:#{1,3}|\\d+\.|opportunities|action|market|$))/i,
    /\*\*(?:key\s+)?risks?\*\*[:\s]*\n([\s\S]+?)(?=\n\*\*|$)/i,
    /#{1,3}\s*(?:key\s+)?risks?[:\s]*\n([\s\S]+?)(?=\n#{1,3}|$)/i
  ];

  let riskSection = null;
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      riskSection = match[1];
      break;
    }
  }

  if (riskSection) {
    const lines = riskSection.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Match bullet points, numbered items, or lines starting with dash/asterisk
      if (trimmedLine.match(/^[-•*]\s*/) || trimmedLine.match(/^\d+\.\s*/)) {
        const cleanedLine = trimmedLine
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .replace(/\*\*/g, '') // Remove bold markdown
          .trim();
        if (cleanedLine.length > 10) {
          risks.push(cleanedLine);
        }
      }
    }
  }

  return risks.slice(0, 5); // Limit to 5 risks
}

function extractOpportunities(text: string): string[] {
  const opportunities: string[] = [];

  // Try multiple patterns to find the opportunities section
  const patterns = [
    /(?:key\s+)?opportunities?[:\s]*\n([\s\S]+?)(?=\n(?:#{1,3}|\\d+\.|risks?|action|market|$))/i,
    /\*\*(?:key\s+)?opportunities?\*\*[:\s]*\n([\s\S]+?)(?=\n\*\*|$)/i,
    /#{1,3}\s*(?:key\s+)?opportunities?[:\s]*\n([\s\S]+?)(?=\n#{1,3}|$)/i
  ];

  let oppSection = null;
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      oppSection = match[1];
      break;
    }
  }

  if (oppSection) {
    const lines = oppSection.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Match bullet points, numbered items, or lines starting with dash/asterisk
      if (trimmedLine.match(/^[-•*]\s*/) || trimmedLine.match(/^\d+\.\s*/)) {
        const cleanedLine = trimmedLine
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .replace(/\*\*/g, '') // Remove bold markdown
          .trim();
        if (cleanedLine.length > 10) {
          opportunities.push(cleanedLine);
        }
      }
    }
  }

  return opportunities.slice(0, 5); // Limit to 5 opportunities
}

interface FinancialData {
  cashFlow?: number;
  capRate?: number;
  roi?: number;
  cocReturn?: number;
  totalInvestment?: number;
  annualNOI?: number;
  totalProfit?: number;
  holdingCosts?: number;
  monthlyRent?: number;
  // BRRRR-specific metrics
  cashReturned?: number;
  cashLeftInDeal?: number;
  capitalRecoveryPercent?: number;
  isInfiniteReturn?: boolean;
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
    ],
    holdingCosts: [
      /total\s+holding\s+costs?[:\s]+\$?([\d,.-]+)/i,
      /holding\s+costs?[:\s]+\$?([\d,.-]+)/i,
      /monthly\s+holding.*?\$?([\d,.-]+).*?total.*?\$?([\d,.-]+)/i
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
    
    // Extract holding costs
    const holdingMatch = flipText.match(/Total Holding Costs:\s*\$?([\d,]+)/i);
    if (holdingMatch && !data.holdingCosts) {
      data.holdingCosts = parseFloat(holdingMatch[1].replace(/,/g, ''));
      console.log('[extractFinancialData] Extracted holding costs from flip analysis:', data.holdingCosts);
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
  
  // Try to extract from BRRRR ANALYSIS section
  const brrrrSection = text.match(/(?:BRRRR|Phase\s*Analysis|BRRRR\s*STRATEGY)([\s\S]+?)(?:\n\n|Investment|$)/i);
  if (brrrrSection) {
    console.log('[extractFinancialData] Found BRRRR ANALYSIS section, extracting...');
    const brrrrText = brrrrSection[1];
    
    // Extract total cash invested
    const investedMatch = brrrrText.match(/Total Cash Invested:\s*\$?([\d,]+)/i);
    if (investedMatch && !data.totalInvestment) {
      data.totalInvestment = parseFloat(investedMatch[1].replace(/,/g, ''));
      console.log('[extractFinancialData] Extracted total cash invested from BRRRR:', data.totalInvestment);
    }
    
    // Extract cash returned at refinance
    const cashReturnedMatch = brrrrText.match(/Cash (?:Returned|Out|Back)(?:\s+at\s+Refinance)?:\s*\$?([\d,]+)/i);
    if (cashReturnedMatch) {
      const cashReturned = parseFloat(cashReturnedMatch[1].replace(/,/g, ''));
      console.log('[extractFinancialData] Extracted cash returned from BRRRR:', cashReturned);
      
      // For BRRRR, if cash returned equals or exceeds investment, it's infinite return
      if (data.totalInvestment && cashReturned >= data.totalInvestment) {
        data.cocReturn = Infinity;
        console.log('[extractFinancialData] Setting infinite return for BRRRR');
      }
    }
    
    // Extract monthly cash flow post-refinance
    const postRefinanceCashFlow = brrrrText.match(/(?:Monthly Cash Flow|Cash Flow Post.?Refinance):\s*\$?([\d,.-]+)/i);
    if (postRefinanceCashFlow && !data.cashFlow) {
      data.cashFlow = parseFloat(postRefinanceCashFlow[1].replace(/,/g, ''));
      console.log('[extractFinancialData] Extracted post-refinance cash flow:', data.cashFlow);
    }
    
    // Extract cash-on-cash return (might be INFINITE)
    const cocMatch = brrrrText.match(/Cash.?on.?Cash Return:\s*(INFINITE|[\d.]+%?)/i);
    if (cocMatch && !data.cocReturn) {
      if (cocMatch[1].toUpperCase() === 'INFINITE') {
        data.cocReturn = Infinity;
        console.log('[extractFinancialData] Extracted infinite CoC return from BRRRR');
      } else {
        data.cocReturn = parseFloat(cocMatch[1].replace('%', ''));
        console.log('[extractFinancialData] Extracted CoC return from BRRRR:', data.cocReturn);
      }
    }
    
    // Extract 5-year ROI
    const roiMatch = brrrrText.match(/(?:5.?Year\s+)?Total ROI:\s*([\d.]+)%/i);
    if (roiMatch && !data.roi) {
      data.roi = parseFloat(roiMatch[1]);
      console.log('[extractFinancialData] Extracted 5-year ROI from BRRRR:', data.roi);
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