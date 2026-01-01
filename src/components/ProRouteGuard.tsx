'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { canPerformAnalysis } from '@/lib/subscription';
import UpgradeModal from './UpgradeModal';

interface ProRouteGuardProps {
  children: React.ReactNode;
  feature?: string;
  redirectTo?: string;
}

interface AccessResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  remaining?: number;
  limit?: number;
  used?: number;
}

export default function ProRouteGuard({
  children,
  feature = 'property analysis'
}: ProRouteGuardProps) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [accessResult, setAccessResult] = useState<AccessResult | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      // Not logged in - redirect to login
      if (!user?.id) {
        router.push('/auth/login?redirect=/analysis');
        return;
      }

      const result = await canPerformAnalysis(user.id);
      setAccessResult(result);

      if (!result.allowed) {
        if (result.upgradeRequired) {
          // User has exceeded their limit - show upgrade modal
          setShowUpgradeModal(true);
        }
        setCanAccess(false);
      } else {
        // User has access (including free tier with remaining analyses)
        setCanAccess(true);
      }
    };

    checkAccess();
  }, [user, loading, router]);

  // Loading state
  if (loading || canAccess === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // No access - show upgrade modal (only when limit exceeded)
  if (!canAccess && accessResult?.upgradeRequired) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/10 rounded-full mb-6">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">Monthly Limit Reached</h1>
            <p className="text-muted mb-4">
              {accessResult?.reason || `You've used all ${accessResult?.limit || 3} of your free analyses this month.`}
            </p>
            <p className="text-sm text-muted mb-8">
              Upgrade to Pro for 50 analyses per month, or wait until next month for your free analyses to reset.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors"
              >
                Upgrade to Pro
              </button>
              <button
                onClick={() => router.push('/analysis')}
                className="w-full px-6 py-3 text-muted hover:text-primary transition-colors"
              >
                Go Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
          }}
          feature={feature}
          message={accessResult?.reason || 'Upgrade to continue analyzing properties'}
        />
      </>
    );
  }

  // Has access - show content
  return <>{children}</>;
}