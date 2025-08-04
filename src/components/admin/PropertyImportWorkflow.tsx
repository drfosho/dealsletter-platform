'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MergedPropertyData } from '@/utils/property-data-merger';
import type { GeneratedAnalysis, AnalysisConfig } from '@/services/property-analysis-ai';

interface ImportStep {
  id: string;
  title: string;
  icon: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

interface TabContent {
  propertyData: MergedPropertyData | null;
  analysis: GeneratedAnalysis | null;
  preview: any;
}

interface DraftProperty {
  id: string;
  url: string;
  data: MergedPropertyData;
  analysis?: GeneratedAnalysis;
  createdAt: Date;
  status: 'draft' | 'processing' | 'complete';
}

export default function PropertyImportWorkflow() {
  // Core State
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  
  // Data State
  const [propertyData, setPropertyData] = useState<MergedPropertyData | null>(null);
  const [editedData, setEditedData] = useState<MergedPropertyData | null>(null);
  const [analysis, setAnalysis] = useState<GeneratedAnalysis | null>(null);
  const [editedAnalysis, setEditedAnalysis] = useState<GeneratedAnalysis | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'data' | 'analysis' | 'preview'>('data');
  const [currentStep, setCurrentStep] = useState<'input' | 'scraping' | 'analyzing' | 'editing' | 'saving'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Draft Management
  const [drafts, setDrafts] = useState<DraftProperty[]>([]);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  
  // Progress Tracking
  const [progress, setProgress] = useState({
    scraping: 0,
    enhancing: 0,
    analyzing: 0,
    overall: 0
  });

  // Analysis Configuration
  const [config, setConfig] = useState<AnalysisConfig>({
    strategy: 'rental',
    timeHorizon: 5,
    financingType: 'conventional',
    includeProjections: true,
    includeComparables: true,
    analysisDepth: 'comprehensive'
  });

  // URL Validation
  useEffect(() => {
    if (!url) {
      setIsValidUrl(false);
      setUrlError('');
      return;
    }

    try {
      const urlObj = new URL(url);
      const validDomains = ['zillow.com', 'loopnet.com', 'realtor.com', 'redfin.com'];
      const isValid = validDomains.some(domain => urlObj.hostname.includes(domain));
      
      if (!isValid) {
        setUrlError('Please enter a URL from Zillow, LoopNet, Realtor.com, or Redfin');
        setIsValidUrl(false);
      } else {
        setUrlError('');
        setIsValidUrl(true);
      }
    } catch {
      setUrlError('Please enter a valid URL');
      setIsValidUrl(false);
    }
  }, [url]);

  // Load drafts from localStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem('propertyImportDrafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
  }, []);

  // Save drafts to localStorage
  const saveDraft = useCallback(() => {
    if (!propertyData) return;
    
    const draft: DraftProperty = {
      id: currentDraftId || Date.now().toString(),
      url,
      data: editedData || propertyData,
      analysis: editedAnalysis || analysis || undefined,
      createdAt: new Date(),
      status: 'draft'
    };
    
    const updatedDrafts = currentDraftId
      ? drafts.map(d => d.id === currentDraftId ? draft : d)
      : [...drafts, draft];
    
    setDrafts(updatedDrafts);
    localStorage.setItem('propertyImportDrafts', JSON.stringify(updatedDrafts));
    setCurrentDraftId(draft.id);
    
    return draft.id;
  }, [propertyData, editedData, analysis, editedAnalysis, url, drafts, currentDraftId]);

  // Handle URL submission
  const handleUrlSubmit = async () => {
    if (!isValidUrl) return;
    
    setCurrentStep('scraping');
    setIsLoading(true);
    setError(null);
    setProgress({ scraping: 0, enhancing: 0, analyzing: 0, overall: 0 });
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          scraping: Math.min(prev.scraping + 10, 90),
          overall: Math.min(prev.overall + 3, 30)
        }));
      }, 500);
      
      setLoadingMessage('Scraping property data from ' + new URL(url).hostname + '...');
      
      // Scrape and enhance data
      const response = await fetch('/api/admin/scrape-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          includeRentCast: true,
          includeEstimates: true
        })
      });
      
      clearInterval(progressInterval);
      setProgress(prev => ({ ...prev, scraping: 100, overall: 40 }));
      
      if (!response.ok) {
        throw new Error('Failed to scrape property data');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Scraping failed');
      }
      
      setPropertyData(result.data);
      setEditedData(result.data);
      
      // Auto-proceed to analysis
      await generateAnalysis(result.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import property');
      setCurrentStep('input');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Generate AI analysis
  const generateAnalysis = async (data: MergedPropertyData) => {
    setCurrentStep('analyzing');
    setLoadingMessage('Generating comprehensive investment analysis...');
    
    try {
      // Update progress
      const progressInterval = setInterval(() => {
        setProgress(prev => ({
          ...prev,
          analyzing: Math.min(prev.analyzing + 15, 90),
          overall: Math.min(prev.overall + 5, 70)
        }));
      }, 800);
      
      const response = await fetch('/api/admin/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyData: data,
          config
        })
      });
      
      clearInterval(progressInterval);
      setProgress(prev => ({ ...prev, analyzing: 100, overall: 80 }));
      
      if (!response.ok) {
        throw new Error('Failed to generate analysis');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Analysis generation failed');
      }
      
      setAnalysis(result.analysis);
      setEditedAnalysis(result.analysis);
      setCurrentStep('editing');
      setProgress(prev => ({ ...prev, overall: 100 }));
      
      // Auto-save as draft
      saveDraft();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
    }
  };

  // Handle data field edit
  const handleDataEdit = (field: string, value: any) => {
    if (!editedData) return;
    
    setEditedData({
      ...editedData,
      [field]: value
    });
  };

  // Handle analysis field edit
  const handleAnalysisEdit = (field: string, value: any) => {
    if (!editedAnalysis) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditedAnalysis({
        ...editedAnalysis,
        [parent]: {
          ...(editedAnalysis as any)[parent],
          [child]: value
        }
      });
    } else {
      setEditedAnalysis({
        ...editedAnalysis,
        [field]: value
      });
    }
  };

  // Save to dashboard
  const handleSaveToDashboard = async () => {
    if (!editedData || !editedAnalysis) return;
    
    setCurrentStep('saving');
    setIsLoading(true);
    setLoadingMessage('Saving to dashboard...');
    
    try {
      const dashboardProperty = {
        ...editedData,
        ...editedAnalysis.financialAnalysis,
        strategicOverview: editedAnalysis.strategicOverview,
        executiveSummary: editedAnalysis.executiveSummary,
        investmentThesis: editedAnalysis.investmentThesis,
        marketAnalysis: editedAnalysis.marketAnalysis,
        riskAssessment: editedAnalysis.riskAssessment,
        valueAddOpportunities: editedAnalysis.valueAddOpportunities,
        exitStrategy: editedAnalysis.exitStrategy,
        recommendedActions: editedAnalysis.recommendedActions,
        investmentStrategy: config.strategy,
        confidence: editedAnalysis.confidenceScore > 80 ? 'high' : 
                   editedAnalysis.confidenceScore > 60 ? 'medium' : 'low',
        riskLevel: editedAnalysis.riskAssessment.riskLevel,
        status: 'active',
        isDraft: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dashboardProperty)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save property');
      }
      
      // Clear draft if saved
      if (currentDraftId) {
        const updatedDrafts = drafts.filter(d => d.id !== currentDraftId);
        setDrafts(updatedDrafts);
        localStorage.setItem('propertyImportDrafts', JSON.stringify(updatedDrafts));
      }
      
      // Reset workflow
      setTimeout(() => {
        setUrl('');
        setPropertyData(null);
        setEditedData(null);
        setAnalysis(null);
        setEditedAnalysis(null);
        setCurrentStep('input');
        setCurrentDraftId(null);
        setProgress({ scraping: 0, enhancing: 0, analyzing: 0, overall: 0 });
      }, 1500);
      
      alert('Property successfully saved to dashboard!');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save property');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Load draft
  const loadDraft = (draft: DraftProperty) => {
    setUrl(draft.url);
    setPropertyData(draft.data);
    setEditedData(draft.data);
    if (draft.analysis) {
      setAnalysis(draft.analysis);
      setEditedAnalysis(draft.analysis);
    }
    setCurrentDraftId(draft.id);
    setCurrentStep('editing');
  };

  // Delete draft
  const deleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('propertyImportDrafts', JSON.stringify(updatedDrafts));
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Property Import Workflow</h1>
        <p className="text-muted text-sm mt-1">
          Convert property URLs into comprehensive dashboard analyses
        </p>
      </div>

      {/* Progress Bar */}
      {currentStep !== 'input' && (
        <div className="mb-6 bg-card rounded-xl p-4">
          <div className="flex justify-between text-sm text-muted mb-2">
            <span>{loadingMessage || 'Processing...'}</span>
            <span>{progress.overall}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.overall}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-600 mr-2">⚠️</span>
            <div className="flex-1">
              <p className="text-red-600 font-medium">Error</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentStep === 'input' ? (
        <div className="space-y-6">
          {/* URL Input Section */}
          <div className="bg-card rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Import Property</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Property URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.zillow.com/homedetails/..."
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent transition-colors ${
                      urlError ? 'border-red-300 focus:ring-red-200' : 'border-border'
                    }`}
                  />
                  <button
                    onClick={handleUrlSubmit}
                    disabled={!isValidUrl || isLoading}
                    className="px-8 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Import
                  </button>
                </div>
                {urlError && (
                  <p className="text-red-500 text-sm mt-2">{urlError}</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 text-sm">
                <span className="text-muted">Supported:</span>
                <button
                  onClick={() => setUrl('https://www.zillow.com/homedetails/example')}
                  className="text-accent hover:underline"
                >
                  Zillow
                </button>
                <span className="text-muted">•</span>
                <button
                  onClick={() => setUrl('https://www.loopnet.com/Listing/example')}
                  className="text-accent hover:underline"
                >
                  LoopNet
                </button>
                <span className="text-muted">•</span>
                <button
                  onClick={() => setUrl('https://www.realtor.com/realestateandhomes-detail/example')}
                  className="text-accent hover:underline"
                >
                  Realtor.com
                </button>
                <span className="text-muted">•</span>
                <button
                  onClick={() => setUrl('https://www.redfin.com/example')}
                  className="text-accent hover:underline"
                >
                  Redfin
                </button>
              </div>
            </div>
          </div>

          {/* Saved Drafts */}
          {drafts.length > 0 && (
            <div className="bg-card rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">
                Saved Drafts ({drafts.length})
              </h2>
              
              <div className="space-y-3">
                {drafts.map(draft => (
                  <div
                    key={draft.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {draft.data.address}, {draft.data.city}
                      </p>
                      <p className="text-sm text-muted">
                        Saved {new Date(draft.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadDraft(draft)}
                        className="px-4 py-2 text-accent border border-accent rounded-lg hover:bg-accent/10"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteDraft(draft.id)}
                        className="px-4 py-2 text-red-500 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : currentStep === 'scraping' || currentStep === 'analyzing' ? (
        <div className="bg-card rounded-xl p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {currentStep === 'scraping' ? 'Scraping Property Data' : 'Generating Analysis'}
            </h2>
            <p className="text-muted">
              {currentStep === 'scraping' 
                ? 'Extracting property details and enhancing with market data...'
                : 'Using AI to create comprehensive investment analysis...'}
            </p>
            
            {/* Sub-progress indicators */}
            <div className="mt-6 space-y-3 max-w-md mx-auto">
              {currentStep === 'scraping' ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span>Scraping property data</span>
                    <span className="text-muted">{progress.scraping}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Enhancing with RentCast</span>
                    <span className="text-muted">{progress.enhancing}%</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span>Analyzing with Claude AI</span>
                  <span className="text-muted">{progress.analyzing}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : currentStep === 'editing' && editedData && editedAnalysis ? (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-card rounded-xl">
            <div className="border-b border-border">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'data'
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  Property Data
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'analysis'
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  Analysis
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Property Data Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={editedData.address}
                          onChange={(e) => handleDataEdit('address', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={editedData.city}
                          onChange={(e) => handleDataEdit('city', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={editedData.state}
                          onChange={(e) => handleDataEdit('state', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={editedData.zipCode}
                          onChange={(e) => handleDataEdit('zipCode', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Bedrooms
                        </label>
                        <input
                          type="number"
                          value={editedData.bedrooms || ''}
                          onChange={(e) => handleDataEdit('bedrooms', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Bathrooms
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={editedData.bathrooms || ''}
                          onChange={(e) => handleDataEdit('bathrooms', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Square Feet
                        </label>
                        <input
                          type="number"
                          value={editedData.squareFootage || ''}
                          onChange={(e) => handleDataEdit('squareFootage', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Year Built
                        </label>
                        <input
                          type="number"
                          value={editedData.yearBuilt || ''}
                          onChange={(e) => handleDataEdit('yearBuilt', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Lot Size (sqft)
                        </label>
                        <input
                          type="number"
                          value={editedData.lotSize || ''}
                          onChange={(e) => handleDataEdit('lotSize', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Property Type
                        </label>
                        <select
                          value={editedData.propertyType}
                          onChange={(e) => handleDataEdit('propertyType', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        >
                          <option value="single-family">Single Family</option>
                          <option value="multi-family">Multi-Family</option>
                          <option value="condo">Condo</option>
                          <option value="townhouse">Townhouse</option>
                          <option value="commercial">Commercial</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          List Price
                        </label>
                        <input
                          type="number"
                          value={editedData.price || ''}
                          onChange={(e) => handleDataEdit('price', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Monthly Rent Estimate
                        </label>
                        <input
                          type="number"
                          value={editedData.monthlyRent || ''}
                          onChange={(e) => handleDataEdit('monthlyRent', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          Property Taxes (Annual)
                        </label>
                        <input
                          type="number"
                          value={editedData.propertyTaxes || ''}
                          onChange={(e) => handleDataEdit('propertyTaxes', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted mb-1">
                          HOA Fees (Monthly)
                        </label>
                        <input
                          type="number"
                          value={editedData.hoaFees || ''}
                          onChange={(e) => handleDataEdit('hoaFees', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  {editedData.images && editedData.images.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Property Images</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {editedData.images.slice(0, 8).map((image, idx) => (
                          <div key={idx} className="relative aspect-square">
                            <img
                              src={image}
                              alt={`Property ${idx + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data Quality Indicator */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Data Completeness</p>
                        <p className="text-sm text-muted">
                          {editedData.dataCompleteness.missingFields.length > 0
                            ? `Missing: ${editedData.dataCompleteness.missingFields.join(', ')}`
                            : 'All required fields present'}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-accent">
                        {editedData.dataCompleteness.score}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Tab */}
              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  {/* Strategic Overview */}
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      Strategic Overview
                    </label>
                    <textarea
                      value={editedAnalysis.strategicOverview}
                      onChange={(e) => handleAnalysisEdit('strategicOverview', e.target.value)}
                      className="w-full h-32 px-4 py-3 border border-border rounded-lg"
                    />
                  </div>

                  {/* Executive Summary */}
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      Executive Summary
                    </label>
                    <textarea
                      value={editedAnalysis.executiveSummary}
                      onChange={(e) => handleAnalysisEdit('executiveSummary', e.target.value)}
                      className="w-full h-32 px-4 py-3 border border-border rounded-lg"
                    />
                  </div>

                  {/* Financial Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Financial Metrics</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted">Monthly Cash Flow</p>
                        <p className="text-2xl font-bold">
                          ${editedAnalysis.financialAnalysis.monthlyCashFlow.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted">Cap Rate</p>
                        <p className="text-2xl font-bold">
                          {editedAnalysis.financialAnalysis.capRate}%
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted">Cash-on-Cash Return</p>
                        <p className="text-2xl font-bold">
                          {editedAnalysis.financialAnalysis.cashOnCashReturn}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Risk Level:</span>
                        <select
                          value={editedAnalysis.riskAssessment.riskLevel}
                          onChange={(e) => handleAnalysisEdit('riskAssessment.riskLevel', e.target.value)}
                          className="px-3 py-1 border border-border rounded-lg"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Primary Risks:</p>
                        <ul className="space-y-1">
                          {editedAnalysis.riskAssessment.primaryRisks.map((risk, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-accent mr-2">•</span>
                              <span className="text-sm">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Analysis Confidence</p>
                        <p className="text-sm text-muted">
                          Based on data completeness and quality
                        </p>
                      </div>
                      <div className="text-3xl font-bold text-accent">
                        {editedAnalysis.confidenceScore}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">
                      {editedData.address}
                    </h3>
                    <p className="text-muted mb-4">
                      {editedData.city}, {editedData.state} {editedData.zipCode}
                    </p>
                    
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-muted">Price</p>
                        <p className="font-semibold">
                          ${editedData.price?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted">Beds/Baths</p>
                        <p className="font-semibold">
                          {editedData.bedrooms}/{editedData.bathrooms}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted">Sqft</p>
                        <p className="font-semibold">
                          {editedData.squareFootage?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted">Cap Rate</p>
                        <p className="font-semibold">
                          {editedAnalysis.financialAnalysis.capRate}%
                        </p>
                      </div>
                    </div>

                    <div className="prose max-w-none">
                      <h4 className="text-lg font-semibold mb-2">Strategic Overview</h4>
                      <p className="text-sm whitespace-pre-wrap">
                        {editedAnalysis.strategicOverview}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={saveDraft}
                className="px-6 py-3 border border-border rounded-lg hover:bg-gray-50"
              >
                Save Draft
              </button>
              <button
                onClick={() => generateAnalysis(editedData)}
                className="px-6 py-3 border border-accent text-accent rounded-lg hover:bg-accent/10"
              >
                Regenerate Analysis
              </button>
            </div>
            <button
              onClick={handleSaveToDashboard}
              disabled={isLoading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Save to Dashboard
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}