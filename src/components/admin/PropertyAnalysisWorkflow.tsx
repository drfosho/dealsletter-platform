'use client';

import { useState, useEffect } from 'react';
import type { MergedPropertyData } from '@/utils/property-data-merger';
import type { GeneratedAnalysis, AnalysisConfig } from '@/services/property-analysis-ai';

interface WorkflowStep {
  id: number;
  title: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

export default function PropertyAnalysisWorkflow() {
  // Workflow state
  const [currentStep, setCurrentStep] = useState(1);
  const [steps] = useState<WorkflowStep[]>([
    { id: 1, title: 'Enter URL', status: 'active' },
    { id: 2, title: 'Scrape & Enhance', status: 'pending' },
    { id: 3, title: 'Configure Analysis', status: 'pending' },
    { id: 4, title: 'Generate AI Analysis', status: 'pending' },
    { id: 5, title: 'Review & Edit', status: 'pending' },
    { id: 6, title: 'Save to Dashboard', status: 'pending' }
  ]);

  // Data state
  const [url, setUrl] = useState('');
  const [propertyData, setPropertyData] = useState<MergedPropertyData | null>(null);
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    strategy: 'rental',
    timeHorizon: 5,
    financingType: 'conventional',
    includeProjections: true,
    includeComparables: true,
    analysisDepth: 'comprehensive'
  });
  const [_generatedAnalysis, setGeneratedAnalysis] = useState<GeneratedAnalysis | null>(null);
  const [editedAnalysis, setEditedAnalysis] = useState<GeneratedAnalysis | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Update step statuses
  useEffect(() => {
    steps.map(step => {
      if (step.id < currentStep) return { ...step, status: 'complete' as const };
      if (step.id === currentStep) return { ...step, status: 'active' as const };
      return { ...step, status: 'pending' as const };
    });
  }, [currentStep, steps]);

  // Step 1: Enter URL
  const handleUrlSubmit = () => {
    if (!url) {
      setError('Please enter a property URL');
      return;
    }
    
    if (!url.includes('zillow.com') && !url.includes('loopnet.com')) {
      setError('URL must be from Zillow or LoopNet');
      return;
    }
    
    setError(null);
    setCurrentStep(2);
    handleScrapeAndEnhance();
  };

  // Step 2: Scrape and Enhance
  const handleScrapeAndEnhance = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/scrape-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          includeRentCast: true,
          includeEstimates: true
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to scrape property');
      }
      
      setPropertyData(result.data);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape property');
      console.error('Scraping error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Configure Analysis
  const handleConfigSubmit = () => {
    setCurrentStep(4);
    handleGenerateAnalysis();
  };

  // Step 4: Generate AI Analysis
  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyData,
          config: analysisConfig
        })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate analysis');
      }
      
      setGeneratedAnalysis(result.analysis);
      setEditedAnalysis(result.analysis);
      setCurrentStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
      console.error('Analysis generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5: Review and Edit
  const handleEditAnalysis = (field: string, value: any) => {
    if (!editedAnalysis) return;
    
    setEditedAnalysis({
      ...editedAnalysis,
      [field]: value
    });
  };

  // Step 6: Save to Dashboard
  const handleSaveToDashboard = async () => {
    if (!propertyData || !editedAnalysis) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare dashboard property data
      const dashboardProperty = {
        ...propertyData,
        ...editedAnalysis.financialAnalysis,
        strategicOverview: editedAnalysis.strategicOverview,
        executiveSummary: editedAnalysis.executiveSummary,
        investmentThesis: editedAnalysis.investmentThesis,
        marketAnalysis: editedAnalysis.marketAnalysis,
        riskAssessment: editedAnalysis.riskAssessment,
        valueAddOpportunities: editedAnalysis.valueAddOpportunities,
        exitStrategy: editedAnalysis.exitStrategy,
        recommendedActions: editedAnalysis.recommendedActions,
        investmentStrategy: analysisConfig.strategy,
        confidence: editedAnalysis.confidenceScore > 80 ? 'high' : 
                   editedAnalysis.confidenceScore > 60 ? 'medium' : 'low',
        riskLevel: editedAnalysis.riskAssessment.riskLevel,
        status: 'active',
        isDraft: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to database
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dashboardProperty)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save property');
      }
      
      setCurrentStep(6);
      alert('Property successfully saved to dashboard!');
      
      // Reset workflow
      setTimeout(() => {
        setUrl('');
        setPropertyData(null);
        setGeneratedAnalysis(null);
        setEditedAnalysis(null);
        setCurrentStep(1);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save property');
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Property Analysis Workflow
        </h1>
        <p className="text-muted">
          Complete workflow from URL to published dashboard property
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 bg-card rounded-xl p-6">
        <div className="flex justify-between">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold
                  ${step.status === 'complete' ? 'bg-green-500 text-white' :
                    step.status === 'active' ? 'bg-accent text-white animate-pulse' :
                    'bg-gray-200 text-gray-500'}
                `}>
                  {step.status === 'complete' ? '✓' : step.id}
                </div>
                <span className="mt-2 text-xs text-center max-w-[100px]">
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`
                  w-20 h-1 mx-2 mt-[-20px]
                  ${step.status === 'complete' ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-card rounded-xl p-6">
        {/* Step 1: Enter URL */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 1: Enter Property URL</h2>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.zillow.com/homedetails/..."
              className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={handleUrlSubmit}
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              Next: Scrape Property
            </button>
          </div>
        )}

        {/* Step 2: Scraping */}
        {currentStep === 2 && (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-lg">Scraping and enhancing property data...</p>
            <p className="text-sm text-muted mt-2">This may take 30-60 seconds</p>
          </div>
        )}

        {/* Step 3: Configure Analysis */}
        {currentStep === 3 && propertyData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 3: Configure Analysis</h2>
            
            {/* Property Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Property Summary</h3>
              <p>{propertyData.address}</p>
              <p>{propertyData.city}, {propertyData.state} {propertyData.zipCode}</p>
              <p className="text-sm text-muted mt-1">
                Data Completeness: {propertyData.dataCompleteness.score}%
              </p>
            </div>

            {/* Analysis Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Investment Strategy
                </label>
                <select
                  value={analysisConfig.strategy}
                  onChange={(e) => setAnalysisConfig({
                    ...analysisConfig,
                    strategy: e.target.value as any
                  })}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                >
                  <option value="rental">Buy & Hold Rental</option>
                  <option value="flip">Fix & Flip</option>
                  <option value="brrrr">BRRRR Strategy</option>
                  <option value="airbnb">Short-Term Rental</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Time Horizon (Years)
                </label>
                <input
                  type="number"
                  value={analysisConfig.timeHorizon}
                  onChange={(e) => setAnalysisConfig({
                    ...analysisConfig,
                    timeHorizon: parseInt(e.target.value)
                  })}
                  min="1"
                  max="30"
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Financing Type
                </label>
                <select
                  value={analysisConfig.financingType}
                  onChange={(e) => setAnalysisConfig({
                    ...analysisConfig,
                    financingType: e.target.value as any
                  })}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                >
                  <option value="cash">Cash Purchase</option>
                  <option value="conventional">Conventional Loan</option>
                  <option value="hard-money">Hard Money</option>
                  <option value="portfolio">Portfolio Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Analysis Depth
                </label>
                <select
                  value={analysisConfig.analysisDepth}
                  onChange={(e) => setAnalysisConfig({
                    ...analysisConfig,
                    analysisDepth: e.target.value as any
                  })}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleConfigSubmit}
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90"
            >
              Next: Generate Analysis
            </button>
          </div>
        )}

        {/* Step 4: Generating Analysis */}
        {currentStep === 4 && (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-lg">Generating AI analysis...</p>
            <p className="text-sm text-muted mt-2">Using Claude Opus-4 to analyze property</p>
          </div>
        )}

        {/* Step 5: Review and Edit */}
        {currentStep === 5 && editedAnalysis && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Step 5: Review & Edit Analysis</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10"
              >
                {editMode ? 'Preview' : 'Edit'}
              </button>
            </div>

            {/* Analysis Sections */}
            <div className="space-y-6">
              {/* Strategic Overview */}
              <div>
                <h3 className="font-semibold mb-2">Strategic Overview</h3>
                {editMode ? (
                  <textarea
                    value={editedAnalysis.strategicOverview}
                    onChange={(e) => handleEditAnalysis('strategicOverview', e.target.value)}
                    className="w-full h-32 px-4 py-2 border border-border rounded-lg"
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{editedAnalysis.strategicOverview}</p>
                )}
              </div>

              {/* Financial Analysis */}
              <div>
                <h3 className="font-semibold mb-2">Financial Analysis</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted">Purchase Price:</span>
                    <p className="font-medium">${editedAnalysis.financialAnalysis.purchasePrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted">Monthly Cash Flow:</span>
                    <p className="font-medium">${editedAnalysis.financialAnalysis.monthlyCashFlow.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted">Cap Rate:</span>
                    <p className="font-medium">{editedAnalysis.financialAnalysis.capRate}%</p>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h3 className="font-semibold mb-2">Risk Assessment</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">Risk Level:</span>
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${editedAnalysis.riskAssessment.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                      editedAnalysis.riskAssessment.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}
                  `}>
                    {editedAnalysis.riskAssessment.riskLevel.toUpperCase()}
                  </span>
                </div>
                <ul className="text-sm space-y-1">
                  {editedAnalysis.riskAssessment.primaryRisks.map((risk, idx) => (
                    <li key={idx}>• {risk}</li>
                  ))}
                </ul>
              </div>

              {/* Confidence Score */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Analysis Confidence Score</span>
                  <span className="text-2xl font-bold text-accent">
                    {editedAnalysis.confidenceScore}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 border border-border rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSaveToDashboard}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Save to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Success */}
        {currentStep === 6 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Success!</h2>
            <p className="text-muted">Property has been saved to the dashboard</p>
          </div>
        )}
      </div>
    </div>
  );
}