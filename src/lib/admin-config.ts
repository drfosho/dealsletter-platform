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

// Helper to get admin emails - called each time to pick up env changes during development
function getAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0) || [];
  return emails;
}

export interface AdminConfig {
  isAdmin: boolean;
  bypassSubscriptionLimits: boolean;
  subscriptionTierOverride?: 'free' | 'pro' | 'premium' | 'enterprise';
  analysisLimitOverride?: number;
}

export function getAdminConfig(email: string | null | undefined): AdminConfig {
  const adminEmails = getAdminEmails();
  const normalizedEmail = email?.toLowerCase().trim();
  const isAdmin = normalizedEmail ? adminEmails.includes(normalizedEmail) : false;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AdminConfig] Checking admin status:', {
      email: normalizedEmail,
      adminEmails,
      isAdmin,
      envVar: process.env.ADMIN_EMAILS
    });
  }

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