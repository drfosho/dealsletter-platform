import { NextRequest, NextResponse } from 'next/server';
import { fetchComprehensivePropertyData, mergeRentCastData } from '@/utils/rentcast-fetcher';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    console.log(`[Quick Analysis] Starting comprehensive data fetch for: ${address}`);

    // Fetch comprehensive property data using our utility
    const rentcastResult = await fetchComprehensivePropertyData(address, {
      retryAttempts: 3,
      includeImages: true
    });

    if (!rentcastResult.success) {
      console.log(`[Quick Analysis] Data fetch incomplete for ${address}:`, rentcastResult.errors);
      console.log(`[Quick Analysis] Completeness score: ${rentcastResult.completeness.score}%`);
      console.log(`[Quick Analysis] Has minimum data: ${rentcastResult.completeness.hasMinimumData}`);
      
      // Check if we have minimum data to proceed
      if (!rentcastResult.completeness.hasMinimumData) {
        console.log(`[Quick Analysis] Insufficient data, missing fields:`, rentcastResult.completeness.missingFields);
        // Still try to return whatever data we have
        const partialData = mergeRentCastData(rentcastResult);
        if (partialData && (partialData.price || partialData.rentEstimate)) {
          console.log(`[Quick Analysis] Proceeding with partial data`);
          // Continue with partial data
        } else {
          return NextResponse.json(
            { 
              error: 'Insufficient property data available',
              details: rentcastResult.completeness.missingFields,
              completenessScore: rentcastResult.completeness.score
            },
            { status: 422 }
          );
        }
      }
    }

    // Merge all data into unified format
    const propertyData = mergeRentCastData(rentcastResult);
    
    if (!propertyData) {
      return NextResponse.json(
        { error: 'Failed to process property data' },
        { status: 500 }
      );
    }

    // Quick viability analysis with fallbacks
    const purchasePrice = propertyData.price || propertyData.comparablesValue || 0;
    const monthlyRent = propertyData.rentEstimate || 0;
    const squareFootage = propertyData.squareFootage || 0; // Don't assume if not available
    
    // Calculate key metrics with fallbacks for limited data
    const annualRent = monthlyRent * 12;
    const annualExpenses = annualRent * 0.4; // 40% expense ratio
    const noi = annualRent - annualExpenses;
    
    // If we don't have rental data, estimate it based on 0.7% rule of thumb
    const estimatedMonthlyRent = monthlyRent || (purchasePrice * 0.007);
    const estimatedAnnualRent = estimatedMonthlyRent * 12;
    const estimatedNOI = estimatedAnnualRent * 0.6;
    
    const capRate = purchasePrice > 0 ? 
      (monthlyRent > 0 ? (noi / purchasePrice) * 100 : (estimatedNOI / purchasePrice) * 100) : 0;
    const pricePerSqft = squareFootage > 0 ? purchasePrice / squareFootage : 500; // Use market average if sqft unknown
    const rentToPrice = purchasePrice > 0 ? (estimatedMonthlyRent / purchasePrice) * 100 : 0;
    
    // Determine strategy based on metrics (using actual or estimated data)
    let strategy = 'rental';
    let estimatedROI = 0;
    
    if (purchasePrice > 0) {
      // We at least have a price, so we can make strategic recommendations
      if (capRate < 4 && pricePerSqft > 400) {
        strategy = 'flip';
        estimatedROI = 25; // Estimated flip ROI
      } else if (capRate >= 4 && capRate < 6) {
        strategy = 'brrrr';
        estimatedROI = 15;
      } else if (estimatedMonthlyRent > 3000 && propertyData.bedrooms >= 3) {
        strategy = 'airbnb';
        estimatedROI = capRate * 2; // Airbnb typically doubles rental income
      } else if (capRate >= 6) {
        strategy = 'rental';
        estimatedROI = capRate * 1.5; // Factor in appreciation
      } else {
        // Default to rental for properties with moderate returns
        strategy = 'rental';
        estimatedROI = Math.max(capRate * 1.2, 8); // At least 8% estimated
      }
    } else if (monthlyRent > 0) {
      // Only have rental, assume rental strategy
      strategy = 'rental';
      estimatedROI = 10;
    } else {
      // No useful data
      strategy = 'unknown';
      estimatedROI = 0;
    }
    
    // Enhanced recommendation logic based on data completeness
    let recommendation: 'go' | 'pass' | 'maybe' = 'pass';
    let confidenceLevel: 'high' | 'medium' | 'low' = 'low';
    
    // Adjust confidence based on data completeness
    if (rentcastResult.completeness.score >= 80) {
      confidenceLevel = 'high';
    } else if (rentcastResult.completeness.score >= 50) {
      confidenceLevel = 'medium';
    } else if (purchasePrice > 0 || monthlyRent > 0) {
      // If we have at least price or rent, set low confidence
      confidenceLevel = 'low';
    }
    
    // Recommendation logic
    if (capRate >= 6 || (strategy === 'flip' && purchasePrice < 500000 && pricePerSqft < 300)) {
      recommendation = 'go';
    } else if (capRate >= 4.5 || (strategy === 'brrrr' && monthlyRent > 2500)) {
      recommendation = 'maybe';
    } else if (rentToPrice >= 0.8 && propertyData.yearBuilt > 1990) {
      recommendation = 'maybe';
    }

    // Prepare response with comprehensive data
    const response = {
      success: true,
      analysis: {
        strategy,
        estimatedROI,
        purchasePrice,
        monthlyRent: monthlyRent || estimatedMonthlyRent, // Use estimated if no actual
        capRate,
        pricePerSqft,
        rentToPrice,
        recommendation,
        confidence: confidenceLevel,
        isEstimated: monthlyRent === 0, // Flag if using estimated rent
        metrics: {
          annualRent: annualRent || estimatedAnnualRent,
          annualExpenses: annualExpenses || (estimatedAnnualRent * 0.4),
          noi: noi || estimatedNOI,
          grossRentMultiplier: purchasePrice > 0 && estimatedAnnualRent > 0 ? 
            purchasePrice / estimatedAnnualRent : 0,
          cashOnCash: estimatedROI * 0.7, // Rough estimate
          monthlyExpenses: (annualExpenses || estimatedAnnualRent * 0.4) / 12,
          monthlyCashFlow: estimatedMonthlyRent - ((estimatedAnnualRent * 0.4) / 12) - (purchasePrice * 0.006) // Rough mortgage estimate
        }
      },
      propertyData: {
        ...propertyData,
        dataQuality: {
          completenessScore: rentcastResult.completeness.score,
          missingFields: rentcastResult.completeness.missingFields,
          dataWarnings: rentcastResult.errors || []
        }
      },
      images: propertyData.images || [],
      neighborhood: propertyData.neighborhood || null
    };

    console.log(`[Quick Analysis] Completed for ${address}:`, {
      strategy: response.analysis.strategy,
      recommendation: response.analysis.recommendation,
      dataCompleteness: rentcastResult.completeness.score + '%',
      confidence: confidenceLevel
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Quick analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze property', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}