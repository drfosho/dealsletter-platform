import { NextRequest, NextResponse } from 'next/server';
import { usageStats, calculateEstimatedCost } from '@/lib/analytics';
import { requireAuth } from '@/lib/api-auth';
import { getAdminConfig } from '@/lib/admin-config';

// GET endpoint to retrieve analytics (admin only)
export async function GET(_request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { isAdmin } = getAdminConfig(auth.user.email);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const stats = {
    ...usageStats,
    cacheHitRate: usageStats.cachedRequests / usageStats.totalRequests || 0,
    successRate: usageStats.successfulRequests / usageStats.totalRequests || 0,
    estimatedCost: calculateEstimatedCost(usageStats),
    uptime: Date.now() - usageStats.lastReset.getTime()
  };
  
  return NextResponse.json(stats);
}

// POST endpoint to reset analytics (admin only)
export async function POST(_request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { isAdmin } = getAdminConfig(auth.user.email);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Reset stats
  Object.assign(usageStats, {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cachedRequests: 0,
    averageProcessingTime: 0,
    totalProcessingTime: 0,
    apiErrors: {},
    lastReset: new Date()
  });
  
  return NextResponse.json({ message: 'Analytics reset successfully' });
}