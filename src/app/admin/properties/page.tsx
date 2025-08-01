'use client';

import { useState, useEffect } from 'react';
import PremiumPropertyCard from '@/components/PremiumPropertyCard';
import DealModal from '@/app/dashboard/DealModal';
import Navigation from '@/components/Navigation';
import ComprehensiveReviewModal from '@/components/ComprehensiveReviewModal';
import ComprehensivePropertyView from '@/components/ComprehensivePropertyView';
import type { PropertyData } from '@/types/property';

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
  
  // Premium Newsletter Sections
  strategicOverview?: string;
  valueAddDescription?: string;
  locationAnalysis?: Record<string, unknown>;
  rentAnalysis?: Record<string, unknown>;
  propertyMetrics?: Record<string, unknown>;
  financingScenarios?: Array<Record<string, unknown>>;
  thirtyYearProjections?: Record<string, unknown>;
  marketAnalysis?: Record<string, unknown>;
  rehabAnalysis?: Record<string, unknown>;
  
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
  utilities?: number;
  maintenance?: number;
  propertyManagement?: number;
  vacancy?: number;
  capitalExpenditures?: number;
  neighborhoodClass?: string;
  neighborhood?: string;
  lotSize?: string;
  currentRent?: number;
  projectedRent?: number;
  rentUpside?: number;
  currentCapRate?: number;
  proFormaCapRate?: number;
  proFormaCashFlow?: number;
  cashOnCashReturn?: number;
  status?: string;
  isDraft?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingPropertyId, setEditingPropertyId] = useState<string | number | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState<Property | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showComprehensiveView, setShowComprehensiveView] = useState(false);
  const [comprehensiveProperty, setComprehensiveProperty] = useState<Property | null>(null);

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
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
      
      await fetchProperties();
      alert('Property deleted successfully!');
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property. Please try again.');
    }
  };

  // Handle property update
  const handleSaveProperty = async (propertyId: string | number, updatedProperty: Property) => {
    try {
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

  // Handle AI-powered analysis with progress and review
  const handleAIAnalysis = async () => {
    if (!analysisText.trim()) {
      alert('Please paste property analysis text');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Analyzing property data...');
    
    try {
      // Call Claude API for analysis
      setProcessingStatus('Sending to AI for analysis...');
      const analysisResponse = await fetch('/api/analyze-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: analysisText })
      });

      const analysisResult = await analysisResponse.json();
      let parsedData;

      // Handle response and log metrics
      if (analysisResult.cached) {
        setProcessingStatus('Retrieved from cache...');
        console.log('Used cached analysis');
      } else {
        setProcessingStatus('AI analysis complete...');
        if (analysisResult.metrics) {
          console.log('=== Claude API Metrics ===');
          console.log(`Model: ${analysisResult.metrics.model}`);
          console.log(`Processing Time: ${analysisResult.metrics.processingTime}ms`);
          console.log(`Input Tokens: ${analysisResult.metrics.inputTokens || 'N/A'}`);
          console.log(`Output Tokens: ${analysisResult.metrics.outputTokens || 'N/A'}`);
          console.log('========================');
        }
      }

      if (!analysisResponse.ok || !analysisResult.success) {
        // Handle fallback to manual
        if (analysisResult.fallbackToManual) {
          setProcessingStatus('');
          const useManual = confirm(
            `${analysisResult.error}\n\n` +
            'Would you like to add the property manually instead?'
          );
          
          if (useManual) {
            // Reset and let user add manually
            setIsProcessing(false);
            return;
          }
          
          throw new Error(analysisResult.error);
        }
        
        // Check if we have partial data
        if (analysisResult.partialData) {
          parsedData = analysisResult.partialData;
          setProcessingStatus('Partial data extracted...');
        } else {
          throw new Error(analysisResult.error || 'Failed to analyze property');
        }
      } else {
        parsedData = analysisResult.data;
        
        // Show validation results
        if (analysisResult.validation && !analysisResult.validation.valid) {
          console.log('Validation warnings:', analysisResult.validation.errors);
        }
      }
      
      // Validate parsed data has required fields
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('Invalid data format from AI analysis');
      }
      
      // Ensure basic required fields exist
      if (!parsedData.address && !parsedData.title) {
        console.error('Missing address/title in parsed data:', parsedData);
        throw new Error('AI failed to extract property address');
      }
      
      // Show review modal
      setProcessingStatus('Preparing review...');
      console.log('=== PARSED PROPERTY DATA ===');
      console.log('Basic Fields:', {
        title: parsedData.title,
        address: parsedData.address,
        city: parsedData.city,
        state: parsedData.state,
        price: parsedData.price
      });
      console.log('Strategic Overview:', parsedData.strategicOverview);
      console.log('Value Add Description:', parsedData.valueAddDescription);
      console.log('Location Analysis:', parsedData.locationAnalysis);
      console.log('Rent Analysis:', parsedData.rentAnalysis);
      console.log('Property Metrics:', parsedData.propertyMetrics);
      console.log('Financing Scenarios:', parsedData.financingScenarios);
      console.log('30-Year Projections:', parsedData.thirtyYearProjections);
      console.log('Full Data:', parsedData);
      
      // Set the data for review
      console.log('Setting review data with parsed data:', parsedData);
      setReviewData(parsedData);
      setUploadedImages(parsedData.images || []);
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        console.log('Opening modal with data:', parsedData);
        setShowReviewModal(true);
      }, 100);
      
    } catch (error) {
      console.error('Error analyzing property:', error);
      setProcessingStatus('');
      
      if (error instanceof Error) {
        if (error.message.includes('AI service')) {
          alert('AI service not configured. Please add ANTHROPIC_API_KEY to environment variables.');
        } else {
          alert(`Error: ${error.message}`);
        }
      } else {
        alert('Failed to analyze property. Please try again.');
      }
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Handle saving after review
  const handleSaveReviewedProperty = async (propertyData: PropertyData) => {
    if (!propertyData) return;
    
    try {
      setProcessingStatus('Saving property...');
      
      // Ensure all required fields for dashboard display
      const propertyToSave: PropertyData = {
        ...propertyData,
        // Ensure numeric ID for dashboard compatibility
        id: propertyData.id || Date.now(),
        // Ensure location field is set
        location: propertyData.location || `${propertyData.city}, ${propertyData.state} ${propertyData.zipCode}`.trim(),
        // Ensure type matches strategy if not set
        type: propertyData.type || propertyData.investmentStrategy || propertyData.propertyType,
        // Ensure strategy field is set
        strategy: propertyData.investmentStrategy || propertyData.strategy || 'Buy & Hold',
        // Ensure status is active
        status: 'active',
        // Ensure isDraft is false for dashboard visibility
        isDraft: false,
        // Add uploaded images or default
        images: uploadedImages.length > 0 ? uploadedImages : propertyData.images || ["/api/placeholder/400/300"],
        // Ensure dates
        createdAt: propertyData.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      console.log('Saving property with data:', propertyToSave);
      console.log('Strategic Overview exists:', !!propertyToSave.strategicOverview);
      console.log('Location Analysis exists:', !!propertyToSave.locationAnalysis);
      console.log('Rent Analysis exists:', !!propertyToSave.rentAnalysis);
      console.log('Financing Scenarios:', (propertyToSave.financingScenarios as unknown[])?.length || 0);
      console.log('30-Year Projections exists:', !!propertyToSave.thirtyYearProjections);
      
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyToSave)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create property: ${error}`);
      }
      
      const savedProperty = await response.json();
      console.log('Property saved successfully:', savedProperty);
      
      // Success
      setAnalysisText('');
      setShowReviewModal(false);
      setReviewData(null);
      setUploadedImages([]);
      await fetchProperties();
      alert('Property added successfully and will appear on the dashboard!');
      
    } catch (error) {
      console.error('Error saving property:', error);
      alert(`Failed to save property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessingStatus('');
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
    utilities: property.utilities,
    maintenance: property.maintenance,
    propertyManagement: property.propertyManagement,
    vacancy: property.vacancy,
    capitalExpenditures: property.capitalExpenditures,
    neighborhoodClass: property.neighborhoodClass,
    neighborhood: property.neighborhood,
    lotSize: property.lotSize,
    currentRent: property.currentRent,
    projectedRent: property.projectedRent,
    rentUpside: property.rentUpside,
    currentCapRate: property.currentCapRate,
    proFormaCashFlow2: property.proFormaCashFlow,
    cashOnCashReturn: property.cashOnCashReturn
  });

  const handleEditClick = (propertyId: string | number) => {
    setEditingPropertyId(propertyId);
  };

  const handleCancelEdit = () => {
    setEditingPropertyId(null);
  };

  return (
    <div className="min-h-screen bg-background text-primary">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Property Management</h1>
          
          {/* AI-Powered Quick Import */}
          <div className="bg-card rounded-xl border border-border/60 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">AI-Powered Property Import</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Paste property analysis text (from email, listing, etc.)
                </label>
                <textarea
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  className="w-full h-32 px-4 py-3 bg-background border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 text-primary"
                  placeholder="Example: 1419 Leavenworth St, San Francisco - 12-unit apartment building priced at $3,950,000..."
                  disabled={isProcessing}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAIAnalysis}
                  disabled={isProcessing || !analysisText.trim()}
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Analyze with AI'}
                </button>
                
                {processingStatus && (
                  <span className="text-sm text-muted animate-pulse">
                    {processingStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-accent text-white' 
                    : 'bg-card border border-border/60 text-muted hover:text-primary'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-accent text-white' 
                    : 'bg-card border border-border/60 text-muted hover:text-primary'
                }`}
              >
                List View
              </button>
            </div>
            
            <div className="text-sm text-muted">
              {properties.length} properties
            </div>
          </div>
        </div>
        
        {/* Properties Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted mb-4">No properties yet. Add your first property above!</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
            {properties.map((property) => (
              <PremiumPropertyCard
                key={property.id}
                deal={convertToDeal(property)}
                viewMode={viewMode}
                isEditing={editingPropertyId === property.id}
                showAdminControls={true}
                onEdit={() => handleEditClick(property.id)}
                onDelete={() => handleDelete(property.id)}
                onSave={(updatedDeal) => handleSaveProperty(property.id, {
                  ...property,
                  ...updatedDeal,
                  id: property.id
                })}
                onCancel={handleCancelEdit}
                onViewDetails={() => {
                  // Check if property has comprehensive data
                  if (property.strategicOverview || property.thirtyYearProjections || property.locationAnalysis) {
                    setComprehensiveProperty(property);
                    setShowComprehensiveView(true);
                  } else {
                    // Fall back to regular deal modal
                    setSelectedDeal(property);
                    setIsModalOpen(true);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Deal Modal */}
      {selectedDeal && (
        <DealModal 
          deal={convertToDeal(selectedDeal)}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDeal(null);
          }}
        />
      )}

      {/* Comprehensive Review Modal */}
      {showReviewModal && reviewData && (
        <ComprehensiveReviewModal
          isOpen={showReviewModal}
          data={reviewData}
          uploadedImages={uploadedImages}
          onImagesChange={setUploadedImages}
          onSave={handleSaveReviewedProperty}
          onClose={() => {
            setShowReviewModal(false);
            setReviewData(null);
            setUploadedImages([]);
          }}
        />
      )}

      {/* Comprehensive Property View Modal */}
      <ComprehensivePropertyView
        isOpen={showComprehensiveView}
        property={comprehensiveProperty}
        onClose={() => {
          setShowComprehensiveView(false);
          setComprehensiveProperty(null);
        }}
      />
    </div>
  );
}