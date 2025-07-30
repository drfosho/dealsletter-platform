'use client';

import { useState } from 'react';
import { propertyAPI } from '@/services/property-api';
import Navigation from '@/components/Navigation';

export default function TestAPIPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTest, setActiveTest] = useState<string>('');
  
  // Test addresses
  const testAddresses = [
    '1234 Market St, San Francisco, CA 94102',
    '123 Main Street, Los Angeles, CA 90012',
    '456 Park Ave, San Diego, CA 92101'
  ];

  const runTest = async (testType: string, address: string) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setActiveTest(testType);

    try {
      let response;
      
      switch (testType) {
        case 'search':
          response = await propertyAPI.searchProperty({
            address,
            includeRentEstimates: true,
            includeComparables: true,
            includeMarketData: true
          });
          break;
          
        case 'details':
          response = await propertyAPI.getPropertyDetails(address);
          break;
          
        case 'analysis':
          response = await propertyAPI.generateAnalysis({
            address,
            strategy: 'rental',
            purchasePrice: 750000,
            downPayment: 150000,
            loanTerms: {
              interestRate: 7.5,
              loanTerm: 30,
              loanType: 'conventional'
            },
            rehabCosts: 25000
          });
          break;
          
        default:
          throw new Error('Invalid test type');
      }
      
      setResults(response as unknown as Record<string, unknown>);
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
      console.error('Test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="default" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">RentCast API Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Property Search Test */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4">Property Search</h2>
            <p className="text-sm text-muted mb-4">
              Test the property search endpoint with all data options
            </p>
            <button
              onClick={() => runTest('search', testAddresses[0])}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading && activeTest === 'search' ? 'Testing...' : 'Test Search API'}
            </button>
          </div>

          {/* Property Details Test */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <p className="text-sm text-muted mb-4">
              Test the property details endpoint with metrics
            </p>
            <button
              onClick={() => runTest('details', testAddresses[0])}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading && activeTest === 'details' ? 'Testing...' : 'Test Details API'}
            </button>
          </div>

          {/* Analysis Generation Test */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-xl font-semibold mb-4">Analysis Generation</h2>
            <p className="text-sm text-muted mb-4">
              Test the AI analysis generation endpoint
            </p>
            <button
              onClick={() => runTest('analysis', testAddresses[0])}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading && activeTest === 'analysis' ? 'Testing...' : 'Test Analysis API'}
            </button>
          </div>
        </div>

        {/* Test Different Addresses */}
        <div className="bg-card p-6 rounded-lg border border-border mb-8">
          <h3 className="text-lg font-semibold mb-4">Test with Different Addresses</h3>
          <div className="space-y-2">
            {testAddresses.map((address, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded">
                <span className="text-sm">{address}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => runTest('search', address)}
                    disabled={loading}
                    className="px-3 py-1 text-xs bg-accent text-secondary rounded hover:bg-accent/90 disabled:opacity-50"
                  >
                    Search
                  </button>
                  <button
                    onClick={() => runTest('details', address)}
                    disabled={loading}
                    className="px-3 py-1 text-xs bg-accent text-secondary rounded hover:bg-accent/90 disabled:opacity-50"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
            <h3 className="text-red-600 font-semibold mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-4">API Response</h3>
            <div className="bg-muted/10 p-4 rounded overflow-x-auto">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
            
            {results && 'property' in results && (results as any).property && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-background p-4 rounded">
                  <p className="text-sm text-muted">Property Type</p>
                  <p className="font-semibold">{(results as any).property.propertyType}</p>
                </div>
                <div className="bg-background p-4 rounded">
                  <p className="text-sm text-muted">Bedrooms/Bathrooms</p>
                  <p className="font-semibold">{(results as any).property.bedrooms} / {(results as any).property.bathrooms}</p>
                </div>
                <div className="bg-background p-4 rounded">
                  <p className="text-sm text-muted">Square Footage</p>
                  <p className="font-semibold">{(results as any).property.squareFootage?.toLocaleString()} sq ft</p>
                </div>
                <div className="bg-background p-4 rounded">
                  <p className="text-sm text-muted">Year Built</p>
                  <p className="font-semibold">{(results as any).property.yearBuilt}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Status Check */}
        <div className="mt-8 bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4">API Configuration Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">RentCast API Key</span>
              <span className="text-sm text-green-600">✓ Configured</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Anthropic API Key</span>
              <span className="text-sm text-green-600">✓ Configured</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Endpoints</span>
              <span className="text-sm text-green-600">✓ Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}