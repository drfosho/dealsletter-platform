'use client';

import { useState } from 'react';
import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton';
import SavePropertyButton from '@/components/SavePropertyButton';
import ViewerTracker from '@/components/ViewerTracker';
import ActivityBadges from '@/components/ActivityBadges';
import type { PropertyData } from '@/types/property';
import { 
  isHouseHackProperty, 
  calculateEffectiveMortgage,
  getEffectiveMortgageColor,
  calculateMonthlyMortgage 
} from '@/utils/house-hack-calculations';

interface PremiumPropertyCardProps {
  deal: {
    id: number;
    title: string;
    address?: string;
    location: string;
    type: string;
    strategy: string;
    price: number;
    downPayment: number;
    downPaymentPercent?: number;
    confidence: string;
    status?: string;
    daysOnMarket?: number;
    images?: string[];
    features?: string[];
    riskLevel?: string;
    proFormaCapRate?: string | number;
    roi?: string | number;
    totalROI?: number;
    capRate?: string | number;
    currentCapRate?: number;
    proFormaCashFlow?: string | number;
    monthlyCashFlow?: number;
    cashOnCashReturn?: number;
    monthlyRent?: number;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    // Fix & Flip specific
    estimatedProfit?: number;
    arv?: number;
    estimatedRehab?: number;
    renovationCosts?: number;
    // BRRRR specific
    equityCreated?: number;
    refinanceAmount?: number;
    // Comprehensive data from admin
    strategicOverview?: string;
    executiveSummary?: string;
    valueAddDescription?: string;
    locationAnalysis?: any;
    rentAnalysis?: any;
    propertyMetrics?: any;
    financingScenarios?: any[];
    thirtyYearProjections?: any;
    [key: string]: unknown;
  };
  viewMode?: 'grid' | 'list';
  onViewDetails?: () => void;
  isPreview?: boolean;
  isEditing?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: (deal: PropertyData) => void;
  onCancel?: () => void;
  showAdminControls?: boolean;
}

export default function PremiumPropertyCard({ 
  deal, 
  viewMode = 'grid', 
  onViewDetails, 
  isPreview = false,
  isEditing = false,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  showAdminControls = false
}: PremiumPropertyCardProps) {
  const [editedDeal] = useState(deal);
  const [imageError, setImageError] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(editedDeal);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails && !isEditing) {
      onViewDetails();
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Check if this is a house hack property
  const isHouseHack = isHouseHackProperty(deal.strategy);
  
  // Calculate effective mortgage for house hacks using shared utility
  const effectiveMortgage = isHouseHack ? 
    calculateEffectiveMortgage(
      deal.price, 
      deal.downPaymentPercent || 25,
      deal.monthlyRent || 0,
      deal.interestRate ? Number(deal.interestRate) / 100 : undefined // Convert to decimal if provided
    ) : 0;
  
  // Get the total mortgage payment for display
  const totalMortgage = isHouseHack ? 
    calculateMonthlyMortgage(
      deal.price, 
      deal.downPaymentPercent || 25,
      deal.interestRate ? Number(deal.interestRate) / 100 : undefined // Convert to decimal if provided
    ) : 0;

  // Get metric color with strategy-specific logic
  const getMetricColor = (value: number | string | undefined, type: 'positive' | 'neutral' = 'positive') => {
    if (!value) return 'text-muted';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Strategy-specific coloring
    if (deal.strategy?.toLowerCase().includes('flip')) {
      // For flips, emphasize high ROI
      if (numValue >= 30) return 'text-green-600 font-bold';
      if (numValue >= 20) return 'text-green-600';
      if (numValue >= 15) return 'text-blue-600';
      if (numValue >= 10) return 'text-amber-600';
      return 'text-muted';
    } else if (deal.strategy?.toLowerCase().includes('rental') || deal.strategy?.toLowerCase().includes('hold')) {
      // For rentals, emphasize cash flow and cap rate
      if (type === 'positive') {
        if (numValue >= 10) return 'text-green-600 font-bold';
        if (numValue >= 8) return 'text-green-600';
        if (numValue >= 6) return 'text-blue-600';
        if (numValue >= 4) return 'text-amber-600';
        return 'text-muted';
      }
    } else if (deal.strategy?.toLowerCase().includes('brrrr')) {
      // For BRRRR, emphasize cash-on-cash return
      if (numValue >= 20) return 'text-green-600 font-bold';
      if (numValue >= 15) return 'text-green-600';
      if (numValue >= 10) return 'text-blue-600';
      if (numValue >= 5) return 'text-amber-600';
      return 'text-muted';
    }
    
    // Default coloring
    if (type === 'positive') {
      if (numValue >= 20) return 'text-green-600';
      if (numValue >= 10) return 'text-blue-600';
      if (numValue >= 5) return 'text-amber-600';
      return 'text-muted';
    }
    
    return 'text-primary';
  };

  // Get confidence color
  const getConfidenceColor = (confidence: string) => {
    switch(confidence.toLowerCase()) {
      case 'very high':
      case 'high':
        return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      default:
        return 'bg-red-500/10 text-red-700 border-red-500/30';
    }
  };

  // Get risk color
  const getRiskColor = (risk: string) => {
    switch(risk?.toLowerCase()) {
      case 'low':
        return 'bg-green-500/10 text-green-700 border-green-500/30';
      case 'medium':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/30';
      default:
        return 'bg-red-500/10 text-red-700 border-red-500/30';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="relative group">
        <div 
          className={`bg-card rounded-xl border border-border/60 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:border-accent/30 cursor-pointer ${isEditing ? 'ring-2 ring-accent' : ''}`}
          onClick={handleViewDetails}
        >
          <div className="flex items-start gap-6">
            {/* Image */}
            <div className="relative w-48 h-32 rounded-lg overflow-hidden bg-muted/20 flex-shrink-0">
              {deal.images && deal.images.length > 0 && !imageError ? (
                <Image
                  src={deal.images[0]}
                  alt={deal.title}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="w-12 h-12 text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className={`px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm ${getConfidenceColor(deal.confidence || 'medium')}`}>
                  {(deal.confidence || 'medium').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">{deal.title}</h3>
                  {deal.address && (
                    <p className="text-sm text-muted mb-0.5">{deal.address}</p>
                  )}
                  <p className="text-xs text-muted">{deal.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(deal.isOnMarket && deal.avm ? Number(deal.avm) : deal.price)}
                  </div>
                  <div className="text-xs text-muted">
                    {deal.isOnMarket && deal.avm && Math.abs(Number(deal.avm) - deal.price) > 50000 
                      ? 'AVM Estimate' 
                      : 'Purchase Price'}
                  </div>
                  {deal.isOnMarket && deal.avm && Math.abs(Number(deal.avm) - deal.price) > 50000 ? (
                    <div className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                      List: {formatCurrency(deal.price)}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium">
                  {deal.strategy}
                </span>
                <span className="px-2 py-1 bg-purple-500/10 text-purple-700 rounded-md text-xs font-medium">
                  {deal.type}
                </span>
                {deal.riskLevel && (
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getRiskColor(deal.riskLevel)}`}>
                    {deal.riskLevel.toUpperCase()} RISK
                  </span>
                )}
                {!isPreview && <ActivityBadges deal={deal} />}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div>
                  <div className="text-[10px] sm:text-xs text-muted mb-1">Down Payment</div>
                  <div className="font-semibold text-sm sm:text-base">{formatCurrency(deal.downPayment)}</div>
                </div>
                {deal.totalROI && (
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted mb-1">Total ROI</div>
                    <div className={`font-semibold text-sm sm:text-base ${getMetricColor(deal.totalROI)}`}>
                      {deal.totalROI}%
                    </div>
                  </div>
                )}
                {deal.capRate && (
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted mb-1">Cap Rate</div>
                    <div className={`font-semibold text-sm sm:text-base ${getMetricColor(deal.capRate)}`}>
                      {typeof deal.capRate === 'number' ? deal.capRate.toFixed(1) : deal.capRate}%
                    </div>
                  </div>
                )}
                {deal.units && Number(deal.units) > 1 && deal.monthlyRent ? (
                  <div>
                    <div className="text-[10px] sm:text-xs text-muted mb-1">Rent/Unit</div>
                    <div className="font-semibold text-sm sm:text-base">
                      {formatCurrency(Math.round(deal.monthlyRent / Number(deal.units)))}/mo
                    </div>
                  </div>
                ) : null}
                {deal.monthlyCashFlow !== undefined && (
                  <div>
                    <div className="text-xs text-muted mb-1">
                      {isHouseHack ? 'Effective Mortgage' : 'Cash Flow'}
                    </div>
                    <div className={`font-semibold ${
                      isHouseHack 
                        ? getEffectiveMortgageColor(effectiveMortgage)
                        : deal.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isHouseHack 
                        ? formatCurrency(Math.abs(effectiveMortgage))
                        : formatCurrency(deal.monthlyCashFlow)}/mo
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                {!isPreview && !isEditing && (
                  <>
                    <SavePropertyButton propertyId={deal.id} />
                    <FavoriteButton propertyId={deal.id} size="small" />
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails();
                  }}
                  className="text-sm text-accent hover:text-accent/80 font-medium"
                >
                  View Full Analysis →
                </button>
                {!isPreview && <ViewerTracker dealId={deal.id} />}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        {showAdminControls && !isEditing && (
          <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
              title="Edit Property"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete();
              }}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg"
              title="Delete Property"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Grid View
  return (
    <div className="relative group">
      <div 
        className={`bg-card rounded-xl border border-border/60 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:border-accent/30 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer ${isEditing ? 'ring-2 ring-accent' : ''}`}
        onClick={handleViewDetails}
      >
        {/* Image Section */}
        <div className="relative h-56 bg-gradient-to-br from-muted/20 to-muted/10 overflow-hidden">
          {deal.images && deal.images.length > 0 && !imageError ? (
            <Image
              src={deal.images[0]}
              alt={deal.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="w-16 h-16 text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 z-10 flex items-start gap-2">
            <span className={`px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm border ${getConfidenceColor(deal.confidence || 'medium')}`}>
              {(deal.confidence || 'medium').toUpperCase()}
            </span>
            {!isPreview && <ActivityBadges deal={deal} />}
          </div>
          
          {/* Top Right Actions */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <span className="px-2 py-1 bg-accent/20 backdrop-blur-sm text-white border border-accent/30 rounded-md text-xs font-medium">
              {deal.type}
            </span>
            {!isPreview && !isEditing && <FavoriteButton propertyId={deal.id} size="medium" />}
          </div>
          
          {/* Bottom Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-4">
            <div className="flex items-end justify-between gap-2">
              <div className="text-white flex-1 min-w-0">
                <h3 className="text-base sm:text-xl font-bold mb-1 line-clamp-2">{deal.title}</h3>
                {deal.address && (
                  <p className="text-xs sm:text-sm opacity-90 truncate">{deal.address}</p>
                )}
                <p className="text-xs opacity-80 truncate">{deal.location}</p>
              </div>
              <div className="text-right text-white flex-shrink-0">
                <div className="text-lg sm:text-2xl font-bold">{formatCurrency(deal.price)}</div>
                <div className="text-[10px] sm:text-xs opacity-80">{deal.daysOnMarket || 0} days ago</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-4 sm:p-6">
          {/* Strategy and Risk Badges */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-accent/10 text-accent rounded-full text-[10px] sm:text-xs font-medium">
              {deal.strategy}
            </span>
            {deal.riskLevel && (
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${getRiskColor(deal.riskLevel)}`}>
                <span className="hidden sm:inline">{deal.riskLevel.toUpperCase()} RISK</span>
                <span className="sm:hidden">{deal.riskLevel.toUpperCase()}</span>
              </span>
            )}
            {deal.bedrooms && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-muted/10 text-muted rounded-full text-[10px] sm:text-xs font-medium">
                {deal.bedrooms}BR/{deal.bathrooms}BA
              </span>
            )}
            {deal.units && Number(deal.units) > 1 ? (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500/10 text-blue-700 rounded-full text-[10px] sm:text-xs font-medium">
                {String(deal.units)} UNITS
              </span>
            ) : null}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
            {/* Down Payment */}
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-lg border border-blue-500/10">
              <div className="text-[10px] sm:text-xs text-muted mb-1">Down Payment</div>
              <div className="font-bold text-sm sm:text-lg">{formatCurrency(deal.downPayment)}</div>
              {deal.downPaymentPercent && (
                <div className="text-[10px] sm:text-xs text-muted">{deal.downPaymentPercent}% down</div>
              )}
            </div>

            {/* Fix & Flip Specific Metrics */}
            {deal.strategy?.toLowerCase().includes('flip') && (
              <>
                {/* Estimated Profit */}
                {deal.estimatedProfit && (
                  <div className="p-2.5 sm:p-3 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 rounded-lg border border-emerald-500/10">
                    <div className="text-[10px] sm:text-xs text-muted mb-1">Est. Profit</div>
                    <div className="font-bold text-sm sm:text-lg text-emerald-600">
                      {formatCurrency(deal.estimatedProfit)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted">after all costs</div>
                  </div>
                )}
                {/* ARV */}
                {deal.arv && (
                  <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-lg border border-purple-500/10">
                    <div className="text-[10px] sm:text-xs text-muted mb-1">After Repair Value</div>
                    <div className="font-bold text-sm sm:text-lg text-purple-600">
                      {formatCurrency(deal.arv)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted">projected value</div>
                  </div>
                )}
              </>
            )}
            
            {/* Total ROI */}
            {deal.totalROI ? (
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-lg border border-green-500/10">
                <div className="text-[10px] sm:text-xs text-muted mb-1">
                  {deal.strategy?.toLowerCase().includes('flip') ? 'Project ROI' : 'Total ROI'}
                </div>
                <div className={`font-bold text-sm sm:text-lg ${getMetricColor(deal.totalROI)}`}>
                  {deal.totalROI}%
                </div>
                <div className="text-[10px] sm:text-xs text-muted">
                  {deal.strategy?.toLowerCase().includes('flip') ? 'on investment' : '5-year return'}
                </div>
              </div>
            ) : deal.roi ? (
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-lg border border-green-500/10">
                <div className="text-[10px] sm:text-xs text-muted mb-1">ROI</div>
                <div className={`font-bold text-sm sm:text-lg ${getMetricColor(deal.roi)}`}>
                  {deal.roi}%
                </div>
              </div>
            ) : null}

            {/* Cap Rate */}
            {(deal.capRate || deal.proFormaCapRate) && (
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-lg border border-purple-500/10">
                <div className="text-[10px] sm:text-xs text-muted mb-1">
                  {deal.proFormaCapRate ? 'Pro Forma Cap' : 'Cap Rate'}
                </div>
                <div className={`font-bold text-sm sm:text-lg ${getMetricColor(deal.proFormaCapRate || deal.capRate)}`}>
                  {deal.proFormaCapRate || deal.capRate}%
                </div>
                {deal.currentCapRate && (
                  <div className="text-[10px] sm:text-xs text-muted">Current: {deal.currentCapRate}%</div>
                )}
              </div>
            )}

            {/* Cash Flow or Effective Mortgage */}
            {(deal.monthlyCashFlow !== undefined || deal.proFormaCashFlow) && (
              <div className={`rounded-lg p-2.5 border ${
                isHouseHack 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : (deal.monthlyCashFlow ?? parseFloat(String(deal.proFormaCashFlow ?? '0'))) >= 0 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="text-[11px] text-muted mb-0.5">
                  {isHouseHack ? 'Effective Mortgage' : 'Cash Flow'}
                </div>
                <div className={`text-base font-bold ${
                  isHouseHack 
                    ? getEffectiveMortgageColor(effectiveMortgage)
                    : (deal.monthlyCashFlow ?? parseFloat(String(deal.proFormaCashFlow ?? '0'))) >= 0 
                      ? 'text-blue-600' 
                      : 'text-red-600'
                }`}>
                  {isHouseHack 
                    ? formatCurrency(Math.abs(effectiveMortgage))
                    : deal.proFormaCashFlow 
                      ? `$${deal.proFormaCashFlow}` 
                      : formatCurrency(deal.monthlyCashFlow || 0)}
                  {!isHouseHack && '/mo'}
                </div>
                {isHouseHack && <div className="text-[10px] text-muted">after rent</div>}
              </div>
            )}

            {/* Cash-on-Cash Return */}
            {deal.cashOnCashReturn && (
              <div className="p-3 bg-gradient-to-br from-amber-500/5 to-amber-600/5 rounded-lg border border-amber-500/10">
                <div className="text-xs text-muted mb-1">Cash-on-Cash</div>
                <div className={`font-bold text-lg ${getMetricColor(deal.cashOnCashReturn)}`}>
                  {deal.cashOnCashReturn}%
                </div>
                <div className="text-xs text-muted">annual return</div>
              </div>
            )}

            {/* Monthly Rent - Show differently for house hacks vs rentals */}
            {deal.monthlyRent && (
              <div className="p-3 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 rounded-lg border border-indigo-500/10">
                <div className="text-xs text-muted mb-1">
                  {isHouseHack ? 'Rental Income' : 'Monthly Rent'}
                </div>
                <div className="font-bold text-lg text-indigo-600">
                  {formatCurrency(deal.monthlyRent)}
                </div>
                <div className="text-xs text-muted">
                  {isHouseHack ? 'from tenant units' : 'gross income'}
                </div>
              </div>
            )}
            
            {/* Original Mortgage for House Hacks */}
            {isHouseHack && (
              <div className="p-3 bg-gradient-to-br from-gray-500/5 to-gray-600/5 rounded-lg border border-gray-500/10">
                <div className="text-xs text-muted mb-1">Total Mortgage</div>
                <div className="font-bold text-lg text-gray-600">
                  {formatCurrency(totalMortgage)}
                </div>
                <div className="text-xs text-muted">before rental income</div>
              </div>
            )}
          </div>

          {/* Features Preview */}
          {deal.features && deal.features.length > 0 && (
            <div className="mb-3 sm:mb-4">
              <div className="flex flex-wrap gap-1">
                {deal.features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="text-[10px] sm:text-xs text-muted">
                    • {feature}
                  </span>
                ))}
                {deal.features.length > 3 && (
                  <span className="text-[10px] sm:text-xs text-accent">
                    +{deal.features.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/60">
            <div className="flex items-center gap-2 sm:gap-3">
              {!isPreview && !isEditing && (
                <SavePropertyButton 
                  propertyId={deal.id} 
                  className="text-[10px] sm:text-xs px-2 sm:px-4 py-1.5 sm:py-2 min-h-[32px] sm:min-h-[40px]"
                />
              )}
              {!isPreview && <ViewerTracker dealId={deal.id} />}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="text-xs sm:text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors min-h-[32px] sm:min-h-[40px]"
            >
              <span className="sm:hidden">Analysis</span>
              <span className="hidden sm:inline">View Full Analysis</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      {(showAdminControls || isEditing) && (
        <div className={`absolute top-4 right-4 z-20 flex gap-2 ${!isEditing ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity`}>
          {isEditing ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg"
                title="Save Changes"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onCancel) onCancel();
                }}
                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-lg"
                title="Cancel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) onEdit();
                }}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
                title="Edit Property"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) onDelete();
                }}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg"
                title="Delete Property"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}