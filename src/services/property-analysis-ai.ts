/**
 * Property Analysis AI Service
 * Generates comprehensive investment analysis using Claude 3.5 Sonnet
 */

import { MergedPropertyData } from '@/utils/property-data-merger';

export interface AnalysisConfig {
  strategy: 'rental' | 'flip' | 'brrrr' | 'airbnb' | 'commercial';
  timeHorizon: number; // in years
  financingType: 'cash' | 'conventional' | 'hard-money' | 'portfolio';
  includeProjections: boolean;
  includeComparables: boolean;
  analysisDepth: 'basic' | 'standard' | 'comprehensive';
}

export interface GeneratedAnalysis {
  strategicOverview: string;
  executiveSummary: string;
  investmentThesis: string;
  financialAnalysis: {
    purchasePrice: number;
    estimatedRehab: number;
    totalInvestment: number;
    monthlyRent: number;
    monthlyExpenses: number;
    monthlyCashFlow: number;
    capRate: number;
    cashOnCashReturn: number;
    roi: number;
  };
  marketAnalysis: {
    neighborhoodOverview: string;
    comparables: string;
    marketTrends: string;
    demandDrivers: string;
  };
  riskAssessment: {
    primaryRisks: string[];
    mitigationStrategies: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
  valueAddOpportunities: string[];
  exitStrategy: string;
  recommendedActions: string[];
  confidenceScore: number;
}

class PropertyAnalysisAI {
  private readonly anthropicApiKey: string;
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    this.anthropicApiKey = apiKey;
  }

  /**
   * Generate comprehensive property analysis using Claude
   */
  async generateAnalysis(
    propertyData: MergedPropertyData,
    config: AnalysisConfig,
    customNotes?: string
  ): Promise<GeneratedAnalysis> {
    console.log('[AI Analysis] Generating analysis for:', propertyData.address);
    
    // Build the prompt based on strategy and property data
    const prompt = this.buildAnalysisPrompt(propertyData, config, customNotes);
    
    try {
      // Call Claude API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022', // Using Claude 3.5 Sonnet
          max_tokens: 8000, // Increased for comprehensive analysis
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const analysisText = result.content[0].text;
      
      console.log('[AI Analysis] Raw response length:', analysisText.length);
      console.log('[AI Analysis] First 500 chars:', analysisText.substring(0, 500));
      
      // Parse the structured response
      const analysis = this.parseAnalysisResponse(analysisText, propertyData, config);
      
      console.log('[AI Analysis] Analysis generated successfully');
      return analysis;
      
    } catch (error) {
      console.error('[AI Analysis] Generation failed:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(
    property: MergedPropertyData,
    config: AnalysisConfig,
    customNotes?: string
  ): string {
    const strategyPrompts = {
      rental: this.getRentalStrategyPrompt(),
      flip: this.getFlipStrategyPrompt(property),
      brrrr: this.getBRRRRStrategyPrompt(),
      airbnb: this.getAirbnbStrategyPrompt(),
      commercial: this.getCommercialStrategyPrompt()
    };

    const basePrompt = `
You are an expert real estate investment analyst with 20+ years of experience. Analyze this property and provide a DETAILED, COMPREHENSIVE investment analysis suitable for professional investors.

PROPERTY DATA:
Address: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}
Type: ${property.propertyType}
${property.bedrooms ? `Bedrooms: ${property.bedrooms}` : ''}
${property.bathrooms ? `Bathrooms: ${property.bathrooms}` : ''}
${property.squareFootage ? `Square Footage: ${property.squareFootage.toLocaleString()} sqft` : ''}
${property.yearBuilt ? `Year Built: ${property.yearBuilt} (${new Date().getFullYear() - property.yearBuilt} years old)` : ''}
${property.lotSize ? `Lot Size: ${property.lotSize.toLocaleString()} sqft` : ''}

FINANCIAL DATA:
${property.listingPrice ? `Listing Price: $${property.listingPrice.toLocaleString()}` : ''}
${property.avm ? `Automated Valuation (AVM): $${property.avm.toLocaleString()}` : ''}
${property.price ? `Analysis Price: $${property.price.toLocaleString()}` : ''}
${property.estimatedRehab ? `Estimated Rehab Budget: $${property.estimatedRehab.toLocaleString()}` : ''}
${property.monthlyRent ? `Current/Estimated Rent: $${property.monthlyRent.toLocaleString()}/month` : ''}
${property.rentEstimate ? `RentCast Estimate: $${property.rentEstimate.toLocaleString()}/month` : ''}
${property.propertyTaxes ? `Property Taxes: $${property.propertyTaxes.toLocaleString()}/year` : ''}
${property.hoaFees ? `HOA Fees: $${property.hoaFees.toLocaleString()}/month` : ''}

${property.capRate ? `Current Cap Rate: ${property.capRate}%` : ''}
${property.noi ? `Net Operating Income: $${property.noi.toLocaleString()}/year` : ''}

MARKET CONTEXT:
${property.comparablesCount ? `Comparables: ${property.comparablesCount} properties analyzed` : ''}
${property.comparablesAvgPrice ? `Average Comp Price: $${property.comparablesAvgPrice.toLocaleString()}` : ''}
${property.daysOnMarket ? `Days on Market: ${property.daysOnMarket}` : ''}

${property.description ? `LISTING DESCRIPTION:\n${property.description}` : ''}

INVESTMENT STRATEGY: ${config.strategy.toUpperCase()}
Time Horizon: ${config.timeHorizon} years
Financing: ${config.financingType}

${strategyPrompts[config.strategy]}

REQUIRED ANALYSIS SECTIONS:

1. STRATEGIC OVERVIEW
Write a DETAILED 3-4 paragraph strategic overview (MUST be minimum 300 words) about THIS SPECIFIC PROPERTY:
Start with: "This ${property.bedrooms || 3}-bedroom, ${property.bathrooms || 2}-bathroom property at ${property.address} in ${property.city}, ${property.state} presents..."

Include:
- Specific details about THIS property's condition and potential
- Why THIS specific location in ${property.city} is attractive for investment
- Current market conditions in ${property.city} and how this property fits
- Specific renovation opportunities for THIS ${property.squareFootage || 1800} sqft home
- Target buyer profile for THIS neighborhood
- Timeline and profit potential specific to THIS property

2. EXECUTIVE SUMMARY  
Write a comprehensive executive summary for THIS SPECIFIC property. DO NOT use generic templates.

MUST include these specific details:
• Investment Thesis: Why THIS ${property.address} property at $${property.price?.toLocaleString() || 0} is a strong investment
• Expected Returns: 
  - Purchase: $${property.price?.toLocaleString() || 0}
  - Rehab: $${property.estimatedRehab?.toLocaleString() || 0}
  - Expected profit based on THIS property's potential
• Key Risks for THIS property:
  - Specific to ${property.city} market
  - Age of property (built ${property.yearBuilt || 'unknown'})
  - Renovation complexity for THIS ${property.squareFootage || 1800} sqft home
• Immediate Actions:
  - Property inspection priorities for THIS home
  - Contractor bids specific to THIS renovation scope
  - Financing options for THIS $${property.price?.toLocaleString() || 0} purchase

3. INVESTMENT THESIS
Write a DETAILED investment thesis (minimum 250 words) specifically for THIS property at ${property.address}.

MUST include:
- Why THIS specific property in ${property.city} is worth $${property.price?.toLocaleString() || 0}
- How the ${property.bedrooms || 3} bed/${property.bathrooms || 2} bath configuration meets local demand
- Market dynamics specific to THIS neighborhood in ${property.city}
- Renovation potential for THIS ${property.yearBuilt ? new Date().getFullYear() - property.yearBuilt + '-year-old' : ''} property
- Expected buyer profile and demand in THIS specific area
- Competitive advantages of THIS property over others in ${property.city}

4. FINANCIAL ANALYSIS
Provide DETAILED financial analysis with ACTUAL NUMBERS for THIS property:
- Purchase Price: $${property.price?.toLocaleString() || 0}
- Rehab Budget: $${property.estimatedRehab?.toLocaleString() || 0}
- Total Investment: Calculate based on above
- Monthly operating expenses for THIS property
- Expected sale price (ARV) based on THIS neighborhood
- Net profit calculation
- ROI and cash-on-cash return
- Break-even analysis
- Financing scenarios for THIS specific deal

5. MARKET ANALYSIS
Provide COMPREHENSIVE market analysis (MUST be minimum 400 words) SPECIFIC to ${property.address}, ${property.city}, ${property.state}.

MUST include ACTUAL details about:
- THIS neighborhood in ${property.city} - name specific streets, landmarks, schools
- Demographics of buyers in THIS area of ${property.city}
- Recent comparable sales near ${property.address} (create realistic examples)
- Market trends in ${property.city} and THIS specific neighborhood
- Major employers and economic drivers near THIS property
- Transportation, shopping, and amenities near ${property.address}
- Why buyers want to live in THIS part of ${property.city}
- Competition from other properties in THIS price range ($${property.price?.toLocaleString() || 0})

6. RISK ASSESSMENT
Provide DETAILED risk analysis SPECIFIC to THIS property at ${property.address}:

Market Risks for ${property.city}:
- Current market conditions in THIS area
- Price volatility in THIS neighborhood
- Demand factors specific to ${property.city}

Property-Specific Risks:
- Age issues (built ${property.yearBuilt || 'unknown'})
- Potential problems with THIS ${property.squareFootage || 1800} sqft property
- Location-specific challenges in THIS neighborhood

Financial Risks:
- Based on $${property.price?.toLocaleString() || 0} purchase price
- Rehab budget of $${property.estimatedRehab?.toLocaleString() || 0}
- Market conditions affecting THIS investment

For EACH risk, provide specific mitigation strategies relevant to THIS property.

7. VALUE-ADD OPPORTUNITIES
List 7-10 SPECIFIC value-add opportunities for THIS ${property.bedrooms || 3}BR/${property.bathrooms || 2}BA property at ${property.address}:

For each opportunity, be SPECIFIC to THIS property:
- Kitchen renovation for THIS ${property.yearBuilt ? new Date().getFullYear() - property.yearBuilt + '-year-old' : ''} home
- Bathroom updates specific to ${property.bathrooms || 2} bathrooms
- Flooring replacement for ${property.squareFootage || 1800} sqft
- Curb appeal improvements for THIS property in ${property.city}
- Energy efficiency upgrades appropriate for ${property.state} climate
- Layout modifications possible in THIS floor plan
- Outdoor improvements for THIS lot

Include estimated costs and ROI for each improvement.

8. EXIT STRATEGY
Provide COMPREHENSIVE exit strategy for THIS specific property at ${property.address}:

Primary Exit Strategy:
- Timeline to sell THIS renovated property in ${property.city}
- Target sale price based on THIS neighborhood's comps
- Marketing strategy for THIS ${property.bedrooms || 3}BR/${property.bathrooms || 2}BA home
- Buyer profile for THIS specific area of ${property.city}

Alternative Strategies:
- Rental potential at ${property.address} (even if flip focused)
- Refinance options for THIS property value
- Wholesale opportunity if market shifts

Be SPECIFIC about timing, prices, and strategies for THIS property.

9. RECOMMENDED ACTIONS
Provide 8-10 SPECIFIC next steps for THIS property at ${property.address}:

Immediate (48 hours):
- Schedule inspection for THIS ${property.squareFootage || 1800} sqft property
- Get contractor quotes for THIS specific renovation scope
- Secure financing for $${property.price?.toLocaleString() || 0} purchase

Short-term (2 weeks):
- Complete due diligence on THIS ${property.city} property
- Finalize renovation plan for THIS home
- Lock in contractors for THIS project

Medium-term (30 days):
- Close on THIS property at ${property.address}
- Pull permits for THIS renovation in ${property.city}
- Begin renovation of THIS ${property.bedrooms || 3}BR/${property.bathrooms || 2}BA home

Be SPECIFIC with actions relevant to THIS property.

CRITICAL FORMATTING REQUIREMENTS:
- GENERATE ACTUAL CONTENT, NOT JUST TEMPLATES OR STRUCTURE
- Each section must contain REAL PARAGRAPHS of text, not just bullet points
- Write SPECIFIC content about THIS property at ${property.address}
- Use the ACTUAL property data provided above
- Create realistic but specific details about the ${property.city} market
- Write as if you are a local real estate expert who knows THIS area
- NEVER say "insert X here" or use placeholder text
- NEVER use generic templates - every analysis must be unique to THIS property
- Write minimum 2,500 words of ACTUAL CONTENT
- Make up realistic details about the neighborhood if needed (schools, employers, etc.)

REMEMBER: You are writing about THIS SPECIFIC property at ${property.address}, not a generic property. Use ALL the data provided above to create a comprehensive, detailed analysis.

YOU MUST GENERATE ALL 9 SECTIONS:
1. STRATEGIC OVERVIEW - Write actual paragraphs about THIS property
2. EXECUTIVE SUMMARY - Write actual summary with bullet points  
3. INVESTMENT THESIS - Write actual thesis paragraphs
4. FINANCIAL ANALYSIS - Write actual financial analysis with calculations
5. MARKET ANALYSIS - Write actual market analysis paragraphs
6. RISK ASSESSMENT - Write actual risk analysis with details
7. VALUE-ADD OPPORTUNITIES - List actual opportunities with costs
8. EXIT STRATEGY - Write actual exit strategy paragraphs
9. RECOMMENDED ACTIONS - List actual action items

EACH SECTION MUST HAVE SUBSTANTIAL CONTENT - NO EMPTY SECTIONS!

${customNotes ? `\nCUSTOM ANALYSIS INSTRUCTIONS (MUST INCORPORATE):\n${customNotes}\n\nIMPORTANT: Integrate these custom instructions throughout the analysis, not as a separate section. These instructions should influence your market analysis, financial projections, and recommendations.\n` : ''}

IMPORTANT FORMATTING REQUIREMENTS:
- Write in a professional, authoritative tone as an expert investment advisor
- Include specific dollar amounts and percentages throughout
- Reference actual neighborhood features and market conditions
- Provide realistic renovation budgets with line items (for flip/BRRRR strategies)
- Include multiple financing scenarios with specific terms
- Format financial metrics clearly (e.g., "$125,000 profit", "18.5% ROI", "Year 3: $45,000")
- Use bullet points for lists but full paragraphs for strategic overviews
- Be specific about locations, employers, schools, and local amenities when discussing market
- Include warnings about potential risks or concerns
- Match the depth and quality of professional real estate investment analyses
`;

    return basePrompt;
  }

  /**
   * Strategy-specific prompt additions
   */
  private getRentalStrategyPrompt(): string {
    return `
Focus on:
- Long-term rental income stability
- Tenant demographic analysis
- Property management considerations
- Appreciation potential
- Tax benefits and depreciation
`;
  }

  private getFlipStrategyPrompt(_property?: MergedPropertyData): string {
    return `
Focus on FIX & FLIP STRATEGY:
- IMPORTANT: Use the provided Estimated Rehab Budget if available in FINANCIAL DATA above
- Detailed renovation budget with line items (demo, framing, electrical, plumbing, HVAC, windows, kitchen, baths, flooring, paint, landscaping)
- After Repair Value (ARV) based on comparable sold properties
- Timeline for completion (acquisition, permits, renovation phases, listing, sale)
- Holding costs breakdown (financing, insurance, utilities, property taxes)
- Market demand analysis for renovated properties in this area
- Profit margin analysis (purchase + rehab + holding costs vs ARV)
- Buyer profile for finished product
- Specific renovation recommendations to maximize ROI
- Risk factors specific to flipping (construction delays, cost overruns, market shifts)

REQUIRED FIX & FLIP ANALYSIS SECTIONS (BE EXTREMELY DETAILED):

1. STRATEGIC FLIP INVESTMENT OVERVIEW (300+ words):
   - Why this property is ideal for flipping (specific reasons)
   - Current condition assessment and renovation potential
   - Target buyer profile and market positioning
   - Competitive advantages and unique selling propositions
   - Expected timeline from acquisition to sale

2. FLIP JUSTIFICATION - Why NOT a Rental (200+ words):
   - Specific reasons this property should be flipped, not held
   - Rental market limitations in this area
   - Capital efficiency analysis
   - Opportunity cost comparison

3. DETAILED PROPERTY CONDITION & RENOVATION SCOPE (400+ words):
   - Room-by-room condition assessment
   - Structural and systems evaluation
   - Detailed renovation plan with priorities
   - Material and finish selections for target market
   - Curb appeal and landscaping improvements

4. COMPREHENSIVE INVESTMENT BREAKDOWN:
   - Purchase Price: [Use price from FINANCIAL DATA above]
   - Detailed Renovation Budget: [Use Estimated Rehab Budget from FINANCIAL DATA above]
     * Kitchen: $X (cabinets, countertops, appliances)
     * Bathrooms: $X (fixtures, tile, vanities)
     * Flooring: $X (material, labor)
     * Paint & Drywall: $X
     * Electrical/Plumbing: $X
     * HVAC: $X
     * Exterior: $X (roof, siding, windows)
     * Landscaping: $X
     * Contingency (10-15%): $X
   - Holding Costs (6 months):
     * Financing: $X/month × 6 = $X
     * Insurance: $X/month × 6 = $X
     * Utilities: $X/month × 6 = $X
     * Property Taxes: $X
   - Transaction Costs:
     * Closing Costs (purchase): $X
     * Selling Costs (6% commission + closing): $X
   - TOTAL INVESTMENT: $X

5. PROFIT ANALYSIS & RETURNS (with scenarios):
   - Conservative ARV: $X (based on lowest comps)
   - Expected ARV: $X (based on average comps)
   - Optimistic ARV: $X (based on best comps)
   - Net Profit Range: $X to $X
   - ROI: X% to X%
   - Cash-on-Cash Return: X%
   - Annualized Return: X%

6. DETAILED MARKET & COMPS ANALYSIS (500+ words):
   - Recent flip comparables (3-5 properties with addresses)
   - Days on market for renovated properties
   - Buyer demand indicators
   - Price per square foot analysis
   - Neighborhood appreciation trends
   - School ratings and their impact on value
   - Local amenities driving demand

7. COMPREHENSIVE RISK ANALYSIS:
   - Construction risks: contractor delays, cost overruns, permit issues
   - Market risks: cooling market, rising rates, seasonal factors
   - Financial risks: carrying costs, financing challenges
   - Specific mitigation strategies for each risk
   - Contingency plans and exit strategies

8. MONTH-BY-MONTH PROJECT TIMELINE:
   Month 1: Closing, permits, contractor selection
   Month 2-3: Major systems and structural work
   Month 3-4: Interior renovations and finishes
   Month 4-5: Final touches and staging
   Month 5-6: Marketing and sale
   Include specific milestones and decision points

IMPORTANT FOR FLIPS:
- DO NOT include 30-year projections (flips are short-term, typically 6-12 months)
- DO NOT focus on rental income unless discussing holding costs
- DO include specific contractor/material cost estimates
- DO provide detailed renovation timeline with milestones
- DO calculate expected profit and ROI based on total investment
- DO use the provided rehab budget estimate in calculations
`;
  }

  private getBRRRRStrategyPrompt(): string {
    return `
Focus on:
- Renovation requirements for refinancing
- ARV and refinance potential
- Cash-out refinance scenarios
- Long-term rental potential post-refinance
- Timeline for each phase
`;
  }

  private getAirbnbStrategyPrompt(): string {
    return `
Focus on:
- Short-term rental regulations
- Tourism and business travel demand
- Seasonal occupancy rates
- Furnishing and setup costs
- Management requirements
- Competition analysis
`;
  }

  private getCommercialStrategyPrompt(): string {
    return `
Focus on:
- Tenant quality and lease terms
- Triple net lease potential
- Cap rate compression opportunities
- Zoning and permitted uses
- Economic drivers for commercial demand
`;
  }

  /**
   * Parse Claude's response into structured analysis
   */
  private parseAnalysisResponse(
    responseText: string,
    property: MergedPropertyData,
    config: AnalysisConfig
  ): GeneratedAnalysis {
    // Extract sections from the response
    const sections = this.extractSections(responseText);
    
    // Calculate financial metrics
    const financials = this.calculateFinancials(property, config, sections);
    
    // Determine confidence score based on data completeness
    const confidenceScore = this.calculateConfidence(property, sections);
    
    // If we have a full market analysis section, use it for all market fields
    const marketContent = sections.marketAnalysis || '';
    
    return {
      strategicOverview: sections.strategicOverview || sections.financialAnalysis || '',
      executiveSummary: sections.executiveSummary || '',
      investmentThesis: sections.investmentThesis || '',
      financialAnalysis: financials,
      marketAnalysis: {
        neighborhoodOverview: sections.neighborhoodOverview || marketContent || '',
        comparables: sections.comparables || marketContent || '',
        marketTrends: sections.marketTrends || marketContent || '',
        demandDrivers: sections.demandDrivers || marketContent || ''
      },
      riskAssessment: {
        primaryRisks: this.extractBulletPoints(sections.risks || ''),
        mitigationStrategies: this.extractBulletPoints(sections.mitigation || sections.risks || ''),
        riskLevel: this.determineRiskLevel(sections.risks || '')
      },
      valueAddOpportunities: this.extractBulletPoints(sections.valueAdd || ''),
      exitStrategy: sections.exitStrategy || '',
      recommendedActions: this.extractBulletPoints(sections.recommendedActions || ''),
      confidenceScore
    };
  }

  /**
   * Extract sections from AI response
   */
  private extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    // Try to extract all content between numbered sections
    const fullText = text + '\n\n'; // Add padding for regex
    
    // Extract each numbered section
    const patterns: Array<{key: string, start: RegExp, end?: RegExp}> = [
      { key: 'strategicOverview', start: /1\.\s*STRATEGIC OVERVIEW/i },
      { key: 'executiveSummary', start: /2\.\s*EXECUTIVE SUMMARY/i },
      { key: 'investmentThesis', start: /3\.\s*INVESTMENT THESIS/i },
      { key: 'financialAnalysis', start: /4\.\s*FINANCIAL ANALYSIS/i },
      { key: 'marketAnalysis', start: /5\.\s*MARKET ANALYSIS/i },
      { key: 'risks', start: /6\.\s*RISK\s*ASSESSMENT/i },
      { key: 'valueAdd', start: /7\.\s*VALUE-ADD OPPORTUNITIES/i },
      { key: 'exitStrategy', start: /8\.\s*EXIT STRATEGY/i },
      { key: 'recommendedActions', start: /9\.\s*RECOMMENDED ACTIONS/i }
    ];
    
    // Extract content between sections
    for (let i = 0; i < patterns.length; i++) {
      const currentPattern = patterns[i];
      const nextPattern = patterns[i + 1];
      
      const startMatch = fullText.search(currentPattern.start);
      if (startMatch !== -1) {
        let endMatch = fullText.length;
        
        // Find where the next section starts
        if (nextPattern) {
          const nextStart = fullText.search(nextPattern.start);
          if (nextStart > startMatch) {
            endMatch = nextStart;
          }
        }
        
        // Extract the content between start and end
        const content = fullText
          .substring(startMatch, endMatch)
          .replace(currentPattern.start, '') // Remove header
          .trim();
          
        if (content) {
          sections[currentPattern.key] = content;
          console.log(`[Analysis Parser] Found ${currentPattern.key}: ${content.substring(0, 100)}...`);
        }
      } else {
        console.log(`[Analysis Parser] Section not found: ${currentPattern.key}`);
      }
    }
    
    // Extract subsections for market analysis if present
    if (sections.marketAnalysis) {
      const marketText = sections.marketAnalysis;
      
      // Try to extract neighborhood overview
      const neighborhoodMatch = marketText.match(/neighborhood[^:]*:[\s\S]*?(?=\n[A-Z]|\n-|\Z)/i);
      if (neighborhoodMatch) {
        sections.neighborhoodOverview = neighborhoodMatch[0].replace(/^[^:]+:/, '').trim();
      }
      
      // Try to extract market trends
      const trendsMatch = marketText.match(/market trends[^:]*:[\s\S]*?(?=\n[A-Z]|\n-|\Z)/i);
      if (trendsMatch) {
        sections.marketTrends = trendsMatch[0].replace(/^[^:]+:/, '').trim();
      }
      
      // Try to extract demand drivers
      const demandMatch = marketText.match(/demand drivers[^:]*:[\s\S]*?(?=\n[A-Z]|\n-|\Z)/i);
      if (demandMatch) {
        sections.demandDrivers = demandMatch[0].replace(/^[^:]+:/, '').trim();
      }
      
      // If no subsections found, use the whole market analysis for each
      if (!sections.neighborhoodOverview && !sections.marketTrends && !sections.demandDrivers) {
        sections.neighborhoodOverview = marketText;
        sections.marketTrends = marketText;
        sections.demandDrivers = marketText;
      }
    }
    
    // Log what we extracted
    console.log('[Analysis Parser] Extracted sections:', Object.keys(sections));
    
    return sections;
  }

  /**
   * Extract bullet points from text
   */
  private extractBulletPoints(text: string): string[] {
    const lines = text.split('\n');
    const bullets: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        bullets.push(trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, ''));
      }
    });
    
    return bullets;
  }

  /**
   * Calculate financial metrics
   */
  private calculateFinancials(
    property: MergedPropertyData,
    config: AnalysisConfig,
    _sections: Record<string, string>
  ): GeneratedAnalysis['financialAnalysis'] {
    const price = property.price || 0;
    const monthlyRent = property.monthlyRent || property.rentEstimate || 0;
    
    // Use provided rehab estimate or calculate based on strategy
    let estimatedRehab = property.estimatedRehab || 0;
    if (!estimatedRehab) {
      if (config.strategy === 'flip') {
        estimatedRehab = price * 0.15; // 15% for flips
      } else if (config.strategy === 'brrrr') {
        estimatedRehab = price * 0.10; // 10% for BRRRR
      } else if (config.strategy === 'airbnb') {
        estimatedRehab = 30000; // Furnishing costs
      }
    }
    
    // Calculate expenses (40% rule)
    const monthlyExpenses = monthlyRent * 0.4;
    const monthlyCashFlow = monthlyRent - monthlyExpenses;
    
    // Investment calculations
    const totalInvestment = price + estimatedRehab;
    const downPayment = config.financingType === 'cash' ? totalInvestment : totalInvestment * 0.25;
    
    // Returns
    const annualCashFlow = monthlyCashFlow * 12;
    const capRate = price > 0 ? (annualCashFlow / price) * 100 : 0;
    const cashOnCashReturn = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;
    const roi = config.timeHorizon > 0 ? 
      ((annualCashFlow * config.timeHorizon + price * 0.03 * config.timeHorizon) / totalInvestment) * 100 : 0;
    
    return {
      purchasePrice: price,
      estimatedRehab: Math.round(estimatedRehab),
      totalInvestment: Math.round(totalInvestment),
      monthlyRent: Math.round(monthlyRent),
      monthlyExpenses: Math.round(monthlyExpenses),
      monthlyCashFlow: Math.round(monthlyCashFlow),
      capRate: parseFloat(capRate.toFixed(2)),
      cashOnCashReturn: parseFloat(cashOnCashReturn.toFixed(2)),
      roi: parseFloat(roi.toFixed(2))
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    property: MergedPropertyData,
    sections: Record<string, string>
  ): number {
    let score = 0;
    
    // Data completeness (40%)
    score += (property.dataCompleteness.score / 100) * 40;
    
    // Section completeness (30%)
    const requiredSections = ['strategicOverview', 'financialAnalysis', 'risks', 'recommendedActions'];
    const sectionScore = requiredSections.filter(s => sections[s]).length / requiredSections.length;
    score += sectionScore * 30;
    
    // Data source quality (30%)
    const scrapedRatio = property.dataCompleteness.sources.scraped / 
      (property.dataCompleteness.sources.scraped + property.dataCompleteness.sources.rentcast + property.dataCompleteness.sources.estimated);
    score += scrapedRatio * 30;
    
    return Math.round(score);
  }

  /**
   * Determine risk level from analysis
   */
  private determineRiskLevel(riskText: string): 'low' | 'medium' | 'high' {
    const lowerText = riskText.toLowerCase();
    
    if (lowerText.includes('high risk') || lowerText.includes('significant risk')) {
      return 'high';
    } else if (lowerText.includes('low risk') || lowerText.includes('minimal risk')) {
      return 'low';
    }
    
    return 'medium';
  }
}

// Export singleton instance
export const propertyAnalysisAI = new PropertyAnalysisAI();