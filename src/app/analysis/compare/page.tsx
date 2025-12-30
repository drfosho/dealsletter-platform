'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/property-search/LoadingSpinner';
import type { Analysis } from '@/types';

// Loading fallback component
function ComparisonLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <LoadingSpinner text="Loading comparison data..." />
      </main>
    </div>
  );
}

// Normalize analysis data to handle various field name conventions
function normalizeAnalysis(raw: any): any {
  const analysisData = raw.analysis_data || {};
  const aiMetrics = raw.ai_analysis?.financial_metrics || {};
  const nestedAiMetrics = analysisData?.ai_analysis?.financial_metrics || {};

  // Property data can be stored in multiple locations and formats
  // It can be an array (from RentCast API) or a single object
  const propertyDataContainer = raw.property_data || analysisData?.property_data || {};
  const propertyDataProperty = propertyDataContainer?.property;

  // Handle both array and object formats for property data
  const propData = Array.isArray(propertyDataProperty)
    ? propertyDataProperty[0] || {}
    : propertyDataProperty || {};

  // Also check for direct listing data
  const listingData = propertyDataContainer?.listing || {};

  // Comparables data for ARV extraction
  const comparablesData = analysisData?.comparables || raw.comparables || propertyDataContainer?.comparables || {};

  console.log('[Comparison] Raw data structure for', raw.address, {
    hasAnalysisData: !!raw.analysis_data,
    hasPropertyData: !!raw.property_data,
    hasNestedPropertyData: !!analysisData?.property_data,
    propertyDataKeys: Object.keys(propertyDataContainer),
    propDataKeys: Object.keys(propData),
    listingDataKeys: Object.keys(listingData),
    aiMetricsKeys: Object.keys(aiMetrics),
    nestedAiMetricsKeys: Object.keys(nestedAiMetrics)
  });

  // Helper to get value from multiple sources, skipping 0 for non-numeric defaults
  const getValue = (...sources: any[]): any => {
    for (const source of sources) {
      if (source !== undefined && source !== null && source !== '' && !Number.isNaN(source)) {
        return source;
      }
    }
    return undefined;
  };

  // Helper specifically for numeric values where 0 is a valid value
  const getNumericValue = (...sources: any[]): number | undefined => {
    for (const source of sources) {
      const num = Number(source);
      if (!Number.isNaN(num) && source !== undefined && source !== null && source !== '') {
        return num;
      }
    }
    return undefined;
  };

  // Extract property details from all possible locations
  const bedrooms = getNumericValue(
    propData?.bedrooms,
    listingData?.bedrooms,
    analysisData?.bedrooms,
    raw.bedrooms,
    analysisData?.property_details?.bedrooms
  );

  const bathrooms = getNumericValue(
    propData?.bathrooms,
    listingData?.bathrooms,
    analysisData?.bathrooms,
    raw.bathrooms,
    analysisData?.property_details?.bathrooms
  );

  const squareFeet = getNumericValue(
    propData?.squareFootage,
    propData?.sqft,
    listingData?.squareFootage,
    listingData?.sqft,
    analysisData?.squareFootage,
    analysisData?.sqft,
    raw.square_feet,
    analysisData?.property_details?.squareFootage
  );

  const yearBuilt = getNumericValue(
    propData?.yearBuilt,
    listingData?.yearBuilt,
    analysisData?.yearBuilt,
    raw.year_built,
    analysisData?.property_details?.yearBuilt
  );

  const propertyType = getValue(
    propData?.propertyType,
    listingData?.propertyType,
    analysisData?.propertyType,
    raw.property_type,
    analysisData?.property_details?.propertyType
  );

  const numberOfUnits = getNumericValue(
    propData?.units,
    listingData?.units,
    analysisData?.units,
    analysisData?.numberOfUnits,
    raw.number_of_units
  ) || 1;

  // Financial inputs
  const purchasePrice = getNumericValue(
    raw.purchase_price,
    analysisData?.purchase_price,
    analysisData?.purchasePrice
  );

  const downPaymentPercent = getNumericValue(
    raw.down_payment_percent,
    analysisData?.down_payment_percent,
    analysisData?.downPaymentPercent
  ) || 20;

  const interestRate = getNumericValue(
    raw.interest_rate,
    analysisData?.interest_rate,
    analysisData?.interestRate
  ) || 7;

  const loanTerm = getNumericValue(
    raw.loan_term,
    analysisData?.loan_term,
    analysisData?.loanTerm
  ) || 30;

  const rehabCosts = getNumericValue(
    raw.rehab_costs,
    analysisData?.rehab_costs,
    analysisData?.rehabCosts,
    analysisData?.renovationCosts
  ) || 0;

  // Financial metrics - check ALL possible locations
  const roi = getNumericValue(
    raw.roi,
    aiMetrics?.roi,
    nestedAiMetrics?.roi,
    analysisData?.roi
  );

  const profit = getNumericValue(
    raw.profit,
    aiMetrics?.net_profit,
    aiMetrics?.total_profit,
    nestedAiMetrics?.net_profit,
    nestedAiMetrics?.total_profit,
    analysisData?.profit,
    analysisData?.netProfit,
    analysisData?.net_profit
  );

  const monthlyCashFlow = getNumericValue(
    aiMetrics?.monthly_cash_flow,
    nestedAiMetrics?.monthly_cash_flow,
    analysisData?.monthly_cash_flow,
    analysisData?.monthlyCashFlow
  );

  const capRate = getNumericValue(
    aiMetrics?.cap_rate,
    nestedAiMetrics?.cap_rate,
    analysisData?.cap_rate,
    analysisData?.capRate
  );

  const cashOnCash = getNumericValue(
    aiMetrics?.cash_on_cash_return,
    nestedAiMetrics?.cash_on_cash_return,
    analysisData?.cash_on_cash_return,
    analysisData?.cashOnCash,
    analysisData?.cash_on_cash
  );

  const monthlyRent = getNumericValue(
    aiMetrics?.monthly_rent,
    nestedAiMetrics?.monthly_rent,
    analysisData?.monthly_rent,
    analysisData?.monthlyRent,
    analysisData?.rentPerUnit ? analysisData.rentPerUnit * numberOfUnits : undefined
  );

  // Total investment - calculate if not available
  let totalInvestment = getNumericValue(
    aiMetrics?.total_investment,
    nestedAiMetrics?.total_investment,
    analysisData?.total_investment,
    analysisData?.totalInvestment,
    aiMetrics?.cash_required,
    nestedAiMetrics?.cash_required,
    analysisData?.cash_required
  );

  // Calculate total investment if not available
  if (!totalInvestment && purchasePrice) {
    const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
    const closingCosts = purchasePrice * 0.03; // Estimate 3% closing costs
    totalInvestment = downPaymentAmount + rehabCosts + closingCosts;
  }

  // ARV - check multiple locations including comparables
  const arv = getNumericValue(
    aiMetrics?.arv,
    nestedAiMetrics?.arv,
    analysisData?.arv,
    comparablesData?.value,
    comparablesData?.medianValue,
    // For flips, ARV might be stored as after_repair_value
    analysisData?.after_repair_value,
    analysisData?.afterRepairValue
  );

  const normalized = {
    // Basic info
    id: raw.id,
    address: raw.address || analysisData?.address || 'Unknown Address',
    strategy: raw.strategy || analysisData?.strategy || 'rental',
    created_at: raw.created_at || raw.analysis_date,

    // Property details
    bedrooms,
    bathrooms,
    squareFeet,
    yearBuilt,
    propertyType,
    numberOfUnits,

    // Financial inputs
    purchasePrice,
    downPaymentPercent,
    interestRate,
    loanTerm,
    rehabCosts,

    // Financial metrics
    roi,
    profit,
    netProfit: profit,
    monthlyCashFlow,
    capRate,
    cashOnCash,
    monthlyRent,
    totalInvestment,
    arv,

    // Keep original data for fallback access
    _raw: raw,
    ai_analysis: raw.ai_analysis || analysisData?.ai_analysis,
    analysis_data: analysisData
  };

  console.log('[Comparison] Normalized analysis:', normalized.address, {
    bedrooms: normalized.bedrooms,
    bathrooms: normalized.bathrooms,
    squareFeet: normalized.squareFeet,
    propertyType: normalized.propertyType,
    purchasePrice: normalized.purchasePrice,
    roi: normalized.roi,
    profit: normalized.profit,
    monthlyCashFlow: normalized.monthlyCashFlow,
    totalInvestment: normalized.totalInvestment,
    arv: normalized.arv
  });

  return normalized;
}

// Main comparison content component that uses useSearchParams
function ComparisonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let analysisIds: string[] = [];

      const idsParam = searchParams.get('ids');
      if (idsParam) {
        analysisIds = idsParam.split(',').filter(id => id.trim());
      } else {
        const storedData = sessionStorage.getItem('comparison-data');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          analysisIds = parsed.analyses || [];
          sessionStorage.removeItem('comparison-data');
        }
      }

      if (analysisIds.length === 0) {
        setError('No properties selected for comparison');
        setLoading(false);
        return;
      }

      console.log('[Comparison] Loading analyses:', analysisIds);

      const fetchPromises = analysisIds.map(async (id) => {
        const response = await fetch(`/api/analysis/${id}`);
        if (!response.ok) {
          console.error(`Failed to fetch analysis ${id}`);
          return null;
        }
        return response.json();
      });

      const results = await Promise.all(fetchPromises);
      const validResults = results.filter((a) => a !== null);

      if (validResults.length === 0) {
        setError('Could not load any of the selected properties');
      } else {
        // Normalize all analyses for consistent data access
        const normalizedAnalyses = validResults.map(normalizeAnalysis);
        console.log('[Comparison] All normalized analyses:', normalizedAnalyses);
        setAnalyses(normalizedAnalyses);
      }
    } catch (err) {
      console.error('Error loading comparison data:', err);
      setError('Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  // Safe format functions that handle NaN and undefined
  // Returns '—' for missing data (undefined/null) and actual formatted value for valid numbers including 0
  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) {
      return '—'; // No data available
    }
    const num = Number(value);
    if (Number.isNaN(num)) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatPercent = (value: number | undefined | null, decimals = 1): string => {
    if (value === undefined || value === null) {
      return '—'; // No data available
    }
    const num = Number(value);
    if (Number.isNaN(num)) return '—';
    return `${num.toFixed(decimals)}%`;
  };

  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) {
      return '—'; // No data available
    }
    const num = Number(value);
    if (Number.isNaN(num)) return '—';
    return num.toLocaleString();
  };

  const getStrategyLabel = (strategy: string) => {
    const labels: Record<string, string> = {
      flip: 'Fix & Flip',
      brrrr: 'BRRRR Strategy',
      rental: 'Buy & Hold',
      'house-hack': 'House Hack',
      commercial: 'Commercial'
    };
    return labels[strategy] || strategy || 'Unknown';
  };

  const getStrategyIcon = (strategy: string) => {
    const icons: Record<string, string> = {
      flip: '🔨',
      brrrr: '♻️',
      rental: '🏘️',
      'house-hack': '🏡',
      commercial: '🏢'
    };
    return icons[strategy] || '📊';
  };

  // Find best value in array (higher is better by default)
  // IMPORTANT: Excludes 0 values from being considered "best" - only positive values can win
  const getBestValue = (values: (number | undefined)[], higherIsBetter = true): number | undefined => {
    // Filter out undefined, null, NaN, AND zero values for "best" determination
    const validValues = values.filter((v): v is number =>
      v !== undefined &&
      v !== null &&
      !Number.isNaN(v) &&
      v !== 0 // Don't consider 0 as a valid "best" value
    );
    if (validValues.length === 0) return undefined;
    // For "higher is better", only consider positive values
    // For "lower is better", we allow any non-zero value
    if (higherIsBetter) {
      const positiveValues = validValues.filter(v => v > 0);
      if (positiveValues.length === 0) return undefined;
      return Math.max(...positiveValues);
    }
    return Math.min(...validValues);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <LoadingSpinner text="Loading comparison data..." />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">{error}</h3>
            <p className="text-muted mb-4">Please select properties from your analysis history to compare</p>
            <button
              onClick={() => router.push('/analysis/history')}
              className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90"
            >
              Go to Analysis History
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Calculate best values for highlighting
  const profitValues = analyses.map(a => a.profit);
  const roiValues = analyses.map(a => a.roi);
  const cashFlowValues = analyses.map(a => a.monthlyCashFlow);
  const capRateValues = analyses.map(a => a.capRate);
  const cocValues = analyses.map(a => a.cashOnCash);

  const bestProfit = getBestValue(profitValues);
  const bestRoi = getBestValue(roiValues);
  const bestCashFlow = getBestValue(cashFlowValues);
  const bestCapRate = getBestValue(capRateValues);
  const bestCoC = getBestValue(cocValues);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/analysis/history')}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to History
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">
            Property Comparison
          </h1>
          <p className="text-muted">
            Comparing {analyses.length} properties side by side
          </p>
        </div>

        {/* Property Cards Overview */}
        <div className={`grid gap-4 mb-8 ${
          analyses.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
          analyses.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {analyses.map((analysis) => (
            <div key={analysis.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{getStrategyIcon(analysis.strategy)}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  analysis.strategy === 'flip' ? 'bg-orange-500/20 text-orange-500' :
                  analysis.strategy === 'brrrr' ? 'bg-purple-500/20 text-purple-500' :
                  analysis.strategy === 'rental' ? 'bg-green-500/20 text-green-500' :
                  analysis.strategy === 'house-hack' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-gray-500/20 text-gray-500'
                }`}>
                  {getStrategyLabel(analysis.strategy)}
                </span>
              </div>

              <h3 className="font-semibold text-primary mb-1 line-clamp-2">
                {analysis.address}
              </h3>
              <p className="text-sm text-muted mb-4">
                {analysis.bedrooms || '—'}bd • {analysis.bathrooms || '—'}ba • {analysis.squareFeet ? formatNumber(analysis.squareFeet) + ' sqft' : '— sqft'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted mb-1">Price</p>
                  <p className="font-semibold text-primary">{formatCurrency(analysis.purchasePrice)}</p>
                </div>
                <div className="bg-muted/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted mb-1">Profit</p>
                  <p className={`font-semibold ${(analysis.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(analysis.profit)}
                  </p>
                </div>
                <div className="bg-muted/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted mb-1">ROI</p>
                  <p className="font-semibold text-primary">{formatPercent(analysis.roi)}</p>
                </div>
                <div className="bg-muted/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted mb-1">Down Payment</p>
                  <p className="font-semibold text-primary">{analysis.downPaymentPercent || 20}%</p>
                </div>
              </div>

              <button
                onClick={() => router.push(`/analysis/results/${analysis.id}`)}
                className="w-full mt-4 px-4 py-2 text-sm border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-colors"
              >
                View Full Analysis
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Tables */}
        <div className="space-y-8">
          {/* Property Details Table */}
          <ComparisonSection title="Property Details">
            <ComparisonTable
              analyses={analyses}
              rows={[
                { label: 'Property Type', getValue: (a) => a.propertyType || '—' },
                { label: 'Bedrooms', getValue: (a) => a.bedrooms || '—' },
                { label: 'Bathrooms', getValue: (a) => a.bathrooms || '—' },
                { label: 'Square Feet', getValue: (a) => a.squareFeet ? formatNumber(a.squareFeet) : '—' },
                { label: 'Year Built', getValue: (a) => a.yearBuilt || '—' },
                { label: 'Units', getValue: (a) => a.numberOfUnits || '1' },
              ]}
            />
          </ComparisonSection>

          {/* Investment Strategy Table */}
          <ComparisonSection title="Investment Strategy">
            <ComparisonTable
              analyses={analyses}
              rows={[
                { label: 'Strategy', getValue: (a) => getStrategyLabel(a.strategy) },
                { label: 'Purchase Price', getValue: (a) => formatCurrency(a.purchasePrice) },
                { label: 'Down Payment', getValue: (a) => `${a.downPaymentPercent || 20}%` },
                { label: 'Interest Rate', getValue: (a) => formatPercent(a.interestRate) },
                { label: 'Loan Term', getValue: (a) => `${a.loanTerm || 30} years` },
                { label: 'Rehab Costs', getValue: (a) => formatCurrency(a.rehabCosts) },
              ]}
            />
          </ComparisonSection>

          {/* Financial Performance Table */}
          <ComparisonSection title="Financial Performance">
            <ComparisonTable
              analyses={analyses}
              rows={[
                {
                  label: 'Net Profit',
                  getValue: (a) => formatCurrency(a.profit),
                  // Only mark as best if value is positive and matches best
                  isBest: (a) => a.profit !== undefined && a.profit > 0 && a.profit === bestProfit,
                  highlight: true
                },
                {
                  label: 'ROI',
                  getValue: (a) => formatPercent(a.roi),
                  // Only mark as best if value is positive and matches best
                  isBest: (a) => a.roi !== undefined && a.roi > 0 && a.roi === bestRoi,
                  highlight: true
                },
                {
                  label: 'Monthly Cash Flow',
                  getValue: (a) => formatCurrency(a.monthlyCashFlow),
                  // Only mark as best if value is positive and matches best
                  isBest: (a) => a.monthlyCashFlow !== undefined && a.monthlyCashFlow > 0 && a.monthlyCashFlow === bestCashFlow,
                  highlight: true
                },
                {
                  label: 'Cap Rate',
                  getValue: (a) => formatPercent(a.capRate),
                  // Only mark as best if value is positive and matches best
                  isBest: (a) => a.capRate !== undefined && a.capRate > 0 && a.capRate === bestCapRate,
                  highlight: true
                },
                {
                  label: 'Cash-on-Cash Return',
                  getValue: (a) => formatPercent(a.cashOnCash),
                  // Only mark as best if value is positive and matches best
                  isBest: (a) => a.cashOnCash !== undefined && a.cashOnCash > 0 && a.cashOnCash === bestCoC,
                  highlight: true
                },
                {
                  label: 'Total Investment',
                  getValue: (a) => formatCurrency(a.totalInvestment),
                },
                {
                  label: 'Monthly Rent',
                  getValue: (a) => formatCurrency(a.monthlyRent),
                },
                {
                  label: 'ARV',
                  getValue: (a) => formatCurrency(a.arv),
                },
              ]}
            />
          </ComparisonSection>

          {/* Visual Comparison Charts */}
          <ComparisonSection title="Visual Comparison">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profit Comparison */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h4 className="font-semibold text-primary mb-4">Net Profit Comparison</h4>
                <div className="space-y-4">
                  {analyses.map((analysis) => {
                    const profit = analysis.profit || 0;
                    const maxProfit = Math.max(...analyses.map(a => Math.abs(a.profit || 0)), 1);
                    const percentage = (Math.abs(profit) / maxProfit) * 100;

                    return (
                      <div key={analysis.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted truncate max-w-[200px]">
                            {analysis.address?.split(',')[0]}
                          </span>
                          <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(profit)}
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ROI Comparison */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h4 className="font-semibold text-primary mb-4">ROI Comparison</h4>
                <div className="space-y-4">
                  {analyses.map((analysis) => {
                    const roi = analysis.roi || 0;
                    const maxRoi = Math.max(...analyses.map(a => Math.abs(a.roi || 0)), 1);
                    const percentage = (Math.abs(roi) / maxRoi) * 100;

                    return (
                      <div key={analysis.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted truncate max-w-[200px]">
                            {analysis.address?.split(',')[0]}
                          </span>
                          <span className={`font-medium ${roi >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                            {formatPercent(roi)}
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${roi >= 0 ? 'bg-purple-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cash Flow Comparison */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h4 className="font-semibold text-primary mb-4">Monthly Cash Flow</h4>
                <div className="space-y-4">
                  {analyses.map((analysis) => {
                    const cashFlow = analysis.monthlyCashFlow || 0;
                    const maxCashFlow = Math.max(...analyses.map(a => Math.abs(a.monthlyCashFlow || 0)), 1);
                    const percentage = (Math.abs(cashFlow) / maxCashFlow) * 100;

                    return (
                      <div key={analysis.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted truncate max-w-[200px]">
                            {analysis.address?.split(',')[0]}
                          </span>
                          <span className={`font-medium ${cashFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(cashFlow)}/mo
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${cashFlow >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cap Rate Comparison */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h4 className="font-semibold text-primary mb-4">Cap Rate</h4>
                <div className="space-y-4">
                  {analyses.map((analysis) => {
                    const capRate = analysis.capRate || 0;
                    const maxCapRate = Math.max(...analyses.map(a => Math.abs(a.capRate || 0)), 10);
                    const percentage = (capRate / maxCapRate) * 100;

                    return (
                      <div key={analysis.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted truncate max-w-[200px]">
                            {analysis.address?.split(',')[0]}
                          </span>
                          <span className="font-medium text-emerald-600">
                            {formatPercent(capRate)}
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ComparisonSection>

          {/* AI Recommendations */}
          <ComparisonSection title="AI Insights">
            <div className={`grid gap-4 ${
              analyses.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              analyses.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
              'grid-cols-1 md:grid-cols-2'
            }`}>
              {analyses.map((analysis) => (
                <div key={analysis.id} className="bg-card rounded-xl border border-border p-5">
                  <h4 className="font-semibold text-primary mb-2 line-clamp-1">
                    {analysis.address?.split(',')[0]}
                  </h4>

                  {analysis.ai_analysis?.summary && (
                    <p className="text-sm text-muted mb-4 line-clamp-4">
                      {analysis.ai_analysis.summary}
                    </p>
                  )}

                  {analysis.ai_analysis?.risks && analysis.ai_analysis.risks.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-red-500 mb-1">Key Risks:</p>
                      <ul className="text-xs text-muted space-y-1">
                        {analysis.ai_analysis.risks.slice(0, 2).map((risk: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-red-500">•</span>
                            <span className="line-clamp-2">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.ai_analysis?.opportunities && analysis.ai_analysis.opportunities.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-500 mb-1">Opportunities:</p>
                      <ul className="text-xs text-muted space-y-1">
                        {analysis.ai_analysis.opportunities.slice(0, 2).map((opp: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-green-500">•</span>
                            <span className="line-clamp-2">{opp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!analysis.ai_analysis?.summary && !analysis.ai_analysis?.risks?.length && !analysis.ai_analysis?.opportunities?.length && (
                    <p className="text-sm text-muted">No AI insights available for this property.</p>
                  )}
                </div>
              ))}
            </div>
          </ComparisonSection>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => router.push('/analysis/history')}
            className="px-6 py-3 border border-primary/30 text-primary rounded-lg hover:bg-primary/5"
          >
            Compare More Properties
          </button>
          <button
            onClick={() => router.push('/analysis/new')}
            className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90"
          >
            Analyze New Property
          </button>
        </div>
      </main>
    </div>
  );
}

// Helper Components
function ComparisonSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <h3 className="font-semibold text-primary">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

interface ComparisonRow {
  label: string;
  getValue: (analysis: any) => string | number;
  isBest?: (analysis: any) => boolean;
  highlight?: boolean;
}

function ComparisonTable({
  analyses,
  rows
}: {
  analyses: any[];
  rows: ComparisonRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted w-48">Metric</th>
            {analyses.map((analysis) => (
              <th key={analysis.id} className="text-left py-3 px-4">
                <span className="text-sm font-medium text-primary line-clamp-1">
                  {analysis.address?.split(',')[0] || 'Property'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-muted/5' : ''}>
              <td className="py-3 px-4 text-sm font-medium text-primary">{row.label}</td>
              {analyses.map((analysis) => {
                const isBest = row.isBest?.(analysis);
                return (
                  <td
                    key={analysis.id}
                    className={`py-3 px-4 text-sm ${
                      isBest ? 'bg-green-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={row.highlight && isBest ? 'font-semibold text-green-600' : 'text-primary'}>
                        {row.getValue(analysis)}
                      </span>
                      {isBest && (
                        <span className="px-1.5 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                          Best
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Default export wraps content in Suspense boundary
export default function ComparisonPage() {
  return (
    <Suspense fallback={<ComparisonLoading />}>
      <ComparisonContent />
    </Suspense>
  );
}
