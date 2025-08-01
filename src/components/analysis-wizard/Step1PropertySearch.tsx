'use client';

import { useState, useEffect } from 'react';
import { PropertySearch } from '@/components/property-search';
import type { WizardData } from '@/app/analysis/new/page';

interface Step1PropertySearchProps {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onNext: () => void;
  setCanProceed: (can: boolean) => void;
}

export default function Step1PropertySearch({ 
  data, 
  updateData, 
  onNext,
  setCanProceed 
}: Step1PropertySearchProps) {
  const [usageData, setUsageData] = useState<{
    analyses_used: number;
    tier_limit: number;
    subscription_tier: string;
    remaining: number;
    can_analyze: boolean;
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check usage limits
  useEffect(() => {
    checkUsage();
  }, []);

  const checkUsage = async () => {
    try {
      const response = await fetch('/api/analysis/usage');
      if (!response.ok) throw new Error('Failed to check usage');
      
      const usage = await response.json();
      setUsageData(usage);
      
      if (!usage.can_analyze) {
        setError(usage.message || 'Monthly limit reached');
      }
    } catch (err) {
      console.error('Usage check error:', err);
      setError('Failed to check usage limits');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (address: string, propertyData: Record<string, unknown>) => {
    console.log('[Step1] RAW PROPERTY DATA RECEIVED:', JSON.stringify(propertyData, null, 2));
    
    // Extract data from RentCast response
    const comparables = propertyData?.comparables as any;
    const rental = propertyData?.rental as any;
    const listing = propertyData?.listing as any;
    const property = propertyData?.property as any;
    
    console.log('[Step1] Extracted fields:', {
      hasComparables: !!comparables,
      hasRental: !!rental,
      hasListing: !!listing,
      hasProperty: !!property,
      comparablesStructure: comparables,
      rentalStructure: rental
    });
    
    // Handle potentially wrapped responses from RentCast
    // Sometimes the data comes wrapped in a 'data' field or array
    const extractValue = (obj: any, ...keys: string[]) => {
      if (!obj) return 0;
      
      // If it's an array, take the first element
      if (Array.isArray(obj) && obj.length > 0) {
        obj = obj[0];
      }
      
      // If it's wrapped in 'data' field
      if (obj.data) {
        obj = obj.data;
      }
      
      // Try each key
      for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) {
          return obj[key];
        }
      }
      
      return 0;
    };
    
    // For on-market properties, prioritize listing price over AVM
    const listingPrice = extractValue(listing, 'price', 'listPrice', 'askingPrice', 'currentPrice');
    
    // RentCast comparables data structure - check both direct value and nested paths
    let avmValue = 0;
    if (comparables) {
      // Try direct value first
      avmValue = comparables.value || comparables.price || 0;
      
      // If not found, try nested paths
      if (!avmValue && comparables.avm) {
        avmValue = comparables.avm.value || comparables.avm.amount || 0;
      }
      
      // Try averagePrice or estimatedValue
      if (!avmValue) {
        avmValue = comparables.averagePrice || comparables.estimatedValue || 0;
      }
      
      console.log('[Step1] AVM extraction:', {
        directValue: comparables.value,
        directPrice: comparables.price,
        avmNested: comparables.avm,
        averagePrice: comparables.averagePrice,
        finalAVM: avmValue
      });
    }
    
    const purchasePrice = listingPrice > 0 ? listingPrice : avmValue;
    
    // Extract rent estimate with similar approach
    let rentEstimate = 0;
    if (rental) {
      // Try direct fields first
      rentEstimate = rental.rentEstimate || rental.rent || rental.price || 0;
      
      // Try nested paths
      if (!rentEstimate && rental.estimate) {
        rentEstimate = rental.estimate.rent || rental.estimate.amount || 0;
      }
      
      // Try monthlyRent
      if (!rentEstimate) {
        rentEstimate = rental.monthlyRent || 0;
      }
      
      console.log('[Step1] Rent extraction:', {
        directRentEstimate: rental.rentEstimate,
        directRent: rental.rent,
        monthlyRent: rental.monthlyRent,
        finalRent: rentEstimate
      });
    }
    
    console.log('[Step1] CRITICAL - Purchase Price Calculation:', {
      listing,
      listingPrice,
      avmValue,
      finalPurchasePrice: purchasePrice,
      isOnMarket: listingPrice > 0,
      comparables,
      valueRange: comparables ? `${extractValue(comparables, 'valueRangeLow')}-${extractValue(comparables, 'valueRangeHigh')}` : 'N/A',
      rental,
      rentEstimate,
      rentRange: rental ? `${extractValue(rental, 'rentRangeLow')}-${extractValue(rental, 'rentRangeHigh')}` : 'N/A',
      hasImages: property?.images?.length > 0
    });
    
    // FALLBACK: If we still don't have a purchase price, try to extract from any available data
    let finalPurchasePrice = purchasePrice;
    if (finalPurchasePrice === 0) {
      console.log('[Step1] WARNING: No purchase price found, attempting deep extraction...');
      
      // Try to find any price-like field in the entire propertyData object
      const findPrice = (obj: any, depth = 0): number => {
        if (depth > 3 || !obj) return 0;
        
        // Direct price fields
        const priceFields = ['value', 'price', 'listPrice', 'askingPrice', 'estimatedValue', 'avm', 'currentPrice'];
        for (const field of priceFields) {
          if (obj[field] && typeof obj[field] === 'number' && obj[field] > 10000) {
            console.log(`[Step1] Found price in field '${field}':`, obj[field]);
            return obj[field];
          }
        }
        
        // Recursively search nested objects
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const found = findPrice(obj[key], depth + 1);
            if (found > 0) return found;
          }
        }
        
        return 0;
      };
      
      finalPurchasePrice = findPrice(propertyData);
      console.log('[Step1] Deep extraction result:', finalPurchasePrice);
    }
    
    // Update both property data and financial data at the same time
    const updatedFinancial = {
      ...data.financial,
      purchasePrice: finalPurchasePrice > 0 ? finalPurchasePrice : (purchasePrice > 0 ? purchasePrice : data.financial.purchasePrice),
      monthlyRent: rentEstimate > 0 ? rentEstimate : data.financial.monthlyRent
    };
    
    updateData({ 
      address, 
      propertyData,
      financial: updatedFinancial
    });
    
    console.log('[Step1] Updated wizard data with financial values:', {
      purchasePrice: updatedFinancial.purchasePrice,
      monthlyRent: updatedFinancial.monthlyRent,
      usedListingPrice: listingPrice > 0
    });
    
    setCanProceed(true);
  };

  const handleContinue = () => {
    if (data.address && data.propertyData) {
      onNext();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Find Your Investment Property
        </h2>
        <p className="text-muted">
          Search for a property address to analyze its investment potential
        </p>
      </div>

      {/* Usage Meter */}
      {usageData && (
        <div className="mb-6 bg-muted/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Monthly Analyses</span>
            <span className="text-sm text-muted">
              {usageData.analyses_used} / {usageData.tier_limit} used
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                usageData.analyses_used >= usageData.tier_limit 
                  ? 'bg-red-500' 
                  : usageData.analyses_used >= usageData.tier_limit * 0.8
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${(usageData.analyses_used / usageData.tier_limit) * 100}%` }}
            />
          </div>
          {usageData.subscription_tier === 'free' && usageData.remaining <= 1 && (
            <p className="text-xs text-yellow-500 mt-2">
              {usageData.remaining === 0 
                ? 'Monthly limit reached. Upgrade to Pro for more analyses.'
                : `Only ${usageData.remaining} analysis remaining this month.`
              }
            </p>
          )}
        </div>
      )}

      {/* Error State */}
      {error && !usageData?.can_analyze ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-destructive mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-destructive mb-2">Monthly Limit Reached</h3>
          <p className="text-destructive/80 mb-4">{error}</p>
          <button className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90">
            Upgrade to Pro
          </button>
        </div>
      ) : (
        <>
          {/* Property Search */}
          {!data.propertyData ? (
            <PropertySearch onPropertySelect={handlePropertySelect} />
          ) : (
            <div>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-primary text-lg">{data.address}</h3>
                    <p className="text-muted mt-1">
                      {(data.propertyData.property as any)?.bedrooms || 0} bed • 
                      {(data.propertyData.property as any)?.bathrooms || 0} bath • 
                      {((data.propertyData.property as any)?.squareFootage || 0).toLocaleString()} sq ft
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="text-primary font-medium">
                        Est. Value: ${((data.propertyData.comparables as any)?.value || 0).toLocaleString()}
                      </span>
                      <span className="text-muted">
                        Built: {(data.propertyData.property as any)?.yearBuilt || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      updateData({ address: '', propertyData: undefined });
                      setCanProceed(false);
                    }}
                    className="text-sm text-muted hover:text-primary"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Property Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {((data.propertyData.rental as any)?.rent || (data.propertyData.rental as any)?.rentEstimate) && (
                  <div className="bg-muted/10 rounded-lg p-4">
                    <p className="text-sm text-muted mb-1">Estimated Rent</p>
                    <p className="text-xl font-bold text-primary">
                      ${((data.propertyData.rental as any)?.rent || (data.propertyData.rental as any)?.rentEstimate || 0).toLocaleString()}/mo
                    </p>
                  </div>
                )}
                {(data.propertyData.comparables as any)?.value && (data.propertyData.property as any)?.squareFootage && (
                  <div className="bg-muted/10 rounded-lg p-4">
                    <p className="text-sm text-muted mb-1">Price per Sq Ft</p>
                    <p className="text-xl font-bold text-primary">
                      ${Math.round(((data.propertyData.comparables as any)?.value || 0) / ((data.propertyData.property as any)?.squareFootage || 1))}
                    </p>
                  </div>
                )}
                <div className="bg-muted/10 rounded-lg p-4">
                  <p className="text-sm text-muted mb-1">Property Type</p>
                  <p className="text-xl font-bold text-primary capitalize">
                    {(data.propertyData.property as any)?.propertyType || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleContinue}
              disabled={!data.address || !data.propertyData}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all
                ${data.address && data.propertyData
                  ? 'bg-primary text-secondary hover:bg-primary/90 transform hover:scale-105'
                  : 'bg-muted text-muted cursor-not-allowed'
                }
              `}
            >
              Continue to Strategy Selection →
            </button>
          </div>
        </>
      )}
    </div>
  );
}