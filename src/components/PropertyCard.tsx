'use client';

import FavoriteButton from '@/components/FavoriteButton';
import SavePropertyButton from '@/components/SavePropertyButton';
import ViewerTracker from '@/components/ViewerTracker';
import ActivityBadges from '@/components/ActivityBadges';

interface PropertyCardProps {
  deal: {
    id: number;
    title: string;
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
      className={`bg-card rounded-xl border border-border/60 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:border-accent/30 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer group ${viewMode === 'list' ? 'p-6' : 'overflow-hidden'}`}
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
      
      <div className={viewMode === 'grid' ? 'p-6' : ''}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary mb-1">{deal.title}</h3>
            <p className="text-sm text-muted mb-2">{deal.location}</p>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium">
                {deal.strategy || 'Buy & Hold'}
              </span>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                deal.riskLevel === 'low' ? 'bg-green-500/20 text-green-600' :
                deal.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                'bg-red-500/20 text-red-600'
              }`}>
                {(deal.riskLevel || 'medium').toUpperCase()} RISK
              </span>
              {!isPreview && <ActivityBadges deal={deal} />}
              {viewMode === 'list' && !isPreview && <ViewerTracker dealId={deal.id} />}
            </div>
          </div>
          {viewMode === 'list' && (
            <div className="flex items-start gap-4">
              {!isPreview && <FavoriteButton propertyId={deal.id} size="medium" />}
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">${deal.price.toLocaleString()}</div>
                <div className="text-sm text-muted">Purchase Price</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-4">
          {viewMode === 'grid' && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Purchase Price</span>
              <span className="font-semibold text-primary">${deal.price.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted">Down Payment</span>
            <span className="font-semibold text-primary">${deal.downPayment.toLocaleString()}</span>
          </div>
          
          {(deal.proFormaCapRate || deal.capRate) && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Pro Forma Cap</span>
              <span className="font-semibold text-accent">
                {deal.proFormaCapRate || 
                 (typeof deal.capRate === 'number' ? `${deal.capRate.toFixed(1)}%` : deal.capRate)}
              </span>
            </div>
          )}
          
          {(deal.roi || deal.totalROI) && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">ROI</span>
              <span className="font-semibold text-green-600">
                {deal.roi || `${(deal.totalROI || 0).toFixed(1)}%`}
              </span>
            </div>
          )}
          
          {(deal.proFormaCashFlow || deal.monthlyCashFlow !== undefined) && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Cash Flow</span>
              <span className="font-semibold text-green-600">
                ${deal.proFormaCashFlow || `${deal.monthlyCashFlow || 0}/mo`}
              </span>
            </div>
          )}
        </div>

        {deal.features && deal.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {deal.features.slice(0, 3).map((feature: string, index: number) => (
              <span key={index} className="text-xs px-2 py-1 bg-muted/10 text-muted rounded-md">
                {feature}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button 
            className="flex-1 px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm min-h-[44px] flex items-center justify-center"
            onClick={handleViewDetails}
          >
            View Details
          </button>
          {!isPreview && (
            <SavePropertyButton 
              propertyId={deal.id} 
              variant="outline"
            />
          )}
        </div>
      </div>
    </div>
  );
}