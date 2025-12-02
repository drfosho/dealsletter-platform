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

export default function ProRouteGuard({ 
  children, 
  feature = 'property analysis'
}: ProRouteGuardProps) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;
      
      const result = await canPerformAnalysis(user?.id);
      
      if (!result.allowed) {
        if (result.upgradeRequired) {
          setShowUpgradeModal(true);
        } else {
          // Not logged in
          router.push('/auth/login?redirect=/analysis');
        }
      }
      
      setCanAccess(result.allowed);
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

  // No access - show upgrade modal
  if (!canAccess) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-6">
              <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">Pro Feature</h1>
            <p className="text-muted mb-8">
              {feature} is available for Pro subscribers. Upgrade to unlock powerful analysis tools and insights.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors"
            >
              View Upgrade Options
            </button>
          </div>
        </div>
        
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false);
            router.push('/analysis');
          }}
          feature={feature}
        />
      </>
    );
  }

  // Has access - show content
  return <>{children}</>;
}