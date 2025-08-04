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
          max_tokens: 4000,
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
      flip: this.getFlipStrategyPrompt(),
      brrrr: this.getBRRRRStrategyPrompt(),
      airbnb: this.getAirbnbStrategyPrompt(),
      commercial: this.getCommercialStrategyPrompt()
    };

    const basePrompt = `
You are an expert real estate investment analyst. Analyze this property and provide a comprehensive investment analysis.

PROPERTY DATA:
Address: ${property.address}, ${property.city}, ${property.state} ${property.zipCode}
Type: ${property.propertyType}
${property.bedrooms ? `Bedrooms: ${property.bedrooms}` : ''}
${property.bathrooms ? `Bathrooms: ${property.bathrooms}` : ''}
${property.squareFootage ? `Square Footage: ${property.squareFootage.toLocaleString()} sqft` : ''}
${property.yearBuilt ? `Year Built: ${property.yearBuilt}` : ''}
${property.lotSize ? `Lot Size: ${property.lotSize.toLocaleString()} sqft` : ''}

FINANCIAL DATA:
${property.listingPrice ? `Listing Price: $${property.listingPrice.toLocaleString()}` : ''}
${property.avm ? `Automated Valuation (AVM): $${property.avm.toLocaleString()}` : ''}
${property.price ? `Analysis Price: $${property.price.toLocaleString()}` : ''}
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
Provide a 2-3 paragraph strategic overview of this investment opportunity, highlighting key strengths and potential returns.

2. EXECUTIVE SUMMARY
Create a concise executive summary (bullet points) covering:
- Investment thesis
- Expected returns
- Key risks
- Recommended actions

3. FINANCIAL ANALYSIS
Calculate and provide:
- Total investment required (including rehab if applicable)
- Monthly cash flow projections
- Cap rate analysis
- Cash-on-cash return
- ${config.timeHorizon}-year ROI projection

4. MARKET ANALYSIS
Analyze:
- Neighborhood trends and demographics
- Comparable properties performance
- Demand drivers
- Future development plans

5. RISK ASSESSMENT
Identify:
- Top 3-5 primary risks
- Mitigation strategies for each
- Overall risk level (low/medium/high)

6. VALUE-ADD OPPORTUNITIES
List 5-7 specific improvements or strategies to increase property value and returns.

7. EXIT STRATEGY
Describe the optimal exit strategy and timing based on the investment strategy.

8. RECOMMENDED ACTIONS
Provide 5-7 specific, actionable next steps for the investor.

Format your response as a structured analysis that can be parsed. Use clear headers and bullet points where appropriate.
Provide specific numbers and percentages based on the data provided.
Be realistic and balanced in your assessment - highlight both opportunities and risks.

${customNotes ? `\nCUSTOM ANALYSIS INSTRUCTIONS:\n${customNotes}\n` : ''}

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

  private getFlipStrategyPrompt(): string {
    return `
Focus on:
- Renovation scope and costs
- After Repair Value (ARV)
- Timeline for completion
- Holding costs
- Market demand for renovated properties
- Profit margin analysis
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
    
    return {
      strategicOverview: sections.strategicOverview || '',
      executiveSummary: sections.executiveSummary || '',
      investmentThesis: sections.investmentThesis || '',
      financialAnalysis: financials,
      marketAnalysis: {
        neighborhoodOverview: sections.neighborhoodOverview || '',
        comparables: sections.comparables || '',
        marketTrends: sections.marketTrends || '',
        demandDrivers: sections.demandDrivers || ''
      },
      riskAssessment: {
        primaryRisks: this.extractBulletPoints(sections.risks || ''),
        mitigationStrategies: this.extractBulletPoints(sections.mitigation || ''),
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
    
    // Define section patterns
    const sectionPatterns = [
      { key: 'strategicOverview', pattern: /STRATEGIC OVERVIEW[\s\S]*?(?=\n##|\n\d\.|\Z)/i },
      { key: 'executiveSummary', pattern: /EXECUTIVE SUMMARY[\s\S]*?(?=\n##|\n\d\.|\Z)/i },
      { key: 'investmentThesis', pattern: /INVESTMENT THESIS[\s\S]*?(?=\n##|\n\d\.|\Z)/i },
      { key: 'financialAnalysis', pattern: /FINANCIAL ANALYSIS[\s\S]*?(?=\n##|\n\d\.|\Z)/i },
      { key: 'neighborhoodOverview', pattern: /NEIGHBORHOOD[\s\S]*?(?=\n##|\n\d\.|\Z)/i },
      { key: 'marketTrends', pattern: /MARKET TRENDS[\s\S]*?(?=\n##|\n\d\.|\Z)/i },
      { key: 'risks', pattern: /RISK[S]? ASSESSMENT[\s\S]*?(?=\n##|\n\d\.|\Z)/i },
      { key: 'valueAdd', pattern: /VALUE-ADD[\s\S]*?(?=\n##|\n\d\.|\Z)/i },
      { key: 'exitStrategy', pattern: /EXIT STRATEGY[\s\S]*?(?=\n##|\n\d\.|\Z)/i },
      { key: 'recommendedActions', pattern: /RECOMMENDED ACTIONS[\s\S]*?(?=\n##|\n\d\.|\Z)/i }
    ];
    
    sectionPatterns.forEach(({ key, pattern }) => {
      const match = text.match(pattern);
      if (match) {
        sections[key] = match[0].replace(/^.*?\n/, '').trim();
      }
    });
    
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
    sections: Record<string, string>
  ): GeneratedAnalysis['financialAnalysis'] {
    const price = property.price || 0;
    const monthlyRent = property.monthlyRent || property.rentEstimate || 0;
    
    // Estimate rehab based on strategy
    let estimatedRehab = 0;
    if (config.strategy === 'flip') {
      estimatedRehab = price * 0.15; // 15% for flips
    } else if (config.strategy === 'brrrr') {
      estimatedRehab = price * 0.10; // 10% for BRRRR
    } else if (config.strategy === 'airbnb') {
      estimatedRehab = 30000; // Furnishing costs
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