'use client';

import type { Analysis } from '@/types';

interface FlipTimelineProps {
  analysis: Analysis;
}

export default function FlipTimeline({ analysis }: FlipTimelineProps) {
  const timeline = (analysis as any).strategy_details?.timeline || 
                  (analysis as any).strategyDetails?.timeline || 6;
  const rehabCosts = analysis.rehab_costs || 0;
  const purchasePrice = analysis.purchase_price || 0;
  const downPayment = (purchasePrice * (analysis.down_payment_percent || 20)) / 100;
  
  // Get financial metrics from AI analysis
  const aiMetrics = analysis.ai_analysis?.financial_metrics;
  const arv = (analysis as any).arv || 
              (analysis.property_data as any)?.comparables?.value || 
              purchasePrice * 1.3;
  const netProfit = aiMetrics?.net_profit || aiMetrics?.total_profit || 0;
  const holdingCosts = aiMetrics?.holding_costs || (purchasePrice * 0.015 * (timeline / 12));
  
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
      cost: formatCurrency(downPayment),
      icon: '🏠'
    },
    {
      phase: 'Renovation',
      duration: `${Math.max(1, timeline - 2)} months`,
      description: 'Complete rehab work',
      cost: formatCurrency(rehabCosts),
      icon: '🔨'
    },
    {
      phase: 'Marketing',
      duration: '2-4 weeks',
      description: 'List and show property',
      cost: formatCurrency(holdingCosts),
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
            <span className="text-muted">Total Investment</span>
            <span className="font-medium">{formatCurrency(purchasePrice + rehabCosts + holdingCosts)}</span>
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