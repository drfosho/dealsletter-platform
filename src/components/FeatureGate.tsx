'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';
import { hasFeatureAccess } from '@/lib/subscription';
import UpgradeModal from './UpgradeModal';
import { Lock } from 'lucide-react';

interface FeatureGateProps {
  feature: 'propertyAnalysis' | 'exportData' | 'advancedCalculators';
  children: ReactNode;
  fallback?: ReactNode;
  showLock?: boolean;
  upgradeMessage?: string;
  className?: string;
}

export default function FeatureGate({
  feature,
  children,
  fallback,
  showLock = true,
  upgradeMessage,
  className = ''
}: FeatureGateProps) {
  const { user } = useUser();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const access = await hasFeatureAccess(user?.id, feature);
      setHasAccess(access);
    };
    
    checkAccess();
  }, [user?.id, feature]);

  // Loading state
  if (hasAccess === null) {
    return <div className="animate-pulse bg-gray-200 rounded h-20 w-full"></div>;
  }

  // Has access - show children
  if (hasAccess) {
    return <>{children}</>;
  }

  // No access - show fallback or locked state
  const handleClick = () => {
    setShowUpgradeModal(true);
  };

  const featureMessages = {
    propertyAnalysis: 'Unlock powerful property analysis tools',
    exportData: 'Export detailed reports and spreadsheets',
    advancedCalculators: 'Access advanced investment calculators'
  };

  if (fallback) {
    return (
      <>
        <div className={className} onClick={handleClick}>
          {fallback}
        </div>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={feature}
          message={upgradeMessage || featureMessages[feature]}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`relative ${className} cursor-pointer group`}
        onClick={handleClick}
      >
        {/* Blurred/locked content preview */}
        <div className="opacity-50 blur-sm pointer-events-none select-none">
          {children}
        </div>
        
        {/* Overlay with lock */}
        {showLock && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-primary mb-1">Pro Feature</p>
                <p className="text-sm text-muted">Click to unlock</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={feature}
        message={upgradeMessage || featureMessages[feature]}
      />
    </>
  );
}

// Inline feature check for buttons and small elements
export function ProBadge({ 
  className = '' 
}: { 
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-xs font-semibold rounded-full ${className}`}>
      <Lock className="w-3 h-3" />
      PRO
    </span>
  );
}