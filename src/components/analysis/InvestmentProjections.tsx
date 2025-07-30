'use client';

import { useState, useMemo } from 'react';
import type { Analysis } from '@/types';

interface InvestmentProjectionsProps {
  analysis: Analysis;
}

export default function InvestmentProjections({ analysis }: InvestmentProjectionsProps) {
  const [timeframe, setTimeframe] = useState<'5' | '10' | '20'>('10');

  const projections = useMemo(() => {
    const years = parseInt(timeframe);
    const purchasePrice = analysis.purchase_price || 0;
    const monthlyRent = analysis.rental_estimate?.rent || 0;
    const appreciationRate = 0.03; // 3% annual
    const rentGrowthRate = 0.025; // 2.5% annual
    const inflationRate = 0.02; // 2% for expenses

    const downPayment = (purchasePrice * (analysis.down_payment_percent || 20)) / 100;
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = (analysis.interest_rate || 7) / 100 / 12;
    const numPayments = (analysis.loan_term || 30) * 12;

    // Calculate monthly payment
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const yearlyData = [];
    let currentValue = purchasePrice;
    let currentRent = monthlyRent;
    let currentBalance = loanAmount;
    let totalCashFlow = 0;

    for (let year = 1; year <= years; year++) {
      // Property appreciation
      currentValue *= (1 + appreciationRate);
      
      // Rent growth
      currentRent *= (1 + rentGrowthRate);
      const annualRent = currentRent * 12;

      // Calculate expenses with inflation
      const baseExpenses = (purchasePrice * 0.02) + (currentRent * 12 * 0.25); // 2% of value + 25% of rent
      const annualExpenses = baseExpenses * Math.pow(1 + inflationRate, year - 1);

      // Calculate principal paid this year
      let _yearlyPrincipal = 0;
      let _yearlyInterest = 0;
      
      for (let month = 0; month < 12 && currentBalance > 0; month++) {
        const interestPayment = currentBalance * monthlyRate;
        const principalPayment = Math.min(monthlyPayment - interestPayment, currentBalance);
        _yearlyInterest += interestPayment;
        _yearlyPrincipal += principalPayment;
        currentBalance -= principalPayment;
      }

      // Cash flow
      const annualCashFlow = annualRent - (monthlyPayment * 12) - annualExpenses;
      totalCashFlow += annualCashFlow;

      // Equity
      const equity = currentValue - currentBalance;
      const equityPercent = (equity / currentValue) * 100;

      yearlyData.push({
        year,
        propertyValue: currentValue,
        loanBalance: currentBalance,
        equity,
        equityPercent,
        annualRent,
        annualCashFlow,
        totalCashFlow,
        totalReturn: equity + totalCashFlow - downPayment
      });
    }

    return yearlyData;
  }, [analysis, timeframe]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const lastYear = projections[projections.length - 1];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-primary">Investment Projections</h3>
        <div className="flex gap-2">
          {(['5', '10', '20'] as const).map((years) => (
            <button
              key={years}
              onClick={() => setTimeframe(years)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeframe === years
                  ? 'bg-primary text-secondary'
                  : 'bg-muted/20 text-muted hover:bg-muted/30'
              }`}
            >
              {years} Years
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4">
          <p className="text-sm text-muted mb-1">Total Return</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(lastYear.totalReturn)}
          </p>
          <p className="text-xs text-muted mt-1">
            {((lastYear.totalReturn / (analysis.purchase_price * (analysis.down_payment_percent / 100))) * 100).toFixed(0)}% ROI
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg p-4">
          <p className="text-sm text-muted mb-1">Property Value</p>
          <p className="text-xl font-bold text-blue-600">
            {formatCurrency(lastYear.propertyValue)}
          </p>
          <p className="text-xs text-muted mt-1">
            +{((lastYear.propertyValue / analysis.purchase_price - 1) * 100).toFixed(0)}% growth
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4">
          <p className="text-sm text-muted mb-1">Total Equity</p>
          <p className="text-xl font-bold text-purple-600">
            {formatCurrency(lastYear.equity)}
          </p>
          <p className="text-xs text-muted mt-1">
            {lastYear.equityPercent.toFixed(0)}% ownership
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-4">
          <p className="text-sm text-muted mb-1">Cash Flow Total</p>
          <p className="text-xl font-bold text-orange-600">
            {formatCurrency(lastYear.totalCashFlow)}
          </p>
          <p className="text-xs text-muted mt-1">
            {formatCurrency(lastYear.totalCashFlow / parseInt(timeframe))}/year
          </p>
        </div>
      </div>

      {/* Projection Chart (simplified visualization) */}
      <div className="bg-muted/10 rounded-lg p-4">
        <div className="flex items-end justify-between h-48 mb-4">
          {projections.filter((_, i) => i % Math.ceil(projections.length / 10) === 0 || i === projections.length - 1).map((data) => {
            const heightPercent = (data.totalReturn / lastYear.totalReturn) * 100;
            return (
              <div key={data.year} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full max-w-[40px] bg-gradient-to-t from-primary to-accent rounded-t"
                     style={{ height: `${heightPercent}%` }} />
                <span className="text-xs text-muted">Y{data.year}</span>
              </div>
            );
          })}
        </div>
        <p className="text-center text-sm text-muted">Total Return Over Time</p>
      </div>

      {/* Detailed Table */}
      <div className="mt-6">
        <h4 className="font-semibold text-primary mb-3">Year-by-Year Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted">Year</th>
                <th className="text-right py-2 px-3 font-medium text-muted">Property Value</th>
                <th className="text-right py-2 px-3 font-medium text-muted">Loan Balance</th>
                <th className="text-right py-2 px-3 font-medium text-muted">Equity</th>
                <th className="text-right py-2 px-3 font-medium text-muted">Annual Cash Flow</th>
                <th className="text-right py-2 px-3 font-medium text-muted">Total Return</th>
              </tr>
            </thead>
            <tbody>
              {projections.filter((_, i) => i === 0 || i === 4 || i === 9 || i === projections.length - 1).map((data) => (
                <tr key={data.year} className="border-b border-border/50">
                  <td className="py-2 px-3">{data.year}</td>
                  <td className="text-right py-2 px-3">{formatCurrency(data.propertyValue)}</td>
                  <td className="text-right py-2 px-3">{formatCurrency(data.loanBalance)}</td>
                  <td className="text-right py-2 px-3">{formatCurrency(data.equity)}</td>
                  <td className="text-right py-2 px-3">{formatCurrency(data.annualCashFlow)}</td>
                  <td className="text-right py-2 px-3 font-semibold">{formatCurrency(data.totalReturn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumptions */}
      <div className="mt-6 p-4 bg-muted/10 rounded-lg">
        <p className="text-xs text-muted">
          <strong>Assumptions:</strong> 3% annual appreciation, 2.5% rent growth, 2% expense inflation. 
          Actual results may vary based on market conditions and property management.
        </p>
      </div>
    </div>
  );
}