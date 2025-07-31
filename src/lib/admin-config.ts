// Admin configuration and utilities

// IMPORTANT: Add your admin email here to get full access
export const ADMIN_EMAILS = [
  'kevin@dealsletter.io', // TODO: Replace with your actual admin email
  // 'kevin@example.com', // Example: Add your email like this
  // Add more admin emails as needed
];

// Alternative: Set these in your .env.local file:
// ADMIN_EMAILS=email1@example.com,email2@example.com
const envAdmins = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
const allAdminEmails = [...ADMIN_EMAILS, ...envAdmins];

export interface AdminConfig {
  isAdmin: boolean;
  bypassSubscriptionLimits: boolean;
  subscriptionTierOverride?: 'free' | 'pro' | 'premium' | 'enterprise';
  analysisLimitOverride?: number;
}

export function getAdminConfig(email: string | null | undefined): AdminConfig {
  const isAdmin = email ? allAdminEmails.includes(email) : false;
  
  return {
    isAdmin,
    bypassSubscriptionLimits: isAdmin,
    subscriptionTierOverride: isAdmin ? 'enterprise' : undefined,
    analysisLimitOverride: isAdmin ? 9999 : undefined,
  };
}

// Check if a user can analyze based on admin status or subscription
export function canUserAnalyze(
  email: string | null | undefined,
  currentUsage: number,
  subscriptionLimit: number
): boolean {
  const adminConfig = getAdminConfig(email);
  
  if (adminConfig.bypassSubscriptionLimits) {
    return true;
  }
  
  return currentUsage < subscriptionLimit;
}

// Get effective subscription tier for a user
export function getEffectiveSubscriptionTier(
  email: string | null | undefined,
  actualTier: string
): string {
  const adminConfig = getAdminConfig(email);
  return adminConfig.subscriptionTierOverride || actualTier;
}

// Get effective analysis limit for a user
export function getEffectiveAnalysisLimit(
  email: string | null | undefined,
  actualLimit: number
): number {
  const adminConfig = getAdminConfig(email);
  return adminConfig.analysisLimitOverride || actualLimit;
}