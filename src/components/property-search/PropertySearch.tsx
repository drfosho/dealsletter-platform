'use client';

import { useState } from 'react';
import AddressSearchInput from './AddressSearchInput';
import PropertyPreview from './PropertyPreview';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { propertyAPI } from '@/services/property-api';

interface PropertySearchProps {
  onPropertySelect?: (address: string, propertyData: Record<string, unknown>) => void;
  className?: string;
}

export default function PropertySearch({ onPropertySelect, className = '' }: PropertySearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<Record<string, unknown> | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  const handleAddressSelect = async (address: string, _placeId: string) => {
    console.log('[PropertySearch] handleAddressSelect called with:', { address, _placeId });

    setIsLoading(true);
    setError(null);
    setPropertyData(null);
    setSelectedAddress(address);

    console.log('[PropertySearch] State updated, starting API call...');

    try {
      // Search for property with all data
      console.log('[PropertySearch] Calling propertyAPI.searchProperty...');
      const searchResults = await propertyAPI.searchProperty({
        address,
        includeRentEstimates: true,
        includeComparables: true,
        includeMarketData: true
      });

      console.log('[PropertySearch] Raw search results:', searchResults);

      if (!searchResults.property) {
        throw new Error('Property not found at this address');
      }

      // Format the data for display
      // Handle RentCast returning property as an array
      const propertyData = Array.isArray(searchResults.property) 
        ? searchResults.property[0] 
        : searchResults.property;
      
      const formattedData = {
        address,
        property: propertyData,
        rental: searchResults.rental,
        comparables: searchResults.comparables,
        market: searchResults.market,
        listing: (searchResults as any).listing || null
      };
      
      console.log('[PropertySearch] Formatted data:', formattedData);
      console.log('[PropertySearch] Property data structure:', {
        bedrooms: formattedData.property?.bedrooms,
        bathrooms: formattedData.property?.bathrooms,
        squareFootage: formattedData.property?.squareFootage,
        yearBuilt: formattedData.property?.yearBuilt,
        propertyType: formattedData.property?.propertyType
      });
      console.log('[PropertySearch] Comparables structure:', {
        hasValue: !!formattedData.comparables?.value,
        value: formattedData.comparables?.value,
        valueRangeLow: formattedData.comparables?.valueRangeLow,
        valueRangeHigh: formattedData.comparables?.valueRangeHigh
      });
      console.log('[PropertySearch] Rental structure:', {
        hasRentEstimate: !!formattedData.rental?.rentEstimate,
        rentEstimate: formattedData.rental?.rentEstimate,
        rentRangeLow: formattedData.rental?.rentRangeLow,
        rentRangeHigh: formattedData.rental?.rentRangeHigh
      });

      setPropertyData(formattedData);
      
      // Callback with selected property data
      if (onPropertySelect) {
        onPropertySelect(address, formattedData);
      }
      
      // Force a small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error('Property search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch property details';
      
      // Check for specific error types
      if (errorMessage.includes('not found')) {
        setError('Property not found. Please verify the address and try again.');
      } else if (errorMessage.includes('rate limit')) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (errorMessage.includes('not configured')) {
        setError('Property search service is temporarily unavailable.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (selectedAddress) {
      handleAddressSelect(selectedAddress, '');
    }
  };

  const handleReset = () => {
    setPropertyData(null);
    setSelectedAddress('');
    setError(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-primary">Property Search</h2>
          </div>
          <p className="text-sm text-muted">
            Enter a property address to get instant valuation and rental estimates
          </p>
        </div>

        <AddressSearchInput 
          onAddressSelect={handleAddressSelect}
          disabled={isLoading}
          placeholder="Enter property address (e.g., 123 Main St, Austin, TX)"
        />

        {isLoading && (
          <LoadingSpinner text="Fetching property details..." />
        )}

        {error && !isLoading && (
          <div className="mt-4">
            <ErrorMessage 
              message={error} 
              onRetry={handleRetry}
            />
          </div>
        )}

        {propertyData && !isLoading && (
          <>
            <PropertyPreview data={propertyData as any} />
            
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-muted/20 rounded-lg text-xs">
                <p className="font-semibold text-primary mb-2">Debug: Data Structure</p>
                <div className="space-y-1 text-muted">
                  <p>Has property data: {propertyData.property ? '✓' : '✗'}</p>
                  <p>Has rental data: {propertyData.rental ? '✓' : '✗'}</p>
                  <p>Has comparables: {propertyData.comparables ? '✓' : '✗'}</p>
                  <p>Has market data: {propertyData.market ? '✓' : '✗'}</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-primary bg-card border border-border rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Search Another Property
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}