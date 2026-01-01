import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, propertyData, quickAnalysis, generateSections } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Build comprehensive prompt for AI analysis
    const prompt = buildComprehensivePrompt(address, propertyData, quickAnalysis, generateSections);
    
    // Call Claude API for comprehensive analysis
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json();
      console.error('Claude API error:', errorData);
      throw new Error('Failed to generate analysis');
    }

    const aiResponse = await anthropicResponse.json();
    const analysisText = aiResponse.content[0].text;
    
    // Parse the AI response into structured data
    const structuredAnalysis = parseAIAnalysis(analysisText, generateSections);
    
    return NextResponse.json({
      success: true,
      ...structuredAnalysis,
      rawAnalysis: analysisText
    });

  } catch (error) {
    console.error('Comprehensive analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate comprehensive analysis' },
      { status: 500 }
    );
  }
}

function buildComprehensivePrompt(
  address: string,
  propertyData: any,
  quickAnalysis: any,
  sections: string[]
): string {
  return `Generate a comprehensive, professional real estate investment analysis for the following property. 
This analysis will be published on a premium investment platform, so ensure all content is detailed, data-driven, and actionable.

PROPERTY DETAILS:
Address: ${address}
Type: ${propertyData?.propertyType || 'Single Family'}
Bedrooms: ${propertyData?.bedrooms || 'N/A'}
Bathrooms: ${propertyData?.bathrooms || 'N/A'}
Square Footage: ${propertyData?.squareFootage || 'N/A'}
Year Built: ${propertyData?.yearBuilt || 'N/A'}
Lot Size: ${propertyData?.lotSize || 'N/A'}

FINANCIAL DATA:
Estimated Value: $${propertyData?.price || propertyData?.value || quickAnalysis?.purchasePrice || 0}
Rent Estimate: $${propertyData?.rentEstimate || quickAnalysis?.monthlyRent || 0}/month
Quick Analysis Strategy: ${quickAnalysis?.strategy || 'rental'}
Initial Cap Rate: ${quickAnalysis?.capRate || 0}%

REQUIRED ANALYSIS SECTIONS:
${sections.map(section => `- ${formatSectionName(section)}`).join('\n')}

For each section, provide detailed, specific analysis with concrete numbers and actionable insights.

FORMAT EACH SECTION WITH CLEAR HEADERS:

## STRATEGIC OVERVIEW
Provide a comprehensive investment thesis including:
- Primary investment strategy and rationale
- Expected returns and timeline
- Key value drivers
- Risk mitigation strategies

## VALUE-ADD OPPORTUNITIES
Detail specific improvements and their impact:
- Renovation opportunities with cost estimates
- Operational improvements
- Market positioning strategies
- Expected ROI for each improvement

## LOCATION ANALYSIS
Analyze the property's location including:
- Neighborhood demographics and trends
- School ratings and proximity
- Employment centers and commute times
- Walkability and transit scores
- Crime statistics and safety ratings
- Future development plans

## RENT ANALYSIS
Provide detailed rental market analysis:
- Current market rents for comparable properties
- Historical rent growth (3-5 year trend)
- Vacancy rates in the area
- Tenant demographics and demand drivers
- Optimal rental strategy (long-term vs short-term)
- Projected rent growth scenarios

## MARKET ANALYSIS
Comprehensive market conditions:
- Supply and demand dynamics
- Recent comparable sales
- Market appreciation trends
- Economic indicators affecting the area
- Competition analysis
- Market timing considerations

## RISK ANALYSIS
Identify and quantify all risks:
- Market risks and mitigation strategies
- Property-specific risks
- Financing risks
- Regulatory and zoning risks
- Environmental considerations
- Exit strategy risks

Ensure all analysis is specific to this property and market, not generic. Include specific numbers, percentages, and timeframes wherever possible.`;
}

function parseAIAnalysis(analysisText: string, sections: string[]): any {
  const result: any = {};
  
  // Extract each section from the AI response
  sections.forEach(section => {
    const sectionName = formatSectionName(section);
    const regex = new RegExp(`##\\s*${sectionName}([\\s\\S]*?)(?=##|$)`, 'i');
    const match = analysisText.match(regex);
    
    if (match && match[1]) {
      result[section] = match[1].trim();
    }
  });
  
  // Parse specific data points
  result.purchasePrice = extractNumber(analysisText, /purchase price[:\s]+\$?([\d,]+)/i);
  result.monthlyRent = extractNumber(analysisText, /monthly rent[:\s]+\$?([\d,]+)/i);
  result.capRate = extractNumber(analysisText, /cap rate[:\s]+([\d.]+)%/i);
  result.totalROI = extractNumber(analysisText, /total roi[:\s]+([\d.]+)%/i);
  result.monthlyCashFlow = extractNumber(analysisText, /monthly cash flow[:\s]+\$?([\d,]+)/i);
  
  // Determine strategy
  if (analysisText.toLowerCase().includes('flip')) {
    result.strategy = 'flip';
  } else if (analysisText.toLowerCase().includes('brrrr')) {
    result.strategy = 'brrrr';
  } else if (analysisText.toLowerCase().includes('airbnb') || analysisText.toLowerCase().includes('short-term')) {
    result.strategy = 'airbnb';
  } else {
    result.strategy = 'rental';
  }
  
  // Determine risk level
  if (analysisText.toLowerCase().includes('high risk')) {
    result.riskLevel = 'high';
  } else if (analysisText.toLowerCase().includes('low risk')) {
    result.riskLevel = 'low';
  } else {
    result.riskLevel = 'medium';
  }
  
  return result;
}

function formatSectionName(section: string): string {
  return section
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function extractNumber(text: string, regex: RegExp): number {
  const match = text.match(regex);
  if (match && match[1]) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return 0;
}