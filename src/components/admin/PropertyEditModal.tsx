'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { PropertyData } from '@/types/property';

interface PropertyEditModalProps {
  isOpen: boolean;
  property: PropertyData | null;
  onSave: (property: PropertyData) => void;
  onClose: () => void;
}

export default function PropertyEditModal({ isOpen, property, onSave, onClose }: PropertyEditModalProps) {
  const [editedProperty, setEditedProperty] = useState<PropertyData | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (property) {
      setEditedProperty({ ...property });
      setImageUrls(property.images || []);
    }
  }, [property]);

  if (!isOpen || !editedProperty) return null;

  const handleFieldChange = (field: string, value: any) => {
    setEditedProperty(prev => {
      if (!prev) return null;
      
      // Handle nested fields
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent] as any || {}),
            [child]: value
          }
        };
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleAddImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    
    // Basic URL validation
    try {
      new URL(url);
      // Check if it's an image URL (basic check)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
      
      if (!hasImageExtension && !url.includes('placeholder') && !url.includes('image')) {
        if (!confirm('This URL might not be an image. Add it anyway?')) {
          return;
        }
      }
      
      setImageUrls([...imageUrls, url]);
      setNewImageUrl('');
    } catch {
      alert('Please enter a valid URL');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Create FormData
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append('files', file);
      }

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      // Add uploaded image URLs to the list
      if (result.paths && result.paths.length > 0) {
        setImageUrls(prev => [...prev, ...result.paths]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleSave = () => {
    if (!editedProperty) return;
    
    const updatedProperty = {
      ...editedProperty,
      images: imageUrls.length > 0 ? imageUrls : ['/api/placeholder/400/300'],
      updatedAt: new Date().toISOString()
    };
    
    onSave(updatedProperty);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'financial', label: 'Financial' },
    { id: 'images', label: 'Images' },
    { id: 'strategic', label: 'Strategic' },
    { id: 'location', label: 'Location' },
    { id: 'projections', label: 'Projections' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 md:p-8">
        <div className="bg-card rounded-2xl border border-border/60 shadow-2xl max-w-6xl w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/60">
            <h2 className="text-2xl font-bold">Edit Property</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-4 border-b border-border/60 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent text-white'
                    : 'bg-muted/10 text-muted hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={editedProperty.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={editedProperty.address || ''}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={editedProperty.city || ''}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    value={editedProperty.state || ''}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Property Type</label>
                  <select
                    value={editedProperty.propertyType || ''}
                    onChange={(e) => handleFieldChange('propertyType', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  >
                    <option value="">Select Type</option>
                    <option value="Single Family">Single Family</option>
                    <option value="Multi-Family">Multi-Family</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Investment Strategy</label>
                  <select
                    value={editedProperty.strategy || ''}
                    onChange={(e) => handleFieldChange('strategy', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  >
                    <option value="">Select Strategy</option>
                    <option value="Buy & Hold">Buy & Hold</option>
                    <option value="Fix & Flip">Fix & Flip</option>
                    <option value="BRRRR">BRRRR</option>
                    <option value="House Hack">House Hack</option>
                    <option value="Airbnb">Airbnb</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Property Status</label>
                  <select
                    value={editedProperty.status || 'active'}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Bedrooms</label>
                  <input
                    type="number"
                    value={editedProperty.bedrooms || 0}
                    onChange={(e) => handleFieldChange('bedrooms', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Bathrooms</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editedProperty.bathrooms || 0}
                    onChange={(e) => handleFieldChange('bathrooms', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Square Feet</label>
                  <input
                    type="number"
                    value={editedProperty.sqft || 0}
                    onChange={(e) => handleFieldChange('sqft', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Year Built</label>
                  <input
                    type="number"
                    value={editedProperty.yearBuilt || ''}
                    onChange={(e) => handleFieldChange('yearBuilt', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Purchase Price</label>
                  <input
                    type="number"
                    value={editedProperty.price || 0}
                    onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Down Payment</label>
                  <input
                    type="number"
                    value={editedProperty.downPayment || 0}
                    onChange={(e) => handleFieldChange('downPayment', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Rent</label>
                  <input
                    type="number"
                    value={editedProperty.monthlyRent || 0}
                    onChange={(e) => handleFieldChange('monthlyRent', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Cap Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editedProperty.capRate || 0}
                    onChange={(e) => handleFieldChange('capRate', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Cash Flow</label>
                  <input
                    type="number"
                    value={editedProperty.monthlyCashFlow || 0}
                    onChange={(e) => handleFieldChange('monthlyCashFlow', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Total ROI (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editedProperty.totalROI || 0}
                    onChange={(e) => handleFieldChange('totalROI', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editedProperty.interestRate || 0}
                    onChange={(e) => handleFieldChange('interestRate', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Property Tax (Monthly)</label>
                  <input
                    type="number"
                    value={editedProperty.propertyTax || 0}
                    onChange={(e) => handleFieldChange('propertyTax', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                {/* Current Images */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-32 bg-muted/20 rounded-lg overflow-hidden">
                          <Image
                            src={url}
                            alt={`Property ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Image by URL */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Add Image by URL</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 bg-background border border-border/60 rounded-lg"
                    />
                    <button
                      onClick={handleAddImage}
                      className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Upload Images */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Upload Images</h3>
                  <div className="space-y-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {isUploading && (
                      <p className="text-sm text-accent animate-pulse">Uploading images...</p>
                    )}
                    <p className="text-xs text-muted">
                      Supported formats: JPG, PNG, WebP (Max 10MB per file)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Strategic Tab */}
            {activeTab === 'strategic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Strategic Overview</label>
                  <textarea
                    value={editedProperty.strategicOverview || ''}
                    onChange={(e) => handleFieldChange('strategicOverview', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                    placeholder="Describe the overall investment strategy..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Value-Add Opportunities</label>
                  <textarea
                    value={editedProperty.valueAddDescription || ''}
                    onChange={(e) => handleFieldChange('valueAddDescription', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                    placeholder="Describe potential value-add opportunities..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Confidence Level</label>
                  <select
                    value={editedProperty.confidence || 'medium'}
                    onChange={(e) => handleFieldChange('confidence', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Risk Level</label>
                  <select
                    value={editedProperty.riskLevel || 'medium'}
                    onChange={(e) => handleFieldChange('riskLevel', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Neighborhood</label>
                  <input
                    type="text"
                    value={editedProperty.neighborhood || ''}
                    onChange={(e) => handleFieldChange('neighborhood', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Market Strength</label>
                  <input
                    type="text"
                    value={(editedProperty.locationAnalysis as any)?.marketStrength || ''}
                    onChange={(e) => handleFieldChange('locationAnalysis.marketStrength', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                    placeholder="e.g., Very Strong - Premium Market"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Demographics</label>
                  <input
                    type="text"
                    value={(editedProperty.locationAnalysis as any)?.demographics || ''}
                    onChange={(e) => handleFieldChange('locationAnalysis.demographics', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                    placeholder="e.g., Young professionals, families"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Growth Potential</label>
                  <input
                    type="text"
                    value={(editedProperty.locationAnalysis as any)?.growth || ''}
                    onChange={(e) => handleFieldChange('locationAnalysis.growth', e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                    placeholder="e.g., High growth with gentrification"
                  />
                </div>
              </div>
            )}

            {/* Projections Tab */}
            {activeTab === 'projections' && (
              <div className="space-y-6">
                <div className="bg-muted/10 p-4 rounded-lg">
                  <p className="text-sm text-muted">
                    30-year projections are automatically calculated based on financial metrics.
                    Edit the financial tab to update projections.
                  </p>
                </div>
                
                {editedProperty.thirtyYearProjections && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-lg border border-border/60">
                      <div className="text-sm text-muted mb-1">Year 5 ROI</div>
                      <div className="text-xl font-bold text-green-600">
                        {(editedProperty.thirtyYearProjections as any)?.projections?.[4]?.totalROI || 0}%
                      </div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border/60">
                      <div className="text-sm text-muted mb-1">Year 10 ROI</div>
                      <div className="text-xl font-bold text-blue-600">
                        {(editedProperty.thirtyYearProjections as any)?.projections?.[9]?.totalROI || 0}%
                      </div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border/60">
                      <div className="text-sm text-muted mb-1">Year 20 ROI</div>
                      <div className="text-xl font-bold text-purple-600">
                        {(editedProperty.thirtyYearProjections as any)?.projections?.[19]?.totalROI || 0}%
                      </div>
                    </div>
                    <div className="bg-card p-4 rounded-lg border border-border/60">
                      <div className="text-sm text-muted mb-1">Year 30 ROI</div>
                      <div className="text-xl font-bold text-accent">
                        {(editedProperty.thirtyYearProjections as any)?.projections?.[29]?.totalROI || 0}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-border/60">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-muted/20 text-primary rounded-lg hover:bg-muted/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}