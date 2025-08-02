'use client';

import { useState } from 'react';
import { rentCastService } from '@/services/rentcast';

export default function TestRentCastPage() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testRentCast = async () => {
    if (!address) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      console.log('[Test] Starting RentCast test for:', address);
      
      // Test comprehensive data retrieval
      const comprehensiveData = await rentCastService.getComprehensivePropertyData(address);
      
      console.log('[Test] Comprehensive data received:', comprehensiveData);
      
      setData(comprehensiveData);
    } catch (err) {
      console.error('[Test] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">RentCast API Test</h1>
        
        <div className="bg-card rounded-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter property address (e.g., 123 Main St, Austin, TX)"
              className="flex-1 px-4 py-2 border border-border rounded-lg"
            />
            <button
              onClick={testRentCast}
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test RentCast'}
            </button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
        </div>

        {data && (
          <div className="space-y-6">
            {/* Property Details */}
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <pre className="bg-muted rounded p-4 overflow-auto text-xs">
                {JSON.stringify(data.property, null, 2)}
              </pre>
            </div>

            {/* Rental Estimate */}
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Rental Estimate</h2>
              <pre className="bg-muted rounded p-4 overflow-auto text-xs">
                {JSON.stringify(data.rental, null, 2)}
              </pre>
            </div>

            {/* Comparables */}
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Comparables (AVM)</h2>
              <pre className="bg-muted rounded p-4 overflow-auto text-xs">
                {JSON.stringify(data.comparables, null, 2)}
              </pre>
            </div>

            {/* Market Data */}
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Market Data</h2>
              <pre className="bg-muted rounded p-4 overflow-auto text-xs">
                {JSON.stringify(data.market, null, 2)}
              </pre>
            </div>

            {/* Summary */}
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
              <div className="space-y-2">
                <p><strong>Property Type:</strong> {data.property?.propertyType || 'N/A'}</p>
                <p><strong>Bedrooms:</strong> {data.property?.bedrooms || 'N/A'}</p>
                <p><strong>Bathrooms:</strong> {data.property?.bathrooms || 'N/A'}</p>
                <p><strong>Square Footage:</strong> {data.property?.squareFootage || 'N/A'}</p>
                <p><strong>Year Built:</strong> {data.property?.yearBuilt || 'N/A'}</p>
                <p><strong>Estimated Value:</strong> ${data.comparables?.value?.toLocaleString() || 'N/A'}</p>
                <p><strong>Rent Estimate:</strong> ${data.rental?.rentEstimate?.toLocaleString() || 'N/A'}/mo</p>
                <p><strong>Median Rent:</strong> ${data.market?.medianRent?.toLocaleString() || 'N/A'}/mo</p>
                <p><strong>Median Sale Price:</strong> ${data.market?.medianSalePrice?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}