import { 
  RentCastPropertyDetails, 
  RentCastRentalEstimate, 
  RentCastSaleComps,
  RentCastMarketData,
  CachedPropertyData 
} from '@/types/rentcast';
import { logError } from '@/utils/error-utils';

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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `RentCast API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logError('RentCast API Request', error);
      throw error;
    }
  }

  // Get property details by address
  async getPropertyDetails(address: string): Promise<RentCastPropertyDetails> {
    const cacheKey = `details:${address}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.data) {
      return cached.data;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await this.makeRequest<RentCastPropertyDetails[]>(
        `/properties?address=${encodedAddress}`
      );
      
      // RentCast returns an array, get the first property
      if (!response || response.length === 0) {
        throw new Error('Property not found');
      }
      
      const data = response[0];
      this.setCache(cacheKey, { data, timestamp: Date.now(), ttl: CACHE_TTL });
      return data;
    } catch (error) {
      logError('RentCast Get Property Details', error);
      throw error;
    }
  }

  // Get rental estimate
  async getRentalEstimate(address: string): Promise<RentCastRentalEstimate> {
    const cacheKey = `rent:${address}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.rentEstimate) {
      return cached.rentEstimate;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const data = await this.makeRequest<RentCastRentalEstimate>(
        `/avm/rent/long-term?address=${encodedAddress}`
      );
      
      this.updateCache(cacheKey, { rentEstimate: data });
      return data;
    } catch (error) {
      logError('RentCast Get Rental Estimate', error);
      throw error;
    }
  }

  // Get sale comparables
  async getSaleComparables(address: string, _radius: number = 0.5): Promise<RentCastSaleComps> {
    const cacheKey = `comps:${address}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.saleComps) {
      return cached.saleComps;
    }

    try {
      const encodedAddress = encodeURIComponent(address);
      const data = await this.makeRequest<RentCastSaleComps>(
        `/avm/value?address=${encodedAddress}`
      );
      
      this.updateCache(cacheKey, { saleComps: data });
      return data;
    } catch (error) {
      logError('RentCast Get Sale Comparables', error);
      throw error;
    }
  }

  // Get market data for area
  async getMarketData(zipCode: string): Promise<RentCastMarketData> {
    const cacheKey = `market:${zipCode}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached?.marketData) {
      return cached.marketData;
    }

    try {
      const data = await this.makeRequest<RentCastMarketData>(
        `/markets?zipCode=${zipCode}`
      );
      
      this.updateCache(cacheKey, { marketData: data });
      return data;
    } catch (error) {
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
        };
      }

      // Fetch all data in parallel
      const [property, rental, comparables] = await Promise.all([
        this.getPropertyDetails(address),
        this.getRentalEstimate(address),
        this.getSaleComparables(address),
      ]);

      // Get market data using property's zip code
      const market = await this.getMarketData(property.zipCode);

      const comprehensiveData = {
        property,
        rental,
        comparables,
        market,
      };

      // Cache the comprehensive data
      this.setCache(cacheKey, {
        data: property,
        rentEstimate: rental,
        saleComps: comparables,
        marketData: market,
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