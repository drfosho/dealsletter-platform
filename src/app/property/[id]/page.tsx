'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PremiumPropertyView from '@/components/PremiumPropertyView';
import type { PropertyData } from '@/types/property';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the property data
        const response = await fetch(`/api/properties/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Property not found');
          }
          throw new Error('Failed to fetch property');
        }
        
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProperty();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-primary mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Property not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-muted hover:text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-lg font-semibold text-primary">Property Analysis</h1>
          </div>
        </div>
      </div>

      {/* Property View Component */}
      <PremiumPropertyView
        isOpen={true}
        property={property}
        onClose={() => router.push('/dashboard')}
      />
    </div>
  );
}