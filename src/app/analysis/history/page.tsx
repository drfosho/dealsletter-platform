'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import LoadingSpinner from '@/components/property-search/LoadingSpinner';
import AnalysisHistoryTable from '@/components/analysis/AnalysisHistoryTable';
import AnalysisFilters from '@/components/analysis/AnalysisFilters';
import UsageStats from '@/components/analysis/UsageStats';
import type { Analysis } from '@/types';

export default function AnalysisHistoryPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    strategy: 'all',
    dateRange: 'all',
    propertyType: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [usage, setUsage] = useState({
    used: 0,
    limit: 5,
    nextReset: new Date()
  });

  const applyFilters = useCallback(() => {
    let filtered = [...analyses];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.address.toLowerCase().includes(searchLower) ||
        a.strategy.toLowerCase().includes(searchLower)
      );
    }

    // Strategy filter
    if (filters.strategy !== 'all') {
      filtered = filtered.filter(a => a.strategy === filters.strategy);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const ranges: Record<string, number> = {
        'today': 0,
        'week': 7,
        'month': 30,
        'quarter': 90,
        'year': 365
      };
      
      if (ranges[filters.dateRange] !== undefined) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - ranges[filters.dateRange]);
        filtered = filtered.filter(a => new Date(a.created_at) >= cutoff);
      }
    }

    // Property type filter
    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(a => 
        a.property_data?.property?.[0]?.propertyType === filters.propertyType
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[filters.sortBy as keyof Analysis] as string | number;
      let bVal = b[filters.sortBy as keyof Analysis] as string | number;
      
      if (filters.sortBy === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredAnalyses(filtered);
  }, [analyses, filters]);

  useEffect(() => {
    fetchAnalyses();
    fetchUsage();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [analyses, filters, applyFilters]);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/analysis/list?limit=100');
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/analysis/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredAnalyses.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} analyses? This action cannot be undone.`)) {
      return;
    }

    try {
      const promises = selectedIds.map(id => 
        fetch(`/api/analysis/${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(promises);
      
      // Refresh the list
      await fetchAnalyses();
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to delete analyses:', error);
      alert('Failed to delete some analyses');
    }
  };

  const handleBulkExport = () => {
    alert('Bulk export functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <LoadingSpinner text="Loading analysis history..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                Analysis History
              </h1>
              <p className="text-muted">
                View and manage all your property analyses
              </p>
            </div>

            {/* Usage Stats */}
            <UsageStats usage={usage} />

            {/* Filters */}
            <AnalysisFilters 
              filters={filters}
              onFilterChange={setFilters}
              selectedCount={selectedIds.length}
              onBulkDelete={handleBulkDelete}
              onBulkExport={handleBulkExport}
            />

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-muted">
                Showing {filteredAnalyses.length} of {analyses.length} analyses
              </p>
            </div>

            {/* Table */}
            {filteredAnalyses.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 003 3h0a3 3 0 003-3v-1m3-10V5a3 3 0 00-3-3h0a3 3 0 00-3 3v2M12 12h.01M12 16h.01M8 12h.01M16 12h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {filters.search || filters.strategy !== 'all' || filters.dateRange !== 'all' 
                    ? 'No analyses match your filters'
                    : 'No analyses yet'
                  }
                </h3>
                <p className="text-muted mb-4">
                  {filters.search || filters.strategy !== 'all' || filters.dateRange !== 'all'
                    ? 'Try adjusting your filters to see more results'
                    : 'Start analyzing properties to see them here'
                  }
                </p>
                {analyses.length === 0 && (
                  <button
                    onClick={() => router.push('/analysis/new')}
                    className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90"
                  >
                    Analyze Your First Property
                  </button>
                )}
              </div>
            ) : (
              <AnalysisHistoryTable
                analyses={filteredAnalyses}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelect={handleSelect}
                onView={(id) => router.push(`/analysis/results/${id}`)}
                onDelete={async (id) => {
                  if (confirm('Are you sure you want to delete this analysis?')) {
                    await fetch(`/api/analysis/${id}`, { method: 'DELETE' });
                    fetchAnalyses();
                  }
                }}
              />
            )}
      </main>
    </div>
  );
}