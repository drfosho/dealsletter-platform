'use client';

import { useState } from 'react';
import FavoriteButton from '@/components/FavoriteButton';
import SavePropertyButton from '@/components/SavePropertyButton';
import ViewerTracker from '@/components/ViewerTracker';
import ActivityBadges from '@/components/ActivityBadges';

interface PropertyCardEditableProps {
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
  isEditing?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: (deal: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  onCancel?: () => void;
  showAdminControls?: boolean;
}

export default function PropertyCardEditable({ 
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
}: PropertyCardEditableProps) {
  const [editedDeal, setEditedDeal] = useState(deal);

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

  return (
    <div className="relative group">
      <div 
        className={`bg-card rounded-xl border border-border/60 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:border-accent/30 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer group ${viewMode === 'list' ? 'p-6' : 'overflow-hidden'} ${isEditing ? 'ring-2 ring-accent' : ''}`}
        onClick={handleViewDetails}
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
                {deal.type}
              </span>
              {!isPreview && !isEditing && <FavoriteButton propertyId={deal.id} size="medium" />}
            </div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            
            {/* Bottom overlay - viewer count and time */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="flex items-end justify-between">
                {!isPreview && <ViewerTracker dealId={deal.id} />}
                <div className="text-white text-xs opacity-80">
                  {deal.daysOnMarket} days ago
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className={viewMode === 'grid' ? 'p-6' : ''}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedDeal.title}
                  onChange={(e) => setEditedDeal({...editedDeal, title: e.target.value})}
                  onClick={(e) => e.stopPropagation()}
                  className="text-lg font-semibold text-primary mb-1 bg-transparent border-b border-border/60 w-full"
                />
              ) : (
                <h3 className="text-lg font-semibold text-primary mb-1">{deal.title}</h3>
              )}
              <p className="text-sm text-muted mb-2">{deal.location}</p>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium">
                  {deal.strategy}
                </span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  deal.riskLevel === 'low' ? 'bg-green-500/20 text-green-600' :
                  deal.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                  'bg-red-500/20 text-red-600'
                }`}>
                  {(deal.riskLevel || 'medium').toUpperCase()} RISK
                </span>
                {!isPreview && viewMode === 'grid' && <ActivityBadges deal={deal} />}
                {!isPreview && viewMode === 'list' && <ViewerTracker dealId={deal.id} />}
              </div>
            </div>
            {viewMode === 'list' && !isEditing && (
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
                {isEditing ? (
                  <input
                    type="number"
                    value={editedDeal.price}
                    onChange={(e) => setEditedDeal({...editedDeal, price: Number(e.target.value)})}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-primary bg-transparent border-b border-border/60 text-right"
                  />
                ) : (
                  <span className="font-semibold text-primary">${deal.price.toLocaleString()}</span>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Down Payment</span>
              {isEditing ? (
                <input
                  type="number"
                  value={editedDeal.downPayment}
                  onChange={(e) => setEditedDeal({...editedDeal, downPayment: Number(e.target.value)})}
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-primary bg-transparent border-b border-border/60 text-right"
                />
              ) : (
                <span className="font-semibold text-primary">${deal.downPayment.toLocaleString()}</span>
              )}
            </div>
            
            {deal.proFormaCapRate ? (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Pro Forma Cap</span>
                <span className="font-semibold text-accent">{deal.proFormaCapRate}%</span>
              </div>
            ) : null}
            
            {deal.roi ? (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">ROI</span>
                <span className="font-semibold text-green-600">{deal.roi}%</span>
              </div>
            ) : null}
            
            {deal.capRate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Cap Rate</span>
                <span className="font-semibold text-accent">{deal.capRate}%</span>
              </div>
            )}
            
            {deal.proFormaCashFlow ? (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Cash Flow</span>
                <span className="font-semibold text-green-600">${deal.proFormaCashFlow}/mo</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isPreview && !isEditing && <SavePropertyButton propertyId={deal.id} />}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
                className="text-sm text-accent hover:text-accent/80 font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Controls or Edit Actions */}
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