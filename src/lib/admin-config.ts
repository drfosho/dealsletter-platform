// Admin configuration and utilities

/**
 * SEC-010: Admin emails should ONLY be configured via environment variables
 * Do not hard-code admin emails in source code as this:
 * - Exposes admin identities in version control
 * - Makes it harder to rotate/change admin access
 * - Creates inconsistent configuration between environments
 *
 * Set ADMIN_EMAILS in your .env.local or Vercel environment:
 * ADMIN_EMAILS=admin1@example.com,admin2@example.com
 */

// SEC-010: Load admin emails exclusively from environment variables
const envAdmins = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()).filter(e => e.length > 0) || [];

// Validate that admin emails are configured in production
if (process.env.NODE_ENV === 'production' && envAdmins.length === 0) {
  console.warn('[AdminConfig] ⚠️  No admin emails configured. Set ADMIN_EMAILS environment variable.');
}

const allAdminEmails = envAdmins;

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