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

    // SEC-005: Enhanced input validation and sanitization
    // Remove control characters and normalize whitespace
    const sanitizedAddress = body.address
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ')            // Normalize whitespace
      .trim();

    // Length validation
    if (sanitizedAddress.length < 5 || sanitizedAddress.length > 200) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // SEC-005: Validate address contains expected characters for US addresses
    // Allow letters, numbers, spaces, commas, periods, hyphens, apostrophes, and #
    const addressPattern = /^[a-zA-Z0-9\s,.\-'#]+$/;
    if (!addressPattern.test(sanitizedAddress)) {
      return NextResponse.json(
        { error: 'Address contains invalid characters' },
        { status: 400 }
      );
    }

    // SEC-005: Basic structure validation - should have at least a number and some letters
    const hasNumber = /\d/.test(sanitizedAddress);
    const hasLetters = /[a-zA-Z]{2,}/.test(sanitizedAddress);
    if (!hasNumber || !hasLetters) {
      return NextResponse.json(
        { error: 'Please enter a valid street address' },
        { status: 400 }
      );
    }

    const address = sanitizedAddress;

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
      
      // CRITICAL DEBUG - Log all data for troubleshooting
      console.log('\n=== PROPERTY SEARCH API - CRITICAL DEBUG ===');
      console.log('Address searched:', address);

      // Log each data source separately
      console.log('\n--- PROPERTY DATA ---');
      console.log(JSON.stringify(results.property, null, 2));

      console.log('\n--- COMPARABLES/AVM DATA ---');
      console.log(JSON.stringify(results.comparables, null, 2));

      console.log('\n--- LISTING DATA ---');
      console.log(JSON.stringify(results.listing, null, 2));

      console.log('\n--- RENTAL DATA ---');
      console.log(JSON.stringify(results.rental, null, 2));

      // Extract and validate price values
      const comparablesData = results.comparables as any;
      const rentalData = results.rental as any;
      const listingData = results.listing as any;
      const propertyData = results.property as any;

      // Calculate the effective price based on available data
      const listingPrice = listingData?.price || listingData?.listPrice || listingData?.askingPrice || 0;
      const avmValue = comparablesData?.value || comparablesData?.price || 0;
      const lastSalePrice = propertyData?.lastSalePrice || 0;
      const effectivePrice = listingPrice || avmValue || lastSalePrice;

      console.log('\n--- PRICE EXTRACTION SUMMARY ---');
      console.log({
        listingPrice,
        avmValue,
        lastSalePrice,
        effectivePrice,
        listingStatus: listingData?.status || listingData?.listingStatus || 'Unknown',
        rentEstimate: rentalData?.rentEstimate || rentalData?.rent || 0,
        comparablesCount: comparablesData?.comparables?.length || 0
      });

      // VALIDATION CHECK - Warn if no price data found
      if (effectivePrice === 0) {
        console.error('\n!!! CRITICAL ERROR: No price data found for property !!!');
        console.error('This is likely a RentCast API issue or the property is not in their database');
      }

      console.log('=== END CRITICAL DEBUG ===\n');

      return NextResponse.json(results);

    } catch (propertyError) {
      // If we can't even get basic property details, it might not exist
      const errorMessage = propertyError instanceof Error ? propertyError.message : String(propertyError);
      const lowerMessage = errorMessage.toLowerCase();

      // Check for various "not found" error patterns from RentCast
      if (lowerMessage.includes('not found') ||
          lowerMessage.includes('no data found') ||
          lowerMessage.includes('no results') ||
          lowerMessage.includes('404') ||
          lowerMessage.includes('property not in database')) {
        return NextResponse.json(
          {
            error: 'Property not found',
            details: 'This address was not found in the property database. Please verify the address and try again.'
          },
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