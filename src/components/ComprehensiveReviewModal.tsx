'use client';

import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import ImageUploadErrorBoundary from './ImageUploadErrorBoundary';
import type { PropertyData, FinancingScenario, ProjectionData } from '@/types/property';

interface ComprehensiveReviewModalProps {
  isOpen: boolean;
  data: PropertyData | null;
  uploadedImages: string[];
  onImagesChange: (images: string[]) => void;
  onSave: (data: PropertyData) => void;
  onClose: () => void;
}

export default function ComprehensiveReviewModal({
  isOpen,
  data: initialData,
  uploadedImages,
  onImagesChange,
  onSave,
  onClose
}: ComprehensiveReviewModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [reviewData, setReviewData] = useState<PropertyData | null>(null);

  // Update reviewData when initialData changes or modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      console.log('ComprehensiveReviewModal: Received data:', initialData);
      console.log('Strategic Overview exists:', !!initialData.strategicOverview);
      console.log('Location Analysis exists:', !!initialData.locationAnalysis);
      console.log('Rent Analysis exists:', !!initialData.rentAnalysis);
      console.log('Financing Scenarios count:', initialData.financingScenarios?.length || 0);
      console.log('Property Metrics exists:', !!initialData.propertyMetrics);
      console.log('30-Year Projections exists:', !!initialData.thirtyYearProjections);
      setReviewData(initialData);
    }
  }, [initialData, isOpen]);

  if (!isOpen || !reviewData || !initialData) return null;

  // Check which sections have data
  const hasStrategicData = reviewData.strategicOverview || reviewData.valueAddDescription || reviewData.description;
  const hasLocationData = reviewData.locationAnalysis && Object.keys(reviewData.locationAnalysis).length > 0;
  const hasRentData = reviewData.rentAnalysis && Object.keys(reviewData.rentAnalysis).length > 0;
  const hasFinancingData = reviewData.financingScenarios && reviewData.financingScenarios.length > 0;
  const hasMetricsData = reviewData.propertyMetrics && Object.keys(reviewData.propertyMetrics).length > 0;
  const hasProjectionsData = reviewData.thirtyYearProjections && reviewData.thirtyYearProjections.projections;

  const tabs = [
    { id: 'basic', label: 'Basic Info', hasData: true },
    { id: 'strategic', label: 'Strategic Analysis', hasData: hasStrategicData },
    { id: 'location', label: 'Location', hasData: hasLocationData },
    { id: 'rent', label: 'Rent Analysis', hasData: hasRentData },
    { id: 'financing', label: 'Financing', hasData: hasFinancingData },
    { id: 'metrics', label: 'Metrics', hasData: hasMetricsData },
    { id: 'projections', label: '30-Year Projections', hasData: hasProjectionsData },
    { id: 'images', label: '📸 Images', hasData: true, highlight: uploadedImages.length === 0 }
  ];

  const handleSave = () => {
    onSave(reviewData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-card rounded-xl border border-border/60 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border/60">
          <h2 className="text-2xl font-bold text-primary">Review Comprehensive Property Analysis</h2>
          <p className="text-sm text-muted mt-1">Review all sections before saving</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border/60 px-6">
          <div className="flex space-x-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-muted hover:text-primary'
                } ${tab.highlight ? 'animate-pulse' : ''}`}
              >
                {tab.label}
                {tab.hasData && !tab.highlight && (
                  <span className="ml-1 text-xs text-green-600">✓</span>
                )}
                {tab.id === 'images' && uploadedImages.length > 0 && (
                  <span className="ml-1 text-xs text-green-600">({uploadedImages.length})</span>
                )}
                {tab.highlight && (
                  <span className="ml-1 text-xs text-amber-600">!</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Title/Address</label>
                  <input
                    type="text"
                    value={reviewData.title || reviewData.address || ''}
                    onChange={(e) => setReviewData({ ...reviewData, title: e.target.value, address: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">City</label>
                    <input
                      type="text"
                      value={reviewData.city || ''}
                      onChange={(e) => setReviewData({ ...reviewData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">State</label>
                    <input
                      type="text"
                      value={reviewData.state || ''}
                      onChange={(e) => setReviewData({ ...reviewData, state: e.target.value.toUpperCase().slice(0, 2) })}
                      className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">ZIP</label>
                    <input
                      type="text"
                      value={reviewData.zipCode || ''}
                      onChange={(e) => setReviewData({ ...reviewData, zipCode: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Price</label>
                  <input
                    type="number"
                    value={reviewData.price || ''}
                    onChange={(e) => setReviewData({ ...reviewData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Down Payment</label>
                  <input
                    type="number"
                    value={reviewData.downPayment || ''}
                    onChange={(e) => setReviewData({ ...reviewData, downPayment: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Monthly Rent</label>
                  <input
                    type="number"
                    value={reviewData.monthlyRent || ''}
                    onChange={(e) => setReviewData({ ...reviewData, monthlyRent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={reviewData.bedrooms || ''}
                    onChange={(e) => setReviewData({ ...reviewData, bedrooms: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Bathrooms</label>
                  <input
                    type="number"
                    step="0.5"
                    value={reviewData.bathrooms || ''}
                    onChange={(e) => setReviewData({ ...reviewData, bathrooms: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Sq Ft</label>
                  <input
                    type="number"
                    value={reviewData.sqft || ''}
                    onChange={(e) => setReviewData({ ...reviewData, sqft: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1">Year Built</label>
                  <input
                    type="number"
                    value={reviewData.yearBuilt || ''}
                    onChange={(e) => setReviewData({ ...reviewData, yearBuilt: parseInt(e.target.value) || null })}
                    className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Strategic Analysis Tab */}
          {activeTab === 'strategic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Strategic Investment Overview</label>
                <textarea
                  value={reviewData.strategicOverview || ''}
                  onChange={(e) => setReviewData({ ...reviewData, strategicOverview: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                  placeholder="Why this property is an exceptional investment opportunity..."
                />
                <p className="text-xs text-muted mt-1">
                  {(reviewData.strategicOverview || '').length} characters (minimum 200 words recommended)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Value-Add Opportunity Description</label>
                <textarea
                  value={reviewData.valueAddDescription || ''}
                  onChange={(e) => setReviewData({ ...reviewData, valueAddDescription: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                  placeholder="Specific improvement opportunities and potential..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Investment Description</label>
                <textarea
                  value={reviewData.description || ''}
                  onChange={(e) => setReviewData({ ...reviewData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                  placeholder="Brief investment thesis..."
                />
              </div>
            </div>
          )}

          {/* Location Analysis Tab */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              {reviewData.locationAnalysis ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Location Overview</label>
                    <textarea
                      value={reviewData.locationAnalysis.overview || ''}
                      onChange={(e) => setReviewData({ 
                        ...reviewData, 
                        locationAnalysis: { ...reviewData.locationAnalysis, overview: e.target.value }
                      })}
                      rows={6}
                      className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Walk Score</label>
                      <input
                        type="number"
                        value={reviewData.locationAnalysis.walkScore || ''}
                        onChange={(e) => setReviewData({ 
                          ...reviewData, 
                          locationAnalysis: { ...reviewData.locationAnalysis, walkScore: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Transit Score</label>
                      <input
                        type="number"
                        value={reviewData.locationAnalysis.transitScore || ''}
                        onChange={(e) => setReviewData({ 
                          ...reviewData, 
                          locationAnalysis: { ...reviewData.locationAnalysis, transitScore: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Neighborhood Class</label>
                      <select
                        value={reviewData.locationAnalysis.neighborhoodClass || 'B'}
                        onChange={(e) => setReviewData({ 
                          ...reviewData, 
                          locationAnalysis: { ...reviewData.locationAnalysis, neighborhoodClass: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                      >
                        <option value="A">A - Premium</option>
                        <option value="B">B - Good</option>
                        <option value="C">C - Average</option>
                        <option value="D">D - Below Average</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Market Trends</label>
                    <textarea
                      value={reviewData.locationAnalysis.marketTrends || ''}
                      onChange={(e) => setReviewData({ 
                        ...reviewData, 
                        locationAnalysis: { ...reviewData.locationAnalysis, marketTrends: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <p className="text-muted">No location analysis data available</p>
              )}
            </div>
          )}

          {/* Rent Analysis Tab */}
          {activeTab === 'rent' && (
            <div className="space-y-6">
              {reviewData.rentAnalysis ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Current Rent Per Unit</label>
                      <input
                        type="number"
                        value={reviewData.rentAnalysis.currentRentPerUnit || ''}
                        onChange={(e) => setReviewData({ 
                          ...reviewData, 
                          rentAnalysis: { ...reviewData.rentAnalysis, currentRentPerUnit: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Market Rent Per Unit</label>
                      <input
                        type="number"
                        value={reviewData.rentAnalysis.marketRentPerUnit || ''}
                        onChange={(e) => setReviewData({ 
                          ...reviewData, 
                          rentAnalysis: { ...reviewData.rentAnalysis, marketRentPerUnit: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Vacant Units</label>
                      <input
                        type="number"
                        value={reviewData.rentAnalysis.vacantUnits || ''}
                        onChange={(e) => setReviewData({ 
                          ...reviewData, 
                          rentAnalysis: { ...reviewData.rentAnalysis, vacantUnits: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Total Units</label>
                      <input
                        type="number"
                        value={reviewData.rentAnalysis.totalUnits || ''}
                        onChange={(e) => setReviewData({ 
                          ...reviewData, 
                          rentAnalysis: { ...reviewData.rentAnalysis, totalUnits: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Rent Growth Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={reviewData.rentAnalysis.rentGrowthRate || ''}
                        onChange={(e) => setReviewData({ 
                          ...reviewData, 
                          rentAnalysis: { ...reviewData.rentAnalysis, rentGrowthRate: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">Stabilization Timeline</label>
                    <input
                      type="text"
                      value={reviewData.rentAnalysis.stabilizationTimeline || ''}
                      onChange={(e) => setReviewData({ 
                        ...reviewData, 
                        rentAnalysis: { ...reviewData.rentAnalysis, stabilizationTimeline: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg"
                      placeholder="e.g., 6-12 months"
                    />
                  </div>

                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Rent Upside Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted">Monthly Rent Upside:</span>
                        <span className="font-semibold ml-2">
                          ${reviewData.rentAnalysis.monthlyRentUpside?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Annual Rent Upside:</span>
                        <span className="font-semibold ml-2">
                          ${reviewData.rentAnalysis.annualRentUpside?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted">No rent analysis data available</p>
              )}
            </div>
          )}

          {/* Financing Tab */}
          {activeTab === 'financing' && (
            <div className="space-y-6">
              {reviewData.financingScenarios && reviewData.financingScenarios.length > 0 ? (
                reviewData.financingScenarios.map((scenario: FinancingScenario, index: number) => (
                  <div key={index} className="border border-border/60 rounded-lg p-4">
                    <h4 className="font-semibold text-primary mb-3">{scenario.name}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted">Down Payment:</span>
                        <span className="font-semibold ml-2">
                          ${scenario.downPayment?.toLocaleString()} ({scenario.downPaymentPercent}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Interest Rate:</span>
                        <span className="font-semibold ml-2">{scenario.interestRate}%</span>
                      </div>
                      <div>
                        <span className="text-muted">Monthly Cash Flow:</span>
                        <span className="font-semibold ml-2 text-green-600">
                          ${scenario.monthlyCashFlow?.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Cash-on-Cash Return:</span>
                        <span className="font-semibold ml-2">{scenario.cashOnCashReturn}%</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-muted">{scenario.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No financing scenarios available</p>
              )}
            </div>
          )}

          {/* Property Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {reviewData.propertyMetrics && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Price per Sq Ft:</span>
                      <span className="font-semibold">
                        ${reviewData.propertyMetrics.pricePerSqft?.toFixed(2) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Price per Unit:</span>
                      <span className="font-semibold">
                        ${reviewData.propertyMetrics.pricePerUnit?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Gross Rent Multiplier:</span>
                      <span className="font-semibold">
                        {reviewData.propertyMetrics.grossRentMultiplier?.toFixed(2) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Debt Service Coverage:</span>
                      <span className="font-semibold">
                        {reviewData.propertyMetrics.debtServiceCoverageRatio?.toFixed(2) || 0}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Break-Even Occupancy:</span>
                      <span className="font-semibold">
                        {reviewData.propertyMetrics.breakEvenOccupancy?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Internal Rate of Return:</span>
                      <span className="font-semibold">
                        {reviewData.propertyMetrics.internalRateOfReturn?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Equity Multiple:</span>
                      <span className="font-semibold">
                        {reviewData.propertyMetrics.equityMultiple?.toFixed(2) || 0}x
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Payback Period:</span>
                      <span className="font-semibold">
                        {reviewData.propertyMetrics.paybackPeriod?.toFixed(1) || 0} years
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 30-Year Projections Tab */}
          {activeTab === 'projections' && (
            <div className="space-y-6">
              {reviewData.thirtyYearProjections && (
                <>
                  <div className="bg-muted/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-3">Assumptions</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted">Rent Growth Rate:</span>
                        <span className="font-semibold ml-2">
                          {reviewData.thirtyYearProjections.assumptions?.rentGrowthRate || 0}% annually
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Expense Growth Rate:</span>
                        <span className="font-semibold ml-2">
                          {reviewData.thirtyYearProjections.assumptions?.expenseGrowthRate || 0}% annually
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Appreciation Rate:</span>
                        <span className="font-semibold ml-2">
                          {reviewData.thirtyYearProjections.assumptions?.appreciationRate || 0}% annually
                        </span>
                      </div>
                      <div>
                        <span className="text-muted">Vacancy Rate:</span>
                        <span className="font-semibold ml-2">
                          {reviewData.thirtyYearProjections.assumptions?.vacancyRate || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {reviewData.thirtyYearProjections.projections && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/60">
                            <th className="px-4 py-2 text-left">Year</th>
                            <th className="px-4 py-2 text-right">Gross Rent</th>
                            <th className="px-4 py-2 text-right">NOI</th>
                            <th className="px-4 py-2 text-right">Cash Flow</th>
                            <th className="px-4 py-2 text-right">Property Value</th>
                            <th className="px-4 py-2 text-right">Equity</th>
                            <th className="px-4 py-2 text-right">Total ROI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reviewData.thirtyYearProjections.projections
                            .filter((p: ProjectionData) => [1, 2, 3, 5, 10, 20, 30].includes(p.year))
                            .map((projection: ProjectionData) => (
                            <tr key={projection.year} className="border-b border-border/30">
                              <td className="px-4 py-2">{projection.year}</td>
                              <td className="px-4 py-2 text-right">
                                ${projection.grossRent?.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right">
                                ${projection.netOperatingIncome?.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right text-green-600">
                                ${projection.cashFlow?.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right">
                                ${projection.propertyValue?.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right">
                                ${projection.equity?.toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right font-semibold">
                                {projection.totalROI?.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-4 max-w-full">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>📸 Add Property Images:</strong> Upload up to 10 images of the property. 
                  High-quality photos help showcase the investment opportunity.
                </p>
              </div>
              <div className="w-full overflow-hidden">
                <ImageUploadErrorBoundary>
                  <ImageUpload 
                    images={uploadedImages}
                    onImagesChange={onImagesChange}
                    maxImages={10}
                  />
                </ImageUploadErrorBoundary>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/60 flex justify-between flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted hover:text-primary transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('basic')}
              className="px-4 py-2 bg-muted/20 text-primary rounded-lg hover:bg-muted/30"
            >
              Review Basic Info
            </button>
            <button
              onClick={handleSave}
              disabled={!reviewData.title && !reviewData.address}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Property
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}