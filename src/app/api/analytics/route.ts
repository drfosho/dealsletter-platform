import { NextRequest, NextResponse } from 'next/server';
import { usageStats, calculateEstimatedCost } from '@/lib/analytics';

// GET endpoint to retrieve analytics
export async function GET(request: NextRequest) {
  // Check for admin authorization (implement your auth logic)
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.includes('admin')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
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

// POST endpoint to reset analytics
export async function POST(request: NextRequest) {
  // Check for admin authorization
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.includes('admin')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
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