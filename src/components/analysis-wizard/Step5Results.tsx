'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { WizardData } from '@/app/analysis/new/page';

interface Step5ResultsProps {
  data: WizardData;
  onComplete: () => void;
}

export default function Step5Results({ data }: Step5ResultsProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleSaveToDashboard = async () => {
    setIsSaving(true);
    try {
      // Analysis is already saved, just mark as favorite
      if (data.analysisId) {
        const response = await fetch(`/api/analysis/${data.analysisId}/favorite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_favorite: true })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save to dashboard');
        }
        
        setIsFavorite(true);
        // Show success message (you can add a toast notification here)
        console.log('Successfully saved to dashboard');
      } else {
        throw new Error('No analysis ID available');
      }
    } catch (error) {
      console.error('Failed to save to dashboard:', error);
      // Show error message to user (you can add a toast notification here)
      alert(error instanceof Error ? error.message : 'Failed to save to dashboard');
    }
    setIsSaving(false);
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    alert('PDF download coming soon!');
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/analysis/results/${data.analysisId}`;
    navigator.clipboard.writeText(shareUrl);
    // TODO: Show toast notification
  };

  if (!data.analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No analysis data available</p>
        <button
          onClick={() => router.push('/analysis')}
          className="mt-4 px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90"
        >
          Start New Analysis
        </button>
      </div>
    );
  }

  const analysis = data.analysis as any;
  const { financial_metrics } = analysis;

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          Analysis Complete!
        </h2>
        <p className="text-muted">
          Your property investment analysis is ready
        </p>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Property Image */}
          {(() => {
            const imageUrl = (data.propertyData as any)?.property?.primaryImageUrl || 
                           (data.propertyData as any)?.primaryImageUrl ||
                           (data.propertyData as any)?.images?.[0];
            
            if (imageUrl && !imageUrl.includes('No Image Available')) {
              return (
                <div className="flex-shrink-0">
                  <img 
                    src={imageUrl} 
                    alt={data.address}
                    className="w-32 h-32 object-cover rounded-lg"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      // Replace with placeholder on error
                      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"%3E%3Crect width="128" height="128" fill="%23f3f4f6"/%3E%3Cg transform="translate(64,64)"%3E%3Crect x="-30" y="-30" width="60" height="60" fill="none" stroke="%239ca3af" stroke-width="2" rx="4"/%3E%3Cpath d="M-20,-15 L-5,0 L0,-5 L5,0 L20,-15" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/%3E%3Ccircle cx="-5" cy="-10" r="3" fill="none" stroke="%239ca3af" stroke-width="2"/%3E%3Ctext y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="%236b7280"%3ENo Image%3C/text%3E%3C/g%3E%3C/svg%3E';
                    }}
                  />
                </div>
              );
            }
            
            return (
              <div className="flex-shrink-0 w-32 h-32 bg-muted/20 rounded-lg flex flex-col items-center justify-center">
                <svg className="w-12 h-12 text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-muted">No Image Available</span>
                <span className="text-xs text-muted">Off-Market Property</span>
              </div>
            );
          })()}
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary mb-1">{data.address}</h3>
                <p className="text-muted">
                  {data.strategy === 'flip' ? 'Fix & Flip' : 
                   data.strategy === 'brrrr' ? 'BRRRR Strategy' :
                   data.strategy === 'rental' ? 'Buy & Hold' :
                   'House Hack'} Analysis
                </p>
                {(data.propertyData as any)?.property && (
                  <p className="text-sm text-muted mt-1">
                    {(data.propertyData as any).property.bedrooms} bd • {(data.propertyData as any).property.bathrooms} ba • {(data.propertyData as any).property.squareFootage?.toLocaleString() || 'N/A'} sqft
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite ? 'bg-red-100 text-red-500' : 'bg-muted/20 text-muted hover:text-primary'
                }`}
              >
                <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {data.strategy === 'flip' ? (
          // Fix & Flip Metrics
          <>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">📊 Net Profit</p>
              <p className="text-2xl font-bold text-primary">
                ${financial_metrics?.net_profit?.toLocaleString() || financial_metrics?.total_profit?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">💰 Holding Costs</p>
              <p className="text-2xl font-bold text-primary">
                ${financial_metrics?.holding_costs?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">⏱️ Timeline</p>
              <p className="text-2xl font-bold text-primary">
                {data.strategyDetails?.timeline || '6'} mo
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">📈 ROI</p>
              <p className="text-2xl font-bold text-green-600">
                {financial_metrics?.roi?.toFixed(1) || '0'}%
              </p>
            </div>
          </>
        ) : data.strategy === 'brrrr' ? (
          // BRRRR Strategy Metrics
          <>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">💵 Monthly Cash Flow</p>
              <p className="text-2xl font-bold text-primary">
                ${financial_metrics?.monthly_cash_flow?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">💰 Cash Returned</p>
              <p className="text-2xl font-bold text-primary">
                ${(financial_metrics as any)?.cash_returned?.toLocaleString() || 
                   (financial_metrics as any)?.cashReturned?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">🔄 Cash-on-Cash</p>
              <p className="text-2xl font-bold text-primary">
                {financial_metrics?.cash_on_cash_return === Infinity || 
                 financial_metrics?.cash_on_cash_return === 999 ||
                 financial_metrics?.cash_on_cash_return > 500 ? (
                  <span className="text-green-600">INFINITE</span>
                ) : (
                  `${financial_metrics?.cash_on_cash_return?.toFixed(1) || '0'}%`
                )}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">📈 5-Year ROI</p>
              <p className="text-2xl font-bold text-green-600">
                {financial_metrics?.roi?.toFixed(1) || '0'}%
              </p>
            </div>
          </>
        ) : (
          // Rental Strategy Metrics
          <>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Monthly Cash Flow</p>
              <p className="text-2xl font-bold text-primary">
                ${financial_metrics?.monthly_cash_flow?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Cap Rate</p>
              <p className="text-2xl font-bold text-primary">
                {financial_metrics?.cap_rate?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Cash on Cash</p>
              <p className="text-2xl font-bold text-primary">
                {financial_metrics?.cash_on_cash_return?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Total ROI</p>
              <p className="text-2xl font-bold text-green-600">
                {financial_metrics?.roi?.toFixed(1) || '0'}%
              </p>
            </div>
          </>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h3 className="font-semibold text-primary mb-3">Investment Summary</h3>
        <p className="text-muted leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {analysis.recommendation && (
        <div className={`
          ${analysis.recommendation.toLowerCase().includes('pass') || 
            analysis.recommendation.toLowerCase().includes('avoid') || 
            analysis.recommendation.toLowerCase().includes("don't") ||
            analysis.recommendation.toLowerCase().includes('not recommended')
            ? 'bg-red-50 border-red-200' 
            : analysis.recommendation.toLowerCase().includes('maybe') || 
              analysis.recommendation.toLowerCase().includes('cautious') ||
              analysis.recommendation.toLowerCase().includes('careful')
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-green-50 border-green-200'
          } border rounded-lg p-6 mb-6
        `}>
          <div className="flex items-start gap-3">
            {analysis.recommendation.toLowerCase().includes('pass') || 
             analysis.recommendation.toLowerCase().includes('avoid') || 
             analysis.recommendation.toLowerCase().includes("don't") ||
             analysis.recommendation.toLowerCase().includes('not recommended') ? (
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : analysis.recommendation.toLowerCase().includes('maybe') || 
                analysis.recommendation.toLowerCase().includes('cautious') ||
                analysis.recommendation.toLowerCase().includes('careful') ? (
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <div>
              <h4 className={`font-semibold mb-1 ${
                analysis.recommendation.toLowerCase().includes('pass') || 
                analysis.recommendation.toLowerCase().includes('avoid') || 
                analysis.recommendation.toLowerCase().includes("don't") ||
                analysis.recommendation.toLowerCase().includes('not recommended')
                  ? 'text-red-900' 
                  : analysis.recommendation.toLowerCase().includes('maybe') || 
                    analysis.recommendation.toLowerCase().includes('cautious') ||
                    analysis.recommendation.toLowerCase().includes('careful')
                  ? 'text-yellow-900'
                  : 'text-green-900'
              }`}>Recommendation</h4>
              <p className={`${
                analysis.recommendation.toLowerCase().includes('pass') || 
                analysis.recommendation.toLowerCase().includes('avoid') || 
                analysis.recommendation.toLowerCase().includes("don't") ||
                analysis.recommendation.toLowerCase().includes('not recommended')
                  ? 'text-red-800' 
                  : analysis.recommendation.toLowerCase().includes('maybe') || 
                    analysis.recommendation.toLowerCase().includes('cautious') ||
                    analysis.recommendation.toLowerCase().includes('careful')
                  ? 'text-yellow-800'
                  : 'text-green-800'
              }`}>{analysis.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href={`/analysis/results/${data.analysisId}`}
          className="flex-1 sm:flex-initial px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 text-center font-medium"
        >
          View Full Analysis
        </Link>
        <button
          onClick={handleSaveToDashboard}
          disabled={isSaving}
          className="flex-1 sm:flex-initial px-6 py-3 bg-card border border-primary text-primary rounded-lg hover:bg-primary/5 font-medium disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : isFavorite ? 'Saved to Dashboard' : 'Save to Dashboard'}
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex-1 sm:flex-initial px-6 py-3 bg-card border border-border text-primary rounded-lg hover:bg-muted/20 font-medium"
        >
          Download PDF
        </button>
        <button
          onClick={handleShare}
          className="flex-1 sm:flex-initial px-6 py-3 bg-card border border-border text-primary rounded-lg hover:bg-muted/20 font-medium"
        >
          Share
        </button>
      </div>

      <div className="bg-muted/10 rounded-lg p-6 text-center">
        <h3 className="font-semibold text-primary mb-3">What's Next?</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/analysis/new')}
            className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 font-medium"
          >
            Analyze Another Property
          </button>
          <button
            onClick={() => router.push('/analysis')}
            className="px-6 py-3 text-primary border border-primary/30 rounded-lg hover:bg-primary/5 font-medium"
          >
            View All Analyses
          </button>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-primary mb-4">Share Analysis</h3>
            <div className="bg-muted/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-muted mb-2">Share link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/analysis/results/${data.analysisId}`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm"
                />
                <button
                  onClick={copyShareLink}
                  className="px-3 py-2 bg-primary text-secondary rounded text-sm hover:bg-primary/90"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-4 py-2 text-muted hover:text-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}