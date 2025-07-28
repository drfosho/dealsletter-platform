'use client';

import { useState, useEffect } from 'react';
import PropertyCard from '@/components/PropertyCard';
import DealModal from '@/app/dashboard/DealModal';
import Navigation from '@/components/Navigation';
import { parsePropertyAnalysis } from '@/lib/propertyParser';

interface Property {
  id: string | number;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  location?: string;
  type?: string;
  propertyType: string;
  price: number;
  downPayment: number;
  downPaymentPercent: number;
  monthlyRent: number;
  capRate: number;
  monthlyCashFlow: number;
  totalROI: number;
  investmentStrategy: string;
  strategy?: string;
  confidence: string;
  riskLevel: string;
  daysOnMarket: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number | null;
  features: string[];
  images?: string[];
  description?: string;
  
  // Additional fields for DealModal
  interestRate?: number;
  loanTerm?: number;
  monthlyPI?: number;
  closingCosts?: number;
  rehabCosts?: number;
  rehabDetails?: Record<string, number>;
  rehabTimeline?: string;
  propertyTax?: number;
  propertyTaxes?: number;
  insurance?: number;
  hoa?: number;
  hoaFees?: number;
  propertyManagement?: number;
  maintenance?: number;
  totalExpenses?: number;
  expenses?: Record<string, number>;
  pros?: string[];
  cons?: string[];
  timeline?: Array<{
    period: string;
    event: string;
    impact?: string;
  }>;
  
  [key: string]: unknown;
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisText, setAnalysisText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch all properties
  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      
      const data = await response.json();
      console.log('Admin: Fetched properties:', data.length);
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Handle property deletion
  const handleDelete = async (propertyId: string | number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await fetch(`/api/admin/properties?id=${propertyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete property');
      
      // Refresh the list
      await fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  // Handle property update
  const handleUpdate = async (property: Property) => {
    try {
      const response = await fetch('/api/admin/properties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(property)
      });

      if (!response.ok) throw new Error('Failed to update property');
      
      setShowEditModal(false);
      setSelectedProperty(null);
      await fetchProperties();
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property');
    }
  };

  // Handle quick import
  const handleQuickImport = async () => {
    if (!analysisText.trim()) {
      alert('Please paste property analysis text');
      return;
    }

    setIsProcessing(true);
    try {
      // Parse the property data
      const parsedData = parsePropertyAnalysis(analysisText);
      
      // Create property with parsed data
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData)
      });

      if (!response.ok) throw new Error('Failed to create property');
      
      // Clear form and refresh
      setAnalysisText('');
      await fetchProperties();
      alert('Property imported successfully!');
    } catch (error) {
      console.error('Error importing property:', error);
      alert('Failed to import property. Please check the format and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert property data to dashboard deal format
  const convertToDeal = (property: Property) => ({
    id: typeof property.id === 'string' ? parseInt(property.id) || Date.now() : Number(property.id),
    title: property.title || property.address,
    location: property.location || `${property.city}, ${property.state} ${property.zipCode}`.trim(),
    type: property.type || property.propertyType,
    strategy: property.strategy || property.investmentStrategy,
    price: property.price,
    downPayment: property.downPayment,
    downPaymentPercent: property.downPaymentPercent,
    confidence: property.confidence,
    status: 'active',
    daysOnMarket: property.daysOnMarket,
    images: property.images || ["/api/placeholder/400/300"],
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    sqft: property.sqft,
    yearBuilt: property.yearBuilt,
    features: property.features,
    description: property.description,
    riskLevel: property.riskLevel,
    totalROI: property.totalROI,
    roi: property.totalROI ? `${property.totalROI.toFixed(1)}` : undefined,
    capRate: property.capRate,
    proFormaCapRate: property.capRate ? `${property.capRate.toFixed(1)}` : undefined,
    cashFlow: property.monthlyCashFlow,
    monthlyCashFlow: property.monthlyCashFlow,
    proFormaCashFlow: property.monthlyCashFlow ? `${property.monthlyCashFlow.toFixed(0)}` : undefined,
    monthlyRent: property.monthlyRent,
    // Additional fields that might be present in property
    interestRate: property.interestRate,
    loanTerm: property.loanTerm,
    monthlyPI: property.monthlyPI,
    closingCosts: property.closingCosts,
    rehabCosts: property.rehabCosts,
    rehabDetails: property.rehabDetails,
    rehabTimeline: property.rehabTimeline,
    propertyTax: property.propertyTax || property.propertyTaxes,
    insurance: property.insurance,
    hoa: property.hoa || property.hoaFees,
    propertyManagement: property.propertyManagement,
    maintenance: property.maintenance,
    totalExpenses: property.totalExpenses,
    expenses: property.expenses,
    pros: property.pros || [],
    cons: property.cons || [],
    timeline: property.timeline || []
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="dashboard" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Property Management</h1>
          <p className="text-muted">Manage all dashboard properties</p>
        </div>

        {/* Add Property Section */}
        <div className="bg-card rounded-xl border border-border/60 p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">Quick Add Property</h2>
          <div className="space-y-4">
            <textarea
              value={analysisText}
              onChange={(e) => setAnalysisText(e.target.value)}
              placeholder="Paste your property analysis here... (address, price, rent, features, etc.)"
              className="w-full h-48 p-4 bg-background border border-border/60 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              onClick={handleQuickImport}
              disabled={isProcessing || !analysisText.trim()}
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Property
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary">All Properties ({properties.length})</h2>
          <div className="flex bg-card border border-border/60 rounded-lg overflow-hidden">
            <button
              className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}
              onClick={() => setViewMode('grid')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className={`px-4 py-2 ${viewMode === 'list' ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}
              onClick={() => setViewMode('list')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Properties Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted mb-4">No properties yet. Add your first property above!</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {properties.map((property) => (
              <div key={property.id} className="relative group">
                <PropertyCard 
                  deal={convertToDeal(property)}
                  viewMode={viewMode}
                  onViewDetails={() => {
                    setSelectedProperty(property);
                    setShowDetailModal(true);
                  }}
                />
                
                {/* Admin Actions Overlay */}
                <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setSelectedProperty(property);
                      setShowEditModal(true);
                    }}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
                    title="Edit Property"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg"
                    title="Delete Property"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showDetailModal && selectedProperty && (
        <DealModal 
          deal={convertToDeal(selectedProperty)}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProperty(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProperty && (
        <EditPropertyModal
          property={selectedProperty}
          onSave={handleUpdate}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </div>
  );
}

// Edit Property Modal Component
function EditPropertyModal({ 
  property, 
  onSave, 
  onClose 
}: { 
  property: Property; 
  onSave: (property: Property) => void;
  onClose: () => void;
}) {
  const [editedProperty, setEditedProperty] = useState(property);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedProperty);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl border border-border/60 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border/20">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary">Edit Property</h2>
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Title/Address</label>
              <input
                type="text"
                value={editedProperty.title}
                onChange={(e) => setEditedProperty({...editedProperty, title: e.target.value})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Property Type</label>
              <input
                type="text"
                value={editedProperty.propertyType}
                onChange={(e) => setEditedProperty({...editedProperty, propertyType: e.target.value})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">City</label>
              <input
                type="text"
                value={editedProperty.city}
                onChange={(e) => setEditedProperty({...editedProperty, city: e.target.value})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">State</label>
              <input
                type="text"
                value={editedProperty.state}
                onChange={(e) => setEditedProperty({...editedProperty, state: e.target.value})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
              />
            </div>

            {/* Financial Info */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Price</label>
              <input
                type="number"
                value={editedProperty.price}
                onChange={(e) => setEditedProperty({...editedProperty, price: Number(e.target.value)})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Down Payment</label>
              <input
                type="number"
                value={editedProperty.downPayment}
                onChange={(e) => setEditedProperty({...editedProperty, downPayment: Number(e.target.value)})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Monthly Rent</label>
              <input
                type="number"
                value={editedProperty.monthlyRent}
                onChange={(e) => setEditedProperty({...editedProperty, monthlyRent: Number(e.target.value)})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Cap Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={editedProperty.capRate}
                onChange={(e) => setEditedProperty({...editedProperty, capRate: Number(e.target.value)})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
              />
            </div>

            {/* Property Details */}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Bedrooms</label>
              <input
                type="number"
                value={editedProperty.bedrooms}
                onChange={(e) => setEditedProperty({...editedProperty, bedrooms: Number(e.target.value)})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Bathrooms</label>
              <input
                type="number"
                value={editedProperty.bathrooms}
                onChange={(e) => setEditedProperty({...editedProperty, bathrooms: Number(e.target.value)})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Square Feet</label>
              <input
                type="number"
                value={editedProperty.sqft}
                onChange={(e) => setEditedProperty({...editedProperty, sqft: Number(e.target.value)})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1">Investment Strategy</label>
              <select
                value={editedProperty.investmentStrategy}
                onChange={(e) => setEditedProperty({...editedProperty, investmentStrategy: e.target.value})}
                className="w-full p-2 bg-card border border-border/60 rounded-lg"
              >
                <option value="Buy & Hold">Buy & Hold</option>
                <option value="Fix & Flip">Fix & Flip</option>
                <option value="BRRRR">BRRRR</option>
                <option value="House Hack">House Hack</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-muted mb-1">Description</label>
            <textarea
              value={editedProperty.description || ''}
              onChange={(e) => setEditedProperty({...editedProperty, description: e.target.value})}
              className="w-full h-24 p-2 bg-card border border-border/60 rounded-lg resize-none"
            />
          </div>
        </form>

        <div className="p-6 border-t border-border/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border/60 rounded-lg hover:bg-muted/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}