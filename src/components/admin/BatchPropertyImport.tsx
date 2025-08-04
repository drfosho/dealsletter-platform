'use client';

import { useState, useCallback } from 'react';
import type { MergedPropertyData } from '@/utils/property-data-merger';
import type { GeneratedAnalysis, AnalysisConfig } from '@/services/property-analysis-ai';

interface BatchJob {
  id: string;
  url: string;
  status: 'pending' | 'scraping' | 'analyzing' | 'complete' | 'error';
  progress: number;
  data?: MergedPropertyData;
  analysis?: GeneratedAnalysis;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

interface BatchImportProps {
  onComplete?: (properties: any[]) => void;
}

export default function BatchPropertyImport({ onComplete }: BatchImportProps) {
  const [urls, setUrls] = useState('');
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [config, setConfig] = useState<AnalysisConfig>({
    strategy: 'rental',
    timeHorizon: 5,
    financingType: 'conventional',
    includeProjections: true,
    includeComparables: true,
    analysisDepth: 'comprehensive'
  });
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    processing: 0,
    avgTime: 0
  });

  // Parse URLs from text input
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
          // Invalid URL, skip
        }
      }
    });
    
    return validUrls;
  };

  // Process a single property
  const processProperty = async (job: BatchJob): Promise<BatchJob> => {
    const updatedJob = { ...job, status: 'scraping' as const, startTime: new Date() };
    
    try {
      // Update job status
      setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
      
      // Scrape property data
      const scrapeResponse = await fetch('/api/admin/scrape-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: job.url,
          includeRentCast: true,
          includeEstimates: true
        })
      });
      
      if (!scrapeResponse.ok) {
        throw new Error('Failed to scrape property');
      }
      
      const scrapeResult = await scrapeResponse.json();
      
      if (!scrapeResult.success) {
        throw new Error(scrapeResult.message || 'Scraping failed');
      }
      
      updatedJob.data = scrapeResult.data;
      updatedJob.status = 'analyzing';
      updatedJob.progress = 50;
      
      // Update job status
      setJobs(prev => prev.map(j => j.id === job.id ? updatedJob : j));
      
      // Generate analysis
      const analysisResponse = await fetch('/api/admin/generate-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyData: scrapeResult.data,
          config
        })
      });
      
      if (!analysisResponse.ok) {
        throw new Error('Failed to generate analysis');
      }
      
      const analysisResult = await analysisResponse.json();
      
      if (!analysisResult.success) {
        throw new Error(analysisResult.message || 'Analysis failed');
      }
      
      // Success
      return {
        ...updatedJob,
        status: 'complete',
        progress: 100,
        analysis: analysisResult.analysis,
        endTime: new Date()
      };
      
    } catch (error) {
      // Error
      return {
        ...updatedJob,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        endTime: new Date()
      };
    }
  };

  // Process batch with concurrency control
  const processBatch = async () => {
    setIsProcessing(true);
    
    const CONCURRENT_LIMIT = 3; // Process 3 at a time
    const pendingJobs = [...jobs.filter(j => j.status === 'pending')];
    const results: BatchJob[] = [];
    
    // Process in batches
    while (pendingJobs.length > 0) {
      const batch = pendingJobs.splice(0, CONCURRENT_LIMIT);
      const batchResults = await Promise.all(
        batch.map(job => processProperty(job))
      );
      
      // Update jobs with results
      batchResults.forEach(result => {
        setJobs(prev => prev.map(j => j.id === result.id ? result : j));
        results.push(result);
        
        // Update statistics
        setStats(prev => ({
          ...prev,
          completed: result.status === 'complete' ? prev.completed + 1 : prev.completed,
          failed: result.status === 'error' ? prev.failed + 1 : prev.failed,
          processing: pendingJobs.length
        }));
      });
      
      // Small delay between batches to avoid rate limiting
      if (pendingJobs.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setIsProcessing(false);
    
    // Call onComplete with successful properties
    if (onComplete) {
      const successfulProperties = results
        .filter(job => job.status === 'complete' && job.data && job.analysis)
        .map(job => ({
          ...job.data,
          ...job.analysis?.financialAnalysis,
          strategicOverview: job.analysis?.strategicOverview,
          executiveSummary: job.analysis?.executiveSummary,
          investmentThesis: job.analysis?.investmentThesis,
          marketAnalysis: job.analysis?.marketAnalysis,
          riskAssessment: job.analysis?.riskAssessment,
          valueAddOpportunities: job.analysis?.valueAddOpportunities,
          exitStrategy: job.analysis?.exitStrategy,
          recommendedActions: job.analysis?.recommendedActions,
          investmentStrategy: config.strategy,
          confidence: job.analysis?.confidenceScore && job.analysis.confidenceScore > 80 ? 'high' : 
                     job.analysis?.confidenceScore && job.analysis.confidenceScore > 60 ? 'medium' : 'low',
          riskLevel: job.analysis?.riskAssessment.riskLevel,
          status: 'active',
          isDraft: false
        }));
      
      onComplete(successfulProperties);
    }
  };

  // Start batch processing
  const handleStartBatch = () => {
    const validUrls = parseUrls(urls);
    
    if (validUrls.length === 0) {
      alert('Please enter at least one valid property URL');
      return;
    }
    
    // Create jobs
    const newJobs: BatchJob[] = validUrls.map(url => ({
      id: Date.now().toString() + Math.random(),
      url,
      status: 'pending',
      progress: 0
    }));
    
    setJobs(newJobs);
    setStats({
      total: newJobs.length,
      completed: 0,
      failed: 0,
      processing: newJobs.length,
      avgTime: 0
    });
    
    // Start processing
    processBatch();
  };

  // Export results
  const exportResults = () => {
    const successfulJobs = jobs.filter(j => j.status === 'complete');
    const data = successfulJobs.map(job => ({
      url: job.url,
      address: job.data?.address,
      city: job.data?.city,
      state: job.data?.state,
      price: job.data?.price,
      monthlyRent: job.data?.monthlyRent,
      capRate: job.analysis?.financialAnalysis.capRate,
      cashFlow: job.analysis?.financialAnalysis.monthlyCashFlow,
      confidence: job.analysis?.confidenceScore
    }));
    
    const csv = [
      'URL,Address,City,State,Price,Monthly Rent,Cap Rate,Cash Flow,Confidence',
      ...data.map(d => 
        `"${d.url}","${d.address}","${d.city}","${d.state}",${d.price},${d.monthlyRent},${d.capRate},${d.cashFlow},${d.confidence}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <div className="bg-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Batch Import Configuration</h2>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Investment Strategy
            </label>
            <select
              value={config.strategy}
              onChange={(e) => setConfig({ ...config, strategy: e.target.value as any })}
              className="w-full px-4 py-2 border border-border rounded-lg"
              disabled={isProcessing}
            >
              <option value="rental">Buy & Hold Rental</option>
              <option value="flip">Fix & Flip</option>
              <option value="brrrr">BRRRR Strategy</option>
              <option value="airbnb">Short-Term Rental</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Time Horizon
            </label>
            <select
              value={config.timeHorizon}
              onChange={(e) => setConfig({ ...config, timeHorizon: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-border rounded-lg"
              disabled={isProcessing}
            >
              <option value="1">1 Year</option>
              <option value="3">3 Years</option>
              <option value="5">5 Years</option>
              <option value="10">10 Years</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Analysis Depth
            </label>
            <select
              value={config.analysisDepth}
              onChange={(e) => setConfig({ ...config, analysisDepth: e.target.value as any })}
              className="w-full px-4 py-2 border border-border rounded-lg"
              disabled={isProcessing}
            >
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </div>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-muted mb-2">
            Property URLs (one per line)
          </label>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://www.zillow.com/homedetails/...\nhttps://www.loopnet.com/Listing/...\nhttps://www.realtor.com/..."
            className="w-full h-32 px-4 py-3 border border-border rounded-lg font-mono text-sm"
            disabled={isProcessing}
          />
          <p className="text-sm text-muted mt-2">
            {parseUrls(urls).length} valid URLs detected
          </p>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleStartBatch}
            disabled={isProcessing || parseUrls(urls).length === 0}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Start Batch Import'}
          </button>
          
          {jobs.length > 0 && (
            <button
              onClick={exportResults}
              disabled={isProcessing}
              className="px-6 py-3 border border-accent text-accent rounded-lg hover:bg-accent/10"
            >
              Export Results
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      {jobs.length > 0 && (
        <div className="bg-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Statistics</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-muted">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
              <p className="text-sm text-muted">Processing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-muted">Failed</p>
            </div>
          </div>
        </div>
      )}

      {/* Job List */}
      {jobs.length > 0 && (
        <div className="bg-card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Import Queue</h3>
          <div className="space-y-3">
            {jobs.map(job => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{job.url}</p>
                  {job.data && (
                    <p className="text-sm text-muted">
                      {job.data.address}, {job.data.city}
                    </p>
                  )}
                  {job.error && (
                    <p className="text-sm text-red-500">{job.error}</p>
                  )}
                </div>
                
                <div className="ml-4 flex items-center gap-3">
                  {/* Status Badge */}
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${job.status === 'complete' ? 'bg-green-100 text-green-700' :
                      job.status === 'error' ? 'bg-red-100 text-red-700' :
                      job.status === 'scraping' || job.status === 'analyzing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'}
                  `}>
                    {job.status}
                  </span>
                  
                  {/* Progress Bar */}
                  {(job.status === 'scraping' || job.status === 'analyzing') && (
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Timing */}
                  {job.endTime && job.startTime && (
                    <span className="text-xs text-muted">
                      {Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)}s
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}