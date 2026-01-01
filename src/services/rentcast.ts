import { 
  RentCastPropertyDetails, 
  RentCastRentalEstimate, 
  RentCastSaleComps,
  RentCastMarketData,
  CachedPropertyData,
  EnhancedSearchParams,
  SearchResults
} from '@/types/rentcast';
import { logError } from '@/utils/error-utils';
import PropertyPhotoService from './property-photos';

// In-memory cache for development (consider Redis for production)
const propertyCache = new Map<string, CachedPropertyData>();

// Cache TTL: 24 hours for property data
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Rate limiting
let requestCount = 0;
let resetTime = Date.now() + 60000; // Reset every minute
const MAX_REQUESTS_PER_MINUTE = 30;

class RentCastService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.RENTCAST_API_KEY || '';
    this.baseUrl = process.env.RENTCAST_API_URL || 'https://api.rentcast.io/v1';
    
    if (!this.apiKey) {
      logError('RentCast Service', new Error('RENTCAST_API_KEY is not configured'));
    }
  }

  // Normalize property data to handle different field name variations
  private normalizePropertyData(data: any, comparables?: any[]): RentCastPropertyDetails {
    // Map various possible field names to our expected structure
    const normalized: any = {
      // Address fields
      id: data.id || data._id || data.propertyId,
      addressLine1: data.addressLine1 || data.address || data.streetAddress || data.street,
      addressLine2: data.addressLine2 || data.address2,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode || data.zip || data.postalCode,
      county: data.county,
      latitude: data.latitude || data.lat,
      longitude: data.longitude || data.lng || data.lon,
      
      // Property details - handle various field name possibilities
      propertyType: data.propertyType || data.type || data.property_type || data.propType || 'Unknown',
      bedrooms: data.bedrooms || data.beds || data.numBedrooms || data.numberOfBedrooms || 0,
      bathrooms: data.bathrooms || data.baths || data.numBathrooms || data.numberOfBathrooms || 0,
      squareFootage: data.squareFootage || data.sqft || data.square_footage || data.livingArea || data.area || 0,
      lotSize: data.lotSize || data.lot_size || data.lotSquareFootage,
      yearBuilt: data.yearBuilt || data.year_built || data.builtYear || data.yearConstructed || 0,
      
      // Sale information
      lastSaleDate: data.lastSaleDate || data.last_sale_date || data.soldDate,
      lastSalePrice: data.lastSalePrice || data.last_sale_price || data.soldPrice || data.salePrice,
      
      // Tax information
      taxAssessedValue: data.taxAssessedValue || data.tax_assessed_value || data.assessedValue,
      propertyTaxes: data.propertyTaxes || data.property_taxes || data.taxes,
      
      // Owner information
      owner: data.owner,
      
      // Additional fields
      features: data.features || [],
      zoning: data.zoning,
      subdivision: data.subdivision,
      school: data.school || data.schools,
      images: data.images || [],
      primaryImageUrl: data.primaryImageUrl || data.primaryImage || data.mainImage,
      
      // Flag to indicate if data is estimated
      isEstimated: false
    };

    // Check if we have incomplete data (all zeros)
    const hasIncompleteData = normalized.bedrooms === 0 && 
                             normalized.bathrooms === 0 && 
                             normalized.squareFootage === 0 &&
                             normalized.propertyType === 'Unknown';

    // If we have incomplete data and comparables, use them to estimate
    if (hasIncompleteData && comparables && comparables.length > 0) {
      console.log('[RentCast] Property has incomplete data, using comparables to estimate');
      
      // Filter out comparables with missing data
      const validComps = comparables.filter(comp => 
        comp.bedrooms > 0 && comp.propertyType && comp.propertyType !== 'Unknown'
      );
      
      if (validComps.length > 0) {
        // Use the closest comparable (first one) or average of top 3
        const topComps = validComps.slice(0, 3);
        
        // For bedrooms and bathrooms, use the most common value
        const bedroomCounts = topComps.map(c => c.bedrooms);
        const bathroomCounts = topComps.map(c => c.bathrooms || 0);
        
        normalized.bedrooms = Math.round(bedroomCounts.reduce((a, b) => a + b, 0) / bedroomCounts.length);
        normalized.bathrooms = Math.round(bathroomCounts.reduce((a, b) => a + b, 0) / bathroomCounts.length * 2) / 2; // Round to nearest 0.5
        
        // For square footage, use average
        const sqftValues = topComps.filter(c => c.squareFootage > 0).map(c => c.squareFootage);
        if (sqftValues.length > 0) {
          normalized.squareFootage = Math.round(sqftValues.reduce((a, b) => a + b, 0) / sqftValues.length);
        }
        
        // For property type, use the most common
        const propertyTypes = topComps.map(c => c.propertyType).filter(t => t && t !== 'Unknown');
        if (propertyTypes.length > 0) {
          // Find most common property type
          const typeCount: Record<string, number> = {};
          propertyTypes.forEach(type => {
            typeCount[type] = (typeCount[type] || 0) + 1;
          });
          normalized.propertyType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0][0];
        }
        
        // For year built, use average if available
        const yearValues = topComps.filter(c => c.yearBuilt > 0).map(c => c.yearBuilt);
        if (yearValues.length > 0) {
          normalized.yearBuilt = Math.round(yearValues.reduce((a, b) => a + b, 0) / yearValues.length);
        }
        
        // Mark as estimated
        normalized.isEstimated = true;
        
        console.log('[RentCast] Estimated property details from comparables:', {
          bedrooms: normalized.bedrooms,
          bathrooms: normalized.bathrooms,
          squareFootage: normalized.squareFootage,
          propertyType: normalized.propertyType,
          yearBuilt: normalized.yearBuilt,
          basedOn: `${validComps.length} comparable properties`
        });
      }
    }

    // Log the normalization process
    console.log('[RentCast] Data normalization:', {
      original: {
        bedrooms: data.bedrooms || data.beds || data.numBedrooms,
        propertyType: data.propertyType || data.type || data.property_type,
        squareFootage: data.squareFootage || data.sqft || data.square_footage
      },
      normalized: {
        bedrooms: normalized.bedrooms,
        bathrooms: normalized.bathrooms,
        propertyType: normalized.propertyType,
        squareFootage: normalized.squareFootage,
        isEstimated: normalized.isEstimated
      }
    });

    return normalized;
  }

  // Rate limiting check
  private checkRateLimit(): void {
    const now = Date.now();
    if (now > resetTime) {
      requestCount = 0;
      resetTime = now + 60000;
    }
    
    if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    requestCount++;
  }

  // Generic API request method
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    this.checkRateLimit();
    
    if (!this.apiKey) {
      throw new Error('RentCast API key is not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'X-Api-Key': this.apiKey,
          ...options?.headers,
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { message: responseText };
        }
        console.error(`RentCast API error ${endpoint}:`, response.status, error);
        throw new Error(error.message || `RentCast API error: ${response.status}`);
      }

      try {
        return JSON.parse(responseText);
      } catch {
        console.error('Invalid JSON from RentCast:', responseText);
        throw new Error('Invalid JSON response from RentCast API');
      }
    } catch (error) {
      logError('RentCast API Request', error);
      throw error;
    }
  }

  // Get property details by address
  async getPropertyDetails(address: string): Promise<RentCastPropertyDetails> {
    console.log('[RentCast] Getting property details for:', address);
    const cacheKey = `details:${address}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.data) {
      console.log('[RentCast] Using cached property details');
      return cached.data;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      console.log('[RentCast] Fetching property details from API:', `/properties?address=${encodedAddress}`);
      const response = await this.makeRequest<RentCastPropertyDetails[]>(
        `/properties?address=${encodedAddress}`
      );
      
      console.log('[RentCast] Property details RAW response:', response);
      console.log('[RentCast] Response type:', typeof response);
      console.log('[RentCast] Is array?:', Array.isArray(response));
      console.log('[RentCast] Response length:', Array.isArray(response) ? response.length : 'N/A');
      
      // RentCast returns an array, get the first property
      if (!response || (Array.isArray(response) && response.length === 0)) {
        throw new Error('Property not found');
      }
      
      const rawData = Array.isArray(response) ? response[0] : response;
      
      // CRITICAL DEBUG: Log ALL fields in the response to identify field name mismatches
      console.log('[RentCast] ALL fields in response object:');
      console.log('[RentCast] Object keys:', Object.keys(rawData));
      console.log('[RentCast] Full object:', JSON.stringify(rawData, null, 2));
      
      // Check if we have incomplete data
      const hasIncompleteData = rawData.bedrooms === 0 && 
                               rawData.bathrooms === 0 && 
                               rawData.squareFootage === 0;
      
      let comparables: any[] | undefined;
      
      // If we have incomplete data, try to get rental comparables first
      if (hasIncompleteData) {
        console.log('[RentCast] Property has incomplete data, fetching rental comparables for estimation');
        try {
          const rentalData = await this.getRentalEstimate(address);
          if (rentalData && (rentalData as any).comparables) {
            comparables = (rentalData as any).comparables;
            console.log('[RentCast] Found', comparables?.length || 0, 'rental comparables for estimation');
          }
        } catch (error) {
          console.log('[RentCast] Could not fetch rental comparables for estimation:', error);
        }
      }
      
      // Normalize the data to ensure consistent field names and estimate if needed
      const data = this.normalizePropertyData(rawData, comparables);
      
      console.log('[RentCast] Property details after normalization:', {
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        squareFootage: data.squareFootage,
        yearBuilt: data.yearBuilt,
        propertyType: data.propertyType,
        lastSalePrice: data.lastSalePrice,
        lastSaleDate: data.lastSaleDate,
        isEstimated: (data as any).isEstimated
      });
      
      // Add property images - enhanced for off-market properties
      const fullAddress = `${data.addressLine1}, ${data.city}, ${data.state} ${data.zipCode}`;
      
      console.log('[RentCast] Attempting to fetch property images for:', fullAddress);
      console.log('[RentCast] Google Maps API Key available:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
      
      // Get photos using the enhanced photo service
      const photos = await PropertyPhotoService.getPropertyPhotos(
        fullAddress,
        data.propertyType,
        data.images, // Pass any existing RentCast photos
        5
      );
      
      data.images = photos;
      data.primaryImageUrl = photos[0] || PropertyPhotoService.getDefaultPlaceholder();
      
      console.log('[RentCast] Property images added:', {
        address: fullAddress,
        hasStreetNumber: /^\d+\s+/.test(data.addressLine1?.trim() || ''),
        primaryImage: data.primaryImageUrl,
        totalImages: data.images?.length,
        imagesFound: data.images?.length || 0,
        imageURLs: data.images,
        hasGoogleMaps: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        isPlaceholder: data.primaryImageUrl?.includes('No Image Available')
      });
      
      this.setCache(cacheKey, { data, timestamp: Date.now(), ttl: CACHE_TTL });
      return data;
    } catch (error) {
      logError('RentCast Get Property Details', error);
      throw error;
    }
  }

  // Build query string from enhanced search params
  private buildSearchQuery(params: EnhancedSearchParams): string {
    const queryParams = new URLSearchParams();
    
    // Location parameters
    if (params.city) queryParams.append('city', params.city);
    if (params.state) queryParams.append('state', params.state);
    if (params.zipCode) queryParams.append('zipCode', params.zipCode);
    if (params.county) queryParams.append('county', params.county);
    if (params.radius) queryParams.append('radius', params.radius.toString());
    
    // Property characteristics
    if (params.minBeds !== undefined) queryParams.append('minBeds', params.minBeds.toString());
    if (params.maxBeds !== undefined) queryParams.append('maxBeds', params.maxBeds.toString());
    if (params.minBaths !== undefined) queryParams.append('minBaths', params.minBaths.toString());
    if (params.maxBaths !== undefined) queryParams.append('maxBaths', params.maxBaths.toString());
    if (params.minSqft !== undefined) queryParams.append('minSqft', params.minSqft.toString());
    if (params.maxSqft !== undefined) queryParams.append('maxSqft', params.maxSqft.toString());
    if (params.minLotSize !== undefined) queryParams.append('minLotSize', params.minLotSize.toString());
    if (params.maxLotSize !== undefined) queryParams.append('maxLotSize', params.maxLotSize.toString());
    if (params.minYearBuilt !== undefined) queryParams.append('minYearBuilt', params.minYearBuilt.toString());
    if (params.maxYearBuilt !== undefined) queryParams.append('maxYearBuilt', params.maxYearBuilt.toString());
    
    // Price ranges
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.minRent !== undefined) queryParams.append('minRent', params.minRent.toString());
    if (params.maxRent !== undefined) queryParams.append('maxRent', params.maxRent.toString());
    
    // Property types
    if (params.propertyTypes && params.propertyTypes.length > 0) {
      queryParams.append('propertyTypes', params.propertyTypes.join(','));
    }
    
    // Additional filters
    if (params.hasGarage !== undefined) queryParams.append('hasGarage', params.hasGarage.toString());
    if (params.hasPool !== undefined) queryParams.append('hasPool', params.hasPool.toString());
    if (params.hasBasement !== undefined) queryParams.append('hasBasement', params.hasBasement.toString());
    if (params.isWaterfront !== undefined) queryParams.append('isWaterfront', params.isWaterfront.toString());
    
    // Pagination
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    return queryParams.toString();
  }

  // Enhanced property search with filters
  async searchProperties(params: EnhancedSearchParams): Promise<SearchResults<RentCastPropertyDetails>> {
    console.log('[RentCast] Enhanced property search with params:', params);
    
    const queryString = this.buildSearchQuery(params);
    const cacheKey = `search:${queryString}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.searchResults) {
      console.log('[RentCast] Using cached search results');
      return cached.searchResults as SearchResults<RentCastPropertyDetails>;
    }
    
    try {
      console.log('[RentCast] Fetching properties with enhanced search:', `/properties?${queryString}`);
      
      // Make the API request
      const response = await this.makeRequest<any>(
        `/properties?${queryString}`
      );
      
      // Handle response format - RentCast may return array directly or wrapped in object
      let results: RentCastPropertyDetails[];
      let totalCount: number;
      
      if (Array.isArray(response)) {
        results = response.map(item => this.normalizePropertyData(item));
        totalCount = results.length; // If no pagination info, use array length
      } else if (response.results && Array.isArray(response.results)) {
        results = response.results.map((item: any) => this.normalizePropertyData(item));
        totalCount = response.totalCount || response.total || results.length;
      } else {
        results = [];
        totalCount = 0;
      }
      
      // Add images to each property
      for (const property of results) {
        const fullAddress = `${property.addressLine1}, ${property.city}, ${property.state} ${property.zipCode}`;
        const photos = await PropertyPhotoService.getPropertyPhotos(
          fullAddress,
          property.propertyType,
          property.images,
          3
        );
        property.images = photos;
        property.primaryImageUrl = photos[0] || PropertyPhotoService.getDefaultPlaceholder();
      }
      
      const searchResults: SearchResults<RentCastPropertyDetails> = {
        results,
        totalCount,
        returnedCount: results.length,
        offset: params.offset || 0,
        limit: params.limit || results.length,
        hasMore: totalCount > (params.offset || 0) + results.length
      };
      
      console.log('[RentCast] Search results:', {
        totalFound: totalCount,
        returned: results.length,
        hasMore: searchResults.hasMore
      });
      
      // Cache the results
      this.setCache(cacheKey, {
        searchResults,
        timestamp: Date.now(),
        ttl: CACHE_TTL
      } as any);
      
      return searchResults;
    } catch (error) {
      logError('RentCast Enhanced Search', error);
      throw error;
    }
  }

  // Get rental estimate with automatic attribute lookup
  async getRentalEstimate(address: string, autoLookupAttributes: boolean = true): Promise<RentCastRentalEstimate> {
    console.log('[RentCast] Getting rental estimate for:', address);
    const cacheKey = `rent:${address}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.rentEstimate) {
      console.log('[RentCast] Using cached rental estimate');
      return cached.rentEstimate;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      let endpoint = `/avm/rent/long-term?address=${encodedAddress}`;
      
      // Add automatic attribute lookup parameter if enabled (new feature)
      if (autoLookupAttributes) {
        endpoint += '&propertyAttributes=auto';
        console.log('[RentCast] Using automatic attribute lookup for AVM');
      }
      
      console.log('[RentCast] Fetching rental estimate from API:', endpoint);
      const data = await this.makeRequest<RentCastRentalEstimate>(endpoint);
      
      console.log('[RentCast] Rental estimate response structure:', {
        hasData: !!data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        keys: data ? Object.keys(data) : [],
        rent: (data as any)?.rent,
        rentEstimate: (data as any)?.rentEstimate,
        price: (data as any)?.price,
        fullData: JSON.stringify(data, null, 2)
      });

      // Normalize the response to ensure consistent field names
      // RentCast API returns 'rent' but our types expect 'rentEstimate'
      const normalizedData: RentCastRentalEstimate = {
        rentEstimate: (data as any)?.rent || (data as any)?.rentEstimate || (data as any)?.price || 0,
        rentRangeLow: (data as any)?.rentRangeLow || 0,
        rentRangeHigh: (data as any)?.rentRangeHigh || 0,
        confidenceScore: (data as any)?.confidenceScore || 0,
        lastUpdated: (data as any)?.lastUpdated || new Date().toISOString(),
        comparables: (data as any)?.comparables
      };

      console.log('[RentCast] Normalized rental estimate:', normalizedData);

      this.updateCache(cacheKey, { rentEstimate: normalizedData });
      return normalizedData;
    } catch (error) {
      console.error('[RentCast] Error getting rental estimate:', error);
      logError('RentCast Get Rental Estimate', error);
      throw error;
    }
  }

  // Get active listing data (for on-market properties)
  async getActiveListing(address: string): Promise<any> {
    console.log('[RentCast] Getting active listing for:', address);
    const cacheKey = `listing:${address}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.listing) {
      console.log('[RentCast] Using cached listing data');
      return cached.listing;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      // Try to get listing data - RentCast may have a listings endpoint
      console.log('[RentCast] Fetching active listing from API');
      
      // First, try the listings/sale endpoint if available
      try {
        const listingData = await this.makeRequest<any>(
          `/listings/sale?address=${encodedAddress}`
        );
        
        if (listingData && listingData.price) {
          console.log('[RentCast] Found active listing with price:', listingData.price);
          this.updateCache(cacheKey, { listing: listingData });
          return listingData;
        }
      } catch {
        console.log('[RentCast] No active listing found, will use AVM data');
      }
      
      return undefined;
    } catch (error) {
      console.error('[RentCast] Error getting active listing:', error);
      return undefined;
    }
  }

  // Get sale comparables with automatic attribute lookup
  async getSaleComparables(address: string, radius: number = 0.5, autoLookupAttributes: boolean = true): Promise<RentCastSaleComps> {
    console.log('[RentCast] Getting sale comparables for:', address);
    const cacheKey = `comps:${address}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.saleComps) {
      console.log('[RentCast] Using cached sale comparables');
      return cached.saleComps;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      let endpoint = `/avm/value?address=${encodedAddress}`;
      
      // Add radius parameter if specified
      if (radius && radius !== 0.5) {
        endpoint += `&radius=${radius}`;
      }
      
      // Add automatic attribute lookup parameter if enabled (new feature)
      if (autoLookupAttributes) {
        endpoint += '&propertyAttributes=auto';
        console.log('[RentCast] Using automatic attribute lookup for AVM');
      }
      
      console.log('[RentCast] Fetching sale comparables from API:', endpoint);
      const data = await this.makeRequest<RentCastSaleComps>(endpoint);
      
      // CRITICAL: Normalize the API response to match expected structure
      // RentCast API returns 'price' but we expect 'value'
      const normalizedData: RentCastSaleComps = {
        value: (data as any).price || (data as any).value || 0,
        valueRangeLow: (data as any).priceRangeLow || (data as any).valueRangeLow || 0,
        valueRangeHigh: (data as any).priceRangeHigh || (data as any).valueRangeHigh || 0,
        latitude: (data as any).latitude,
        longitude: (data as any).longitude,
        comparables: (data as any).comparables || []
      };

      console.log('\n=== RENTCAST AVM/COMPARABLES API RESPONSE ===');
      console.log('Endpoint called:', endpoint);
      console.log('Raw response keys:', data ? Object.keys(data) : 'null');
      console.log('Raw price field:', (data as any)?.price);
      console.log('Normalized value:', normalizedData.value);
      console.log('Value range:', {
        low: normalizedData.valueRangeLow,
        high: normalizedData.valueRangeHigh
      });
      console.log('Comparables count:', normalizedData.comparables?.length || 0);
      console.log('=== END AVM RESPONSE ===\n');

      this.updateCache(cacheKey, { saleComps: normalizedData });
      return normalizedData;
    } catch (error) {
      console.error('[RentCast] Error getting sale comparables:', error);
      logError('RentCast Get Sale Comparables', error);
      throw error;
    }
  }

  // Get market data for area
  async getMarketData(zipCode: string): Promise<RentCastMarketData> {
    console.log('[RentCast] Getting market data for zip code:', zipCode);
    const cacheKey = `market:${zipCode}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.marketData) {
      console.log('[RentCast] Using cached market data');
      return cached.marketData;
    }

    try {
      console.log('[RentCast] Fetching market data from API:', `/markets?zipCode=${zipCode}`);
      const data = await this.makeRequest<RentCastMarketData>(
        `/markets?zipCode=${zipCode}`
      );
      
      console.log('[RentCast] Market data response:', JSON.stringify(data, null, 2));
      
      this.updateCache(cacheKey, { marketData: data });
      return data;
    } catch (error) {
      console.error('[RentCast] Error getting market data:', error);
      logError('RentCast Get Market Data', error);
      throw error;
    }
  }

  // Get comprehensive property data
  async getComprehensivePropertyData(address: string) {
    try {
      // Check if we have all data cached
      const cacheKey = `comprehensive:${address}`;
      const cached = this.getFromCache(cacheKey);
      
      if (cached && cached.data && cached.rentEstimate && cached.saleComps && cached.marketData) {
        return {
          property: cached.data,
          rental: cached.rentEstimate,
          comparables: cached.saleComps,
          market: cached.marketData,
          listing: cached.listing
        };
      }

      // Fetch all data in parallel with automatic attribute lookup enabled
      const [property, rental, comparables, listing] = await Promise.all([
        this.getPropertyDetails(address),
        this.getRentalEstimate(address, true).catch(err => {
          console.warn('[RentCast] Rental estimate failed:', err);
          return undefined;
        }),
        this.getSaleComparables(address, 0.5, true).catch(err => {
          console.warn('[RentCast] Sale comparables failed:', err);
          return undefined;
        }),
        this.getActiveListing(address).catch(err => {
          console.warn('[RentCast] Active listing fetch failed:', err);
          return undefined;
        })
      ]);

      // Get market data using property's zip code
      const market = await this.getMarketData(property.zipCode).catch(err => {
        console.warn('[RentCast] Market data failed:', err);
        return undefined;
      });

      const comprehensiveData = {
        property,
        rental,
        comparables,
        market,
        listing
      };
      
      console.log('[RentCast] Comprehensive data summary:', {
        hasListing: !!listing,
        listingPrice: listing?.price || listing?.listPrice,
        avmValue: comparables?.value,
        hasImages: (property?.images?.length ?? 0) > 0
      });

      // Cache the comprehensive data
      this.setCache(cacheKey, {
        data: property,
        rentEstimate: rental,
        saleComps: comparables,
        marketData: market,
        listing: listing,
        timestamp: Date.now(),
        ttl: CACHE_TTL,
      });

      return comprehensiveData;
    } catch (error) {
      logError('RentCast Get Comprehensive Data', error);
      throw error;
    }
  }

  // Cache management
  private getFromCache(key: string): CachedPropertyData | undefined {
    const cached = propertyCache.get(key);
    
    if (!cached) return undefined;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      propertyCache.delete(key);
      return undefined;
    }
    
    return cached;
  }

  private setCache(key: string, data: CachedPropertyData): void {
    propertyCache.set(key, data);
  }

  private updateCache(key: string, updates: Partial<CachedPropertyData>): void {
    const existing = propertyCache.get(key) || {
      timestamp: Date.now(),
      ttl: CACHE_TTL,
    };
    
    propertyCache.set(key, {
      ...existing,
      ...updates,
      timestamp: Date.now(),
    } as CachedPropertyData);
  }

  // Search for rental properties with enhanced filters
  async searchRentals(params: EnhancedSearchParams): Promise<SearchResults<any>> {
    console.log('[RentCast] Enhanced rental search with params:', params);
    
    const queryString = this.buildSearchQuery(params);
    const cacheKey = `rentals:${queryString}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.searchResults) {
      console.log('[RentCast] Using cached rental search results');
      return cached.searchResults as SearchResults<any>;
    }
    
    try {
      console.log('[RentCast] Fetching rentals with enhanced search:', `/listings/rental?${queryString}`);
      
      const response = await this.makeRequest<any>(
        `/listings/rental?${queryString}`
      );
      
      // Handle response format
      let results: any[];
      let totalCount: number;
      
      if (Array.isArray(response)) {
        results = response;
        totalCount = results.length;
      } else if (response.results && Array.isArray(response.results)) {
        results = response.results;
        totalCount = response.totalCount || response.total || results.length;
      } else {
        results = [];
        totalCount = 0;
      }
      
      const searchResults: SearchResults<any> = {
        results,
        totalCount,
        returnedCount: results.length,
        offset: params.offset || 0,
        limit: params.limit || results.length,
        hasMore: totalCount > (params.offset || 0) + results.length
      };
      
      console.log('[RentCast] Rental search results:', {
        totalFound: totalCount,
        returned: results.length,
        hasMore: searchResults.hasMore
      });
      
      // Cache the results
      this.setCache(cacheKey, {
        searchResults,
        timestamp: Date.now(),
        ttl: CACHE_TTL
      } as any);
      
      return searchResults;
    } catch (error) {
      logError('RentCast Rental Search', error);
      throw error;
    }
  }

  // Search for sale listings with enhanced filters
  async searchSales(params: EnhancedSearchParams): Promise<SearchResults<any>> {
    console.log('[RentCast] Enhanced sale search with params:', params);
    
    const queryString = this.buildSearchQuery(params);
    const cacheKey = `sales:${queryString}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.searchResults) {
      console.log('[RentCast] Using cached sale search results');
      return cached.searchResults as SearchResults<any>;
    }
    
    try {
      console.log('[RentCast] Fetching sales with enhanced search:', `/listings/sale?${queryString}`);
      
      const response = await this.makeRequest<any>(
        `/listings/sale?${queryString}`
      );
      
      // Handle response format
      let results: any[];
      let totalCount: number;
      
      if (Array.isArray(response)) {
        results = response;
        totalCount = results.length;
      } else if (response.results && Array.isArray(response.results)) {
        results = response.results;
        totalCount = response.totalCount || response.total || results.length;
      } else {
        results = [];
        totalCount = 0;
      }
      
      const searchResults: SearchResults<any> = {
        results,
        totalCount,
        returnedCount: results.length,
        offset: params.offset || 0,
        limit: params.limit || results.length,
        hasMore: totalCount > (params.offset || 0) + results.length
      };
      
      console.log('[RentCast] Sale search results:', {
        totalFound: totalCount,
        returned: results.length,
        hasMore: searchResults.hasMore
      });
      
      // Cache the results
      this.setCache(cacheKey, {
        searchResults,
        timestamp: Date.now(),
        ttl: CACHE_TTL
      } as any);
      
      return searchResults;
    } catch (error) {
      logError('RentCast Sale Search', error);
      throw error;
    }
  }

  // Clear cache for a specific address or all
  clearCache(address?: string): void {
    if (address) {
      const keysToDelete = Array.from(propertyCache.keys()).filter(key => 
        key.includes(address)
      );
      keysToDelete.forEach(key => propertyCache.delete(key));
    } else {
      propertyCache.clear();
    }
  }
}

// Export singleton instance
export const rentCastService = new RentCastService();