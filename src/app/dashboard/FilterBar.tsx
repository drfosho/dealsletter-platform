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
    <div className="mb-4 sm:mb-6">
      {/* Mobile Toggle Button - Compact Design */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full px-4 py-2.5 rounded-lg flex items-center justify-between transition-all ${
            isExpanded 
              ? 'bg-accent text-white' 
              : 'bg-gray-100 dark:bg-gray-800 text-primary hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-sm font-medium">Advanced Filters</span>
            {activeFilterCount > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                isExpanded 
                  ? 'bg-white/20 text-white' 
                  : 'bg-accent text-white'
              }`}>
                {activeFilterCount}
              </span>
            )}
          </div>
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filter Content - Mobile Optimized */}
      <div className={`${isExpanded ? 'block mt-3' : 'hidden'} sm:block`}>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Market Dropdown */}
            <div className="sm:col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Market</label>
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 appearance-none"
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
            <div className="sm:col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 appearance-none"
              >
                <option value="all">All Strategies</option>
                <option value="fix-flip">Fix & Flip</option>
                <option value="brrrr">BRRRR</option>
                <option value="buy-hold">Buy & Hold</option>
                <option value="house-hack">House Hack</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Price: {formatPrice(priceRange[1])}
              </label>
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={roundedMaxPrice}
                  step={Math.max(50000, Math.floor(roundedMaxPrice / 40))}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>$0</span>
                  <span>{formatPrice(roundedMaxPrice)}</span>
                </div>
              </div>
            </div>

            {/* Min ROI */}
            <div className="col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                ROI: {minROI}%+
              </label>
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={minROI}
                  onChange={(e) => setMinROI(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Clear Filters - Mobile Friendly */}
            <div className="col-span-1 flex items-end">
              <button
                onClick={handleClearFilters}
                className={`w-full px-3 py-2.5 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1.5 ${
                  activeFilterCount > 0
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
                disabled={activeFilterCount === 0}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Clear</span>
                {activeFilterCount > 0 && (
                  <span className="bg-white dark:bg-gray-900 px-1.5 py-0.5 text-xs rounded-full font-bold">
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