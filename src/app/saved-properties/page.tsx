'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserFavoriteProperties } from '@/lib/supabase/favorites';
import PropertyCard from '@/components/PropertyCard';
import DealModal from '@/app/dashboard/DealModal';

interface SavedProperty {
  id: number;
  title: string;
  location: string;
  price: number;
  savedDate: string;
  type: string;
  status: 'active' | 'sold' | 'pending';
  [key: string]: unknown;
}

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

export default function SavedPropertiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [savedProperties, setSavedProperties] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'price' | 'roi'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'pending' | 'sold'>('all');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // The curated deals data (same as in dashboard)
  const curatedDeals = useMemo(() => [
    {
      id: 1,
      title: "853 S 32nd Street",
      address: "853 S 32nd Street",
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
      totalROI: 42.3,
      roi: "42.3%",
      capRate: 5.63,
      monthlyCashFlow: 1938
    },
    {
      id: 2,
      title: "6522 Bancroft Ave",
      address: "6522 Bancroft Ave",
      location: "Oakland, CA 94605",
      type: "Premium Flip",
      strategy: "Fix & Flip",
      price: 979000,
      downPayment: 979000,
      arv: 1500000,
      rehabBudget: 145000,
      rehabCosts: 145000,
      netProfit: 189000,
      roi: "15.46%",
      flipROI: 15.46,
      annualizedROI: 31,
      status: "active",
      daysOnMarket: 3,
      confidence: "high",
      images: ["/api/placeholder/400/300"],
      bedrooms: 6,
      bathrooms: 4,
      sqft: 4280,
      yearBuilt: 2005,
      features: ["All Cash Only", "Luxury Finishes", "View Property"],
      description: "High-end flip opportunity with tremendous upside in prime Oakland hills location.",
      riskLevel: "low",
      timeframe: "6 months",
      cashRequired: 1124000,
      totalROI: 16.82
    },
    {
      id: 3,
      title: "5815 Highland Ave",
      address: "5815 Highland Ave",
      location: "Richmond, CA 94804",
      type: "House Hack",
      strategy: "House Hack",
      price: 975000,
      downPayment: 33913,
      monthlyRent: 3700,
      units: 2,
      cashFlow: 750,
      monthlyCashFlow: 750,
      status: "active",
      daysOnMarket: 1,
      confidence: "medium",
      images: ["/api/placeholder/400/300"],
      bedrooms: "3+2",
      bathrooms: "2+1",
      sqft: 2100,
      yearBuilt: 1998,
      features: ["Low Down Payment", "Dual Units", "Recent Updates"],
      description: "Perfect house hack opportunity with separate units for rental income while you live in one.",
      riskLevel: "low",
      timeframe: "Immediate",
      cashRequired: 33913,
      roi: "26.5%",
      totalROI: 26.5
    },
    {
      id: 4,
      title: "212 Oak Street",
      address: "212 Oak Street",
      location: "San Francisco, CA",
      type: "Multi-Family",
      strategy: "Buy & Hold",
      price: 1800000,
      downPayment: 450000,
      confidence: "high",
      status: "active",
      daysOnMarket: 5,
      images: ["/api/placeholder/400/300"],
      features: ["Prime Location", "Stable Tenants", "Below Market Rents"],
      riskLevel: "low",
      proFormaCapRate: "6.2%",
      capRate: 6.2,
      roi: "18.5%",
      totalROI: 18.5,
      proFormaCashFlow: "$2,850/mo",
      monthlyCashFlow: 2850
    },
    {
      id: 5,
      title: "789 Industrial Blvd",
      address: "789 Industrial Blvd",
      location: "Oakland, CA",
      type: "Commercial",
      strategy: "Development",
      price: 2200000,
      downPayment: 660000,
      confidence: "medium",
      status: "active",
      daysOnMarket: 12,
      images: ["/api/placeholder/400/300"],
      features: ["Zoning Opportunity", "Large Lot", "Near Transit"],
      riskLevel: "high",
      proFormaCapRate: "8.5%",
      capRate: 8.5,
      roi: "35%",
      totalROI: 35,
      proFormaCashFlow: "$5,200/mo",
      monthlyCashFlow: 5200
    },
    {
      id: 6,
      title: "456 Maple Avenue",
      address: "456 Maple Avenue",
      location: "Berkeley, CA",
      type: "Single Family",
      strategy: "BRRRR",
      price: 950000,
      downPayment: 237500,
      confidence: "high",
      status: "active",
      daysOnMarket: 3,
      images: ["/api/placeholder/400/300"],
      features: ["Fixer Upper", "Great Schools", "Large Yard"],
      riskLevel: "medium",
      proFormaCapRate: "5.8%",
      capRate: 5.8,
      roi: "24%",
      totalROI: 24,
      proFormaCashFlow: "$1,650/mo",
      monthlyCashFlow: 1650,
      rehabCosts: 85000
    }
  ], []);

  const fetchSavedProperties = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: favorites } = await getUserFavoriteProperties(user.id);
      
      // Map the favorites to include full deal details
      const propertiesWithDetails = favorites
        .map(fav => {
          const deal = curatedDeals.find(d => d.id === fav.property_id);
          if (deal) {
            return {
              ...deal,
              savedDate: fav.saved_at
            };
          }
          return null;
        })
        .filter((prop): prop is Deal => prop !== null);
      
      setSavedProperties(propertiesWithDetails);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    } finally {
      setLoading(false);
    }
  }, [user, curatedDeals]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else {
      fetchSavedProperties();
    }
  }, [user, router, fetchSavedProperties]);

  // Sort properties
  const sortedProperties = useMemo(() => {
    const filtered = filterBy === 'all' 
      ? savedProperties 
      : savedProperties.filter(p => p.status === filterBy);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'roi':
          return (b.totalROI || 0) - (a.totalROI || 0);
        case 'recent':
        default:
          return new Date(b.savedDate || 0).getTime() - new Date(a.savedDate || 0).getTime();
      }
    });
  }, [savedProperties, sortBy, filterBy]);

  const handleViewDetails = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDeal(null);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary">Saved Properties</h1>
                <p className="mt-2 text-muted">
                  {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved
                </p>
              </div>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Browse More Deals
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-4">
            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-4 py-2 bg-card border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="all">All Properties</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-card border border-border/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="recent">Recently Saved</option>
              <option value="price">Price (High to Low)</option>
              <option value="roi">ROI (High to Low)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-card border border-border/60 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-secondary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-secondary'
                  : 'text-muted hover:text-primary'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Properties Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : sortedProperties.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border/60">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-primary mb-2">No saved properties yet</h3>
            <p className="text-muted mb-6">Start exploring deals and save your favorites!</p>
            <Link 
              href="/dashboard"
              className="inline-flex px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Browse Available Deals
            </Link>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }>
            {sortedProperties.map((deal) => (
              <PropertyCard
                key={deal.id}
                deal={deal}
                viewMode={viewMode}
                onViewDetails={() => handleViewDetails(deal)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Deal Modal */}
      {selectedDeal && (
        <DealModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          deal={selectedDeal}
        />
      )}
    </div>
  );
}