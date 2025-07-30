// Analytics tracking for the platform

// Google Analytics declaration
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
  }
}

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

// Event tracking interface
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  properties?: Record<string, unknown>;
}

// Google Analytics tracking
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.properties
    });
  }
}

// Analysis-specific events
export const AnalysisEvents = {
  startAnalysis: () => trackEvent({
    action: 'start_analysis',
    category: 'analysis'
  }),
  
  completeAnalysis: (strategy: string, propertyValue: number) => trackEvent({
    action: 'complete_analysis',
    category: 'analysis',
    label: strategy,
    value: Math.round(propertyValue),
    properties: {
      strategy,
      property_value: propertyValue
    }
  }),
  
  saveAnalysis: (analysisId: string) => trackEvent({
    action: 'save_analysis',
    category: 'analysis',
    label: analysisId
  }),
  
  shareAnalysis: (method: string) => trackEvent({
    action: 'share_analysis',
    category: 'analysis',
    label: method
  }),
  
  compareAnalyses: (count: number) => trackEvent({
    action: 'compare_analyses',
    category: 'analysis',
    value: count
  }),
  
  exportAnalysis: (format: string) => trackEvent({
    action: 'export_analysis',
    category: 'analysis',
    label: format
  }),
  
  reachUsageLimit: (plan: string) => trackEvent({
    action: 'reach_usage_limit',
    category: 'subscription',
    label: plan
  }),
  
  viewUpgradePage: (source: string) => trackEvent({
    action: 'view_upgrade_page',
    category: 'subscription',
    label: source
  }),
  
  upgradePlan: (fromPlan: string, toPlan: string) => trackEvent({
    action: 'upgrade_plan',
    category: 'subscription',
    properties: {
      from_plan: fromPlan,
      to_plan: toPlan
    }
  })
};

// Dashboard events
export const DashboardEvents = {
  viewProperty: (propertyId: string | number, source: string) => trackEvent({
    action: 'view_property',
    category: 'dashboard',
    label: source,
    properties: {
      property_id: propertyId.toString()
    }
  }),
  
  filterProperties: (filterType: string, filterValue: string) => trackEvent({
    action: 'filter_properties',
    category: 'dashboard',
    properties: {
      filter_type: filterType,
      filter_value: filterValue
    }
  }),
  
  searchLocation: (location: string) => trackEvent({
    action: 'search_location',
    category: 'dashboard',
    label: location
  }),
  
  importAnalysis: () => trackEvent({
    action: 'import_analysis',
    category: 'dashboard'
  })
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