'use client';

import type { Analysis } from '@/types';
import {
  formatSummary,
  formatRecommendation,
  getRecommendationType,
  getRecommendationColors
} from '@/utils/format-text';

interface AnalysisOverviewProps {
  analysis: Analysis;
}

export default function AnalysisOverview({ analysis }: AnalysisOverviewProps) {
  const strategyLabels: Record<string, string> = {
    flip: 'Fix & Flip',
    brrrr: 'BRRRR Strategy',
    rental: 'Buy & Hold',
    commercial: 'House Hack'
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'flip': return '🔨';
      case 'brrrr': return '♻️';
      case 'rental': return '🏘️';
      case 'commercial': return '🏡';
      default: return '📊';
    }
  };

  const getRiskLevel = () => {
    // CRITICAL FIX: Check multiple locations for ROI
    // Data can be at top level (from DB) or nested in ai_analysis.financial_metrics
    const roi = (analysis as any).roi ||
               analysis.ai_analysis?.financial_metrics?.roi ||
               (analysis as any).analysis_data?.roi ||
               0;

    if (analysis.strategy === 'flip') {
      // Fix & Flip risk assessment based on ROI and timeline
      const timeline = (analysis as any).strategy_details?.timeline ||
                      (analysis as any).strategyDetails?.timeline || 6;
      if (roi < 15 || timeline > 12) return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
      if (roi < 25 || timeline > 9) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    } else {
      // Rental property risk assessment based on ROI and cash flow
      const cashFlow = analysis.ai_analysis?.financial_metrics?.monthly_cash_flow || 0;
      if (roi < 10 || cashFlow < 0) return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
      if (roi < 15 || cashFlow < 200) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  const risk = getRiskLevel();
  const recommendation = (analysis.ai_analysis as any)?.recommendation;
  const recommendationType = getRecommendationType(recommendation);
  const recommendationColors = getRecommendationColors(recommendationType);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-2">Investment Overview</h3>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="flex items-center gap-1">
              <span className="text-xl">{getStrategyIcon(analysis.strategy)}</span>
              <span className="font-medium">{strategyLabels[analysis.strategy] || analysis.strategy}</span>
            </span>
            <span className="text-muted hidden sm:inline">•</span>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${risk.bg} ${risk.color}`}>
              {risk.level} Risk
            </span>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Completed
        </div>
      </div>

      {analysis.ai_analysis?.summary && (
        <div className="mb-6">
          <p className="text-primary leading-relaxed">
            {formatSummary(analysis.ai_analysis.summary)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h4 className="font-semibold text-primary">Market Position</h4>
          </div>
          <p className="text-sm text-muted">
            {analysis.market_data?.medianSalePrice ? (
              `${((analysis.purchase_price / analysis.market_data.medianSalePrice - 1) * 100).toFixed(0)}% ${
                analysis.purchase_price < analysis.market_data.medianSalePrice ? 'below' : 'above'
              } median`
            ) : (
              'Market data unavailable'
            )}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold text-primary">Investment Score</h4>
          </div>
          <p className="text-sm font-medium">
            <span className={`text-lg ${getScoreColor(getInvestmentScore(analysis))}`}>
              {getInvestmentScore(analysis)}
            </span>
            <span className="text-muted">/100</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold text-primary">Timeline</h4>
          </div>
          <p className="text-sm text-muted">
            {getTimelineEstimate(analysis.strategy)}
          </p>
        </div>
      </div>

      {recommendation && (
        <div className={`mt-6 p-4 rounded-lg border ${recommendationColors.bg} ${recommendationColors.border}`}>
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
              <h4 className={`font-semibold mb-1 ${recommendationColors.title}`}>DealLetter AI Recommendation</h4>
              <p className={`text-sm leading-relaxed ${recommendationColors.text}`}>
                {formatRecommendation(recommendation)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getScoreColor(score: number): string {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getInvestmentScore(analysis: AnalysisOverviewProps['analysis']): number {
    // CRITICAL FIX: Check multiple locations for ROI
    const roi = (analysis as any).roi ||
               analysis.ai_analysis?.financial_metrics?.roi ||
               (analysis as any).analysis_data?.roi ||
               0;

    let score = 50; // Base score

    if (analysis.strategy === 'flip') {
      // Fix & Flip scoring based on ROI and profit margin
      // CRITICAL FIX: Check multiple locations for net profit
      const netProfit = (analysis as any).profit ||
                       analysis.ai_analysis?.financial_metrics?.net_profit ||
                       analysis.ai_analysis?.financial_metrics?.total_profit ||
                       (analysis as any).analysis_data?.profit ||
                       0;
      const timeline = (analysis as any).strategy_details?.timeline ||
                      (analysis as any).strategyDetails?.timeline || 6;

      // ROI contribution (0-35 points for flips)
      if (roi > 30) score += 35;
      else if (roi > 25) score += 30;
      else if (roi > 20) score += 25;
      else if (roi > 15) score += 20;
      else if (roi > 10) score += 15;
      else if (roi > 5) score += 10;

      // Profit contribution (0-10 points)
      if (netProfit > 100000) score += 10;
      else if (netProfit > 75000) score += 8;
      else if (netProfit > 50000) score += 6;
      else if (netProfit > 25000) score += 4;
      else if (netProfit > 10000) score += 2;

      // Timeline bonus (0-5 points)
      if (timeline <= 6) score += 5;
      else if (timeline <= 9) score += 3;
      else if (timeline <= 12) score += 1;
    } else {
      // Rental property scoring
      const capRate = analysis.ai_analysis?.financial_metrics?.cap_rate || 0;
      const cashFlow = analysis.ai_analysis?.financial_metrics?.monthly_cash_flow || 0;

      // ROI contribution (0-25 points)
      if (roi > 20) score += 25;
      else if (roi > 15) score += 20;
      else if (roi > 10) score += 15;
      else if (roi > 5) score += 10;
      else if (roi > 0) score += 5;

      // Cap rate contribution (0-15 points)
      if (capRate > 10) score += 15;
      else if (capRate > 8) score += 12;
      else if (capRate > 6) score += 9;
      else if (capRate > 4) score += 6;
      else if (capRate > 2) score += 3;

      // Cash flow contribution (0-10 points)
      if (cashFlow > 1000) score += 10;
      else if (cashFlow > 500) score += 8;
      else if (cashFlow > 250) score += 6;
      else if (cashFlow > 100) score += 4;
      else if (cashFlow > 0) score += 2;
    }

    return Math.min(100, Math.max(0, score));
  }

  function getTimelineEstimate(strategy: string): string {
    switch (strategy) {
      case 'flip': {
        // Use timeline from strategy details if available
        const timeline = (analysis as any).strategy_details?.timeline ||
                        (analysis as any).strategyDetails?.timeline;
        return timeline ? `${timeline} months` : '6-12 months';
      }
      case 'brrrr': return '12-18 months';
      case 'rental': return '5+ years';
      case 'commercial': return '1+ years';
      default: return 'Varies';
    }
  }
}
