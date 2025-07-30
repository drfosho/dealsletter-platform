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
      results.property = propertyDetails;

      // Get additional data if requested
      const promises = [];
      
      if (body.includeRentEstimates) {
        promises.push(
          rentCastService.getRentalEstimate(address)
            .then(data => { results.rental = data; })
            .catch(err => { 
              console.error('Failed to get rental estimate:', err);
              results.rental = { error: 'Unable to fetch rental estimates' };
            })
        );
      }

      if (body.includeComparables) {
        promises.push(
          rentCastService.getSaleComparables(address)
            .then(data => { results.comparables = data; })
            .catch(err => { 
              console.error('Failed to get comparables:', err);
              results.comparables = { error: 'Unable to fetch comparables' };
            })
        );
      }

      if (body.includeMarketData && propertyDetails.zipCode) {
        promises.push(
          rentCastService.getMarketData(propertyDetails.zipCode)
            .then(data => { results.market = data; })
            .catch(err => { 
              console.error('Failed to get market data:', err);
              results.market = { error: 'Unable to fetch market data' };
            })
        );
      }

      // Wait for all additional data
      if (promises.length > 0) {
        await Promise.all(promises);
      }

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