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

// Property types for the dropdown
const PROPERTY_TYPES = [
  { value: 'Single Family', label: 'Single Family' },
  { value: 'Multi-Family', label: 'Multi-Family' },
  { value: 'Duplex', label: 'Duplex (2 units)' },
  { value: 'Triplex', label: 'Triplex (3 units)' },
  { value: 'Fourplex', label: 'Fourplex (4 units)' },
  { value: 'Apartment', label: 'Apartment Building' },
  { value: 'Condo', label: 'Condo/Townhouse' },
  { value: 'Commercial', label: 'Commercial' },
];

// Component for reviewing and editing property data
function PropertyDataReview({
  data,
  updateData,
  setCanProceed
}: {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  setCanProceed: (can: boolean) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Extract property data
  const prop = Array.isArray(data.propertyData?.property)
    ? data.propertyData.property[0]
    : data.propertyData?.property;

  const rental = data.propertyData?.rental as Record<string, unknown> | undefined;
  const comparables = data.propertyData?.comparables as Record<string, unknown> | undefined;

  // Local state for editing
  const [editedData, setEditedData] = useState({
    propertyType: prop?.propertyType || 'Single Family',
    bedrooms: prop?.bedrooms || prop?.beds || 0,
    bathrooms: prop?.bathrooms || prop?.baths || 0,
    squareFootage: prop?.squareFootage || 0,
    yearBuilt: prop?.yearBuilt || 0,
    units: prop?.units || prop?.numberOfUnits || 1,
    rentEstimate: (rental?.rentEstimate || rental?.rent || 0) as number,
  });

  // Update units when property type changes
  const handlePropertyTypeChange = (newType: string) => {
    setEditedData(prev => {
      let units = prev.units;
      if (newType === 'Duplex') units = 2;
      else if (newType === 'Triplex') units = 3;
      else if (newType === 'Fourplex') units = 4;
      else if (newType === 'Single Family' || newType === 'Condo') units = 1;
      return { ...prev, propertyType: newType, units };
    });
  };

  // Save edits to parent data
  const handleSaveEdits = () => {
    // Update the property data with edited values
    const updatedPropertyData = {
      ...data.propertyData,
      property: {
        ...(prop || {}),
        propertyType: editedData.propertyType,
        bedrooms: editedData.bedrooms,
        bathrooms: editedData.bathrooms,
        squareFootage: editedData.squareFootage,
        yearBuilt: editedData.yearBuilt,
        units: editedData.units,
        numberOfUnits: editedData.units,
      },
      rental: {
        ...(rental || {}),
        rentEstimate: editedData.rentEstimate,
        rent: editedData.rentEstimate,
      }
    };

    // Also update financial data with the new rent estimate
    const updatedFinancial = {
      ...data.financial,
      monthlyRent: editedData.units > 1 ? editedData.rentEstimate * editedData.units : editedData.rentEstimate,
      rentPerUnit: editedData.units > 1 ? editedData.rentEstimate : undefined,
      units: editedData.units,
    };

    updateData({
      propertyData: updatedPropertyData,
      financial: updatedFinancial
    });

    setIsEditing(false);
  };

  const handleCancelEdits = () => {
    // Reset to original values
    setEditedData({
      propertyType: prop?.propertyType || 'Single Family',
      bedrooms: prop?.bedrooms || prop?.beds || 0,
      bathrooms: prop?.bathrooms || prop?.baths || 0,
      squareFootage: prop?.squareFootage || 0,
      yearBuilt: prop?.yearBuilt || 0,
      units: prop?.units || prop?.numberOfUnits || 1,
      rentEstimate: (rental?.rentEstimate || rental?.rent || 0) as number,
    });
    setIsEditing(false);
  };

  const comparablesValue = (comparables?.value || 0) as number;
  const isMultiFamily = ['Multi-Family', 'Duplex', 'Triplex', 'Fourplex', 'Apartment'].includes(editedData.propertyType);

  return (
    <div>
      {/* Valuation Disclaimer */}
      <div className="flex gap-3 bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg">
        <div className="text-2xl flex-shrink-0">ℹ️</div>
        <div className="text-sm text-primary/90 leading-relaxed">
          <strong className="text-yellow-600">Note:</strong> Property valuations are estimates from public records and market data.
          They may differ from the active list price or your intended purchase price.
          Please verify and adjust the purchase price in the Financial step if needed.
        </div>
      </div>

      {/* Property Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-primary text-lg">{data.address}</h3>
            <p className="text-muted mt-1">
              {isEditing ? 'Edit property details below' : `${editedData.bedrooms} bed • ${editedData.bathrooms} bath • ${editedData.squareFootage.toLocaleString()} sq ft`}
            </p>
            {!isEditing && (
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-primary font-medium">
                  Est. Value: ${comparablesValue.toLocaleString()}
                </span>
                <span className="text-muted">
                  Built: {editedData.yearBuilt || 'N/A'}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-accent hover:text-accent/80 font-medium"
              >
                Edit Details
              </button>
            )}
            <button
              onClick={() => {
                updateData({ address: '', propertyData: undefined });
                setCanProceed(false);
              }}
              className="text-sm text-muted hover:text-primary"
            >
              Change Property
            </button>
          </div>
        </div>
      </div>

      {/* Editing Mode */}
      {isEditing ? (
        <div className="bg-card border border-border/60 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-primary">Edit Property Details</h4>
            <p className="text-xs text-muted">Fix any incorrect data from the listing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Property Type
              </label>
              <select
                value={editedData.propertyType}
                onChange={(e) => handlePropertyTypeChange(e.target.value)}
                className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              >
                {PROPERTY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {editedData.propertyType !== (prop?.propertyType || 'Single Family') && (
                <p className="text-xs text-yellow-600 mt-1">
                  Changed from "{prop?.propertyType || 'Single Family'}"
                </p>
              )}
            </div>

            {/* Number of Units (for multi-family) */}
            {isMultiFamily && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Number of Units
                </label>
                <input
                  type="number"
                  value={editedData.units}
                  onChange={(e) => setEditedData(prev => ({ ...prev, units: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max="500"
                  className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Bedrooms
              </label>
              <input
                type="number"
                value={editedData.bedrooms}
                onChange={(e) => setEditedData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) || 0 }))}
                min="0"
                className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                step="0.5"
                value={editedData.bathrooms}
                onChange={(e) => setEditedData(prev => ({ ...prev, bathrooms: parseFloat(e.target.value) || 0 }))}
                min="0"
                className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Square Footage */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Square Footage
              </label>
              <input
                type="number"
                value={editedData.squareFootage}
                onChange={(e) => setEditedData(prev => ({ ...prev, squareFootage: parseInt(e.target.value) || 0 }))}
                min="0"
                className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Year Built */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Year Built
              </label>
              <input
                type="number"
                value={editedData.yearBuilt || ''}
                onChange={(e) => setEditedData(prev => ({ ...prev, yearBuilt: parseInt(e.target.value) || 0 }))}
                min="1800"
                max={new Date().getFullYear()}
                placeholder="Year"
                className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Rent Estimate */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {isMultiFamily ? 'Rent Per Unit' : 'Monthly Rent Estimate'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                <input
                  type="number"
                  value={editedData.rentEstimate}
                  onChange={(e) => setEditedData(prev => ({ ...prev, rentEstimate: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  className="w-full pl-8 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0"
                />
              </div>
              {isMultiFamily && editedData.rentEstimate > 0 && (
                <p className="text-xs text-muted mt-1">
                  Total: ${(editedData.rentEstimate * editedData.units).toLocaleString()}/mo ({editedData.units} units)
                </p>
              )}
              {(() => {
                const originalRent = (rental?.rentEstimate || rental?.rent) as number | undefined;
                if (originalRent && editedData.rentEstimate !== originalRent) {
                  return (
                    <p className="text-xs text-yellow-600 mt-1">
                      RentCast estimate: ${originalRent.toLocaleString()}
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Edit Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/40">
            <button
              onClick={handleCancelEdits}
              className="px-4 py-2 text-muted hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdits}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* Property Preview Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {editedData.rentEstimate > 0 && (
            <div className="bg-muted/10 rounded-lg p-4">
              <p className="text-sm text-muted mb-1">
                {isMultiFamily ? 'Rent Per Unit' : 'Estimated Rent'}
              </p>
              <p className="text-xl font-bold text-primary">
                ${editedData.rentEstimate.toLocaleString()}/mo
              </p>
              {isMultiFamily && editedData.units > 1 && (
                <p className="text-xs text-muted mt-1">
                  Total: ${(editedData.rentEstimate * editedData.units).toLocaleString()}/mo
                </p>
              )}
            </div>
          )}
          {comparablesValue > 0 && editedData.squareFootage > 0 && (
            <div className="bg-muted/10 rounded-lg p-4">
              <p className="text-sm text-muted mb-1">Price per Sq Ft</p>
              <p className="text-xl font-bold text-primary">
                ${Math.round(comparablesValue / editedData.squareFootage)}
              </p>
            </div>
          )}
          <div className="bg-muted/10 rounded-lg p-4">
            <p className="text-sm text-muted mb-1">Property Type</p>
            <p className="text-xl font-bold text-primary capitalize">
              {editedData.propertyType}
            </p>
            {isMultiFamily && editedData.units > 1 && (
              <p className="text-xs text-muted mt-1">{editedData.units} units</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
    
    // CRITICAL: Only use listing price for purchase price, NOT AVM
    // AVM is an estimate and should only be shown for reference
    // If no listing price, user must enter purchase price manually
    const purchasePrice = listingPrice > 0 ? listingPrice : 0;

    // Store AVM separately for reference (do NOT use as purchase price)
    console.log('[Step1] IMPORTANT - Price Source Separation:', {
      listingPrice: listingPrice,
      avmEstimate: avmValue,
      usingListingPrice: listingPrice > 0,
      purchasePriceSet: purchasePrice,
      note: listingPrice === 0 ? 'No listing price found - user must enter manually' : 'Using listing price'
    });
    
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
        <div className="mb-6 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-primary">Monthly Analyses</span>
            </div>
            <span className="text-sm font-medium text-purple-600">
              {usageData.analyses_used || 0} of {usageData.tier_limit && usageData.tier_limit !== 9999 ? usageData.tier_limit : '∞'} used
            </span>
          </div>
          {usageData.tier_limit && usageData.tier_limit !== 9999 && (
            <div className="w-full bg-purple-500/10 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (usageData.analyses_used || 0) >= (usageData.tier_limit || 3)
                    ? 'bg-red-500'
                    : (usageData.analyses_used || 0) >= (usageData.tier_limit || 3) * 0.8
                    ? 'bg-yellow-500'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500'
                }`}
                style={{ width: `${Math.min(((usageData.analyses_used || 0) / (usageData.tier_limit || 3)) * 100, 100)}%` }}
              />
            </div>
          )}
          {(usageData.subscription_tier === 'free' || usageData.subscription_tier === 'basic') && (usageData.remaining || 0) <= 1 && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-yellow-600">
                {(usageData.remaining || 0) === 0
                  ? 'Monthly limit reached'
                  : `Only ${usageData.remaining} analysis remaining`
                }
              </p>
              <a href="/pricing" className="text-xs font-medium text-purple-600 hover:text-purple-500">
                Upgrade to Pro →
              </a>
            </div>
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
            <PropertyDataReview
              data={data}
              updateData={updateData}
              setCanProceed={setCanProceed}
            />
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