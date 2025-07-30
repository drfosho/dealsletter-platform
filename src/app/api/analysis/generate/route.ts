import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { rentCastService } from '@/services/rentcast';
import { PropertyAnalysisRequest } from '@/types/rentcast';
// These types are imported but not used in this file
import { logError } from '@/utils/error-utils';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Validate API keys
    if (!process.env.RENTCAST_API_KEY || !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API services are not properly configured' },
        { status: 503 }
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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Parse request body
    const body: PropertyAnalysisRequest = await request.json();
    
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

    // Check property cache first
    const { data: cachedProperty } = await supabase
      .from('property_cache')
      .select('*')
      .eq('address', body.address)
      .single();

    let propertyData;
    
    if (cachedProperty && new Date(cachedProperty.expires_at) > new Date()) {
      // Use cached data
      propertyData = {
        property: cachedProperty.property_data,
        rental: cachedProperty.rental_estimate,
        market: cachedProperty.market_data,
        comparables: cachedProperty.comparables
      };
      
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
      propertyData = await rentCastService.getComprehensivePropertyData(body.address);
      
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
    }

    // Create initial analysis record
    const { data: analysisRecord, error: createError } = await supabase
      .from('user_analyses')
      .insert({
        user_id: user.id,
        address: body.address,
        strategy: body.strategy,
        purchase_price: body.purchasePrice,
        down_payment_percent: body.downPayment && body.purchasePrice ? (body.downPayment / body.purchasePrice) * 100 : 20,
        loan_term: body.loanTerms?.loanTerm || 30,
        interest_rate: body.loanTerms?.interestRate || 7,
        rehab_costs: body.rehabCosts,
        property_data: propertyData.property,
        market_data: propertyData.market,
        rental_estimate: propertyData.rental,
        comparables: propertyData.comparables,
        status: 'generating',
        ai_analysis: {} // Will be updated after generation
      })
      .select()
      .single();

    if (createError || !analysisRecord) {
      console.error('Failed to create analysis record:', createError);
      return NextResponse.json(
        { error: 'Failed to create analysis' },
        { status: 500 }
      );
    }

    try {
      // Generate analysis using AI
      const aiAnalysis = await generatePropertyAnalysis(propertyData, body);
      
      // Update analysis with AI results
      const { error: updateError } = await supabase
        .from('user_analyses')
        .update({
          ai_analysis: aiAnalysis,
          status: 'completed'
        })
        .eq('id', analysisRecord.id);

      if (updateError) {
        console.error('Failed to update analysis:', updateError);
      }

      // Update user's usage count
      const { error: usageUpdateError } = await supabase
        .rpc('increment_usage', { p_user_id: user.id });
      
      if (usageUpdateError) {
        console.error('Failed to update usage count:', usageUpdateError);
        // Don't fail the request, just log the error
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
        .from('user_analyses')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', analysisRecord.id);

      throw error;
    }

  } catch (error) {
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
  try {
    // Prepare context for AI
    const context = prepareAnalysisContext(propertyData, request);
    
    // Generate analysis using Claude
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.3,
      system: `You are a professional real estate investment analyst. Provide detailed, data-driven analysis for real estate investments. Focus on financial metrics, risks, and opportunities. Be specific with numbers and calculations.`,
      messages: [
        {
          role: "user",
          content: context
        }
      ]
    });

    const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Parse the analysis into structured format
    return parseAnalysisResponse(analysisText, request.strategy);
    
  } catch (error) {
    logError('AI Analysis Generation', error);
    throw new Error('Failed to generate AI analysis');
  }
}

function prepareAnalysisContext(propertyData: PropertyData, request: PropertyAnalysisRequest): string {
  const { property: propertyDetails, rental: rentalEstimate, comparables, market: marketData } = propertyData;
  const property = (Array.isArray(propertyDetails) ? propertyDetails[0] : propertyDetails) as Record<string, unknown>;
  
  let context = `Analyze this property for a ${request.strategy} investment strategy:

PROPERTY DETAILS:
- Address: ${property?.addressLine1}, ${property?.city}, ${property?.state} ${property?.zipCode}
- Type: ${property?.propertyType}
- Size: ${property?.squareFootage} sq ft
- Bedrooms: ${property?.bedrooms}, Bathrooms: ${property?.bathrooms}
- Year Built: ${property?.yearBuilt}
- Last Sale: $${property?.lastSalePrice?.toLocaleString() || 'Unknown'} on ${property?.lastSaleDate || 'Unknown'}

RENTAL ANALYSIS:
- Estimated Rent: $${(rentalEstimate as any)?.rent || (rentalEstimate as any)?.rentEstimate}/month
- Rent Range: $${(rentalEstimate as any)?.rentRangeLow} - $${(rentalEstimate as any)?.rentRangeHigh}

MARKET DATA:
- Median Rent: $${(marketData as any)?.medianRent}
- Median Price: $${(marketData as any)?.medianSalePrice}
- Average Days on Market: ${(marketData as any)?.averageDaysOnMarket}

COMPARABLES:
${comparables && comparables.length > 0 ? comparables.slice(0, 3).map((comp) => 
  `- ${(comp as any).address}: $${(comp as any).price?.toLocaleString()} (${(comp as any).squareFootage} sq ft)`
).join('\n') : 'No comparable data available'}
`;

  // Add investment parameters
  if (request.purchasePrice) {
    context += `\nINVESTMENT PARAMETERS:
- Purchase Price: $${request.purchasePrice.toLocaleString()}
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

  context += `\n\nProvide a comprehensive analysis including:
1. Investment Overview and Market Position
2. Financial Projections (cash flow, ROI, cap rate)
3. ${request.strategy === 'rental' ? 'Rental Income Analysis' : request.strategy === 'flip' ? 'Flip Profit Analysis' : request.strategy === 'brrrr' ? 'BRRRR Strategy Analysis' : 'Commercial Investment Analysis'}
4. Risk Assessment
5. Investment Recommendation with specific action items

Include specific calculations for all financial metrics.`;

  return context;
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

function parseAnalysisResponse(analysisText: string, strategy: string): ParsedAnalysisResponse {
  // Structure the AI response into sections
  const sections = analysisText.split(/\n(?=\d\.)/);
  
  // Extract financial metrics
  const financialData = extractFinancialData(analysisText);
  
  return {
    summary: extractSection(sections[0]),
    recommendation: extractRecommendation(analysisText),
    risks: extractRisks(analysisText),
    opportunities: extractOpportunities(analysisText),
    financial_metrics: {
      monthly_cash_flow: financialData.cashFlow,
      cap_rate: financialData.capRate,
      cash_on_cash_return: financialData.cocReturn,
      roi: financialData.roi,
      total_investment: financialData.totalInvestment,
      annual_noi: financialData.annualNOI,
      total_profit: financialData.totalProfit
    },
    market_analysis: extractSection(sections[1]),
    investment_strategy: {
      type: strategy,
      details: extractSection(sections[3])
    },
    full_analysis: analysisText
  };
}

function extractSection(text: string): string {
  return text?.replace(/^\d+\.\s*/, '').trim() || '';
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
  const data: FinancialData = {};
  
  // Extract common financial metrics using regex
  const patterns = {
    cashFlow: /(?:monthly\s+)?cash\s*flow[:\s]+\$?([\d,]+)/i,
    capRate: /cap\s*rate[:\s]+([\d.]+)%/i,
    roi: /roi[:\s]+([\d.]+)%/i,
    cocReturn: /cash[- ]on[- ]cash[:\s]+([\d.]+)%/i,
    totalInvestment: /total\s*investment[:\s]+\$?([\d,]+)/i,
    annualNOI: /(?:annual\s+)?noi[:\s]+\$?([\d,]+)/i,
    totalProfit: /total\s*profit[:\s]+\$?([\d,]+)/i
  };
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) {
      (data as any)[key] = parseFloat(match[1].replace(/,/g, ''));
    }
  }
  
  return data;
}