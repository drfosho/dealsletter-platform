import { useAuth } from '@/contexts/AuthContext';
import { getAdminConfig, getEffectiveSubscriptionTier, getEffectiveAnalysisLimit } from '@/lib/admin-config';

export function useAdminSubscription() {
  const { user } = useAuth();
  const adminConfig = getAdminConfig(user?.email);
  
  // Override subscription tier for admins
  const getSubscriptionTier = (actualTier: string = 'free') => {
    return getEffectiveSubscriptionTier(user?.email, actualTier);
  };
  
  // Override analysis limit for admins
  const getAnalysisLimit = (actualLimit: number = 3) => {
    return getEffectiveAnalysisLimit(user?.email, actualLimit);
  };
  
  // Check if user can analyze (considering admin status)
  const canAnalyze = (currentUsage: number, subscriptionLimit: number) => {
    if (adminConfig.bypassSubscriptionLimits) {
      return true;
    }
    return currentUsage < subscriptionLimit;
  };
  
  return {
    isAdmin: adminConfig.isAdmin,
    bypassLimits: adminConfig.bypassSubscriptionLimits,
    getSubscriptionTier,
    getAnalysisLimit,
    canAnalyze,
    adminConfig
  };
}