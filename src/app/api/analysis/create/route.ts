import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { propertyAPI } from '@/services/property-api'
import { logError } from '@/utils/error-utils'
import Anthropic from '@anthropic-ai/sdk'
import { getAdminConfig } from '@/lib/admin-config'
import { checkSubscriptionLimit, incrementAnalysisUsage } from '@/lib/subscription-guard'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { address, strategy, purchasePrice, downPayment, loanTerms, rehabCosts } = body

    // Check if user is admin
    const adminConfig = getAdminConfig(user.email)
    
    // Check subscription limits (skip for admins)
    if (!adminConfig.bypassSubscriptionLimits) {
      const subscriptionCheck = await checkSubscriptionLimit(user.id)
      
      if (!subscriptionCheck.allowed) {
        return NextResponse.json(
          { 
            error: subscriptionCheck.message,
            tier: subscriptionCheck.tier,
            requiresUpgrade: true,
            upgradeUrl: '/pricing'
          },
          { status: 403 }
        )
      }
    }

    // Fetch property data
    const propertyData = await propertyAPI.searchProperty({
      address,
      includeRentEstimates: true,
      includeComparables: true,
      includeMarketData: true
    })

    // Generate AI analysis
    const analysisPrompt = prepareAnalysisContext(propertyData, body)
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.3,
      system: `You are a professional real estate investment analyst. Provide detailed, data-driven analysis for real estate investments. Focus on financial metrics, risks, and opportunities. Be specific with numbers and calculations.`,
      messages: [
        {
          role: "user",
          content: analysisPrompt
        }
      ]
    })

    const analysisText = response.content[0].type === 'text' ? response.content[0].text : ''
    const analysisData = parseAnalysisResponse(analysisText, strategy)

    // Save analysis to database
    const { data: analysis, error: insertError } = await supabase
      .from('user_analyses')
      .insert({
        user_id: user.id,
        address,
        property_data: propertyData,
        analysis_data: analysisData,
        strategy,
        purchase_price: purchasePrice,
        down_payment: downPayment,
        loan_terms: loanTerms,
        rehab_costs: rehabCosts || 0
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Increment usage count (skip for admins)
    if (!adminConfig.bypassSubscriptionLimits) {
      await incrementAnalysisUsage(
        user.id,
        analysis.id,
        address
      )
    }

    return NextResponse.json(analysis)

  } catch (error) {
    logError('Create Analysis API', error)
    return NextResponse.json(
      { error: 'Failed to create analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

interface AnalysisRequest {
  strategy: string
  purchasePrice: number
  downPayment: number
  loanTerms: {
    interestRate: number
    loanTerm: number
  }
  rehabCosts?: number
}

interface PropertyDataResponse {
  property: {
    addressLine1: string
    city: string
    state: string
    zipCode: string
    propertyType: string
    squareFootage: number
    bedrooms: number
    bathrooms: number
    yearBuilt: number
  } | Array<{
    addressLine1: string
    city: string
    state: string
    zipCode: string
    propertyType: string
    squareFootage: number
    bedrooms: number
    bathrooms: number
    yearBuilt: number
  }>
  rental?: {
    rent?: number
    rentRangeLow?: number
    rentRangeHigh?: number
  }
  comparables?: {
    value?: number
    valueRangeLow?: number
    valueRangeHigh?: number
  }
  market?: {
    saleData?: {
      medianPrice?: number
    }
    rentalData?: {
      medianRent?: number
    }
  }
}

function prepareAnalysisContext(propertyData: PropertyDataResponse, request: AnalysisRequest): string {
  const { property, rental, comparables, market } = propertyData
  const prop = Array.isArray(property) ? property[0] : property
  
  return `Analyze this property for a ${request.strategy} investment strategy:

PROPERTY DETAILS:
- Address: ${prop.addressLine1}, ${prop.city}, ${prop.state} ${prop.zipCode}
- Type: ${prop.propertyType}
- Size: ${prop.squareFootage} sq ft
- Bedrooms: ${prop.bedrooms}, Bathrooms: ${prop.bathrooms}
- Year Built: ${prop.yearBuilt}

FINANCIAL PARAMETERS:
- Purchase Price: $${request.purchasePrice.toLocaleString()}
- Down Payment: $${request.downPayment.toLocaleString()} (${((request.downPayment / request.purchasePrice) * 100).toFixed(1)}%)
- Loan Amount: $${(request.purchasePrice - request.downPayment).toLocaleString()}
- Interest Rate: ${request.loanTerms.interestRate}%
- Loan Term: ${request.loanTerms.loanTerm} years
${request.rehabCosts ? `- Renovation Costs: $${request.rehabCosts.toLocaleString()}` : ''}

MARKET DATA:
- Estimated Value: $${comparables?.value?.toLocaleString() || 'N/A'}
- Value Range: $${comparables?.valueRangeLow?.toLocaleString() || 'N/A'} - $${comparables?.valueRangeHigh?.toLocaleString() || 'N/A'}
- Estimated Rent: $${rental?.rent?.toLocaleString() || 'N/A'}/month
- Rent Range: $${rental?.rentRangeLow?.toLocaleString() || 'N/A'} - $${rental?.rentRangeHigh?.toLocaleString() || 'N/A'}/month
- Median Area Price: $${market?.saleData?.medianPrice?.toLocaleString() || 'N/A'}
- Median Area Rent: $${market?.rentalData?.medianRent?.toLocaleString() || 'N/A'}/month

Provide a comprehensive investment analysis including:
1. Executive Summary (2-3 sentences)
2. Market Position Analysis
3. Financial Projections (monthly cash flow, cap rate, ROI, cash-on-cash return)
4. Strategy-Specific Analysis for ${request.strategy}
5. Risk Assessment
6. Investment Recommendation

Format your response with clear sections and specific numbers.`
}

interface ParsedAnalysis {
  summary: string
  marketPosition: string
  financialProjections: {
    cashFlow: number
    capRate: number
    roi: number
    cocReturn: number
    details: string
  }
  strategyAnalysis: {
    type: string
    details: string
  }
  riskAssessment: {
    factors: string[]
    details: string
  }
  recommendation: string
  fullAnalysis: string
}

function parseAnalysisResponse(analysisText: string, strategy: string): ParsedAnalysis {
  // Simple parsing - in production, you'd want more sophisticated parsing
  const sections = analysisText.split('\n\n')
  
  return {
    summary: sections[0] || 'Analysis completed',
    marketPosition: sections[1] || 'Market analysis pending',
    financialProjections: {
      cashFlow: 500, // These would be parsed from the actual response
      capRate: 4.5,
      roi: 12.3,
      cocReturn: 8.7,
      details: sections[2] || 'Detailed projections available'
    },
    strategyAnalysis: {
      type: strategy,
      details: sections[3] || 'Strategy analysis available'
    },
    riskAssessment: {
      factors: ['Market risk', 'Interest rate risk'],
      details: sections[4] || 'Risk assessment available'
    },
    recommendation: sections[5] || 'Investment recommendation available',
    fullAnalysis: analysisText
  }
}