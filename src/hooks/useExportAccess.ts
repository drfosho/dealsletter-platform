'use client';

import { useState, useEffect } from 'react';

const FREE_TIERS = new Set(['free', 'basic', 'starter']);

export function useExportAccess() {
  const [canExport, setCanExport] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/analysis/usage');
        if (!res.ok) {
          setCanExport(true); // fail open
          return;
        }
        const data = await res.json();
        const tier = (data.subscription_tier || 'free').toLowerCase();
        setCanExport(!FREE_TIERS.has(tier));
      } catch {
        setCanExport(true); // fail open
      }
    };
    check();
  }, []);

  return canExport;
}
