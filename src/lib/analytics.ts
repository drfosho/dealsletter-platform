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

export const usageStats: UsageStats = {
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

// Calculate estimated API costs
export function calculateEstimatedCost(stats: UsageStats): number {
  // Claude 3.5 Sonnet pricing (as of 2024)
  // Input: $3 per million tokens
  // Output: $15 per million tokens
  // Average property analysis: ~500 input tokens, ~300 output tokens
  
  const nonCachedRequests = stats.successfulRequests - stats.cachedRequests;
  const inputCost = (nonCachedRequests * 500 * 3) / 1_000_000;
  const outputCost = (nonCachedRequests * 300 * 15) / 1_000_000;
  
  return inputCost + outputCost;
}