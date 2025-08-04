'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { PropertyData, FinancingScenario, ProjectionData, ExitStrategy } from '@/types/property';

interface PremiumPropertyViewProps {
  isOpen: boolean;
  property: PropertyData | null;
  onClose: () => void;
}

export default function PremiumPropertyView({ isOpen, property, onClose }: PremiumPropertyViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !property) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'strategic', label: 'Strategic Analysis', icon: '🎯' },
    { id: 'location', label: 'Location & Market', icon: '📍' },
    { id: 'financials', label: 'Financial Analysis', icon: '💰' },
    { id: 'projections', label: '30-Year Returns', icon: '📈' }
  ];

  // Helper function to format currency
  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper function to format percentage
  const formatPercent = (value: number | undefined, decimals = 1) => {
    if (!value && value !== 0) return 'N/A';
    return `${value.toFixed(decimals)}%`;
  };

  // Get color class for metrics
  const getMetricColor = (value: number | undefined, type: 'roi' | 'risk' | 'default' = 'default') => {
    if (!value) return 'text-muted';
    
    if (type === 'roi') {
      if (value >= 20) return 'text-green-600';
      if (value >= 10) return 'text-blue-600';
      return 'text-yellow-600';
    }
    
    if (type === 'risk') {
      if (value >= 0) return 'text-green-600';
      return 'text-red-600';
    }
    
    return 'text-primary';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-card rounded-2xl border border-border/60 shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header with Image Gallery */}
        <div className="relative">
          {/* Image Gallery */}
          {property.images && property.images.length > 0 && (
            <div className="relative h-64 bg-muted/20">
              <Image
                src={property.images[activeImageIndex]}
                alt={property.title}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Image Navigation */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % property.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {/* Image Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {property.images.map((_: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
          )}
          
          {/* Property Header Info */}
          <div className={`relative ${property.images?.length > 0 ? '-mt-20' : ''} px-8 pb-6 pt-4`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-primary mb-2">{property.title || property.address}</h1>
                <p className="text-lg text-muted mb-4">{property.location}</p>
                
                {/* Key Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                    {property.propertyType}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-sm font-medium">
                    {property.strategy || property.investmentStrategy}
                  </span>
                  {property.confidence && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.confidence === 'very high' || property.confidence === 'high' 
                        ? 'bg-green-500/10 text-green-600' 
                        : property.confidence === 'medium' 
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      {property.confidence.toUpperCase()} CONFIDENCE
                    </span>
                  )}
                  {property.riskLevel && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      property.riskLevel === 'low' 
                        ? 'bg-green-500/10 text-green-600' 
                        : property.riskLevel === 'medium' 
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      {property.riskLevel.toUpperCase()} RISK
                    </span>
                  )}
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Premium Tabs */}
        <div className="border-t border-b border-border/60 bg-muted/5">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-accent text-accent bg-accent/5' 
                    : 'border-transparent text-muted hover:text-primary hover:bg-muted/10'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-8 space-y-8">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
                  <div className="text-sm text-muted mb-1">Purchase Price</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(property.price)}</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
                  <div className="text-sm text-muted mb-1">Total ROI</div>
                  <div className={`text-2xl font-bold ${getMetricColor(property.totalROI, 'roi')}`}>
                    {formatPercent(property.totalROI)}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
                  <div className="text-sm text-muted mb-1">Cap Rate</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPercent(property.capRate)}
                  </div>
                </div>
                
                <div className={`bg-gradient-to-br ${
                  property.strategy?.toLowerCase().includes('house hack')
                    ? 'from-blue-500/10 to-blue-600/10 border-blue-500/20'
                    : property.monthlyCashFlow >= 0 
                      ? 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/20' 
                      : 'from-red-500/10 to-red-600/10 border-red-500/20'
                } rounded-xl p-6 border`}>
                  <div className="text-sm text-muted mb-1">
                    {property.strategy?.toLowerCase().includes('house hack') ? 'Effective Mortgage' : 'Monthly Cash Flow'}
                  </div>
                  <div className={`text-2xl font-bold ${
                    property.strategy?.toLowerCase().includes('house hack')
                      ? 'text-blue-600'
                      : getMetricColor(property.monthlyCashFlow, 'risk')
                  }`}>
                    {property.strategy?.toLowerCase().includes('house hack') && property.monthlyCashFlow < 0
                      ? formatCurrency(Math.abs(property.monthlyCashFlow))
                      : formatCurrency(property.monthlyCashFlow)}
                  </div>
                  {property.strategy?.toLowerCase().includes('house hack') && (
                    <div className="text-xs text-muted mt-1">after rental income</div>
                  )}
                </div>
              </div>

              {/* Property Details Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card rounded-xl border border-border/60 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">🏠</span>
                    Property Details
                  </h3>
                  <dl className="space-y-3">
                    {[
                      { label: 'Type', value: property.propertyType },
                      { label: 'Bedrooms', value: property.bedrooms },
                      { label: 'Bathrooms', value: property.bathrooms },
                      { label: 'Square Feet', value: property.sqft?.toLocaleString() },
                      { label: 'Year Built', value: property.yearBuilt },
                      { label: 'Lot Size', value: property.lotSize },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                        <dt className="text-sm text-muted">{item.label}:</dt>
                        <dd className="font-medium">{item.value || 'N/A'}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="bg-card rounded-xl border border-border/60 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">💵</span>
                    Financial Summary
                  </h3>
                  <dl className="space-y-3">
                    {[
                      { label: 'Down Payment', value: formatCurrency(property.downPayment) },
                      { label: 'Down Payment %', value: formatPercent(property.downPaymentPercent, 0) },
                      { label: 'Monthly Rent', value: formatCurrency(property.monthlyRent) },
                      { label: 'Cash Required', value: formatCurrency(property.cashRequired) },
                      { label: 'Pro Forma Cap', value: formatPercent(property.proFormaCapRate) },
                      { label: 'Cash-on-Cash', value: formatPercent(property.cashOnCashReturn) },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                        <dt className="text-sm text-muted">{item.label}:</dt>
                        <dd className="font-medium">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div className="bg-card rounded-xl border border-border/60 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    Key Features
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {property.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {property.description && (
                <div className="bg-card rounded-xl border border-border/60 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    Investment Summary
                  </h3>
                  <p className="text-muted leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Strategic Analysis Tab */}
          {activeTab === 'strategic' && (
            <div className="p-8 space-y-8">
              {property.strategicOverview && (
                <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl border border-border/60 p-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Strategic Investment Overview
                  </h3>
                  <p className="text-muted leading-relaxed whitespace-pre-wrap">{property.strategicOverview}</p>
                </div>
              )}
              
              {property.valueAddDescription && (
                <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl border border-border/60 p-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Value-Add Opportunities
                  </h3>
                  <p className="text-muted leading-relaxed whitespace-pre-wrap">{property.valueAddDescription}</p>
                </div>
              )}

              {property.whyThisDeal && (
                <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl border border-border/60 p-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">💎</span>
                    Why This Deal?
                  </h3>
                  <p className="text-muted leading-relaxed">{property.whyThisDeal}</p>
                </div>
              )}

              {/* Value Add Opportunities List */}
              {property.valueAddOpportunities && property.valueAddOpportunities.length > 0 && (
                <div className="bg-card rounded-xl border border-border/60 p-8">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    Specific Value Creation Strategies
                  </h3>
                  <div className="grid gap-4">
                    {property.valueAddOpportunities.map((opportunity: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-muted/5 rounded-lg hover:bg-muted/10 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 bg-accent/10 text-accent rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed">{opportunity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pros and Cons */}
              <div className="grid md:grid-cols-2 gap-6">
                {property.pros && property.pros.length > 0 && (
                  <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl border border-green-500/20 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
                      <span className="text-xl">✅</span>
                      Investment Strengths
                    </h3>
                    <ul className="space-y-2">
                      {property.pros.map((pro: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {property.cons && property.cons.length > 0 && (
                  <div className="bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-xl border border-red-500/20 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-700">
                      <span className="text-xl">⚠️</span>
                      Risk Factors
                    </h3>
                    <ul className="space-y-2">
                      {property.cons.map((con: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="p-8 space-y-8">
              {property.locationAnalysis && (
                <>
                  {/* Location Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {property.locationAnalysis.walkScore || 'N/A'}
                      </div>
                      <div className="text-sm text-muted">Walk Score</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {property.locationAnalysis.transitScore || 'N/A'}
                      </div>
                      <div className="text-sm text-muted">Transit Score</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20 text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {property.locationAnalysis.bikeScore || 'N/A'}
                      </div>
                      <div className="text-sm text-muted">Bike Score</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl p-6 border border-amber-500/20 text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-1">
                        {property.locationAnalysis.neighborhoodClass || 'N/A'}
                      </div>
                      <div className="text-sm text-muted">Neighborhood Class</div>
                    </div>
                  </div>

                  {/* Location Overview */}
                  {property.locationAnalysis.overview && (
                    <div className="bg-card rounded-xl border border-border/60 p-8">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-2xl">📍</span>
                        Location Overview
                      </h3>
                      <p className="text-muted leading-relaxed whitespace-pre-wrap">{property.locationAnalysis.overview}</p>
                    </div>
                  )}

                  {/* Nearby Employers */}
                  {property.locationAnalysis.nearbyEmployers && property.locationAnalysis.nearbyEmployers.length > 0 && (
                    <div className="bg-card rounded-xl border border-border/60 p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">🏢</span>
                        Major Employers Nearby
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {property.locationAnalysis.nearbyEmployers.map((employer: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-muted/5 rounded-lg">
                            <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-sm">{employer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Market Trends */}
                  {property.locationAnalysis.marketTrends && (
                    <div className="bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-xl border border-border/60 p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        Market Trends
                      </h3>
                      <p className="text-muted leading-relaxed">{property.locationAnalysis.marketTrends}</p>
                    </div>
                  )}
                </>
              )}

              {/* Rent Analysis */}
              {property.rentAnalysis && (
                <div className="bg-card rounded-xl border border-border/60 p-8">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="text-2xl">🏘️</span>
                    Rent Analysis
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-muted/5 rounded-lg">
                        <span className="text-sm text-muted">Current Rent/Unit</span>
                        <span className="font-semibold text-lg">{formatCurrency(property.rentAnalysis.currentRentPerUnit)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-muted/5 rounded-lg">
                        <span className="text-sm text-muted">Market Rent/Unit</span>
                        <span className="font-semibold text-lg text-green-600">{formatCurrency(property.rentAnalysis.marketRentPerUnit)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-muted/5 rounded-lg">
                        <span className="text-sm text-muted">Stabilization Timeline</span>
                        <span className="font-semibold">{property.rentAnalysis.stabilizationTimeline}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <span className="text-sm text-green-700">Monthly Rent Upside</span>
                        <span className="font-bold text-lg text-green-700">{formatCurrency(property.rentAnalysis.monthlyRentUpside)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <span className="text-sm text-green-700">Annual Rent Upside</span>
                        <span className="font-bold text-lg text-green-700">{formatCurrency(property.rentAnalysis.annualRentUpside)}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-muted/5 rounded-lg">
                        <span className="text-sm text-muted">Rent Growth Rate</span>
                        <span className="font-semibold">{formatPercent(property.rentAnalysis.rentGrowthRate)}/ year</span>
                      </div>
                    </div>
                  </div>

                  {/* Unit Mix */}
                  {property.rentAnalysis.totalUnits && (
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-border/60">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{property.rentAnalysis.totalUnits}</div>
                        <div className="text-sm text-muted">Total Units</div>
                      </div>
                      <svg className="w-8 h-8 text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-3-3H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{property.rentAnalysis.vacantUnits || 0}</div>
                        <div className="text-sm text-muted">Vacant Units</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <div className="p-8 space-y-8">
              {/* Property Metrics Dashboard */}
              {property.propertyMetrics && (
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Key Investment Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Price/Sq Ft', value: formatCurrency(property.propertyMetrics.pricePerSqft), color: 'blue' },
                      { label: 'Price/Unit', value: formatCurrency(property.propertyMetrics.pricePerUnit), color: 'purple' },
                      { label: 'GRM', value: property.propertyMetrics.grossRentMultiplier?.toFixed(2), color: 'indigo' },
                      { label: 'DSCR', value: property.propertyMetrics.debtServiceCoverageRatio?.toFixed(2), color: 'green' },
                      { label: 'Break-Even', value: formatPercent(property.propertyMetrics.breakEvenOccupancy), color: 'amber' },
                      { label: 'IRR', value: formatPercent(property.propertyMetrics.internalRateOfReturn), color: 'emerald' },
                      { label: 'Equity Multiple', value: `${property.propertyMetrics.equityMultiple?.toFixed(2)}x`, color: 'teal' },
                      { label: 'Payback Period', value: `${property.propertyMetrics.paybackPeriod?.toFixed(1)} yrs`, color: 'cyan' },
                    ].map((metric, index) => (
                      <div key={index} className={`bg-gradient-to-br from-${metric.color}-500/10 to-${metric.color}-600/10 rounded-xl p-6 border border-${metric.color}-500/20`}>
                        <div className="text-sm text-muted mb-2">{metric.label}</div>
                        <div className="text-2xl font-bold">{metric.value || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financing Scenarios */}
              {property.financingScenarios && property.financingScenarios.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    Financing Scenarios
                  </h3>
                  <div className="space-y-6">
                    {property.financingScenarios.map((scenario: FinancingScenario, index: number) => (
                      <div key={index} className="bg-card rounded-xl border border-border/60 overflow-hidden">
                        <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 p-6 border-b border-border/60">
                          <h4 className="text-lg font-semibold">{scenario.name}</h4>
                          <p className="text-sm text-muted mt-1">{scenario.description}</p>
                        </div>
                        <div className="p-6">
                          <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted">Down Payment</span>
                                <span className="font-medium">{formatCurrency(scenario.downPayment)} ({scenario.downPaymentPercent}%)</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted">Interest Rate</span>
                                <span className="font-medium">{scenario.interestRate}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted">Loan Term</span>
                                <span className="font-medium">{scenario.loanTerm} years</span>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted">Monthly P&I</span>
                                <span className="font-medium">{formatCurrency(scenario.monthlyPI)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted">Total Cash Req.</span>
                                <span className="font-medium">{formatCurrency(scenario.totalCashRequired)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted">Closing Costs</span>
                                <span className="font-medium">{formatCurrency(scenario.closingCosts)}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted">
                                  {property.strategy?.toLowerCase().includes('house hack') ? 'Effective Mortgage' : 'Monthly Cash Flow'}
                                </span>
                                <span className={`font-bold ${
                                  property.strategy?.toLowerCase().includes('house hack') && (scenario.monthlyCashFlow ?? 0) < 0
                                    ? 'text-blue-600'
                                    : (scenario.monthlyCashFlow ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {property.strategy?.toLowerCase().includes('house hack') && (scenario.monthlyCashFlow ?? 0) < 0
                                    ? formatCurrency(Math.abs(scenario.monthlyCashFlow))
                                    : formatCurrency(scenario.monthlyCashFlow)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted">Cash-on-Cash</span>
                                <span className="font-bold text-blue-600">{formatPercent(scenario.cashOnCashReturn)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted">Total ROI</span>
                                <span className="font-bold text-purple-600">{formatPercent(scenario.totalROI)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Pros and Cons */}
                          {(scenario.pros || scenario.cons) && (
                            <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/60">
                              {scenario.pros && scenario.pros.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-green-700 mb-3">Advantages</h5>
                                  <ul className="space-y-2">
                                    {scenario.pros.map((pro: string, i: number) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm text-muted">{pro}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {scenario.cons && scenario.cons.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-red-700 mb-3">Considerations</h5>
                                  <ul className="space-y-2">
                                    {scenario.cons.map((con: string, i: number) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span className="text-sm text-muted">{con}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operating Expenses */}
              {property.expenses && (
                <div className="bg-card rounded-xl border border-border/60 p-8">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    Monthly Operating Expenses
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Property Tax', value: property.expenses.propertyTax },
                      { label: 'Insurance', value: property.expenses.insurance },
                      { label: 'HOA Fees', value: property.expenses.hoa },
                      { label: 'Utilities', value: property.expenses.utilities },
                      { label: 'Maintenance', value: property.expenses.maintenance },
                      { label: 'Property Management', value: property.expenses.propertyManagement },
                    ].filter(item => item.value).map((expense, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-muted/5 rounded-lg">
                        <span className="text-sm text-muted">{expense.label}</span>
                        <span className="font-medium">{formatCurrency(expense.value)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-4 bg-red-500/10 rounded-lg border border-red-500/20 mt-4">
                      <span className="font-medium text-red-700">Total Monthly Expenses</span>
                      <span className="font-bold text-lg text-red-700">{formatCurrency(property.expenses.totalMonthly)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 30-Year Projections Tab */}
          {activeTab === 'projections' && property.thirtyYearProjections && (
            <div className="p-8 space-y-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                30-Year Financial Projections
              </h3>
              
              {/* Assumptions */}
              {property.thirtyYearProjections.assumptions && (
                <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl border border-border/60 p-6">
                  <h4 className="font-semibold mb-4">Projection Assumptions</h4>
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      { label: 'Rent Growth', value: formatPercent(property.thirtyYearProjections.assumptions.rentGrowthRate), icon: '📈' },
                      { label: 'Expense Growth', value: formatPercent(property.thirtyYearProjections.assumptions.expenseGrowthRate), icon: '📊' },
                      { label: 'Appreciation', value: formatPercent(property.thirtyYearProjections.assumptions.appreciationRate), icon: '🏠' },
                      { label: 'Vacancy Rate', value: formatPercent(property.thirtyYearProjections.assumptions.vacancyRate), icon: '🔑' },
                    ].map((item, index) => (
                      <div key={index} className="text-center p-4 bg-card rounded-lg border border-border/60">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="text-sm text-muted mb-1">{item.label}</div>
                        <div className="font-bold text-lg">{item.value} / year</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Projections Table */}
              {property.thirtyYearProjections.projections && (
                <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/10 border-b border-border/60">
                          <th className="px-6 py-4 text-left text-sm font-semibold">Year</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Gross Rent</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">NOI</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Cash Flow</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Property Value</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Equity</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold">Total ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {property.thirtyYearProjections.projections
                          .filter((p: ProjectionData) => [1, 2, 3, 5, 10, 20, 30].includes(p.year))
                          .map((projection: ProjectionData, index: number) => (
                          <tr key={projection.year} className={`border-b border-border/30 hover:bg-muted/5 transition-colors ${
                            index % 2 === 0 ? 'bg-muted/5' : ''
                          }`}>
                            <td className="px-6 py-4 font-medium">Year {projection.year}</td>
                            <td className="px-6 py-4 text-right">{formatCurrency(projection.grossRent)}</td>
                            <td className="px-6 py-4 text-right">{formatCurrency(projection.netOperatingIncome)}</td>
                            <td className={`px-6 py-4 text-right font-medium ${
                              (projection.cashFlow ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(projection.cashFlow)}
                            </td>
                            <td className="px-6 py-4 text-right">{formatCurrency(projection.propertyValue)}</td>
                            <td className="px-6 py-4 text-right font-medium text-blue-600">
                              {formatCurrency(projection.equity)}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-purple-600">
                              {formatPercent(projection.totalROI)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-t border-border/60">
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-sm text-muted mb-1">Total Cash Flow (30 Years)</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(property.thirtyYearProjections.projections[property.thirtyYearProjections.projections.length - 1]?.cumulativeCashFlow)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted mb-1">Final Property Value</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(property.thirtyYearProjections.projections[property.thirtyYearProjections.projections.length - 1]?.propertyValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted mb-1">30-Year Total ROI</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPercent(property.thirtyYearProjections.projections[property.thirtyYearProjections.projections.length - 1]?.totalROI)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Exit Strategies */}
              {property.exitStrategies && property.exitStrategies.length > 0 && (
                <div className="bg-card rounded-xl border border-border/60 p-8">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="text-2xl">🚪</span>
                    Exit Strategies
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {property.exitStrategies.map((strategy: ExitStrategy, index: number) => (
                      <div key={index} className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl border border-border/60 p-6">
                        <h4 className="font-semibold mb-2">{strategy.strategy}</h4>
                        <p className="text-sm text-muted mb-4">{strategy.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted">Timeline</span>
                            <span className="font-medium">{strategy.timeline}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted">Est. Profit</span>
                            <span className="font-bold text-green-600">{formatCurrency(strategy.estimatedProfit)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border/60 bg-muted/5 flex justify-between items-center">
          <div className="text-sm text-muted">
            Property ID: {property.id} • Added {new Date(property.createdAt).toLocaleDateString()}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}