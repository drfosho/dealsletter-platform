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
  console.log('[Step3Financial] CRITICAL - Component Mounted with data:', {
    dataFromProps: data,
    financialData: data.financial,
    propertyData: data.propertyData,
    hasPropertyData: !!data.propertyData
  });
  
  // Initialize financial state with values from data
  // Auto-populate from RentCast API data if available
  const listing = (data.propertyData as any)?.listing;
  const listingPrice = listing?.price || listing?.listPrice || listing?.askingPrice || 0;
  const comparablesValue = (data.propertyData as any)?.comparables?.value || 0;
  const rentEstimate = (data.propertyData as any)?.rental?.rentEstimate || 
                      (data.propertyData as any)?.rental?.rent || 0;
  
  // Use listing price for on-market properties, otherwise use AVM
  const effectivePurchasePrice = listingPrice > 0 ? listingPrice : comparablesValue;
  
  console.log('[Step3Financial] CRITICAL - Financial Values:', {
    passedInPurchasePrice: data.financial.purchasePrice,
    passedInMonthlyRent: data.financial.monthlyRent,
    passedInARV: data.financial.arv,
    extractedListing: listing,
    extractedListingPrice: listingPrice,
    extractedComparablesValue: comparablesValue,
    calculatedEffectivePurchasePrice: effectivePurchasePrice,
    isOnMarket: listingPrice > 0,
    rentEstimate
  });
  
  // Use the financial data passed from previous steps
  const initialFinancial = {
    ...data.financial
  };
  
  const [financial, setFinancial] = useState(initialFinancial);
  const [isCalculatingARV, setIsCalculatingARV] = useState(false);
  
  // Sync financial state with props when they change
  useEffect(() => {
    if (data.financial.purchasePrice > 0 && financial.purchasePrice === 0) {
      console.log('[Step3Financial] Syncing purchase price from props:', data.financial.purchasePrice);
      setFinancial(prev => ({
        ...prev,
        purchasePrice: data.financial.purchasePrice
      }));
    }
    if ((data.financial.monthlyRent ?? 0) > 0 && financial.monthlyRent === 0) {
      console.log('[Step3Financial] Syncing monthly rent from props:', data.financial.monthlyRent);
      setFinancial(prev => ({
        ...prev,
        monthlyRent: data.financial.monthlyRent ?? 0
      }));
    }
  }, [data.financial.purchasePrice, data.financial.monthlyRent]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Auto-populate fields only when property data changes and values are missing
  useEffect(() => {
    // Skip if we already have purchase price from props
    if (data.financial.purchasePrice > 0) {
      console.log('[Step3Financial] Purchase price already set from props:', data.financial.purchasePrice);
      return;
    }
    
    const newListing = (data.propertyData as any)?.listing;
    const newListingPrice = newListing?.price || newListing?.listPrice || newListing?.askingPrice || 0;
    const newComparablesValue = (data.propertyData as any)?.comparables?.value || 0;
    const newRentEstimate = (data.propertyData as any)?.rental?.rentEstimate || 
                           (data.propertyData as any)?.rental?.rent || 0;
    
    // Use listing price for on-market properties, otherwise use AVM
    const newEffectivePrice = newListingPrice > 0 ? newListingPrice : newComparablesValue;
    
    console.log('[Step3Financial] Auto-populate check (no price from props):', {
      strategy: data.strategy,
      newListingPrice,
      newComparablesValue,
      newEffectivePrice,
      newRentEstimate,
      currentPurchasePrice: financial.purchasePrice,
      currentMonthlyRent: financial.monthlyRent,
      currentARV: financial.arv,
      isOnMarket: newListingPrice > 0
    });
    
    let updatedFinancial = { ...financial };
    let hasChanges = false;
    
    // Auto-populate purchase price only if not already set and we have a new price
    if (newEffectivePrice > 0 && financial.purchasePrice === 0) {
      console.log('[Step3Financial] Auto-populating purchase price:', newEffectivePrice);
      updatedFinancial.purchasePrice = newEffectivePrice;
      hasChanges = true;
    }
    
    // Auto-populate monthly rent if not already set and strategy requires it
    if (['rental', 'brrrr', 'commercial'].includes(data.strategy) && 
        newRentEstimate > 0 && 
        (!financial.monthlyRent || financial.monthlyRent === 0)) {
      console.log('[Step3Financial] Auto-populating monthly rent:', newRentEstimate);
      updatedFinancial.monthlyRent = newRentEstimate;
      hasChanges = true;
    }
    
    // Auto-calculate ARV for fix & flip strategy
    if (data.strategy === 'flip' && newEffectivePrice > 0 && (!financial.arv || financial.arv === 0)) {
      setIsCalculatingARV(true);
      
      // Simulate API call delay for better UX
      setTimeout(() => {
        const renovationLevel = data.strategyDetails?.renovationLevel || 'moderate';
        let arvMultiplier = 1.25;
        
        if (renovationLevel === 'cosmetic') arvMultiplier = 1.15;
        else if (renovationLevel === 'moderate') arvMultiplier = 1.25;
        else if (renovationLevel === 'extensive') arvMultiplier = 1.35;
        else if (renovationLevel === 'gut') arvMultiplier = 1.45;
        
        const calculatedARV = Math.round(newEffectivePrice * arvMultiplier);
        console.log('[Step3Financial] Auto-calculating ARV:', {
          currentValue: newEffectivePrice,
          renovationLevel,
          multiplier: arvMultiplier,
          calculatedARV
        });
        
        updatedFinancial.arv = calculatedARV;
        setFinancial({ ...financial, arv: calculatedARV });
        updateData({ financial: { ...financial, arv: calculatedARV } });
        setIsCalculatingARV(false);
      }, 800);
      
      return; // Don't apply other changes yet
    }
    
    // Apply all changes at once
    if (hasChanges) {
      setFinancial(updatedFinancial);
      updateData({ financial: updatedFinancial });
    }
  }, [data.propertyData, data.strategy, data.strategyDetails?.renovationLevel]); // eslint-disable-line react-hooks/exhaustive-deps
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
      comparablesValue: (data.propertyData as any)?.comparables?.value,
      confidenceScore: (data.propertyData as any)?.comparables?.confidenceScore,
      strategyDetails: data.strategyDetails,
      currentFinancial: data.financial,
      initialFinancial,
      extractedPurchasePrice: data.financial.purchasePrice,
      extractedRent: (data.propertyData as any)?.rental?.rentEstimate,
      rentRange: (data.propertyData as any)?.rental ? {
        low: (data.propertyData as any).rental.rentRangeLow,
        high: (data.propertyData as any).rental.rentRangeHigh
      } : null
    });
  }, [data, initialFinancial]);

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
    
    // Try multiple locations for square footage
    const squareFootage = propertyData?.property?.squareFootage || 
                         propertyData?.listing?.squareFootage ||
                         propertyData?.comparables?.property?.squareFootage ||
                         (Array.isArray(propertyData?.property) ? propertyData.property[0]?.squareFootage : undefined) ||
                         0;
    
    console.log('[Step3Financial] Renovation cost calculation check:', {
      showRenovationCosts,
      squareFootage,
      renovationLevel,
      strategy: data.strategy,
      currentRenovationCosts: financial.renovationCosts,
      propertyDataStructure: propertyData ? Object.keys(propertyData) : 'null'
    });
    
    // Calculate and set rehab costs if we have the necessary data
    if (squareFootage > 0 && renovationLevel && showRenovationCosts) {
      const { lowEstimate, highEstimate, averageEstimate } = calculateRehabCosts(squareFootage, renovationLevel);
      
      console.log('[Step3Financial] Calculated renovation costs:', {
        squareFootage,
        renovationLevel,
        lowEstimate,
        highEstimate,
        averageEstimate,
        perSqFt: averageEstimate / squareFootage
      });
      
      // Only update if the value hasn't been set yet or is 0
      if (!financial.renovationCosts || financial.renovationCosts === 0) {
        const newFinancial = {
          ...financial,
          renovationCosts: averageEstimate
        };
        setFinancial(newFinancial);
        updateData({ financial: newFinancial });
        console.log('[Step3Financial] Set renovation costs to:', averageEstimate);
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
      // Auto-calculate closing costs if not set (3% for hard money)
      const closingCosts = financial.closingCosts || (financial.purchasePrice > 0 ? Math.round(financial.purchasePrice * 0.03) : 0);
      
      const newFinancial = {
        ...financial,
        interestRate: hardMoneyDefaults.interestRate,
        loanTerm: hardMoneyDefaults.loanTerm,
        downPaymentPercent: hardMoneyDefaults.downPaymentPercent,
        points: hardMoneyDefaults.points,
        closingCosts: closingCosts,
        loanType: 'hardMoney' as const
      };
      setFinancial(newFinancial);
      updateData({ financial: newFinancial });
    } else if (loanType === 'conventional') {
      // Auto-calculate closing costs if not set (2-3% for conventional)
      const closingCosts = financial.closingCosts || (financial.purchasePrice > 0 ? Math.round(financial.purchasePrice * 0.025) : 0);
      
      const newFinancial = {
        ...financial,
        closingCosts: closingCosts,
        loanType: 'conventional' as const
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
    if (!financial.purchasePrice || financial.downPaymentPercent === undefined) return 0;
    const downPayment = (financial.purchasePrice * financial.downPaymentPercent) / 100;
    return financial.purchasePrice - downPayment;
  };

  const calculateMonthlyPayment = () => {
    const principal = calculateLoanAmount();
    if (!principal || !financial.interestRate || !financial.loanTerm) return 0;
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
    if (!financial.purchasePrice || financial.downPaymentPercent === undefined) return 0;
    const downPayment = (financial.purchasePrice * financial.downPaymentPercent) / 100;
    const loanAmount = financial.purchasePrice - downPayment;
    const pointsCost = loanType === 'hardMoney' ? (loanAmount * (financial.points || 0)) / 100 : 0;
    
    // For hard money loans, renovation costs are 100% funded by lender
    // so they should NOT be included in the upfront investment
    const renovationContribution = loanType === 'hardMoney' ? 0 : (financial.renovationCosts || 0);
    
    return downPayment + 
      (financial.closingCosts || 0) + 
      renovationContribution + 
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

      {/* Estimated Rent Info - Only show for rental strategies */}
      {['rental', 'brrrr', 'commercial'].includes(data.strategy) && (
        <div className="bg-accent/10 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-primary">Monthly Rent Estimate</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
              <input
                type="number"
                value={financial.monthlyRent || ''}
                onChange={(e) => handleFieldChange('monthlyRent', e.target.value)}
                className="w-full pl-8 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={rentEstimate ? `RentCast estimate: $${rentEstimate}` : "Enter expected monthly rent"}
              />
            </div>
            {rentEstimate > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted">
                    RentCast Estimate: ${rentEstimate.toLocaleString()}/mo
                  </p>
                  {(!financial.monthlyRent || financial.monthlyRent === 0) && (
                    <button
                      type="button"
                      onClick={() => handleFieldChange('monthlyRent', rentEstimate)}
                      className="text-xs text-primary hover:underline"
                    >
                      Use Estimate
                    </button>
                  )}
                </div>
                {(data.propertyData as any)?.rental?.rentRangeLow && (data.propertyData as any)?.rental?.rentRangeHigh && (
                  <p className="text-xs text-muted">
                    Range: ${(data.propertyData as any).rental.rentRangeLow.toLocaleString()} - ${(data.propertyData as any).rental.rentRangeHigh.toLocaleString()}
                  </p>
                )}
              </div>
            )}
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
            const listing = (data.propertyData as any)?.listing;
            const listingPrice = listing?.price || listing?.listPrice || listing?.askingPrice || 0;
            const comparablesValue = (data.propertyData as any)?.comparables?.value;
            const confidenceScore = (data.propertyData as any)?.comparables?.confidenceScore;
            const comparablesError = (data.propertyData as any)?.comparables?.error;
            
            if (comparablesError) {
              return (
                <p className="text-xs text-red-500 mt-1">
                  Unable to fetch estimate: {comparablesError}
                </p>
              );
            }
            
            if (listingPrice > 0) {
              return (
                <div className="mt-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-green-600 flex items-center">
                      <span className="mr-1">🏷️</span>
                      <span>Active Listing: ${listingPrice.toLocaleString()}</span>
                    </p>
                    {(!financial.purchasePrice || financial.purchasePrice === 0) && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange('purchasePrice', listingPrice)}
                        className="text-xs text-primary hover:underline"
                      >
                        Use List Price
                      </button>
                    )}
                  </div>
                  {comparablesValue && (
                    <p className="text-xs text-muted">
                      AVM Estimate: ${comparablesValue.toLocaleString()}
                    </p>
                  )}
                </div>
              );
            }
            
            if (comparablesValue) {
              return (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted flex items-center">
                      <span>AVM Estimated Value: ${comparablesValue.toLocaleString()}</span>
                      {confidenceScore && (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                          confidenceScore >= 0.8 ? 'bg-green-100 text-green-700' :
                          confidenceScore >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {Math.round(confidenceScore * 100)}% confidence
                        </span>
                      )}
                    </p>
                    {(!financial.purchasePrice || financial.purchasePrice === 0) && (
                      <button
                        type="button"
                        onClick={() => handleFieldChange('purchasePrice', comparablesValue)}
                        className="text-xs text-primary hover:underline"
                      >
                        Use AVM Value
                      </button>
                    )}
                  </div>
                  {(data.propertyData as any)?.comparables?.valueRangeLow && (data.propertyData as any)?.comparables?.valueRangeHigh && (
                    <p className="text-xs text-muted">
                      Value Range: ${(data.propertyData as any).comparables.valueRangeLow.toLocaleString()} - ${(data.propertyData as any).comparables.valueRangeHigh.toLocaleString()}
                    </p>
                  )}
                </div>
              );
            }
            
            // Show loading state if property data exists but no comparables yet
            if (data.propertyData && !(data.propertyData as any)?.comparables) {
              return (
                <p className="text-xs text-muted mt-1 animate-pulse">
                  Fetching AVM estimate...
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
                value={isCalculatingARV ? '' : (financial.arv || '')}
                onChange={(e) => handleFieldChange('arv', e.target.value)}
                className="w-full pl-8 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={isCalculatingARV ? 'Calculating ARV...' : 'Enter ARV'}
                disabled={isCalculatingARV}
              />
              {isCalculatingARV && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            {/* Always show ARV calculation section */}
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">
                  Base value: ${financial.purchasePrice > 0 ? financial.purchasePrice.toLocaleString() : 'Enter purchase price'}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('[Step3Financial] ARV Button clicked');
                    
                    const purchasePrice = financial.purchasePrice || 0;
                    
                    if (purchasePrice === 0) {
                      alert('Please enter a purchase price first.');
                      return;
                    }
                    
                    const renovationLevel = data.strategyDetails?.renovationLevel || 'moderate';
                    let arvMultiplier = 1.25;
                    
                    if (renovationLevel === 'cosmetic') arvMultiplier = 1.15;
                    else if (renovationLevel === 'moderate') arvMultiplier = 1.25;
                    else if (renovationLevel === 'extensive') arvMultiplier = 1.35;
                    else if (renovationLevel === 'gut') arvMultiplier = 1.45;
                    
                    const calculatedARV = Math.round(purchasePrice * arvMultiplier);
                    console.log('[Step3Financial] Calculated ARV:', {
                      purchasePrice,
                      renovationLevel,
                      multiplier: arvMultiplier,
                      calculatedARV
                    });
                    
                    // Set calculating state
                    setIsCalculatingARV(true);
                    
                    // Simulate calculation delay for better UX
                    setTimeout(() => {
                      handleFieldChange('arv', calculatedARV);
                      setIsCalculatingARV(false);
                    }, 500);
                  }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {financial.arv ? 'Recalculate' : 'Calculate'} ARV
                  </button>
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
            {financial.arv && financial.purchasePrice && financial.arv <= financial.purchasePrice && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ ARV must be greater than purchase price for a profitable flip
              </p>
            )}
            {!financial.arv && !isCalculatingARV && (
              <p className="text-xs text-yellow-600 mt-1">
                ℹ️ ARV is required for fix & flip analysis
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
              = ${(financial.purchasePrice && financial.downPaymentPercent !== undefined ? ((financial.purchasePrice * financial.downPaymentPercent) / 100).toLocaleString() : '0')}
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
                Typical: {loanType === 'hardMoney' ? '3%' : '2-3%'} of purchase price
                {financial.purchasePrice > 0 && !financial.closingCosts && (
                  <button
                    type="button"
                    onClick={() => {
                      const rate = loanType === 'hardMoney' ? 0.03 : 0.025;
                      handleFieldChange('closingCosts', Math.round(financial.purchasePrice * rate));
                    }}
                    className="ml-2 text-primary hover:underline"
                  >
                    (Auto-calculate)
                  </button>
                )}
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
                      
                      const baseText = `${levelLabel} renovation estimate: $${lowEstimate.toLocaleString()} - $${highEstimate.toLocaleString()} (${squareFootage?.toLocaleString() || 'N/A'} sqft)`;
                      
                      if (loanType === 'hardMoney') {
                        return `${baseText} - 100% funded by lender`;
                      }
                      return baseText;
                    }
                    
                    return loanType === 'hardMoney' 
                      ? '100% funded by hard money lender (no upfront cost)' 
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
                ${calculateLoanAmount()?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-muted mb-1">Monthly Payment</p>
              <p className="text-xl font-bold text-primary">
                ${Math.round(calculateMonthlyPayment())?.toLocaleString() || '0'}
              </p>
              {loanType === 'hardMoney' && (
                <p className="text-xs text-muted mt-1">Interest-only</p>
              )}
            </div>
            {showRenovationCosts && (financial.renovationCosts ?? 0) > 0 ? (
              <div>
                <p className="text-muted mb-1">
                  {loanType === 'hardMoney' ? 'Rehab Budget' : 'Renovation Costs'}
                </p>
                <p className="text-xl font-bold text-accent">
                  ${financial.renovationCosts?.toLocaleString() || '0'}
                </p>
                {loanType === 'hardMoney' && (
                  <p className="text-xs text-green-600 mt-1">Lender funded</p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-muted mb-1">Total Investment</p>
                <p className="text-xl font-bold text-primary">
                  ${calculateTotalInvestment()?.toLocaleString() || '0'}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted mb-1">Cash to Close</p>
              <p className="text-xl font-bold text-accent">
                ${calculateTotalInvestment()?.toLocaleString() || '0'}
              </p>
              {loanType === 'hardMoney' && (
                <p className="text-xs text-muted mt-1">
                  Down + closing + points
                </p>
              )}
            </div>
          </div>
          {loanType === 'hardMoney' && (
            <>
              <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                  ✓ Cash to Close Breakdown
                </p>
                <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <div className="flex justify-between">
                    <span>Down Payment ({financial.downPaymentPercent}%):</span>
                    <span className="font-medium">${((financial.purchasePrice * financial.downPaymentPercent) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Closing Costs:</span>
                    <span className="font-medium">${(financial.closingCosts || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points ({financial.points || hardMoneyDefaults.points}%):</span>
                    <span className="font-medium">${Math.round((calculateLoanAmount() * (financial.points || hardMoneyDefaults.points)) / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-green-500/20 pt-1 font-semibold">
                    <span>Total Cash Required:</span>
                    <span>${calculateTotalInvestment().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  💰 Lender Funded (No Upfront Cost)
                </p>
                <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <div className="flex justify-between">
                    <span>Renovation Budget:</span>
                    <span className="font-medium">${(financial.renovationCosts || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-xs mt-2 italic">
                    * Drawn as needed during construction
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Hard Money Loan Features:</strong>
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                  <li>• 100% renovation funding (no upfront rehab costs)</li>
                  <li>• {financial.points || hardMoneyDefaults.points} points origination fee</li>
                  <li>• {financial.loanTerm < 2 ? `${financial.loanTerm * 12} month` : `${financial.loanTerm} year`} term with interest-only payments</li>
                  <li>• Quick approval & closing (7-14 days typical)</li>
                </ul>
              </div>
            </>
          )}
          
          {/* Renovation Cost Breakdown */}
          {showRenovationCosts && (financial.renovationCosts ?? 0) > 0 && (
            <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
              <h4 className="text-sm font-semibold text-accent mb-2">Renovation Investment Details</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted">Total Renovation Budget:</span>
                  <span className="font-medium text-primary">${financial.renovationCosts?.toLocaleString() || '0'}</span>
                </div>
                {(() => {
                  const sqft = (data.propertyData as any)?.property?.squareFootage;
                  const level = data.strategyDetails?.renovationLevel || 'moderate';
                  if (sqft) {
                    const perSqft = (financial.renovationCosts ?? 0) / sqft;
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted">Cost per Square Foot:</span>
                          <span className="font-medium text-primary">${perSqft.toFixed(0)}/sqft</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Property Size:</span>
                          <span className="font-medium text-primary">{sqft?.toLocaleString() || 'N/A'} sqft</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Renovation Level:</span>
                          <span className="font-medium text-primary capitalize">{level}</span>
                        </div>
                      </>
                    );
                  }
                  return null;
                })()}
              </div>
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