'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { PropertySearch } from '@/components/property-search';

export default function PropertySearchDemoPage() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const handlePropertySelect = (address: string, propertyData: any) => {
    console.log('Property selected:', { address, propertyData });
    setSelectedProperty({ address, ...propertyData });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="default" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Property Search Demo
          </h1>
          <p className="text-gray-600">
            Search for any US property address to get instant valuation and rental estimates
          </p>
        </div>

        <PropertySearch 
          onPropertySelect={handlePropertySelect}
          className="mb-8"
        />

        {selectedProperty && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Selected Property Data
            </h3>
            <div className="bg-gray-50 rounded p-4 overflow-auto">
              <pre className="text-xs text-gray-700">
                {JSON.stringify(selectedProperty, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Test addresses for easy copying */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Example Addresses to Try:
          </h4>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• 7011 W Parmer Ln, Austin, TX 78729</li>
            <li>• 1234 Market St, San Francisco, CA 94102</li>
            <li>• 456 Park Ave, San Diego, CA 92101</li>
            <li>• 789 Broadway, New York, NY 10003</li>
          </ul>
        </div>
      </div>
    </div>
  );
}