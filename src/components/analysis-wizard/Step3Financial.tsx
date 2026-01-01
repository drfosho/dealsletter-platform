'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import type { WizardData } from '@/app/analysis/new/page';
import { calculateRehabCosts, RehabLevel } from '@/utils/rehab-calculator';
import {
  getSimpleFinancingDefaults,
  calculateClosingCosts,
  type InvestmentStrategy,
  type ClosingCostBreakdown
} from '@/utils/financing-defaults';
import { calculateARVFromComparables, extractComparableProperties, formatARVDetails, type ARVCalculationResult } from '@/utils/arv-calculator';
import {
  parsePrice,
  parsePercentage,
  parseInteger,
  calculateMonthlyMortgage
} from '@/utils/financial-calculations';

// Interest Rate Input Component - properly handles decimal input
function InterestRateInput({
  value,
  onChange,
  loanType
}: {
  value: number;
  onChange: (value: number) => void;
  loanType: 'conventional' | 'hardMoney';
}) {
  // Use string state for controlled input to allow proper decimal typing
  const [inputValue, setInputValue] = useState(value.toString());

  // Sync with parent value when it changes externally
  useEffect(() => {
    // Only update if the parsed values are different (avoid overwriting during typing)
    const currentParsed = parseFloat(inputValue) || 0;
    if (Math.abs(currentParsed - value) > 0.001 && inputValue !== '') {
      setInputValue(value.toString());
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Allow empty, numbers, and ONE decimal point with up to 2 decimal places
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setInputValue(val);

      // Convert to number for parent component
      const numValue = parseFloat(val);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 25) {
        onChange(numValue);
      }
    }
  };

  const handleBlur = () => {
    // Format on blur - ensure proper display
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      // Keep as-is if it's a clean number, otherwise format
      const formatted = numValue.toString();
      setInputValue(formatted);
      onChange(numValue);
    } else {
      // Reset to previous valid value or default
      setInputValue(value.toString());
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        Interest Rate
      </label>
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="flex-1 px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="7.0"
        />
        <span className="text-muted">%</span>
      </div>
      <p className="text-xs text-muted mt-1">
        {loanType === 'hardMoney'
          ? 'Hard money: typically 10-14%'
          : 'Conventional: typically 6.5-7.5%'
        }
      </p>
    </div>
  );
}

// Map UI renovation levels to RehabLevel enum
function mapRenovationLevelToRehabLevel(renovationLevel?: string): RehabLevel {
  const mapping: Record<string, RehabLevel> = {
    'cosmetic': RehabLevel.LIGHT,
    'light': RehabLevel.LIGHT,
    'moderate': RehabLevel.MEDIUM,
    'medium': RehabLevel.MEDIUM,
    'extensive': RehabLevel.HEAVY,
    'heavy': RehabLevel.HEAVY,
    'gut': RehabLevel.GUT,
  };

  return mapping[renovationLevel?.toLowerCase() || ''] || RehabLevel.MEDIUM;
}

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
  const initialFinancial = useMemo(() => ({
    ...data.financial
  }), [data.financial]);

  const [financial, setFinancial] = useState(initialFinancial);
  const [isCalculatingARV, setIsCalculatingARV] = useState(false);
  const [arvCalculationResult, setArvCalculationResult] = useState<ARVCalculationResult | null>(null);
  
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
  
  // Initialize units based on property type
  useEffect(() => {
    if (financial.units === undefined && data.propertyData) {
      const property = (data.propertyData as any)?.property;
      const propertyType = property?.propertyType || '';
      const bedrooms = property?.bedrooms || property?.beds || 0;
      let defaultUnits = 1;

      console.log('[Step3Financial] Units auto-detection:', {
        propertyType,
        bedrooms,
        explicitUnits: property?.units,
        numberOfUnits: property?.numberOfUnits
      });

      // First check if units are explicitly provided in the data
      if (property?.units && property.units > 0) {
        defaultUnits = property.units;
        console.log('[Step3Financial] Using explicit units:', defaultUnits);
      } else if (property?.numberOfUnits && property.numberOfUnits > 0) {
        defaultUnits = property.numberOfUnits;
        console.log('[Step3Financial] Using numberOfUnits:', defaultUnits);
      }
      // Infer from property type name
      else if (propertyType.toLowerCase().includes('duplex')) {
        defaultUnits = 2;
      } else if (propertyType.toLowerCase().includes('triplex')) {
        defaultUnits = 3;
      } else if (propertyType.toLowerCase().includes('fourplex') || propertyType.toLowerCase().includes('quadplex')) {
        defaultUnits = 4;
      }
      // CRITICAL: For Multi-Family properties, use bedrooms as unit count if > 1
      // This is common for apartment buildings where each bedroom = 1 unit
      else if (propertyType.toLowerCase().includes('multi') ||
               propertyType.toLowerCase().includes('apartment') ||
               propertyType.toLowerCase().includes('multifamily')) {
        // For multi-family, bedrooms often = units (1br apartments)
        // But also check bathrooms as a sanity check
        const bathrooms = property?.bathrooms || property?.baths || 0;
        if (bedrooms > 1 && bedrooms === bathrooms) {
          // If bedrooms = bathrooms, likely each unit has 1br/1ba
          defaultUnits = bedrooms;
          console.log('[Step3Financial] Multi-family: Using bedrooms as units (beds=baths):', defaultUnits);
        } else if (bedrooms > 4) {
          // For larger properties, bedrooms likely = units
          defaultUnits = bedrooms;
          console.log('[Step3Financial] Multi-family: Using bedrooms as units (5+ beds):', defaultUnits);
        } else {
          // Default to 2 for generic multi-family
          defaultUnits = 2;
          console.log('[Step3Financial] Multi-family: Defaulting to 2 units');
        }
      }

      // Set units if we detected more than 1
      if (defaultUnits > 1) {
        console.log('[Step3Financial] Setting default units to:', defaultUnits);
        handleFieldChange('units', defaultUnits);
      }
    }
  }, [data.propertyData]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Auto-populate fields only when property data changes and values are missing
  useEffect(() => {
    const newListing = (data.propertyData as any)?.listing;
    const newListingPrice = newListing?.price || newListing?.listPrice || newListing?.askingPrice || 0;
    const newComparablesValue = (data.propertyData as any)?.comparables?.value || 0;
    const newRentEstimate = (data.propertyData as any)?.rental?.rentEstimate ||
                           (data.propertyData as any)?.rental?.rent || 0;

    // Use listing price for on-market properties, otherwise use AVM
    const newEffectivePrice = newListingPrice > 0 ? newListingPrice : newComparablesValue;

    // Determine current purchase price (from props or already in financial state)
    const currentPurchasePrice = data.financial.purchasePrice > 0
      ? data.financial.purchasePrice
      : financial.purchasePrice;

    console.log('[Step3Financial] Auto-populate check:', {
      strategy: data.strategy,
      newListingPrice,
      newComparablesValue,
      newEffectivePrice,
      newRentEstimate,
      propsFinancialPurchasePrice: data.financial.purchasePrice,
      currentPurchasePrice: financial.purchasePrice,
      currentMonthlyRent: financial.monthlyRent,
      currentARV: financial.arv,
      isOnMarket: newListingPrice > 0
    });

    let updatedFinancial = { ...financial };
    let hasChanges = false;

    // Auto-populate purchase price only if not already set anywhere
    if (newEffectivePrice > 0 && currentPurchasePrice === 0) {
      console.log('[Step3Financial] Auto-populating purchase price:', newEffectivePrice);
      updatedFinancial.purchasePrice = newEffectivePrice;
      hasChanges = true;

      // CRITICAL FIX: Auto-calculate closing costs immediately when purchase price is set
      if (!updatedFinancial.closingCosts || updatedFinancial.closingCosts === 0) {
        const closingCostPercent = data.strategy === 'flip' || data.strategy === 'brrrr' ? 0.03 : 0.025;
        updatedFinancial.closingCosts = Math.round(newEffectivePrice * closingCostPercent);
        console.log('[Step3Financial] Auto-calculating closing costs:', updatedFinancial.closingCosts);
      }
    } else if (data.financial.purchasePrice > 0 && financial.purchasePrice === 0) {
      // Sync purchase price from props if not in local state
      console.log('[Step3Financial] Syncing purchase price from props:', data.financial.purchasePrice);
      updatedFinancial.purchasePrice = data.financial.purchasePrice;
      hasChanges = true;

      // CRITICAL FIX: Auto-calculate closing costs when syncing purchase price
      if (!updatedFinancial.closingCosts || updatedFinancial.closingCosts === 0) {
        const closingCostPercent = data.strategy === 'flip' || data.strategy === 'brrrr' ? 0.03 : 0.025;
        updatedFinancial.closingCosts = Math.round(data.financial.purchasePrice * closingCostPercent);
        console.log('[Step3Financial] Auto-calculating closing costs from synced price:', updatedFinancial.closingCosts);
      }
    }
    
    // Auto-populate monthly rent if not already set and strategy requires it
    if (['rental', 'brrrr', 'commercial'].includes(data.strategy) &&
        newRentEstimate > 0 &&
        (!financial.monthlyRent || financial.monthlyRent === 0)) {

      // CRITICAL FIX: For multi-family properties, RentCast may return per-unit rent
      // We need to multiply by number of units to get total property rent
      const property = (data.propertyData as any)?.property;
      const propertyType = property?.propertyType || '';
      const isMultiFamily = propertyType.toLowerCase().includes('multi') ||
                           propertyType.toLowerCase().includes('apartment') ||
                           propertyType.toLowerCase().includes('duplex') ||
                           propertyType.toLowerCase().includes('triplex') ||
                           propertyType.toLowerCase().includes('fourplex');

      // Detect number of units for multi-family
      let detectedUnits = 1;
      if (isMultiFamily) {
        const bedrooms = property?.bedrooms || property?.beds || 0;
        const bathrooms = property?.bathrooms || property?.baths || 0;

        if (property?.units && property.units > 0) {
          detectedUnits = property.units;
        } else if (property?.numberOfUnits && property.numberOfUnits > 0) {
          detectedUnits = property.numberOfUnits;
        } else if (propertyType.toLowerCase().includes('duplex')) {
          detectedUnits = 2;
        } else if (propertyType.toLowerCase().includes('triplex')) {
          detectedUnits = 3;
        } else if (propertyType.toLowerCase().includes('fourplex') || propertyType.toLowerCase().includes('quadplex')) {
          detectedUnits = 4;
        } else if (bedrooms > 1 && bedrooms === bathrooms) {
          // For multi-family where beds = baths, each is likely a 1br/1ba unit
          detectedUnits = bedrooms;
        } else if (bedrooms > 4) {
          detectedUnits = bedrooms;
        }
      }

      // Calculate total rent - multiply by units for multi-family
      // RentCast typically returns per-unit rent estimate for multi-family properties
      const totalMonthlyRent = isMultiFamily && detectedUnits > 1
        ? newRentEstimate * detectedUnits
        : newRentEstimate;

      console.log('[Step3Financial] Auto-populating monthly rent:', {
        rentCastEstimate: newRentEstimate,
        isMultiFamily,
        detectedUnits,
        totalMonthlyRent,
        calculation: isMultiFamily && detectedUnits > 1
          ? `${newRentEstimate} × ${detectedUnits} = ${totalMonthlyRent}`
          : `${newRentEstimate} (single unit)`
      });

      updatedFinancial.monthlyRent = totalMonthlyRent;

      // Also set rent per unit for multi-family
      if (detectedUnits > 1) {
        updatedFinancial.rentPerUnit = newRentEstimate;
        updatedFinancial.units = detectedUnits;
      }

      hasChanges = true;
    }
    
    // Auto-calculate ARV for strategies that need it
    // Use comparable sales data for more accurate ARV calculation
    const needsARV = ['flip', 'brrrr'].includes(data.strategy);
    const comparablesAVM = newComparablesValue || newEffectivePrice;

    if (needsARV && comparablesAVM > 0 && (!financial.arv || financial.arv === 0)) {
      setIsCalculatingARV(true);

      // Calculate ARV using comparable sales data
      setTimeout(() => {
        const renovationLevel = (data.strategyDetails?.renovationLevel || 'moderate') as 'cosmetic' | 'moderate' | 'extensive' | 'gut';
        const squareFootage = (data.propertyData as any)?.property?.squareFootage ||
                              (data.propertyData as any)?.listing?.squareFootage || 0;

        // Extract comparable properties
        const comparables = extractComparableProperties(data.propertyData || {});

        console.log('[Step3Financial] Calculating ARV with comparables:', {
          comparablesCount: comparables.length,
          renovationLevel,
          squareFootage,
          strategy: data.strategy,
          avmValue: comparablesAVM
        });

        // Calculate ARV using the improved calculator
        const arvResult = calculateARVFromComparables({
          subjectPropertySqFt: squareFootage,
          purchasePrice: newEffectivePrice,
          comparables: comparables,
          avmValue: comparablesAVM,
          renovationLevel,
          strategy: data.strategy as 'flip' | 'brrrr'
        });

        console.log('[Step3Financial] ARV calculation result:', {
          arv: arvResult.arv,
          method: arvResult.method,
          confidence: arvResult.confidence,
          details: arvResult.details
        });

        setArvCalculationResult(arvResult);
        updatedFinancial.arv = arvResult.arv;
        setFinancial({ ...financial, arv: arvResult.arv });
        updateData({ financial: { ...financial, arv: arvResult.arv } });
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
    (data.strategy === 'flip' || data.strategy === 'brrrr') ?
      (data.strategyDetails?.initialFinancing === 'conventional' ? 'conventional' : 'hardMoney') :
      'conventional'
  );
  const previousLoanType = useRef(loanType);
  const hasInitializedHardMoney = useRef(false);
  const previousStrategy = useRef(data.strategy); // Track strategy changes for forced defaults

  // Initialize hard money defaults on first mount for flip/brrrr strategies
  useEffect(() => {
    // Only run once on mount
    if (hasInitializedHardMoney.current) return;

    const isHardMoneyStrategy = (data.strategy === 'flip' || data.strategy === 'brrrr');
    const shouldUseHardMoney = isHardMoneyStrategy && data.strategyDetails?.initialFinancing !== 'conventional';

    if (shouldUseHardMoney) {
      console.log('[Step3Financial] Initializing hard money defaults on mount:', {
        strategy: data.strategy,
        currentInterestRate: financial.interestRate,
        hardMoneyRate: hardMoneyDefaults.interestRate,
        currentLoanTerm: financial.loanTerm,
        hardMoneyTerm: hardMoneyDefaults.loanTerm
      });

      // Calculate closing costs if not set (3% for hard money)
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
      hasInitializedHardMoney.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Quick select options for down payment (strategy-aware)
  const downPaymentOptions = useMemo(() => {
    if (loanType === 'hardMoney') {
      return [
        { value: 10, label: '10%', description: 'Hard money minimum' },
        { value: 15, label: '15%', description: 'Standard hard money' },
        { value: 20, label: '20%', description: 'Lower risk' },
        { value: 25, label: '25%', description: 'Best terms' }
      ];
    }

    // Strategy-specific options
    if (data.strategy === 'house-hack') {
      return [
        { value: 3.5, label: '3.5%', description: 'FHA minimum' },
        { value: 5, label: '5%', description: 'Low down' },
        { value: 10, label: '10%', description: 'Conventional' },
        { value: 20, label: '20%', description: 'No PMI' }
      ];
    }

    // Investment property options
    return [
      { value: 20, label: '20%', description: 'Minimum investment' },
      { value: 25, label: '25%', description: 'Standard investment' },
      { value: 30, label: '30%', description: 'Better terms' },
      { value: 35, label: '35%', description: 'Best terms' }
    ];
  }, [loanType, data.strategy]);

  // Get strategy-based financing defaults
  const strategyFinancingDefaults = useMemo(() => {
    // Map strategy to InvestmentStrategy type
    const strategyMap: Record<string, InvestmentStrategy> = {
      'flip': 'flip',
      'brrrr': 'brrrr',
      'rental': 'rental',
      'buy-and-hold': 'buy-and-hold',
      'house-hack': 'house-hack',
      'commercial': 'commercial',
      'short-term-rental': 'short-term-rental'
    };
    const mappedStrategy = strategyMap[data.strategy] || 'rental';
    return getSimpleFinancingDefaults(mappedStrategy);
  }, [data.strategy]);

  // Hard money loan defaults (now sourced from strategy defaults)
  const hardMoneyDefaults = useMemo(() => {
    if (data.strategy === 'flip' || data.strategy === 'brrrr') {
      return {
        interestRate: strategyFinancingDefaults.interestRate,
        loanTerm: strategyFinancingDefaults.loanTermYears,
        downPaymentPercent: strategyFinancingDefaults.downPaymentPercent,
        points: strategyFinancingDefaults.lenderPointsPercent,
        rehabFunding: 100, // 100% rehab funding
        totalClosingCostsPercent: strategyFinancingDefaults.totalClosingCostsPercent
      };
    }
    // Default hard money settings
    return {
      interestRate: 10.0,         // 10% minimum hard money rate
      loanTerm: 1,
      downPaymentPercent: 10,
      points: 2.5,
      rehabFunding: 100,
      totalClosingCostsPercent: 3.0
    };
  }, [data.strategy, strategyFinancingDefaults]);

  // Closing costs breakdown state
  const [closingCostsBreakdown, setClosingCostsBreakdown] = useState<ClosingCostBreakdown | null>(null);

  // Update closing costs breakdown when relevant values change
  useEffect(() => {
    if (financial.purchasePrice > 0) {
      const points = financial.points || (loanType === 'hardMoney' ? hardMoneyDefaults.points : 1.0);
      const otherCosts = loanType === 'hardMoney' ? 0.5 : 2.0;
      const breakdown = calculateClosingCosts(financial.purchasePrice, points, otherCosts);
      setClosingCostsBreakdown(breakdown);
    }
  }, [financial.purchasePrice, financial.points, loanType, hardMoneyDefaults.points]);

  // Determine if renovation costs should be shown
  const showRenovationCosts = ['flip', 'brrrr'].includes(data.strategy);

  // Apply strategy-based financing defaults when strategy changes
  // CRITICAL: This ensures proper defaults for each strategy type
  // Defaults MUST apply when switching strategies, not just on first load
  useEffect(() => {
    // Check if strategy actually changed
    const strategyChanged = data.strategy !== previousStrategy.current;
    const needsInitialDefaults = !financial.interestRate || financial.interestRate === 0;

    // Apply defaults if:
    // 1. Strategy changed (user switched strategies)
    // 2. OR we haven't initialized defaults yet
    if (!strategyChanged && !needsInitialDefaults) return;

    if (strategyChanged) {
      console.log('[Step3Financial] STRATEGY CHANGED - Applying new defaults:', {
        previousStrategy: previousStrategy.current,
        newStrategy: data.strategy,
        defaults: strategyFinancingDefaults
      });
      previousStrategy.current = data.strategy; // Update ref
    } else {
      console.log('[Step3Financial] Initial defaults application:', {
        strategy: data.strategy,
        defaults: strategyFinancingDefaults
      });
    }

    const newFinancial = {
      ...financial,
      downPaymentPercent: strategyFinancingDefaults.downPaymentPercent,
      interestRate: strategyFinancingDefaults.interestRate,
      loanTerm: strategyFinancingDefaults.loanTermYears,
      points: strategyFinancingDefaults.lenderPointsPercent,
      loanType: strategyFinancingDefaults.financingType === 'hard-money' ? 'hardMoney' as const : 'conventional' as const
    };

    setFinancial(newFinancial);
    updateData({ financial: newFinancial });

    // Update loan type state to match
    if (strategyFinancingDefaults.financingType === 'hard-money') {
      setLoanType('hardMoney');
    } else {
      setLoanType('conventional');
    }

    // Log verification after short delay to confirm defaults applied
    setTimeout(() => {
      console.log('[Step3Financial] Defaults verification:', {
        expectedDownPayment: strategyFinancingDefaults.downPaymentPercent,
        expectedInterestRate: strategyFinancingDefaults.interestRate,
        expectedLoanType: strategyFinancingDefaults.financingType
      });
    }, 100);
  }, [data.strategy]); // eslint-disable-line react-hooks/exhaustive-deps


  // Track previous renovation level to detect changes
  const previousRenovationLevel = useRef<string | undefined>(data.strategyDetails?.renovationLevel);

  // Calculate rehab costs based on property size and renovation level
  useEffect(() => {
    const propertyData = data.propertyData as any;
    const renovationLevelString = data.strategyDetails?.renovationLevel;

    // Try multiple locations for square footage
    const squareFootage = propertyData?.property?.squareFootage ||
                         propertyData?.listing?.squareFootage ||
                         propertyData?.comparables?.property?.squareFootage ||
                         (Array.isArray(propertyData?.property) ? propertyData.property[0]?.squareFootage : undefined) ||
                         0;

    console.log('[Step3Financial] Renovation cost calculation check:', {
      showRenovationCosts,
      squareFootage,
      renovationLevelString,
      strategy: data.strategy,
      currentRenovationCosts: financial.renovationCosts,
      previousLevel: previousRenovationLevel.current,
      propertyDataStructure: propertyData ? Object.keys(propertyData) : 'null'
    });

    // Calculate and set rehab costs if we have the necessary data
    if (squareFootage > 0 && renovationLevelString && showRenovationCosts) {
      const mappedLevel = mapRenovationLevelToRehabLevel(renovationLevelString);
      const { lowEstimate, highEstimate, averageEstimate, costPerSqft } = calculateRehabCosts(squareFootage, mappedLevel);

      console.log('[Step3Financial] Calculated renovation costs:', {
        squareFootage,
        renovationLevelString,
        mappedLevel,
        lowEstimate,
        highEstimate,
        averageEstimate,
        perSqFt: costPerSqft
      });

      // Check if renovation level changed
      const levelChanged = renovationLevelString !== previousRenovationLevel.current;
      previousRenovationLevel.current = renovationLevelString;

      // Auto-populate if:
      // 1. Value hasn't been set yet (0 or undefined)
      // 2. Renovation level was just changed (recalculate)
      const shouldAutoPopulate = !financial.renovationCosts ||
                                 financial.renovationCosts === 0 ||
                                 levelChanged;

      if (shouldAutoPopulate) {
        const newFinancial = {
          ...financial,
          renovationCosts: averageEstimate
        };
        setFinancial(newFinancial);
        updateData({ financial: newFinancial });
        console.log('[Step3Financial] Auto-populated renovation costs to:', averageEstimate,
          levelChanged ? '(renovation level changed)' : '(initial population)');
      }
    }
  }, [data.propertyData, data.strategyDetails?.renovationLevel, showRenovationCosts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-populate ARV for flip/brrrr strategy using improved calculator
  useEffect(() => {
    // Add a small delay to ensure all data is properly loaded
    const timer = setTimeout(() => {
      const needsARV = ['flip', 'brrrr'].includes(data.strategy);
      if (!needsARV) return;

      console.log('[Step3Financial] ARV Auto-populate Check:', {
        strategy: data.strategy,
        currentARV: financial.arv,
        hasPropertyData: !!data.propertyData,
        renovationLevel: data.strategyDetails?.renovationLevel
      });

      const comparablesData = data.propertyData?.comparables as any;
      const currentValue = comparablesData?.value || 0;
      const squareFootage = (data.propertyData as any)?.property?.squareFootage ||
                            (data.propertyData as any)?.listing?.squareFootage || 0;

      if (currentValue > 0 && (!financial.arv || financial.arv === 0)) {
        const renovationLevel = (data.strategyDetails?.renovationLevel || 'moderate') as 'cosmetic' | 'moderate' | 'extensive' | 'gut';
        const comparables = extractComparableProperties(data.propertyData || {});

        // Use improved ARV calculator
        const arvResult = calculateARVFromComparables({
          subjectPropertySqFt: squareFootage,
          purchasePrice: currentValue,
          comparables: comparables,
          avmValue: currentValue,
          renovationLevel,
          strategy: data.strategy as 'flip' | 'brrrr'
        });

        console.log('[Step3Financial] ARV calculated:', {
          arv: arvResult.arv,
          method: arvResult.method,
          confidence: arvResult.confidence
        });

        setArvCalculationResult(arvResult);
        const newFinancial = {
          ...financial,
          arv: arvResult.arv
        };
        setFinancial(newFinancial);
        updateData({ financial: newFinancial });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [data.strategy, data.propertyData?.comparables, data.strategyDetails?.renovationLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle loan type changes - only apply defaults when user explicitly changes loan type
  useEffect(() => {
    // Skip if loan type hasn't actually changed
    if (loanType === previousLoanType.current) {
      return;
    }

    // Track that this is a user-initiated change
    previousLoanType.current = loanType;

    if (loanType === 'hardMoney' && (data.strategy === 'flip' || data.strategy === 'brrrr')) {
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
    // Use centralized parsePrice for consistent parsing across all monetary fields
    // This handles commas, dollar signs, and prevents parsing errors
    let numValue: number;

    // Percentage fields need different handling
    const percentageFields = ['downPaymentPercent', 'interestRate', 'points'];
    if (percentageFields.includes(field)) {
      numValue = parsePercentage(value);
    } else if (field === 'units' || field === 'loanTerm') {
      numValue = parseInteger(value);
    } else {
      // Monetary fields: purchasePrice, monthlyRent, rentPerUnit, arv, etc.
      numValue = parsePrice(value);
    }

    const newFinancial = { ...financial, [field]: numValue };

    // CRITICAL FIX: Auto-recalculate closing costs when purchase price changes
    // Only if closing costs haven't been manually edited (closingCostsManuallySet flag)
    if (field === 'purchasePrice' && numValue > 0 && !newFinancial.closingCostsManuallySet) {
      const closingCostPercent = data.strategy === 'flip' || data.strategy === 'brrrr' ? 0.03 : 0.025;
      newFinancial.closingCosts = Math.round(numValue * closingCostPercent);
      console.log('[Step3Financial] Auto-recalculating closing costs on price change:', newFinancial.closingCosts);
    }

    // Mark closing costs as manually set if user edits them directly
    if (field === 'closingCosts') {
      newFinancial.closingCostsManuallySet = true;
    }

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

  const calculateMonthlyPaymentLocal = () => {
    const principal = calculateLoanAmount();
    if (!principal || !financial.interestRate || !financial.loanTerm) return 0;

    // Use centralized mortgage calculation utility for consistency
    const payment = calculateMonthlyMortgage(
      principal,
      financial.interestRate,
      financial.loanTerm,
      loanType,
      loanType === 'hardMoney' && showRenovationCosts ? financial.renovationCosts : 0
    );

    // Sanity check - flag if payment seems unreasonable
    const paymentPercent = (payment / principal) * 100;
    if (paymentPercent > 5) {
      console.error('[Step3Financial] MORTGAGE CALCULATION ERROR:', {
        principal,
        interestRate: financial.interestRate,
        loanTerm: financial.loanTerm,
        loanType,
        payment,
        paymentPercent: paymentPercent.toFixed(2) + '%',
        expected: '0.5% - 3% of principal'
      });
    }

    return payment;
  };

  /**
   * Calculate Cash Required (what investor brings to closing)
   * For hard money: Down payment + Closing costs (rehab is lender funded)
   * For conventional: Down payment + Closing costs + Rehab costs
   */
  const calculateCashRequired = () => {
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
      pointsCost;
  };

  // Alias for backward compatibility
  const calculateTotalInvestment = calculateCashRequired;

  /**
   * Calculate Total Project Cost (all-in cost for the project)
   * This includes ALL costs regardless of financing source:
   * Purchase + Rehab + Closing + Holding + Selling
   */
  const calculateTotalProjectCost = () => {
    if (!financial.purchasePrice) return 0;
    const rehabCosts = financial.renovationCosts || 0;
    const closingCosts = financial.closingCosts || 0;
    const holdingCosts = financial.holdingCosts || 0;
    const arv = financial.arv || financial.purchasePrice;
    const sellingCosts = arv * 0.08; // 8% selling costs

    return financial.purchasePrice + rehabCosts + closingCosts + holdingCosts + sellingCosts;
  };

  /**
   * Calculate estimated net profit
   */
  const calculateEstimatedProfit = () => {
    if (!financial.arv) return 0;
    return financial.arv - calculateTotalProjectCost();
  };

  /**
   * Calculate ROI based on cash required (proper leverage calculation)
   */
  const calculateROI = () => {
    const cashRequired = calculateCashRequired();
    const profit = calculateEstimatedProfit();
    return cashRequired > 0 ? (profit / cashRequired) * 100 : 0;
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

      {/* Loan Type Selection for Fix & Flip and BRRRR */}
      {(data.strategy === 'flip' || data.strategy === 'brrrr') && (
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
              <span className="text-sm font-medium text-primary">Rental Income</span>
            </div>
          </div>
          
          {/* Multi-family property detection */}
          {(() => {
            const property = (data.propertyData as any)?.property;
            const propertyType = property?.propertyType || '';
            const isMultiFamily = propertyType.toLowerCase().includes('multi') ||
                                  propertyType.toLowerCase().includes('apartment') ||
                                  propertyType.toLowerCase().includes('duplex') ||
                                  propertyType.toLowerCase().includes('triplex') ||
                                  propertyType.toLowerCase().includes('fourplex') ||
                                  propertyType.toLowerCase().includes('quadplex');

            // Extract unit count from property data or infer from property type
            const extractUnits = (): number => {
              // First check if units are explicitly provided in the data
              if (property?.units && property.units > 0) {
                return property.units;
              }
              if (property?.numberOfUnits && property.numberOfUnits > 0) {
                return property.numberOfUnits;
              }
              // Infer from property type name
              if (propertyType.toLowerCase().includes('duplex')) return 2;
              if (propertyType.toLowerCase().includes('triplex')) return 3;
              if (propertyType.toLowerCase().includes('fourplex') || propertyType.toLowerCase().includes('quadplex')) return 4;
              // For Multi-Family, use bedrooms as unit count
              if (propertyType.toLowerCase().includes('multi') || propertyType.toLowerCase().includes('apartment')) {
                const bedrooms = property?.bedrooms || property?.beds || 0;
                const bathrooms = property?.bathrooms || property?.baths || 0;
                // If bedrooms = bathrooms, likely each unit has 1br/1ba
                if (bedrooms > 1 && bedrooms === bathrooms) return bedrooms;
                // For larger properties (5+ beds), bedrooms likely = units
                if (bedrooms > 4) return bedrooms;
                // Default to 2 for generic multi-family
                return 2;
              }
              // Default to 1 for single family homes
              return 1;
            };

            const unitCount = financial.units || extractUnits();
            
            if (isMultiFamily || unitCount > 1) {
              return (
                <div className="space-y-4">
                  {/* Number of Units */}
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Number of Units</label>
                    <input
                      type="number"
                      value={financial.units || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // CRITICAL FIX: Allow empty value during editing
                        // Parse and only update if valid number, otherwise let the field be empty
                        const units = parseInt(value);
                        if (!isNaN(units) && units > 0) {
                          handleFieldChange('units', units);
                          // Update total rent when units change
                          if (financial.rentPerUnit) {
                            handleFieldChange('monthlyRent', financial.rentPerUnit * units);
                          }
                        } else if (value === '') {
                          // Allow empty field - will be validated on blur
                          handleFieldChange('units', 0);
                        }
                      }}
                      onBlur={(e) => {
                        // Reset to 1 if left empty or zero on blur
                        if (!e.target.value || financial.units === 0) {
                          handleFieldChange('units', 1);
                        }
                      }}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="1"
                      placeholder={extractUnits().toString()}
                    />
                  </div>
                  
                  {/* Rent Per Unit */}
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Rent Per Unit</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                      <input
                        type="number"
                        value={financial.rentPerUnit || ''}
                        onChange={(e) => {
                          const rentPerUnit = parseFloat(e.target.value) || 0;
                          handleFieldChange('rentPerUnit', rentPerUnit);
                          // Update total rent
                          const units = financial.units || unitCount;
                          handleFieldChange('monthlyRent', rentPerUnit * units);
                        }}
                        className="w-full pl-8 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={rentEstimate && unitCount > 1 ? `Avg: $${Math.round(rentEstimate / unitCount)}` : "Per unit rent"}
                      />
                    </div>
                  </div>
                  
                  {/* Total Monthly Rent (Editable) */}
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Total Monthly Rent</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                      <input
                        type="number"
                        value={financial.monthlyRent || ''}
                        onChange={(e) => {
                          const totalRent = parseFloat(e.target.value) || 0;
                          handleFieldChange('monthlyRent', totalRent);
                          // Update rent per unit
                          const units = financial.units || unitCount;
                          if (units > 1) {
                            handleFieldChange('rentPerUnit', totalRent / units);
                          }
                        }}
                        className="w-full pl-8 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Total monthly rent"
                      />
                    </div>
                    {financial.rentPerUnit && unitCount > 1 && (
                      <p className="text-xs text-muted mt-1">
                        Calculated: {unitCount} units × ${financial.rentPerUnit.toLocaleString()} = ${(financial.rentPerUnit * unitCount).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
            
            // Single-family property - show simple rent input
            return (
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
              </div>
            );
          })()}
          
          {rentEstimate > 0 && (
            <div className="space-y-1 mt-3">
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
      )}

      <div className="space-y-6">
        {/* Purchase Price */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Purchase Price
          </label>
          
          {/* AVM vs Listing Price Warning */}
          {(() => {
            const listing = (data.propertyData as any)?.listing;
            const listingPrice = listing?.price || listing?.listPrice || listing?.askingPrice || 0;
            const comparablesValue = (data.propertyData as any)?.comparables?.value || 0;
            const isOnMarket = listingPrice > 0;
            
            console.log('[Step3Financial] Purchase price warning check:', {
              isOnMarket,
              listingPrice,
              comparablesValue,
              avmValue: comparablesValue,
              priceDifference: listingPrice - comparablesValue,
              percentDifference: comparablesValue > 0 ? ((listingPrice - comparablesValue) / comparablesValue * 100).toFixed(1) : 0
            });
            
            // Show warning if listing price is significantly different from AVM
            if (isOnMarket && comparablesValue > 0) {
              const priceDifference = listingPrice - comparablesValue;
              const percentDifference = (priceDifference / comparablesValue) * 100;
              
              if (Math.abs(percentDifference) > 10) {
                return (
                  <div className={`mb-4 p-4 rounded-lg border-2 ${
                    percentDifference > 0 
                      ? 'bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700' 
                      : 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                  }`}>
                    <div className="flex items-start gap-3">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        percentDifference > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          percentDifference > 0 ? 'text-orange-800 dark:text-orange-200' : 'text-green-800 dark:text-green-200'
                        }`}>
                          {percentDifference > 0 ? 'Property May Be Overpriced' : 'Property May Be Underpriced'}
                        </h4>
                        <div className="mt-2 space-y-1">
                          <p className={`text-sm ${
                            percentDifference > 0 ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300'
                          }`}>
                            <span className="font-medium">Listing Price:</span> ${listingPrice.toLocaleString()}
                          </p>
                          <p className={`text-sm ${
                            percentDifference > 0 ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300'
                          }`}>
                            <span className="font-medium">AVM Estimate:</span> ${comparablesValue.toLocaleString()}
                          </p>
                          <p className={`text-sm font-medium ${
                            percentDifference > 0 ? 'text-orange-800 dark:text-orange-200' : 'text-green-800 dark:text-green-200'
                          }`}>
                            Difference: ${Math.abs(priceDifference).toLocaleString()} ({Math.abs(percentDifference).toFixed(1)}% {percentDifference > 0 ? 'above' : 'below'} AVM)
                          </p>
                        </div>
                        <p className={`text-xs mt-3 ${
                          percentDifference > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                          {percentDifference > 0 
                            ? 'Consider negotiating a lower price or ensure the premium is justified by property condition, location, or features not captured in the AVM.'
                            : 'This could represent a good value opportunity. Verify the property condition and ensure there are no hidden issues.'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            }
            return null;
          })()}
          
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

        {/* ARV for Fix & Flip and BRRRR */}
        {(data.strategy === 'flip' || data.strategy === 'brrrr') && (
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              ARV (After Repair Value)
              <span className="text-xs text-muted ml-2">
                {data.strategy === 'flip' ? 'Required for flip calculations' : 'Required for refinance calculations'}
              </span>
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
            
            {/* ARV calculation section with confidence indicator */}
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
                    const avmValue = (data.propertyData as any)?.comparables?.value || purchasePrice;
                    const squareFootage = (data.propertyData as any)?.property?.squareFootage || 0;

                    if (purchasePrice === 0 && avmValue === 0) {
                      alert('Please enter a purchase price first.');
                      return;
                    }

                    // Set calculating state
                    setIsCalculatingARV(true);

                    // Use improved ARV calculator
                    setTimeout(() => {
                      const renovationLevel = (data.strategyDetails?.renovationLevel || 'moderate') as 'cosmetic' | 'moderate' | 'extensive' | 'gut';
                      const comparables = extractComparableProperties(data.propertyData || {});

                      const arvResult = calculateARVFromComparables({
                        subjectPropertySqFt: squareFootage,
                        purchasePrice: purchasePrice || avmValue,
                        comparables: comparables,
                        avmValue: avmValue,
                        renovationLevel,
                        strategy: data.strategy as 'flip' | 'brrrr'
                      });

                      setArvCalculationResult(arvResult);
                      handleFieldChange('arv', arvResult.arv);
                      setIsCalculatingARV(false);
                    }, 500);
                  }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {financial.arv ? 'Recalculate' : 'Calculate'} ARV
                </button>
              </div>

              {/* ARV calculation method and confidence display */}
              {arvCalculationResult && financial.arv && (
                <div className={`p-2 rounded-lg border ${
                  arvCalculationResult.confidence === 'high' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                  arvCalculationResult.confidence === 'medium' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                  'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${
                      arvCalculationResult.confidence === 'high' ? 'text-green-700 dark:text-green-300' :
                      arvCalculationResult.confidence === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                      'text-orange-700 dark:text-orange-300'
                    }`}>
                      {arvCalculationResult.method === 'comparables' ? '📊 Based on Comparable Sales' : '📈 Estimated from Market Data'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      arvCalculationResult.confidence === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' :
                      arvCalculationResult.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-200'
                    }`}>
                      {arvCalculationResult.confidence} confidence
                    </span>
                  </div>
                  <p className={`text-xs ${
                    arvCalculationResult.confidence === 'high' ? 'text-green-600 dark:text-green-400' :
                    arvCalculationResult.confidence === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-orange-600 dark:text-orange-400'
                  }`}>
                    {formatARVDetails(arvCalculationResult)}
                  </p>
                </div>
              )}

              {!arvCalculationResult && (
                <p className="text-xs text-muted">
                  {(() => {
                    const renovationLevel = data.strategyDetails?.renovationLevel;
                    let expectedIncrease = '15-18%';
                    if (renovationLevel === 'cosmetic') expectedIncrease = '8-12%';
                    else if (renovationLevel === 'moderate') expectedIncrease = '12-18%';
                    else if (renovationLevel === 'extensive') expectedIncrease = '18-25%';
                    else if (renovationLevel === 'gut') expectedIncrease = '25-32%';
                    return `Based on ${renovationLevel || 'moderate'} renovation, expecting ${expectedIncrease} value increase`;
                  })()}
                </p>
              )}
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

        {/* Number of Units */}
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Number of Units
            {(() => {
              const propertyType = (data.propertyData as any)?.property?.propertyType || '';
              const isMultiFamily = propertyType.toLowerCase().includes('multi') || 
                                   propertyType.toLowerCase().includes('duplex') || 
                                   propertyType.toLowerCase().includes('triplex') ||
                                   propertyType.toLowerCase().includes('fourplex');
              return isMultiFamily ? (
                <span className="text-xs text-muted font-normal ml-2">
                  (Multi-family property)
                </span>
              ) : null;
            })()}
          </label>
          <input
            type="number"
            value={financial.units || ''}
            onChange={(e) => {
              const value = e.target.value;
              // CRITICAL FIX: Allow empty value during editing
              // Parse and only update if valid number, otherwise let the field be empty
              const units = parseInt(value);
              if (!isNaN(units) && units > 0) {
                handleFieldChange('units', units);
                // Update rent calculations if we have rent per unit
                if (financial.rentPerUnit) {
                  handleFieldChange('monthlyRent', financial.rentPerUnit * units);
                }
              } else if (value === '') {
                // Allow empty field - will be validated on blur
                handleFieldChange('units', 0);
              }
            }}
            onBlur={(e) => {
              // Reset to 1 if left empty or zero on blur
              if (!e.target.value || financial.units === 0) {
                handleFieldChange('units', 1);
              }
            }}
            className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            min="1"
            placeholder="1"
          />
          <p className="text-xs text-muted mt-1">
            Total number of rentable units in the property
          </p>
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
              = ${(financial.purchasePrice && financial.downPaymentPercent !== undefined ? ((financial.purchasePrice * financial.downPaymentPercent) / 100).toLocaleString() : '0')}
            </span>
          </div>
        </div>

        {/* Interest Rate & Loan Term */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InterestRateInput
            value={financial.interestRate ?? 7.0}
            onChange={(value) => handleFieldChange('interestRate', value)}
            loanType={loanType}
          />
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
                <span className="text-xs text-muted font-normal ml-2">(includes lender points)</span>
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
              {/* Closing Costs Breakdown */}
              {closingCostsBreakdown && financial.purchasePrice > 0 && (
                <div className="mt-2 p-2 bg-muted/10 rounded-lg border border-border/50 text-xs">
                  <div className="flex justify-between text-muted">
                    <span>Lender Points ({closingCostsBreakdown.lenderPointsPercent}%):</span>
                    <span>${closingCostsBreakdown.lenderPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Title/Escrow/Other ({closingCostsBreakdown.otherClosingCostsPercent}%):</span>
                    <span>${closingCostsBreakdown.otherClosingCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium text-primary border-t border-border/30 pt-1 mt-1">
                    <span>Total ({closingCostsBreakdown.totalClosingCostsPercent}%):</span>
                    <span>${closingCostsBreakdown.totalClosingCosts.toLocaleString()}</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted mt-1">
                Typical: {loanType === 'hardMoney' ? '3%' : '3%'} of purchase price
                {financial.purchasePrice > 0 && !financial.closingCosts && (
                  <button
                    type="button"
                    onClick={() => {
                      // Use closing costs breakdown which properly combines points + other fees
                      if (closingCostsBreakdown) {
                        handleFieldChange('closingCosts', closingCostsBreakdown.totalClosingCosts);
                      } else {
                        // Fallback to 3% if breakdown not available
                        handleFieldChange('closingCosts', Math.round(financial.purchasePrice * 0.03));
                      }
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
                    const renovationLevelString = data.strategyDetails?.renovationLevel;
                    const renovationLevel = renovationLevelString ? mapRenovationLevelToRehabLevel(renovationLevelString) : null;
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
                {/* Detailed Rehab Estimate Display */}
                {(() => {
                  const propertyData = data.propertyData as any;
                  const renovationLevel = mapRenovationLevelToRehabLevel(data.strategyDetails?.renovationLevel);
                  const squareFootage = propertyData?.property?.squareFootage ||
                                       propertyData?.listing?.squareFootage || 0;

                  if (squareFootage > 0 && renovationLevel !== RehabLevel.NONE) {
                    const { lowEstimate, highEstimate, averageEstimate, costPerSqft } = calculateRehabCosts(squareFootage, renovationLevel);
                    const levelLabel = renovationLevel === RehabLevel.LIGHT ? 'Cosmetic' :
                                     renovationLevel === RehabLevel.MEDIUM ? 'Moderate' :
                                     renovationLevel === RehabLevel.HEAVY ? 'Heavy' :
                                     renovationLevel === RehabLevel.GUT ? 'Gut' : 'None';

                    return (
                      <div className="mt-2 p-2 bg-accent/5 rounded-lg border border-accent/20 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-primary">{levelLabel} Renovation</span>
                          <span className="text-accent">${costPerSqft}/sqft</span>
                        </div>
                        <div className="flex justify-between text-muted">
                          <span>Estimated ({squareFootage.toLocaleString()} sqft):</span>
                          <span className="font-medium">${averageEstimate.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-muted">
                          <span>Typical range:</span>
                          <span>${lowEstimate.toLocaleString()} - ${highEstimate.toLocaleString()}</span>
                        </div>
                        {loanType === 'hardMoney' && (
                          <div className="mt-1 pt-1 border-t border-accent/20 text-green-600">
                            100% funded by lender (no upfront cost)
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <p className="text-xs text-muted mt-1">
                      {loanType === 'hardMoney'
                        ? '100% funded by hard money lender (no upfront cost)'
                        : `Based on ${data.strategyDetails?.renovationLevel || 'moderate'} renovation`}
                    </p>
                  );
                })()}
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
                ${Math.round(calculateMonthlyPaymentLocal())?.toLocaleString() || '0'}
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
                  <p className="text-xs text-green-600 mt-1">Lender funded via holdback</p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-muted mb-1">Total Project Cost</p>
                <p className="text-xl font-bold text-primary">
                  ${calculateTotalProjectCost()?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-muted mt-1">All-in cost</p>
              </div>
            )}
            <div>
              <p className="text-muted mb-1">Cash Required</p>
              <p className="text-xl font-bold text-accent">
                ${calculateCashRequired()?.toLocaleString() || '0'}
              </p>
              {loanType === 'hardMoney' ? (
                <p className="text-xs text-muted mt-1">
                  What you bring to closing
                </p>
              ) : (
                <p className="text-xs text-muted mt-1">
                  Down + closing + rehab
                </p>
              )}
            </div>
          </div>
          {loanType === 'hardMoney' && (
            <>
              <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                  ✓ Cash Required (What You Bring)
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
                    <span>Rehab:</span>
                    <span className="font-medium text-green-500">$0 (lender funded)</span>
                  </div>
                  <div className="flex justify-between border-t border-green-500/20 pt-1 font-semibold">
                    <span>Total Cash Required:</span>
                    <span>${calculateCashRequired().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  💰 Financing Structure
                </p>
                <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <div className="flex justify-between">
                    <span>Acquisition Loan:</span>
                    <span className="font-medium">${calculateLoanAmount().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rehab Holdback:</span>
                    <span className="font-medium">${(financial.renovationCosts || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-500/20 pt-1 font-semibold">
                    <span>Total Loan Amount:</span>
                    <span>${(calculateLoanAmount() + (financial.renovationCosts || 0)).toLocaleString()}</span>
                  </div>
                  <div className="text-xs mt-2 italic">
                    * Rehab drawn as needed during construction
                  </div>
                </div>
              </div>

              {showRenovationCosts && financial.arv && financial.arv > 0 && (
                <div className="mt-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    📊 Projected Returns
                  </p>
                  <div className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                    <div className="flex justify-between">
                      <span>ARV:</span>
                      <span className="font-medium">${financial.arv.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Project Cost:</span>
                      <span className="font-medium">${calculateTotalProjectCost().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-purple-500/20 pt-1">
                      <span>Est. Net Profit:</span>
                      <span className={`font-semibold ${calculateEstimatedProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${calculateEstimatedProfit().toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Est. ROI:</span>
                      <span className={calculateROI() >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {calculateROI().toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

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

      {/* BRRRR Refinance Section */}
      {data.strategy === 'brrrr' && financial.arv && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 p-6 mt-6">
          <h3 className="font-semibold text-primary mb-4">
            Refinance Strategy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-primary mb-3">After Stabilization</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">After Repair Value (ARV):</span>
                  <span className="font-semibold text-primary">${financial.arv?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Target LTV:</span>
                  <span className="font-semibold text-primary">{data.strategyDetails?.exitStrategy || '75'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Max Refinance Amount:</span>
                  <span className="font-bold text-accent">
                    ${Math.round((financial.arv || 0) * (parseInt(data.strategyDetails?.exitStrategy || '75') / 100)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-primary mb-3">Cash Out Potential</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Total Investment:</span>
                  <span className="font-semibold text-primary">${calculateTotalInvestment()?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Initial Loan Payoff:</span>
                  <span className="font-semibold text-primary">
                    ${Math.round(financial.purchasePrice * (1 - financial.downPaymentPercent / 100) + (financial.renovationCosts || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-2">
                  <span className="text-sm font-medium text-primary">Estimated Cash Out:</span>
                  <span className="font-bold text-green-600">
                    ${(() => {
                      const refinanceAmount = (financial.arv || 0) * (parseInt(data.strategyDetails?.exitStrategy || '75') / 100);
                      const loanPayoff = financial.purchasePrice * (1 - financial.downPaymentPercent / 100) + (financial.renovationCosts || 0);
                      const cashOut = refinanceAmount - loanPayoff;
                      return cashOut > 0 ? Math.round(cashOut).toLocaleString() : '0';
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-muted">
              <strong>BRRRR Strategy:</strong> After renovation and stabilization (typically {data.strategyDetails?.timeline || '12'} months), 
              refinance at {data.strategyDetails?.exitStrategy || '75'}% of ARV to recover most or all of your initial investment 
              while keeping the property as a long-term rental.
            </p>
          </div>
        </div>
      )}

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