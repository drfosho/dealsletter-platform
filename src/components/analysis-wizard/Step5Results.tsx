'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { WizardData } from '@/app/analysis/new/page';
import {
  formatCurrency,
  formatPercent,
  formatSummary,
  formatRecommendation,
  getRecommendationType,
  getRecommendationColors
} from '@/utils/format-text';

interface Step5ResultsProps {
  data: WizardData;
  onComplete: () => void;
}

export default function Step5Results({ data }: Step5ResultsProps) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  // Get recommendation styling
  const recommendationType = getRecommendationType(analysis.recommendation);
  const recommendationColors = getRecommendationColors(recommendationType);

  // Get property image
  const getPropertyImage = () => {
    const propertyData = data.propertyData as any;
    // Check multiple possible locations for images
    return propertyData?.property?.primaryImageUrl ||
           propertyData?.listing?.primaryImageUrl ||
           propertyData?.primaryImageUrl ||
           propertyData?.images?.[0]?.url ||
           propertyData?.images?.[0] ||
           propertyData?.property?.images?.[0]?.url ||
           propertyData?.property?.images?.[0] ||
           null;
  };

  const imageUrl = getPropertyImage();

  // Get property details
  const getPropertyDetails = () => {
    const propertyData = data.propertyData as any;
    const property = Array.isArray(propertyData?.property)
      ? propertyData.property[0]
      : propertyData?.property || propertyData?.listing || propertyData;

    return {
      bedrooms: property?.bedrooms || property?.beds,
      bathrooms: property?.bathrooms || property?.baths,
      squareFootage: property?.squareFootage || property?.sqft || property?.livingArea,
      propertyType: property?.propertyType || property?.type
    };
  };

  const propertyDetails = getPropertyDetails();

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

      {/* Property Header Card */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Property Image */}
          {imageUrl ? (
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={data.address}
                className="w-32 h-32 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  img.parentElement!.innerHTML = `
                    <div class="w-32 h-32 bg-muted/30 rounded-lg flex flex-col items-center justify-center">
                      <svg class="w-10 h-10 text-muted mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span class="text-xs text-muted">Property</span>
                    </div>
                  `;
                }}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-32 h-32 bg-muted/30 rounded-lg flex flex-col items-center justify-center">
              <svg className="w-10 h-10 text-muted mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs text-muted">Property</span>
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary mb-1">{data.address}</h3>
            <p className="text-muted mb-2">
              {data.strategy === 'flip' ? 'Fix & Flip' :
               data.strategy === 'brrrr' ? 'BRRRR Strategy' :
               data.strategy === 'rental' ? 'Buy & Hold' :
               'House Hack'} Analysis
            </p>
            {(propertyDetails.bedrooms || propertyDetails.bathrooms || propertyDetails.squareFootage) && (
              <p className="text-sm text-muted">
                {propertyDetails.bedrooms && `${propertyDetails.bedrooms} bd`}
                {propertyDetails.bedrooms && propertyDetails.bathrooms && ' • '}
                {propertyDetails.bathrooms && `${propertyDetails.bathrooms} ba`}
                {(propertyDetails.bedrooms || propertyDetails.bathrooms) && propertyDetails.squareFootage && ' • '}
                {propertyDetails.squareFootage && `${propertyDetails.squareFootage.toLocaleString()} sqft`}
              </p>
            )}
            {/* Purchase Price */}
            <p className="text-sm font-medium text-primary mt-2">
              Purchase Price: {formatCurrency(data.financial?.purchasePrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {data.strategy === 'flip' ? (
          // Fix & Flip Metrics
          <>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Net Profit</p>
              <p className={`text-2xl font-bold ${(financial_metrics?.net_profit || financial_metrics?.total_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(financial_metrics?.net_profit || financial_metrics?.total_profit)}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Total Investment</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(financial_metrics?.total_investment || data.financial?.purchasePrice)}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Timeline</p>
              <p className="text-2xl font-bold text-primary">
                {data.strategyDetails?.timeline || '6'} mo
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">ROI</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercent(financial_metrics?.roi)}
              </p>
            </div>
          </>
        ) : data.strategy === 'brrrr' ? (
          // BRRRR Strategy Metrics
          <>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Monthly Cash Flow</p>
              <p className={`text-2xl font-bold ${(financial_metrics?.monthly_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(financial_metrics?.monthly_cash_flow)}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Cash Left in Deal</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(financial_metrics?.cash_left_in_deal || financial_metrics?.total_investment)}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Cash-on-Cash</p>
              <p className="text-2xl font-bold text-primary">
                {formatPercent(financial_metrics?.cash_on_cash_return)}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">5-Year ROI</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercent(financial_metrics?.roi)}
              </p>
            </div>
          </>
        ) : (
          // Rental Strategy Metrics
          <>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Monthly Cash Flow</p>
              <p className={`text-2xl font-bold ${(financial_metrics?.monthly_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(financial_metrics?.monthly_cash_flow)}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Cap Rate</p>
              <p className="text-2xl font-bold text-primary">
                {formatPercent(financial_metrics?.cap_rate)}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Cash on Cash</p>
              <p className="text-2xl font-bold text-primary">
                {formatPercent(financial_metrics?.cash_on_cash_return)}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <p className="text-sm text-muted mb-1">Total ROI</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercent(financial_metrics?.roi)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Investment Summary */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h3 className="font-semibold text-primary mb-3">Investment Summary</h3>
        <p className="text-muted leading-relaxed">
          {formatSummary(analysis.summary)}
        </p>
      </div>

      {/* Recommendation */}
      {analysis.recommendation && (
        <div className={`${recommendationColors.bg} ${recommendationColors.border} border rounded-lg p-6 mb-6`}>
          <div className="flex items-start gap-3">
            {recommendationType === 'negative' ? (
              <svg className={`w-6 h-6 ${recommendationColors.icon} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : recommendationType === 'neutral' ? (
              <svg className={`w-6 h-6 ${recommendationColors.icon} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className={`w-6 h-6 ${recommendationColors.icon} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${recommendationColors.title}`}>
                DealLetter AI Recommendation
              </h4>
              <p className={`${recommendationColors.text} leading-relaxed`}>
                {formatRecommendation(analysis.recommendation)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Breakdown */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h3 className="font-semibold text-primary mb-4">Financial Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Investment Details */}
          <div>
            <h4 className="text-sm font-medium text-muted mb-3">Investment Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Purchase Price</span>
                <span className="font-medium">{formatCurrency(data.financial?.purchasePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Down Payment ({data.financial?.downPaymentPercent || 20}%)</span>
                <span className="font-medium">{formatCurrency((data.financial?.purchasePrice || 0) * (data.financial?.downPaymentPercent || 20) / 100)}</span>
              </div>
              {(data.financial?.renovationCosts || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Renovation Costs</span>
                  <span className="font-medium">{formatCurrency(data.financial?.renovationCosts)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium">Total Cash Needed</span>
                <span className="font-bold text-primary">
                  {formatCurrency(
                    ((data.financial?.purchasePrice || 0) * (data.financial?.downPaymentPercent || 20) / 100) +
                    (data.financial?.renovationCosts || 0) +
                    ((data.financial?.purchasePrice || 0) * 0.03) // Closing costs estimate
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Financing Details */}
          <div>
            <h4 className="text-sm font-medium text-muted mb-3">Financing Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Loan Amount</span>
                <span className="font-medium">
                  {formatCurrency((data.financial?.purchasePrice || 0) * (1 - (data.financial?.downPaymentPercent || 20) / 100))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Interest Rate</span>
                <span className="font-medium">{data.financial?.interestRate || 7}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Loan Term</span>
                <span className="font-medium">{data.financial?.loanTerm || 30} years</span>
              </div>
              {financial_metrics?.monthly_rent && (
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-medium">Monthly Rent</span>
                  <span className="font-bold text-green-600">{formatCurrency(financial_metrics.monthly_rent)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href={`/analysis/results/${data.analysisId}`}
          className="flex-1 sm:flex-initial px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 text-center font-medium"
        >
          View Full Analysis
        </Link>
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

      {/* What's Next */}
      <div className="bg-muted/10 rounded-lg p-6 text-center">
        <h3 className="font-semibold text-primary mb-3">What&apos;s Next?</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/analysis/new')}
            className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 font-medium"
          >
            Analyze Another Property
          </button>
          <button
            onClick={() => router.push('/analysis/history')}
            className="px-6 py-3 text-primary border border-primary/30 rounded-lg hover:bg-primary/5 font-medium"
          >
            View Analysis History
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
                  {copied ? 'Copied!' : 'Copy'}
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
