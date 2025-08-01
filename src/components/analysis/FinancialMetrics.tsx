'use client';

import { useMemo } from 'react';
import type { Analysis } from '@/types';

interface FinancialMetricsProps {
  analysis: Analysis;
}

export default function FinancialMetrics({ analysis }: FinancialMetricsProps) {
  const isFlipStrategy = analysis.strategy === 'flip';
  const purchasePrice = analysis.purchase_price || 0;
  const downPayment = (purchasePrice * (analysis.down_payment_percent || 20)) / 100;
  
  const metrics = useMemo(() => {
    const loanAmount = purchasePrice - downPayment;
    
    if (isFlipStrategy) {
      // Fix & Flip specific calculations
      const rehabCosts = analysis.rehab_costs || 0;
      const closingCosts = purchasePrice * 0.03; // 3% closing costs
      const totalInvestment = downPayment + rehabCosts + closingCosts;
      
      // Get metrics from AI analysis if available
      const aiMetrics = analysis.ai_analysis?.financial_metrics;
      const netProfit = aiMetrics?.total_profit || 0;
      const roi = aiMetrics?.roi || 0;
      
      // Estimate ARV from comparables or AI analysis
      const estimatedARV = (analysis.property_data as any)?.comparables?.value || purchasePrice * 1.3;
      const profitMargin = estimatedARV > 0 ? (netProfit / estimatedARV) * 100 : 0;
      
      return {
        purchasePrice,
        rehabCosts,
        totalInvestment,
        estimatedARV,
        netProfit,
        roi,
        profitMargin,
        holdingPeriod: analysis.loan_term || 0.5,
        // Set rental metrics to 0 for flips
        monthlyRent: 0,
        monthlyPayment: 0,
        totalExpenses: 0,
        monthlyCashFlow: 0,
        annualCashFlow: 0,
        annualNOI: 0,
        capRate: 0,
        cashOnCashReturn: 0,
        totalReturn: roi,
        totalCashInvested: totalInvestment,
        propertyTax: 0,
        insurance: 0,
        maintenance: 0,
        vacancy: 0,
        propertyManagement: 0
      };
    }
    
    // Rental property calculations (existing logic)
    const monthlyRate = (analysis.interest_rate || 7) / 100 / 12;
    const numPayments = (analysis.loan_term || 30) * 12;
    
    // Calculate monthly payment
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    // Get rental income
    const monthlyRent = analysis.rental_estimate?.rent || 
                       (analysis.rental_estimate as any)?.rentEstimate || 0;

    // Calculate expenses (simplified)
    const propertyTax = (purchasePrice * 0.012) / 12; // 1.2% annual
    const insurance = (purchasePrice * 0.004) / 12; // 0.4% annual
    const hoa = 0; // Could be added from property data
    const maintenance = monthlyRent * 0.1; // 10% of rent
    const vacancy = monthlyRent * 0.08; // 8% vacancy rate
    const propertyManagement = analysis.strategy === 'rental' ? monthlyRent * 0.08 : 0;

    const totalExpenses = monthlyPayment + propertyTax + insurance + 
                         hoa + maintenance + vacancy + propertyManagement;

    const monthlyCashFlow = monthlyRent - totalExpenses;
    const annualCashFlow = monthlyCashFlow * 12;

    // Calculate NOI (Net Operating Income)
    const operatingExpenses = propertyTax + insurance + hoa + maintenance + vacancy + propertyManagement;
    const annualNOI = (monthlyRent * 12) - (operatingExpenses * 12);

    // Calculate returns
    const totalCashInvested = downPayment + (analysis.rehab_costs || 0) + 
                             (purchasePrice * 0.03); // Closing costs estimate

    const capRate = (annualNOI / purchasePrice) * 100;
    const cashOnCashReturn = (annualCashFlow / totalCashInvested) * 100;

    // Calculate equity build (first year)
    const firstYearPrincipal = calculateFirstYearPrincipal(
      loanAmount, 
      monthlyRate, 
      numPayments, 
      monthlyPayment
    );

    const totalReturn = ((annualCashFlow + firstYearPrincipal) / totalCashInvested) * 100;

    return {
      monthlyRent,
      monthlyPayment,
      totalExpenses,
      monthlyCashFlow,
      annualCashFlow,
      annualNOI,
      capRate,
      cashOnCashReturn,
      totalReturn,
      totalCashInvested,
      propertyTax,
      insurance,
      maintenance,
      vacancy,
      propertyManagement
    };
  }, [analysis, isFlipStrategy, purchasePrice, downPayment]);

  function calculateFirstYearPrincipal(
    loanAmount: number, 
    monthlyRate: number, 
    numPayments: number,
    monthlyPayment: number
  ): number {
    let balance = loanAmount;
    let totalPrincipal = 0;

    for (let i = 0; i < 12; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      totalPrincipal += principalPayment;
      balance -= principalPayment;
    }

    return totalPrincipal;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-primary mb-6">Financial Analysis</h3>

      {/* Key Metrics Grid */}
      {isFlipStrategy ? (
        // Fix & Flip Metrics
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4">
            <p className="text-sm text-muted mb-1">Net Profit</p>
            <p className={`text-2xl font-bold ${(metrics as any).netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency((metrics as any).netProfit)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg p-4">
            <p className="text-sm text-muted mb-1">ROI</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatPercent((metrics as any).roi)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4">
            <p className="text-sm text-muted mb-1">Profit Margin</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatPercent((metrics as any).profitMargin)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-4">
            <p className="text-sm text-muted mb-1">ARV</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency((metrics as any).estimatedARV)}
            </p>
          </div>
        </div>
      ) : (
        // Rental Property Metrics
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4">
            <p className="text-sm text-muted mb-1">Monthly Cash Flow</p>
            <p className={`text-2xl font-bold ${metrics.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.monthlyCashFlow)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg p-4">
            <p className="text-sm text-muted mb-1">Cap Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatPercent(metrics.capRate)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4">
            <p className="text-sm text-muted mb-1">Cash-on-Cash</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatPercent(metrics.cashOnCashReturn)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-4">
            <p className="text-sm text-muted mb-1">Total Return</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatPercent(metrics.totalReturn)}
            </p>
          </div>
        </div>
      )}

      {/* Income & Expenses Breakdown */}
      {isFlipStrategy ? (
        // Fix & Flip Project Breakdown
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Investment Breakdown */}
          <div>
            <h4 className="font-semibold text-primary mb-3">Investment Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted">Purchase Price</span>
                <span className="font-medium">
                  {formatCurrency((metrics as any).purchasePrice)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted">Rehab Costs</span>
                <span className="font-medium">
                  {formatCurrency((metrics as any).rehabCosts)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted">Closing & Holding</span>
                <span className="font-medium">
                  {formatCurrency((metrics as any).totalInvestment - (metrics as any).rehabCosts - downPayment)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 font-semibold">
                <span>Total Investment</span>
                <span className="text-primary">
                  {formatCurrency((metrics as any).totalInvestment)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Exit Strategy */}
          <div>
            <h4 className="font-semibold text-primary mb-3">Exit Strategy</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted">After Repair Value</span>
                <span className="font-medium text-green-600">
                  {formatCurrency((metrics as any).estimatedARV)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted">Holding Period</span>
                <span className="font-medium">
                  {((metrics as any).holdingPeriod * 12).toFixed(0)} months
                </span>
              </div>
              <div className="flex justify-between items-center py-2 font-semibold">
                <span>Expected Profit</span>
                <span className={`${(metrics as any).netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency((metrics as any).netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Rental Property Income & Expenses
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Income */}
          <div>
            <h4 className="font-semibold text-primary mb-3">Monthly Income</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted">Rental Income</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(metrics.monthlyRent)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 font-semibold">
                <span>Total Income</span>
                <span className="text-green-600">
                  {formatCurrency(metrics.monthlyRent)}
                </span>
              </div>
            </div>
          </div>

        {/* Expenses */}
        <div>
          <h4 className="font-semibold text-primary mb-3">Monthly Expenses</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted">Mortgage (P&I)</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(metrics.monthlyPayment)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted">Property Tax</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(metrics.propertyTax)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted">Insurance</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(metrics.insurance)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted">Maintenance (10%)</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(metrics.maintenance)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted">Vacancy (8%)</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(metrics.vacancy)}
              </span>
            </div>
            {metrics.propertyManagement > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted">Property Mgmt (8%)</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(metrics.propertyManagement)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 font-semibold">
              <span>Total Expenses</span>
              <span className="text-red-600">
                {formatCurrency(metrics.totalExpenses)}
              </span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Investment Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-semibold text-primary mb-3">Investment Summary</h4>
        {isFlipStrategy ? (
          // Fix & Flip Summary
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-sm text-muted mb-1">Cash Required</p>
              <p className="font-semibold text-primary">
                {formatCurrency(downPayment)}
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-sm text-muted mb-1">Total Investment</p>
              <p className="font-semibold text-primary">
                {formatCurrency((metrics as any).totalInvestment)}
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-sm text-muted mb-1">Expected ROI</p>
              <p className={`font-semibold ${(metrics as any).roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent((metrics as any).roi)}
              </p>
            </div>
          </div>
        ) : (
          // Rental Property Summary
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-sm text-muted mb-1">Total Cash Invested</p>
              <p className="font-semibold text-primary">
                {formatCurrency(metrics.totalCashInvested)}
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-sm text-muted mb-1">Annual Cash Flow</p>
              <p className={`font-semibold ${metrics.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.annualCashFlow)}
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-sm text-muted mb-1">Annual NOI</p>
              <p className="font-semibold text-primary">
                {formatCurrency(metrics.annualNOI)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}