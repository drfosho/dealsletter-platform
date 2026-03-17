'use client';

import type { Analysis } from '@/types';

interface FlipTimelineProps {
  analysis: Analysis;
}

export default function FlipTimeline({ analysis }: FlipTimelineProps) {
  // CRITICAL: Use timeline from strategy_details, NOT loan_term
  // Check multiple locations where timeline could be stored
  const timeline = parseInt((analysis as any).analysis_data?.strategy_details?.timeline) ||
                   parseInt((analysis as any).strategy_details?.timeline) ||
                   parseInt((analysis as any).strategyDetails?.timeline) ||
                   (analysis as any).analysis_data?.flip_timeline_months ||
                   6;
  
  // Get rehab costs from multiple possible locations
  const rehabCosts = analysis.rehab_costs || 
                    (analysis as any).renovationCosts || 
                    (analysis as any).analysis_data?.rehab_costs || 
                    0;
  const purchasePrice = analysis.purchase_price || 0;

  // Get financial metrics from AI analysis
  const aiMetrics = analysis.ai_analysis?.financial_metrics;
  const analysisData = (analysis as any).analysis_data || {};
  const savedMetrics = analysisData?.calculatedMetrics || {};

  // ARV: Check multiple sources
  const arv = (aiMetrics as any)?.arv ||
              savedMetrics?.arv ||
              (analysis as any).arv ||
              analysisData?.arv ||
              analysisData?.ai_analysis?.financial_metrics?.arv ||
              (analysis.property_data as any)?.comparables?.value ||
              purchasePrice * 1.3;

  // Net Profit: Check multiple sources
  const netProfit = (analysis as any).profit ||
                   savedMetrics?.profit ||
                   aiMetrics?.net_profit ||
                   aiMetrics?.total_profit ||
                   analysisData?.profit ||
                   0;

  // Hard money loan structure: 90% purchase + 100% rehab (capped at 80% ARV)
  const interestRate = analysis.interest_rate || 10;
  const downPayment = purchasePrice * 0.10;
  const acquisitionLoan = purchasePrice - downPayment;
  const maxLoan = arv * 0.80;
  const totalLoanNeeded = acquisitionLoan + rehabCosts;
  const totalLoan = Math.min(totalLoanNeeded, maxLoan);

  // Interest on full loan amount for the holding period
  const monthlyInterest = Math.round((totalLoan * (interestRate / 100)) / 12);
  const holdingCosts = aiMetrics?.holding_costs || savedMetrics?.holdingCosts || (monthlyInterest * timeline);

  // Selling costs — 6% of ARV
  const sellingCosts = Math.round(arv * 0.06);

  // Cash required — what borrower brings to closing
  const closingCosts = Math.round(purchasePrice * 0.015);
  const ltvOverage = Math.max(0, totalLoanNeeded - maxLoan);
  const cashRequired = downPayment + closingCosts + ltvOverage;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const milestones = [
    {
      phase: 'Acquisition',
      duration: '1-2 weeks',
      description: 'Close on property',
      cost: formatCurrency(cashRequired),
      icon: '🏠'
    },
    {
      phase: 'Renovation',
      duration: `${Math.max(1, timeline - 2)} months`,
      description: 'Complete rehab work (lender funded)',
      cost: formatCurrency(rehabCosts),
      icon: '🔨'
    },
    {
      phase: 'Selling Costs',
      duration: '2-4 weeks',
      description: 'Agent commission (6% of ARV)',
      cost: formatCurrency(sellingCosts),
      icon: '📣'
    },
    {
      phase: 'Sale',
      duration: '1-2 weeks',
      description: 'Close with buyer',
      cost: formatCurrency(arv),
      icon: '💰'
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
          <p className="text-2xl font-bold text-green-600">{formatCurrency(netProfit)}</p>
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
            <span className="text-muted">Cash Required</span>
            <span className="font-medium">{formatCurrency(cashRequired)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="font-medium">Net Profit</span>
            <span className="font-semibold text-green-600">{formatCurrency(netProfit)}</span>
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