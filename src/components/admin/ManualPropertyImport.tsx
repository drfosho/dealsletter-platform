'use client';

import { useState, useEffect } from 'react';
import { parsePropertyAnalysis, ParsedProperty } from '@/utils/propertyAnalysisParser';
import PropertyCard from '@/components/PropertyCard';
import ImageUploader from '@/components/admin/ImageUploader';
import { KANSAS_CITY_ARSENAL_DATA } from '@/app/tools/property-generator/test-data';

interface ManualPropertyImportProps {
  onPropertyAdd?: (property: Record<string, unknown>) => void;
}

export default function ManualPropertyImport({ onPropertyAdd }: ManualPropertyImportProps) {
  const [analysisText, setAnalysisText] = useState('');
  const [editedData, setEditedData] = useState<ParsedProperty | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check admin status on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // For now, we'll assume all authenticated users in admin area are admins
        // In production, implement proper role checking
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Initialize storage bucket on mount (admin only)
  useEffect(() => {
    if (isAdmin && !checkingAuth) {
      fetch('/api/admin/storage/setup', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('Storage bucket ready');
          }
        })
        .catch(err => console.error('Storage setup error:', err));
    }
  }, [isAdmin, checkingAuth]);

  const handleParse = () => {
    if (analysisText.trim()) {
      const parsed = parsePropertyAnalysis(analysisText);
      setEditedData(parsed);
      setShowPreview(true);
    }
  };

  const handleFieldChange = (field: keyof ParsedProperty, value: any) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value
      });
    }
  };

  const handleImageUrlsChange = (urls: string) => {
    setImageUrls(urls);
    const urlArray = urls.split('\n').filter(url => url.trim()).map(url => url.trim());
    setImages(urlArray);
    if (editedData) {
      setEditedData({
        ...editedData,
        images: [...uploadedImages, ...urlArray]
      });
    }
  };

  const handleUploadedImagesChange = (newImages: string[]) => {
    setUploadedImages(newImages);
    if (editedData) {
      setEditedData({
        ...editedData,
        images: [...newImages, ...images]
      });
    }
  };

  const handleSaveToDashboard = async () => {
    if (!editedData) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Prepare property data for dashboard
      const allImages = [...uploadedImages, ...images].filter(url => url.trim());
      const propertyData = {
        ...editedData,
        id: Date.now(),
        isDraft: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        images: allImages.length > 0 ? allImages : ['/api/placeholder/400/300'],
        // Ensure all required fields are present
        title: editedData.title || 'Investment Property',
        location: editedData.location || 'Location TBD',
        type: editedData.type || 'Single Family',
        strategy: editedData.strategy || 'Buy & Hold',
        price: editedData.price || 0,
        downPayment: editedData.downPayment || 0,
        confidence: editedData.confidence || 'medium',
        daysOnMarket: editedData.daysOnMarket || 0,
        features: editedData.features || [],
        riskLevel: editedData.riskLevel || 'medium',
      };

      // Call the API to save the property
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      const result = await response.json();
      console.log('Property saved successfully:', result);

      setSaveSuccess(true);
      
      // Call callback if provided
      if (onPropertyAdd) {
        onPropertyAdd(propertyData);
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        handleReset();
      }, 2000);

    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setAnalysisText('');
    setEditedData(null);
    setImages([]);
    setUploadedImages([]);
    setImageUrls('');
    setShowPreview(false);
    setSaveSuccess(false);
  };

  const handleLoadSample = () => {
    setAnalysisText(KANSAS_CITY_ARSENAL_DATA);
  };

  if (checkingAuth) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Manual Property Import</h2>
        <p className="text-muted">Paste property analysis text to quickly add properties to the dashboard</p>
        {isAdmin && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-md text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Admin Mode - Image Upload Enabled
          </div>
        )}
      </div>

      {!showPreview ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Property Analysis Text
            </label>
            <textarea
              value={analysisText}
              onChange={(e) => setAnalysisText(e.target.value)}
              className="w-full h-64 p-4 border border-border rounded-lg bg-background text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="Paste your property analysis text here...

Example format:
Kansas City Arsenal Apartments - Stabilized Cash Flow Machine!
📍 Address: 4017-4023 Harrison St, Kansas City, MO 64110
💰 Price: $1,740,000
🏢 Property: 12-Unit Apartment Complex
📊 Cap Rate: 6.7% Current | 7.8% Pro Forma
..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleParse}
              disabled={!analysisText.trim()}
              className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Parse & Extract Data
            </button>
            <button
              onClick={handleLoadSample}
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
            >
              Load Sample Data
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-muted/20 text-primary rounded-lg hover:bg-muted/30 transition-colors font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          {saveSuccess && (
            <div className="bg-green-500/10 border border-green-500 text-green-600 p-4 rounded-lg">
              ✅ Property successfully added to dashboard!
            </div>
          )}

          {/* Editable Fields */}
          <div className="bg-background p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-primary mb-4">Edit Property Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Title</label>
                <input
                  type="text"
                  value={editedData?.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Location</label>
                <input
                  type="text"
                  value={editedData?.location || ''}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Price</label>
                <input
                  type="number"
                  value={editedData?.price || 0}
                  onChange={(e) => handleFieldChange('price', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Down Payment</label>
                <input
                  type="number"
                  value={editedData?.downPayment || 0}
                  onChange={(e) => handleFieldChange('downPayment', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Property Type</label>
                <select
                  value={editedData?.type || 'Single Family'}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="Single Family">Single Family</option>
                  <option value="Multi-Family">Multi-Family</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Triplex">Triplex</option>
                  <option value="Fourplex">Fourplex</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Strategy</label>
                <select
                  value={editedData?.strategy || 'Buy & Hold'}
                  onChange={(e) => handleFieldChange('strategy', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="Buy & Hold">Buy & Hold</option>
                  <option value="Fix & Flip">Fix & Flip</option>
                  <option value="BRRRR">BRRRR</option>
                  <option value="House Hack">House Hack</option>
                  <option value="Value-Add">Value-Add</option>
                  <option value="Rental">Rental</option>
                  <option value="Wholesale">Wholesale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Risk Level</label>
                <select
                  value={editedData?.riskLevel || 'medium'}
                  onChange={(e) => handleFieldChange('riskLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Confidence</label>
                <select
                  value={editedData?.confidence || 'medium'}
                  onChange={(e) => handleFieldChange('confidence', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Cap Rate (%)</label>
                <input
                  type="text"
                  value={editedData?.proFormaCapRate || ''}
                  onChange={(e) => handleFieldChange('proFormaCapRate', e.target.value)}
                  placeholder="e.g., 7.8%"
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">ROI</label>
                <input
                  type="text"
                  value={editedData?.roi || ''}
                  onChange={(e) => handleFieldChange('roi', e.target.value)}
                  placeholder="e.g., 114%"
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Monthly Cash Flow</label>
                <input
                  type="number"
                  value={editedData?.monthlyCashFlow || 0}
                  onChange={(e) => handleFieldChange('monthlyCashFlow', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-1">Units</label>
                <input
                  type="number"
                  value={editedData?.units || 1}
                  onChange={(e) => handleFieldChange('units', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Image Upload Section - Admin Only */}
            {isAdmin && (
              <div className="mt-6 border-t border-border pt-6">
                <h4 className="text-md font-semibold text-primary mb-4">📸 Property Images (Admin Only)</h4>
                <ImageUploader
                  images={uploadedImages}
                  onImagesChange={handleUploadedImagesChange}
                  maxImages={10}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted mt-2">
                  Images will appear in full property analysis view, not on dashboard cards
                </p>
              </div>
            )}

            {/* Image URLs - Fallback option */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-muted mb-1">
                Additional Image URLs (one per line)
              </label>
              <textarea
                value={imageUrls}
                onChange={(e) => handleImageUrlsChange(e.target.value)}
                className="w-full h-24 p-3 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg"
              />
              <p className="text-xs text-muted mt-1">
                Optional: Add external image URLs if not uploading files directly
              </p>
            </div>

            {/* Features */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-muted mb-1">
                Features (comma-separated)
              </label>
              <input
                type="text"
                value={editedData?.features?.join(', ') || ''}
                onChange={(e) => handleFieldChange('features', e.target.value.split(',').map(f => f.trim()).filter(f => f))}
                className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Granite Counters, Stainless Appliances, New Roof"
              />
            </div>

            {/* Listing URL */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-muted mb-1">
                Listing URL (optional)
              </label>
              <input
                type="url"
                value={editedData?.listingUrl || ''}
                onChange={(e) => handleFieldChange('listingUrl', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-card text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="https://www.loopnet.com/listing/..."
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted/10 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-primary mb-4">Property Card Preview</h3>
            <div className="max-w-md mx-auto">
              {editedData && (
                <PropertyCard 
                  deal={editedData} 
                  viewMode="grid"
                  isPreview={true}
                  onViewDetails={() => {
                    if (editedData.listingUrl) {
                      window.open(editedData.listingUrl, '_blank');
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSaveToDashboard}
              disabled={isSaving}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save to Dashboard
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-muted/20 text-primary rounded-lg hover:bg-muted/30 transition-colors font-medium"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}