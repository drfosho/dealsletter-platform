'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function AnalysisPage() {
  const [recentAnalyses, setRecentAnalyses] = useState<Array<{
    id: string;
    address: string;
    strategy: string;
    created_at: string;
  }>>([]);
  const [usage, setUsage] = useState<{
    analyses_used?: number;
    current_month_usage?: number;
    tier_limit?: number;
    monthly_limit?: number;
    remaining?: number;
    subscription_tier?: string;
    can_analyze?: boolean;
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">
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
                      {usage.analyses_used ?? usage.current_month_usage ?? 0} / {(usage.tier_limit ?? usage.monthly_limit) === -1 ? '∞' : (usage.tier_limit ?? usage.monthly_limit ?? 3)}
                    </div>
                    <div className="text-xs text-muted mt-1 capitalize">
                      {usage.subscription_tier || 'free'} plan
                      {usage.remaining !== undefined && usage.remaining > 0 && (
                        <span className="text-green-600 ml-2">• {usage.remaining} remaining</span>
                      )}
                    </div>
                    {usage.subscription_tier === 'free' && (
                      <Link href="/pricing" className="text-xs text-accent hover:text-accent/80 mt-2 block">
                        Upgrade for more analyses →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>


            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link href="/analysis/new" className="group md:col-span-2">
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-8 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:scale-[1.02]">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
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
                <div className="bg-card rounded-xl p-6 border border-border/60 hover:border-purple-500/40 hover:shadow-lg transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl">
                      <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <svg className="w-4 h-4 text-muted group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-primary group-hover:text-purple-600 transition-colors">
                    View History
                  </h3>
                  <p className="text-sm text-muted mt-1">
                    Access all your past analyses
                  </p>
                </div>
              </Link>

              <div className="bg-card rounded-xl p-6 border border-border/60 hover:border-green-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl">
                    <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-semibold text-primary">
                  Total Analyses
                </h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mt-2">
                  {recentAnalyses.length || 0}
                </p>
              </div>
            </div>

            {/* Recent Analyses */}
            {recentAnalyses.length > 0 && (
              <div className="bg-card rounded-xl border border-border/60">
                <div className="p-6 border-b border-border/40 bg-muted/5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-primary">
                      Recent Analyses
                    </h2>
                    <Link
                      href="/analysis/history"
                      className="text-sm text-purple-600 hover:text-purple-500 font-medium flex items-center gap-1"
                    >
                      View all
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
                <div className="divide-y divide-border/40">
                  {recentAnalyses.map((analysis) => (
                    <Link
                      key={analysis.id}
                      href={`/analysis/results/${analysis.id}`}
                      className="block p-4 hover:bg-purple-500/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-primary">
                            {analysis.address}
                          </p>
                          <p className="text-sm text-muted mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-600 mr-2">
                              {analysis.strategy.charAt(0).toUpperCase() + analysis.strategy.slice(1)}
                            </span>
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-muted group-hover:text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl border-2 border-dashed border-purple-500/20 p-12 text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  No analyses yet
                </h3>
                <p className="text-muted mb-6 max-w-sm mx-auto">
                  Get started by analyzing your first property to see ROI projections and AI-powered insights
                </p>
                <Link
                  href="/analysis/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-semibold shadow-lg shadow-purple-500/20 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Your First Analysis
                </Link>
              </div>
            )}
          </div>
      </main>
    </div>
  );
}