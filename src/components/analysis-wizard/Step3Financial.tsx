'use client';

import { useState, useEffect } from 'react';
import type { WizardData } from '@/app/analysis/new/page';

interface Step3FinancialProps {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  setCanProceed: (can: boolean) => void;
}

export default function Step3Financial({ 
  data, 
  updateData, 
  onNext, 
  onBack,
  setCanProceed 
}: Step3FinancialProps) {
  const [financial, setFinancial] = useState(data.financial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentRates, setCurrentRates] = useState({ min: 6.5, avg: 7.0, max: 7.5 });

  // Quick select options for down payment
  const downPaymentOptions = [
    { value: 5, label: '5%', description: 'FHA minimum' },
    { value: 10, label: '10%', description: 'Low down payment' },
    { value: 20, label: '20%', description: 'Conventional' },
    { value: 25, label: '25%', description: 'Investment property' }
  ];

  // Validate inputs
  useEffect(() => {
    const isValid = 
      financial.purchasePrice > 0 &&
      financial.downPaymentPercent >= 3.5 &&
      financial.downPaymentPercent <= 100 &&
      financial.interestRate > 0 &&
      financial.interestRate < 20 &&
      financial.loanTerm > 0;
    
    setCanProceed(isValid);
  }, [financial, setCanProceed]);

  const handleFieldChange = (field: keyof typeof financial, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    const newFinancial = { ...financial, [field]: numValue };
    setFinancial(newFinancial);
    updateData({ financial: newFinancial });

    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const calculateLoanAmount = () => {
    const downPayment = (financial.purchasePrice * financial.downPaymentPercent) / 100;
    return financial.purchasePrice - downPayment;
  };

  const calculateMonthlyPayment = () => {
    const principal = calculateLoanAmount();
    const monthlyRate = financial.interestRate / 100 / 12;
    const numPayments = financial.loanTerm * 12;
    
    if (monthlyRate === 0) return principal / numPayments;
    
    const payment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return payment;
  };

  const calculateTotalInvestment = () => {
    const downPayment = (financial.purchasePrice * financial.downPaymentPercent) / 100;
    return downPayment + 
      (financial.closingCosts || 0) + 
      (financial.renovationCosts || 0) + 
      (financial.holdingCosts || 0);
  };

  const handleContinue = () => {
    updateData({ financial });
    onNext();
  };

  const showRenovationCosts = ['flip', 'brrrr'].includes(data.strategy);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Financial Parameters
        </h2>
        <p className="text-muted">
          Configure your financing details and investment costs
        </p>
      </div>

      {/* Current Market Rates */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-medium text-primary">Current Market Rates</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted">Low: {currentRates.min}%</span>
            <span className="text-primary font-semibold">Avg: {currentRates.avg}%</span>
            <span className="text-muted">High: {currentRates.max}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Purchase Price */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Purchase Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
            <input
              type="number"
              value={financial.purchasePrice || ''}
              onChange={(e) => handleFieldChange('purchasePrice', e.target.value)}
              className="w-full pl-8 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0"
            />
          </div>
          {data.propertyData?.comparables?.value && (
            <p className="text-xs text-muted mt-1">
              Estimated value: ${data.propertyData.comparables.value.toLocaleString()}
            </p>
          )}
        </div>

        {/* Down Payment */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Down Payment
          </label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {downPaymentOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFieldChange('downPaymentPercent', option.value)}
                className={`
                  py-2 px-3 rounded-lg border text-sm font-medium transition-all
                  ${financial.downPaymentPercent === option.value
                    ? 'bg-primary text-secondary border-primary'
                    : 'bg-background border-border hover:border-primary/50'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={financial.downPaymentPercent}
              onChange={(e) => handleFieldChange('downPaymentPercent', e.target.value)}
              className="w-24 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              min="0"
              max="100"
              step="0.5"
            />
            <span className="text-muted">%</span>
            <span className="text-primary font-semibold">
              = ${((financial.purchasePrice * financial.downPaymentPercent) / 100).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Interest Rate & Loan Term */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Interest Rate
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={financial.interestRate}
                onChange={(e) => handleFieldChange('interestRate', e.target.value)}
                className="flex-1 px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                min="0"
                max="20"
                step="0.125"
              />
              <span className="text-muted">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Loan Term
            </label>
            <select
              value={financial.loanTerm}
              onChange={(e) => handleFieldChange('loanTerm', e.target.value)}
              className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="25">25 years</option>
              <option value="30">30 years</option>
            </select>
          </div>
        </div>

        {/* Additional Costs */}
        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-primary mb-4">Additional Costs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Closing Costs
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                <input
                  type="number"
                  value={financial.closingCosts || ''}
                  onChange={(e) => handleFieldChange('closingCosts', e.target.value)}
                  className="w-full pl-8 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-muted mt-1">
                Typical: 2-5% of purchase price
              </p>
            </div>
            
            {showRenovationCosts && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Renovation Costs
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                  <input
                    type="number"
                    value={financial.renovationCosts || ''}
                    onChange={(e) => handleFieldChange('renovationCosts', e.target.value)}
                    className="w-full pl-8 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-muted mt-1">
                  Based on {data.strategyDetails?.renovationLevel || 'moderate'} renovation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6">
          <h3 className="font-semibold text-primary mb-4">Investment Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted mb-1">Loan Amount</p>
              <p className="text-xl font-bold text-primary">
                ${calculateLoanAmount().toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted mb-1">Monthly Payment</p>
              <p className="text-xl font-bold text-primary">
                ${Math.round(calculateMonthlyPayment()).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted mb-1">Total Investment</p>
              <p className="text-xl font-bold text-primary">
                ${calculateTotalInvestment().toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted mb-1">Cash to Close</p>
              <p className="text-xl font-bold text-accent">
                ${(calculateTotalInvestment() + (financial.closingCosts || 0)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
        >
          ← Back to Strategy
        </button>
        <button
          onClick={handleContinue}
          disabled={!financial.purchasePrice || financial.purchasePrice <= 0}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all
            ${financial.purchasePrice > 0
              ? 'bg-primary text-secondary hover:bg-primary/90 transform hover:scale-105'
              : 'bg-muted text-muted cursor-not-allowed'
            }
          `}
        >
          Generate Analysis →
        </button>
      </div>
    </div>
  );
}