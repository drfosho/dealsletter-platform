'use client';

import { useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import DealModal from '@/app/dashboard/DealModal';

interface Property {
  id?: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number | null;
  price: number;
  downPayment: number;
  downPaymentPercent: number;
  monthlyRent: number;
  capRate: number;
  monthlyCashFlow: number;
  totalROI: number;
  investmentStrategy: string;
  confidence: string;
  riskLevel: string;
  daysOnMarket: number;
  features: string[];
  pros: string[];
  cons: string[];
  description?: string;
  neighborhood?: string;
  images?: string[];
  
  // Financial fields
  interestRate?: number;
  loanTerm?: number;
  monthlyPI?: number;
  closingCosts?: number;
  
  // Rehab fields
  rehabCosts?: number;
  rehabDetails?: Record<string, number>;
  rehabTimeline?: string;
  
  // Expense fields
  propertyTax?: number;
  propertyTaxes?: number;
  insurance?: number;
  hoa?: number;
  hoaFees?: number;
  propertyManagement?: number;
  maintenance?: number;
  totalExpenses?: number;
  expenses?: Record<string, number>;
  
  // Timeline
  timeline?: Array<{
    period: string;
    event: string;
    impact?: string;
  }>;
  
  [key: string]: unknown;
}

interface ImportPreviewModalProps {
  parsedData: Partial<Property>;
  onClose: () => void;
  onApprove: () => void;
  onEdit?: () => void;
}

export default function ImportPreviewModal({ 
  parsedData, 
  onClose, 
  onApprove
}: ImportPreviewModalProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Convert property data to dashboard deal format - EXACTLY matching existing properties
  const dealData = {
    // Core fields that match existing dashboard properties
    id: parseInt(parsedData.id || Date.now().toString()),
    title: parsedData.title || parsedData.address || 'Property Title',
    location: `${parsedData.city || 'City'}, ${parsedData.state || 'ST'} ${parsedData.zipCode || ''}`.trim(),
    type: parsedData.propertyType || 'Single Family',
    strategy: parsedData.investmentStrategy || 'Buy & Hold',
    price: parsedData.price || 0,
    downPayment: parsedData.downPayment || 0,
    downPaymentPercent: parsedData.downPaymentPercent || 25,
    confidence: parsedData.confidence || 'medium',
    status: 'active',
    daysOnMarket: parsedData.daysOnMarket || 0,
    images: parsedData.images || ["/api/placeholder/400/300"],
    
    // Property details
    bedrooms: parsedData.bedrooms || 0,
    bathrooms: parsedData.bathrooms || 0,
    sqft: parsedData.sqft || 0,
    yearBuilt: parsedData.yearBuilt,
    features: parsedData.features || [],
    description: parsedData.description || '',
    neighborhood: parsedData.neighborhood || '',
    
    // Investment metrics
    riskLevel: parsedData.riskLevel || 'medium',
    timeframe: parsedData.holdPeriod ? `${parsedData.holdPeriod} years` : 'Long-term',
    cashRequired: (parsedData.downPayment || 0) + (parsedData.closingCosts || 0) + (parsedData.rehabCosts || 0),
    totalROI: parsedData.totalROI || 0,
    roi: parsedData.totalROI ? `${parsedData.totalROI.toFixed(1)}%` : undefined,
    capRate: parsedData.capRate || 0,
    proFormaCapRate: parsedData.capRate ? `${parsedData.capRate.toFixed(1)}%` : undefined,
    cashFlow: parsedData.monthlyCashFlow || 0,
    monthlyCashFlow: parsedData.monthlyCashFlow || 0,
    proFormaCashFlow: parsedData.monthlyCashFlow ? `${parsedData.monthlyCashFlow.toFixed(0)}` : undefined,
    monthlyRent: parsedData.monthlyRent || 0,
    
    // Additional fields for DealModal tabs
    propertyType: parsedData.propertyType || 'Single Family',
    investmentStrategy: parsedData.investmentStrategy || 'Buy & Hold',
    holdPeriod: parsedData.holdPeriod,
    
    // Financing tab
    interestRate: parsedData.interestRate,
    loanTerm: parsedData.loanTerm,
    monthlyPI: parsedData.monthlyPI,
    closingCosts: parsedData.closingCosts,
    
    // Rehab tab
    rehabCosts: parsedData.rehabCosts,
    rehabDetails: parsedData.rehabDetails,
    rehabTimeline: parsedData.rehabTimeline,
    
    // Returns tab - expenses
    propertyTax: parsedData.propertyTax || parsedData.propertyTaxes,
    insurance: parsedData.insurance,
    hoa: parsedData.hoa || parsedData.hoaFees,
    propertyManagement: parsedData.propertyManagement,
    maintenance: parsedData.maintenance,
    totalExpenses: parsedData.totalExpenses,
    expenses: parsedData.expenses,
    
    // Analysis lists
    pros: parsedData.pros || [],
    cons: parsedData.cons || [],
    timeline: parsedData.timeline || [],
    
    // Contact info
    contactInfo: parsedData.contactInfo,
    
    // Include all other parsed data
    ...parsedData
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-xl border border-border/60 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="p-6 border-b border-border/20">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-primary">Review Property Import</h2>
                <p className="text-muted mt-1">
                  Preview how this property will appear on your dashboard
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Dashboard Card Preview */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary mb-4">Dashboard Card Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grid View */}
                <div>
                  <p className="text-sm text-muted mb-2">Grid View</p>
                  <PropertyCard 
                    deal={dealData} 
                    viewMode="grid" 
                    onViewDetails={() => setShowDetailModal(true)}
                    isPreview={true}
                  />
                </div>
                
                {/* List View */}
                <div>
                  <p className="text-sm text-muted mb-2">List View</p>
                  <PropertyCard 
                    deal={dealData} 
                    viewMode="list" 
                    onViewDetails={() => setShowDetailModal(true)}
                    isPreview={true}
                  />
                </div>
              </div>
            </div>

            {/* View Full Details Button */}
            <div className="mb-8 bg-accent/10 border border-accent/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-primary mb-2">View Complete Property Details</h3>
              <p className="text-muted mb-4">
                Click below to see the full property modal with all tabs (Overview, Financing, Rehab, Returns, Pictures) 
                exactly as it will appear on the dashboard
              </p>
              <button
                onClick={() => setShowDetailModal(true)}
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 flex items-center gap-2 mx-auto font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Full Property Modal
              </button>
            </div>

            {/* Data Summary */}
            <div className="bg-muted/10 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primary mb-3">Property Data Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted">Address:</span>
                  <span className="font-medium ml-2">{dealData.title}</span>
                </div>
                <div>
                  <span className="text-muted">Price:</span>
                  <span className="font-medium ml-2">${dealData.price.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted">Strategy:</span>
                  <span className="font-medium ml-2">{dealData.strategy}</span>
                </div>
                <div>
                  <span className="text-muted">Cap Rate:</span>
                  <span className="font-medium ml-2">{dealData.capRate.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-muted">Cash Flow:</span>
                  <span className="font-medium ml-2">${dealData.monthlyCashFlow.toLocaleString()}/mo</span>
                </div>
                <div>
                  <span className="text-muted">ROI:</span>
                  <span className="font-medium ml-2">{dealData.totalROI.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-border/20 flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-red-500/30 text-red-600 rounded-lg hover:bg-red-500/10"
              >
                Cancel
              </button>
            </div>
            <button
              onClick={onApprove}
              className="px-8 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve & Add to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* DealModal - Using the EXACT same modal as dashboard */}
      {showDetailModal && (
        <DealModal 
          deal={dealData}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  );
}