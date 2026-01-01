'use client';

import { useMemo, useState, useCallback } from 'react';
import type { Analysis } from '@/types';
import { calculateFlipReturns, type FlipCalculationInputs } from '@/utils/financial-calculations';

interface FinancialMetricsProps {
  analysis: Analysis;
  onUpdate?: (updatedAnalysis: Analysis) => void;
}

export default function FinancialMetrics({ analysis, onUpdate }: FinancialMetricsProps) {
  const isFlipStrategy = analysis.strategy === 'flip';
  const purchasePrice = analysis.purchase_price || 0;
  const downPayment = (purchasePrice * (analysis.down_payment_percent || 20)) / 100;

  // Inline rent editing state
  const [isEditingRent, setIsEditingRent] = useState(false);
  const [isEditingRentPerUnit, setIsEditingRentPerUnit] = useState(false);
  const [editedRent, setEditedRent] = useState('');
  const [editedRentPerUnit, setEditedRentPerUnit] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Get initial rent value
  const initialMonthlyRent = analysis.ai_analysis?.financial_metrics?.monthly_rent ||
                            analysis.rental_estimate?.rent ||
                            (analysis.rental_estimate as any)?.rentEstimate ||
                            (analysis.analysis_data as any)?.monthlyRent ||
                            0;
  const [currentRent, setCurrentRent] = useState(initialMonthlyRent);

  // Get units for multi-family
  const getUnits = (): number => {
    if ((analysis.analysis_data as any)?.units && (analysis.analysis_data as any).units > 0) {
      return (analysis.analysis_data as any).units;
    }
    const property = (analysis.property_data as any)?.property;
    if (property?.units && property.units > 0) return property.units;
    if (property?.numberOfUnits && property.numberOfUnits > 0) return property.numberOfUnits;
    const propertyType = property?.propertyType?.toLowerCase() || '';
    if (propertyType.includes('duplex')) return 2;
    if (propertyType.includes('triplex')) return 3;
    if (propertyType.includes('fourplex') || propertyType.includes('quadplex')) return 4;
    if (propertyType.includes('multi') || propertyType.includes('apartment')) {
      const beds = property?.bedrooms || 0;
      if (beds > 1) return beds;
      return 2;
    }
    return 1;
  };

  const units = getUnits();
  const isMultiFamily = units > 1;
  const currentRentPerUnit = isMultiFamily ? currentRent / units : currentRent;

  // Save rent to database
  const saveRent = useCallback(async (newRent: number, newRentPerUnit?: number) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/analysis/${analysis.id}/update-rent`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyRent: newRent,
          rentPerUnit: newRentPerUnit || (isMultiFamily ? newRent / units : newRent)
        })
      });

      if (!response.ok) {
        console.error('Failed to save rent');
        return false;
      }

      // Update parent if callback provided
      if (onUpdate) {
        const updatedAnalysis = {
          ...analysis,
          ai_analysis: {
            ...analysis.ai_analysis,
            financial_metrics: {
              ...analysis.ai_analysis?.financial_metrics,
              monthly_rent: newRent
            }
          },
          analysis_data: {
            ...analysis.analysis_data,
            monthlyRent: newRent,
            rentPerUnit: newRentPerUnit || (isMultiFamily ? newRent / units : newRent)
          }
        };
        onUpdate(updatedAnalysis);
      }

      return true;
    } catch (error) {
      console.error('Error saving rent:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [analysis, onUpdate, isMultiFamily, units]);

  // Handle rent edit
  const handleRentSave = async () => {
    const newRent = parseFloat(editedRent) || 0;
    if (newRent > 0) {
      const success = await saveRent(newRent);
      if (success) {
        setCurrentRent(newRent);
      }
    }
    setIsEditingRent(false);
    setEditedRent('');
  };

  // Handle rent per unit edit
  const handleRentPerUnitSave = async () => {
    const newRentPerUnit = parseFloat(editedRentPerUnit) || 0;
    if (newRentPerUnit > 0) {
      const newTotalRent = newRentPerUnit * units;
      const success = await saveRent(newTotalRent, newRentPerUnit);
      if (success) {
        setCurrentRent(newTotalRent);
      }
    }
    setIsEditingRentPerUnit(false);
    setEditedRentPerUnit('');
  };

  const metrics = useMemo(() => {
    const loanAmount = purchasePrice - downPayment;

    if (isFlipStrategy) {
      // Fix & Flip specific calculations
      // Try multiple locations for rehab costs
      const rehabCosts = analysis.rehab_costs ||
                        (analysis as any).renovationCosts ||
                        (analysis as any).analysis_data?.rehab_costs ||
                        0;

      // Get metrics from AI analysis if available
      // CRITICAL FIX: Check multiple locations for profit and ROI
      // Data can be at top level (from DB) or nested in ai_analysis.financial_metrics
      const aiMetrics = analysis.ai_analysis?.financial_metrics;
      let netProfit = (analysis as any).profit ||
                       aiMetrics?.total_profit ||
                       aiMetrics?.net_profit ||
                       (analysis as any).analysis_data?.profit ||
                       0;
      let roi = (analysis as any).roi ||
                 aiMetrics?.roi ||
                 (analysis as any).analysis_data?.roi ||
                 0;

      console.log('[FinancialMetrics] Flip metrics debug:', {
        topLevelProfit: (analysis as any).profit,
        topLevelRoi: (analysis as any).roi,
        aiMetricsProfit: aiMetrics?.total_profit,
        aiMetricsRoi: aiMetrics?.roi,
        initialNetProfit: netProfit,
        initialRoi: roi
      });

      // CRITICAL FIX: ARV must be HIGHER than purchase price for flip profitability
      // ARV = After Repair Value = what property will sell for AFTER renovations
      // The comparables.value is current AVM, NOT the post-renovation ARV
      let estimatedARV = (aiMetrics as any)?.arv ||
                        (analysis as any).analysis_data?.arv ||
                        (analysis as any).analysis_data?.strategy_details?.arv ||
                        (analysis.property_data as any)?.comparables?.value ||
                        0;

      // Renovation level multipliers for ARV calculation
      const renovationLevel = (analysis as any).strategy_details?.renovationLevel ||
                             (analysis as any).strategyDetails?.renovationLevel ||
                             (analysis as any).analysis_data?.strategy_details?.renovationLevel ||
                             'moderate';
      const renovationMultipliers: Record<string, number> = {
        cosmetic: 1.12,
        moderate: 1.18,
        extensive: 1.25,
        gut: 1.35
      };
      const multiplier = renovationMultipliers[renovationLevel] || 1.18;

      // CRITICAL VALIDATION: ARV must be at least 15% higher than purchase price for flips
      if (estimatedARV <= purchasePrice) {
        console.log('[FinancialMetrics] WARNING: ARV <= purchase price, recalculating');
        // Calculate proper ARV based on purchase price + renovation value
        estimatedARV = Math.round(purchasePrice * multiplier);
      } else if (estimatedARV < purchasePrice * 1.15) {
        // If ARV is barely above purchase price, adjust it
        console.log('[FinancialMetrics] WARNING: ARV too close to purchase price, adjusting');
        estimatedARV = Math.round(purchasePrice * multiplier);
      }

      console.log('[FinancialMetrics] ARV Calculation:', {
        originalARV: (analysis.property_data as any)?.comparables?.value,
        renovationLevel,
        multiplier,
        purchasePrice,
        finalARV: estimatedARV,
        arvIsValid: estimatedARV > purchasePrice
      });

      // CRITICAL FIX: If netProfit or ROI is 0 but we have valid inputs, recalculate
      // This handles cases where the DB update failed or values weren't saved properly
      if ((netProfit === 0 || roi === 0) && purchasePrice > 0 && estimatedARV > purchasePrice) {
        console.log('[FinancialMetrics] RECALCULATING: netProfit or ROI is 0, using centralized calculator');

        // Get loan details from analysis data
        const interestRate = analysis.interest_rate ||
                            (analysis as any).analysis_data?.interest_rate ||
                            10.45;
        // CRITICAL: Use timeline from strategy_details, NOT loan_term
        // loan_term = loan maturity (1-2 years for hard money)
        // timeline = actual project duration for holding costs (3-12 months)
        const holdingMonths = parseInt((analysis as any).analysis_data?.strategy_details?.timeline) ||
                              parseInt((analysis as any).strategy_details?.timeline) ||
                              (analysis as any).analysis_data?.flip_timeline_months ||
                              6;
        const points = (analysis as any).analysis_data?.loan_terms?.points || 2.5;
        const loanType = (analysis as any).analysis_data?.loan_terms?.loanType || 'hardMoney';

        const flipInputs: FlipCalculationInputs = {
          purchasePrice,
          downPaymentPercent: analysis.down_payment_percent || 20,
          interestRate,
          loanTermYears: 1,
          renovationCosts: rehabCosts,
          arv: estimatedARV,
          holdingPeriodMonths: holdingMonths,
          loanType: loanType as 'conventional' | 'hardMoney',
          points,
          isHardMoney: loanType === 'hardMoney' || points >= 2
        };

        console.log('[FinancialMetrics] Recalculating with inputs:', flipInputs);

        const flipResults = calculateFlipReturns(flipInputs);

        console.log('[FinancialMetrics] Recalculated results:', {
          netProfit: flipResults.netProfit,
          roi: flipResults.roi,
          profitMargin: flipResults.profitMargin,
          isValid: flipResults.validation.isValid
        });

        // Use recalculated values
        netProfit = flipResults.netProfit;
        roi = flipResults.roi;

        // Also get proper investment values from the calculator
        const totalInvestment = flipResults.cashRequired;
        const profitMargin = flipResults.profitMargin;

        return {
          purchasePrice,
          rehabCosts,
          totalInvestment,
          estimatedARV,
          netProfit,
          roi,
          profitMargin,
          holdingPeriod: holdingMonths / 12,
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

      // Calculate values using stored data (original path when values are present)
      const closingCosts = purchasePrice * 0.03;
      const totalInvestment = downPayment + rehabCosts + closingCosts;
      const profitMargin = estimatedARV > 0 ? (netProfit / estimatedARV) * 100 : 0;

      return {
        purchasePrice,
        rehabCosts,
        totalInvestment,
        estimatedARV,
        netProfit,
        roi,
        profitMargin,
        // CRITICAL: Use timeline from strategy_details, NOT loan_term
        holdingPeriod: (parseInt((analysis as any).analysis_data?.strategy_details?.timeline) ||
                       parseInt((analysis as any).strategy_details?.timeline) ||
                       (analysis as any).analysis_data?.flip_timeline_months ||
                       6) / 12, // Convert months to years for display
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

    // Use currentRent (which can be edited) instead of the original value
    const monthlyRent = currentRent;
    const rentPerUnit = isMultiFamily ? monthlyRent / units : monthlyRent;

    console.log('[FinancialMetrics] Using rent:', { monthlyRent, units, rentPerUnit, isMultiFamily });

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
      propertyManagement,
      rentPerUnit
    };
  }, [analysis, isFlipStrategy, purchasePrice, downPayment, currentRent, isMultiFamily, units]);

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
                <span className="text-muted">
                  Rental Income
                  {isMultiFamily && (
                    <span className="text-xs ml-1">({units} units)</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {isEditingRent ? (
                    <>
                      <span className="text-muted">$</span>
                      <input
                        type="number"
                        value={editedRent}
                        onChange={(e) => setEditedRent(e.target.value)}
                        className="w-24 px-2 py-1 border border-primary rounded text-right text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleRentSave()}
                      />
                      <button
                        onClick={handleRentSave}
                        disabled={isSaving}
                        className="text-green-600 hover:text-green-700 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => { setIsEditingRent(false); setEditedRent(''); }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(metrics.monthlyRent)}
                      </span>
                      <button
                        onClick={() => { setEditedRent(metrics.monthlyRent.toString()); setIsEditingRent(true); }}
                        className="text-muted hover:text-primary p-1 rounded hover:bg-muted/20"
                        title="Edit rent"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isMultiFamily && (
                <div className="flex justify-between items-center py-1 text-sm">
                  <span className="text-muted">Per Unit</span>
                  <div className="flex items-center gap-2">
                    {isEditingRentPerUnit ? (
                      <>
                        <span className="text-muted text-xs">$</span>
                        <input
                          type="number"
                          value={editedRentPerUnit}
                          onChange={(e) => setEditedRentPerUnit(e.target.value)}
                          className="w-20 px-2 py-1 border border-primary rounded text-right text-xs"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleRentPerUnitSave()}
                        />
                        <button
                          onClick={handleRentPerUnitSave}
                          disabled={isSaving}
                          className="text-green-600 hover:text-green-700 disabled:opacity-50"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => { setIsEditingRentPerUnit(false); setEditedRentPerUnit(''); }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-primary">{formatCurrency(Math.round(metrics.rentPerUnit))}</span>
                        <button
                          onClick={() => { setEditedRentPerUnit(Math.round(metrics.rentPerUnit).toString()); setIsEditingRentPerUnit(true); }}
                          className="text-muted hover:text-primary p-0.5 rounded hover:bg-muted/20"
                          title="Edit rent per unit"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
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