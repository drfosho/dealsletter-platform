import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { trackUsage } from '@/lib/analytics';
import { getStrategyInterestRate } from '@/utils/interest-rates';

// Initialize Anthropic client with timeout
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  timeout: 60000, // 60 second timeout - reduced for faster failure detection
});

// Simple in-memory cache (replace with Redis in production)
interface CachedAnalysis {
  data: PropertyData;
  timestamp: number;
}
const analysisCache = new Map<string, CachedAnalysis>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Track model failures to skip problematic models temporarily
let opusFailureCount = 0;
let opusLastFailure = 0;

// Helper to create cache key from text
function getCacheKey(text: string): string {
  // Simple hash function for cache key
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `prop_${hash}_${text.length}`;
}

// Retry configuration
const MAX_RETRIES = 2; // Reduced from 3 to fail faster
const RETRY_DELAY = 500; // 500ms base delay
const MAX_TOTAL_TIME = 180000; // 3 minutes max total time

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Comprehensive investment analysis prompt with examples
const PROPERTY_ANALYSIS_PROMPT = `You are an expert real estate investment analyst creating premium newsletter-quality content. Extract comprehensive property data and create a professional investment analysis.

CRITICAL REQUIREMENTS:
1. Create ORIGINAL investment analysis - do not copy seller's description
2. Generate comprehensive 30-year financial projections
3. Include ALL 8 required sections with rich, detailed content
4. For properties with vacant units, account for stabilization timeline
5. Use professional investment terminology and analysis

EXACT STRUCTURE TO FOLLOW (from existing properties):
{
  "id": num (use Date.now() if not provided),
  "title": str (address),
  "address": str,
  "city": str,
  "state": str (2-letter),
  "zipCode": str,
  "location": str (format: "City, State ZIP"),
  
  "type": str (e.g., "Nob Hill Value-Add", "Premium Flip", "BRRRR Special"),
  "propertyType": "Single Family|Duplex|Triplex|Fourplex|Multifamily|Condo|Mobile Home Park",
  "strategy": "Buy & Hold|Fix & Flip|BRRRR|House Hack|Short-Term Rental",
  "investmentStrategy": str (same as strategy),
  
  "price": num,
  "downPayment": num,
  "downPaymentPercent": num,
  
  "units": num (if multifamily),
  "bedrooms": num,
  "bathrooms": num,
  "sqft": num,
  "lotSize": str (e.g., "7,325 sq ft"),
  "yearBuilt": num,
  
  "monthlyRent": num (current),
  "currentRent": num (same as monthlyRent),
  "projectedRent": num (after improvements),
  "monthlyIncome": num (current gross),
  "rentUpside": num (monthly dollar increase),
  
  "capRate": num (current),
  "currentCapRate": num,
  "proFormaCapRate": num (after improvements),
  "monthlyCashFlow": num (current),
  "proFormaCashFlow": num (stabilized),
  
  "totalROI": num (5-year),
  "cashOnCashReturn": num,
  "cashRequired": num (total cash needed),
  
  "confidence": "low|medium|high|very high",
  "riskLevel": "low|medium|high",
  "daysOnMarket": num,
  "timeframe": str (e.g., "6-12 months"),
  "neighborhood": str,
  
  "features": [str] (7-10 key selling points),
  "description": str (professional 2-3 sentence summary),
  
  "status": "active",
  "isDraft": false
}

ANOTHER EXCELLENT EXAMPLE (Mobile Home Park):
{
  "title": "10116 Lake Ave",
  "type": "Mobile Home Park",
  "propertyType": "Mobile Home Park",
  "units": 30,
  "pricePerUnit": 106667,
  "currentCapRate": 11,
  "monthlyIncome": 36442,
  "monthlyNOI": 26211,
  "monthlyCashFlow": 22045,
  "cashOnCashReturn": 11.5,
  "sellerFinancing": "5% Years 1-2",
  "currentAvgRent": 1215,
  "marketAvgRent": 1465,
  "immediateUpside": 250,
  "features": ["Seller Financing 5%", "100% Occupied", "$250/unit Below Market", "75% Month-to-Month"],
  "description": "30 INDIVIDUAL mobile homes on single-family lots with SELLER FINANCING! All units renovated 2020-2025. Current 14% cash-on-cash grows to 17.6% by year 3. Own the homes AND land - no pad rent issues!"
}

Create comprehensive analysis matching our premium newsletter standard:

CORE FIELDS (Required for dashboard display):
- Use exact field names from structure above
- Calculate all financial metrics accurately
- Include both current and pro forma numbers
- Generate location field as "City, State ZIP"

PREMIUM CONTENT SECTIONS (All required):
1. strategicOverview: 200+ word analysis of why this property is exceptional
2. valueAddDescription: 150+ words on specific improvement opportunities
3. locationAnalysis: Include walkScore, transitScore, nearbyEmployers, schoolRatings
4. rentAnalysis: Current vs market rents with stabilization timeline
5. propertyMetrics: GRM, DSCR, IRR, equity multiple, payback period
6. financingScenarios: Minimum 3 detailed options with pros/cons
7. thirtyYearProjections: Years 1,2,3,5,10,20,30 with all metrics
8. marketAnalysis: Comparables, rent comps, strengths, risks

WRITING STYLE:
- Professional investment newsletter quality
- Specific numbers and calculations
- Local market knowledge and comparables
- Focus on returns and value creation
- No generic filler content

CRITICAL FOR VACANT UNITS:
- Calculate renovation costs per unit
- Show month-by-month stabilization schedule
- Adjust year 1 cash flow for vacancy period
- Project stabilized returns separately

REQUIRED OUTPUT FORMAT - ALL SECTIONS MUST BE POPULATED:

{
  "title": str,
  "address": str,
  "city": str,
  "state": str (2-letter),
  "zipCode": str,
  "propertyType": "Single Family|Duplex|Triplex|Fourplex|Multifamily|Condo|Townhouse|Mobile Home Park",
  "type": str (specific investment type label like "Premium Flip", "Value-Add Multifamily"),
  "price": num,
  "downPayment": num,
  "downPaymentPercent": num,
  "monthlyRent": num,
  "currentRent": num|null,
  "projectedRent": num|null,
  "rentUpside": num|null,
  "capRate": num,
  "currentCapRate": num|null,
  "proFormaCapRate": num|null,
  "monthlyCashFlow": num,
  "proFormaCashFlow": num|null,
  "totalROI": num,
  "cashOnCashReturn": num|null,
  "investmentStrategy": str,
  "confidence": "low|medium|high|very high",
  "riskLevel": "low|medium|high",
  "daysOnMarket": num,
  "bedrooms": num,
  "bathrooms": num,
  "sqft": num,
  "yearBuilt": num|null,
  "lotSize": str|null,
  "features": [str] (minimum 5 investment-focused features),
  "neighborhood": str|null,
  "timeframe": str,
  "cashRequired": num,
  
  "strategicOverview": str (200+ words on why this property is exceptional),
  
  "valueAddDescription": str (150+ words on specific improvement opportunities),
  
  "locationAnalysis": {
    "overview": str (150+ words),
    "walkScore": num,
    "transitScore": num,
    "bikeScore": num,
    "nearbyEmployers": [str],
    "schoolRatings": {
      "elementary": str,
      "middle": str,
      "high": str
    },
    "marketTrends": str,
    "neighborhoodClass": "A|B|C|D"
  },
  
  "rentAnalysis": {
    "currentRentPerUnit": num|null,
    "marketRentPerUnit": num,
    "rentGrowthRate": num (annual %),
    "stabilizationTimeline": str (e.g., "6-12 months"),
    "vacantUnits": num|null,
    "totalUnits": num|null,
    "projectedStabilizedRent": num,
    "monthlyRentUpside": num,
    "annualRentUpside": num
  },
  
  "marketAnalysis": {
    "overview": str (200+ words),
    "comparables": [{
      "address": str,
      "price": num,
      "sqft": num,
      "pricePerSqft": num,
      "soldDate": str,
      "daysOnMarket": num
    }] (minimum 3),
    "rentComps": [{
      "address": str,
      "rent": num,
      "bedrooms": num,
      "sqft": num,
      "rentPerSqft": num
    }] (minimum 3),
    "marketStrengths": [str] (minimum 5),
    "marketRisks": [str] (minimum 3)
  },
  
  "financingScenarios": [{
    "name": str (e.g., "Conventional 25% Down", "FHA 3.5% Down", "Hard Money + Refinance"),
    "description": str (100+ words),
    "loanType": str,
    "downPayment": num,
    "downPaymentPercent": num,
    "loanAmount": num,
    "interestRate": num,
    "loanTerm": num,
    "monthlyPI": num,
    "closingCosts": num,
    "totalCashRequired": num,
    "monthlyExpenses": num,
    "monthlyRent": num,
    "monthlyCashFlow": num,
    "cashOnCashReturn": num,
    "capRate": num,
    "totalROI": num,
    "pros": [str] (minimum 3),
    "cons": [str] (minimum 2)
  }] (minimum 3 scenarios),
  
  "propertyMetrics": {
    "pricePerSqft": num,
    "pricePerUnit": num|null,
    "grossRentMultiplier": num,
    "debtServiceCoverageRatio": num,
    "breakEvenOccupancy": num,
    "internalRateOfReturn": num,
    "equityMultiple": num,
    "paybackPeriod": num
  },
  
  "thirtyYearProjections": {
    "assumptions": {
      "rentGrowthRate": num,
      "expenseGrowthRate": num,
      "appreciationRate": num,
      "vacancyRate": num,
      "managementFee": num
    },
    "projections": [
      {
        "year": 1,
        "grossRent": num,
        "vacancy": num,
        "effectiveRent": num,
        "operatingExpenses": num,
        "netOperatingIncome": num,
        "debtService": num,
        "cashFlow": num,
        "cashOnCashReturn": num,
        "capRate": num,
        "propertyValue": num,
        "loanBalance": num,
        "equity": num,
        "totalROI": num,
        "cumulativeCashFlow": num
      },
      // Include years: 1, 2, 3, 5, 10, 20, 30
    ]
  },
  
  "exitStrategies": [{
    "strategy": str,
    "timeline": str,
    "estimatedProfit": num,
    "description": str
  }],
  
  "valueAddOpportunities": [str],
  "competitiveOfferStrategy": str,
  "whyThisDeal": str,
  
  "financing": {
    "interestRate": num,
    "loanTerm": num,
    "loanType": str,
    "monthlyPI": num,
    "closingCosts": num,
    "points": num|null
  },
  
  "expenses": {
    "propertyTax": num,
    "insurance": num,
    "hoa": num|null,
    "utilities": num|null,
    "maintenance": num,
    "propertyManagement": num|null,
    "totalMonthly": num
  },
  
  "pros": [str (investment advantages)],
  "cons": [str (risks and challenges)]
}

For Fix & Flip also add:
{
  "arv": num,
  "rehabCosts": num,
  "rehabDetails": {"item": cost},
  "rehabTimeline": str,
  "holdingCosts": num,
  "netProfit": num,
  "roi": num
}

For Fix & Flip properties, also include:
{
  "rehabAnalysis": {
    "totalBudget": num,
    "contingency": num,
    "timeline": str,
    "sections": {
      "exterior": {
        "description": str,
        "items": [{"item": str, "cost": num}],
        "total": num
      },
      "interior": {
        "description": str,
        "items": [{"item": str, "cost": num}],
        "total": num
      },
      "kitchen": {
        "description": str,
        "items": [{"item": str, "cost": num}],
        "total": num
      },
      "bathrooms": {
        "description": str,
        "items": [{"item": str, "cost": num}],
        "total": num
      },
      "systems": {
        "description": str,
        "items": [{"item": str, "cost": num}],
        "total": num
      }
    }
  },
  "arv": num,
  "profitAnalysis": {
    "purchasePrice": num,
    "rehabCosts": num,
    "holdingCosts": num,
    "sellingCosts": num,
    "totalInvestment": num,
    "afterRepairValue": num,
    "grossProfit": num,
    "netProfit": num,
    "returnOnInvestment": num,
    "annualizedReturn": num
  }
}

SPECIAL INSTRUCTIONS FOR VACANT UNITS:
- If property has vacant units, calculate stabilization timeline
- Show month-by-month rent-up schedule
- Account for renovation costs per unit
- Project cash flow during stabilization period
- Calculate returns based on stabilized operations

Create comprehensive, newsletter-quality analysis. Be specific, detailed, and professional.

Property text:`;

// Property data validation schema
interface PropertyData {
  // Basic Info
  title?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: string;
  type?: string;
  price?: number;
  downPayment?: number;
  downPaymentPercent?: number;
  monthlyRent?: number;
  currentRent?: number;
  projectedRent?: number;
  rentUpside?: number;
  capRate?: number;
  currentCapRate?: number;
  proFormaCapRate?: number;
  monthlyCashFlow?: number;
  proFormaCashFlow?: number;
  totalROI?: number;
  cashOnCashReturn?: number;
  investmentStrategy?: string;
  confidence?: string;
  riskLevel?: string;
  daysOnMarket?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  yearBuilt?: number | null;
  lotSize?: string;
  features?: string[];
  description?: string;
  neighborhood?: string;
  timeframe?: string;
  cashRequired?: number;
  
  // Premium Newsletter Sections
  strategicOverview?: string;
  valueAddDescription?: string;
  locationAnalysis?: {
    overview: string;
    walkScore?: number;
    transitScore?: number;
    bikeScore?: number;
    nearbyEmployers?: string[];
    schoolRatings?: {
      elementary?: string;
      middle?: string;
      high?: string;
    };
    marketTrends?: string;
    neighborhoodClass?: string;
  };
  rentAnalysis?: {
    currentRentPerUnit?: number;
    marketRentPerUnit?: number;
    rentGrowthRate?: number;
    stabilizationTimeline?: string;
    vacantUnits?: number;
    totalUnits?: number;
    projectedStabilizedRent?: number;
    monthlyRentUpside?: number;
    annualRentUpside?: number;
  };
  propertyMetrics?: {
    pricePerSqft?: number;
    pricePerUnit?: number;
    grossRentMultiplier?: number;
    debtServiceCoverageRatio?: number;
    breakEvenOccupancy?: number;
    internalRateOfReturn?: number;
    equityMultiple?: number;
    paybackPeriod?: number;
  };
  financingScenarios?: Array<{
    name: string;
    description: string;
    loanType?: string;
    downPayment: number;
    downPaymentPercent: number;
    loanAmount?: number;
    interestRate?: number;
    loanTerm?: number;
    monthlyPI?: number;
    closingCosts?: number;
    totalCashRequired?: number;
    monthlyExpenses?: number;
    monthlyRent: number;
    monthlyCashFlow: number;
    cashOnCashReturn?: number;
    capRate: number;
    totalROI: number;
    pros: string[];
    cons: string[];
  }>;
  thirtyYearProjections?: {
    assumptions?: {
      rentGrowthRate?: number;
      expenseGrowthRate?: number;
      appreciationRate?: number;
      vacancyRate?: number;
      managementFee?: number;
    };
    projections?: Array<{
      year: number;
      grossRent: number;
      vacancy?: number;
      effectiveRent?: number;
      operatingExpenses?: number;
      netOperatingIncome?: number;
      debtService?: number;
      cashFlow: number;
      cashOnCashReturn?: number;
      capRate: number;
      propertyValue?: number;
      loanBalance?: number;
      equity: number;
      totalROI?: number;
      cumulativeCashFlow?: number;
    }>;
  };
  marketAnalysis?: {
    overview?: string;
    comparables?: Array<{
      address: string;
      price: number;
      sqft: number;
      pricePerSqft: number;
      soldDate: string;
    }>;
    rentComps?: Array<{
      address: string;
      rent: number;
      bedrooms: number;
      sqft: number;
    }>;
    marketStrengths?: string[];
    marketRisks?: string[];
  };
  investmentScenarios?: Array<{
    name: string;
    description: string;
    downPayment: number;
    downPaymentPercent: number;
    cashRequired: number;
    monthlyRent: number;
    monthlyCashFlow: number;
    capRate: number;
    totalROI: number;
    pros: string[];
    cons: string[];
  }>;
  longTermProjections?: Array<{
    year: number;
    rent: number;
    cashFlow: number;
    capRate: number;
    equity: number;
    totalReturn: number;
  }>;
  exitStrategies?: Array<{
    strategy: string;
    timeline: string;
    estimatedProfit: number;
    description: string;
  }>;
  valueAddOpportunities?: string[];
  competitiveOfferStrategy?: string;
  whyThisDeal?: string;
  financing?: {
    interestRate: number;
    loanTerm: number;
    loanType: string;
    monthlyPI: number;
    closingCosts: number;
    points?: number;
  };
  expenses?: {
    propertyTax: number;
    insurance: number;
    hoa?: number;
    utilities?: number;
    maintenance: number;
    propertyManagement?: number;
    totalMonthly: number;
  };
  pros?: string[];
  cons?: string[];
  // Fix & Flip specific
  arv?: number;
  rehabCosts?: number;
  rehabDetails?: Record<string, number>;
  rehabTimeline?: string;
  holdingCosts?: number;
  netProfit?: number;
  roi?: number;
  // Listing URL fields
  listingUrl?: string;
  listingSource?: string;
  [key: string]: unknown;
}

// Validate property data meets minimum requirements
function validatePropertyData(data: PropertyData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!data.address && !data.title) errors.push('Missing address or title');
  if (!data.city) errors.push('Missing city');
  if (!data.state) errors.push('Missing state');
  if (!data.price || data.price <= 0) errors.push('Missing or invalid price');
  
  // Type validations
  if (data.price && typeof data.price !== 'number') errors.push('Price must be a number');
  if (data.bedrooms && typeof data.bedrooms !== 'number') errors.push('Bedrooms must be a number');
  if (data.bathrooms && typeof data.bathrooms !== 'number') errors.push('Bathrooms must be a number');
  if (data.sqft && typeof data.sqft !== 'number') errors.push('Square footage must be a number');
  
  // Array validations
  if (data.features && !Array.isArray(data.features)) errors.push('Features must be an array');
  if (data.pros && !Array.isArray(data.pros)) errors.push('Pros must be an array');
  if (data.cons && !Array.isArray(data.cons)) errors.push('Cons must be an array');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// API metrics tracking
interface APIMetrics {
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  processingTime: number;
  cached: boolean;
  success: boolean;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const metrics: APIMetrics = {
    model: 'claude-opus-4-20250514',
    processingTime: 0,
    cached: false,
    success: false
  };
  
  try {
    const { text, skipCache = false } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Property text is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(text);
    if (!skipCache) {
      const cached = analysisCache.get(cacheKey);
      if (cached && cached.timestamp > Date.now() - CACHE_TTL) {
        console.log('Returning cached analysis for:', cacheKey);
        const processingTime = Date.now() - startTime;
        metrics.processingTime = processingTime;
        metrics.cached = true;
        metrics.success = true;
        trackUsage(true, true, processingTime);
        return NextResponse.json({
          success: true,
          data: cached.data,
          cached: true,
          processingTime,
          metrics: {
            model: metrics.model,
            processingTime: metrics.processingTime,
            cached: true
          }
        });
      }
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        { 
          error: 'AI service not configured. Please add ANTHROPIC_API_KEY to environment variables.',
          fallbackToManual: true 
        },
        { status: 500 }
      );
    }

    // Call Claude API with retry logic and model fallback
    let lastError: Error | null = null;
    let propertyData: PropertyData | null = null;
    let totalAttempts = 0;
    const models = [
      'claude-opus-4-20250514',  // Primary model for best quality
      'claude-3-5-sonnet-20241022'  // Fallback model if Opus is overloaded
    ];
    
    // Try each model with retries
    modelLoop: for (let modelIndex = 0; modelIndex < models.length && !propertyData; modelIndex++) {
      const currentModel = models[modelIndex];
      metrics.model = currentModel;
      
      // Skip Opus if it's been failing consistently
      if (currentModel.includes('opus') && opusFailureCount > 2) {
        const timeSinceLastFailure = Date.now() - opusLastFailure;
        if (timeSinceLastFailure < 300000) { // 5 minutes
          console.log('Skipping Opus model due to recent failures, using fallback directly');
          continue;
        } else {
          // Reset failure count after 5 minutes
          console.log('Resetting Opus failure count after cooldown period');
          opusFailureCount = 0;
        }
      }
      
      for (let attempt = 1; attempt <= MAX_RETRIES && !propertyData; attempt++) {
        totalAttempts++;
        try {
          console.log(`Attempting Claude API call (attempt ${attempt}/${MAX_RETRIES}, model: ${currentModel})`);
          
          const apiStartTime = Date.now();
          
          const message = await anthropic.messages.create({
            model: currentModel,
            max_tokens: currentModel.includes('opus') ? 8000 : 6000, // Adjust based on model
            temperature: 0.1, // Lower for more consistent parsing
          system: `You are an expert real estate investment analyst with 20+ years of experience creating premium newsletter content for sophisticated investors. 

CRITICAL: Create ORIGINAL investment analysis - do NOT copy seller descriptions. Write as if you are presenting this opportunity to your high-net-worth clients.

When information is not explicitly provided, use your expertise to calculate reasonable estimates based on:
- Property location and local market conditions (research actual market data)
- Property type and typical metrics for that asset class  
- Price point and typical returns for that investment level
- Current interest rates (use strategy-specific rates: House Hack 6.5-7.5%, Buy & Hold 7-8%, BRRRR/Flip 10-12%, Commercial 7.5-8.5%)
- Market rent comparables for the area
- Typical expense ratios (25-35% for multifamily, 30-40% for single family)

For 30-year projections use:
- Rent growth: 3-4% annually
- Expense growth: 2-3% annually  
- Property appreciation: 3-5% annually
- Include principal paydown in equity calculations

REQUIREMENTS:
1. ALL financial projections must be mathematically accurate
2. Create detailed narratives for each section (not bullet points)
3. Include specific neighborhood amenities and employers
4. Generate realistic comparable sales and rentals
5. Account for ALL costs: taxes, insurance, maintenance, management, reserves
6. For vacant units: detailed stabilization plan with monthly timeline

Return only valid JSON matching the exact schema provided.`,
          messages: [
            {
              role: 'user',
              content: `${PROPERTY_ANALYSIS_PROMPT}\n\n${text}` // Full text for comprehensive extraction
            }
          ]
        });
        
        const apiEndTime = Date.now();
        console.log(`Claude API response time: ${apiEndTime - apiStartTime}ms`);
        
        // Log usage metrics if available
        if ('usage' in message) {
          const usage = message.usage as { input_tokens?: number; output_tokens?: number };
          metrics.inputTokens = usage?.input_tokens;
          metrics.outputTokens = usage?.output_tokens;
          console.log(`Token usage - Input: ${metrics.inputTokens}, Output: ${metrics.outputTokens}`);
        }

        // Extract the response
        const response = message.content[0];
        if (response.type !== 'text') {
          throw new Error('Unexpected response type from Claude');
        }

        // Parse the JSON response
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        
        propertyData = JSON.parse(jsonMatch[0]);
        
        // Validate the parsed data
        const validation = validatePropertyData(propertyData || {});
        if (!validation.valid) {
          console.warn('Property validation issues:', validation.errors);
          // Continue with partial data if we have at least address/title and price
          if (!propertyData?.address && !propertyData?.title) {
            throw new Error(`Invalid property data: ${validation.errors.join(', ')}`);
          }
        }
        
        // Success - break out of retry loop
        console.log('Successfully parsed property data');
        
        // Reset Opus failure count on success
        if (currentModel.includes('opus')) {
          opusFailureCount = 0;
          console.log('Opus working again, reset failure count');
        }
        
        break;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} with ${currentModel} failed:`, error);
        
        // Track Opus failures
        if (currentModel.includes('opus')) {
          opusFailureCount++;
          opusLastFailure = Date.now();
          console.log(`Opus failure count: ${opusFailureCount}`);
        }
        
        // Check if it's an overloaded error (529)
        const isOverloaded = error instanceof Error && 
          (error.message.includes('529') || error.message.includes('overloaded'));
        
        // Check if we've exceeded total time limit
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > MAX_TOTAL_TIME) {
          console.log(`Exceeded maximum total time of ${MAX_TOTAL_TIME}ms, stopping retries`);
          break modelLoop;
        }
        
        // Determine if we should retry based on error type
        const isRetryableError = isOverloaded || 
          error.message.includes('timeout') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('ETIMEDOUT');
        
        // If overloaded and we have a fallback model, switch immediately
        if (isOverloaded && modelIndex < models.length - 1) {
          console.log(`Model ${currentModel} is overloaded, switching to fallback model immediately...`);
          break; // Break inner loop to try next model
        }
        
        // Only retry if it's a retryable error and we haven't exceeded attempts
        if (attempt < MAX_RETRIES && isRetryableError) {
          const backoffDelay = Math.min(RETRY_DELAY * attempt, 2000); // Cap at 2 seconds
          console.log(`Retrying in ${backoffDelay}ms...`);
          await sleep(backoffDelay);
        } else if (!isRetryableError) {
          console.log(`Non-retryable error encountered, stopping retries for ${currentModel}`);
          break; // Skip to next model or fail
        }
      }
    }
  }
    
    // If all retries failed
    if (!propertyData) {
      console.error(`All ${totalAttempts} attempts across ${models.length} models failed:`, lastError);
      const processingTime = Date.now() - startTime;
      trackUsage(false, false, processingTime, 'all_retries_failed');
      
      // Check if it was due to overload
      const isOverloaded = lastError?.message?.includes('overloaded') || lastError?.message?.includes('529');
      
      return NextResponse.json({
        success: false,
        error: isOverloaded 
          ? 'AI service is currently overloaded. Please try again in a few minutes or add the property manually.'
          : 'Failed to analyze property after multiple attempts. Please try again or add manually.',
        fallbackToManual: true,
        technicalError: lastError?.message,
        processingTime,
        isOverloaded
      }, { status: isOverloaded ? 503 : 500 });
    }

    // Add computed fields
    if (propertyData.price && propertyData.downPayment && !propertyData.downPaymentPercent) {
      propertyData.downPaymentPercent = Math.round((propertyData.downPayment / propertyData.price) * 100);
    }

    // Calculate cash required if not provided
    if (!propertyData.cashRequired && propertyData.downPayment) {
      const closingCosts = Number(propertyData.financing?.closingCosts || propertyData.closingCosts || 0);
      const rehabCosts = Number(propertyData.rehabCosts || 0);
      propertyData.cashRequired = Number(propertyData.downPayment) + closingCosts + rehabCosts;
    }

    // Set pro forma values if not provided but calculable
    if (!propertyData.proFormaCashFlow && propertyData.monthlyCashFlow) {
      propertyData.proFormaCashFlow = propertyData.monthlyCashFlow;
    }
    if (!propertyData.proFormaCapRate && propertyData.capRate) {
      propertyData.proFormaCapRate = propertyData.capRate;
    }

    // Ensure required fields have defaults
    propertyData.features = propertyData.features || [];
    // Don't override images here - let the frontend handle uploaded images
    propertyData.status = 'active';
    propertyData.createdAt = new Date();
    propertyData.updatedAt = new Date();
    propertyData.isDraft = false;

    // Generate a title if not provided
    if (!propertyData.title && propertyData.address) {
      propertyData.title = propertyData.address;
    }

    // Set type field based on investment strategy if not provided
    if (!propertyData.type && propertyData.investmentStrategy) {
      const typeMap: { [key: string]: string } = {
        'Fix & Flip': 'Premium Flip',
        'BRRRR': 'Value-Add',
        'House Hack': 'House Hack',
        'Buy & Hold': 'Rental Property',
        'Short-Term Rental': 'STR Property'
      };
      propertyData.type = typeMap[propertyData.investmentStrategy] || propertyData.propertyType;
    }

    // Set appropriate interest rate based on strategy and property type
    if (!propertyData.financing?.interestRate && propertyData.investmentStrategy) {
      const rateInfo = getStrategyInterestRate(
        propertyData.investmentStrategy, 
        propertyData.propertyType,
        propertyData.units
      );
      
      if (!propertyData.financing) {
        propertyData.financing = {};
      }
      
      propertyData.financing.interestRate = rateInfo.default;
      
      // Also update financing scenarios if they exist
      if (propertyData.financingScenarios && propertyData.financingScenarios.length > 0) {
        propertyData.financingScenarios.forEach(scenario => {
          if (!scenario.interestRate) {
            scenario.interestRate = rateInfo.default;
          }
        });
      }
    }

    // Ensure comprehensive description
    if (propertyData.description && propertyData.description.length < 50) {
      // Enhance short descriptions
      const parts = [];
      if (propertyData.type) parts.push(propertyData.type);
      if (propertyData.city && propertyData.state) parts.push(`in ${propertyData.city}, ${propertyData.state}`);
      if (propertyData.capRate) parts.push(`with ${propertyData.capRate}% cap rate`);
      if (propertyData.totalROI) parts.push(`and ${propertyData.totalROI}% ROI`);
      propertyData.description = `${propertyData.description}. ${parts.join(' ')}`;
    }

    // Cache the successful analysis
    analysisCache.set(cacheKey, {
      data: propertyData,
      timestamp: Date.now()
    });

    // Track API usage
    const processingTime = Date.now() - startTime;
    metrics.processingTime = processingTime;
    metrics.success = true;
    
    console.log(`Property analysis completed in ${processingTime}ms`);
    console.log(`Model verification: ${metrics.model}`);
    trackUsage(true, false, processingTime);

    // Prepare for future API integrations
    // const enrichedData = {
    //   ...propertyData,
    //   // Future: Add RentCast rental estimates
    //   rentCastEstimate: null,
    //   // Future: Add Homesage property values
    //   homesageValue: null,
    //   // Future: Add market comparables
    //   marketComps: null
    // };

    return NextResponse.json({
      success: true,
      data: propertyData,
      cached: false,
      processingTime,
      validation: validatePropertyData(propertyData),
      metrics: {
        model: metrics.model,
        processingTime: metrics.processingTime,
        inputTokens: metrics.inputTokens,
        outputTokens: metrics.outputTokens
      }
    });

  } catch (error) {
    console.error('Error analyzing property:', error);
    const processingTime = Date.now() - startTime;
    
    // Return appropriate error message
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        trackUsage(false, false, processingTime, 'api_key_missing');
        return NextResponse.json({
          success: false,
          error: 'AI service not configured. Please add ANTHROPIC_API_KEY to environment variables.',
          fallbackToManual: true,
          processingTime
        }, { status: 500 });
      }
      
      if (error.message.includes('rate limit')) {
        trackUsage(false, false, processingTime, 'rate_limit');
        return NextResponse.json({
          success: false,
          error: 'API rate limit reached. Please try again in a few moments.',
          fallbackToManual: true,
          processingTime
        }, { status: 429 });
      }
      
      trackUsage(false, false, processingTime, 'parsing_error');
      return NextResponse.json({
        success: false,
        error: error.message,
        fallbackToManual: true,
        processingTime
      }, { status: 400 });
    }
    
    trackUsage(false, false, processingTime, 'unknown_error');
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred. Please try again or add property manually.',
      fallbackToManual: true,
      processingTime
    }, { status: 500 });
  }
}