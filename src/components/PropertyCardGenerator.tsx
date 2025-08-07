'use client';

import { useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import { parsePropertyAnalysis, ParsedProperty } from '@/utils/propertyAnalysisParser';
import { KANSAS_CITY_ARSENAL_DATA } from '@/app/tools/property-generator/test-data';

export default function PropertyCardGenerator() {
  const [analysisText, setAnalysisText] = useState('');
  const [generatedProperty, setGeneratedProperty] = useState<ParsedProperty | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleGenerate = () => {
    if (analysisText.trim()) {
      const parsed = parsePropertyAnalysis(analysisText);
      setGeneratedProperty(parsed);
      setShowPreview(true);
    }
  };

  const handleCopyJSON = () => {
    if (generatedProperty) {
      navigator.clipboard.writeText(JSON.stringify(generatedProperty, null, 2));
      alert('Property data copied to clipboard!');
    }
  };

  const handleReset = () => {
    setAnalysisText('');
    setGeneratedProperty(null);
    setShowPreview(false);
  };

  const handleLoadSample = () => {
    setAnalysisText(KANSAS_CITY_ARSENAL_DATA);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Property Card Generator</h1>
        <p className="text-muted">Paste property analysis text to generate a professional property card</p>
      </div>

      {!showPreview ? (
        <div className="space-y-6">
          <div>
            <label htmlFor="analysis" className="block text-sm font-medium text-primary mb-2">
              Property Analysis Text
            </label>
            <textarea
              id="analysis"
              value={analysisText}
              onChange={(e) => setAnalysisText(e.target.value)}
              className="w-full h-96 p-4 border border-border rounded-lg bg-card text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="Paste your property analysis text here...

Example format:
Kansas City Arsenal Apartments - Stabilized Cash Flow Machine!
📍 Address: 4017-4023 Harrison St, Kansas City, MO 64110
💰 Price: $1,740,000
🏢 Property: 12-Unit Apartment Complex
📊 Cap Rate: 6.7% Current | 7.8% Pro Forma
..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={!analysisText.trim()}
              className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Property Card
            </button>
            <button
              onClick={handleLoadSample}
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
            >
              Load Sample Data
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-muted/20 text-primary rounded-lg hover:bg-muted/30 transition-colors font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-primary">View Mode:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-accent text-white'
                      : 'bg-muted/20 text-primary hover:bg-muted/30'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-accent text-white'
                      : 'bg-muted/20 text-primary hover:bg-muted/30'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyJSON}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Copy JSON
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-muted/20 text-primary rounded-md hover:bg-muted/30 transition-colors text-sm font-medium"
              >
                New Property
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted/10 p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-primary mb-4">Preview</h2>
            <div className={viewMode === 'grid' ? 'max-w-md' : 'w-full'}>
              {generatedProperty && (
                <PropertyCard 
                  deal={generatedProperty} 
                  viewMode={viewMode}
                  isPreview={true}
                  onViewDetails={() => {
                    if (generatedProperty.listingUrl) {
                      window.open(generatedProperty.listingUrl, '_blank');
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Extracted Data */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-lg font-semibold text-primary mb-4">Extracted Data</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted">Title:</span>
                <p className="font-medium text-primary">{generatedProperty?.title}</p>
              </div>
              <div>
                <span className="text-muted">Location:</span>
                <p className="font-medium text-primary">{generatedProperty?.location}</p>
              </div>
              <div>
                <span className="text-muted">Price:</span>
                <p className="font-medium text-primary">${generatedProperty?.price.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted">Down Payment:</span>
                <p className="font-medium text-primary">${generatedProperty?.downPayment.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted">Strategy:</span>
                <p className="font-medium text-accent">{generatedProperty?.strategy}</p>
              </div>
              <div>
                <span className="text-muted">Risk Level:</span>
                <p className={`font-medium ${
                  generatedProperty?.riskLevel === 'low' ? 'text-green-600' :
                  generatedProperty?.riskLevel === 'high' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {generatedProperty?.riskLevel?.toUpperCase()}
                </p>
              </div>
              {generatedProperty?.proFormaCapRate && (
                <div>
                  <span className="text-muted">Pro Forma Cap:</span>
                  <p className="font-medium text-accent">{generatedProperty.proFormaCapRate}</p>
                </div>
              )}
              {generatedProperty?.roi && (
                <div>
                  <span className="text-muted">ROI:</span>
                  <p className="font-medium text-green-600">{generatedProperty.roi}</p>
                </div>
              )}
              {generatedProperty?.monthlyCashFlow && (
                <div>
                  <span className="text-muted">Cash Flow:</span>
                  <p className="font-medium text-green-600">${generatedProperty.monthlyCashFlow}/mo</p>
                </div>
              )}
            </div>
            {generatedProperty?.features && generatedProperty.features.length > 0 && (
              <div className="mt-4">
                <span className="text-muted text-sm">Features:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {generatedProperty.features.map((feature, idx) => (
                    <span key={idx} className="px-3 py-1 bg-muted/20 text-primary rounded-md text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {generatedProperty?.listingUrl && (
              <div className="mt-4">
                <span className="text-muted text-sm">Listing URL:</span>
                <a 
                  href={generatedProperty.listingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block mt-1 text-accent hover:underline text-sm"
                >
                  {generatedProperty.listingUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}