'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { WizardData } from '@/app/analysis/new/page';

interface Step5ResultsProps {
  data: WizardData;
  onComplete: () => void;
}

export default function Step5Results({ data, onComplete }: Step5ResultsProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleSaveToDashboard = async () => {
    setIsSaving(true);
    try {
      // Analysis is already saved, just mark as favorite
      if (data.analysisId) {
        await fetch(`/api/analysis/${data.analysisId}/favorite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_favorite: true })
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to save to dashboard:', error);
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

  const { financial_metrics } = data.analysis;

  return (
    <div>
      {/* Success Header */}
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

      {/* Property Summary */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-1">{data.address}</h3>
            <p className="text-muted">
              {data.strategy === 'flip' ? 'Fix & Flip' : 
               data.strategy === 'brrrr' ? 'BRRRR Strategy' :
               data.strategy === 'rental' ? 'Buy & Hold' :
               'House Hack'} Analysis
            </p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
      </div>

      {/* Analysis Summary */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h3 className="font-semibold text-primary mb-3">Investment Summary</h3>
        <p className="text-muted leading-relaxed">
          {data.analysis.summary}
        </p>
      </div>

      {/* Recommendation */}
      {data.analysis.recommendation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Recommendation</h4>
              <p className="text-green-800">{data.analysis.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
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

      {/* Next Steps */}
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

      {/* Share Modal */}
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