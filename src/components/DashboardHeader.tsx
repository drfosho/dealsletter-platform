'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/components/NotificationSystem';

interface DashboardHeaderProps {
  totalProperties: number;
  onRefresh: () => void;
}

export default function DashboardHeader({ totalProperties, onRefresh }: DashboardHeaderProps) {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [analysisStats, setAnalysisStats] = useState<{
    total: number;
    saved: number;
  } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<Array<{
    id: string;
    address: string;
    property_data?: {
      property?: Array<{
        propertyType?: string;
      }>;
    };
    strategy: string;
    purchase_price?: number;
    ai_analysis?: {
      financial_metrics?: {
        roi?: number;
        monthly_cash_flow?: number;
      };
    };
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalysisStats();
  }, []);

  const fetchAnalysisStats = async () => {
    try {
      const response = await fetch('/api/analysis/stats');
      if (response.ok) {
        const data = await response.json();
        setAnalysisStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch analysis stats:', error);
    }
  };

  const fetchSavedAnalyses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analysis/list?saved=true&limit=50');
      if (response.ok) {
        const data = await response.json();
        setSavedAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error('Failed to fetch saved analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportAnalysis = async (analysisId: string) => {
    try {
      const response = await fetch('/api/analysis/import-to-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId })
      });

      if (response.ok) {
        setShowImportModal(false);
        onRefresh();
        // Show success notification
        addNotification({
          type: 'success',
          title: 'Property Imported',
          message: 'The analyzed property has been added to your dashboard.',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Failed to import analysis:', error);
      addNotification({
        type: 'error',
        title: 'Import Failed',
        message: 'Unable to import the property. Please try again.',
        duration: 5000
      });
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Investment Properties</h1>
            <p className="text-muted">Discover your next profitable real estate investment</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Quick Stats */}
            <div className="flex items-center gap-6 px-4 py-2 bg-card rounded-lg border border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalProperties}</div>
                <div className="text-xs text-muted">Available</div>
              </div>
              {analysisStats && (
                <>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{analysisStats.saved}</div>
                    <div className="text-xs text-muted">Analyzed</div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  fetchSavedAnalyses();
                  setShowImportModal(true);
                }}
                className="px-4 py-2 bg-card border border-primary text-primary rounded-lg hover:bg-primary/5 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add from Analysis
              </button>
              
              <Link
                href="/analysis/new"
                className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analyze Property
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-primary">Add from Analyzed Properties</h3>
                <p className="text-sm text-muted mt-1">
                  Select a property from your analyses to add to the dashboard
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 hover:bg-muted/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : savedAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-10V5a3 3 0 00-3-3h0a3 3 0 00-3 3v2M12 12h.01M12 16h.01M8 12h.01M16 12h.01" />
                    </svg>
                  </div>
                  <p className="text-muted mb-4">No saved analyses to import</p>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      router.push('/analysis/new');
                    }}
                    className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90"
                  >
                    Analyze Your First Property
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {savedAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-primary mb-1">
                            {analysis.address}
                          </h4>
                          <p className="text-sm text-muted mb-2">
                            {analysis.property_data?.property?.[0]?.propertyType || 'Property'} • 
                            {analysis.strategy.charAt(0).toUpperCase() + analysis.strategy.slice(1)} Strategy
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted">
                              Price: <span className="font-medium text-primary">
                                ${analysis.purchase_price?.toLocaleString()}
                              </span>
                            </span>
                            <span className="text-muted">
                              ROI: <span className="font-medium text-green-600">
                                {analysis.ai_analysis?.financial_metrics?.roi?.toFixed(1) || '0'}%
                              </span>
                            </span>
                            <span className="text-muted">
                              Cash Flow: <span className="font-medium text-blue-600">
                                ${analysis.ai_analysis?.financial_metrics?.monthly_cash_flow?.toLocaleString() || '0'}/mo
                              </span>
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleImportAnalysis(analysis.id)}
                          className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 font-medium ml-4"
                        >
                          Import
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
              <Link
                href="/analysis/history"
                className="text-sm text-primary hover:underline"
              >
                View all analyses
              </Link>
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-primary border border-primary/30 rounded-lg hover:bg-primary/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}