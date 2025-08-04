interface RentCastDataResult {
  success: boolean;
  data?: {
    property?: any;
    value?: any;
    rental?: any;
    comparables?: any;
    listing?: any;
    images?: string[];
    neighborhood?: any;
  };
  completeness: {
    score: number; // 0-100
    missingFields: string[];
    hasMinimumData: boolean;
  };
  errors?: string[];
}

export async function fetchComprehensivePropertyData(
  address: string,
  options: { 
    retryAttempts?: number;
    includeImages?: boolean;
  } = {}
): Promise<RentCastDataResult> {
  const { retryAttempts = 3, includeImages = true } = options;
  const errors: string[] = [];
  const result: RentCastDataResult = {
    success: false,
    data: {},
    completeness: {
      score: 0,
      missingFields: [],
      hasMinimumData: false
    },
    errors: []
  };

  const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY;
  if (!RENTCAST_API_KEY) {
    result.errors = ['RentCast API key not configured'];
    return result;
  }

  // Helper function for retrying API calls
  const fetchWithRetry = async (url: string, attempts: number = retryAttempts): Promise<any> => {
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            'X-Api-Key': RENTCAST_API_KEY,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          return await response.json();
        }

        if (response.status === 429) {
          // Rate limited - wait before retry
          await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
          continue;
        }

        if (response.status === 404) {
          return null; // Property not found
        }

        throw new Error(`API responded with status ${response.status}`);
      } catch (error) {
        if (i === attempts - 1) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
      }
    }
    return null;
  };

  const encodedAddress = encodeURIComponent(address);

  // 1. Fetch Property Details
  try {
    console.log(`[RentCast] Fetching property details for: ${address}`);
    const propertyData = await fetchWithRetry(
      `https://api.rentcast.io/v1/properties/address?address=${encodedAddress}`
    );
    
    if (propertyData) {
      result.data!.property = propertyData;
      console.log(`[RentCast] Property details fetched:`, {
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        squareFootage: propertyData.squareFootage,
        yearBuilt: propertyData.yearBuilt
      });
    }
  } catch (error) {
    errors.push(`Property details: ${error instanceof Error ? error.message : 'Failed'}`);
  }

  // 2. Fetch Property Value (AVM)
  try {
    console.log(`[RentCast] Fetching AVM for: ${address}`);
    const valueData = await fetchWithRetry(
      `https://api.rentcast.io/v1/avm/value?address=${encodedAddress}`
    );
    
    if (valueData) {
      result.data!.value = valueData;
      console.log(`[RentCast] AVM fetched: $${valueData.value || valueData.price || 'N/A'}`);
    }
  } catch (error) {
    errors.push(`Property value: ${error instanceof Error ? error.message : 'Failed'}`);
  }

  // 3. Fetch Rental Estimate
  try {
    console.log(`[RentCast] Fetching rental estimate for: ${address}`);
    const rentalData = await fetchWithRetry(
      `https://api.rentcast.io/v1/avm/rent/value?address=${encodedAddress}`
    );
    
    if (rentalData) {
      result.data!.rental = rentalData;
      console.log(`[RentCast] Rental estimate fetched: $${rentalData.rentEstimate || rentalData.rent || 'N/A'}/month`);
    }
  } catch (error) {
    errors.push(`Rental estimate: ${error instanceof Error ? error.message : 'Failed'}`);
  }

  // 4. Fetch Comparables
  try {
    console.log(`[RentCast] Fetching comparables for: ${address}`);
    const comparablesData = await fetchWithRetry(
      `https://api.rentcast.io/v1/avm/comparables?address=${encodedAddress}`
    );
    
    if (comparablesData) {
      result.data!.comparables = comparablesData;
      console.log(`[RentCast] Comparables fetched:`, {
        count: comparablesData.comparables?.length || 0,
        avgValue: comparablesData.value || 'N/A'
      });
    }
  } catch (error) {
    errors.push(`Comparables: ${error instanceof Error ? error.message : 'Failed'}`);
  }

  // 5. Fetch Active Listing (if available)
  try {
    console.log(`[RentCast] Checking for active listing: ${address}`);
    const listingData = await fetchWithRetry(
      `https://api.rentcast.io/v1/listings/sale?address=${encodedAddress}`
    );
    
    if (listingData && listingData.length > 0) {
      result.data!.listing = listingData[0];
      console.log(`[RentCast] Active listing found: $${listingData[0].price || 'N/A'}`);
      
      // Extract images from listing
      if (includeImages && listingData[0].images) {
        result.data!.images = listingData[0].images.map((img: any) => 
          typeof img === 'string' ? img : img.url
        ).filter(Boolean).slice(0, 10);
      }
    }
  } catch {
    // Listing may not exist, which is okay
    console.log(`[RentCast] No active listing found (this is normal)`);
  }

  // 6. Fetch Neighborhood Data
  try {
    console.log(`[RentCast] Fetching neighborhood data for: ${address}`);
    const neighborhoodData = await fetchWithRetry(
      `https://api.rentcast.io/v1/markets/neighborhood?address=${encodedAddress}`
    );
    
    if (neighborhoodData) {
      result.data!.neighborhood = neighborhoodData;
      console.log(`[RentCast] Neighborhood data fetched`);
    }
  } catch (error) {
    errors.push(`Neighborhood: ${error instanceof Error ? error.message : 'Failed'}`);
  }

  // Calculate data completeness
  const completeness = calculateCompleteness(result.data!);
  result.completeness = completeness;
  result.errors = errors;
  result.success = completeness.hasMinimumData;

  console.log(`[RentCast] Data collection complete for ${address}:`, {
    success: result.success,
    completenessScore: completeness.score,
    hasMinimumData: completeness.hasMinimumData,
    missingFields: completeness.missingFields,
    errors: errors.length > 0 ? errors : 'None',
    dataReceived: {
      property: !!result.data?.property,
      value: !!result.data?.value,
      rental: !!result.data?.rental,
      comparables: !!result.data?.comparables,
      listing: !!result.data?.listing,
      neighborhood: !!result.data?.neighborhood
    }
  });

  return result;
}

function calculateCompleteness(data: any): {
  score: number;
  missingFields: string[];
  hasMinimumData: boolean;
} {
  const requiredFields = [
    { key: 'property', weight: 25, name: 'Property Details' },
    { key: 'value', weight: 25, name: 'Property Value' },
    { key: 'rental', weight: 25, name: 'Rental Estimate' },
    { key: 'comparables', weight: 15, name: 'Comparables' },
    { key: 'neighborhood', weight: 10, name: 'Neighborhood Data' }
  ];

  let score = 0;
  const missingFields: string[] = [];
  let hasBasicPropertyInfo = false;
  let hasAnyValue = false;
  let hasAnyRental = false;

  for (const field of requiredFields) {
    if (data[field.key] && Object.keys(data[field.key]).length > 0) {
      // Additional validation for specific fields
      if (field.key === 'property') {
        const prop = data[field.key];
        if (prop.bedrooms || prop.bathrooms || prop.squareFootage || prop.yearBuilt) {
          hasBasicPropertyInfo = true;
          if (prop.bedrooms && prop.bathrooms && prop.squareFootage) {
            score += field.weight;
          } else {
            score += field.weight * 0.7; // Partial credit for any property data
            if (!prop.squareFootage) missingFields.push('Square Footage');
            if (!prop.bedrooms) missingFields.push('Bedrooms');
            if (!prop.bathrooms) missingFields.push('Bathrooms');
          }
        } else {
          missingFields.push(field.name);
        }
      } else if (field.key === 'value') {
        const val = data[field.key];
        if (val.value || val.price) {
          hasAnyValue = true;
          score += field.weight;
        } else {
          missingFields.push(field.name);
        }
      } else if (field.key === 'rental') {
        const rent = data[field.key];
        if (rent.rentEstimate || rent.rent || rent.rentRangeLow) {
          hasAnyRental = true;
          score += field.weight;
        } else {
          missingFields.push(field.name);
        }
      } else if (field.key === 'comparables') {
        const comp = data[field.key];
        if (comp.value || (comp.comparables && comp.comparables.length > 0)) {
          if (!hasAnyValue && comp.value) {
            hasAnyValue = true; // Comparables can provide value data
          }
          score += field.weight;
        } else {
          missingFields.push(field.name);
        }
      } else {
        score += field.weight;
      }
    } else {
      missingFields.push(field.name);
    }
  }

  // Check for listing data as alternative source
  const hasListingData = data.listing && (data.listing.price || data.listing.bedrooms);
  
  // Very lenient minimum data requirements:
  // Accept analysis if we have ANY useful data
  const hasMinimumData = hasBasicPropertyInfo || hasListingData || hasAnyValue || hasAnyRental ||
                         // OR if we have at least some data points
                         score >= 25;

  return {
    score: Math.round(score),
    missingFields,
    hasMinimumData
  };
}

// Batch processing with queue
export async function fetchBatchPropertyData(
  addresses: string[],
  options: {
    batchSize?: number;
    delayBetweenBatches?: number;
    onProgress?: (current: number, total: number, address: string) => void;
  } = {}
): Promise<Map<string, RentCastDataResult>> {
  const { 
    batchSize = 5, 
    delayBetweenBatches = 2000,
    onProgress 
  } = options;
  
  const results = new Map<string, RentCastDataResult>();
  
  // Process in batches to avoid rate limiting
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchPromises = batch.map(async (address, idx) => {
      if (onProgress) {
        onProgress(i + idx + 1, addresses.length, address);
      }
      
      const result = await fetchComprehensivePropertyData(address);
      results.set(address, result);
      return result;
    });
    
    await Promise.all(batchPromises);
    
    // Delay between batches if not the last batch
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
}

// Helper to merge RentCast data into a unified format
export function mergeRentCastData(rentcastResult: RentCastDataResult): any {
  const { data } = rentcastResult;
  if (!data) return null;

  const property = data.property || {};
  const value = data.value || {};
  const rental = data.rental || {};
  const listing = data.listing || {};
  const comparables = data.comparables || {};

  return {
    // Basic property info
    address: property.addressLine1 || listing.address,
    city: property.city || listing.city,
    state: property.state || listing.state,
    zipCode: property.zipCode || listing.zipCode,
    
    // Property details
    bedrooms: property.bedrooms || listing.bedrooms,
    bathrooms: property.bathrooms || listing.bathrooms,
    squareFootage: property.squareFootage || listing.squareFootage,
    yearBuilt: property.yearBuilt || listing.yearBuilt,
    lotSize: property.lotSize || listing.lotSize,
    propertyType: property.propertyType || listing.propertyType || 'Single Family',
    
    // Financial data
    price: listing.price || value.value || value.price || comparables.value,
    rentEstimate: rental.rentEstimate || rental.rent,
    rentRangeLow: rental.rentRangeLow,
    rentRangeHigh: rental.rentRangeHigh,
    
    // Comparables
    comparablesValue: comparables.value,
    comparablesCount: comparables.comparables?.length || 0,
    
    // Images
    images: data.images || [],
    
    // Neighborhood
    neighborhood: data.neighborhood,
    
    // Data quality
    dataCompleteness: rentcastResult.completeness
  };
}