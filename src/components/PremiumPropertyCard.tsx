'use client';

import { useState } from 'react';
import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton';
import SavePropertyButton from '@/components/SavePropertyButton';
import ViewerTracker from '@/components/ViewerTracker';
import ActivityBadges from '@/components/ActivityBadges';
import type { PropertyData } from '@/types/property';

interface PremiumPropertyCardProps {
  deal: {
    id: number;
    title: string;
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

  // Get metric color
  const getMetricColor = (value: number | string | undefined, type: 'positive' | 'neutral' = 'positive') => {
    if (!value) return 'text-muted';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
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
                  <p className="text-sm text-muted">{deal.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{formatCurrency(deal.price)}</div>
                  <div className="text-xs text-muted">Purchase Price</div>
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
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted mb-1">Down Payment</div>
                  <div className="font-semibold">{formatCurrency(deal.downPayment)}</div>
                </div>
                {deal.totalROI && (
                  <div>
                    <div className="text-xs text-muted mb-1">Total ROI</div>
                    <div className={`font-semibold ${getMetricColor(deal.totalROI)}`}>
                      {deal.totalROI}%
                    </div>
                  </div>
                )}
                {deal.capRate && (
                  <div>
                    <div className="text-xs text-muted mb-1">Cap Rate</div>
                    <div className={`font-semibold ${getMetricColor(deal.capRate)}`}>
                      {typeof deal.capRate === 'number' ? deal.capRate.toFixed(1) : deal.capRate}%
                    </div>
                  </div>
                )}
                {deal.monthlyCashFlow !== undefined && (
                  <div>
                    <div className="text-xs text-muted mb-1">Cash Flow</div>
                    <div className={`font-semibold ${deal.monthlyCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(deal.monthlyCashFlow)}/mo
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
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
            <div className="flex items-end justify-between">
              <div className="text-white">
                <h3 className="text-xl font-bold mb-1">{deal.title}</h3>
                <p className="text-sm opacity-90">{deal.location}</p>
              </div>
              <div className="text-right text-white">
                <div className="text-2xl font-bold">{formatCurrency(deal.price)}</div>
                <div className="text-xs opacity-80">{deal.daysOnMarket || 0} days ago</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-6">
          {/* Strategy and Risk Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
              {deal.strategy}
            </span>
            {deal.riskLevel && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(deal.riskLevel)}`}>
                {deal.riskLevel.toUpperCase()} RISK
              </span>
            )}
            {deal.bedrooms && (
              <span className="px-3 py-1 bg-muted/10 text-muted rounded-full text-xs font-medium">
                {deal.bedrooms} BR / {deal.bathrooms} BA
              </span>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Down Payment */}
            <div className="p-3 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-lg border border-blue-500/10">
              <div className="text-xs text-muted mb-1">Down Payment</div>
              <div className="font-bold text-lg">{formatCurrency(deal.downPayment)}</div>
              {deal.downPaymentPercent && (
                <div className="text-xs text-muted">{deal.downPaymentPercent}% down</div>
              )}
            </div>

            {/* Total ROI */}
            {deal.totalROI ? (
              <div className="p-3 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-lg border border-green-500/10">
                <div className="text-xs text-muted mb-1">Total ROI</div>
                <div className={`font-bold text-lg ${getMetricColor(deal.totalROI)}`}>
                  {deal.totalROI}%
                </div>
                <div className="text-xs text-muted">5-year return</div>
              </div>
            ) : deal.roi ? (
              <div className="p-3 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-lg border border-green-500/10">
                <div className="text-xs text-muted mb-1">ROI</div>
                <div className={`font-bold text-lg ${getMetricColor(deal.roi)}`}>
                  {deal.roi}%
                </div>
              </div>
            ) : null}

            {/* Cap Rate */}
            {(deal.capRate || deal.proFormaCapRate) && (
              <div className="p-3 bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-lg border border-purple-500/10">
                <div className="text-xs text-muted mb-1">
                  {deal.proFormaCapRate ? 'Pro Forma Cap' : 'Cap Rate'}
                </div>
                <div className={`font-bold text-lg ${getMetricColor(deal.proFormaCapRate || deal.capRate)}`}>
                  {deal.proFormaCapRate || deal.capRate}%
                </div>
                {deal.currentCapRate && (
                  <div className="text-xs text-muted">Current: {deal.currentCapRate}%</div>
                )}
              </div>
            )}

            {/* Cash Flow */}
            {(deal.monthlyCashFlow !== undefined || deal.proFormaCashFlow) && (
              <div className={`p-3 bg-gradient-to-br ${
                (deal.monthlyCashFlow ?? parseFloat(String(deal.proFormaCashFlow ?? '0'))) >= 0 
                  ? 'from-emerald-500/5 to-emerald-600/5 border-emerald-500/10' 
                  : 'from-red-500/5 to-red-600/5 border-red-500/10'
              } rounded-lg border`}>
                <div className="text-xs text-muted mb-1">Monthly Cash Flow</div>
                <div className={`font-bold text-lg ${
                  (deal.monthlyCashFlow ?? parseFloat(String(deal.proFormaCashFlow ?? '0'))) >= 0 
                    ? 'text-emerald-600' 
                    : 'text-red-600'
                }`}>
                  {deal.proFormaCashFlow 
                    ? `$${deal.proFormaCashFlow}` 
                    : formatCurrency(deal.monthlyCashFlow || 0)}
                </div>
                <div className="text-xs text-muted">per month</div>
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

            {/* Monthly Rent */}
            {deal.monthlyRent && (
              <div className="p-3 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 rounded-lg border border-indigo-500/10">
                <div className="text-xs text-muted mb-1">Monthly Rent</div>
                <div className="font-bold text-lg text-indigo-600">
                  {formatCurrency(deal.monthlyRent)}
                </div>
                <div className="text-xs text-muted">gross income</div>
              </div>
            )}
          </div>

          {/* Features Preview */}
          {deal.features && deal.features.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {deal.features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="text-xs text-muted">
                    • {feature}
                  </span>
                ))}
                {deal.features.length > 3 && (
                  <span className="text-xs text-accent">
                    +{deal.features.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <div className="flex items-center gap-3">
              {!isPreview && !isEditing && <SavePropertyButton propertyId={deal.id} />}
              {!isPreview && <ViewerTracker dealId={deal.id} />}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="text-sm text-accent hover:text-accent/80 font-medium flex items-center gap-1"
            >
              View Full Analysis
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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