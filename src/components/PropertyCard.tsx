'use client';

import FavoriteButton from '@/components/FavoriteButton';
import SavePropertyButton from '@/components/SavePropertyButton';
import ViewerTracker from '@/components/ViewerTracker';
import ActivityBadges from '@/components/ActivityBadges';

interface PropertyCardProps {
  deal: {
    id: number;
    title: string;
    address?: string;
    location: string;
    type: string;
    strategy: string;
    price: number;
    downPayment: number;
    confidence: string;
    status?: string;
    daysOnMarket?: number;
    images?: string[];
    features?: string[];
    riskLevel?: string;
    proFormaCapRate?: string;
    roi?: string;
    totalROI?: number;
    capRate?: string | number;
    proFormaCashFlow?: string;
    monthlyCashFlow?: number;
    rehabCosts?: number;
    flipROI?: number;
    [key: string]: unknown;
  };
  viewMode?: 'grid' | 'list';
  onViewDetails?: () => void;
  isPreview?: boolean;
}

export default function PropertyCard({ deal, viewMode = 'grid', onViewDetails, isPreview = false }: PropertyCardProps) {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    }
  };

  return (
    <div 
      className={`bg-card rounded-xl border border-border/60 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:border-accent/30 md:hover:scale-[1.02] md:hover:-translate-y-1 cursor-pointer group ${viewMode === 'list' ? 'p-4 sm:p-6' : 'overflow-hidden'}`}
    >
      {viewMode === 'grid' && (
        <div className="relative h-48 bg-muted/20 overflow-hidden">
          {/* Property Image */}
          {deal.images && deal.images.length > 0 && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={deal.images[0]} 
                alt={deal.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </>
          )}
          
          {/* Top overlay - confidence and activity badges */}
          <div className="absolute top-4 left-4 z-10 flex items-start gap-2">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
              deal.confidence === 'high' ? 'bg-green-500/20 text-green-600' :
              deal.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
              'bg-red-500/20 text-red-600'
            }`}>
              {(deal.confidence || 'medium').toUpperCase()}
            </span>
            {!isPreview && <ActivityBadges deal={deal} />}
          </div>
          
          {/* Top right - deal type and favorite */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <span className="px-2 py-1 bg-accent/20 text-accent rounded-md text-xs font-medium">
              {deal.type || 'Single Family'}
            </span>
            {!isPreview && <FavoriteButton propertyId={deal.id} size="medium" />}
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          
          {/* Bottom overlay - viewer count and time */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="flex items-end justify-between">
              {!isPreview && <ViewerTracker dealId={deal.id} />}
              <div className="text-white text-xs opacity-80">
                {deal.daysOnMarket || 0} days ago
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={viewMode === 'grid' ? 'p-4 sm:p-6' : ''}>
        {/* Property Info Section */}
        <div className="mb-3">
          <h3 className="text-base sm:text-lg font-bold text-primary mb-1 line-clamp-1">
            {deal.address || deal.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted/80 mb-2">
            {deal.location}
          </p>
          
          {/* Price Display for Grid View */}
          {viewMode === 'grid' && (
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl sm:text-2xl font-bold text-primary">
                ${(deal.price / 1000).toFixed(0)}K
              </span>
              <span className="text-xs text-muted">Purchase Price</span>
            </div>
          )}
          {/* Tags and Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 bg-accent/10 text-accent rounded-md text-xs font-medium">
              {deal.strategy || 'Buy & Hold'}
            </span>
            
            {deal.riskLevel && (
              <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-xs font-medium ${
                deal.riskLevel === 'low' ? 'bg-green-50 text-green-700 border border-green-200' :
                deal.riskLevel === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                deal.riskLevel === 'very high' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-orange-50 text-orange-700 border border-orange-200'
              }`}>
                {(deal.riskLevel || 'medium').toUpperCase()} RISK
              </span>
            )}
            
            {deal.type && deal.type !== 'Single Family' && (
              <span className="inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-medium">
                {deal.type}
              </span>
            )}
            
            {!isPreview && <ActivityBadges deal={deal} />}
            {viewMode === 'list' && !isPreview && <ViewerTracker dealId={deal.id} />}
          </div>
        </div>
          {viewMode === 'list' && (
          <div className="flex items-start gap-2 sm:gap-4">
            {!isPreview && <FavoriteButton propertyId={deal.id} size="medium" />}
            <div className="text-right">
              <div className="text-lg sm:text-2xl font-bold text-primary">
                ${(deal.price / 1000).toFixed(0)}K
              </div>
              <div className="text-[10px] sm:text-sm text-muted">Purchase Price</div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Down Payment */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-muted mb-0.5">Down Payment</div>
            <div className="text-base font-bold text-primary">
              ${(deal.downPayment/1000).toFixed(0)}K
            </div>
          </div>
          
          {/* Rehab Costs */}
          {deal.rehabCosts && deal.rehabCosts > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2.5 border border-orange-200 dark:border-orange-800">
              <div className="text-[11px] text-muted mb-0.5">Rehab Costs</div>
              <div className="text-base font-bold text-orange-600">
                ${(deal.rehabCosts/1000).toFixed(0)}K
              </div>
            </div>
          )}
          
          {/* Cap Rate */}
          {(deal.proFormaCapRate || deal.capRate) && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2.5 border border-purple-200 dark:border-purple-800">
              <div className="text-[11px] text-muted mb-0.5">Pro Forma Cap</div>
              <div className="text-base font-bold text-purple-600">
                {deal.proFormaCapRate || 
                 (typeof deal.capRate === 'number' ? `${deal.capRate.toFixed(1)}%` : deal.capRate)}
              </div>
            </div>
          )}
          
          {/* ROI */}
          {(deal.roi || deal.totalROI || deal.flipROI) && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 border border-green-200 dark:border-green-800">
              <div className="text-[11px] text-muted mb-0.5">
                {deal.strategy === 'Fix & Flip' || deal.strategy === 'Flip' ? 'Flip ROI' : 'Total ROI'}
              </div>
              <div className="text-base font-bold text-green-600">
                {deal.flipROI && (deal.strategy === 'Fix & Flip' || deal.strategy === 'Flip') 
                  ? `${deal.flipROI}%`
                  : (deal.roi || `${(deal.totalROI || 0).toFixed(1)}%`)}
              </div>
            </div>
          )}
          
          {/* Cash Flow */}
          {(deal.proFormaCashFlow || deal.monthlyCashFlow !== undefined) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5 border border-blue-200 dark:border-blue-800">
              <div className="text-[11px] text-muted mb-0.5">Monthly Cash Flow</div>
              <div className="text-base font-bold text-blue-600">
                ${deal.proFormaCashFlow || `${deal.monthlyCashFlow || 0}`}/mo
              </div>
            </div>
          )}
        </div>

        {/* Property Features */}
        {deal.features && deal.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {deal.features.slice(0, 3).map((feature: string, index: number) => (
              <span 
                key={index} 
                className="inline-flex items-center text-[11px] px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
              >
                • {feature}
              </span>
            ))}
            {deal.features.length > 3 && (
              <span className="inline-flex items-center text-[11px] px-2 py-1 text-muted">
                +{deal.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Call-to-Action Area */}
        <div className="flex gap-2 pt-3 border-t border-border/40">
          <button 
            className="flex-1 px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2"
            onClick={handleViewDetails}
          >
            View Full Analysis
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {!isPreview && (
            <SavePropertyButton 
              propertyId={deal.id} 
              variant="outline"
              className="text-sm px-4 min-h-[44px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}