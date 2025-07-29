import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory analytics (replace with database in production)
interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cachedRequests: number;
  averageProcessingTime: number;
  totalProcessingTime: number;
  apiErrors: { [key: string]: number };
  lastReset: Date;
}

const usageStats: UsageStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cachedRequests: 0,
  averageProcessingTime: 0,
  totalProcessingTime: 0,
  apiErrors: {},
  lastReset: new Date()
};

// Track API usage
export function trackUsage(
  success: boolean,
  cached: boolean,
  processingTime: number,
  errorType?: string
) {
  usageStats.totalRequests++;
  
  if (success) {
    usageStats.successfulRequests++;
  } else {
    usageStats.failedRequests++;
    if (errorType) {
      usageStats.apiErrors[errorType] = (usageStats.apiErrors[errorType] || 0) + 1;
    }
  }
  
  if (cached) {
    usageStats.cachedRequests++;
  }
  
  usageStats.totalProcessingTime += processingTime;
  usageStats.averageProcessingTime = 
    usageStats.totalProcessingTime / usageStats.totalRequests;
}

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

// Calculate estimated API costs
function calculateEstimatedCost(stats: UsageStats): number {
  // Claude 3.5 Sonnet pricing (as of 2024)
  // Input: $3 per million tokens
  // Output: $15 per million tokens
  // Average property analysis: ~500 input tokens, ~300 output tokens
  
  const nonCachedRequests = stats.successfulRequests - stats.cachedRequests;
  const inputCost = (nonCachedRequests * 500 * 3) / 1_000_000;
  const outputCost = (nonCachedRequests * 300 * 15) / 1_000_000;
  
  return inputCost + outputCost;
}