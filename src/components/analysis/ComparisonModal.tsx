'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Analysis } from '@/types';

interface ComparisonModalProps {
  currentAnalysis: Analysis;
  onClose: () => void;
}

export default function ComparisonModal({ currentAnalysis, onClose }: ComparisonModalProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyses = useCallback(async () => {
    try {
      const response = await fetch('/api/analysis/list?limit=20');
      if (response.ok) {
        const data = await response.json();
        // Filter out current analysis
        const filtered = data.analyses.filter((a: Analysis) => a.id !== currentAnalysis.id);
        setAnalyses(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    } finally {
      setLoading(false);
    }
  }, [currentAnalysis.id]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const handleCompare = () => {
    if (selectedAnalyses.length === 0) return;

    // Navigate with IDs in query string (more reliable than sessionStorage)
    const allIds = [currentAnalysis.id, ...selectedAnalyses];
    const idsParam = allIds.join(',');
    window.open(`/analysis/compare?ids=${idsParam}`, '_blank');
    onClose();
  };

  const toggleSelection = (id: string) => {
    setSelectedAnalyses(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id)
        : [...prev, id].slice(0, 3) // Max 3 comparisons
    );
  };

  // Safe currency formatter that handles undefined, null, NaN
  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return '—';
    }
    const num = Number(value);
    if (Number.isNaN(num)) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Safe ROI formatter
  const formatROI = (value: number | undefined | null): string => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return '0%';
    }
    const num = Number(value);
    if (Number.isNaN(num)) return '0%';
    return `${num.toFixed(1)}%`;
  };

  // Helper to get purchase price from various locations
  const getPurchasePrice = (analysis: Analysis): number => {
    // Check top-level first (from updated API)
    if (analysis.purchase_price && !Number.isNaN(analysis.purchase_price)) {
      return analysis.purchase_price;
    }
    // Check analysis_data
    const analysisData = (analysis as any).analysis_data || {};
    if (analysisData.purchase_price && !Number.isNaN(analysisData.purchase_price)) {
      return analysisData.purchase_price;
    }
    if (analysisData.purchasePrice && !Number.isNaN(analysisData.purchasePrice)) {
      return analysisData.purchasePrice;
    }
    return 0;
  };

  // Helper to get ROI from various locations
  const getROI = (analysis: Analysis): number => {
    // Check top-level first
    if (analysis.roi !== undefined && analysis.roi !== null && !Number.isNaN(analysis.roi)) {
      return analysis.roi;
    }
    // Check ai_analysis
    const aiMetrics = (analysis as any).ai_analysis?.financial_metrics || {};
    if (aiMetrics.roi !== undefined && !Number.isNaN(aiMetrics.roi)) {
      return aiMetrics.roi;
    }
    // Check nested in analysis_data
    const analysisData = (analysis as any).analysis_data || {};
    const nestedMetrics = analysisData?.ai_analysis?.financial_metrics || {};
    if (nestedMetrics.roi !== undefined && !Number.isNaN(nestedMetrics.roi)) {
      return nestedMetrics.roi;
    }
    return 0;
  };

  // Helper to get monthly cash flow from various locations
  const getCashFlow = (analysis: Analysis): number => {
    // Check top-level first (from updated API)
    if ((analysis as any).monthly_cash_flow !== undefined && !Number.isNaN((analysis as any).monthly_cash_flow)) {
      return (analysis as any).monthly_cash_flow;
    }
    // Check ai_analysis
    const aiMetrics = (analysis as any).ai_analysis?.financial_metrics || {};
    if (aiMetrics.monthly_cash_flow !== undefined && !Number.isNaN(aiMetrics.monthly_cash_flow)) {
      return aiMetrics.monthly_cash_flow;
    }
    // Check nested in analysis_data
    const analysisData = (analysis as any).analysis_data || {};
    const nestedMetrics = analysisData?.ai_analysis?.financial_metrics || {};
    if (nestedMetrics.monthly_cash_flow !== undefined && !Number.isNaN(nestedMetrics.monthly_cash_flow)) {
      return nestedMetrics.monthly_cash_flow;
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-primary">Compare Analyses</h3>
            <p className="text-sm text-muted mt-1">
              Select up to 3 analyses to compare with "{currentAnalysis.address}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Analysis List */}
        <div className="flex-1 overflow-y-auto mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">No other analyses available for comparison</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => toggleSelection(analysis.id)}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all
                    ${selectedAnalyses.includes(analysis.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-primary line-clamp-1">
                        {analysis.address}
                      </h4>
                      <p className="text-sm text-muted">
                        {analysis.strategy.charAt(0).toUpperCase() + analysis.strategy.slice(1)} • 
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center
                      ${selectedAnalyses.includes(analysis.id)
                        ? 'bg-primary border-primary'
                        : 'border-border'
                      }
                    `}>
                      {selectedAnalyses.includes(analysis.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted">Price</p>
                      <p className="font-medium">{formatCurrency(getPurchasePrice(analysis))}</p>
                    </div>
                    <div>
                      <p className="text-muted">ROI</p>
                      <p className="font-medium">{formatROI(getROI(analysis))}</p>
                    </div>
                    <div>
                      <p className="text-muted">Cash Flow</p>
                      <p className="font-medium">{formatCurrency(getCashFlow(analysis))}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <p className="text-sm text-muted">
            {selectedAnalyses.length} of 3 analyses selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-primary border border-primary/30 rounded-lg hover:bg-primary/5"
            >
              Cancel
            </button>
            <button
              onClick={handleCompare}
              disabled={selectedAnalyses.length === 0}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all
                ${selectedAnalyses.length > 0
                  ? 'bg-primary text-secondary hover:bg-primary/90'
                  : 'bg-muted text-muted cursor-not-allowed'
                }
              `}
            >
              Compare ({selectedAnalyses.length + 1})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}