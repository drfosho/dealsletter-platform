'use client';

import { useState, useMemo, useCallback } from 'react';
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

  // Sample deals data - in real app this would come from API
  const deals = useMemo(() => [
    {
      id: 1,
      title: "853 S 32nd Street",
      location: "San Diego, CA 92113",
      type: "Opportunity Zone",
      strategy: "BRRRR",
      price: 1295000,
      downPayment: 647500,
      currentCapRate: 3.39,
      proFormaCapRate: 5.63,
      monthlyRent: 5905,
      proFormaCashFlow: 1938,
      rentUpside: 2495,
      status: "active",
      daysOnMarket: 2,
      confidence: "high",
      images: ["/api/placeholder/400/300"],
      bedrooms: "Mixed",
      bathrooms: "Mixed",
      sqft: "7,325 sq ft lot",
      yearBuilt: 1950,
      features: ["Promise Zone", "Transit Priority", "ADU Potential"],
      description: "4-unit mixed configuration property in an Opportunity Zone with significant value-add potential.",
      riskLevel: "medium",
      timeframe: "6-12 months",
      cashRequired: 647500,
      totalROI: 42.3
    },
    {
      id: 2,
      title: "2570 68th Ave",
      location: "Oakland, CA 94605", 
      type: "Flip Opportunity",
      strategy: "Fix & Flip",
      price: 410000,
      downPayment: 41000,
      arv: 615000,
      rehabBudget: 79000,
      netProfit: 65172,
      roi: 49.06,
      annualizedROI: 147.17,
      status: "active",
      daysOnMarket: 1,
      confidence: "medium",
      images: ["/api/placeholder/400/300"],
      bedrooms: 3,
      bathrooms: 1.5,
      sqft: 1293,
      yearBuilt: 1922,
      features: ["Hard Money", "4-Month Timeline", "Experienced Only"],
      description: "1920s character home with strong flip potential in Oakland market.",
      riskLevel: "high",
      timeframe: "4 months",
      cashRequired: 132854,
      totalROI: 49.06
    },
    {
      id: 3,
      title: "Hyde Park Arbors",
      location: "Tampa, FL 33609",
      type: "Multifamily",
      strategy: "Buy & Hold", 
      price: 3350000,
      downPayment: 837500,
      capRate: 6.9,
      monthlyIncome: 29600,
      cashFlow: 1708,
      pricePerUnit: 209375,
      units: 16,
      status: "active",
      daysOnMarket: 3,
      confidence: "high",
      images: ["/api/placeholder/400/300"],
      bedrooms: "8x1BR, 8x2BR",
      bathrooms: "Mixed",
      sqft: "16 units",
      yearBuilt: 1985,
      features: ["Value-Add", "Premier Location", "South Tampa"],
      description: "16-unit apartment building in premier South Tampa location with value-add opportunities.",
      riskLevel: "low",
      timeframe: "Long-term",
      cashRequired: 938000,
      totalROI: 6.9
    },
    {
      id: 4,
      title: "673 Doreen Way",
      location: "Lafayette, CA 94549",
      type: "Premium Flip",
      strategy: "Fix & Flip",
      price: 999900,
      downPayment: 230000,
      recommendedOffer: 1150000,
      arv: 1700000,
      rehabBudget: 165000,
      netProfit: 227627,
      roi: 75.3,
      annualizedROI: 225.9,
      status: "active",
      daysOnMarket: 0, // This will show NEW badge
      confidence: "high",
      images: ["/api/placeholder/400/300"],
      bedrooms: 4,
      bathrooms: 2,
      sqft: 1635,
      yearBuilt: null,
      features: ["Spectacular Views", "A+ Schools", "Cosmetic Only"],
      description: "Located in highly coveted Lafayette Hills with spectacular views in Acalanes School District (all 10-rated schools).",
      riskLevel: "low",
      timeframe: "4 months",
      cashRequired: 302373,
      totalROI: 75.3
    },
    {
      id: 5,
      title: "1206 Viola St",
      location: "San Diego, CA 92110",
      type: "Duplex",
      strategy: "House Hack",
      price: 895000,
      downPayment: 44750,
      currentRent: 2850,
      effectiveMortgage: 4476,
      walkScore: 86,
      status: "active",
      daysOnMarket: 1,
      confidence: "high",
      images: ["/api/placeholder/400/300"],
      bedrooms: "2x 1BR",
      bathrooms: "2x 1BA",
      units: 2,
      sqft: null,
      yearBuilt: null,
      features: ["FHA 5% Down", "Near USD", "Turnkey"],
      description: "Perfect house hack opportunity - live in one unit while tenant pays 40% of mortgage. Walk Score 86.",
      riskLevel: "low",
      timeframe: "Long-term",
      cashRequired: 54750,
      totalROI: null
    },
    {
      id: 6,
      title: "8110 MacArthur Blvd",
      location: "Oakland, CA 94605",
      type: "Value-Add Multifamily",
      strategy: "Buy & Hold",
      price: 1850000,
      downPayment: 462500,
      pricePerUnit: 74000,
      units: 25,
      currentCapRate: 9.62,
      proFormaCapRate: 17.88,
      currentIncome: 24591,
      proFormaIncome: 42500,
      monthlyIncome: 24591,
      proFormaCashFlow: 22279,
      status: "active",
      daysOnMarket: 1,
      confidence: "high",
      images: ["/api/placeholder/400/300"],
      bedrooms: "25x 1BR",
      bathrooms: "25x 1BA",
      sqft: "900 sq ft each",
      yearBuilt: null,
      features: ["100% Occupied", "Section 8 Opportunity", "$546/unit Below Market"],
      description: "25-unit building with massive upside - current rents $546/unit below market. Section 8 conversion opportunity.",
      riskLevel: "medium",
      timeframe: "3 years",
      cashRequired: 518000,
      totalROI: 55.22
    },
    {
      id: 7,
      title: "16118-16152 Mateo St",
      location: "San Leandro, CA 94578",
      type: "Premium Multifamily",
      strategy: "Buy & Hold",
      price: 1625000,
      downPayment: 406250,
      pricePerUnit: 270833,
      units: 6,
      currentCapRate: 5.36,
      proFormaCapRate: 6.06,
      monthlyIncome: 11772,
      proFormaCashFlow: -111,
      currentCashFlow: -1059,
      status: "active",
      daysOnMarket: 2,
      confidence: "medium",
      images: ["/api/placeholder/400/300"],
      bedrooms: "4x 1BR, 2x 2BR",
      bathrooms: "6x 1BA",
      sqft: null,
      yearBuilt: null,
      features: ["No Shared Walls", "Tenant Pays ALL Utilities", "0.6mi to BART"],
      description: "Unique 6-unit property with private garages, no shared walls, and ultra-low 35.5% OpEx ratio. In-unit W/D.",
      riskLevel: "low",
      timeframe: "Long-term",
      cashRequired: 431250,
      totalROI: 51.2
    }
  ], []);

  const filteredDeals = useMemo(() => {
    let filtered = deals;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(deal => 
        deal.strategy.toLowerCase().includes(selectedFilter.toLowerCase()) ||
        deal.type.toLowerCase().includes(selectedFilter.toLowerCase())
      );
    }


    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(deal => {
        const dealLocation = deal.location.toLowerCase();
        const selectedCity = selectedLocation.city.toLowerCase();
        
        // Extract city from deal location (format: "City, State ZIP")
        const dealParts = dealLocation.split(',');
        if (dealParts.length > 0) {
          const dealCity = dealParts[0].trim();
          return dealCity === selectedCity;
        }
        
        // Fallback to includes check
        return dealLocation.includes(selectedCity);
      });
    }

    // Market filter
    if (filters.market !== 'all') {
      const marketMap: { [key: string]: string[] } = {
        'san-diego': ['San Diego'],
        'bay-area': ['Oakland', 'Lafayette', 'San Leandro'],
        'los-angeles': ['Los Angeles'],
        'kansas-city': ['Kansas City'],
        'tampa': ['Tampa']
      };
      
      const targetCities = marketMap[filters.market] || [];
      filtered = filtered.filter(deal =>
        targetCities.some(city => deal.location.includes(city))
      );
    }

    // Strategy filter
    if (filters.strategy !== 'all') {
      const strategyMap: { [key: string]: string } = {
        'fix-flip': 'Fix & Flip',
        'brrrr': 'BRRRR',
        'buy-hold': 'Buy & Hold',
        'house-hack': 'House Hack'
      };
      
      filtered = filtered.filter(deal =>
        deal.strategy === strategyMap[filters.strategy]
      );
    }

    // Price range filter
    filtered = filtered.filter(deal =>
      deal.price >= filters.priceRange[0] && deal.price <= filters.priceRange[1]
    );

    // Min ROI filter
    if (filters.minROI > 0) {
      filtered = filtered.filter(deal =>
        (deal.totalROI || 0) >= filters.minROI
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'roi':
          return (b.totalROI || 0) - (a.totalROI || 0);
        case 'confidence':
          const confidenceOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
          return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
        default:
          return a.daysOnMarket - b.daysOnMarket;
      }
    });

    return filtered;
  }, [selectedFilter, selectedLocation, sortBy, deals, filters]);

  const stats = {
    totalDeals: deals.length,
    totalValue: deals.reduce((sum, deal) => sum + deal.price, 0),
    avgROI: deals.reduce((sum, deal) => sum + (deal.totalROI || 0), 0) / deals.length,
    highConfidence: deals.filter(deal => deal.confidence === 'high').length
  };

  const handleFiltersChange = useCallback((newFilters: {
    market: string;
    strategy: string;
    priceRange: [number, number];
    minROI: number;
  }) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    const maxPrice = deals.length > 0 ? Math.max(...deals.map(deal => deal.price)) : 2000000;
    const roundedMaxPrice = Math.ceil(maxPrice / 100000) * 100000;
    
    setFilters({
      market: 'all',
      strategy: 'all',
      priceRange: [0, roundedMaxPrice],
      minROI: 0
    });
  }, [deals]);

  const handleLocationSelect = useCallback((location: {
    city: string;
    state: string;
    fullAddress: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    // Check if location is supported
    const supportedMarket = isLocationSupported(location.city, location.state);
    
    if (supportedMarket) {
      setSelectedLocation(location);
      setUnsupportedLocation(null);
      
      // If we were in map view before searching, return to map view
      if (previousViewMode === 'map' && isSearching) {
        setViewMode('map');
      }
    } else {
      // Show notification for unsupported location
      setUnsupportedLocation(location.city);
      // Don't set the selected location so no filtering happens
    }
  }, [previousViewMode, isSearching]);

  const handleSearchStart = useCallback(() => {
    if (viewMode === 'map') {
      setPreviousViewMode('map');
      setViewMode('grid'); // Temporarily switch to grid view
      setIsSearching(true);
    }
  }, [viewMode]);

  const handleSearchEnd = useCallback(() => {
    setIsSearching(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="dashboard" />

      {/* Stats Bar */}
      <section className="bg-muted/5 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalDeals}</div>
              <div className="text-sm text-muted">Active Deals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">${(stats.totalValue / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-muted">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.avgROI.toFixed(1)}%</div>
              <div className="text-sm text-muted">Avg. ROI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.highConfidence}</div>
              <div className="text-sm text-muted">High Confidence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Mobile View Mode Tabs - Visible only on mobile */}
        <div className="flex md:hidden bg-card border border-border/60 rounded-lg p-1 mb-4">
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
                    <ActivityBadges deal={deal} />
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
                        {deal.riskLevel.toUpperCase()} RISK
                      </span>
                      <ActivityBadges deal={deal} />
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
                  
                  {deal.proFormaCapRate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted">Pro Forma Cap</span>
                      <span className="font-semibold text-accent">{deal.proFormaCapRate}%</span>
                    </div>
                  )}
                  
                  {deal.roi && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted">ROI</span>
                      <span className="font-semibold text-green-600">{deal.roi}%</span>
                    </div>
                  )}
                  
                  {deal.capRate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted">Cap Rate</span>
                      <span className="font-semibold text-accent">{deal.capRate}%</span>
                    </div>
                  )}
                  
                  {deal.proFormaCashFlow && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted">Cash Flow</span>
                      <span className="font-semibold text-green-600">${deal.proFormaCashFlow}/mo</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {deal.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-muted/10 text-muted rounded-md">
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button 
                    className="flex-1 px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm min-h-[44px] flex items-center justify-center"
                    onClick={() => {
                      setSelectedDeal(deal);
                      setIsModalOpen(true);
                    }}
                  >
                    View Details
                  </button>
                  <SavePropertyButton 
                    propertyId={deal.id} 
                    variant="outline"
                  />
                </div>
              </div>
              </div>
            ))}
          </div>
          )}

          {viewMode !== 'map' && filteredDeals.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-primary mb-2">No deals found</h3>
              <p className="text-muted">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </main>

      {/* Deal Modal */}
      <DealModal 
        deal={selectedDeal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDeal(null);
        }}
      />

      {/* Mobile Floating View Toggle and Exit Button */}
      <div className="fixed bottom-6 right-6 md:hidden z-40 flex flex-col gap-3">
        {/* Exit Map Button - Only show in map view */}
        {viewMode === 'map' && (
          <div className="bg-card text-primary rounded-full shadow-lg overflow-hidden border border-border/60">
            <button
              className="p-4 min-h-[56px] min-w-[56px] flex items-center justify-center"
              onClick={() => setViewMode('grid')}
              aria-label="Exit map view"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* View Mode Toggle */}
        <div className="bg-accent text-secondary rounded-full shadow-lg overflow-hidden">
          <button
            className="p-4 min-h-[56px] min-w-[56px] flex items-center justify-center"
            onClick={() => {
              // Cycle through view modes: grid -> list -> map -> grid
              if (viewMode === 'grid') setViewMode('list');
              else if (viewMode === 'list') setViewMode('map');
              else setViewMode('grid');
            }}
            aria-label="Change view mode"
          >
            {viewMode === 'grid' && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            )}
            {viewMode === 'list' && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            )}
            {viewMode === 'map' && (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Market Not Available Notification */}
      {unsupportedLocation && (
        <MarketNotification 
          location={unsupportedLocation}
          onClose={() => setUnsupportedLocation(null)}
        />
      )}
    </div>
  );
}