'use client';

import { useState } from 'react';

interface DataSource {
  field: string;
  value: any;
  source: 'scraped' | 'rentcast' | 'estimated' | 'default';
  confidence: 'high' | 'medium' | 'low';
}

interface EnhancedPropertyData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  price: number;
  listingPrice?: number;
  avm?: number;
  monthlyRent?: number;
  rentEstimate?: number;
  capRate?: number;
  noi?: number;
  propertyTaxes?: number;
  images: string[];
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
}

interface ScraperResult {
  success: boolean;
  source: string;
  data?: EnhancedPropertyData;
  metadata?: any;
  error?: string;
  message?: string;
}

export default function EnhancedPropertyScraper() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScraperResult | null>(null);
  const [includeRentCast, setIncludeRentCast] = useState(true);
  const [includeEstimates, setIncludeEstimates] = useState(true);
  const [showDataSources, setShowDataSources] = useState(false);

  const handleScrape = async () => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/scrape-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          includeRentCast,
          includeEstimates
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        source: 'unknown',
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to connect'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleUrl = () => {
    const urls = [
      'https://www.zillow.com/homedetails/1419-Leavenworth-St-San-Francisco-CA-94109/2078507892_zpid/',
      'https://www.loopnet.com/Listing/28935005/2600-Telegraph-Avenue-Oakland-CA/'
    ];
    return urls[Math.floor(Math.random() * urls.length)];
  };

  const getSourceBadge = (source: string) => {
    const badges = {
      scraped: 'bg-green-100 text-green-800',
      rentcast: 'bg-blue-100 text-blue-800',
      estimated: 'bg-yellow-100 text-yellow-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return badges[source as keyof typeof badges] || badges.default;
  };

  const getConfidenceBadge = (confidence: string) => {
    const badges = {
      high: '🟢',
      medium: '🟡',
      low: '🔴'
    };
    return badges[confidence as keyof typeof badges] || '⚪';
  };

  const formatFieldName = (field: string): string => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-2xl font-bold text-primary mb-4">
        Enhanced Property Scraper
      </h2>
      <p className="text-muted mb-6">
        Scrape property data and enhance with RentCast API for comprehensive analysis
      </p>

      {/* URL Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary mb-2">
          Property URL (Zillow or LoopNet)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Zillow or LoopNet URL"
            className="flex-1 px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => setUrl(getSampleUrl())}
            className="px-4 py-3 text-accent hover:bg-accent/10 rounded-lg transition-colors"
          >
            Sample
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeRentCast}
            onChange={(e) => setIncludeRentCast(e.target.checked)}
            className="w-4 h-4 text-accent rounded"
          />
          <span className="text-sm">Include RentCast Data</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeEstimates}
            onChange={(e) => setIncludeEstimates(e.target.checked)}
            className="w-4 h-4 text-accent rounded"
          />
          <span className="text-sm">Include Estimates</span>
        </label>
      </div>

      {/* Scrape Button */}
      <button
        onClick={handleScrape}
        disabled={isLoading || !url}
        className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
      >
        {isLoading ? 'Processing...' : 'Scrape & Enhance Property'}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6">
          {result.success && result.data ? (
            <div>
              {/* Data Completeness */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Data Quality</h3>
                  <span className="text-2xl font-bold text-accent">
                    {result.data.dataCompleteness.score}%
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">
                      {result.data.dataCompleteness.sources.scraped}
                    </div>
                    <div className="text-gray-600">Scraped</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">
                      {result.data.dataCompleteness.sources.rentcast}
                    </div>
                    <div className="text-gray-600">RentCast</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">
                      {result.data.dataCompleteness.sources.estimated}
                    </div>
                    <div className="text-gray-600">Estimated</div>
                  </div>
                </div>

                {result.data.dataCompleteness.missingFields.length > 0 && (
                  <div className="mt-3 text-xs text-gray-600">
                    Missing: {result.data.dataCompleteness.missingFields.join(', ')}
                  </div>
                )}
              </div>

              {/* Property Overview */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Property Details</h4>
                  <div className="space-y-1 text-sm">
                    <div>{result.data.address}</div>
                    <div>{result.data.city}, {result.data.state} {result.data.zipCode}</div>
                    <div className="font-medium">{result.data.propertyType}</div>
                    {result.data.bedrooms && (
                      <div>{result.data.bedrooms} bed / {result.data.bathrooms} bath</div>
                    )}
                    {result.data.squareFootage && (
                      <div>{result.data.squareFootage.toLocaleString()} sqft</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Financial Data</h4>
                  <div className="space-y-1 text-sm">
                    {result.data.listingPrice && (
                      <div>
                        <span className="text-gray-600">Listing:</span>{' '}
                        <span className="font-medium">${result.data.listingPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {result.data.avm && (
                      <div>
                        <span className="text-gray-600">AVM:</span>{' '}
                        <span className="font-medium">${result.data.avm.toLocaleString()}</span>
                      </div>
                    )}
                    {result.data.monthlyRent && (
                      <div>
                        <span className="text-gray-600">Rent:</span>{' '}
                        <span className="font-medium">${result.data.monthlyRent.toLocaleString()}/mo</span>
                      </div>
                    )}
                    {result.data.capRate && (
                      <div>
                        <span className="text-gray-600">Cap Rate:</span>{' '}
                        <span className="font-medium">{result.data.capRate}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Sources Toggle */}
              <button
                onClick={() => setShowDataSources(!showDataSources)}
                className="mb-4 text-sm text-accent hover:text-accent/80 font-medium"
              >
                {showDataSources ? 'Hide' : 'Show'} Data Sources
              </button>

              {/* Data Sources Table */}
              {showDataSources && (
                <div className="mb-6 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-2 border">Field</th>
                        <th className="text-left p-2 border">Value</th>
                        <th className="text-left p-2 border">Source</th>
                        <th className="text-left p-2 border">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.data.dataSources).map(([field, source]) => (
                        <tr key={field} className="hover:bg-gray-50">
                          <td className="p-2 border font-medium">{formatFieldName(field)}</td>
                          <td className="p-2 border">
                            {typeof source.value === 'number' 
                              ? source.value.toLocaleString()
                              : String(source.value)}
                          </td>
                          <td className="p-2 border">
                            <span className={`px-2 py-1 rounded text-xs ${getSourceBadge(source.source)}`}>
                              {source.source}
                            </span>
                          </td>
                          <td className="p-2 border text-center">
                            {getConfidenceBadge(source.confidence)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Images */}
              {result.data.images && result.data.images.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Images ({result.data.images.length})
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {result.data.images.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="aspect-video bg-gray-200 rounded overflow-hidden">
                        <img 
                          src={img} 
                          alt={`Property ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/api/placeholder/200/150';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Add to analysis queue
                    console.log('Add to analysis:', result.data);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add to Analysis Queue
                </button>
                <button
                  onClick={() => {
                    // Save to database
                    console.log('Save to database:', result.data);
                  }}
                  className="flex-1 px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition-colors"
                >
                  Save to Database
                </button>
              </div>

              {/* Raw Data */}
              <details className="mt-6">
                <summary className="cursor-pointer text-accent hover:text-accent/80 font-medium text-sm">
                  View Raw Data
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">❌ Processing Failed</h3>
              <p className="text-red-600">{result.error}</p>
              <p className="text-red-500 text-sm mt-1">{result.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}