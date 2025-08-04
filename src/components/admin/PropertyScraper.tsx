'use client';

import { useState } from 'react';

interface ScraperResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default function PropertyScraper() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScraperResult | null>(null);
  const [scraperType, setScraperType] = useState<'zillow' | 'loopnet'>('zillow');

  const handleScrape = async () => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const endpoint = scraperType === 'zillow' 
        ? '/api/test-zillow-scraper' 
        : '/api/test-loopnet-scraper';
      
      const response = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Failed to connect to server'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleUrl = () => {
    if (scraperType === 'zillow') {
      return 'https://www.zillow.com/homedetails/1419-Leavenworth-St-San-Francisco-CA-94109/2078507892_zpid/';
    } else {
      return 'https://www.loopnet.com/Listing/28935005/2600-Telegraph-Avenue-Oakland-CA/';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-2xl font-bold text-primary mb-4">Property Scraper</h2>
      <p className="text-muted mb-6">
        Scrape property data from Zillow or LoopNet using Apify integration
      </p>

      {/* Scraper Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary mb-2">
          Select Source
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setScraperType('zillow')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              scraperType === 'zillow'
                ? 'bg-accent text-white'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Zillow
          </button>
          <button
            onClick={() => setScraperType('loopnet')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              scraperType === 'loopnet'
                ? 'bg-accent text-white'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            LoopNet
          </button>
        </div>
      </div>

      {/* URL Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary mb-2">
          Property URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={getSampleUrl()}
          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          disabled={isLoading}
        />
        <button
          onClick={() => setUrl(getSampleUrl())}
          className="mt-2 text-sm text-accent hover:text-accent/80"
        >
          Use sample URL
        </button>
      </div>

      {/* Scrape Button */}
      <button
        onClick={handleScrape}
        disabled={isLoading || !url}
        className="w-full px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
      >
        {isLoading ? 'Scraping...' : `Scrape from ${scraperType === 'zillow' ? 'Zillow' : 'LoopNet'}`}
      </button>

      {/* Results */}
      {result && (
        <div className={`mt-6 p-4 rounded-lg ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {result.success ? (
            <div>
              <h3 className="font-semibold text-green-800 mb-3">
                ✅ Successfully Scraped Property
              </h3>
              
              {result.data && (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-600">Address:</span>
                      <p className="text-gray-900">{result.data.address || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Price:</span>
                      <p className="text-gray-900">
                        ${result.data.price?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <p className="text-gray-900">{result.data.propertyType || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Size:</span>
                      <p className="text-gray-900">
                        {result.data.squareFootage?.toLocaleString() || 'N/A'} sqft
                      </p>
                    </div>
                    
                    {scraperType === 'zillow' ? (
                      <>
                        <div>
                          <span className="font-medium text-gray-600">Bedrooms:</span>
                          <p className="text-gray-900">{result.data.bedrooms || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Bathrooms:</span>
                          <p className="text-gray-900">{result.data.bathrooms || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Year Built:</span>
                          <p className="text-gray-900">{result.data.yearBuilt || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Est. Rent:</span>
                          <p className="text-gray-900">
                            ${result.data.monthlyRent?.toLocaleString() || 'N/A'}/mo
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium text-gray-600">Cap Rate:</span>
                          <p className="text-gray-900">{result.data.capRate || 'N/A'}%</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">NOI:</span>
                          <p className="text-gray-900">
                            ${result.data.noi?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Units:</span>
                          <p className="text-gray-900">{result.data.numberOfUnits || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Occupancy:</span>
                          <p className="text-gray-900">{result.data.occupancy || 'N/A'}%</p>
                        </div>
                      </>
                    )}
                  </div>

                  {result.data.images && result.data.images.length > 0 && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-600">Images:</span>
                      <p className="text-gray-900">{result.data.images.length} images available</p>
                    </div>
                  )}

                  {/* Raw Data Toggle */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-accent hover:text-accent/80 font-medium">
                      View Raw Data
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-red-800 mb-2">
                ❌ Scraping Failed
              </h3>
              <p className="text-red-600 text-sm">{result.error}</p>
              <p className="text-red-500 text-xs mt-1">{result.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">ℹ️ How to Use</h4>
        <ol className="text-sm text-blue-600 space-y-1">
          <li>1. Select the property source (Zillow or LoopNet)</li>
          <li>2. Enter a valid property URL from the selected source</li>
          <li>3. Click "Scrape" to fetch property data</li>
          <li>4. Review the scraped data and use it for analysis</li>
        </ol>
        <p className="text-xs text-blue-500 mt-3">
          Note: Scraping may take 30-60 seconds depending on the property size and network speed.
        </p>
      </div>
    </div>
  );
}