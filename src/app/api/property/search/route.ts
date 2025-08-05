import { NextRequest, NextResponse } from 'next/server';
import { rentCastService } from '@/services/rentcast';
import { PropertySearchRequest } from '@/types/rentcast';
import { logError } from '@/utils/error-utils';
import { propertySearchLimiter, getClientIdentifier } from '@/utils/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const clientId = getClientIdentifier(request);
    if (!propertySearchLimiter.isAllowed(clientId)) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((propertySearchLimiter.getResetTime(clientId) - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': String(propertySearchLimiter.getRemaining(clientId)),
            'X-RateLimit-Reset': String(propertySearchLimiter.getResetTime(clientId))
          }
        }
      );
    }

    // Validate API key
    if (!process.env.RENTCAST_API_KEY) {
      return NextResponse.json(
        { error: 'RentCast API is not configured' },
        { status: 503 }
      );
    }

    // Parse request body
    const body: PropertySearchRequest = await request.json();
    
    if (!body.address || typeof body.address !== 'string') {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Sanitize address
    const address = body.address.trim();
    if (address.length < 5 || address.length > 200) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Fetch property data based on requested fields
    const results: Record<string, unknown> = {
      address,
      timestamp: new Date().toISOString(),
    };

    try {
      // Always get basic property details
      const propertyDetails = await rentCastService.getPropertyDetails(address);
      console.log('[API] Property details received from RentCast:', {
        isArray: Array.isArray(propertyDetails),
        bedrooms: propertyDetails.bedrooms,
        bathrooms: propertyDetails.bathrooms,
        propertyType: propertyDetails.propertyType,
        squareFootage: propertyDetails.squareFootage,
        fullDetails: propertyDetails
      });
      results.property = propertyDetails;

      // Get additional data if requested
      const promises = [];
      
      if (body.includeRentEstimates) {
        promises.push(
          rentCastService.getRentalEstimate(address)
            .then(data => { 
              console.log('[API] Rental estimate data:', data);
              results.rental = data; 
            })
            .catch(err => { 
              console.error('[API] Failed to get rental estimate:', err);
              results.rental = null; // Set to null instead of error object
            })
        );
      }

      if (body.includeComparables) {
        promises.push(
          rentCastService.getSaleComparables(address)
            .then(data => { 
              console.log('[API] Comparables data:', data);
              results.comparables = data; 
            })
            .catch(err => { 
              console.error('[API] Failed to get comparables:', err);
              results.comparables = null; // Set to null instead of error object
            })
        );
      }

      if (body.includeMarketData && propertyDetails.zipCode) {
        promises.push(
          rentCastService.getMarketData(propertyDetails.zipCode)
            .then(data => { 
              console.log('[API] Market data:', data);
              results.market = data; 
            })
            .catch(err => { 
              console.error('[API] Failed to get market data:', err);
              results.market = null; // Set to null instead of error object
            })
        );
      }

      // CRITICAL: Always fetch listing data for on-market properties
      promises.push(
        rentCastService.getActiveListing(address)
          .then(data => {
            console.log('[API] Active listing data:', data);
            results.listing = data;
          })
          .catch(err => {
            console.log('[API] No active listing found (property may be off-market):', err.message);
            results.listing = null;
          })
      );

      // Wait for all additional data
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      
      // Log final results for debugging with FULL data structure
      console.log('[API] CRITICAL - Raw data structure inspection:');
      console.log('Property data:', JSON.stringify(results.property, null, 2));
      console.log('Comparables data:', JSON.stringify(results.comparables, null, 2));
      console.log('Rental data:', JSON.stringify(results.rental, null, 2));
      console.log('Listing data:', JSON.stringify(results.listing, null, 2));
      
      // Try to extract values from different possible paths
      const comparablesData = results.comparables as any;
      const rentalData = results.rental as any;
      
      console.log('[API] Final property search results:', {
        hasProperty: !!results.property,
        hasListing: !!results.listing,
        listingPrice: (results.listing as any)?.price || (results.listing as any)?.listPrice,
        hasComparables: !!results.comparables,
        comparablesValue: comparablesData?.value || comparablesData?.price || comparablesData?.averagePrice,
        comparablesFullData: comparablesData,
        hasRental: !!results.rental,
        rentEstimate: rentalData?.rentEstimate || rentalData?.rent || rentalData?.price,
        rentalFullData: rentalData
      });

      return NextResponse.json(results);

    } catch (propertyError) {
      // If we can't even get basic property details, it might not exist
      const errorMessage = propertyError instanceof Error ? propertyError.message : String(propertyError);
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        return NextResponse.json(
          { error: 'Property not found at this address' },
          { status: 404 }
        );
      }
      throw propertyError;
    }

  } catch (error) {
    logError('Property Search API', error);
    
    // Handle rate limiting
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to search property', details: errorMessage },
      { status: 500 }
    );
  }
}