'use client';

import { useState } from 'react';
import { generateComprehensiveAnalysis } from '@/utils/property-analysis-generator';
import { BatchProcessingQueue } from '@/utils/batch-queue';

interface PropertyCandidate {
  id: string;
  address: string;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  quickAnalysis?: {
    strategy: string;
    estimatedROI: number;
    purchasePrice: number;
    monthlyRent: number;
    capRate: number;
    recommendation: 'go' | 'pass' | 'maybe';
    confidence: 'high' | 'medium' | 'low';
  };
  dataCompleteness?: {
    score: number;
    missingFields: string[];
    hasMinimumData: boolean;
  };
  propertyData?: any;
  fullAnalysis?: any;
  error?: string;
  selected: boolean;
  collectionProgress?: {
    property: boolean;
    value: boolean;
    rental: boolean;
    comparables: boolean;
    listing: boolean;
    neighborhood: boolean;
  };
}

interface BulkPropertyAnalysisProps {
  onBatchComplete: (properties: any[]) => void;
}

export default function BulkPropertyAnalysis({ onBatchComplete }: BulkPropertyAnalysisProps) {
  const [addresses, setAddresses] = useState('');
  const [candidates, setCandidates] = useState<PropertyCandidate[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'input' | 'quick-analysis' | 'full-analysis' | 'review'>('input');
  const [processingStatus, setProcessingStatus] = useState('');

  const parseAddresses = (input: string): string[] => {
    return input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.startsWith('#') && !line.startsWith('//'));
  };

  const performQuickAnalysis = async () => {
    const addressList = parseAddresses(addresses);
    if (addressList.length === 0) {
      alert('Please enter at least one address');
      return;
    }

    setIsProcessing(true);
    setCurrentPhase('quick-analysis');
    
    const newCandidates: PropertyCandidate[] = addressList.map((addr, idx) => ({
      id: `prop-${Date.now()}-${idx}`,
      address: addr,
      status: 'pending',
      selected: false
    }));
    
    setCandidates(newCandidates);

    // Create batch queue for processing
    const queue = new BatchProcessingQueue<PropertyCandidate>(
      async (candidate) => {
        // Update status to analyzing
        setCandidates(prev => prev.map(c => 
          c.id === candidate.id ? { 
            ...c, 
            status: 'analyzing',
            collectionProgress: {
              property: false,
              value: false,
              rental: false,
              comparables: false,
              listing: false,
              neighborhood: false
            }
          } : c
        ));

        // Call RentCast API for comprehensive property data
        const response = await fetch('/api/property/quick-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: candidate.address })
        });

        const data = await response.json();
        
        // Check if we got an error response
        if (!response.ok) {
          if (response.status === 422 && data.completenessScore !== undefined) {
            // Partial data available - show warning but don't fail
            console.warn(`Limited data for ${candidate.address}: ${data.completenessScore}% complete`);
            throw new Error(`Limited data available (${data.completenessScore}% complete). ${data.details?.join(', ') || ''}`);
          } else {
            throw new Error(data.error || 'Failed to analyze property');
          }
        }
        
        // Update with results
        setCandidates(prev => prev.map(c => 
          c.id === candidate.id ? { 
            ...c, 
            status: 'complete',
            quickAnalysis: data.analysis,
            propertyData: data.propertyData,
            dataCompleteness: data.propertyData?.dataQuality || {
              completenessScore: 0,
              missingFields: [],
              dataWarnings: []
            },
            selected: data.analysis.recommendation === 'go' && data.analysis.confidence !== 'low',
            collectionProgress: {
              property: true,
              value: true,
              rental: true,
              comparables: true,
              listing: true,
              neighborhood: true
            }
          } : c
        ));
        
        return data;
      },
      {
        concurrency: 3, // Process 3 properties at a time
        retryAttempts: 2,
        retryDelay: 2000,
        onProgress: (completed, total) => {
          setProcessingStatus(`Analyzing properties: ${completed}/${total} completed`);
        },
        onItemError: (candidate, error) => {
          setCandidates(prev => prev.map(c => 
            c.id === candidate.id ? { 
              ...c, 
              status: 'error',
              error: error.message || 'Analysis failed'
            } : c
          ));
        }
      }
    );

    // Add all candidates to queue
    queue.add(newCandidates);
    
    // Start processing
    await queue.start();

    setIsProcessing(false);
    setProcessingStatus('');
  };

  const performFullAnalysis = async () => {
    const selectedCandidates = candidates.filter(c => c.selected);
    if (selectedCandidates.length === 0) {
      alert('Please select at least one property for full analysis');
      return;
    }

    setIsProcessing(true);
    setCurrentPhase('full-analysis');

    for (let i = 0; i < selectedCandidates.length; i++) {
      const candidate = selectedCandidates[i];
      setProcessingStatus(`Full analysis ${i + 1}/${selectedCandidates.length}: ${candidate.address}`);
      
      try {
        // Generate comprehensive analysis matching dashboard quality
        const fullAnalysis = await generateComprehensiveAnalysis({
          address: candidate.address,
          quickData: candidate.quickAnalysis,
          propertyData: candidate.propertyData, // Pass the already-fetched data
          includeProjections: true,
          includeFinancingScenarios: true,
          includeImages: true
        });

        setCandidates(prev => prev.map(c => 
          c.id === candidate.id ? { 
            ...c, 
            fullAnalysis,
            status: 'complete'
          } : c
        ));
      } catch (error) {
        console.error('Full analysis error:', error);
      }
    }

    setIsProcessing(false);
    setProcessingStatus('');
    setCurrentPhase('review');
  };

  const toggleSelection = (id: string) => {
    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
  };

  const toggleAllSelection = () => {
    const hasUnselected = candidates.some(c => !c.selected && c.status === 'complete');
    setCandidates(prev => prev.map(c => ({
      ...c,
      selected: hasUnselected ? (c.status === 'complete') : false
    })));
  };

  const publishSelected = () => {
    const toPublish = candidates
      .filter(c => c.selected && c.fullAnalysis)
      .map(c => c.fullAnalysis);
    
    if (toPublish.length === 0) {
      alert('No properties ready to publish');
      return;
    }

    onBatchComplete(toPublish);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Bulk Property Analysis</h2>
        <p className="text-muted">
          Generate comprehensive analyses for multiple properties at once
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {['Input', 'Quick Analysis', 'Full Analysis', 'Review'].map((phase, idx) => (
          <div key={phase} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold
              ${currentPhase === phase.toLowerCase().replace(' ', '-') 
                ? 'bg-accent text-white' 
                : idx < ['input', 'quick-analysis', 'full-analysis', 'review'].indexOf(currentPhase)
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }
            `}>
              {idx + 1}
            </div>
            <span className="ml-2 text-sm font-medium">{phase}</span>
            {idx < 3 && <div className="w-8 h-0.5 bg-border ml-4" />}
          </div>
        ))}
      </div>

      {/* Input Phase */}
      {currentPhase === 'input' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Enter Property Addresses (one per line)
            </label>
            <textarea
              value={addresses}
              onChange={(e) => setAddresses(e.target.value)}
              placeholder="123 Main St, San Francisco, CA 94102
456 Oak Ave, Oakland, CA 94610
789 Pine Rd, Berkeley, CA 94704"
              className="w-full h-48 px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none font-mono text-sm"
            />
            <p className="text-xs text-muted mt-2">
              Enter full addresses including city, state, and ZIP code
            </p>
          </div>
          
          <button
            onClick={performQuickAnalysis}
            disabled={isProcessing || !addresses.trim()}
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Analyze Viability
          </button>
        </div>
      )}

      {/* Quick Analysis Results */}
      {(currentPhase === 'quick-analysis' || currentPhase === 'full-analysis') && (
        <div className="space-y-4">
          {/* Selection Controls */}
          {currentPhase === 'quick-analysis' && candidates.some(c => c.status === 'complete') && (
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={toggleAllSelection}
                className="text-sm text-accent hover:text-accent/80"
              >
                {candidates.some(c => !c.selected && c.status === 'complete') 
                  ? 'Select All Viable' 
                  : 'Deselect All'}
              </button>
              <div className="text-sm text-muted">
                {candidates.filter(c => c.selected).length} selected
              </div>
            </div>
          )}

          {/* Property Grid */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {candidates.map(candidate => (
              <div 
                key={candidate.id}
                className={`
                  p-4 border rounded-lg transition-all cursor-pointer
                  ${candidate.selected ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}
                  ${candidate.status === 'analyzing' ? 'animate-pulse' : ''}
                  ${candidate.status === 'error' ? 'border-red-500 bg-red-500/5' : ''}
                `}
                onClick={() => currentPhase === 'quick-analysis' && toggleSelection(candidate.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {currentPhase === 'quick-analysis' && (
                        <input
                          type="checkbox"
                          checked={candidate.selected}
                          onChange={() => toggleSelection(candidate.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-accent rounded"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-primary">{candidate.address}</p>
                        {candidate.status === 'analyzing' && (
                          <p className="text-sm text-muted">Analyzing...</p>
                        )}
                        {candidate.error && (
                          <p className="text-sm text-red-500">{candidate.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {candidate.status === 'analyzing' && candidate.collectionProgress && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">Collecting:</span>
                      {Object.entries(candidate.collectionProgress).map(([key, value]) => (
                        <div
                          key={key}
                          className={`w-2 h-2 rounded-full ${
                            value ? 'bg-green-500' : 'bg-gray-300 animate-pulse'
                          }`}
                          title={key.charAt(0).toUpperCase() + key.slice(1)}
                        />
                      ))}
                    </div>
                  )}
                  
                  {candidate.quickAnalysis && (
                    <div className="flex items-center gap-4 text-sm">
                      {/* Data Completeness Score */}
                      {candidate.dataCompleteness && (
                        <div className="flex items-center gap-2 group relative">
                          <span className="text-muted">Data:</span>
                          <div className="flex items-center gap-1">
                            <div className="relative w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`absolute left-0 top-0 h-full transition-all ${
                                  candidate.dataCompleteness.score >= 90 ? 'bg-green-500' :
                                  candidate.dataCompleteness.score >= 70 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${candidate.dataCompleteness.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{candidate.dataCompleteness.score}%</span>
                          </div>
                          
                          {/* Tooltip for missing fields */}
                          {candidate.dataCompleteness.missingFields && candidate.dataCompleteness.missingFields.length > 0 && (
                            <div className="absolute bottom-full left-0 mb-2 invisible group-hover:visible z-10">
                              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 min-w-[200px]">
                                <div className="font-semibold mb-1">Missing Data:</div>
                                {candidate.dataCompleteness.missingFields.map((field, idx) => (
                                  <div key={idx}>• {field}</div>
                                ))}
                                <div className="absolute bottom-0 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 transform translate-y-full"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <span className="text-muted">Strategy:</span>
                        <span className="ml-2 font-medium">{candidate.quickAnalysis.strategy}</span>
                      </div>
                      <div>
                        <span className="text-muted">ROI:</span>
                        <span className="ml-2 font-medium">{candidate.quickAnalysis.estimatedROI.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-muted">Cap Rate:</span>
                        <span className="ml-2 font-medium">{candidate.quickAnalysis.capRate.toFixed(2)}%</span>
                      </div>
                      
                      {/* Confidence Badge */}
                      {candidate.quickAnalysis.confidence && (
                        <div className={`
                          px-2 py-0.5 rounded text-xs font-medium
                          ${candidate.quickAnalysis.confidence === 'high' 
                            ? 'bg-blue-500/20 text-blue-600'
                            : candidate.quickAnalysis.confidence === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-600'
                              : 'bg-gray-500/20 text-gray-600'
                          }
                        `}>
                          {candidate.quickAnalysis.confidence} confidence
                        </div>
                      )}
                      
                      <div className={`
                        px-3 py-1 rounded-full text-xs font-semibold
                        ${candidate.quickAnalysis.recommendation === 'go' 
                          ? 'bg-green-500/20 text-green-600'
                          : candidate.quickAnalysis.recommendation === 'maybe'
                            ? 'bg-yellow-500/20 text-yellow-600'
                            : 'bg-red-500/20 text-red-600'
                        }
                      `}>
                        {candidate.quickAnalysis.recommendation.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          {currentPhase === 'quick-analysis' && !isProcessing && (
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentPhase('input')}
                className="px-6 py-3 border border-border hover:bg-muted/50 rounded-lg font-semibold transition-all"
              >
                Back
              </button>
              <button
                onClick={performFullAnalysis}
                disabled={!candidates.some(c => c.selected)}
                className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Generate Full Analysis ({candidates.filter(c => c.selected).length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Phase */}
      {currentPhase === 'review' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.filter(c => c.fullAnalysis).map(candidate => (
              <div 
                key={candidate.id}
                className="p-4 border border-border rounded-lg hover:border-accent transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-primary">{candidate.address}</p>
                    <p className="text-sm text-muted">
                      {candidate.fullAnalysis?.strategy || 'Mixed Strategy'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={candidate.selected}
                    onChange={() => toggleSelection(candidate.id)}
                    className="w-4 h-4 text-accent rounded mt-1"
                  />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Purchase Price:</span>
                    <span className="font-medium">
                      ${(candidate.fullAnalysis?.purchasePrice || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">30-Year NPV:</span>
                    <span className="font-medium text-green-600">
                      ${(candidate.fullAnalysis?.thirtyYearNPV || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Total ROI:</span>
                    <span className="font-medium">
                      {(candidate.fullAnalysis?.totalROI || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {/* Preview functionality */}}
                  className="w-full mt-3 px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-white rounded-lg text-sm font-medium transition-all"
                >
                  Preview Full Analysis
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPhase('input')}
              className="px-6 py-3 border border-border hover:bg-muted/50 rounded-lg font-semibold transition-all"
            >
              Start Over
            </button>
            <button
              onClick={publishSelected}
              disabled={!candidates.some(c => c.selected && c.fullAnalysis)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Publish to Dashboard ({candidates.filter(c => c.selected && c.fullAnalysis).length})
            </button>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="mt-6 p-4 bg-accent/10 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-primary">{processingStatus}</span>
          </div>
        </div>
      )}
    </div>
  );
}