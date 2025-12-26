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
            <span className={`ml-2 text-xs ${getScoreColor(getInvestmentScore(analysis))}`}>
              ({getScoreLabel(getInvestmentScore(analysis))})
            </span>
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
              <h4 className={`font-semibold mb-1 ${recommendationColors.title}`}>Dealsletter AI Recommendation</h4>
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
    if (score >= 80) return 'text-green-600';   // Excellent deal
    if (score >= 60) return 'text-lime-600';    // Good deal
    if (score >= 40) return 'text-yellow-600';  // Marginal deal
    if (score >= 20) return 'text-orange-600';  // Poor deal
    return 'text-red-600';                      // Very poor deal
  }

  function getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Marginal';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  }

  function getInvestmentScore(analysis: AnalysisOverviewProps['analysis']): number {
    // CRITICAL FIX: Check multiple locations for ROI
    const roi = (analysis as any).roi ||
               analysis.ai_analysis?.financial_metrics?.roi ||
               (analysis as any).analysis_data?.roi ||
               0;

    let score = 0; // Start at 0 and build up based on metrics
    let maxScore = 100;

    console.log('[InvestmentScore] Calculating for strategy:', analysis.strategy);

    if (analysis.strategy === 'flip') {
      // Fix & Flip scoring (out of 100)
      // CRITICAL FIX: Check multiple locations for net profit
      const netProfit = (analysis as any).profit ||
                       analysis.ai_analysis?.financial_metrics?.net_profit ||
                       analysis.ai_analysis?.financial_metrics?.total_profit ||
                       (analysis as any).analysis_data?.profit ||
                       0;
      const purchasePrice = analysis.purchase_price || 0;
      const profitMargin = purchasePrice > 0 ? (netProfit / purchasePrice) * 100 : 0;
      const timeline = (analysis as any).strategy_details?.timeline ||
                      (analysis as any).strategyDetails?.timeline ||
                      (analysis as any).analysis_data?.strategy_details?.timeline || 6;
      const rehabCosts = analysis.rehab_costs || 0;

      console.log('[InvestmentScore] Flip metrics:', { roi, netProfit, profitMargin, timeline, purchasePrice, rehabCosts });

      // ROI Component (40 points max)
      if (roi >= 50) score += 40;
      else if (roi >= 30) score += 32;
      else if (roi >= 20) score += 24;
      else if (roi >= 10) score += 16;
      else if (roi >= 5) score += 8;
      else if (roi >= 0) score += 4;
      else score += 0; // Negative ROI = 0 points

      // Profit Margin Component (30 points max)
      if (profitMargin >= 20) score += 30;
      else if (profitMargin >= 15) score += 25;
      else if (profitMargin >= 10) score += 18;
      else if (profitMargin >= 5) score += 10;
      else if (profitMargin >= 0) score += 5;
      else score += 0; // Negative margin = 0 points

      // Timeline Component (20 points max) - shorter is better
      if (timeline <= 4) score += 20;
      else if (timeline <= 6) score += 16;
      else if (timeline <= 9) score += 10;
      else if (timeline <= 12) score += 5;
      else score += 0; // Over a year = 0 points

      // Risk Assessment (10 points max) - deduct for risk factors
      let riskDeductions = 0;
      // High renovation costs relative to purchase
      if (purchasePrice > 0 && rehabCosts / purchasePrice > 0.3) riskDeductions += 2;
      // Low profit margin is risky
      if (profitMargin < 10) riskDeductions += 2;
      // Long timeline is risky
      if (timeline > 9) riskDeductions += 2;
      // Negative or very low ROI
      if (roi < 10) riskDeductions += 3;
      // Low absolute profit
      if (netProfit < 25000) riskDeductions += 1;

      score += Math.max(0, 10 - riskDeductions);

      console.log('[InvestmentScore] Flip score breakdown:', { score, riskDeductions });

    } else if (analysis.strategy === 'brrrr') {
      // BRRRR scoring (combines flip + rental aspects)
      const capRate = analysis.ai_analysis?.financial_metrics?.cap_rate || 0;
      const cashFlow = analysis.ai_analysis?.financial_metrics?.monthly_cash_flow || 0;
      const cashOnCash = analysis.ai_analysis?.financial_metrics?.cash_on_cash_return || 0;

      console.log('[InvestmentScore] BRRRR metrics:', { roi, capRate, cashFlow, cashOnCash });

      // ROI Component (30 points max)
      if (roi >= 30) score += 30;
      else if (roi >= 20) score += 24;
      else if (roi >= 15) score += 18;
      else if (roi >= 10) score += 12;
      else if (roi >= 5) score += 6;
      else if (roi >= 0) score += 3;
      else score += 0;

      // Cap Rate Component (25 points max)
      if (capRate >= 8) score += 25;
      else if (capRate >= 6) score += 20;
      else if (capRate >= 5) score += 15;
      else if (capRate >= 4) score += 10;
      else if (capRate >= 2) score += 5;
      else score += 0;

      // Cash Flow Component (25 points max)
      if (cashFlow >= 500) score += 25;
      else if (cashFlow >= 300) score += 20;
      else if (cashFlow >= 200) score += 15;
      else if (cashFlow >= 100) score += 10;
      else if (cashFlow >= 0) score += 5;
      else score += 0; // Negative cash flow = 0

      // Cash-on-Cash (20 points max)
      if (cashOnCash >= 15) score += 20;
      else if (cashOnCash >= 12) score += 16;
      else if (cashOnCash >= 10) score += 12;
      else if (cashOnCash >= 8) score += 8;
      else if (cashOnCash >= 5) score += 4;
      else score += 0;

    } else {
      // Buy & Hold / Rental property scoring (out of 100)
      const capRate = analysis.ai_analysis?.financial_metrics?.cap_rate || 0;
      const cashFlow = analysis.ai_analysis?.financial_metrics?.monthly_cash_flow || 0;
      const cashOnCash = analysis.ai_analysis?.financial_metrics?.cash_on_cash_return || 0;

      console.log('[InvestmentScore] Rental metrics:', { roi, capRate, cashFlow, cashOnCash });

      // Cap Rate Component (30 points max)
      if (capRate >= 10) score += 30;
      else if (capRate >= 8) score += 26;
      else if (capRate >= 6) score += 20;
      else if (capRate >= 5) score += 15;
      else if (capRate >= 4) score += 10;
      else if (capRate >= 2) score += 5;
      else score += 0; // Below 2% = poor

      // Cash-on-Cash Return Component (30 points max)
      if (cashOnCash >= 15) score += 30;
      else if (cashOnCash >= 12) score += 25;
      else if (cashOnCash >= 10) score += 20;
      else if (cashOnCash >= 8) score += 15;
      else if (cashOnCash >= 6) score += 10;
      else if (cashOnCash >= 0) score += 5;
      else score += 0; // Negative = 0

      // Monthly Cash Flow Component (25 points max)
      if (cashFlow >= 500) score += 25;
      else if (cashFlow >= 300) score += 20;
      else if (cashFlow >= 200) score += 15;
      else if (cashFlow >= 100) score += 10;
      else if (cashFlow >= 0) score += 5;
      else score += 0; // Negative cash flow = 0 points

      // Market Position (15 points max)
      // Based on price relative to market median
      const medianPrice = analysis.market_data?.medianSalePrice || 0;
      const purchasePrice = analysis.purchase_price || 0;
      if (medianPrice > 0 && purchasePrice > 0) {
        const priceRatio = purchasePrice / medianPrice;
        if (priceRatio < 0.85) score += 15; // 15%+ below market
        else if (priceRatio < 0.95) score += 12; // 5-15% below
        else if (priceRatio < 1.05) score += 8; // At market
        else if (priceRatio < 1.15) score += 4; // 5-15% above
        else score += 0; // 15%+ above market
      } else {
        score += 7; // Default if no market data
      }
    }

    const finalScore = Math.min(maxScore, Math.max(0, Math.round(score)));
    console.log('[InvestmentScore] Final score:', finalScore);

    return finalScore;
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
