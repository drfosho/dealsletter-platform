'use client';

import type { Analysis } from '@/types';

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
    const roi = analysis.ai_analysis?.financial_metrics?.roi || 0;
    const cashFlow = analysis.ai_analysis?.financial_metrics?.monthly_cash_flow || 0;
    
    if (roi < 10 || cashFlow < 0) return { level: 'High', color: 'text-red-600' };
    if (roi < 15 || cashFlow < 200) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  const risk = getRiskLevel();

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-2">Investment Overview</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="text-xl">{getStrategyIcon(analysis.strategy)}</span>
              <span className="font-medium">{strategyLabels[analysis.strategy] || analysis.strategy}</span>
            </span>
            <span className="text-muted">•</span>
            <span className="flex items-center gap-1">
              Risk Level: <span className={`font-medium ${risk.color}`}>{risk.level}</span>
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
            {analysis.ai_analysis.summary}
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
          <p className="text-sm text-muted">
            {getInvestmentScore(analysis)}/100
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

      {analysis.ai_analysis && (analysis.ai_analysis as any).recommendation && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div>
              <h4 className="font-semibold text-primary mb-1">AI Recommendation</h4>
              <p className="text-sm text-primary/80">
                {(analysis.ai_analysis as any).recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getInvestmentScore(analysis: AnalysisOverviewProps['analysis']): number {
    const roi = analysis.ai_analysis?.financial_metrics?.roi || 0;
    const capRate = analysis.ai_analysis?.financial_metrics?.cap_rate || 0;
    const cashFlow = analysis.ai_analysis?.financial_metrics?.monthly_cash_flow || 0;

    let score = 50; // Base score

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

    return Math.min(100, Math.max(0, score));
  }

  function getTimelineEstimate(strategy: string): string {
    switch (strategy) {
      case 'flip': return '6-12 months';
      case 'brrrr': return '12-18 months';
      case 'rental': return '5+ years';
      case 'commercial': return '1+ years';
      default: return 'Varies';
    }
  }
}