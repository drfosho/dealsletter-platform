'use client';

import { useState, useEffect } from 'react';
import PropertyCardEditable from '@/components/PropertyCardEditable';
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
  const [editingPropertyId, setEditingPropertyId] = useState<string | number | null>(null);
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

  // Handle property deletion with better confirmation
  const handleDelete = async (property: Property) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${property.title || property.address}"?\n\n` +
      'This will remove the property from both the admin panel and the dashboard.\n' +
      'This action cannot be undone.'
    );
    
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/admin/properties?id=${property.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete property');
      
      // Refresh the list
      await fetchProperties();
      alert(`Property "${property.title || property.address}" has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    }
  };

  // Handle inline property update
  const handleInlineUpdate = async (updatedDeal: ReturnType<typeof convertToDeal>) => {
    try {
      // Find the original property to preserve all fields
      const originalProperty = properties.find(p => 
        (typeof p.id === 'string' ? parseInt(p.id) : p.id) === updatedDeal.id
      );
      
      if (!originalProperty) throw new Error('Property not found');
      
      // Update only the fields that were edited
      const updatedProperty = {
        ...originalProperty,
        title: updatedDeal.title,
        price: updatedDeal.price,
        downPayment: updatedDeal.downPayment,
        updatedAt: new Date()
      };
      
      const response = await fetch('/api/admin/properties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProperty)
      });

      if (!response.ok) throw new Error('Failed to update property');
      
      setEditingPropertyId(null);
      await fetchProperties();
      alert('Property updated successfully!');
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property. Please try again.');
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
      // Parse the property data using the same logic as Claude Code
      const parsedData = parsePropertyAnalysis(analysisText);
      
      // Ensure required fields
      if (!parsedData.title && !parsedData.address) {
        throw new Error('Property must have a title or address');
      }
      
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
      alert('Property imported successfully! It will now appear on the dashboard.');
    } catch (error) {
      console.error('Error importing property:', error);
      alert('Failed to import property. Please ensure the text contains property details like address, price, rent, etc.');
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
          <p className="text-muted">Manage all dashboard properties. Changes here affect the main dashboard.</p>
        </div>

        {/* Add Property Section */}
        <div className="bg-card rounded-xl border border-border/60 p-6 mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">Quick Add Property</h2>
          <p className="text-sm text-muted mb-4">
            Paste property analysis text just like you would in Claude Code. Include details like address, price, rent, bedrooms, etc.
          </p>
          <div className="space-y-4">
            <textarea
              value={analysisText}
              onChange={(e) => setAnalysisText(e.target.value)}
              placeholder="Example:
123 Main St, San Diego, CA 92101
$450,000 purchase price
$2,500/month rent
3 bed 2 bath, 1,500 sqft
Built in 1985
Good condition, needs minor updates
Cap rate: 5.2%
Cash flow: $500/month"
              className="w-full h-48 p-4 bg-background border border-border/60 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 font-mono text-sm"
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
                  Analyzing & Adding...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Analyze & Add
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary">
            All Properties ({properties.length})
            <span className="text-sm text-muted ml-2">
              {editingPropertyId ? '(Editing mode active)' : ''}
            </span>
          </h2>
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
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
            {properties.map((property) => (
              <PropertyCardEditable
                key={property.id}
                deal={convertToDeal(property)}
                viewMode={viewMode}
                isEditing={editingPropertyId === property.id}
                showAdminControls={true}
                onViewDetails={() => {
                  setSelectedProperty(property);
                  setShowDetailModal(true);
                }}
                onEdit={() => setEditingPropertyId(property.id)}
                onDelete={() => handleDelete(property)}
                onSave={handleInlineUpdate}
                onCancel={() => setEditingPropertyId(null)}
              />
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
    </div>
  );
}