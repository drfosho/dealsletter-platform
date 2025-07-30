'use client';

import { useState } from 'react';
import AddressSearchInput from './AddressSearchInput';
import PropertyPreview from './PropertyPreview';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { propertyAPI } from '@/services/property-api';

interface PropertySearchProps {
  onPropertySelect?: (address: string, propertyData: any) => void;
  className?: string;
}

export default function PropertySearch({ onPropertySelect, className = '' }: PropertySearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  const handleAddressSelect = async (address: string, placeId: string) => {
    setIsLoading(true);
    setError(null);
    setPropertyData(null);
    setSelectedAddress(address);

    try {
      // Search for property with all data
      const searchResults = await propertyAPI.searchProperty({
        address,
        includeRentEstimates: true,
        includeComparables: true,
        includeMarketData: true
      });

      if (!searchResults.property || searchResults.property.length === 0) {
        throw new Error('Property not found at this address');
      }

      // Format the data for display
      const formattedData = {
        address,
        property: searchResults.property[0],
        rental: searchResults.rental,
        comparables: searchResults.comparables,
        market: searchResults.market
      };

      setPropertyData(formattedData);
      
      // Callback with selected property data
      if (onPropertySelect) {
        onPropertySelect(address, formattedData);
      }
    } catch (err: any) {
      console.error('Property search error:', err);
      setError(err.message || 'Failed to fetch property details');
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Search</h2>
          <p className="text-sm text-gray-600">
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
            <PropertyPreview data={propertyData} />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Search Another Property
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile-optimized styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          :global(.pac-container) {
            z-index: 9999;
            font-family: inherit;
          }
          
          :global(.pac-item) {
            padding: 10px 14px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}