'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  getUserAnalyzedProperties, 
  togglePropertyFavorite, 
  removeAnalyzedProperty,
  type AnalyzedProperty 
} from '@/lib/supabase/analyzed-properties';

interface MyAnalyzedPropertiesProps {
  userId: string;
}

export default function MyAnalyzedProperties({ userId }: MyAnalyzedPropertiesProps) {
  const [properties, setProperties] = useState<AnalyzedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getUserAnalyzedProperties(userId, 4);
      
      if (error) {
        setError('Failed to load analyzed properties');
        console.error('Error fetching properties:', error);
      } else {
        setProperties(data);
        setError(null);
      }
    } catch (err) {
      setError('Failed to load analyzed properties');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleToggleFavorite = async (propertyId: string) => {
    try {
      // Optimistically update UI
      setProperties(prev => 
        prev.map(property => 
          property.id === propertyId 
            ? { ...property, is_favorite: !property.is_favorite }
            : property
        )
      );

      const { error } = await togglePropertyFavorite(propertyId, userId);
      
      if (error) {
        // Revert on error
        setProperties(prev => 
          prev.map(property => 
            property.id === propertyId 
              ? { ...property, is_favorite: !property.is_favorite }
              : property
          )
        );
        console.error('Error toggling favorite:', error);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update
      setProperties(prev => 
        prev.map(property => 
          property.id === propertyId 
            ? { ...property, is_favorite: !property.is_favorite }
            : property
        )
      );
    }
  };

  const handleRemoveProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to remove this analysis? This action cannot be undone.')) {
      return;
    }

    try {
      // Optimistically remove from UI
      const originalProperties = properties;
      setProperties(prev => prev.filter(property => property.id !== propertyId));

      const { error } = await removeAnalyzedProperty(propertyId, userId);
      
      if (error) {
        // Revert on error
        setProperties(originalProperties);
        console.error('Error removing property:', error);
        alert('Failed to remove property. Please try again.');
      }
    } catch (error) {
      console.error('Error removing property:', error);
      // Revert optimistic update
      fetchProperties();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDealTypeColor = (dealType: string) => {
    switch (dealType.toLowerCase()) {
      case 'fix & flip':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'brrrr':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'buy & hold':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'house hack':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary">My Analyzed Properties</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted/20 rounded-xl h-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary">My Analyzed Properties</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-yellow-500 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm text-muted mb-4">Unable to load analyzed properties</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-muted/60 max-w-md mx-auto">
              <p className="mb-2">This is likely because the database table hasn't been created yet.</p>
              <p>Run the migration in <code className="bg-muted/20 px-1 py-0.5 rounded">supabase/migrations/create_analyzed_properties_table.sql</code> in your Supabase dashboard.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border/60 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary">My Analyzed Properties</h2>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary mb-2">No analyzed properties yet</h3>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Start analyzing properties to track your investment research and build your portfolio history.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Analyze Your First Property
          </Link>
        </div>
      </div>
    );
  }

  // Show last 3-4 properties (most recent first)
  const displayProperties = properties.slice(0, 4);

  return (
    <div className="bg-card rounded-xl border border-border/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">My Analyzed Properties</h2>
          <p className="text-sm text-muted mt-1">Properties you&apos;ve analyzed using our tools</p>
        </div>
        {properties.length > 4 && (
          <Link 
            href="/profile/analyzed-properties"
            className="text-accent hover:text-accent/80 transition-colors text-sm font-medium flex items-center gap-1"
          >
            View All ({properties.length})
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayProperties.map((property) => (
          <div key={property.id} className="bg-muted/5 rounded-xl border border-border/40 overflow-hidden hover:shadow-lg transition-all duration-200 group">
            {/* Header */}
            <div className="p-4 border-b border-border/20">
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getDealTypeColor(property.deal_type)}`}>
                  {property.deal_type}
                </span>
                <button
                  onClick={() => handleToggleFavorite(property.id)}
                  className="p-1 hover:bg-muted/20 rounded transition-colors"
                >
                  <svg 
                    className={`w-4 h-4 ${property.is_favorite ? 'text-red-500 fill-current' : 'text-muted'}`} 
                    fill={property.is_favorite ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <h3 className="font-medium text-primary text-sm leading-tight mb-2">
                {property.address}
              </h3>
              <p className="text-xs text-muted">
                Analyzed {formatDate(property.analysis_date)}
              </p>
            </div>

            {/* Metrics */}
            <div className="p-4">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">ROI</span>
                  <span className="text-sm font-semibold text-green-600">
                    {property.roi}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Profit</span>
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(property.profit)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-primary text-secondary text-sm rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  View Details
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleFavorite(property.id)}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                      property.is_favorite
                        ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                        : 'bg-muted/20 text-muted hover:bg-muted/30'
                    }`}
                  >
                    {property.is_favorite ? 'Favorited' : 'Add to Favorites'}
                  </button>
                  <button
                    onClick={() => handleRemoveProperty(property.id)}
                    className="px-3 py-1.5 bg-red-500/10 text-red-600 text-xs rounded-lg hover:bg-red-500/20 transition-colors font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {properties.length > 0 && properties.length <= 4 && (
        <div className="mt-6 text-center">
          <Link 
            href="/dashboard"
            className="inline-flex px-4 py-2 text-accent hover:text-accent/80 transition-colors text-sm font-medium"
          >
            Analyze More Properties →
          </Link>
        </div>
      )}
    </div>
  );
}