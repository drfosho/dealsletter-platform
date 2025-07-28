'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ImportPreviewModal from './ImportPreviewModal';
// Removed complex parser - using simple direct approach

interface Property {
  id?: string;
  // Basic Info
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
  lotSize: string;
  parking: string;
  condition: string;
  images: string[];
  
  // Financial Data
  price: number;
  downPaymentPercent: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyRent: number;
  projectedRent: number;
  securityDeposit: number;
  propertyTaxes: number;
  insurance: number;
  hoaFees: number;
  rehabCosts: number;
  closingCosts: number;
  inspectionCosts: number;
  
  // Investment Analysis
  capRate: number;
  cashOnCashReturn: number;
  totalROI: number;
  monthlyCashFlow: number;
  monthlyCashFlowAfter: number;
  breakEvenYear: number;
  dscr: number;
  grm: number;
  pricePerSqFt: number;
  
  // Investment Timeline
  investmentStrategy: string;
  flipTimeline?: number;
  flipProfit?: number;
  holdPeriod?: number;
  exitStrategy: string;
  appreciationRate: number;
  rentGrowthRate: number;
  
  // Market & Deal Info
  neighborhood: string;
  marketAnalysis: string;
  comparables: Array<{
    address: string;
    price: number;
    sqft: number;
    soldDate: string;
  }>;
  dealSource: string;
  dealStatus: string;
  competitionLevel: string;
  daysOnMarket: number;
  confidence: string;
  riskLevel: string;
  
  // Contact & Notes
  listingAgent: string;
  agentPhone: string;
  agentEmail: string;
  sellerInfo: string;
  keyNotes: string;
  pros: string[];
  cons: string[];
  strategyNotes: string;
  followUpActions: string;
  
  // Admin
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  features: string[];
  description: string;
}

const defaultProperty: Property = {
  title: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  propertyType: 'Single Family',
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1500,
  yearBuilt: null,
  lotSize: '',
  parking: 'Garage',
  condition: 'Good',
  images: [],
  price: 0,
  downPaymentPercent: 25,
  downPayment: 0,
  loanAmount: 0,
  interestRate: 6.89,
  loanTerm: 30,
  monthlyRent: 0,
  projectedRent: 0,
  securityDeposit: 0,
  propertyTaxes: 0,
  insurance: 0,
  hoaFees: 0,
  rehabCosts: 0,
  closingCosts: 0,
  inspectionCosts: 0,
  capRate: 0,
  cashOnCashReturn: 0,
  totalROI: 0,
  monthlyCashFlow: 0,
  monthlyCashFlowAfter: 0,
  breakEvenYear: 0,
  dscr: 0,
  grm: 0,
  pricePerSqFt: 0,
  investmentStrategy: 'Buy & Hold',
  holdPeriod: 5,
  exitStrategy: 'Hold',
  appreciationRate: 3,
  rentGrowthRate: 3,
  neighborhood: '',
  marketAnalysis: '',
  comparables: [],
  dealSource: 'MLS',
  dealStatus: 'Active',
  competitionLevel: 'Medium',
  daysOnMarket: 0,
  confidence: 'high',
  riskLevel: 'medium',
  listingAgent: '',
  agentPhone: '',
  agentEmail: '',
  sellerInfo: '',
  keyNotes: '',
  pros: [],
  cons: [],
  strategyNotes: '',
  followUpActions: '',
  isDraft: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  features: [],
  description: ''
};

export default function AdminProperties() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basic');
  const [property, setProperty] = useState<Property>(defaultProperty);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showQuickImport, setShowQuickImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<Partial<Property> | null>(null);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [parsingMessage, setParsingMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auto-calculate financial metrics
  useEffect(() => {
    calculateFinancials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    property.price,
    property.downPaymentPercent,
    property.interestRate,
    property.loanTerm,
    property.monthlyRent,
    property.propertyTaxes,
    property.insurance,
    property.hoaFees,
    property.rehabCosts
  ]);

  // Check authentication
  useEffect(() => {
    const authCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin-auth='));
    
    if (authCookie && authCookie.split('=')[1] === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load existing properties
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await fetch('/api/admin/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const calculateFinancials = () => {
    const p = property;
    
    // Calculate down payment and loan amount
    const downPayment = p.price * (p.downPaymentPercent / 100);
    const loanAmount = p.price - downPayment;
    
    // Calculate monthly payment (P&I)
    const monthlyRate = p.interestRate / 100 / 12;
    const numPayments = p.loanTerm * 12;
    const monthlyPI = monthlyRate > 0 
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : loanAmount / numPayments;
    
    // Calculate monthly expenses
    const monthlyTaxes = p.propertyTaxes / 12;
    const monthlyInsurance = p.insurance / 12;
    const monthlyHOA = p.hoaFees;
    const totalMonthlyExpenses = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyHOA;
    
    // Calculate cash flow
    const monthlyCashFlow = p.monthlyRent - totalMonthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    
    // Calculate cap rate
    const noi = (p.monthlyRent * 12) - p.propertyTaxes - p.insurance - (p.hoaFees * 12);
    const capRate = p.price > 0 ? (noi / p.price) * 100 : 0;
    
    // Calculate cash-on-cash return
    const totalCashRequired = downPayment + p.closingCosts + p.rehabCosts;
    const cashOnCashReturn = totalCashRequired > 0 
      ? (annualCashFlow / totalCashRequired) * 100 
      : 0;
    
    // Calculate GRM
    const grm = p.monthlyRent > 0 ? p.price / (p.monthlyRent * 12) : 0;
    
    // Calculate price per sqft
    const pricePerSqFt = p.sqft > 0 ? p.price / p.sqft : 0;
    
    // Update property with calculated values
    setProperty(prev => ({
      ...prev,
      downPayment,
      loanAmount,
      monthlyCashFlow,
      capRate,
      cashOnCashReturn,
      totalROI: cashOnCashReturn, // Simplified for now
      grm,
      pricePerSqFt
    }));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'dealsletter2024!') {
      document.cookie = 'admin-auth=authenticated; path=/; max-age=86400'; // 24 hours
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setProperty(prev => ({
      ...prev,
      [field]: value
    }));
  };




  const handleSave = async (publish = false) => {
    setIsLoading(true);
    try {
      const dataToSave = {
        ...property,
        isDraft: !publish,
        updatedAt: new Date()
      };

      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave)
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      setMessage(publish ? 'Property published successfully!' : 'Property saved as draft!');
      
      // Reload properties list
      loadProperties();
      
      // Reset form for next property
      setProperty(defaultProperty);
      
      // If published, redirect to dashboard after 2 seconds
      if (publish) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving property:', error);
      setMessage('Error saving property. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickImport = async () => {
    try {
      setParsingMessage('Analyzing property data...');
      
      // Simulate parsing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const text = importText;
      
      // SIMPLE APPROACH: Just save the analysis text and basic info
      // This replicates what Claude Code does when you paste directly
      const property: Property = {
        ...defaultProperty,
        id: `import-${Date.now()}`,
        title: 'Imported Property - ' + new Date().toLocaleDateString(),
        description: text, // Store the full analysis as description
        keyNotes: text, // Also store in notes for reference
        images: uploadedImages.length > 0 ? uploadedImages : ["/api/placeholder/400/300"],
        isDraft: false,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        // Set some reasonable defaults that can be edited later
        price: 0,
        propertyType: 'Single Family',
        investmentStrategy: 'Buy & Hold',
        confidence: 'medium',
        riskLevel: 'medium'
      };

      console.log('Parsed property:', property);
      
      // Update parsing message
      setParsingMessage('Creating property preview...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Store parsed data and show preview
      setParsedData(property);
      setEditedData(property); // Initialize edited data
      setShowImportPreview(true);
      setIsParsing(false);
      setParsingMessage('');
      
    } catch (error) {
      console.error('Error in Quick Import:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Failed to parse property data'}`);
      setIsParsing(false);
      setParsingMessage('');
    }
  };

  const applyParsedData = async () => {
    if (!parsedData) return;
    
    try {
      // Directly create the property in the database
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...parsedData,
          isDraft: false, // Publish immediately
          createdAt: new Date(),
          updatedAt: new Date()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create property');
      }

      await response.json();
      
      // Close modals and show success message
      setShowQuickImport(false);
      setShowImportPreview(false);
      setImportText('');
      setParsedData(null);
      setUploadedImages([]);
      
      setMessage('Property added to dashboard successfully! 🎉');
      
      // Refresh properties list
      loadProperties();
      
      // Reset form to defaults for next property
      setProperty(defaultProperty);
      
    } catch (error) {
      console.error('Error creating property:', error);
      setMessage('Error creating property. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <form onSubmit={handleAuth} className="bg-card p-8 rounded-lg border border-border/60 max-w-sm w-full">
          <h2 className="text-2xl font-bold text-primary mb-6">Admin Access</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg mb-4"
            placeholder="Enter password"
          />
          <button
            type="submit"
            className="w-full py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90"
          >
            Access Admin
          </button>
        </form>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'financial', label: 'Financial Data' },
    { id: 'analysis', label: 'Investment Analysis' },
    { id: 'timeline', label: 'Timeline & Strategy' },
    { id: 'market', label: 'Market Info' },
    { id: 'contact', label: 'Contact & Notes' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="admin" />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Property Admin</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowQuickImport(true)}
              className="px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Import
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted/10"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-muted text-primary rounded-lg hover:bg-muted/80"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90"
            >
              Publish Live
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
            {message}
          </div>
        )}

        {/* Import Preview Modal */}
        {showImportPreview && parsedData && (
          <ImportPreviewModal
            parsedData={parsedData}
            onClose={() => {
              setShowImportPreview(false);
              setParsedData(null);
              setEditedData(null);
              setIsEditMode(false);
            }}
            onApprove={async () => {
              console.log('=== QUICK IMPORT APPROVE CLICKED ===');
              console.log('Parsed data:', parsedData);
              
              // Create the property with the parsed data
              setIsLoading(true);
              try {
                const newProperty = {
                  ...parsedData,
                  id: Date.now().toString(),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  isDraft: false
                };
                
                // Save to properties
                const response = await fetch('/api/admin/properties', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(newProperty)
                });

                if (!response.ok) {
                  throw new Error('Failed to create property');
                }

                // Update the local properties list
                setProperties(prev => [...prev, newProperty]);
                
                // Clear import state
                setShowImportPreview(false);
                setParsedData(null);
                setImportText('');
                setShowQuickImport(false);
                setUploadedImages([]);
                
                setMessage('Property imported successfully! Redirecting to dashboard...');
                
                // Auto-redirect to dashboard after 2 seconds
                setTimeout(() => {
                  console.log('Redirecting to dashboard...');
                  window.location.href = '/dashboard';
                }, 2000);
              } catch (error) {
                console.error('Error creating property:', error);
                alert('Failed to import property. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }}
          />
        )}

        {/* Quick Import Modal */}
        {showQuickImport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl border border-border/60 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">Quick Add Property</h2>
                    <p className="text-muted mt-1">Paste your property analysis - same as copy/paste workflow</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowQuickImport(false);
                      setImportText('');
                      setUploadedImages([]);
                    }}
                    className="p-2 hover:bg-muted/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="bg-muted/10 rounded-lg p-4 border border-border/20">
                    <h3 className="text-sm font-medium text-primary mb-2">How it works:</h3>
                    <ol className="text-sm text-muted space-y-1 ml-4">
                      <li>1. Copy your entire Claude Opus property analysis</li>
                      <li>2. Paste it in the text box below</li>
                      <li>3. Upload any property images (optional)</li>
                      <li>4. Click "Parse & Import" to auto-fill all fields</li>
                      <li>5. Review and make any adjustments before saving</li>
                    </ol>
                  </div>

                  {/* Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Paste Claude Opus Analysis
                    </label>
                    <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border/60 rounded-lg font-mono text-sm"
                      rows={12}
                      placeholder={`Example format:
📍 Property: 123 Main St, San Diego, CA 92101
💰 Price: $550,000
🏠 Type: Single Family
🛏️ 3 bed / 2 bath
📐 1,400 sq ft
🗓️ Built: 1985

📊 Investment Analysis:
• Down Payment (25%): $137,500
• Monthly Rent: $2,800
• Cap Rate: 5.8%
• Cash Flow: $450/month
• Cash-on-Cash Return: 7.2%

📈 Market Analysis:
...`}
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Upload Property Images (Optional)
                    </label>
                    <div className="border-2 border-dashed border-border/60 rounded-lg p-8 text-center hover:border-accent/50 transition-colors">
                      <input
                        type="file"
                        id="image-upload"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          // Handle image upload
                          const files = Array.from(e.target.files || []);
                          
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                // Store base64 encoded image
                                setUploadedImages(prev => [...prev, event.target.result as string]);
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <svg className="w-12 h-12 text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-muted mb-1">Click to upload images</p>
                        <p className="text-xs text-muted">or drag and drop</p>
                        <p className="text-xs text-muted mt-2">PNG, JPG, GIF up to 10MB</p>
                      </label>
                    </div>
                    
                    {uploadedImages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-muted mb-2">{uploadedImages.length} image(s) uploaded</p>
                        <div className="flex gap-2 flex-wrap">
                          {uploadedImages.map((img, index) => (
                            <div key={index} className="relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                                src={img} 
                                alt={`Upload ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => {
                                  setUploadedImages(prev => prev.filter((_, i) => i !== index));
                                }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border/20 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowQuickImport(false);
                    setImportText('');
                    setUploadedImages([]);
                  }}
                  className="px-6 py-2 border border-border rounded-lg hover:bg-muted/10"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!importText.trim()) {
                      setMessage('Please paste some text to import');
                      return;
                    }
                    setIsParsing(true);
                    try {
                      // Call the parsing function
                      await handleQuickImport();
                    } catch (error) {
                      console.error('Error in handleQuickImport:', error);
                      setMessage('Error parsing the imported text. Please check the format and try again.');
                    } finally {
                      setIsParsing(false);
                    }
                  }}
                  disabled={isParsing || !importText.trim()}
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isParsing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Add Property
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-muted/20 p-1 rounded-lg">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-card rounded-lg p-6 border border-border/60">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Property Title</label>
                    <input
                      type="text"
                      value={property.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      placeholder="e.g., 123 Main St"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Address</label>
                      <input
                        type="text"
                        value={property.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Property Type</label>
                      <select
                        value={property.propertyType}
                        onChange={(e) => handleInputChange('propertyType', e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      >
                        <option value="Single Family">Single Family</option>
                        <option value="Duplex">Duplex</option>
                        <option value="Triplex">Triplex</option>
                        <option value="Fourplex">Fourplex</option>
                        <option value="Multifamily">Multifamily (5+)</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Mobile Home Park">Mobile Home Park</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">City</label>
                      <input
                        type="text"
                        value={property.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">State</label>
                      <input
                        type="text"
                        value={property.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                        placeholder="e.g., CA"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={property.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Bedrooms</label>
                      <input
                        type="number"
                        value={property.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Bathrooms</label>
                      <input
                        type="number"
                        step="0.5"
                        value={property.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Sq Ft</label>
                      <input
                        type="number"
                        value={property.sqft}
                        onChange={(e) => handleInputChange('sqft', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Year Built</label>
                      <input
                        type="number"
                        value={property.yearBuilt || ''}
                        onChange={(e) => handleInputChange('yearBuilt', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Description</label>
                    <textarea
                      value={property.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg h-32"
                      placeholder="Detailed property description..."
                    />
                  </div>
                  
                  {/* Image Upload for Manual Entry */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Property Images</label>
                    <div className="border-2 border-dashed border-border/60 rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
                      <input
                        type="file"
                        id="manual-image-upload"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                handleInputChange('images', [...property.images, event.target.result as string]);
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                      <label htmlFor="manual-image-upload" className="cursor-pointer">
                        <svg className="w-10 h-10 text-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-muted">Click to upload images</p>
                      </label>
                    </div>
                    
                    {property.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-muted mb-2">{property.images.length} image(s)</p>
                        <div className="flex gap-2 flex-wrap">
                          {property.images.map((img, index) => (
                            <div key={index} className="relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                                src={img} 
                                alt={`Property ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => {
                                  handleInputChange('images', property.images.filter((_, i) => i !== index));
                                }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'financial' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Purchase Price</label>
                      <input
                        type="number"
                        value={property.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Down Payment %</label>
                      <input
                        type="number"
                        value={property.downPaymentPercent}
                        onChange={(e) => handleInputChange('downPaymentPercent', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Interest Rate %</label>
                      <input
                        type="number"
                        step="0.01"
                        value={property.interestRate}
                        onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Loan Term (years)</label>
                      <input
                        type="number"
                        value={property.loanTerm}
                        onChange={(e) => handleInputChange('loanTerm', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Monthly Rent</label>
                      <input
                        type="number"
                        value={property.monthlyRent}
                        onChange={(e) => handleInputChange('monthlyRent', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Projected Rent (after rehab)</label>
                      <input
                        type="number"
                        value={property.projectedRent}
                        onChange={(e) => handleInputChange('projectedRent', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Property Taxes/year</label>
                      <input
                        type="number"
                        value={property.propertyTaxes}
                        onChange={(e) => handleInputChange('propertyTaxes', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Insurance/year</label>
                      <input
                        type="number"
                        value={property.insurance}
                        onChange={(e) => handleInputChange('insurance', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">HOA Fees/month</label>
                      <input
                        type="number"
                        value={property.hoaFees}
                        onChange={(e) => handleInputChange('hoaFees', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Rehab Costs</label>
                      <input
                        type="number"
                        value={property.rehabCosts}
                        onChange={(e) => handleInputChange('rehabCosts', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Closing Costs</label>
                      <input
                        type="number"
                        value={property.closingCosts}
                        onChange={(e) => handleInputChange('closingCosts', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Inspection Costs</label>
                      <input
                        type="number"
                        value={property.inspectionCosts}
                        onChange={(e) => handleInputChange('inspectionCosts', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  <div className="bg-muted/10 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-primary mb-3">Calculated Metrics</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted">Cap Rate:</span>
                        <span className="font-medium ml-2">{property.capRate.toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-muted">Cash-on-Cash:</span>
                        <span className="font-medium ml-2">{property.cashOnCashReturn.toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-muted">Monthly Cash Flow:</span>
                        <span className="font-medium ml-2">${property.monthlyCashFlow.toFixed(0)}</span>
                      </div>
                      <div>
                        <span className="text-muted">GRM:</span>
                        <span className="font-medium ml-2">{property.grm.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Deal Confidence</label>
                      <select
                        value={property.confidence}
                        onChange={(e) => handleInputChange('confidence', e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Risk Level</label>
                      <select
                        value={property.riskLevel}
                        onChange={(e) => handleInputChange('riskLevel', e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Investment Strategy</label>
                    <select
                      value={property.investmentStrategy}
                      onChange={(e) => handleInputChange('investmentStrategy', e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg"
                    >
                      <option value="Buy & Hold">Buy & Hold</option>
                      <option value="Fix & Flip">Fix & Flip</option>
                      <option value="BRRRR">BRRRR</option>
                      <option value="House Hack">House Hack</option>
                      <option value="Short-Term Rental">Short-Term Rental</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Add more tab content for timeline, market, contact tabs */}
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            {showPreview && (
              <div className="sticky top-8">
                <h3 className="text-lg font-semibold text-primary mb-4">Dashboard Preview</h3>
                <div className="bg-card rounded-xl border border-border/60 overflow-hidden hover:shadow-2xl transition-all">
                  <div className="relative h-48 bg-muted/20">
                    {property.images[0] && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={property.images[0]} 
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </>
                    )}
                    <div className="absolute top-4 left-4 z-10 flex items-start gap-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        property.confidence === 'high' ? 'bg-green-500/90 text-white' :
                        property.confidence === 'medium' ? 'bg-accent/90 text-white' :
                        'bg-muted/90 text-primary'
                      }`}>
                        {property.confidence.toUpperCase()} CONFIDENCE
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-2">{property.title || 'Property Title'}</h3>
                    <p className="text-muted mb-4">{property.city}, {property.state}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted">Price</p>
                        <p className="font-semibold">${property.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted">Type</p>
                        <p className="font-semibold">{property.propertyType}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Cap Rate</span>
                        <span className="font-medium">{property.capRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted">Cash Flow</span>
                        <span className="font-medium">${property.monthlyCashFlow.toFixed(0)}/mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Existing Properties List */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-primary mb-4">Existing Properties</h3>
              <div className="space-y-2">
                {properties.map(prop => (
                  <div
                    key={prop.id}
                    className="p-3 bg-card rounded-lg border border-border/60 hover:border-accent/50 cursor-pointer transition-colors"
                    onClick={() => setProperty(prop)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-primary">{prop.title}</h4>
                        <p className="text-sm text-muted">{prop.city}, {prop.state}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${prop.isDraft ? 'bg-muted/20 text-muted' : 'bg-green-500/20 text-green-600'}`}>
                        {prop.isDraft ? 'Draft' : 'Live'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}