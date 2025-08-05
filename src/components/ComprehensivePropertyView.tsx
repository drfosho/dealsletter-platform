'use client';

import { useState } from 'react';
import type { PropertyData, FinancingScenario, ProjectionData } from '@/types/property';
import { 
  isHouseHackProperty, 
  calculateEffectiveMortgage,
  getEffectiveMortgageColor,
  getDefaultInterestRate 
} from '@/utils/house-hack-calculations';

interface ComprehensivePropertyViewProps {
  isOpen: boolean;
  property: PropertyData | null;
  onClose: () => void;
}

export default function ComprehensivePropertyView({ isOpen, property, onClose }: ComprehensivePropertyViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !property) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'strategic', label: 'Strategic Analysis' },
    { id: 'location', label: 'Location' },
    { id: 'financials', label: 'Financials' },
    { id: 'projections', label: '30-Year Analysis' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-card rounded-xl border border-border/60 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border/60">
          <h2 className="text-2xl font-bold text-primary">{property.title || property.address}</h2>
          <p className="text-sm text-muted mt-1">{property.location}</p>
          
          {/* AVM vs Listing Price Warning */}
          {property.isOnMarket && property.avm && property.price && Math.abs(property.avm - property.price) > 50000 && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Price Notice: AVM Estimate Shown</h4>
                  <div className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                    <p>The price displayed (<strong>${property.avm?.toLocaleString()}</strong>) is an automated valuation estimate.</p>
                    <p>Actual listing price: <strong>${property.price.toLocaleString()}</strong> ({((property.price - property.avm!) / property.avm! * 100).toFixed(1)}% {property.price > property.avm! ? 'higher' : 'lower'})</p>
                    <p className="mt-2 font-medium">Please update the purchase price in your analysis accordingly.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted">
                        {property.isOnMarket && property.avm && Math.abs(property.avm - property.price) > 50000 
                          ? 'AVM Estimate:' 
                          : 'Price:'}
                      </dt>
                      <dd className="font-semibold">
                        ${(property.isOnMarket && property.avm 
                          ? property.avm 
                          : property.price)?.toLocaleString()}
                      </dd>
                    </div>
                    {property.isOnMarket && property.avm && Math.abs(property.avm - property.price) > 50000 && (
                      <div className="flex justify-between">
                        <dt className="text-muted">Listing Price:</dt>
                        <dd className="text-amber-600 dark:text-amber-500">${property.price?.toLocaleString()}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted">Property Type:</dt>
                      <dd>{property.propertyType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Strategy:</dt>
                      <dd>{property.strategy || property.investmentStrategy}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Bedrooms:</dt>
                      <dd>{property.bedrooms}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Bathrooms:</dt>
                      <dd>{property.bathrooms}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Square Feet:</dt>
                      <dd>{property.sqft?.toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Financial Metrics</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted">Down Payment:</dt>
                      <dd className="font-semibold">${property.downPayment?.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Monthly Rent:</dt>
                      <dd>${property.monthlyRent?.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Cap Rate:</dt>
                      <dd>{property.capRate}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">
                        {isHouseHackProperty(property.strategy) ? 'Effective Mortgage:' : 'Cash Flow:'}
                      </dt>
                      <dd className={
                        isHouseHackProperty(property.strategy) 
                          ? getEffectiveMortgageColor(
                              calculateEffectiveMortgage(
                                property.price,
                                property.downPaymentPercent || 25,
                                property.monthlyRent || 0,
                                property.interestRate ? property.interestRate / 100 : getDefaultInterestRate(property.strategy, property.units)
                              )
                            )
                          : property.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                      }>
                        ${isHouseHackProperty(property.strategy)
                          ? Math.abs(calculateEffectiveMortgage(
                              property.price,
                              property.downPaymentPercent || 25,
                              property.monthlyRent || 0,
                              property.interestRate ? property.interestRate / 100 : getDefaultInterestRate(property.strategy, property.units)
                            )).toLocaleString()
                          : property.monthlyCashFlow?.toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Total ROI:</dt>
                      <dd>{property.totalROI}%</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {property.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted">{property.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Strategic Analysis Tab */}
          {activeTab === 'strategic' && (
            <div className="space-y-6">
              {property.strategicOverview && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Strategic Investment Overview</h3>
                  <p className="text-muted whitespace-pre-wrap">{property.strategicOverview}</p>
                </div>
              )}
              
              {property.valueAddDescription && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Value-Add Opportunities</h3>
                  <p className="text-muted whitespace-pre-wrap">{property.valueAddDescription}</p>
                </div>
              )}
              
              {!property.strategicOverview && !property.valueAddDescription && (
                <p className="text-muted italic">No strategic analysis data available for this property.</p>
              )}
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && property.locationAnalysis && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Location Overview</h3>
                <p className="text-muted whitespace-pre-wrap">{property.locationAnalysis.overview}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Walk Score</h4>
                  <p className="text-2xl font-bold text-accent">{property.locationAnalysis.walkScore || 'N/A'}</p>
                </div>
                <div className="bg-muted/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Transit Score</h4>
                  <p className="text-2xl font-bold text-accent">{property.locationAnalysis.transitScore || 'N/A'}</p>
                </div>
                <div className="bg-muted/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Neighborhood Class</h4>
                  <p className="text-2xl font-bold text-accent">{property.locationAnalysis.neighborhoodClass || 'N/A'}</p>
                </div>
              </div>
              
              {property.rentAnalysis && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Rent Analysis</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <dt className="text-muted">Current Rent/Unit:</dt>
                      <dd>${property.rentAnalysis.currentRentPerUnit?.toLocaleString() || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Market Rent/Unit:</dt>
                      <dd>${property.rentAnalysis.marketRentPerUnit?.toLocaleString() || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Monthly Upside:</dt>
                      <dd className="text-green-600">${property.rentAnalysis.monthlyRentUpside?.toLocaleString() || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Annual Upside:</dt>
                      <dd className="text-green-600">${property.rentAnalysis.annualRentUpside?.toLocaleString() || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              {property.propertyMetrics && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Property Metrics</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <dt className="text-muted">Price per Sq Ft:</dt>
                      <dd>${property.propertyMetrics.pricePerSqft?.toFixed(2) || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Gross Rent Multiplier:</dt>
                      <dd>{property.propertyMetrics.grossRentMultiplier?.toFixed(2) || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Debt Service Coverage:</dt>
                      <dd>{property.propertyMetrics.debtServiceCoverageRatio?.toFixed(2) || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Internal Rate of Return:</dt>
                      <dd>{property.propertyMetrics.internalRateOfReturn?.toFixed(1) || 'N/A'}%</dd>
                    </div>
                  </dl>
                </div>
              )}
              
              {property.financingScenarios && property.financingScenarios.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Financing Scenarios</h3>
                  <div className="space-y-4">
                    {property.financingScenarios.map((scenario: FinancingScenario, index: number) => (
                      <div key={index} className="border border-border/60 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{scenario.name}</h4>
                        <p className="text-sm text-muted mb-3">{scenario.description}</p>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted">Down Payment:</dt>
                            <dd>${scenario.downPayment?.toLocaleString()}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted">Interest Rate:</dt>
                            <dd>{scenario.interestRate}%</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted">
                              {property.strategy?.toLowerCase().includes('house hack') ? 'Effective Mortgage:' : 'Monthly Cash Flow:'}
                            </dt>
                            <dd className={
                              property.strategy?.toLowerCase().includes('house hack') && scenario.monthlyCashFlow !== undefined && scenario.monthlyCashFlow < 0
                                ? "text-blue-600"
                                : (scenario.monthlyCashFlow ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                            }>
                              ${property.strategy?.toLowerCase().includes('house hack') && scenario.monthlyCashFlow !== undefined && scenario.monthlyCashFlow < 0
                                ? Math.abs(scenario.monthlyCashFlow).toLocaleString()
                                : scenario.monthlyCashFlow?.toLocaleString()}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted">Cash-on-Cash:</dt>
                            <dd>{scenario.cashOnCashReturn}%</dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 30-Year Projections Tab */}
          {activeTab === 'projections' && property.thirtyYearProjections && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Assumptions</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <dt className="text-muted">Rent Growth Rate:</dt>
                    <dd>{property.thirtyYearProjections.assumptions?.rentGrowthRate}% annually</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Expense Growth Rate:</dt>
                    <dd>{property.thirtyYearProjections.assumptions?.expenseGrowthRate}% annually</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Appreciation Rate:</dt>
                    <dd>{property.thirtyYearProjections.assumptions?.appreciationRate}% annually</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Vacancy Rate:</dt>
                    <dd>{property.thirtyYearProjections.assumptions?.vacancyRate}%</dd>
                  </div>
                </dl>
              </div>
              
              {property.thirtyYearProjections.projections && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Projections</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="px-4 py-2 text-left">Year</th>
                          <th className="px-4 py-2 text-right">Gross Rent</th>
                          <th className="px-4 py-2 text-right">Cash Flow</th>
                          <th className="px-4 py-2 text-right">Property Value</th>
                          <th className="px-4 py-2 text-right">Equity</th>
                          <th className="px-4 py-2 text-right">Total ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {property.thirtyYearProjections.projections
                          .filter((p: ProjectionData) => [1, 2, 3, 5, 10, 20, 30].includes(p.year))
                          .map((projection: ProjectionData) => (
                          <tr key={projection.year} className="border-b border-border/30">
                            <td className="px-4 py-2">{projection.year}</td>
                            <td className="px-4 py-2 text-right">
                              ${projection.grossRent?.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <span className={(projection.cashFlow ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                ${projection.cashFlow?.toLocaleString()}
                              </span>
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
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border/60 flex justify-between">
          <div>
            {property.listingUrl && (
              <button
                onClick={() => window.open(property.listingUrl, '_blank')}
                className="px-6 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90"
              >
                {property.listingSource && ['Zillow', 'LoopNet', 'Realtor.com', 'Redfin'].includes(property.listingSource) 
                  ? `View on ${property.listingSource}`
                  : 'View Original Listing'
                }
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}