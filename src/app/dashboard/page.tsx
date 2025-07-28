'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import DealModal from './DealModal';
import FilterBar from './FilterBar';
import FavoriteButton from '@/components/FavoriteButton';
import SavePropertyButton from '@/components/SavePropertyButton';
import ViewerTracker from '@/components/ViewerTracker';
import ActivityBadges from '@/components/ActivityBadges';
import LocationSearch from '@/components/LocationSearch';
import MarketNotification from '@/components/MarketNotification';
import { isLocationSupported } from '@/config/markets';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';

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
  totalROI?: number | null;
  capRate?: number | null;
  cashFlow?: number | null;
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
  const [selectedLocation, setSelectedLocation] = useState<{
    city: string;
    state: string;
    fullAddress: string;
    coordinates?: { lat: number; lng: number };
  } | null>(null);
  const [unsupportedLocation, setUnsupportedLocation] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [previousViewMode, setPreviousViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        const response = await fetch('/api/properties');
        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard: Fetched properties:', data.length);
          const formattedProperties = data.map((prop: Deal & Record<string, unknown>, index: number) => ({
            id: typeof prop.id === 'string' ? parseInt(prop.id) : prop.id || 1000 + index,
            title: prop.title,
            location: `${prop.city}, ${prop.state} ${prop.zipCode}`,
            type: prop.propertyType,
            strategy: prop.investmentStrategy,
            price: prop.price,
            downPayment: prop.downPayment,
            downPaymentPercent: prop.downPaymentPercent,
            confidence: prop.confidence,
            status: 'active',
            daysOnMarket: prop.daysOnMarket,
            images: prop.images || ["/api/placeholder/400/300"],
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            sqft: prop.sqft,
            yearBuilt: prop.yearBuilt,
            features: prop.features,
            description: prop.description,
            riskLevel: prop.riskLevel,
            timeframe: prop.holdPeriod ? `${prop.holdPeriod} years` : 'Long-term',
            cashRequired: prop.downPayment + (typeof prop.closingCosts === 'number' ? prop.closingCosts : 0) + (typeof prop.rehabCosts === 'number' ? prop.rehabCosts : 0),
            totalROI: prop.totalROI,
            capRate: prop.capRate,
            cashFlow: prop.monthlyCashFlow,
            monthlyRent: prop.monthlyRent,
            neighborhood: prop.neighborhood
          }));
          setDynamicProperties(formattedProperties);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchProperties();
  }, [lastRefresh]);

  // All deals now come from the API (including static deals)
  const deals = useMemo(() => {
    return dynamicProperties;
  }, [dynamicProperties]);

  const filteredDeals = useMemo(() => {
    let filtered = deals;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(deal => 
        deal.strategy.toLowerCase().includes(selectedFilter.toLowerCase()) ||
        deal.type.toLowerCase().includes(selectedFilter.toLowerCase())
      );
    }

    // Filter by location search
    if (selectedLocation && !isSearching) {
      const searchCity = selectedLocation.city.toLowerCase();
      const searchState = selectedLocation.state.toLowerCase();
      
      filtered = filtered.filter(deal => {
        const [city = '', stateZip = ''] = deal.location.toLowerCase().split(',').map(s => s.trim());
        const state = stateZip.split(' ')[0];
        
        return city.includes(searchCity) || 
               (state && state.includes(searchState)) ||
               deal.location.toLowerCase().includes(searchCity);
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
  }, [deals, selectedFilter, selectedLocation, isSearching, filters, sortBy]);

  const handleDealClick = useCallback((deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  }, []);

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
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Investment Properties</h1>
          <p className="text-muted">Discover your next profitable real estate investment</p>
        </div>

        {/* Unsupported Location Notification */}
        {unsupportedLocation && (
          <MarketNotification 
            location={unsupportedLocation}
            onClose={() => setUnsupportedLocation(null)}
          />
        )}

        {/* Mobile view mode toggle */}
        <div className="md:hidden mb-4 flex gap-2 bg-card border border-border/60 rounded-lg p-1">
          <button
            className={`flex-1 px-4 py-3 min-h-[48px] flex items-center justify-center rounded-md transition-all ${
              viewMode === 'grid' 
                ? 'bg-accent text-secondary font-medium' 
                : 'text-muted hover:text-primary'
            }`}
            onClick={() => setViewMode('grid')}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Grid
          </button>
          <button
            className={`flex-1 px-4 py-3 min-h-[48px] flex items-center justify-center rounded-md transition-all ${
              viewMode === 'list' 
                ? 'bg-accent text-secondary font-medium' 
                : 'text-muted hover:text-primary'
            }`}
            onClick={() => setViewMode('list')}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
          </button>
          <button
            className={`flex-1 px-4 py-3 min-h-[48px] flex items-center justify-center rounded-md transition-all ${
              viewMode === 'map' 
                ? 'bg-accent text-secondary font-medium' 
                : 'text-muted hover:text-primary'
            }`}
            onClick={() => setViewMode('map')}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Map
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Location Search */}
          <div className="flex-1">
            <LocationSearch
              placeholder="Search by city or location..."
              value={selectedLocation?.fullAddress || ''}
              onLocationSelect={handleLocationSelect}
              onClear={() => setSelectedLocation(null)}
              onSearchStart={handleSearchStart}
              onSearchEnd={handleSearchEnd}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select 
              className="px-4 py-3 bg-card border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 hidden sm:block"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="brrrr">BRRRR</option>
              <option value="flip">Fix & Flip</option>
              <option value="hold">Buy & Hold</option>
              <option value="multifamily">Multifamily</option>
              <option value="house hack">House Hack</option>
              <option value="mobile home">Mobile Home Park</option>
            </select>
            
            <select 
              className="px-4 py-3 bg-card border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Newest First</option>
              <option value="price">Price: High to Low</option>
              <option value="roi">ROI: High to Low</option>
              <option value="confidence">Confidence</option>
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

        {/* Content Area */}
        <div className="transition-all duration-300">
          {viewMode === 'map' ? (
            <MapView 
              deals={filteredDeals}
              selectedLocation={selectedLocation}
              onDealClick={(deal) => {
                setSelectedDeal(deal);
                setIsModalOpen(true);
              }}
            />
          ) : (
          /* Deals Grid/List */
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredDeals.map((deal) => (
            <div 
              key={deal.id} 
              className={`bg-card rounded-xl border border-border/60 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10 hover:border-accent/30 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer group ${viewMode === 'list' ? 'p-6' : 'overflow-hidden'}`}
            >
              {viewMode === 'grid' && (
                <div className="relative h-48 bg-muted/20 overflow-hidden">
                  {/* Top overlay - confidence and activity badges */}
                  <div className="absolute top-4 left-4 z-10 flex items-start gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      deal.confidence === 'high' ? 'bg-green-500/20 text-green-600' :
                      deal.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                      'bg-red-500/20 text-red-600'
                    }`}>
                      {deal.confidence.toUpperCase()}
                    </span>
                    <ActivityBadges deal={{ ...deal, daysOnMarket: deal.daysOnMarket || 0 }} />
                  </div>
                  
                  {/* Top right - deal type and favorite */}
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <span className="px-2 py-1 bg-accent/20 text-accent rounded-md text-xs font-medium">
                      {deal.type}
                    </span>
                    <FavoriteButton propertyId={deal.id} size="medium" />
                  </div>
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  
                  {/* Bottom overlay - viewer count and time */}
                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <div className="flex items-end justify-between">
                      <ViewerTracker dealId={deal.id} />
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
                    <h3 className="text-lg font-semibold text-primary mb-1">{deal.title}</h3>
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
                      <ActivityBadges deal={{ ...deal, daysOnMarket: deal.daysOnMarket || 0 }} />
                      {viewMode === 'list' && <ViewerTracker dealId={deal.id} />}
                    </div>
                  </div>
                  {viewMode === 'list' && (
                    <div className="flex items-start gap-4">
                      <FavoriteButton propertyId={deal.id} size="medium" />
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
                    <SavePropertyButton propertyId={deal.id} />
                    <button
                      onClick={() => handleDealClick(deal)}
                      className="text-sm text-accent hover:text-accent/80 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mt-8 text-center text-sm text-muted">
          {isLoading ? (
            <span>Loading properties...</span>
          ) : (
            <>
              Showing {filteredDeals.length} of {deals.length} properties
              {selectedLocation && ` in ${selectedLocation.fullAddress}`}
            </>
          )}
        </div>

        {/* Debug info - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-muted/50 text-center">
            Properties: {dynamicProperties.length} total = {deals.length} deals
          </div>
        )}
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
    </div>
  );
}