'use client';

import { useState, useEffect } from 'react';
import type { WizardData } from '@/app/analysis/new/page';
import { calculateRehabCosts, type RenovationLevel } from '@/utils/rehab-calculator';

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
  // Initialize financial state with ARV if not present
  const initialFinancial = {
    ...data.financial,
    arv: data.financial.arv || 0
  };
  
  const [financial, setFinancial] = useState(initialFinancial);
  const [_errors, setErrors] = useState<Record<string, string>>({});
  const [currentRates, _setCurrentRates] = useState({ min: 6.5, avg: 7.0, max: 7.5 });
  const [loanType, setLoanType] = useState<'conventional' | 'hardMoney'>(
    data.strategy === 'flip' ? 'hardMoney' : 'conventional'
  );

  // Debug log on component mount
  useEffect(() => {
    console.log('[Step3Financial] Component mounted with data:', {
      strategy: data.strategy,
      propertyData: data.propertyData,
      comparables: data.propertyData?.comparables,
      strategyDetails: data.strategyDetails,
      currentFinancial: data.financial,
      initialFinancial
    });
  }, []);

  // Quick select options for down payment
  const downPaymentOptions = loanType === 'hardMoney' ? [
    { value: 10, label: '10%', description: 'Hard money minimum' },
    { value: 15, label: '15%', description: 'Standard hard money' },
    { value: 20, label: '20%', description: 'Lower risk' },
    { value: 25, label: '25%', description: 'Best terms' }
  ] : [
    { value: 5, label: '5%', description: 'FHA minimum' },
    { value: 10, label: '10%', description: 'Low down payment' },
    { value: 20, label: '20%', description: 'Conventional' },
    { value: 25, label: '25%', description: 'Investment property' }
  ];

  // Hard money loan defaults
  const hardMoneyDefaults = {
    interestRate: 10.45,
    loanTerm: 1, // 12 months
    downPaymentPercent: 10,
    points: 2.5, // 2-3 points average
    rehabFunding: 100 // 100% rehab funding
  };

  // Determine if renovation costs should be shown
  const showRenovationCosts = ['flip', 'brrrr'].includes(data.strategy);

  // Calculate rehab costs based on property size and renovation level
  useEffect(() => {
    const propertyData = data.propertyData as any;
    const renovationLevel = data.strategyDetails?.renovationLevel as RenovationLevel;
    const squareFootage = propertyData?.property?.squareFootage;
    
    // Calculate and set rehab costs if we have the necessary data
    if (squareFootage && renovationLevel && showRenovationCosts) {
      const { averageEstimate } = calculateRehabCosts(squareFootage, renovationLevel);
      
      // Only update if the value hasn't been set yet or is 0
      if (!financial.renovationCosts || financial.renovationCosts === 0) {
        const newFinancial = {
          ...financial,
          renovationCosts: averageEstimate
        };
        setFinancial(newFinancial);
        updateData({ financial: newFinancial });
      }
    }
  }, [data.propertyData, data.strategyDetails?.renovationLevel, showRenovationCosts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-populate ARV for flip strategy from RentCast AVM data
  useEffect(() => {
    // Add a small delay to ensure all data is properly loaded
    const timer = setTimeout(() => {
      console.log('[Step3Financial] ARV Auto-populate Check:', {
        strategy: data.strategy,
        currentARV: financial.arv,
        propertyData: data.propertyData,
        comparables: data.propertyData?.comparables,
        renovationLevel: data.strategyDetails?.renovationLevel
      });

      if (data.strategy === 'flip') {
        const comparables = data.propertyData?.comparables as any;
        const currentValue = comparables?.value || 0;
        
        console.log('[Step3Financial] Current property value from comparables:', currentValue);
        
        if (currentValue > 0 && (!financial.arv || financial.arv === 0)) {
          // For flip strategy, estimate ARV as current value + percentage based on renovation level
          const renovationLevel = data.strategyDetails?.renovationLevel || 'moderate';
          let arvMultiplier = 1.25; // Default 25% increase for moderate
          
          if (renovationLevel === 'cosmetic') {
            arvMultiplier = 1.15; // 15% for cosmetic
          } else if (renovationLevel === 'moderate') {
            arvMultiplier = 1.25; // 25% for moderate
          } else if (renovationLevel === 'extensive') {
            arvMultiplier = 1.35; // 35% for extensive
          } else if (renovationLevel === 'gut') {
            arvMultiplier = 1.45; // 45% for gut rehab
          }
          
          const estimatedARV = Math.round(currentValue * arvMultiplier);
          
          console.log('[Step3Financial] Calculated ARV:', {
            currentValue,
            renovationLevel,
            arvMultiplier,
            estimatedARV
          });
          
          const newFinancial = {
            ...financial,
            arv: estimatedARV
          };
          setFinancial(newFinancial);
          updateData({ financial: newFinancial });
        }
      }
    }, 100); // 100ms delay to ensure data is loaded

    return () => clearTimeout(timer);
  }, [data.strategy, data.propertyData?.comparables, data.strategyDetails?.renovationLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle loan type changes
  useEffect(() => {
    if (loanType === 'hardMoney' && data.strategy === 'flip') {
      const newFinancial = {
        ...financial,
        interestRate: hardMoneyDefaults.interestRate,
        loanTerm: hardMoneyDefaults.loanTerm,
        downPaymentPercent: hardMoneyDefaults.downPaymentPercent,
        points: hardMoneyDefaults.points,
        loanType: 'hardMoney' as const
      };
      setFinancial(newFinancial);
      updateData({ financial: newFinancial });
    }
  }, [loanType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validate inputs
  useEffect(() => {
    let isValid = 
      financial.purchasePrice > 0 &&
      financial.downPaymentPercent >= 3.5 &&
      financial.downPaymentPercent <= 100 &&
      financial.interestRate > 0 &&
      financial.interestRate < 20 &&
      financial.loanTerm > 0;
    
    // Additional validation for flip strategy
    if (data.strategy === 'flip') {
      isValid = isValid && 
        financial.arv !== undefined && 
        financial.arv > 0 && 
        financial.arv > financial.purchasePrice;
    }
    
    setCanProceed(isValid);
  }, [financial, setCanProceed, data.strategy]);

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
    
    // Hard money loans are typically interest-only
    if (loanType === 'hardMoney') {
      // Interest-only payment calculation
      const interestOnlyPayment = principal * monthlyRate;
      
      // Add monthly portion of rehab costs if 100% funded
      if (showRenovationCosts && financial.renovationCosts) {
        const rehabMonthlyRate = monthlyRate; // Same rate for rehab funding
        const rehabInterest = financial.renovationCosts * rehabMonthlyRate;
        return interestOnlyPayment + rehabInterest;
      }
      
      return interestOnlyPayment;
    }
    
    // Traditional amortized loan calculation for conventional loans
    if (monthlyRate === 0) return principal / numPayments;
    
    const payment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return payment;
  };

  const calculateTotalInvestment = () => {
    const downPayment = (financial.purchasePrice * financial.downPaymentPercent) / 100;
    const loanAmount = financial.purchasePrice - downPayment;
    const pointsCost = loanType === 'hardMoney' ? (loanAmount * (financial.points || 0)) / 100 : 0;
    
    return downPayment + 
      (financial.closingCosts || 0) + 
      (financial.renovationCosts || 0) + 
      (financial.holdingCosts || 0) +
      pointsCost;
  };

  const handleContinue = () => {
    updateData({ financial });
    onNext();
  };

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

      {/* Loan Type Selection for Fix & Flip */}
      {data.strategy === 'flip' && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-primary mb-4">Financing Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLoanType('conventional')}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${loanType === 'conventional'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <h4 className="font-semibold text-primary mb-1">Conventional Loan</h4>
              <p className="text-sm text-muted">Traditional financing</p>
              <p className="text-xs text-muted mt-2">20-25% down, 30-year term</p>
            </button>
            <button
              onClick={() => setLoanType('hardMoney')}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${loanType === 'hardMoney'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <h4 className="font-semibold text-primary mb-1">Hard Money Loan</h4>
              <p className="text-sm text-muted">Short-term financing</p>
              <p className="text-xs text-muted mt-2">10% down, 12-month term</p>
            </button>
          </div>
        </div>
      )}

      {/* Current Market Rates */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-medium text-primary">
              {loanType === 'hardMoney' ? 'Hard Money Rates' : 'Current Market Rates'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {loanType === 'hardMoney' ? (
              <>
                <span className="text-muted">Low: 9.5%</span>
                <span className="text-primary font-semibold">Avg: 10.45%</span>
                <span className="text-muted">High: 12%</span>
              </>
            ) : (
              <>
                <span className="text-muted">Low: {currentRates.min}%</span>
                <span className="text-primary font-semibold">Avg: {currentRates.avg}%</span>
                <span className="text-muted">High: {currentRates.max}%</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Estimated Rent Info */}
      {(data.propertyData as any)?.rental?.rentEstimate && (
        <div className="bg-accent/10 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-primary">Estimated Monthly Rent</span>
            </div>
            <div className="text-lg font-semibold text-accent">
              ${(data.propertyData as any).rental.rentEstimate.toLocaleString()}/mo
            </div>
          </div>
          <div className="text-xs text-muted mt-1">
            Range: ${(data.propertyData as any).rental.rentRangeLow?.toLocaleString() || 'N/A'} - ${(data.propertyData as any).rental.rentRangeHigh?.toLocaleString() || 'N/A'}
          </div>
        </div>
      )}

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
          {(() => {
            const comparablesValue = (data.propertyData as any)?.comparables?.value;
            if (comparablesValue) {
              // If purchase price is 0 or not set, use the comparables value
              if (!financial.purchasePrice || financial.purchasePrice === 0) {
                setTimeout(() => {
                  handleFieldChange('purchasePrice', comparablesValue);
                }, 50);
              }
              return (
                <p className="text-xs text-muted mt-1">
                  Estimated value: ${comparablesValue.toLocaleString()}
                </p>
              );
            }
            return null;
          })()}
        </div>

        {/* ARV for Fix & Flip */}
        {data.strategy === 'flip' && (
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              ARV (After Repair Value)
              <span className="text-xs text-muted ml-2">Required for flip calculations</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
              <input
                type="number"
                value={financial.arv || ''}
                onChange={(e) => handleFieldChange('arv', e.target.value)}
                className="w-full pl-8 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={financial.arv ? '' : 'Calculating...'}
              />
            </div>
            {(() => {
              const comparablesValue = (data.propertyData as any)?.comparables?.value;
              console.log('[Step3Financial] ARV Field Debug:', {
                comparablesValue,
                hasComparables: !!(data.propertyData as any)?.comparables,
                currentARV: financial.arv,
                purchasePrice: financial.purchasePrice
              });
              return comparablesValue;
            })() && (
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted">
                    Current estimated value: ${(data.propertyData as any).comparables.value.toLocaleString()}
                  </p>
                  {financial.arv ? (
                    <span className="text-xs text-green-600">
                      ✓ Auto-calculated based on renovation level
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const currentValue = (data.propertyData as any)?.comparables?.value || 0;
                        const renovationLevel = data.strategyDetails?.renovationLevel || 'moderate';
                        let arvMultiplier = 1.25;
                        
                        if (renovationLevel === 'cosmetic') arvMultiplier = 1.15;
                        else if (renovationLevel === 'moderate') arvMultiplier = 1.25;
                        else if (renovationLevel === 'extensive') arvMultiplier = 1.35;
                        else if (renovationLevel === 'gut') arvMultiplier = 1.45;
                        
                        const calculatedARV = Math.round(currentValue * arvMultiplier);
                        handleFieldChange('arv', calculatedARV);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Calculate ARV
                    </button>
                  )}
                </div>
                {(() => {
                  const renovationLevel = data.strategyDetails?.renovationLevel;
                  
                  let expectedIncrease = '20%';
                  if (renovationLevel === 'cosmetic') expectedIncrease = '15%';
                  else if (renovationLevel === 'moderate') expectedIncrease = '25%';
                  else if (renovationLevel === 'extensive') expectedIncrease = '35%';
                  else if (renovationLevel === 'gut') expectedIncrease = '45%';
                  
                  return (
                    <p className="text-xs text-muted">
                      Based on {renovationLevel || 'moderate'} renovation, expecting {expectedIncrease} value increase
                    </p>
                  );
                })()}
              </div>
            )}
            {financial.arv && financial.arv <= financial.purchasePrice && (
              <p className="text-xs text-red-500 mt-1">
                ARV must be greater than purchase price
              </p>
            )}
          </div>
        )}

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
              {loanType === 'hardMoney' ? (
                <>
                  <option value="0.5">6 months</option>
                  <option value="0.75">9 months</option>
                  <option value="1">12 months</option>
                  <option value="1.5">18 months</option>
                </>
              ) : (
                <>
                  <option value="15">15 years</option>
                  <option value="20">20 years</option>
                  <option value="25">25 years</option>
                  <option value="30">30 years</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Additional Costs */}
        <div className="border-t border-border pt-6">
          <h3 className="font-semibold text-primary mb-4">Additional Costs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loanType === 'hardMoney' && (
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Points/Origination Fee
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={financial.points || hardMoneyDefaults.points}
                    onChange={(e) => handleFieldChange('points', e.target.value)}
                    className="flex-1 px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    max="5"
                    step="0.5"
                  />
                  <span className="text-muted">points</span>
                </div>
                <p className="text-xs text-muted mt-1">
                  ${Math.round((calculateLoanAmount() * (financial.points || hardMoneyDefaults.points)) / 100).toLocaleString()} fee
                </p>
              </div>
            )}
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
                  {(() => {
                    const propertyData = data.propertyData as any;
                    const renovationLevel = data.strategyDetails?.renovationLevel as RenovationLevel;
                    const squareFootage = propertyData?.property?.squareFootage;
                    
                    if (squareFootage && renovationLevel) {
                      const { averageEstimate } = calculateRehabCosts(squareFootage, renovationLevel);
                      
                      // Show reset button if user has modified the value
                      if (financial.renovationCosts && Math.abs(financial.renovationCosts - averageEstimate) > 100) {
                        return (
                          <button
                            type="button"
                            onClick={() => handleFieldChange('renovationCosts', averageEstimate)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary/80"
                          >
                            Reset to estimate
                          </button>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
                <p className="text-xs text-muted mt-1">
                  {(() => {
                    const propertyData = data.propertyData as any;
                    const renovationLevel = data.strategyDetails?.renovationLevel as RenovationLevel;
                    const squareFootage = propertyData?.property?.squareFootage;
                    
                    if (squareFootage && renovationLevel) {
                      const { lowEstimate, highEstimate } = calculateRehabCosts(squareFootage, renovationLevel);
                      const levelLabel = renovationLevel === 'cosmetic' ? 'Cosmetic' :
                                       renovationLevel === 'moderate' ? 'Moderate' :
                                       renovationLevel === 'extensive' ? 'Extensive' : 'Gut';
                      
                      return `${levelLabel} renovation estimate: $${lowEstimate.toLocaleString()} - $${highEstimate.toLocaleString()} (${squareFootage.toLocaleString()} sqft)`;
                    }
                    
                    return loanType === 'hardMoney' 
                      ? '100% fundable with hard money loan' 
                      : `Based on ${data.strategyDetails?.renovationLevel || 'moderate'} renovation`;
                  })()}
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
          {loanType === 'hardMoney' && (
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Hard Money Features:</strong> 100% rehab funding, {financial.points || hardMoneyDefaults.points} points, 
                {financial.loanTerm < 2 ? `${financial.loanTerm * 12} month` : `${financial.loanTerm} year`} term
              </p>
            </div>
          )}
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