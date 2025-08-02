import { NextRequest, NextResponse } from 'next/server';
import { rentCastService } from '@/services/rentcast';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    console.log('[Test Listing] Testing address:', address);

    // Test all RentCast endpoints
    const results: any = {
      address,
      timestamp: new Date().toISOString()
    };

    // 1. Test property details
    try {
      const property = await rentCastService.getPropertyDetails(address);
      results.property = {
        success: true,
        data: property,
        hasImages: property?.images?.length > 0
      };
    } catch (err) {
      results.property = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // 2. Test active listing
    try {
      const listing = await rentCastService.getActiveListing(address);
      results.listing = {
        success: true,
        data: listing,
        hasListingPrice: !!(listing?.price || listing?.listPrice)
      };
    } catch (err) {
      results.listing = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // 3. Test comparables (AVM)
    try {
      const comparables = await rentCastService.getSaleComparables(address);
      results.comparables = {
        success: true,
        data: comparables,
        avmValue: comparables?.value
      };
    } catch (err) {
      results.comparables = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // 4. Test comprehensive data
    try {
      const comprehensive = await rentCastService.getComprehensivePropertyData(address);
      results.comprehensive = {
        success: true,
        hasProperty: !!comprehensive.property,
        hasRental: !!comprehensive.rental,
        hasComparables: !!comprehensive.comparables,
        hasMarket: !!comprehensive.market,
        hasListing: !!comprehensive.listing,
        listingPrice: comprehensive.listing?.price || comprehensive.listing?.listPrice,
        avmValue: comprehensive.comparables?.value,
        images: comprehensive.property?.images?.length || 0
      };
    } catch (err) {
      results.comprehensive = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('[Test Listing] Error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}