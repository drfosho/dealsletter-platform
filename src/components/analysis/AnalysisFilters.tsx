'use client';

import { useState, useRef, useEffect } from 'react';

interface AnalysisFiltersProps {
  filters: {
    search: string;
    strategy: string;
    dateRange: string;
    propertyType: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  onFilterChange: (filters: any) => void;
  selectedCount: number;
  selectedIds: string[];
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onCompare: () => void;
}

export default function AnalysisFilters({
  filters,
  onFilterChange,
  selectedCount,
  selectedIds,
  onBulkDelete,
  onBulkExport,
  onCompare
}: AnalysisFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus search on mount
    searchInputRef.current?.focus();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleSortChange = (sortBy: string) => {
    if (filters.sortBy === sortBy) {
      // Toggle sort order if same column
      handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to desc for new column
      onFilterChange({ ...filters, sortBy, sortOrder: 'desc' });
    }
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      strategy: 'all',
      dateRange: 'all',
      propertyType: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.strategy !== 'all' || 
    filters.dateRange !== 'all' || 
    filters.propertyType !== 'all';

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      {/* Search and Basic Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by address or strategy..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-3">
          {/* Strategy Filter */}
          <select
            value={filters.strategy}
            onChange={(e) => handleFilterChange('strategy', e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Strategies</option>
            <option value="rental">Rental</option>
            <option value="flip">Flip</option>
            <option value="airbnb">Airbnb</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-muted/20 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="hidden lg:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Types</option>
                <option value="Single Family">Single Family</option>
                <option value="Multi Family">Multi Family</option>
                <option value="Condo">Condo</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="created_at">Date Created</option>
                  <option value="purchase_price">Purchase Price</option>
                  <option value="address">Address</option>
                  <option value="strategy">Strategy</option>
                </select>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-background border border-border rounded-lg hover:bg-muted/20 transition-colors"
                  title={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {filters.sortOrder === 'asc' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg hover:bg-muted/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted">
            {selectedCount} {selectedCount === 1 ? 'analysis' : 'analyses'} selected
            {selectedCount >= 2 && selectedCount <= 4 && (
              <span className="ml-2 text-primary">(ready to compare)</span>
            )}
            {selectedCount > 4 && (
              <span className="ml-2 text-yellow-600">(max 4 for comparison)</span>
            )}
          </p>
          <div className="flex gap-3">
            {/* Compare Button - Show when 2-4 selected */}
            {selectedCount >= 2 && selectedCount <= 4 && (
              <button
                onClick={onCompare}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare ({selectedCount})
              </button>
            )}
            <button
              onClick={onBulkExport}
              className="px-4 py-2 bg-background border border-primary text-primary rounded-lg hover:bg-primary/5 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Selected
            </button>
            <button
              onClick={onBulkDelete}
              className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}