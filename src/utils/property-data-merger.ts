/**
 * Property Data Merger
 * Combines scraped data from Zillow/LoopNet with RentCast API data
 * Priority: Scraped Data > RentCast API > Estimated/Default Values
 */

import { fetchComprehensivePropertyData } from './rentcast-fetcher';

export interface DataSource {
  field: string;
  value: any;
  source: 'scraped' | 'rentcast' | 'estimated' | 'default';
  confidence: 'high' | 'medium' | 'low';
  timestamp?: Date;
}

export interface MergedPropertyData {
  // Basic Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  
  // Property Details
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  stories?: number;
  garage?: boolean;
  pool?: boolean;
  
  // Financial Data
  price: number;
  listingPrice?: number;
  askingPrice?: number;
  avm?: number;
  pricePerSqFt?: number;
  monthlyRent?: number;
  rentEstimate?: number;
  rentRangeLow?: number;
  rentRangeHigh?: number;
  estimatedRehab?: number;
  
  // Investment Metrics
  capRate?: number;
  grossYield?: number;
  cashOnCashReturn?: number;
  noi?: number;
  
  // Tax & Fees
  propertyTaxes?: number;
  taxAssessedValue?: number;
  hoaFees?: number;
  insurance?: number;
  
  // Market Context
  comparables?: any[];
  comparablesCount?: number;
  comparablesAvgPrice?: number;
  daysOnMarket?: number;
  listingStatus?: string;
  
  // Additional Data
  description?: string;
  highlights?: string[];
  images: string[];
  schools?: any[];
  neighborhood?: any;
  zoning?: string;
  
  // Metadata
  dataSources: Record<string, DataSource>;
  dataCompleteness: {
    score: number;
    missingFields: string[];
    sources: {
      scraped: number;
      rentcast: number;
      estimated: number;
    };
  };
  lastUpdated: Date;
}

/**
 * Merge scraped property data with RentCast API data
 */
export async function mergePropertyData(
  scrapedData: any,
  address: string,
  options: {
    includeRentCast?: boolean;
    includeEstimates?: boolean;
  } = {}
): Promise<MergedPropertyData> {
  const { includeRentCast = true, includeEstimates = true } = options;
  
  console.log('[DataMerger] Starting property data merge for:', address);
  
  // Initialize merged data object
  const merged: MergedPropertyData = {
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'Single Family',
    price: 0,
    images: [],
    dataSources: {},
    dataCompleteness: {
      score: 0,
      missingFields: [],
      sources: {
        scraped: 0,
        rentcast: 0,
        estimated: 0
      }
    },
    lastUpdated: new Date()
  };

  // Step 1: Apply scraped data (highest priority)
  if (scrapedData) {
    applyScrapedData(merged, scrapedData);
  }

  // Step 2: Fetch and apply RentCast data if enabled
  let rentcastData: any = null;
  if (includeRentCast && address) {
    try {
      console.log('[DataMerger] Fetching RentCast data...');
      const rentcastResult = await fetchComprehensivePropertyData(address, {
        retryAttempts: 2,
        includeImages: !merged.images || merged.images.length === 0
      });
      
      if (rentcastResult.success || rentcastResult.completeness.hasMinimumData) {
        rentcastData = rentcastResult.data;
        applyRentCastData(merged, rentcastData);
      }
    } catch (error) {
      console.error('[DataMerger] RentCast fetch failed:', error);
    }
  }

  // Step 3: Apply estimates for missing data if enabled
  if (includeEstimates) {
    applyEstimatedData(merged);
  }

  // Step 4: Calculate derived metrics
  calculateDerivedMetrics(merged);

  // Step 5: Calculate data completeness
  calculateDataCompleteness(merged);

  console.log('[DataMerger] Merge complete. Data completeness:', merged.dataCompleteness.score + '%');
  
  return merged;
}

/**
 * Apply scraped data to merged object (highest priority)
 */
function applyScrapedData(merged: MergedPropertyData, scraped: any): void {
  // Basic Information
  setFieldWithSource(merged, 'address', scraped.address, 'scraped', 'high');
  setFieldWithSource(merged, 'city', scraped.city, 'scraped', 'high');
  setFieldWithSource(merged, 'state', scraped.state, 'scraped', 'high');
  setFieldWithSource(merged, 'zipCode', scraped.zipCode || scraped.zip, 'scraped', 'high');
  setFieldWithSource(merged, 'latitude', scraped.latitude, 'scraped', 'high');
  setFieldWithSource(merged, 'longitude', scraped.longitude, 'scraped', 'high');
  
  // Property Details
  setFieldWithSource(merged, 'propertyType', scraped.propertyType || scraped.homeType, 'scraped', 'high');
  setFieldWithSource(merged, 'bedrooms', scraped.bedrooms, 'scraped', 'high');
  setFieldWithSource(merged, 'bathrooms', scraped.bathrooms, 'scraped', 'high');
  setFieldWithSource(merged, 'squareFootage', scraped.squareFootage || scraped.livingArea || scraped.buildingSize, 'scraped', 'high');
  setFieldWithSource(merged, 'lotSize', scraped.lotSize, 'scraped', 'high');
  setFieldWithSource(merged, 'yearBuilt', scraped.yearBuilt, 'scraped', 'high');
  
  // Financial Data - Listing price takes priority
  if (scraped.price) {
    setFieldWithSource(merged, 'price', scraped.price, 'scraped', 'high');
    setFieldWithSource(merged, 'listingPrice', scraped.price, 'scraped', 'high');
  }
  if (scraped.askingPrice) {
    setFieldWithSource(merged, 'askingPrice', scraped.askingPrice, 'scraped', 'high');
  }
  
  // Rental data from Zillow
  if (scraped.monthlyRent || scraped.rentZestimate || scraped.rentEstimate) {
    setFieldWithSource(merged, 'monthlyRent', scraped.monthlyRent || scraped.rentZestimate || scraped.rentEstimate, 'scraped', 'medium');
  }
  
  // Investment metrics from LoopNet
  setFieldWithSource(merged, 'capRate', scraped.capRate, 'scraped', 'high');
  setFieldWithSource(merged, 'noi', scraped.noi, 'scraped', 'high');
  
  // Tax & Fees
  setFieldWithSource(merged, 'propertyTaxes', scraped.propertyTaxes || scraped.propertyTaxRate, 'scraped', 'high');
  setFieldWithSource(merged, 'taxAssessedValue', scraped.taxAssessedValue, 'scraped', 'high');
  setFieldWithSource(merged, 'hoaFees', scraped.hoaFee || scraped.monthlyHoaFee, 'scraped', 'high');
  
  // Market Context
  setFieldWithSource(merged, 'daysOnMarket', scraped.daysOnMarket || scraped.daysOnZillow, 'scraped', 'high');
  setFieldWithSource(merged, 'listingStatus', scraped.listingStatus || scraped.homeStatus, 'scraped', 'high');
  
  // Additional Data
  merged.description = scraped.description || '';
  merged.highlights = scraped.highlights || scraped.investmentHighlights || [];
  merged.images = scraped.images || [];
  merged.schools = scraped.schools || [];
  merged.zoning = scraped.zoning || '';
}

/**
 * Apply RentCast data to merged object (secondary priority)
 */
function applyRentCastData(merged: MergedPropertyData, rentcast: any): void {
  if (!rentcast) return;

  // Only apply RentCast data if scraped data is missing
  
  // Property details - fill gaps
  if (!merged.bedrooms && rentcast.property?.bedrooms) {
    setFieldWithSource(merged, 'bedrooms', rentcast.property.bedrooms, 'rentcast', 'high');
  }
  if (!merged.bathrooms && rentcast.property?.bathrooms) {
    setFieldWithSource(merged, 'bathrooms', rentcast.property.bathrooms, 'rentcast', 'high');
  }
  if (!merged.squareFootage && rentcast.property?.squareFootage) {
    setFieldWithSource(merged, 'squareFootage', rentcast.property.squareFootage, 'rentcast', 'high');
  }
  if (!merged.yearBuilt && rentcast.property?.yearBuilt) {
    setFieldWithSource(merged, 'yearBuilt', rentcast.property.yearBuilt, 'rentcast', 'high');
  }
  
  // Listing data - highest priority for price
  if (rentcast.listing?.price || rentcast.listing?.listPrice) {
    const listingPrice = rentcast.listing.price || rentcast.listing.listPrice;
    setFieldWithSource(merged, 'listingPrice', listingPrice, 'rentcast', 'high');
    
    // Use listing price as primary price if available
    if (!merged.price || merged.price > 10000000) { // Override if price seems wrong
      setFieldWithSource(merged, 'price', listingPrice, 'rentcast', 'high');
    }
  }
  
  // AVM data - secondary priority
  if (rentcast.value?.value || rentcast.value?.price) {
    setFieldWithSource(merged, 'avm', rentcast.value.value || rentcast.value.price, 'rentcast', 'high');
    
    // Use AVM as price only if no listing price and no valid scraped price
    if (!merged.price || merged.price > 10000000) {
      setFieldWithSource(merged, 'price', rentcast.value.value || rentcast.value.price, 'rentcast', 'medium');
    }
  }
  
  // Rental estimates - add as supplementary
  if (rentcast.rental?.rentEstimate || rentcast.rental?.rent) {
    setFieldWithSource(merged, 'rentEstimate', rentcast.rental.rentEstimate || rentcast.rental.rent, 'rentcast', 'high');
    setFieldWithSource(merged, 'rentRangeLow', rentcast.rental.rentRangeLow, 'rentcast', 'medium');
    setFieldWithSource(merged, 'rentRangeHigh', rentcast.rental.rentRangeHigh, 'rentcast', 'medium');
    
    // Use as primary rent if no scraped rent
    if (!merged.monthlyRent) {
      setFieldWithSource(merged, 'monthlyRent', rentcast.rental.rentEstimate || rentcast.rental.rent, 'rentcast', 'medium');
    }
  }
  
  // Comparables data
  if (rentcast.comparables) {
    merged.comparables = rentcast.comparables.comparables || [];
    merged.comparablesCount = merged.comparables?.length || 0;
    if (rentcast.comparables.value) {
      merged.comparablesAvgPrice = rentcast.comparables.value;
    }
  }
  
  // Neighborhood data
  if (rentcast.neighborhood) {
    merged.neighborhood = rentcast.neighborhood;
  }
  
  // Add RentCast images if no scraped images
  if ((!merged.images || merged.images.length === 0) && rentcast.images) {
    merged.images = rentcast.images;
  }
}

/**
 * Apply estimated data for missing fields (lowest priority)
 */
function applyEstimatedData(merged: MergedPropertyData): void {
  // Estimate monthly rent if missing (use reasonable estimates)
  if (!merged.monthlyRent && merged.price > 0) {
    // Use 0.7% rule but cap at reasonable amounts
    let estimatedRent = Math.round(merged.price * 0.007);
    
    // Sanity check - rent shouldn't be more than $20k/month for residential
    if (estimatedRent > 20000 && merged.propertyType !== 'Commercial') {
      // Use a more conservative estimate based on property size
      const bedroomRates: Record<number, number> = {
        1: 2000,
        2: 2800,
        3: 3500,
        4: 4500,
        5: 5500
      };
      estimatedRent = bedroomRates[merged.bedrooms || 3] || 3500;
    }
    
    setFieldWithSource(merged, 'monthlyRent', estimatedRent, 'estimated', 'low');
  }
  
  // Estimate square footage based on bedrooms if missing
  if (!merged.squareFootage && merged.bedrooms) {
    const estimatedSqft = merged.bedrooms * 750 + 500; // Rough estimate
    setFieldWithSource(merged, 'squareFootage', estimatedSqft, 'estimated', 'low');
  }
  
  // Estimate property taxes if missing (1.2% of value)
  if (!merged.propertyTaxes && merged.price > 0) {
    const estimatedTaxes = Math.round(merged.price * 0.012);
    setFieldWithSource(merged, 'propertyTaxes', estimatedTaxes, 'estimated', 'low');
  }
  
  // Estimate insurance if missing (0.35% of value)
  if (!merged.insurance && merged.price > 0) {
    const estimatedInsurance = Math.round(merged.price * 0.0035);
    setFieldWithSource(merged, 'insurance', estimatedInsurance, 'estimated', 'low');
  }
}

/**
 * Calculate derived metrics from available data
 */
function calculateDerivedMetrics(merged: MergedPropertyData): void {
  // Price per square foot
  if (merged.price > 0 && merged.squareFootage && merged.squareFootage > 0) {
    merged.pricePerSqFt = Math.round(merged.price / merged.squareFootage);
  }
  
  // Cap rate (if not already provided)
  if (!merged.capRate && merged.price > 0 && merged.monthlyRent && merged.monthlyRent > 0) {
    const annualRent = merged.monthlyRent * 12;
    const annualExpenses = annualRent * 0.4; // 40% expense ratio
    const noi = annualRent - annualExpenses;
    merged.capRate = parseFloat(((noi / merged.price) * 100).toFixed(2));
    
    if (!merged.noi) {
      merged.noi = Math.round(noi);
    }
  }
  
  // Gross yield
  if (merged.price > 0 && merged.monthlyRent && merged.monthlyRent > 0) {
    const annualRent = merged.monthlyRent * 12;
    merged.grossYield = parseFloat(((annualRent / merged.price) * 100).toFixed(2));
  }
  
  // Cash on cash return (assuming 25% down)
  if (merged.price > 0 && merged.monthlyRent && merged.monthlyRent > 0) {
    const downPayment = merged.price * 0.25;
    const loanAmount = merged.price * 0.75;
    const monthlyPayment = calculateMonthlyPayment(loanAmount, 0.07, 30);
    const monthlyExpenses = (merged.monthlyRent * 0.4) + monthlyPayment;
    const monthlyCashFlow = merged.monthlyRent - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    merged.cashOnCashReturn = parseFloat(((annualCashFlow / downPayment) * 100).toFixed(2));
  }
}

/**
 * Calculate monthly mortgage payment
 */
function calculateMonthlyPayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numPayments;
  
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return Math.round(payment);
}

/**
 * Set field value with source tracking
 */
function setFieldWithSource(
  merged: MergedPropertyData,
  field: keyof MergedPropertyData,
  value: any,
  source: 'scraped' | 'rentcast' | 'estimated' | 'default',
  confidence: 'high' | 'medium' | 'low'
): void {
  if (value !== undefined && value !== null && value !== '') {
    (merged as any)[field] = value;
    merged.dataSources[field] = {
      field,
      value,
      source,
      confidence,
      timestamp: new Date()
    };
  }
}

/**
 * Calculate overall data completeness
 */
function calculateDataCompleteness(merged: MergedPropertyData): void {
  const requiredFields = [
    'address', 'city', 'state', 'zipCode',
    'propertyType', 'price', 'bedrooms', 'bathrooms',
    'squareFootage', 'yearBuilt', 'monthlyRent'
  ];
  
  const optionalFields = [
    'lotSize', 'propertyTaxes', 'hoaFees', 'insurance',
    'capRate', 'noi', 'avm', 'rentEstimate',
    'comparables', 'daysOnMarket', 'description'
  ];
  
  let filledRequired = 0;
  let filledOptional = 0;
  const missingFields: string[] = [];
  
  // Count sources
  let scrapedCount = 0;
  let rentcastCount = 0;
  let estimatedCount = 0;
  
  // Check required fields
  for (const field of requiredFields) {
    if ((merged as any)[field]) {
      filledRequired++;
      const source = merged.dataSources[field]?.source;
      if (source === 'scraped') scrapedCount++;
      else if (source === 'rentcast') rentcastCount++;
      else if (source === 'estimated') estimatedCount++;
    } else {
      missingFields.push(field);
    }
  }
  
  // Check optional fields
  for (const field of optionalFields) {
    if ((merged as any)[field]) {
      filledOptional++;
      const source = merged.dataSources[field]?.source;
      if (source === 'scraped') scrapedCount++;
      else if (source === 'rentcast') rentcastCount++;
      else if (source === 'estimated') estimatedCount++;
    }
  }
  
  // Calculate score
  const requiredScore = (filledRequired / requiredFields.length) * 70;
  const optionalScore = (filledOptional / optionalFields.length) * 30;
  const totalScore = Math.round(requiredScore + optionalScore);
  
  merged.dataCompleteness = {
    score: totalScore,
    missingFields,
    sources: {
      scraped: scrapedCount,
      rentcast: rentcastCount,
      estimated: estimatedCount
    }
  };
}