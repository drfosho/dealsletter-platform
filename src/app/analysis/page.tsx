'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import { PropertySearch } from '@/components/property-search';
import Link from 'next/link';

export default function AnalysisPage() {
  const router = useRouter();
  const [recentAnalyses, setRecentAnalyses] = useState<Array<{
    id: string;
    address: string;
    strategy: string;
    created_at: string;
  }>>([]);
  const [usage, setUsage] = useState<{
    current_month_usage: number;
    monthly_limit: number;
    subscription_tier: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentAnalyses();
    fetchUsageStats();
  }, []);

  const fetchRecentAnalyses = async () => {
    try {
      const response = await fetch('/api/analysis/list?limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/analysis/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (address: string, propertyData: Record<string, unknown>) => {
    // Store in session storage for the new analysis page
    sessionStorage.setItem('selectedProperty', JSON.stringify({
      address,
      propertyData
    }));
    router.push('/analysis/new');
  };

  return (
    <>
      <Navigation variant="dashboard" />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header with usage stats */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-primary">
                    Property Analysis
                  </h1>
                  <p className="text-muted mt-1">
                    Analyze investment opportunities with AI-powered insights
                  </p>
                </div>
                
                {usage && (
                  <div className="mt-4 sm:mt-0 bg-card rounded-lg p-4 border border-border">
                    <div className="text-sm text-muted">Monthly Usage</div>
                    <div className="text-2xl font-bold text-primary">
                      {usage.current_month_usage} / {usage.monthly_limit === -1 ? '∞' : usage.monthly_limit}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      {usage.subscription_tier} plan
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Property Search */}
            <div className="mb-8">
              <PropertySearch 
                onPropertySelect={handlePropertySelect}
                className="shadow-sm"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link href="/analysis/new" className="group">
                <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-primary group-hover:text-primary/80">
                    New Analysis
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    Start a fresh property analysis
                  </p>
                </div>
              </Link>

              <Link href="/analysis/history" className="group">
                <div className="bg-card rounded-lg p-6 border border-border hover:border-primary transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-semibold text-primary group-hover:text-primary/80">
                    View History
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    Access all your past analyses
                  </p>
                </div>
              </Link>

              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-semibold text-primary">
                  Total Analyses
                </h3>
                <p className="text-2xl font-bold mt-1">
                  {recentAnalyses.length || 0}
                </p>
              </div>
            </div>

            {/* Recent Analyses */}
            {recentAnalyses.length > 0 && (
              <div className="bg-card rounded-lg border border-border">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-primary">
                      Recent Analyses
                    </h2>
                    <Link 
                      href="/analysis/history" 
                      className="text-sm text-primary hover:underline"
                    >
                      View all →
                    </Link>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {recentAnalyses.map((analysis) => (
                    <Link 
                      key={analysis.id} 
                      href={`/analysis/results/${analysis.id}`}
                      className="block p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-primary">
                            {analysis.address}
                          </p>
                          <p className="text-sm text-muted mt-1">
                            {analysis.strategy.charAt(0).toUpperCase() + analysis.strategy.slice(1)} Strategy • 
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && recentAnalyses.length === 0 && (
              <div className="bg-card rounded-lg border border-border p-12 text-center">
                <svg className="w-12 h-12 text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a3 3 0 006 0v-1m-6 0a3 3 0 110-6h6a3 3 0 110 6m-6 0h6" />
                </svg>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  No analyses yet
                </h3>
                <p className="text-muted mb-4">
                  Start by searching for a property address above
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}