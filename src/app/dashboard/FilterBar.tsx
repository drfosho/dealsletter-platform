'use client';

import { useState, useEffect } from 'react';

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

interface FilterBarProps {
  deals: Deal[];
  onFiltersChange: (filters: {
    market: string;
    strategy: string;
    priceRange: [number, number];
    minROI: number;
  }) => void;
  onClearFilters: () => void;
}

export default function FilterBar({ deals, onFiltersChange, onClearFilters }: FilterBarProps) {
  // Calculate dynamic price range from deals
  const maxPrice = deals.length > 0 ? Math.max(...deals.map(deal => deal.price)) : 2000000;
  const roundedMaxPrice = Math.ceil(maxPrice / 100000) * 100000; // Round up to nearest 100k
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [market, setMarket] = useState('all');
  const [strategy, setStrategy] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, roundedMaxPrice]);
  const [minROI, setMinROI] = useState(0);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Update price range when deals change
  useEffect(() => {
    setPriceRange([0, roundedMaxPrice]);
  }, [roundedMaxPrice]);

  // Calculate active filters
  useEffect(() => {
    let count = 0;
    if (market !== 'all') count++;
    if (strategy !== 'all') count++;
    if (priceRange[0] > 0 || priceRange[1] < roundedMaxPrice) count++;
    if (minROI > 0) count++;
    setActiveFilterCount(count);
  }, [market, strategy, priceRange, minROI, roundedMaxPrice]);

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange({
      market,
      strategy,
      priceRange,
      minROI
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, strategy, priceRange, minROI]);

  const handleClearFilters = () => {
    setMarket('all');
    setStrategy('all');
    setPriceRange([0, roundedMaxPrice]);
    setMinROI(0);
    onClearFilters();
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="mb-6">
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-card border border-border/60 rounded-lg flex items-center justify-between hover:bg-muted/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full font-medium">
                {activeFilterCount}
              </span>
            )}
          </div>
          <svg 
            className={`w-5 h-5 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block`}>
        <div className="bg-card border border-border/60 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Market Dropdown */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Market</label>
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30"
              >
                <option value="all">All Markets</option>
                <option value="san-diego">San Diego</option>
                <option value="bay-area">Bay Area</option>
                <option value="los-angeles">Los Angeles</option>
                <option value="kansas-city">Kansas City, MO</option>
                <option value="tampa">Tampa</option>
              </select>
            </div>

            {/* Strategy Dropdown */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30"
              >
                <option value="all">All Strategies</option>
                <option value="fix-flip">Fix & Flip</option>
                <option value="brrrr">BRRRR</option>
                <option value="buy-hold">Buy & Hold</option>
                <option value="house-hack">House Hack</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={roundedMaxPrice}
                  step={Math.max(50000, Math.floor(roundedMaxPrice / 40))} // Dynamic step size
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-muted/20 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>

            {/* Min ROI */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Min ROI: {minROI}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={minROI}
                onChange={(e) => setMinROI(parseInt(e.target.value))}
                className="w-full h-2 bg-muted/20 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-muted/10 text-muted hover:bg-muted/20 hover:text-primary border border-border/60 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                disabled={activeFilterCount === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-xs rounded-full font-medium ml-1">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}