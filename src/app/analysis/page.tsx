'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import Link from 'next/link';

export default function AnalysisPage() {
  const _router = useRouter();
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


            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link href="/analysis/new" className="group md:col-span-2">
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 text-white/80">
                        <span className="text-sm font-medium">Get Started</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Start New Analysis
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      Search for any property address and receive AI-powered investment insights, financial projections, and strategic recommendations
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/analysis/history" className="group">
                <div className="bg-card rounded-xl p-6 border border-border hover:border-primary hover:shadow-lg transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
                      <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 text-muted group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-primary group-hover:text-primary/80">
                    View History
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    Access all your past analyses
                  </p>
                </div>
              </Link>

              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl">
                    <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-semibold text-primary">
                  Total Analyses
                </h3>
                <p className="text-3xl font-bold text-primary mt-2">
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
                  Get started by analyzing your first property
                </p>
                <div className="flex gap-3 justify-center">
                  <Link 
                    href="/analysis/new"
                    className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-primary/90 font-medium"
                  >
                    Start New Analysis
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}