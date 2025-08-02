'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import LoadingSpinner from '@/components/property-search/LoadingSpinner';
import FinancialMetrics from '@/components/analysis/FinancialMetrics';
import AnalysisOverview from '@/components/analysis/AnalysisOverview';
import InvestmentProjections from '@/components/analysis/InvestmentProjections';
import FlipTimeline from '@/components/analysis/FlipTimeline';
import ActionButtons from '@/components/analysis/ActionButtons';
import ShareModal from '@/components/analysis/ShareModal';
import ComparisonModal from '@/components/analysis/ComparisonModal';
import type { Analysis } from '@/types';

interface PageParams {
  params: Promise<{
    id: string;
  }>;
}

export default function AnalysisResultsPage({ params }: PageParams) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/analysis/${resolvedParams.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Analysis not found');
        } else if (response.status === 401) {
          router.push('/login');
          return;
        } else {
          throw new Error('Failed to fetch analysis');
        }
      }

      const data = await response.json();
      setAnalysis(data);
      setIsSaved(data.is_favorite);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }, [params, router]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleSaveToDashboard = async () => {
    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/analysis/${resolvedParams.id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !isSaved })
      });

      if (response.ok) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error('Failed to save to dashboard:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      return;
    }

    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/analysis/${resolvedParams.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/analysis/history');
      }
    } catch (error) {
      console.error('Failed to delete analysis:', error);
    }
  };

  const handleReanalyze = () => {
    if (!analysis) return;
    
    // Store current analysis data for re-analysis
    sessionStorage.setItem('reanalyze-data', JSON.stringify({
      address: analysis.address,
      strategy: analysis.strategy,
      financial: {
        purchasePrice: analysis.purchase_price,
        downPaymentPercent: analysis.down_payment_percent,
        interestRate: analysis.interest_rate,
        loanTerm: analysis.loan_term,
        renovationCosts: analysis.rehab_costs
      }
    }));
    router.push('/analysis/new');
  };

  if (loading) {
    return (
      <>
        <Navigation variant="dashboard" />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 p-4 lg:p-6">
            <LoadingSpinner text="Loading analysis..." />
          </main>
        </div>
      </>
    );
  }

  if (error || !analysis) {
    return (
      <>
        <Navigation variant="dashboard" />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-primary mb-2">{error || 'Analysis not found'}</h2>
              <button
                onClick={() => router.push('/analysis')}
                className="mt-4 px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90"
              >
                Back to Analysis Dashboard
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation variant="dashboard" />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="flex items-center text-muted hover:text-primary mb-4"
              >
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Property Image */}
                  {(() => {
                    const imageUrl = (analysis.property_data as any)?.primaryImageUrl || 
                                   (analysis.property_data as any)?.property?.primaryImageUrl ||
                                   (analysis.property_data as any)?.images?.[0];
                    
                    if (imageUrl) {
                      return (
                        <img 
                          src={imageUrl} 
                          alt={analysis.address}
                          className="w-24 h-24 object-cover rounded-lg shadow-md"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            // Use the no image placeholder
                            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Cg transform="translate(100,100)"%3E%3Crect x="-40" y="-40" width="80" height="80" fill="none" stroke="%239ca3af" stroke-width="2" rx="4"/%3E%3Cpath d="M-30,-20 L-10,0 L0,-10 L10,0 L30,-20" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/%3E%3Ccircle cx="-10" cy="-15" r="4" fill="none" stroke="%239ca3af" stroke-width="2"/%3E%3Ctext y="35" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="%236b7280"%3ENo Image%3C/text%3E%3C/g%3E%3C/svg%3E';
                          }}
                        />
                      );
                    }
                    
                    return (
                      <div className="w-24 h-24 bg-muted/20 rounded-lg flex items-center justify-center">
                        <svg className="w-10 h-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    );
                  })()}
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                      {analysis.address}
                    </h1>
                    <p className="text-muted">
                      {analysis.strategy.charAt(0).toUpperCase() + analysis.strategy.slice(1)} Analysis • 
                      Generated {new Date(analysis.created_at).toLocaleDateString()}
                    </p>
                    {analysis.property_data?.property?.[0] && (
                      <p className="text-sm text-muted mt-1">
                        {analysis.property_data.property[0].bedrooms} bd • 
                        {analysis.property_data.property[0].bathrooms} ba • 
                        {analysis.property_data.property[0].squareFootage?.toLocaleString() || 'N/A'} sqft
                      </p>
                    )}
                  </div>
                </div>
                
                <ActionButtons
                  analysisId={analysis.id}
                  isSaved={isSaved}
                  onSave={handleSaveToDashboard}
                  onShare={() => setShowShareModal(true)}
                  onCompare={() => setShowComparisonModal(true)}
                  onReanalyze={handleReanalyze}
                  onDelete={handleDelete}
                />
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Overview & Metrics */}
              <div className="lg:col-span-2 space-y-6">
                <AnalysisOverview analysis={analysis} />
                <FinancialMetrics analysis={analysis} />
                {/* Show strategy-specific components */}
                {analysis.strategy === 'flip' ? (
                  <FlipTimeline analysis={analysis} />
                ) : (
                  <InvestmentProjections analysis={analysis} />
                )}
              </div>

              {/* Right Column - Property Details & Strategy */}
              <div className="space-y-6">
                {/* Property Details */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Property Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted">Type</span>
                      <span className="text-primary font-medium">
                        {(analysis.property_data as any)?.propertyType || analysis.property_data?.property?.[0]?.propertyType || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Size</span>
                      <span className="text-primary font-medium">
                        {((analysis.property_data as any)?.squareFootage || analysis.property_data?.property?.[0]?.squareFootage)?.toLocaleString() || 'N/A'} sq ft
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Bedrooms</span>
                      <span className="text-primary font-medium">
                        {(analysis.property_data as any)?.bedrooms || analysis.property_data?.property?.[0]?.bedrooms || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Bathrooms</span>
                      <span className="text-primary font-medium">
                        {(analysis.property_data as any)?.bathrooms || analysis.property_data?.property?.[0]?.bathrooms || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Year Built</span>
                      <span className="text-primary font-medium">
                        {(analysis.property_data as any)?.yearBuilt || analysis.property_data?.property?.[0]?.yearBuilt || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Investment Parameters */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Investment Parameters</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted">Purchase Price</span>
                      <span className="text-primary font-medium">
                        ${analysis.purchase_price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Down Payment</span>
                      <span className="text-primary font-medium">
                        {analysis.down_payment_percent}% (${((analysis.purchase_price * analysis.down_payment_percent) / 100).toLocaleString()})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Interest Rate</span>
                      <span className="text-primary font-medium">
                        {analysis.interest_rate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Loan Term</span>
                      <span className="text-primary font-medium">
                        {analysis.loan_term} years
                      </span>
                    </div>
                    {analysis.rehab_costs > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted">Renovation Costs</span>
                        <span className="text-primary font-medium">
                          ${analysis.rehab_costs?.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Market Data */}
                {analysis.market_data && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">Market Analysis</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted">Median Rent</span>
                        <span className="text-primary font-medium">
                          ${analysis.market_data.medianRent?.toLocaleString()}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Median Sale Price</span>
                        <span className="text-primary font-medium">
                          ${analysis.market_data.medianSalePrice?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Days on Market</span>
                        <span className="text-primary font-medium">
                          {analysis.market_data.averageDaysOnMarket || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Risk & Opportunities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Risks */}
              {analysis.ai_analysis?.risks && analysis.ai_analysis.risks.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Key Risks
                  </h3>
                  <ul className="space-y-2">
                    {analysis.ai_analysis.risks.map((risk: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-red-800">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Opportunities */}
              {analysis.ai_analysis?.opportunities && analysis.ai_analysis.opportunities.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Opportunities
                  </h3>
                  <ul className="space-y-2">
                    {analysis.ai_analysis.opportunities.map((opportunity: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-green-800">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span className="text-sm">{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          analysisId={analysis.id}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Comparison Modal */}
      {showComparisonModal && (
        <ComparisonModal
          currentAnalysis={analysis}
          onClose={() => setShowComparisonModal(false)}
        />
      )}
    </>
  );
}