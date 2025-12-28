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

// Main comparison content component that uses useSearchParams
function ComparisonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get IDs from query string first, then sessionStorage
      let analysisIds: string[] = [];

      const idsParam = searchParams.get('ids');
      if (idsParam) {
        analysisIds = idsParam.split(',').filter(id => id.trim());
      } else {
        // Try sessionStorage (set by ComparisonModal)
        const storedData = sessionStorage.getItem('comparison-data');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          analysisIds = parsed.analyses || [];
          // Clear after reading
          sessionStorage.removeItem('comparison-data');
        }
      }

      if (analysisIds.length === 0) {
        setError('No properties selected for comparison');
        setLoading(false);
        return;
      }

      console.log('[Comparison] Loading analyses:', analysisIds);

      // Fetch all analyses in parallel
      const fetchPromises = analysisIds.map(async (id) => {
        const response = await fetch(`/api/analysis/${id}`);
        if (!response.ok) {
          console.error(`Failed to fetch analysis ${id}`);
          return null;
        }
        return response.json();
      });

      const results = await Promise.all(fetchPromises);
      const validAnalyses = results.filter((a): a is Analysis => a !== null);

      if (validAnalyses.length === 0) {
        setError('Could not load any of the selected properties');
      } else {
        setAnalyses(validAnalyses);
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

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number | undefined | null, decimals = 1) => {
    if (value === undefined || value === null) return '—';
    return `${value.toFixed(decimals)}%`;
  };

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '—';
    return value.toLocaleString();
  };

  // Get financial metrics from multiple possible locations
  const getMetric = (analysis: Analysis, key: string): number | undefined => {
    const analysisData = (analysis as any).analysis_data || {};
    const aiMetrics = (analysis.ai_analysis?.financial_metrics || {}) as Record<string, unknown>;
    const nestedAiMetrics = (analysisData?.ai_analysis?.financial_metrics || {}) as Record<string, unknown>;

    // Check multiple locations
    const value = (analysis as any)[key] ||
                  aiMetrics[key] ||
                  nestedAiMetrics[key] ||
                  analysisData[key];

    return typeof value === 'number' ? value : undefined;
  };

  const getStrategyLabel = (strategy: string) => {
    const labels: Record<string, string> = {
      flip: 'Fix & Flip',
      brrrr: 'BRRRR Strategy',
      rental: 'Buy & Hold',
      'house-hack': 'House Hack',
      commercial: 'Commercial'
    };
    return labels[strategy] || strategy;
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

  const getPropertyDetails = (analysis: Analysis) => {
    const prop = analysis.property_data?.property?.[0] || {};
    return {
      bedrooms: prop.bedrooms || (analysis as any).analysis_data?.bedrooms || '—',
      bathrooms: prop.bathrooms || (analysis as any).analysis_data?.bathrooms || '—',
      sqft: prop.squareFootage || (analysis as any).analysis_data?.squareFootage || (analysis as any).analysis_data?.sqft,
      yearBuilt: prop.yearBuilt || (analysis as any).analysis_data?.yearBuilt || '—',
      propertyType: prop.propertyType || (analysis as any).analysis_data?.propertyType || '—'
    };
  };

  // Find best value in a column (higher is better)
  const getBestValue = (values: (number | undefined)[], higherIsBetter = true): number | undefined => {
    const validValues = values.filter((v): v is number => v !== undefined);
    if (validValues.length === 0) return undefined;
    return higherIsBetter ? Math.max(...validValues) : Math.min(...validValues);
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
          {analyses.map((analysis) => {
            const details = getPropertyDetails(analysis);
            const profit = getMetric(analysis, 'profit') || getMetric(analysis, 'net_profit') || getMetric(analysis, 'total_profit');
            const roi = getMetric(analysis, 'roi');

            return (
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
                  {details.bedrooms}bd • {details.bathrooms}ba • {details.sqft ? formatNumber(details.sqft) + ' sqft' : '—'}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted mb-1">Price</p>
                    <p className="font-semibold text-primary">{formatCurrency(analysis.purchase_price)}</p>
                  </div>
                  <div className="bg-muted/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted mb-1">Profit</p>
                    <p className={`font-semibold ${(profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profit)}
                    </p>
                  </div>
                  <div className="bg-muted/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted mb-1">ROI</p>
                    <p className="font-semibold text-primary">{formatPercent(roi)}</p>
                  </div>
                  <div className="bg-muted/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted mb-1">Down Payment</p>
                    <p className="font-semibold text-primary">{analysis.down_payment_percent}%</p>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/analysis/results/${analysis.id}`)}
                  className="w-full mt-4 px-4 py-2 text-sm border border-primary/30 text-primary rounded-lg hover:bg-primary/5 transition-colors"
                >
                  View Full Analysis
                </button>
              </div>
            );
          })}
        </div>

        {/* Comparison Tables */}
        <div className="space-y-8">
          {/* Property Details Table */}
          <ComparisonSection title="Property Details">
            <ComparisonTable
              analyses={analyses}
              rows={[
                { label: 'Property Type', getValue: (a) => getPropertyDetails(a).propertyType },
                { label: 'Bedrooms', getValue: (a) => getPropertyDetails(a).bedrooms },
                { label: 'Bathrooms', getValue: (a) => getPropertyDetails(a).bathrooms },
                { label: 'Square Feet', getValue: (a) => {
                  const sqft = getPropertyDetails(a).sqft;
                  return sqft ? formatNumber(sqft) : '—';
                }},
                { label: 'Year Built', getValue: (a) => getPropertyDetails(a).yearBuilt },
              ]}
            />
          </ComparisonSection>

          {/* Investment Strategy Table */}
          <ComparisonSection title="Investment Strategy">
            <ComparisonTable
              analyses={analyses}
              rows={[
                { label: 'Strategy', getValue: (a) => getStrategyLabel(a.strategy) },
                { label: 'Purchase Price', getValue: (a) => formatCurrency(a.purchase_price) },
                { label: 'Down Payment', getValue: (a) => formatPercent(a.down_payment_percent, 0) },
                { label: 'Interest Rate', getValue: (a) => formatPercent(a.interest_rate) },
                { label: 'Loan Term', getValue: (a) => `${a.loan_term} years` },
                { label: 'Rehab Costs', getValue: (a) => formatCurrency(a.rehab_costs) },
              ]}
            />
          </ComparisonSection>

          {/* Financial Performance Table */}
          <ComparisonSection title="Financial Performance">
            {(() => {
              const profitValues = analyses.map(a => getMetric(a, 'profit') || getMetric(a, 'net_profit') || getMetric(a, 'total_profit'));
              const roiValues = analyses.map(a => getMetric(a, 'roi'));
              const cashFlowValues = analyses.map(a => getMetric(a, 'monthly_cash_flow'));
              const capRateValues = analyses.map(a => getMetric(a, 'cap_rate'));
              const cocValues = analyses.map(a => getMetric(a, 'cash_on_cash_return'));

              const bestProfit = getBestValue(profitValues);
              const bestRoi = getBestValue(roiValues);
              const bestCashFlow = getBestValue(cashFlowValues);
              const bestCapRate = getBestValue(capRateValues);
              const bestCoC = getBestValue(cocValues);

              return (
                <ComparisonTable
                  analyses={analyses}
                  rows={[
                    {
                      label: 'Net Profit',
                      getValue: (a) => formatCurrency(getMetric(a, 'profit') || getMetric(a, 'net_profit') || getMetric(a, 'total_profit')),
                      isBest: (a) => {
                        const val = getMetric(a, 'profit') || getMetric(a, 'net_profit') || getMetric(a, 'total_profit');
                        return val !== undefined && val === bestProfit;
                      },
                      highlight: true
                    },
                    {
                      label: 'ROI',
                      getValue: (a) => formatPercent(getMetric(a, 'roi')),
                      isBest: (a) => getMetric(a, 'roi') === bestRoi && bestRoi !== undefined,
                      highlight: true
                    },
                    {
                      label: 'Monthly Cash Flow',
                      getValue: (a) => formatCurrency(getMetric(a, 'monthly_cash_flow')),
                      isBest: (a) => getMetric(a, 'monthly_cash_flow') === bestCashFlow && bestCashFlow !== undefined,
                      highlight: true
                    },
                    {
                      label: 'Cap Rate',
                      getValue: (a) => formatPercent(getMetric(a, 'cap_rate')),
                      isBest: (a) => getMetric(a, 'cap_rate') === bestCapRate && bestCapRate !== undefined,
                      highlight: true
                    },
                    {
                      label: 'Cash-on-Cash Return',
                      getValue: (a) => formatPercent(getMetric(a, 'cash_on_cash_return')),
                      isBest: (a) => getMetric(a, 'cash_on_cash_return') === bestCoC && bestCoC !== undefined,
                      highlight: true
                    },
                    {
                      label: 'Total Investment',
                      getValue: (a) => formatCurrency(getMetric(a, 'total_investment')),
                    },
                    {
                      label: 'Monthly Rent',
                      getValue: (a) => formatCurrency(getMetric(a, 'monthly_rent')),
                    },
                  ]}
                />
              );
            })()}
          </ComparisonSection>

          {/* Visual Comparison Charts */}
          <ComparisonSection title="Visual Comparison">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profit Comparison */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h4 className="font-semibold text-primary mb-4">Net Profit Comparison</h4>
                <div className="space-y-4">
                  {analyses.map((analysis) => {
                    const profit = getMetric(analysis, 'profit') || getMetric(analysis, 'net_profit') || getMetric(analysis, 'total_profit') || 0;
                    const maxProfit = Math.max(...analyses.map(a =>
                      Math.abs(getMetric(a, 'profit') || getMetric(a, 'net_profit') || getMetric(a, 'total_profit') || 0)
                    ));
                    const percentage = maxProfit > 0 ? (Math.abs(profit) / maxProfit) * 100 : 0;

                    return (
                      <div key={analysis.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted truncate max-w-[200px]">
                            {analysis.address.split(',')[0]}
                          </span>
                          <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(profit)}
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${percentage}%` }}
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
                    const roi = getMetric(analysis, 'roi') || 0;
                    const maxRoi = Math.max(...analyses.map(a => Math.abs(getMetric(a, 'roi') || 0)));
                    const percentage = maxRoi > 0 ? (Math.abs(roi) / maxRoi) * 100 : 0;

                    return (
                      <div key={analysis.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted truncate max-w-[200px]">
                            {analysis.address.split(',')[0]}
                          </span>
                          <span className={`font-medium ${roi >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                            {formatPercent(roi)}
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${roi >= 0 ? 'bg-purple-500' : 'bg-red-500'}`}
                            style={{ width: `${percentage}%` }}
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
                    const cashFlow = getMetric(analysis, 'monthly_cash_flow') || 0;
                    const maxCashFlow = Math.max(...analyses.map(a => Math.abs(getMetric(a, 'monthly_cash_flow') || 0)));
                    const percentage = maxCashFlow > 0 ? (Math.abs(cashFlow) / maxCashFlow) * 100 : 0;

                    return (
                      <div key={analysis.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted truncate max-w-[200px]">
                            {analysis.address.split(',')[0]}
                          </span>
                          <span className={`font-medium ${cashFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(cashFlow)}/mo
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${cashFlow >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                            style={{ width: `${percentage}%` }}
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
                    const capRate = getMetric(analysis, 'cap_rate') || 0;
                    const maxCapRate = Math.max(...analyses.map(a => Math.abs(getMetric(a, 'cap_rate') || 0)), 10);
                    const percentage = maxCapRate > 0 ? (capRate / maxCapRate) * 100 : 0;

                    return (
                      <div key={analysis.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted truncate max-w-[200px]">
                            {analysis.address.split(',')[0]}
                          </span>
                          <span className="font-medium text-emerald-600">
                            {formatPercent(capRate)}
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
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
                    {analysis.address.split(',')[0]}
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
                        {analysis.ai_analysis.risks.slice(0, 2).map((risk, idx) => (
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
                        {analysis.ai_analysis.opportunities.slice(0, 2).map((opp, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-green-500">•</span>
                            <span className="line-clamp-2">{opp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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
  getValue: (analysis: Analysis) => string | number;
  isBest?: (analysis: Analysis) => boolean;
  highlight?: boolean;
}

function ComparisonTable({
  analyses,
  rows
}: {
  analyses: Analysis[];
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
                  {analysis.address.split(',')[0]}
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
