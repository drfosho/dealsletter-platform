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
    'house-hack': 'House Hack',
    commercial: 'Commercial'
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'flip': return '🔨';
      case 'brrrr': return '♻️';
      case 'rental': return '🏘️';
      case 'house-hack': return '🏡';
      case 'commercial': return '🏢';
      default: return '📊';
    }
  };

  const getRiskLevel = () => {
    // CRITICAL FIX: Check multiple locations for all financial metrics
    const analysisData = (analysis as any).analysis_data || {};
    const aiMetrics = analysis.ai_analysis?.financial_metrics || {};
    const nestedAiMetrics = analysisData?.ai_analysis?.financial_metrics || {};

    const roi = (analysis as any).roi ||
               aiMetrics?.roi ||
               nestedAiMetrics?.roi ||
               analysisData?.roi ||
               0;

    // Normalize strategy for comparison
    const strategy = (analysis.strategy || analysisData?.strategy || '').toLowerCase();

    if (strategy === 'flip') {
      // Fix & Flip risk assessment based on ROI and timeline
      // CRITICAL: Use timeline from strategy_details, NOT loan_term
      const timeline = parseInt((analysis as any).analysis_data?.strategy_details?.timeline) ||
                       parseInt((analysis as any).strategy_details?.timeline) ||
                       parseInt((analysis as any).strategyDetails?.timeline) ||
                       (analysis as any).analysis_data?.flip_timeline_months ||
                       analysisData?.flip_timeline_months || 6;
      if (roi < 15 || timeline > 12) return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
      if (roi < 25 || timeline > 9) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    } else {
      // Rental/BRRRR/House-hack risk assessment based on ROI and cash flow
      const cashFlow = aiMetrics?.monthly_cash_flow || nestedAiMetrics?.monthly_cash_flow || analysisData?.monthlyCashFlow || 0;
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
    // CRITICAL FIX: Check multiple locations for all financial metrics
    const analysisData = (analysis as any).analysis_data || {};
    const aiMetrics = analysis.ai_analysis?.financial_metrics || {};
    const nestedAiMetrics = analysisData?.ai_analysis?.financial_metrics || {};
    const strategyDetails = analysisData?.strategy_details || (analysis as any).strategy_details || {};

    // DEBUG: Log the full data structure to understand where values are
    console.log('[InvestmentScore] FULL DEBUG:', {
      hasAiAnalysis: !!analysis.ai_analysis,
      hasAnalysisData: !!analysisData,
      aiMetricsKeys: Object.keys(aiMetrics),
      nestedAiMetricsKeys: Object.keys(nestedAiMetrics),
      topLevelRoi: (analysis as any).roi,
      topLevelProfit: (analysis as any).profit
    });

    // Helper to get numeric value, skipping 0/null/undefined to find actual values
    // CRITICAL FIX: Skip 0 values to check all sources for real data
    const getNumericValue = (...sources: (number | undefined | null)[]): number => {
      // First pass: look for non-zero values
      for (const source of sources) {
        if (typeof source === 'number' && !Number.isNaN(source) && source !== 0) {
          return source;
        }
      }
      // Second pass: return 0 if all sources are 0, undefined, or null
      for (const source of sources) {
        if (typeof source === 'number' && !Number.isNaN(source)) {
          return source; // Return 0 if that's all we have
        }
      }
      return 0;
    };

    // ROI: Check all possible locations (use first valid number found)
    const roi = getNumericValue(
      (analysis as any).roi,
      aiMetrics?.roi,
      nestedAiMetrics?.roi,
      analysisData?.roi,
      analysisData?.calculatedMetrics?.roi,
      (analysis as any).calculated_metrics?.roi
    );

    // Debug: Log where ROI was found
    console.log('[InvestmentScore] ROI source check:', {
      topLevel: (analysis as any).roi,
      aiMetrics: aiMetrics?.roi,
      nestedAiMetrics: nestedAiMetrics?.roi,
      analysisDataRoi: analysisData?.roi,
      finalRoi: roi
    });

    let score = 0; // Start at 0 and build up based on metrics
    const maxScore = 100;

    // Normalize strategy name for comparison
    const strategy = (analysis.strategy || analysisData?.strategy || '').toLowerCase();

    if (strategy === 'flip') {
      // ===== FIX & FLIP SCORING =====
      // For flips, ROI and profit margin are the primary success metrics

      // Get profit values from all possible locations
      // CRITICAL: Also check analysis_data.ai_analysis.financial_metrics directly
      const netProfit = getNumericValue(
        (analysis as any).profit,
        aiMetrics?.net_profit,
        aiMetrics?.total_profit,
        nestedAiMetrics?.net_profit,
        nestedAiMetrics?.total_profit,
        analysisData?.profit,
        analysisData?.netProfit,
        analysisData?.calculatedMetrics?.totalProfit,
        (analysis as any).calculated_metrics?.totalProfit,
        // Also check strategy_details where values might be stored
        strategyDetails?.netProfit,
        strategyDetails?.profit
      );

      // Debug: Log where profit was found
      console.log('[InvestmentScore] Profit source check:', {
        topLevel: (analysis as any).profit,
        aiMetricsNetProfit: aiMetrics?.net_profit,
        aiMetricsTotalProfit: aiMetrics?.total_profit,
        nestedNetProfit: nestedAiMetrics?.net_profit,
        nestedTotalProfit: nestedAiMetrics?.total_profit,
        analysisDataProfit: analysisData?.profit,
        finalNetProfit: netProfit
      });

      const purchasePrice = getNumericValue(
        analysis.purchase_price,
        analysisData?.purchase_price,
        analysisData?.purchasePrice
      );

      // Get ARV for proper profit margin calculation
      const arv = getNumericValue(
        (aiMetrics as any)?.arv,
        (nestedAiMetrics as any)?.arv,
        analysisData?.arv,
        (analysis as any).arv,
        (analysis.property_data as any)?.comparables?.value
      );

      // CRITICAL FIX: For flips, profit margin = netProfit / ARV (industry standard)
      // First try to get saved profitMargin, then calculate from ARV, then fallback to purchase price
      const profitMargin = getNumericValue(
        (aiMetrics as any)?.profitMargin,
        (aiMetrics as any)?.profit_margin,
        (nestedAiMetrics as any)?.profitMargin,
        (nestedAiMetrics as any)?.profit_margin,
        analysisData?.profitMargin
      ) || (arv > 0 ? (netProfit / arv) * 100 : (purchasePrice > 0 ? (netProfit / purchasePrice) * 100 : 0));

      console.log('[InvestmentScore] Profit margin calculation:', {
        savedProfitMargin: (aiMetrics as any)?.profitMargin || (aiMetrics as any)?.profit_margin,
        calculatedFromARV: arv > 0 ? (netProfit / arv) * 100 : null,
        arv,
        netProfit,
        finalProfitMargin: profitMargin
      });

      const timeline = getNumericValue(
        (analysis as any).strategy_details?.timeline,
        (analysis as any).strategyDetails?.timeline,
        analysisData?.strategy_details?.timeline,
        analysisData?.strategyDetails?.timeline,
        analysisData?.flip_timeline_months
      ) || 6; // Default to 6 months if not specified

      const rehabCosts = getNumericValue(
        analysis.rehab_costs,
        analysisData?.rehab_costs,
        analysisData?.rehabCosts
      );

      console.log('[InvestmentScore] Flip metrics:', { roi, netProfit, profitMargin, arv, timeline, purchasePrice, rehabCosts });

      // FALLBACK: If ROI is 0 but we have valid profit and investment data, calculate ROI
      let effectiveRoi = roi;
      if (effectiveRoi === 0 && netProfit > 0 && purchasePrice > 0) {
        // Estimate cash required (down payment + closing costs for hard money)
        const estimatedDownPayment = purchasePrice * 0.10; // 10% for hard money
        const estimatedClosingCosts = purchasePrice * 0.03; // 3% closing
        const estimatedCashRequired = estimatedDownPayment + estimatedClosingCosts;
        effectiveRoi = (netProfit / estimatedCashRequired) * 100;
        console.log('[InvestmentScore] Calculated ROI from profit:', effectiveRoi);
      }

      // FALLBACK: If profit margin is 0 but we have profit and ARV, calculate it
      let effectiveProfitMargin = profitMargin;
      if (effectiveProfitMargin === 0 && netProfit > 0 && arv > 0) {
        effectiveProfitMargin = (netProfit / arv) * 100;
        console.log('[InvestmentScore] Calculated profit margin:', effectiveProfitMargin);
      }

      // ROI Component (50 points max) - PRIMARY METRIC FOR FLIPS
      // Excellent returns should be heavily rewarded
      let roiScore = 0;
      if (effectiveRoi >= 100) roiScore = 50;        // Exceptional: 100%+ ROI
      else if (effectiveRoi >= 75) roiScore = 47;    // Outstanding: 75-100% ROI
      else if (effectiveRoi >= 50) roiScore = 44;    // Excellent: 50-75% ROI
      else if (effectiveRoi >= 40) roiScore = 40;    // Very Good: 40-50% ROI
      else if (effectiveRoi >= 30) roiScore = 36;    // Good: 30-40% ROI
      else if (effectiveRoi >= 25) roiScore = 32;    // Above Average: 25-30% ROI
      else if (effectiveRoi >= 20) roiScore = 28;    // Average: 20-25% ROI
      else if (effectiveRoi >= 15) roiScore = 22;    // Below Average: 15-20% ROI
      else if (effectiveRoi >= 10) roiScore = 16;    // Marginal: 10-15% ROI
      else if (effectiveRoi >= 5) roiScore = 10;     // Poor: 5-10% ROI
      else if (effectiveRoi >= 0) roiScore = 5;      // Very Poor: 0-5% ROI
      else roiScore = 0;                              // Losing money

      score += roiScore;

      // Profit Margin Component (35 points max) - IMPROVED SCORING
      let marginScore = 0;
      if (effectiveProfitMargin >= 20) marginScore = 35;       // Excellent
      else if (effectiveProfitMargin >= 15) marginScore = 31;  // Very Good
      else if (effectiveProfitMargin >= 12) marginScore = 27;  // Good
      else if (effectiveProfitMargin >= 10) marginScore = 23;  // Above Average
      else if (effectiveProfitMargin >= 8) marginScore = 19;   // Average
      else if (effectiveProfitMargin >= 6) marginScore = 15;   // Below Average
      else if (effectiveProfitMargin >= 4) marginScore = 10;   // Marginal
      else if (effectiveProfitMargin >= 0) marginScore = 5;    // Poor
      else marginScore = 0;                                    // Losing money

      score += marginScore;

      // Risk/Timeline Assessment (15 points max)
      // Start with full points, deduct for risk factors
      let riskScore = 15;

      // Timeline risk (longer = riskier)
      if (timeline > 12) riskScore -= 3;
      else if (timeline > 9) riskScore -= 1;

      // High rehab relative to purchase price
      if (purchasePrice > 0 && rehabCosts / purchasePrice > 0.5) riskScore -= 3;
      else if (purchasePrice > 0 && rehabCosts / purchasePrice > 0.35) riskScore -= 1;

      // Very thin margins are risky
      if (effectiveProfitMargin < 5 && effectiveProfitMargin > 0) riskScore -= 2;

      // Very low absolute profit increases risk
      if (netProfit < 15000 && netProfit > 0) riskScore -= 1;

      score += Math.max(0, riskScore);

      // BONUS: Add points for exceptional deals
      if (netProfit >= 100000) score += 5; // Large profit bonus
      else if (netProfit >= 50000) score += 3; // Good profit bonus

      console.log('[InvestmentScore] Flip score breakdown:', {
        roiScore: `${roiScore}/50`,
        marginScore: `${marginScore}/35`,
        riskScore: `${Math.max(0, riskScore)}/15`,
        bonus: netProfit >= 100000 ? 5 : (netProfit >= 50000 ? 3 : 0),
        totalScore: score,
        effectiveRoi,
        effectiveProfitMargin
      });

      // VALIDATION: Check if score makes sense
      if (effectiveRoi > 50 && effectiveProfitMargin > 10 && score < 65) {
        console.warn('[InvestmentScore] WARNING: Good metrics but moderate score', { effectiveRoi, effectiveProfitMargin, score });
      }

    } else if (strategy === 'brrrr') {
      // ===== BRRRR SCORING =====
      const capRate = getNumericValue(aiMetrics?.cap_rate, nestedAiMetrics?.cap_rate, analysisData?.capRate);
      const cashFlow = getNumericValue(aiMetrics?.monthly_cash_flow, nestedAiMetrics?.monthly_cash_flow, analysisData?.monthlyCashFlow);
      const cashOnCash = getNumericValue(aiMetrics?.cash_on_cash_return, nestedAiMetrics?.cash_on_cash_return, analysisData?.cashOnCash);

      console.log('[InvestmentScore] BRRRR metrics:', { roi, capRate, cashFlow, cashOnCash });

      // ROI Component (30 points max)
      if (roi >= 50) score += 30;
      else if (roi >= 30) score += 26;
      else if (roi >= 20) score += 22;
      else if (roi >= 15) score += 18;
      else if (roi >= 10) score += 12;
      else if (roi >= 5) score += 6;
      else if (roi >= 0) score += 3;

      // Cap Rate Component (25 points max)
      if (capRate >= 10) score += 25;
      else if (capRate >= 8) score += 22;
      else if (capRate >= 6) score += 18;
      else if (capRate >= 5) score += 14;
      else if (capRate >= 4) score += 10;
      else if (capRate >= 2) score += 5;

      // Cash Flow Component (25 points max)
      if (cashFlow >= 500) score += 25;
      else if (cashFlow >= 300) score += 20;
      else if (cashFlow >= 200) score += 15;
      else if (cashFlow >= 100) score += 10;
      else if (cashFlow >= 0) score += 5;

      // Cash-on-Cash (20 points max)
      if (cashOnCash >= 15) score += 20;
      else if (cashOnCash >= 12) score += 16;
      else if (cashOnCash >= 10) score += 12;
      else if (cashOnCash >= 8) score += 8;
      else if (cashOnCash >= 5) score += 4;

    } else if (strategy === 'house-hack') {
      // ===== HOUSE HACK SCORING =====
      // For house hack, the key metric is housing savings, not traditional cash flow
      const housingROI = getNumericValue(
        (aiMetrics as any)?.housing_roi,
        (nestedAiMetrics as any)?.housing_roi,
        analysisData?.housingROI,
        roi // Fall back to general ROI if housing-specific not available
      );
      const outOfPocket = getNumericValue(
        (aiMetrics as any)?.out_of_pocket_housing_cost,
        (nestedAiMetrics as any)?.out_of_pocket_housing_cost,
        analysisData?.outOfPocketHousingCost
      );
      const housingSavings = getNumericValue(
        (aiMetrics as any)?.monthly_housing_savings,
        (nestedAiMetrics as any)?.monthly_housing_savings,
        analysisData?.monthlyHousingSavings
      );

      console.log('[InvestmentScore] House Hack metrics:', { housingROI, outOfPocket, housingSavings, roi });

      // Housing Savings Component (40 points max)
      // Negative out-of-pocket = you're getting paid to live there!
      if (outOfPocket <= 0) score += 40;           // Live free or get paid
      else if (outOfPocket <= 300) score += 35;    // Very low housing cost
      else if (outOfPocket <= 500) score += 30;    // Low housing cost
      else if (outOfPocket <= 800) score += 25;    // Moderate housing cost
      else if (outOfPocket <= 1200) score += 20;   // Below market housing cost
      else if (outOfPocket <= 1500) score += 15;   // Slightly reduced housing cost
      else score += 10;                            // Some benefit

      // Housing ROI Component (35 points max)
      if (housingROI >= 50) score += 35;
      else if (housingROI >= 40) score += 30;
      else if (housingROI >= 30) score += 25;
      else if (housingROI >= 20) score += 20;
      else if (housingROI >= 15) score += 15;
      else if (housingROI >= 10) score += 10;
      else if (housingROI >= 0) score += 5;

      // Accessibility/FHA Eligibility (15 points max)
      const downPaymentPercent = analysis.down_payment_percent || 20;
      if (downPaymentPercent <= 5) score += 15;    // FHA eligible
      else if (downPaymentPercent <= 10) score += 10;
      else if (downPaymentPercent <= 15) score += 5;

      // Market Position (10 points max)
      const medianPrice = analysis.market_data?.medianSalePrice || 0;
      const purchasePrice = analysis.purchase_price || 0;
      if (medianPrice > 0 && purchasePrice > 0 && purchasePrice < medianPrice) {
        score += 10;
      } else if (medianPrice > 0 && purchasePrice > 0 && purchasePrice < medianPrice * 1.1) {
        score += 5;
      }

      console.log('[InvestmentScore] House Hack score:', score);

    } else {
      // ===== BUY & HOLD / RENTAL SCORING =====
      const capRate = getNumericValue(aiMetrics?.cap_rate, nestedAiMetrics?.cap_rate, analysisData?.capRate);
      const cashFlow = getNumericValue(aiMetrics?.monthly_cash_flow, nestedAiMetrics?.monthly_cash_flow, analysisData?.monthlyCashFlow);
      const cashOnCash = getNumericValue(aiMetrics?.cash_on_cash_return, nestedAiMetrics?.cash_on_cash_return, analysisData?.cashOnCash);

      console.log('[InvestmentScore] Rental metrics:', { roi, capRate, cashFlow, cashOnCash, strategy });

      // Cap Rate Component (30 points max)
      if (capRate >= 10) score += 30;
      else if (capRate >= 8) score += 26;
      else if (capRate >= 6) score += 20;
      else if (capRate >= 5) score += 15;
      else if (capRate >= 4) score += 10;
      else if (capRate >= 2) score += 5;

      // Cash-on-Cash Return Component (30 points max)
      if (cashOnCash >= 15) score += 30;
      else if (cashOnCash >= 12) score += 25;
      else if (cashOnCash >= 10) score += 20;
      else if (cashOnCash >= 8) score += 15;
      else if (cashOnCash >= 6) score += 10;
      else if (cashOnCash >= 0) score += 5;

      // Monthly Cash Flow Component (25 points max)
      if (cashFlow >= 500) score += 25;
      else if (cashFlow >= 300) score += 20;
      else if (cashFlow >= 200) score += 15;
      else if (cashFlow >= 100) score += 10;
      else if (cashFlow >= 0) score += 5;

      // Market Position (15 points max)
      const medianPrice = analysis.market_data?.medianSalePrice || 0;
      const purchasePrice = analysis.purchase_price || 0;
      if (medianPrice > 0 && purchasePrice > 0) {
        const priceRatio = purchasePrice / medianPrice;
        if (priceRatio < 0.85) score += 15;
        else if (priceRatio < 0.95) score += 12;
        else if (priceRatio < 1.05) score += 8;
        else if (priceRatio < 1.15) score += 4;
      } else {
        score += 7; // Default if no market data
      }
    }

    const finalScore = Math.min(maxScore, Math.max(0, Math.round(score)));
    console.log('[InvestmentScore] Final score:', finalScore, '/ 100');

    return finalScore;
  }

  function getTimelineEstimate(strategy: string): string {
    switch (strategy) {
      case 'flip': {
        // Use timeline from strategy details if available
        // CRITICAL: Check multiple locations where timeline could be stored
        const timeline = parseInt((analysis as any).analysis_data?.strategy_details?.timeline) ||
                         parseInt((analysis as any).strategy_details?.timeline) ||
                         parseInt((analysis as any).strategyDetails?.timeline) ||
                         (analysis as any).analysis_data?.flip_timeline_months;
        return timeline ? `${timeline} months` : '6-12 months';
      }
      case 'brrrr': return '12-18 months';
      case 'rental': return '5+ years';
      case 'commercial': return '1+ years';
      default: return 'Varies';
    }
  }
}
