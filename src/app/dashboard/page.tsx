'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import DealModal from './DealModal';
import FilterBar from './FilterBar';
import PremiumPropertyCard from '@/components/PremiumPropertyCard';
import PremiumPropertyView from '@/components/PremiumPropertyView';
import LocationSearch from '@/components/LocationSearch';
import MarketNotification from '@/components/MarketNotification';
import { isLocationSupported } from '@/config/markets';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import AdminTools from '@/components/AdminTools';

const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-card rounded-lg overflow-hidden border border-border/60 flex items-center justify-center">
    <div className="text-muted">Loading map...</div>
  </div>
});

interface Deal {
  id: number;
  title: string;
  location: string;
  type: string;
  strategy: string;
  price: number;
  downPayment: number;
  confidence: string;
  totalROI?: number;
  capRate?: number;
  cashFlow?: number;
  daysOnMarket?: number;
  riskLevel?: string;
  proFormaCapRate?: string | number;
  roi?: string | number;
  proFormaCashFlow?: string | number;
  features?: string[];
  images?: string[];
  [key: string]: unknown;
}

export default function Dashboard() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [statusTab, setStatusTab] = useState<'active' | 'sold' | 'pending' | 'all'>('active');
  const [selectedLocation, setSelectedLocation] = useState<{
    city: string;
    state: string;
    fullAddress: string;
    coordinates?: { lat: number; lng: number };
  } | null>(null);
  const [unsupportedLocation, setUnsupportedLocation] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  
  // Effect to ensure mobile doesn't use list view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'list') {
        setViewMode('grid');
      }
    };
    
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);
  const [previousViewMode, setPreviousViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showComprehensiveView, setShowComprehensiveView] = useState(false);
  const [comprehensiveProperty, setComprehensiveProperty] = useState<Deal | null>(null);
  const [filters, setFilters] = useState({
    market: 'all',
    strategy: 'all',
    priceRange: [0, 2000000] as [number, number],
    minROI: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dynamicProperties, setDynamicProperties] = useState<Deal[]>([]);
  const [lastRefresh] = useState(Date.now());

  // Fetch dynamic properties from API
  const fetchProperties = async () => {
      try {
        setIsLoading(true);
        console.log('Dashboard: Fetching properties from /api/properties');
        const response = await fetch('/api/properties', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        console.log('Dashboard: Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard: Fetched properties:', data.length);
          console.log('Dashboard: Raw properties data:', data);
          console.log('Dashboard: First property:', data[0]);
          const formattedProperties = data.map((prop: Deal & Record<string, unknown>, index: number) => {
            const { id: _id, ...restProp } = prop;
            return {
              // Keep all other fields first
              ...restProp,
              
              // Core identifiers (override with our logic)
              id: typeof prop.id === 'string' ? parseInt(prop.id) : prop.id || 1000 + index,
              title: prop.title || prop.address,
              address: prop.address,
              
              // Location data
              location: prop.location || `${prop.city}, ${prop.state} ${prop.zipCode}`.trim(),
              city: prop.city,
              state: prop.state,
              zipCode: prop.zipCode,
              neighborhood: prop.neighborhood,
              
              // Property details
              type: prop.type || prop.propertyType,
              propertyType: prop.propertyType,
              strategy: prop.strategy || prop.investmentStrategy,
              investmentStrategy: prop.investmentStrategy,
              price: prop.price,
              
              // Financial metrics - IMPORTANT: Pass all for proper display
              downPayment: prop.downPayment,
              downPaymentPercent: prop.downPaymentPercent,
              monthlyRent: prop.monthlyRent,
              monthlyCashFlow: prop.monthlyCashFlow, // CRITICAL: For house hack detection
              cashFlow: prop.monthlyCashFlow || prop.cashFlow,
              totalROI: prop.totalROI,
              roi: prop.roi,
              capRate: prop.capRate,
              currentCapRate: prop.currentCapRate,
              proFormaCapRate: prop.proFormaCapRate,
              proFormaCashFlow: prop.proFormaCashFlow,
              cashOnCashReturn: prop.cashOnCashReturn,
              noi: prop.noi,
              grossYield: prop.grossYield,
              
              // Property characteristics
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              sqft: prop.sqft || prop.squareFootage,
              squareFootage: prop.squareFootage,
              yearBuilt: prop.yearBuilt,
              features: prop.features,
              description: prop.description,
              
              // Investment details
              confidence: prop.confidence || 'medium',
              status: prop.status || 'active',
              daysOnMarket: prop.daysOnMarket,
              riskLevel: prop.riskLevel,
              timeframe: prop.holdPeriod ? `${prop.holdPeriod} years` : prop.timeframe || 'Long-term',
              holdPeriod: prop.holdPeriod,
              
              // Costs
              cashRequired: prop.cashRequired || (prop.downPayment + (typeof prop.closingCosts === 'number' ? prop.closingCosts : 0) + (typeof prop.rehabCosts === 'number' ? prop.rehabCosts : 0)),
              closingCosts: prop.closingCosts,
              rehabCosts: prop.rehabCosts,
              estimatedRehab: prop.estimatedRehab,
              renovationCosts: prop.renovationCosts,
              
              // Images
              images: prop.images || ["/api/placeholder/400/300"],
              
              // Comprehensive analysis data (from admin imports)
              strategicOverview: prop.strategicOverview,
              executiveSummary: prop.executiveSummary,
              valueAddDescription: prop.valueAddDescription,
              locationAnalysis: prop.locationAnalysis,
              rentAnalysis: prop.rentAnalysis,
              propertyMetrics: prop.propertyMetrics,
              financingScenarios: prop.financingScenarios,
              thirtyYearProjections: prop.thirtyYearProjections,
              financialAnalysis: prop.financialAnalysis,
              marketAnalysis: prop.marketAnalysis,
              investmentSummary: prop.investmentSummary
            };
          });
          console.log('Dashboard: Formatted properties:', formattedProperties.length);
          console.log('Dashboard: First formatted property:', formattedProperties[0]);
          setDynamicProperties(formattedProperties);
          console.log('Dashboard: Set dynamicProperties state');
        } else {
          console.error('Dashboard: Failed to fetch properties, status:', response.status);
        }
      } catch (error) {
        console.error('Dashboard: Error fetching properties:', error);
      } finally {
        setIsLoading(false);
        console.log('Dashboard: Loading complete');
      }
    };

  useEffect(() => {
    fetchProperties();
  }, [lastRefresh]);

  // All deals now come from the API (including static deals)
  const deals = useMemo(() => {
    console.log('Dashboard: Computing deals memo, dynamicProperties:', dynamicProperties.length);
    return dynamicProperties;
  }, [dynamicProperties]);

  const filteredDeals = useMemo(() => {
    let filtered = deals;

    // Filter by status tab
    if (statusTab !== 'all') {
      filtered = filtered.filter(deal => {
        const dealStatus = deal.status || 'active';
        return dealStatus === statusTab;
      });
    }

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(deal => 
        deal.strategy.toLowerCase().includes(selectedFilter.toLowerCase()) ||
        deal.type.toLowerCase().includes(selectedFilter.toLowerCase())
      );
    }

    // Filter by location search
    if (selectedLocation && !isSearching) {
      const searchCity = selectedLocation.city.toLowerCase().trim();
      const searchState = selectedLocation.state.toLowerCase().trim();
      
      filtered = filtered.filter(deal => {
        // Parse the location string (format: "City, State ZipCode")
        const [cityPart = '', stateZipPart = ''] = deal.location.split(',').map(s => s.trim());
        const dealCity = cityPart.toLowerCase().trim();
        const dealState = stateZipPart.split(' ')[0].toLowerCase().trim();
        
        // Exact city match
        return dealCity === searchCity && (searchState === '' || dealState === searchState);
      });
    }

    // Apply FilterBar filters
    if (filters.market !== 'all') {
      filtered = filtered.filter(deal => 
        deal.location.toLowerCase().includes(filters.market.toLowerCase())
      );
    }

    if (filters.strategy !== 'all') {
      filtered = filtered.filter(deal => 
        deal.strategy.toLowerCase() === filters.strategy.toLowerCase()
      );
    }

    filtered = filtered.filter(deal => 
      deal.price >= filters.priceRange[0] && 
      deal.price <= filters.priceRange[1]
    );

    if (filters.minROI > 0) {
      filtered = filtered.filter(deal => {
        const roi = deal.totalROI || deal.roi || deal.capRate || 0;
        const roiValue = typeof roi === 'string' ? parseFloat(roi) : roi;
        return roiValue >= filters.minROI;
      });
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'roi':
          const aROI = a.totalROI || 0;
          const bROI = b.totalROI || 0;
          return bROI - aROI;
        case 'confidence':
          const confidenceOrder = { 'very high': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return (confidenceOrder[b.confidence as keyof typeof confidenceOrder] || 0) - 
                 (confidenceOrder[a.confidence as keyof typeof confidenceOrder] || 0);
        default: // date
          return (b.daysOnMarket || 0) - (a.daysOnMarket || 0);
      }
    });

    return filtered;
  }, [deals, selectedFilter, selectedLocation, isSearching, filters, sortBy, statusTab]);

  // const handleDealClick = useCallback((deal: Deal) => {
  //   setSelectedDeal(deal);
  //   setIsModalOpen(true);
  // }, []);

  const handleLocationSelect = useCallback((location: {
    city: string;
    state: string;
    fullAddress: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    if (!isLocationSupported(location.city, location.state)) {
      setUnsupportedLocation(location.fullAddress);
      setSelectedLocation(null);
      
      if (viewMode === 'map') {
        setPreviousViewMode('map');
        setViewMode('grid');
      }
    } else {
      setSelectedLocation(location);
      setUnsupportedLocation(null);
      
      if (previousViewMode === 'map' && viewMode !== 'map') {
        setViewMode('map');
        setPreviousViewMode('grid');
      }
    }
  }, [viewMode, previousViewMode]);

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      market: 'all',
      strategy: 'all',
      priceRange: [0, 2000000],
      minROI: 0
    });
    setSelectedFilter('all');
    setSelectedLocation(null);
    setSortBy('date');
    setStatusTab('active');
  }, []);

  const handleSearchStart = useCallback(() => {
    setIsSearching(true);
  }, []);

  const handleSearchEnd = useCallback(() => {
    setIsSearching(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="dashboard" />
      
      <div className="flex">
        {/* Hide sidebar on mobile, show on desktop */}
        <div className="hidden sm:block">
          <DashboardSidebar />
        </div>
        
        {/* Main content - full width on mobile */}
        <main className="flex-1 w-full">
          <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-8">
            <DashboardHeader 
              totalProperties={deals.length} 
              onRefresh={fetchProperties}
            />

        {/* Status Tabs - Mobile Optimized */}
        <div className="mb-3 sm:mb-6">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['active', 'sold', 'pending', 'all'] as const).map(tab => {
              const tabCounts = {
                active: deals.filter(d => !d.status || d.status === 'active').length,
                sold: deals.filter(d => d.status === 'sold').length,
                pending: deals.filter(d => d.status === 'pending').length,
                all: deals.length
              };
              
              return (
                <button
                  key={tab}
                  onClick={() => setStatusTab(tab)}
                  className={`flex-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    statusTab === tab 
                      ? 'bg-white dark:bg-gray-900 text-accent shadow-sm' 
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  <span className="capitalize">{tab}</span>
                  <span className="ml-1 text-[10px] sm:text-xs opacity-70">
                    ({tabCounts[tab]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Unsupported Location Notification */}
        {unsupportedLocation && (
          <MarketNotification 
            location={unsupportedLocation}
            onClose={() => setUnsupportedLocation(null)}
          />
        )}

        {/* Mobile View Toggle */}
        <div className="md:hidden mb-3">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
            <button
              className={`flex-1 px-3 py-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-900 text-accent shadow-sm font-medium' 
                  : 'text-muted'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="text-xs font-medium">Grid</span>
            </button>
            <button
              className={`flex-1 px-3 py-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'map' 
                  ? 'bg-white dark:bg-gray-900 text-accent shadow-sm font-medium' 
                  : 'text-muted'
              }`}
              onClick={() => setViewMode('map')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-xs font-medium">Map</span>
            </button>
          </div>
        </div>

        {/* Controls - Mobile Optimized */}
        <div className="space-y-3 mb-4 sm:mb-6">
          {/* Location Search */}
          <LocationSearch
            placeholder="Search by city or location..."
            value={selectedLocation?.fullAddress || ''}
            onLocationSelect={handleLocationSelect}
            onClear={() => setSelectedLocation(null)}
            onSearchStart={handleSearchStart}
            onSearchEnd={handleSearchEnd}
          />

          {/* Mobile Filter Bar */}
          <div className="flex gap-2">
            <select 
              className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 appearance-none"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">🏠 All Types</option>
              <option value="brrrr">♻️ BRRRR</option>
              <option value="flip">🔨 Fix & Flip</option>
              <option value="hold">📦 Buy & Hold</option>
              <option value="multifamily">🏢 Multifamily</option>
              <option value="house hack">🏡 House Hack</option>
              <option value="mobile home">🚐 Mobile Home</option>
            </select>
            
            <select 
              className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">📅 Newest</option>
              <option value="price">💰 Price ↓</option>
              <option value="roi">📈 ROI ↓</option>
              <option value="confidence">⭐ Rating</option>
            </select>

            {/* Desktop view mode toggle */}
            <div className="hidden md:flex bg-card border border-border/60 rounded-lg overflow-hidden">
              <button
                className={`px-4 py-3 min-h-[44px] min-w-[44px] flex items-center justify-center ${viewMode === 'grid' ? 'bg-accent/10 text-accent' : 'text-muted hover:text-primary'}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                className={`px-4 py-3 min-h-[44px] min-w-[44px] flex items-center justify-center ${viewMode === 'list' ? 'bg-accent/10 text-accent' : 'text-muted hover:text-primary'}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                className={`px-4 py-3 min-h-[44px] min-w-[44px] flex items-center justify-center ${viewMode === 'map' ? 'bg-accent/10 text-accent' : 'text-muted hover:text-primary'}`}
                onClick={() => setViewMode('map')}
                aria-label="Map view"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar 
          deals={deals}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />


        {/* Content Area - Centered on mobile */}
        <div className="transition-all duration-300 w-full">
          {filteredDeals.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-16 px-4 max-w-md mx-auto">
              <svg 
                className="w-16 h-16 text-muted mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                />
              </svg>
              <h3 className="text-lg font-semibold text-primary mb-2">
                No {statusTab !== 'all' ? statusTab : ''} properties available
              </h3>
              <p className="text-muted text-center max-w-md mb-6">
                {selectedLocation ? (
                  <>
                    We don&apos;t have any {statusTab !== 'all' ? statusTab : ''} properties in <span className="font-medium">{selectedLocation.fullAddress}</span> yet. 
                    We&apos;re actively expanding to new markets and this area is on our list!
                  </>
                ) : statusTab === 'sold' ? (
                  "No sold properties yet. Properties marked as sold in the admin panel will appear here."
                ) : statusTab === 'pending' ? (
                  "No pending properties. Properties marked as pending in the admin panel will appear here."
                ) : (
                  "No properties match your current filters. Try adjusting your search criteria."
                )}
              </p>
              {selectedLocation && (
                <button
                  onClick={() => {
                    setSelectedLocation(null);
                    handleClearFilters();
                  }}
                  className="px-4 py-2 bg-accent text-secondary rounded-lg hover:bg-accent/90 transition-colors"
                >
                  View All Properties
                </button>
              )}
            </div>
          ) : viewMode === 'map' ? (
            <MapView 
              deals={filteredDeals}
              selectedLocation={selectedLocation}
              onDealClick={(deal) => {
                setSelectedDeal(deal);
                setIsModalOpen(true);
                // On mobile, exit map view when viewing details
                if (window.innerWidth < 768) {
                  setViewMode('grid');
                }
              }}
            />
          ) : (
          /* Deals Grid/List - Mobile optimized with centered content */
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 max-w-md sm:max-w-none mx-auto' : 'space-y-4 max-w-md sm:max-w-none mx-auto'}>
            {filteredDeals.map((deal) => (
              <PremiumPropertyCard
                key={deal.id}
                deal={deal}
                viewMode={viewMode}
                onViewDetails={() => {
                  // Check if property has comprehensive data
                  if (deal.strategicOverview || deal.thirtyYearProjections || deal.locationAnalysis) {
                    setComprehensiveProperty(deal);
                    setShowComprehensiveView(true);
                  } else {
                    // Fall back to regular deal modal
                    setSelectedDeal(deal);
                    setIsModalOpen(true);
                  }
                }}
              />
            ))}
          </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted pb-4">
          {isLoading ? (
            <span>Loading properties...</span>
          ) : (
            <>
              Showing {filteredDeals.length} {statusTab !== 'all' ? statusTab : ''} 
              {filteredDeals.length === 1 ? ' property' : ' properties'}
              {selectedLocation && ` in ${selectedLocation.fullAddress}`}
            </>
          )}
        </div>

          </div>
        </main>
      </div>

      {/* Deal Modal */}
      <DealModal 
        deal={selectedDeal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDeal(null);
        }}
      />

      {/* Comprehensive Property View Modal */}
      <PremiumPropertyView
        isOpen={showComprehensiveView}
        property={comprehensiveProperty}
        onClose={() => {
          setShowComprehensiveView(false);
          setComprehensiveProperty(null);
        }}
      />

      {/* Floating Admin Button - Only visible to admins */}
      <AdminTools variant="floating" />
    </div>
  );
}