'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Analysis } from '@/types';

interface ExpenseOverrides {
  propertyTax?: number;
  insurance?: number;
  maintenance?: number;
  vacancy?: number;
  propertyManagement?: number;
}

interface EditableFinancialMetricsProps {
  analysis: Analysis;
  onUpdate?: (updatedAnalysis: Analysis) => void;
}

export default function EditableFinancialMetrics({ analysis, onUpdate }: EditableFinancialMetricsProps) {
  const [isEditingRent, setIsEditingRent] = useState(false);
  const [editedRent, setEditedRent] = useState('');
  const [isEditingRentPerUnit, setIsEditingRentPerUnit] = useState(false);
  const [editedRentPerUnit, setEditedRentPerUnit] = useState('');
  const [expenseOverrides, setExpenseOverrides] = useState<ExpenseOverrides>({});
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editedExpenseValue, setEditedExpenseValue] = useState('');
  const [editingAsPercent, setEditingAsPercent] = useState(false);
  
  const isFlipStrategy = analysis.strategy === 'flip';
  const purchasePrice = analysis.purchase_price || 0;
  const downPayment = (purchasePrice * (analysis.down_payment_percent || 20)) / 100;
  
  // Get initial monthly rent from various sources
  const initialMonthlyRent = analysis.ai_analysis?.financial_metrics?.monthly_rent ||
                            analysis.rental_estimate?.rent ||
                            (analysis.rental_estimate as any)?.rentEstimate ||
                            (analysis.analysis_data as any)?.monthlyRent ||
                            0;

  const [monthlyRent, setMonthlyRent] = useState(initialMonthlyRent);

  // Get units for multi-family properties - check multiple locations
  const getUnits = (): number => {
    // Check analysis_data first (most reliable)
    if ((analysis.analysis_data as any)?.units && (analysis.analysis_data as any).units > 0) {
      return (analysis.analysis_data as any).units;
    }
    // Check property_data (RentCast API)
    const property = (analysis.property_data as any)?.property;
    if (property?.units && property.units > 0) return property.units;
    if (property?.numberOfUnits && property.numberOfUnits > 0) return property.numberOfUnits;

    // Infer from property type
    const propertyType = property?.propertyType?.toLowerCase() || '';
    if (propertyType.includes('duplex')) return 2;
    if (propertyType.includes('triplex')) return 3;
    if (propertyType.includes('fourplex') || propertyType.includes('quadplex')) return 4;
    if (propertyType.includes('multi') || propertyType.includes('apartment')) {
      // For multi-family, use bedrooms as approximation if available
      const beds = property?.bedrooms || 0;
      if (beds > 1) return beds;
      return 2; // Default to 2 for multi-family
    }

    return 1;
  };

  const units = getUnits();
  const isMultiFamily = units > 1;
  const rentPerUnit = isMultiFamily ? monthlyRent / units : monthlyRent;

  console.log('[EditableFinancialMetrics] Units detection:', {
    analysisDataUnits: (analysis.analysis_data as any)?.units,
    propertyUnits: (analysis.property_data as any)?.property?.units,
    detectedUnits: units,
    isMultiFamily,
    monthlyRent,
    rentPerUnit
  });
  
  const metrics = useMemo(() => {
    const loanAmount = purchasePrice - downPayment;
    
    if (isFlipStrategy) {
      // Fix & Flip specific calculations
      const rehabCosts = analysis.rehab_costs || 
                        (analysis as any).renovationCosts || 
                        (analysis as any).analysis_data?.rehab_costs || 
                        0;
      // Cash required: 10% down + 1.5% closing costs (hard money funds rehab)
      const dp = purchasePrice * 0.10;
      const closingCosts = Math.round(purchasePrice * 0.015);
      const totalInvestment = dp + closingCosts;
      
      const aiMetrics = analysis.ai_analysis?.financial_metrics;
      const netProfit = aiMetrics?.total_profit || 0;
      const roi = aiMetrics?.roi || 0;
      
      const estimatedARV = (analysis.property_data as any)?.comparables?.value || purchasePrice * 1.3;
      const profitMargin = estimatedARV > 0 ? (netProfit / estimatedARV) * 100 : 0;
      
      // CRITICAL: Use timeline from strategy_details, NOT loan_term
      // loan_term = loan maturity (1-2 years for hard money)
      // timeline = actual project duration for holding costs (3-12 months)
      const timelineMonths = parseInt((analysis as any).analysis_data?.strategy_details?.timeline) ||
                             parseInt((analysis as any).strategy_details?.timeline) ||
                             (analysis as any).analysis_data?.flip_timeline_months ||
                             6;

      return {
        purchasePrice,
        rehabCosts,
        totalInvestment,
        estimatedARV,
        netProfit,
        roi,
        profitMargin,
        holdingPeriod: timelineMonths / 12, // Convert months to years for display
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
    
    // Rental property calculations
    const monthlyRate = (analysis.interest_rate || 7) / 100 / 12;
    const numPayments = (analysis.loan_term || 30) * 12;
    
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    // Calculate expenses (use overrides if set, otherwise use defaults)
    const propertyTax = expenseOverrides.propertyTax ?? (purchasePrice * 0.012) / 12; // 1.2% annual
    const insurance = expenseOverrides.insurance ?? (purchasePrice * 0.004) / 12; // 0.4% annual
    const hoa = 0; // Could be added from property data
    const maintenance = expenseOverrides.maintenance ?? monthlyRent * 0.1; // 10% of rent
    const vacancy = expenseOverrides.vacancy ?? monthlyRent * 0.08; // 8% vacancy rate
    const propertyManagement = expenseOverrides.propertyManagement ?? (analysis.strategy === 'rental' ? monthlyRent * 0.08 : 0);

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
      units,
      rentPerUnit
    };
  }, [analysis, isFlipStrategy, purchasePrice, downPayment, monthlyRent, units, rentPerUnit, expenseOverrides]);

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

  const handleRentEdit = () => {
    setEditedRent(monthlyRent.toString());
    setIsEditingRent(true);
  };

  const handleRentSave = async () => {
    const newRent = parseFloat(editedRent) || 0;
    setMonthlyRent(newRent);
    setIsEditingRent(false);
    
    // Update the analysis data
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
          rentPerUnit: units > 1 ? newRent / units : newRent
        }
      };
      onUpdate(updatedAnalysis);
    }
    
    // Save to database
    try {
      const response = await fetch(`/api/analysis/${analysis.id}/update-rent`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          monthlyRent: newRent,
          rentPerUnit: units > 1 ? newRent / units : newRent
        })
      });
      
      if (!response.ok) {
        console.error('Failed to update rent');
      }
    } catch (error) {
      console.error('Error updating rent:', error);
    }
  };

  const handleRentCancel = () => {
    setIsEditingRent(false);
    setEditedRent('');
  };

  const handleRentPerUnitEdit = () => {
    setEditedRentPerUnit(rentPerUnit.toString());
    setIsEditingRentPerUnit(true);
  };

  const handleRentPerUnitSave = async () => {
    const newRentPerUnit = parseFloat(editedRentPerUnit) || 0;
    const newTotalRent = newRentPerUnit * units;
    setMonthlyRent(newTotalRent);
    setIsEditingRentPerUnit(false);
    
    // Update the analysis data
    if (onUpdate) {
      const updatedAnalysis = {
        ...analysis,
        ai_analysis: {
          ...analysis.ai_analysis,
          financial_metrics: {
            ...analysis.ai_analysis?.financial_metrics,
            monthly_rent: newTotalRent
          }
        }
      };
      onUpdate(updatedAnalysis);
    }
    
    // Save to database
    try {
      const response = await fetch(`/api/analysis/${analysis.id}/update-rent`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyRent: newTotalRent })
      });
      
      if (!response.ok) {
        console.error('Failed to update rent');
      }
    } catch (error) {
      console.error('Error updating rent:', error);
    }
  };

  const handleRentPerUnitCancel = () => {
    setIsEditingRentPerUnit(false);
    setEditedRentPerUnit('');
  };

  // Fields that support percent-of-rent editing
  const percentFields = new Set(['vacancy', 'maintenance', 'propertyManagement']);

  const handleExpenseEdit = (field: string, currentValue: number, asPercent: boolean) => {
    setEditingExpense(field);
    setEditingAsPercent(asPercent);
    if (asPercent && monthlyRent > 0) {
      setEditedExpenseValue(((currentValue / monthlyRent) * 100).toFixed(1));
    } else {
      setEditedExpenseValue(Math.round(currentValue).toString());
    }
  };

  const handleExpenseSave = (field: string) => {
    const parsed = parseFloat(editedExpenseValue);
    if (!isNaN(parsed) && parsed >= 0) {
      const dollarValue = editingAsPercent ? (parsed / 100) * monthlyRent : parsed;
      setExpenseOverrides(prev => ({ ...prev, [field]: dollarValue }));
    }
    setEditingExpense(null);
    setEditedExpenseValue('');
    setEditingAsPercent(false);
  };

  const handleExpenseCancel = () => {
    setEditingExpense(null);
    setEditedExpenseValue('');
    setEditingAsPercent(false);
  };

  const handleExpenseReset = (field: string) => {
    setExpenseOverrides(prev => {
      const next = { ...prev };
      delete next[field as keyof ExpenseOverrides];
      return next;
    });
  };

  const renderEditableExpense = (label: string, field: string, value: number) => {
    const isEditing = editingExpense === field;
    const isOverridden = field in expenseOverrides;
    const supportsPercent = percentFields.has(field);
    const currentPercent = monthlyRent > 0 ? (value / monthlyRent) * 100 : 0;

    return (
      <div key={field} className="flex justify-between items-center py-2 border-b border-border/50">
        <span className="text-muted">
          {label}
          {!isEditing && supportsPercent && (
            <span className="text-xs ml-1">({currentPercent.toFixed(1)}%)</span>
          )}
          {isOverridden && (
            <button
              onClick={() => handleExpenseReset(field)}
              className="text-xs text-blue-500 hover:text-blue-600 ml-1"
              title="Reset to default"
            >
              (reset)
            </button>
          )}
        </span>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              {supportsPercent && (
                <button
                  onClick={() => {
                    const currentVal = parseFloat(editedExpenseValue) || 0;
                    if (editingAsPercent) {
                      setEditingAsPercent(false);
                      setEditedExpenseValue(Math.round((currentVal / 100) * monthlyRent).toString());
                    } else {
                      setEditingAsPercent(true);
                      setEditedExpenseValue(monthlyRent > 0 ? ((currentVal / monthlyRent) * 100).toFixed(1) : '0');
                    }
                  }}
                  className="text-xs px-1.5 py-0.5 rounded border border-border hover:border-primary text-muted hover:text-primary transition-colors"
                  title={editingAsPercent ? 'Switch to dollar amount' : 'Switch to percentage'}
                >
                  {editingAsPercent ? '%→$' : '$→%'}
                </button>
              )}
              <span className="text-red-600 text-sm">{editingAsPercent ? '%' : '$'}</span>
              <input
                type="text"
                inputMode="decimal"
                value={editedExpenseValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    setEditedExpenseValue(val);
                  }
                }}
                className="w-28 px-2 py-1 border border-primary rounded text-right"
                autoFocus
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExpenseSave(field);
                  if (e.key === 'Escape') handleExpenseCancel();
                }}
              />
              <button
                onClick={() => handleExpenseSave(field)}
                className="text-green-600 hover:text-green-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleExpenseCancel}
                className="text-red-600 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <span className={`font-medium text-red-600 ${isOverridden ? 'underline decoration-dotted' : ''}`}>
                -{formatCurrency(value)}
              </span>
              {supportsPercent ? (
                <span className="flex items-center gap-0.5">
                  <button
                    onClick={() => handleExpenseEdit(field, value, true)}
                    className="text-muted hover:text-primary text-xs px-1"
                    title="Edit as percentage"
                  >
                    %
                  </button>
                  <button
                    onClick={() => handleExpenseEdit(field, value, false)}
                    className="text-muted hover:text-primary text-xs px-1"
                    title="Edit as dollar amount"
                  >
                    $
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => handleExpenseEdit(field, value, false)}
                  className="text-muted hover:text-primary"
                  title="Edit this expense"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
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

      {/* Income & Expenses Breakdown - Only for rental properties */}
      {!isFlipStrategy && (
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
                      <input
                        type="text"
                        inputMode="decimal"
                        value={editedRent}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*\.?\d*$/.test(val)) {
                            setEditedRent(val);
                          }
                        }}
                        className="w-28 px-2 py-1 border border-primary rounded text-right"
                        autoFocus
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRentSave();
                          if (e.key === 'Escape') handleRentCancel();
                        }}
                      />
                      <button
                        onClick={handleRentSave}
                        className="text-green-600 hover:text-green-700"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleRentCancel}
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
                        onClick={handleRentEdit}
                        className="text-muted hover:text-primary disabled:opacity-50"
                        disabled={isEditingRentPerUnit}
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
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editedRentPerUnit}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^\d*\.?\d*$/.test(val)) {
                              setEditedRentPerUnit(val);
                            }
                          }}
                          className="w-24 px-2 py-1 border border-primary rounded text-right text-sm"
                          autoFocus
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRentPerUnitSave();
                            if (e.key === 'Escape') handleRentPerUnitCancel();
                          }}
                        />
                        <button
                          onClick={handleRentPerUnitSave}
                          className="text-green-600 hover:text-green-700"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleRentPerUnitCancel}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-primary">
                          {formatCurrency(Math.round(rentPerUnit))}
                        </span>
                        <button
                          onClick={handleRentPerUnitEdit}
                          className="text-muted hover:text-primary disabled:opacity-50"
                          disabled={isEditingRent}
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
              {renderEditableExpense('Property Tax', 'propertyTax', metrics.propertyTax)}
              {renderEditableExpense('Insurance', 'insurance', metrics.insurance)}
              {renderEditableExpense('Maintenance', 'maintenance', metrics.maintenance)}
              {renderEditableExpense('Vacancy', 'vacancy', metrics.vacancy)}
              {(metrics.propertyManagement > 0 || expenseOverrides.propertyManagement !== undefined) &&
                renderEditableExpense('Property Mgmt', 'propertyManagement', metrics.propertyManagement)
              }
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