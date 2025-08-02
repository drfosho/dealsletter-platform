import { NextRequest, NextResponse } from 'next/server';
import { rentCastService } from '@/services/rentcast';
import { logError } from '@/utils/error-utils';

interface RouteParams {
  params: Promise<{
    address: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate API key
    if (!process.env.RENTCAST_API_KEY) {
      return NextResponse.json(
        { error: 'RentCast API is not configured' },
        { status: 503 }
      );
    }

    // Await params before accessing
    const resolvedParams = await params;
    
    // Decode and validate address
    const address = decodeURIComponent(resolvedParams.address);
    
    if (!address || address.length < 5 || address.length > 200) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Get comprehensive property data
    const data = await rentCastService.getComprehensivePropertyData(address);
    
    // Add calculated metrics - ensure null values are converted to undefined
    const dataForMetrics = {
      property: data.property,
      rental: data.rental || undefined,
      comparables: data.comparables || undefined,
      market: data.market || undefined,
      listing: data.listing
    };
    
    const enrichedData = {
      ...data,
      metrics: calculatePropertyMetrics(dataForMetrics),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(enrichedData);

  } catch (error) {
    logError('Property Details API', error);
    
    if (error instanceof Error) {
      if (error.message?.includes('not found') || error.message?.includes('404')) {
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
        { error: 'Failed to fetch property details', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch property details', details: 'Unknown error' },
      { status: 500 }
    );
  }
}

interface PropertyMetrics {
  pricePerSqFt?: number;
  rentToPriceRatio?: string;
  grossYield?: string;
  estimatedCapRate?: string;
  rentVsMarket?: string;
  priceVsMarket?: string;
}

interface PropertyDataWithMetrics {
  property?: {
    lastSalePrice?: number;
    squareFootage?: number;
  };
  rental?: {
    rentEstimate?: number;
  };
  market?: {
    rentalData?: {
      medianRent?: number;
    };
    saleData?: {
      medianPrice?: number;
    };
  };
  comparables?: {
    value?: number;
    valueRangeLow?: number;
    valueRangeHigh?: number;
  };
}

// Calculate useful metrics from the property data
function calculatePropertyMetrics(data: PropertyDataWithMetrics): PropertyMetrics {
  const metrics: PropertyMetrics = {};
  
  // Calculate price per square foot
  if (data.property?.lastSalePrice && data.property?.squareFootage) {
    metrics.pricePerSqFt = Math.round(data.property.lastSalePrice / data.property.squareFootage);
  }
  
  // Calculate rent to price ratio
  if (data.rental?.rentEstimate && data.property?.lastSalePrice) {
    metrics.rentToPriceRatio = (data.rental.rentEstimate * 12 / data.property.lastSalePrice * 100).toFixed(2);
    metrics.grossYield = metrics.rentToPriceRatio + '%';
  }
  
  // Calculate cap rate estimate (simplified)
  if (data.rental?.rentEstimate && data.property?.lastSalePrice) {
    const annualRent = data.rental.rentEstimate * 12;
    const expenses = annualRent * 0.4; // Assume 40% expenses
    const noi = annualRent - expenses;
    metrics.estimatedCapRate = (noi / data.property.lastSalePrice * 100).toFixed(2) + '%';
  }
  
  // Market position
  if (data.rental?.rentEstimate && data.market?.rentalData?.medianRent) {
    const rentDiff = ((data.rental.rentEstimate - data.market.rentalData.medianRent) / data.market.rentalData.medianRent * 100);
    metrics.rentVsMarket = rentDiff > 0 ? `+${rentDiff.toFixed(1)}%` : `${rentDiff.toFixed(1)}%`;
  }
  
  if (data.property?.lastSalePrice && data.comparables?.value) {
    const priceDiff = ((data.property.lastSalePrice - data.comparables.value) / data.comparables.value * 100);
    metrics.priceVsMarket = priceDiff > 0 ? `+${priceDiff.toFixed(1)}%` : `${priceDiff.toFixed(1)}%`;
  }
  
  return metrics;
}