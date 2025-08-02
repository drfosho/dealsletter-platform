import { 
  RentCastPropertyDetails, 
  RentCastRentalEstimate, 
  RentCastSaleComps,
  RentCastMarketData,
  CachedPropertyData 
} from '@/types/rentcast';
import { logError } from '@/utils/error-utils';
import PropertyImageService from './property-images';

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
      
      console.log('[RentCast] Property details response:', JSON.stringify(response, null, 2));
      
      // RentCast returns an array, get the first property
      if (!response || response.length === 0) {
        throw new Error('Property not found');
      }
      
      const data = response[0];
      console.log('[RentCast] Property details extracted:', {
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
        lastSaleDate: data.lastSaleDate
      });
      
      // Add property images - enhanced for off-market properties
      const fullAddress = `${data.addressLine1}, ${data.city}, ${data.state} ${data.zipCode}`;
      
      // Get primary image (best available)
      data.primaryImageUrl = PropertyImageService.getPropertyImage(fullAddress, data.propertyType);
      
      // Get multiple images including different angles
      data.images = PropertyImageService.getPropertyImages(fullAddress, 5, data.propertyType);
      
      console.log('[RentCast] Property images added:', {
        primaryImage: data.primaryImageUrl,
        totalImages: data.images?.length,
        hasGoogleMaps: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      });
      
      this.setCache(cacheKey, { data, timestamp: Date.now(), ttl: CACHE_TTL });
      return data;
    } catch (error) {
      logError('RentCast Get Property Details', error);
      throw error;
    }
  }

  // Get rental estimate
  async getRentalEstimate(address: string): Promise<RentCastRentalEstimate> {
    console.log('[RentCast] Getting rental estimate for:', address);
    const cacheKey = `rent:${address}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.rentEstimate) {
      console.log('[RentCast] Using cached rental estimate');
      return cached.rentEstimate;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      console.log('[RentCast] Fetching rental estimate from API:', `/avm/rent/long-term?address=${encodedAddress}`);
      const data = await this.makeRequest<RentCastRentalEstimate>(
        `/avm/rent/long-term?address=${encodedAddress}`
      );
      
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
      
      this.updateCache(cacheKey, { rentEstimate: data });
      return data;
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
      } catch (_listingError) {
        console.log('[RentCast] No active listing found, will use AVM data');
      }
      
      return null;
    } catch (error) {
      console.error('[RentCast] Error getting active listing:', error);
      return null;
    }
  }

  // Get sale comparables
  async getSaleComparables(address: string, _radius: number = 0.5): Promise<RentCastSaleComps> {
    console.log('[RentCast] Getting sale comparables for:', address);
    const cacheKey = `comps:${address}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.saleComps) {
      console.log('[RentCast] Using cached sale comparables');
      return cached.saleComps;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      console.log('[RentCast] Fetching sale comparables from API:', `/avm/value?address=${encodedAddress}`);
      const data = await this.makeRequest<RentCastSaleComps>(
        `/avm/value?address=${encodedAddress}`
      );
      
      console.log('[RentCast] Sale comparables response structure:', {
        hasData: !!data,
        dataType: typeof data,
        isArray: Array.isArray(data),
        keys: data ? Object.keys(data) : [],
        value: (data as any)?.value,
        price: (data as any)?.price,
        fullData: JSON.stringify(data, null, 2)
      });
      
      this.updateCache(cacheKey, { saleComps: data });
      return data;
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

      // Fetch all data in parallel
      const [property, rental, comparables, listing] = await Promise.all([
        this.getPropertyDetails(address),
        this.getRentalEstimate(address).catch(err => {
          console.warn('[RentCast] Rental estimate failed:', err);
          return null;
        }),
        this.getSaleComparables(address).catch(err => {
          console.warn('[RentCast] Sale comparables failed:', err);
          return null;
        }),
        this.getActiveListing(address).catch(err => {
          console.warn('[RentCast] Active listing fetch failed:', err);
          return null;
        })
      ]);

      // Get market data using property's zip code
      const market = await this.getMarketData(property.zipCode).catch(err => {
        console.warn('[RentCast] Market data failed:', err);
        return null;
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
        hasImages: property?.images?.length > 0
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
  private getFromCache(key: string): CachedPropertyData | null {
    const cached = propertyCache.get(key);
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      propertyCache.delete(key);
      return null;
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