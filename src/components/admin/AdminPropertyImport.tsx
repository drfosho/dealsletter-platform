'use client';

import { useState } from 'react';
import type { MergedPropertyData } from '@/utils/property-data-merger';
import type { GeneratedAnalysis, AnalysisConfig } from '@/services/property-analysis-ai';
import PropertyPreviewModal from './PropertyPreviewModal';
import { getStrategyInterestRate, formatInterestRate } from '@/utils/interest-rates';

interface AdminStep {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  description: string;
}

interface ProcessingProperty {
  id: string;
  url: string;
  status: 'pending' | 'scraping' | 'reviewing' | 'analyzing' | 'ready' | 'published' | 'error';
  scrapedData?: MergedPropertyData;
  editedData?: MergedPropertyData;
  analysis?: GeneratedAnalysis;
  error?: string;
  step: string;
}

export default function AdminPropertyImport() {
  // Core state
  const [urlInput, setUrlInput] = useState('');
  const [properties, setProperties] = useState<ProcessingProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<ProcessingProperty | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewProperty, setPreviewProperty] = useState<ProcessingProperty | null>(null);
  
  // Admin workflow steps
  const [currentStep, setCurrentStep] = useState<AdminStep>({
    id: 1,
    name: 'Enter URLs',
    status: 'active',
    description: 'Paste property URLs to import'
  });

  // Analysis configuration
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    strategy: 'rental',
    timeHorizon: 5,
    financingType: 'conventional',
    includeProjections: true,
    includeComparables: true,
    analysisDepth: 'comprehensive'
  });
  
  // Custom analysis notes
  const [customAnalysisNotes, setCustomAnalysisNotes] = useState<Record<string, string>>({});

  // Parse URLs from input
  const parseUrls = (text: string): string[] => {
    const lines = text.split('\n');
    const validUrls: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        try {
          const url = new URL(trimmed);
          const validDomains = ['zillow.com', 'loopnet.com', 'realtor.com', 'redfin.com'];
          if (validDomains.some(domain => url.hostname.includes(domain))) {
            validUrls.push(trimmed);
          }
        } catch {
          // Skip invalid URLs
        }
      }
    });
    
    return validUrls;
  };

  // Step 1: Add URLs to queue
  const handleAddUrls = () => {
    const urls = parseUrls(urlInput);
    if (urls.length === 0) {
      alert('Please enter at least one valid property URL');
      return;
    }

    const newProperties: ProcessingProperty[] = urls.map(url => ({
      id: Date.now().toString() + Math.random(),
      url,
      status: 'pending',
      step: 'Queued for scraping'
    }));

    setProperties(newProperties);
    setUrlInput('');
    setCurrentStep({
      id: 2,
      name: 'Scraping Data',
      status: 'active',
      description: 'Fetching property information'
    });

    // Start scraping process
    scrapeProperties(newProperties);
  };

  // Step 2: Scrape properties
  const scrapeProperties = async (propertiesToScrape: ProcessingProperty[]) => {
    setIsProcessing(true);

    for (const property of propertiesToScrape) {
      try {
        // Update status
        setProperties(prev => prev.map(p => 
          p.id === property.id 
            ? { ...p, status: 'scraping', step: 'Scraping property data...' }
            : p
        ));

        // Call scrape API
        const response = await fetch('/api/admin/scrape-property', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: property.url,
            includeRentCast: true,
            clearCache: true, // Force fresh scrape for better data
            includeEstimates: true
          })
        });

        const result = await response.json();

        if (result.success && result.data) {
          // Update with scraped data
          setProperties(prev => prev.map(p => 
            p.id === property.id 
              ? { 
                  ...p, 
                  status: 'reviewing',
                  scrapedData: result.data,
                  editedData: result.data,
                  step: 'Ready for admin review'
                }
              : p
          ));
        } else {
          throw new Error(result.message || 'Failed to scrape');
        }
      } catch (error) {
        // Mark as error
        setProperties(prev => prev.map(p => 
          p.id === property.id 
            ? { 
                ...p, 
                status: 'error',
                error: error instanceof Error ? error.message : 'Scraping failed',
                step: 'Failed to scrape'
              }
            : p
        ));
      }
    }

    setIsProcessing(false);
    setCurrentStep({
      id: 3,
      name: 'Review Data',
      status: 'active',
      description: 'Review and edit scraped property data'
    });
  };

  // Step 3: Admin reviews/edits data
  const handleDataEdit = (propertyId: string, field: string, value: any) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId && p.editedData) {
        return {
          ...p,
          editedData: {
            ...p.editedData,
            [field]: value
          }
        };
      }
      return p;
    }));
  };

  // Step 4: Generate analysis for selected property
  const handleGenerateAnalysis = async (property: ProcessingProperty) => {
    if (!property.editedData) return;

    // Update status
    setProperties(prev => prev.map(p => 
      p.id === property.id 
        ? { ...p, status: 'analyzing', step: 'Generating AI analysis...' }
        : p
    ));

    try {
      const response = await fetch('/api/admin/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyData: property.editedData,
          config: analysisConfig,
          customNotes: customAnalysisNotes[property.id] || null
        })
      });

      const result = await response.json();

      if (result.success && result.analysis) {
        setProperties(prev => prev.map(p => 
          p.id === property.id 
            ? { 
                ...p, 
                status: 'ready',
                analysis: result.analysis,
                step: 'Analysis complete - ready to publish'
              }
            : p
        ));
      } else {
        throw new Error(result.message || 'Analysis failed');
      }
    } catch (error) {
      setProperties(prev => prev.map(p => 
        p.id === property.id 
          ? { 
              ...p, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Analysis failed',
              step: 'Failed to generate analysis'
            }
          : p
      ));
    }
  };

  // Step 5: Publish to dashboard
  const handlePublishProperty = async (property: ProcessingProperty) => {
    if (!property.editedData || !property.analysis) return;

    // Update status
    setProperties(prev => prev.map(p => 
      p.id === property.id 
        ? { ...p, step: 'Publishing to dashboard...' }
        : p
    ));

    try {
      // Calculate financial metrics
      const price = property.editedData.price || 0;
      const rehabCost = property.editedData.estimatedRehab || 0;
      const totalInvestment = price + rehabCost;
      const downPaymentPercent = analysisConfig.strategy === 'flip' ? 20 : 25; // 20% for flips, 25% for rentals
      const downPayment = Math.round(price * (downPaymentPercent / 100));
      const estimatedProfit = analysisConfig.strategy === 'flip' ? Math.round(totalInvestment * 0.25) : 0;
      const arv = analysisConfig.strategy === 'flip' ? totalInvestment + estimatedProfit : 0;

      // Determine listing source from URL
      const getListingSource = (url: string): string => {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('zillow.com')) return 'Zillow';
        if (lowerUrl.includes('loopnet.com')) return 'LoopNet';
        if (lowerUrl.includes('realtor.com')) return 'Realtor.com';
        if (lowerUrl.includes('redfin.com')) return 'Redfin';
        return 'Other';
      };

      // Prepare dashboard property data
      const dashboardProperty = {
        ...property.editedData,
        ...property.analysis.financialAnalysis,
        strategicOverview: property.analysis.strategicOverview,
        executiveSummary: property.analysis.executiveSummary,
        investmentThesis: property.analysis.investmentThesis,
        marketAnalysis: property.analysis.marketAnalysis,
        riskAssessment: property.analysis.riskAssessment,
        valueAddOpportunities: property.analysis.valueAddOpportunities,
        exitStrategy: property.analysis.exitStrategy,
        recommendedActions: property.analysis.recommendedActions,
        investmentStrategy: analysisConfig.strategy,
        strategy: analysisConfig.strategy === 'flip' ? 'Fix & Flip' : 
                  analysisConfig.strategy === 'brrrr' ? 'BRRRR' :
                  analysisConfig.strategy === 'airbnb' ? 'Short-term Rental' :
                  analysisConfig.strategy === 'commercial' ? 'Commercial' : 'Buy & Hold',
        estimatedRehab: rehabCost,
        totalInvestment: totalInvestment,
        arv: arv,
        expectedProfit: estimatedProfit,
        downPayment: downPayment,
        downPaymentPercent: downPaymentPercent,
        // Use strategy default interest rate
        interestRate: (() => {
          const strategyMap = {
            'flip': 'Fix & Flip',
            'brrrr': 'BRRRR',
            'rental': 'Buy & Hold',
            'airbnb': 'Short-Term Rental',
            'commercial': 'Commercial'
          };
          const strategy = strategyMap[analysisConfig.strategy] || 'Buy & Hold';
          const units = property.editedData.units || 1;
          const rateInfo = getStrategyInterestRate(strategy, property.editedData.propertyType, units);
          return rateInfo.default;
        })(),
        confidence: property.analysis.confidenceScore > 80 ? 'high' : 
                   property.analysis.confidenceScore > 60 ? 'medium' : 'low',
        riskLevel: property.analysis.riskAssessment.riskLevel,
        status: 'active',
        isDraft: false,
        // Add listing URL and source
        listingUrl: property.url,
        listingSource: getListingSource(property.url),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to dashboard
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dashboardProperty)
      });

      if (response.ok) {
        setProperties(prev => prev.map(p => 
          p.id === property.id 
            ? { ...p, status: 'published', step: '✓ Published to dashboard' }
            : p
        ));
        
        // Refresh parent component's property list
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Failed to save to dashboard');
      }
    } catch (error) {
      setProperties(prev => prev.map(p => 
        p.id === property.id 
          ? { 
              ...p, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Publishing failed',
              step: 'Failed to publish'
            }
          : p
      ));
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'scraping': return 'bg-blue-100 text-blue-700';
      case 'reviewing': return 'bg-yellow-100 text-yellow-700';
      case 'analyzing': return 'bg-purple-100 text-purple-700';
      case 'ready': return 'bg-green-100 text-green-700';
      case 'published': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-card rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Property Import</h2>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { id: 1, name: 'Enter URLs' },
            { id: 2, name: 'Scrape Data' },
            { id: 3, name: 'Review & Edit' },
            { id: 4, name: 'Generate Analysis' },
            { id: 5, name: 'Publish' }
          ].map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${currentStep.id >= step.id ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'}
              `}>
                {currentStep.id > step.id ? '✓' : step.id}
              </div>
              {idx < 4 && (
                <div className={`
                  w-20 h-1 mx-2
                  ${currentStep.id > step.id ? 'bg-accent' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center mt-4 text-sm text-muted">
          {currentStep.description}
        </p>
      </div>

      {/* URL Input Section */}
      {currentStep.id === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Property URLs (one per line)
            </label>
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.zillow.com/homedetails/...
https://www.loopnet.com/...
https://www.realtor.com/..."
              className="w-full h-32 px-4 py-3 border border-border rounded-lg font-mono text-sm"
              disabled={isProcessing}
            />
            <p className="text-sm text-muted mt-2">
              {parseUrls(urlInput).length} valid URLs detected
            </p>
          </div>
          
          <button
            onClick={handleAddUrls}
            disabled={parseUrls(urlInput).length === 0 || isProcessing}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
          >
            Start Import Process
          </button>
        </div>
      )}

      {/* Properties List */}
      {properties.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Processing Queue</h3>
          
          {properties.map(property => (
            <div
              key={property.id}
              className="border border-border rounded-lg p-4 hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{property.url}</p>
                  {property.scrapedData && (
                    <p className="text-sm text-primary mt-1">
                      {property.scrapedData.address}, {property.scrapedData.city}, {property.scrapedData.state}
                    </p>
                  )}
                  <p className="text-xs text-muted mt-1">{property.step}</p>
                  {property.error && (
                    <p className="text-xs text-red-500 mt-1">{property.error}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${getStatusColor(property.status)}
                  `}>
                    {property.status}
                  </span>
                  
                  {/* Action Buttons */}
                  {property.status === 'reviewing' && property.editedData && (
                    <button
                      onClick={() => setSelectedProperty(property)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Review Data
                    </button>
                  )}
                  
                  {property.status === 'reviewing' && !property.analysis && (
                    <button
                      onClick={() => handleGenerateAnalysis(property)}
                      className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                      Generate Analysis
                    </button>
                  )}
                  
                  {property.status === 'ready' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewProperty(property)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handlePublishProperty(property)}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Publish to Dashboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Review Modal */}
      {selectedProperty && selectedProperty.editedData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 rounded-xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Review Property Data</h3>
            
            {/* Price Warning Banner */}
            {selectedProperty.editedData.isOnMarket && 
             selectedProperty.editedData.listingPrice && 
             selectedProperty.editedData.avm && 
             Math.abs(selectedProperty.editedData.listingPrice - selectedProperty.editedData.avm) > 50000 && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-900">Price Notice</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Price Shown: <strong>AVM Estimate ${selectedProperty.editedData.avm?.toLocaleString()}</strong>
                    </p>
                    <p className="text-sm text-gray-700">
                      List Price: <strong>${selectedProperty.editedData.listingPrice?.toLocaleString()}</strong> 
                      ({((selectedProperty.editedData.listingPrice - selectedProperty.editedData.avm) / selectedProperty.editedData.avm * 100).toFixed(1)}% 
                      {selectedProperty.editedData.listingPrice > selectedProperty.editedData.avm ? 'higher' : 'lower'})
                    </p>
                    <p className="text-sm text-amber-700 mt-2">
                      ⚠️ Update purchase price to reflect actual listing price for accurate analysis.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={selectedProperty.editedData.address}
                  onChange={(e) => handleDataEdit(selectedProperty.id, 'address', e.target.value)}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={selectedProperty.editedData.city}
                  onChange={(e) => handleDataEdit(selectedProperty.id, 'city', e.target.value)}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                  {selectedProperty.editedData.listingPrice && selectedProperty.editedData.listingPrice < 10000000 && (
                    <span className="ml-2 text-green-600">(Listing: ${selectedProperty.editedData.listingPrice.toLocaleString()})</span>
                  )}
                  {selectedProperty.editedData.avm && (
                    <span className="ml-2 text-blue-600">(AVM: ${selectedProperty.editedData.avm.toLocaleString()})</span>
                  )}
                </label>
                <input
                  type="number"
                  value={
                    selectedProperty.editedData.price && selectedProperty.editedData.price < 10000000 
                      ? selectedProperty.editedData.price 
                      : selectedProperty.editedData.listingPrice || selectedProperty.editedData.avm || ''
                  }
                  onChange={(e) => handleDataEdit(selectedProperty.id, 'price', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter property price"
                />
                {selectedProperty.editedData.price > 10000000 && (
                  <p className="text-red-500 text-xs mt-1">⚠️ Price seems incorrect. Using listing/AVM value instead.</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent {(selectedProperty.editedData.units ?? 0) > 1 ? '(Total)' : ''}
                  {selectedProperty.editedData.rentEstimate && (
                    <span className="ml-2 text-blue-600">(RentCast: ${selectedProperty.editedData.rentEstimate.toLocaleString()})</span>
                  )}
                </label>
                <input
                  type="number"
                  value={
                    selectedProperty.editedData.monthlyRent && selectedProperty.editedData.monthlyRent < 50000
                      ? selectedProperty.editedData.monthlyRent
                      : selectedProperty.editedData.rentEstimate || ''
                  }
                  onChange={(e) => {
                    const totalRent = parseInt(e.target.value) || 0;
                    handleDataEdit(selectedProperty.id, 'monthlyRent', totalRent);
                    
                    // Update per-unit rent for multi-family
                    if (selectedProperty.editedData && (selectedProperty.editedData.units ?? 0) > 1) {
                      handleDataEdit(selectedProperty.id, 'totalMonthlyRent', totalRent);
                      handleDataEdit(selectedProperty.id, 'rentPerUnit', Math.round(totalRent / (selectedProperty.editedData.units ?? 1)));
                    }
                  }}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter monthly rent"
                />
                {selectedProperty.editedData.monthlyRent && selectedProperty.editedData.monthlyRent > 50000 && (
                  <p className="text-red-500 text-xs mt-1">⚠️ Rent seems incorrect. Please enter a realistic monthly rent.</p>
                )}
                
                {/* Multi-Family Rent Breakdown */}
                {(selectedProperty.editedData.units ?? 0) > 1 && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rent Per Unit
                        <span className="text-xs text-gray-500 ml-2">
                          (Changes will update total rent)
                        </span>
                      </label>
                      <input
                        type="number"
                        value={selectedProperty.editedData.rentPerUnit || Math.round((selectedProperty.editedData.monthlyRent || 0) / (selectedProperty.editedData.units || 1))}
                        onChange={(e) => {
                          const perUnitRent = parseInt(e.target.value) || 0;
                          handleDataEdit(selectedProperty.id, 'rentPerUnit', perUnitRent);
                          
                          // Update total rent based on per-unit rent
                          const totalRent = perUnitRent * (selectedProperty.editedData?.units || 1);
                          handleDataEdit(selectedProperty.id, 'monthlyRent', totalRent);
                          handleDataEdit(selectedProperty.id, 'totalMonthlyRent', totalRent);
                        }}
                        className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter rent per unit"
                      />
                    </div>
                    
                    {selectedProperty.editedData.monthlyRent && (
                      <div className="p-2 bg-blue-50 rounded text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Calculation:</span>
                          <span className="font-medium">
                            {selectedProperty.editedData.units} units × ${(selectedProperty.editedData.rentPerUnit || Math.round((selectedProperty.editedData.monthlyRent || 0) / (selectedProperty.editedData.units || 1))).toLocaleString()}/mo
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-700 font-medium">Total Monthly Rent:</span>
                          <span className="font-bold text-green-600">
                            ${selectedProperty.editedData.monthlyRent.toLocaleString()}/mo
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={selectedProperty.editedData.bedrooms || ''}
                  onChange={(e) => handleDataEdit(selectedProperty.id, 'bedrooms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  step="0.5"
                  value={selectedProperty.editedData.bathrooms || ''}
                  onChange={(e) => handleDataEdit(selectedProperty.id, 'bathrooms', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              {/* Unit Count for Multi-Family */}
              {(selectedProperty.editedData.propertyType?.toLowerCase().includes('multi') ||
                selectedProperty.editedData.propertyType?.toLowerCase().includes('plex') ||
                selectedProperty.editedData.propertyType?.toLowerCase().includes('apartment') ||
                selectedProperty.editedData.description?.toLowerCase().includes('unit')) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Units
                    <span className="text-xs text-gray-500 ml-2">(Update if incorrect)</span>
                  </label>
                  <input
                    type="number"
                    value={selectedProperty.editedData.units || ''}
                    onChange={(e) => {
                      const units = parseInt(e.target.value) || 1;
                      handleDataEdit(selectedProperty.id, 'units', units);
                      handleDataEdit(selectedProperty.id, 'isMultiFamily', units > 1);
                      
                      // Update rental calculations if needed
                      if (selectedProperty.editedData?.monthlyRent && units > 1) {
                        const totalRent = selectedProperty.editedData.monthlyRent;
                        handleDataEdit(selectedProperty.id, 'totalMonthlyRent', totalRent);
                        handleDataEdit(selectedProperty.id, 'rentPerUnit', Math.round(totalRent / units));
                      }
                    }}
                    className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter number of units"
                    min="1"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                <input
                  type="number"
                  value={selectedProperty.editedData.squareFootage || ''}
                  onChange={(e) => handleDataEdit(selectedProperty.id, 'squareFootage', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                <input
                  type="number"
                  value={selectedProperty.editedData.yearBuilt || ''}
                  onChange={(e) => handleDataEdit(selectedProperty.id, 'yearBuilt', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={selectedProperty.editedData.description || ''}
                onChange={(e) => handleDataEdit(selectedProperty.id, 'description', e.target.value)}
                className="w-full h-24 px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Property description from listing..."
              />
            </div>
            
            {/* Strategy Selection */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Strategy</label>
                <select
                  value={analysisConfig.strategy}
                  onChange={(e) => setAnalysisConfig({...analysisConfig, strategy: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="rental">Buy & Hold Rental</option>
                  <option value="flip">Fix & Flip</option>
                  <option value="brrrr">BRRRR Strategy</option>
                  <option value="airbnb">Short-term Rental</option>
                  <option value="commercial">Commercial Investment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Horizon</label>
                <select
                  value={analysisConfig.timeHorizon}
                  onChange={(e) => setAnalysisConfig({...analysisConfig, timeHorizon: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="1">1 Year</option>
                  <option value="3">3 Years</option>
                  <option value="5">5 Years</option>
                  <option value="10">10 Years</option>
                  <option value="30">30 Years</option>
                </select>
              </div>
            </div>
            
            {/* Interest Rate Selection */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate
                {(() => {
                  const strategy = analysisConfig.strategy === 'rental' ? 'Buy & Hold' :
                                  analysisConfig.strategy === 'flip' ? 'Fix & Flip' :
                                  analysisConfig.strategy === 'brrrr' ? 'BRRRR' :
                                  analysisConfig.strategy === 'airbnb' ? 'Short-Term Rental' :
                                  'Commercial';
                  const rateInfo = getStrategyInterestRate(
                    strategy,
                    selectedProperty.editedData?.propertyType,
                    selectedProperty.editedData?.units
                  );
                  return (
                    <span className="text-xs text-gray-500 ml-2">
                      ({rateInfo.description})
                    </span>
                  );
                })()}
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    step="0.25"
                    min="3"
                    max="15"
                    value={(() => {
                      const strategy = analysisConfig.strategy === 'rental' ? 'Buy & Hold' :
                                      analysisConfig.strategy === 'flip' ? 'Fix & Flip' :
                                      analysisConfig.strategy === 'brrrr' ? 'BRRRR' :
                                      analysisConfig.strategy === 'airbnb' ? 'Short-Term Rental' :
                                      'Commercial';
                      const rateInfo = getStrategyInterestRate(
                        strategy,
                        selectedProperty.editedData?.propertyType,
                        selectedProperty.editedData?.units
                      );
                      return rateInfo.default;
                    })()}
                    onChange={(e) => {
                      // Since interestRate is not in MergedPropertyData, we'll handle this differently
                      // This is only used for analysis configuration, not stored in the property data
                      const newRate = parseFloat(e.target.value) || 0;
                      setAnalysisConfig(prev => ({ ...prev, interestRate: newRate }));
                    }}
                    className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {(() => {
                      const strategy = analysisConfig.strategy === 'rental' ? 'Buy & Hold' :
                                      analysisConfig.strategy === 'flip' ? 'Fix & Flip' :
                                      analysisConfig.strategy === 'brrrr' ? 'BRRRR' :
                                      analysisConfig.strategy === 'airbnb' ? 'Short-Term Rental' :
                                      'Commercial';
                      const rateInfo = getStrategyInterestRate(
                        strategy,
                        selectedProperty.editedData?.propertyType,
                        selectedProperty.editedData?.units
                      );
                      return `Typical range: ${formatInterestRate(rateInfo.min)} - ${formatInterestRate(rateInfo.max)}`;
                    })()}
                  </p>
                </div>
                
                <div>
                  <select
                    value={30}
                    onChange={() => {/* Loan term is fixed for now */}}
                    disabled
                    className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600 border-gray-300"
                  >
                    <option value="30">30 Year</option>
                    <option value="15">15 Year</option>
                    <option value="10">10 Year</option>
                    <option value="5">5 Year</option>
                  </select>
                  <p className="text-xs text-gray-600 mt-1">Loan term</p>
                </div>
              </div>
            </div>
            
            {/* Rehab Cost Estimator */}
            {(analysisConfig.strategy === 'flip' || analysisConfig.strategy === 'brrrr') && (
              <div className="mb-4 p-4 bg-amber-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Rehab Costs
                  {selectedProperty.editedData.squareFootage && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({selectedProperty.editedData.squareFootage.toLocaleString()} sq ft)
                    </span>
                  )}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rehabLevel"
                      value="cosmetic"
                      checked={(selectedProperty.editedData?.estimatedRehab || 0) <= (selectedProperty.editedData?.squareFootage || 1800) * 25}
                      onChange={() => {
                        const sqft = selectedProperty.editedData?.squareFootage || 1800;
                        handleDataEdit(selectedProperty.id, 'estimatedRehab', Math.round(sqft * 20));
                      }}
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <span className="font-medium">Cosmetic ($15-25/sq ft)</span>
                      <span className="text-sm text-gray-600 ml-2">
                        Paint, flooring, fixtures - ${((selectedProperty.editedData.squareFootage || 1800) * 20).toLocaleString()}
                      </span>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rehabLevel"
                      value="moderate"
                      checked={(selectedProperty.editedData.estimatedRehab || 0) > (selectedProperty.editedData.squareFootage || 1800) * 25 && 
                               (selectedProperty.editedData.estimatedRehab || 0) <= (selectedProperty.editedData.squareFootage || 1800) * 60}
                      onChange={() => {
                        const sqft = selectedProperty.editedData?.squareFootage || 1800;
                        handleDataEdit(selectedProperty.id, 'estimatedRehab', Math.round(sqft * 45));
                      }}
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <span className="font-medium">Moderate ($35-60/sq ft)</span>
                      <span className="text-sm text-gray-600 ml-2">
                        Kitchen, baths, systems - ${((selectedProperty.editedData.squareFootage || 1800) * 45).toLocaleString()}
                      </span>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rehabLevel"
                      value="major"
                      checked={(selectedProperty.editedData.estimatedRehab || 0) > (selectedProperty.editedData.squareFootage || 1800) * 60}
                      onChange={() => {
                        const sqft = selectedProperty.editedData?.squareFootage || 1800;
                        handleDataEdit(selectedProperty.id, 'estimatedRehab', Math.round(sqft * 85));
                      }}
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <span className="font-medium">Major ($70-100+/sq ft)</span>
                      <span className="text-sm text-gray-600 ml-2">
                        Full gut renovation - ${((selectedProperty.editedData.squareFootage || 1800) * 85).toLocaleString()}
                      </span>
                    </div>
                  </label>
                  
                  <div className="mt-2 pt-2 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Amount</label>
                    <input
                      type="number"
                      value={selectedProperty.editedData.estimatedRehab || ''}
                      onChange={(e) => handleDataEdit(selectedProperty.id, 'estimatedRehab', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter custom rehab budget"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Custom Analysis Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Analysis Instructions
                <span className="text-xs text-gray-500 ml-2">(Optional - for Claude AI)</span>
              </label>
              <textarea
                value={customAnalysisNotes[selectedProperty.id] || ''}
                onChange={(e) => setCustomAnalysisNotes({...customAnalysisNotes, [selectedProperty.id]: e.target.value})}
                className="w-full h-20 px-3 py-2 border rounded bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Focus on student rental potential, analyze for section 8 housing, consider renovation costs for luxury rental conversion..."
              />
            </div>
            
            {/* Data Completeness */}
            <div className="p-4 bg-blue-50 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Data Completeness</span>
                <span className="text-2xl font-bold text-blue-600">
                  {selectedProperty.editedData.dataCompleteness?.score || 0}%
                </span>
              </div>
              
              {/* Debug Info */}
              <div className="mt-2 text-xs text-gray-600 space-y-1">
                <div><strong>Address:</strong> {selectedProperty.editedData.address}, {selectedProperty.editedData.city}, {selectedProperty.editedData.state} {selectedProperty.editedData.zipCode}</div>
                <div><strong>Listing Price:</strong> {selectedProperty.editedData.listingPrice ? `$${selectedProperty.editedData.listingPrice.toLocaleString()}` : 'N/A'}</div>
                <div><strong>AVM Value:</strong> {selectedProperty.editedData.avm ? `$${selectedProperty.editedData.avm.toLocaleString()}` : 'N/A'}</div>
                <div><strong>Rent Estimate:</strong> {selectedProperty.editedData.rentEstimate ? `$${selectedProperty.editedData.rentEstimate.toLocaleString()}/mo` : 'N/A'}</div>
                <div><strong>Data Quality:</strong> Scraped: {selectedProperty.editedData.dataCompleteness?.sources?.scraped || 0}, RentCast: {selectedProperty.editedData.dataCompleteness?.sources?.rentcast || 0}, Estimated: {selectedProperty.editedData.dataCompleteness?.sources?.estimated || 0}</div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedProperty(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleGenerateAnalysis(selectedProperty);
                  setSelectedProperty(null);
                }}
                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
              >
                Save & Generate Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Preview Modal */}
      <PropertyPreviewModal
        isOpen={!!previewProperty}
        property={previewProperty?.editedData || null}
        analysis={previewProperty?.analysis || null}
        strategy={analysisConfig.strategy}
        onClose={() => setPreviewProperty(null)}
        onPublish={() => {
          if (previewProperty) {
            handlePublishProperty(previewProperty);
            setPreviewProperty(null);
          }
        }}
      />
    </div>
  );
}