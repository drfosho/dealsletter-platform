'use client';

import { useMemo } from 'react';
import type { Analysis } from '@/types';
import { calculateFlipReturns, type FlipCalculationInputs } from '@/utils/financial-calculations';

interface FlipTimelineProps {
  analysis: Analysis;
}

export default function FlipTimeline({ analysis }: FlipTimelineProps) {
  const purchasePrice = analysis.purchase_price || 0;
  const analysisData = (analysis as any).analysis_data || {};
  const savedLoanTerms = analysisData?.loan_terms || {};

  // Use the same input extraction as FinancialMetrics for consistency
  const timeline = parseInt(analysisData?.strategy_details?.timeline) ||
                   parseInt((analysis as any).strategy_details?.timeline) ||
                   parseInt((analysis as any).strategyDetails?.timeline) ||
                   analysisData?.flip_timeline_months ||
                   6;

  const rehabCosts = analysis.rehab_costs ||
                    (analysis as any).renovationCosts ||
                    analysisData?.rehab_costs ||
                    0;

  const aiMetrics = analysis.ai_analysis?.financial_metrics;

  // ARV: Use saved ARV from analysis_data first (set during wizard), then AI metrics
  const arv = analysisData?.arv ||
              (aiMetrics as any)?.arv ||
              analysisData?.ai_analysis?.financial_metrics?.arv ||
              (analysis.property_data as any)?.comparables?.value ||
              purchasePrice * 1.3;

  // Use centralized calculator with same inputs as FinancialMetrics
  const flipResults = useMemo(() => {
    const interestRate = savedLoanTerms.interestRate ||
                        analysis.interest_rate ||
                        analysisData?.interest_rate ||
                        10;
    const points = savedLoanTerms.points || 0;
    const loanType = savedLoanTerms.loanType || 'conventional';

    const flipInputs: FlipCalculationInputs = {
      purchasePrice,
      downPaymentPercent: analysis.down_payment_percent || 20,
      interestRate,
      loanTermYears: 1,
      renovationCosts: rehabCosts,
      arv,
      holdingPeriodMonths: timeline,
      loanType: loanType as 'conventional' | 'hardMoney',
      points,
      isHardMoney: loanType === 'hardMoney' || points >= 2
    };

    return calculateFlipReturns(flipInputs);
  }, [purchasePrice, analysis.down_payment_percent, analysis.interest_rate, analysisData, savedLoanTerms, rehabCosts, arv, timeline]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const downPayment = flipResults.downPayment;

  const milestones = [
    {
      phase: 'Acquisition',
      duration: '1-2 weeks',
      description: 'Close on property',
      cost: formatCurrency(downPayment),
      icon: '\u{1F3E0}'
    },
    {
      phase: 'Renovation',
      duration: `${Math.max(1, timeline - 2)} months`,
      description: 'Complete rehab work',
      cost: formatCurrency(rehabCosts),
      icon: '\u{1F528}'
    },
    {
      phase: 'Marketing',
      duration: '2-4 weeks',
      description: 'List and show property',
      cost: formatCurrency(flipResults.holdingCosts),
      icon: '\u{1F4E3}'
    },
    {
      phase: 'Sale',
      duration: '1-2 weeks',
      description: 'Close with buyer',
      cost: formatCurrency(arv),
      icon: '\u{1F4B0}'
    }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-primary mb-6">Fix & Flip Timeline</h3>

      {/* Project Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg p-4">
          <p className="text-sm text-muted mb-1">Total Timeline</p>
          <p className="text-2xl font-bold text-blue-600">{timeline} months</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4">
          <p className="text-sm text-muted mb-1">Expected Profit</p>
          <p className={`text-2xl font-bold ${flipResults.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(flipResults.netProfit)}
          </p>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="space-y-4 mb-6">
        {milestones.map((milestone, index) => (
          <div key={milestone.phase} className="relative">
            {/* Connection line */}
            {index < milestones.length - 1 && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border"></div>
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                {milestone.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-primary">{milestone.phase}</h4>
                    <p className="text-sm text-muted">{milestone.description}</p>
                    <p className="text-xs text-muted mt-1">{milestone.duration}</p>
                  </div>
                  <p className="font-medium text-primary">{milestone.cost}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Exit Strategy Details */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4">
        <h4 className="font-semibold text-primary mb-3">Exit Strategy</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted">After Repair Value (ARV)</span>
            <span className="font-medium">{formatCurrency(arv)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Total Investment</span>
            <span className="font-medium">{formatCurrency(flipResults.totalInvestment)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="font-medium">Net Profit</span>
            <span className={`font-semibold ${flipResults.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(flipResults.netProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Timeline may vary based on contractor availability, permit approvals, and market conditions. Budget for potential overruns.
        </p>
      </div>
    </div>
  );
}
