// RentCast API Response Types

export interface RentCastPropertyDetails {
  id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  lotSize?: number;
  yearBuilt: number;
  lastSaleDate?: string;
  lastSalePrice?: number;
  taxAssessedValue?: number;
  propertyTaxes?: number;
  owner?: {
    name: string;
    type: string;
  };
  features?: string[];
  zoning?: string;
  subdivision?: string;
  school?: {
    elementary?: string;
    middle?: string;
    high?: string;
  };
  images?: string[]; // Array of image URLs
  primaryImageUrl?: string; // Main property image
  isEstimated?: boolean; // Indicates if property details were estimated from comparables
}

export interface RentCastRentalEstimate {
  rentEstimate: number;
  rentRangeLow: number;
  rentRangeHigh: number;
  confidenceScore: number;
  lastUpdated: string;
  comparables?: RentCastComparable[];
}

export interface RentCastComparable {
  id: string;
  address: string;
  distance: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  rent?: number;
  price?: number;
  soldDate?: string;
  listedDate?: string;
  similarity: number;
  propertyType: string;
}

export interface RentCastSaleComps {
  value: number;
  valueRangeLow: number;
  valueRangeHigh: number;
  latitude?: number;
  longitude?: number;
  comparables: RentCastComparable[];
}

export interface RentCastMarketData {
  id?: string;
  zipCode: string;
  saleData?: {
    lastUpdatedDate: string;
    averagePrice: number;
    medianPrice: number;
    minPrice: number;
    maxPrice: number;
    averagePricePerSquareFoot: number;
    medianPricePerSquareFoot: number;
    averageDaysOnMarket: number;
    medianDaysOnMarket: number;
    totalListings: number;
    newListings: number;
  };
  rentalData?: {
    lastUpdatedDate: string;
    averageRent: number;
    medianRent: number;
    minRent: number;
    maxRent: number;
    averageRentPerSquareFoot: number;
    medianRentPerSquareFoot: number;
    averageDaysOnMarket: number;
    medianDaysOnMarket: number;
    totalListings: number;
    newListings: number;
  };
}

// API Request Types
export interface PropertySearchRequest {
  address: string;
  includeRentEstimates?: boolean;
  includeComparables?: boolean;
  includeMarketData?: boolean;
}

// Enhanced Search Parameters for API v1
export interface EnhancedSearchParams {
  // Location parameters
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  radius?: number; // Search radius in miles
  
  // Property characteristics
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minSqft?: number;
  maxSqft?: number;
  minLotSize?: number;
  maxLotSize?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  
  // Price ranges
  minPrice?: number;
  maxPrice?: number;
  minRent?: number;
  maxRent?: number;
  
  // Property types
  propertyTypes?: string[]; // e.g., ['Single Family', 'Condo', 'Townhouse']
  
  // Additional filters
  hasGarage?: boolean;
  hasPool?: boolean;
  hasBasement?: boolean;
  isWaterfront?: boolean;
  
  // Pagination
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'sqft' | 'beds' | 'baths' | 'yearBuilt' | 'distance';
  sortOrder?: 'asc' | 'desc';
}

// Search Results with pagination info
export interface SearchResults<T> {
  results: T[];
  totalCount: number;
  returnedCount: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface PropertyAnalysisRequest {
  address: string;
  strategy: 'rental' | 'flip' | 'brrrr' | 'airbnb';
  purchasePrice?: number;
  downPayment?: number;
  loanTerms?: {
    interestRate: number;
    loanTerm: number;
    loanType: string;
    points?: number;
  };
  rehabCosts?: number;
  holdingPeriod?: number;
  arv?: number; // After Repair Value for flip strategy
  monthlyRent?: number; // User-specified monthly rent for rental strategies
  renovationLevel?: 'cosmetic' | 'moderate' | 'extensive' | 'gut'; // For calculating rehab costs
  units?: number; // Number of units for multi-family properties
  rentPerUnit?: number; // Rent per unit for multi-family properties
}

// Cache Types
export interface CachedPropertyData {
  data: RentCastPropertyDetails;
  rentEstimate?: RentCastRentalEstimate;
  saleComps?: RentCastSaleComps;
  marketData?: RentCastMarketData;
  listing?: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Error Types
export interface RentCastError {
  code: string;
  message: string;
  details?: unknown;
}