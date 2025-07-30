'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Property Analysis',
    href: '/analysis',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: 'Properties',
    href: '/admin/properties',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: 'Account',
    href: '/account',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [analysisStats, setAnalysisStats] = useState<{
    total: number;
    monthly: number;
    saved: number;
    usage: { used: number; limit: number; }
  } | null>(null);

  useEffect(() => {
    fetchAnalysisStats();
    const interval = setInterval(fetchAnalysisStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAnalysisStats = async () => {
    try {
      const response = await fetch('/api/analysis/stats');
      if (response.ok) {
        const data = await response.json();
        setAnalysisStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch analysis stats:', error);
    }
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-card border-r border-border h-[calc(100vh-64px)] sticky top-16`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors w-full flex justify-center"
          >
            <svg 
              className={`w-5 h-5 text-muted transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative
                      ${isActive 
                        ? 'bg-primary text-secondary font-medium' 
                        : 'text-muted hover:bg-muted/50 hover:text-primary'
                      }
                    `}
                  >
                    {item.icon}
                    {!isCollapsed && <span>{item.name}</span>}
                    {/* Analysis count badge */}
                    {item.name === 'Property Analysis' && analysisStats && analysisStats.total > 0 && (
                      <span className={`
                        absolute ${isCollapsed ? '-top-1 -right-1' : 'right-3'} 
                        bg-accent text-secondary text-xs font-bold rounded-full 
                        min-w-[20px] h-5 flex items-center justify-center px-1
                      `}>
                        {analysisStats.total > 99 ? '99+' : analysisStats.total}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Usage Indicator (for Analysis) */}
        {pathname.startsWith('/analysis') && !isCollapsed && analysisStats && (
          <div className="p-4 border-t border-border">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted mb-1">Monthly Usage</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-primary">{analysisStats.usage.used}</span>
                <span className="text-sm text-muted">/ {analysisStats.usage.limit}</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (analysisStats.usage.used / analysisStats.usage.limit) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}