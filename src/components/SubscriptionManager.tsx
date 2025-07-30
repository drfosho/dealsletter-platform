'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from './NotificationSystem';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  analysisLimit: number;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '5 property analyses per month',
      'Basic financial metrics',
      'Market comparisons',
      'Email support'
    ],
    analysisLimit: 5
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29,
    interval: 'month',
    features: [
      '50 property analyses per month',
      'Advanced financial modeling',
      'Investment projections',
      'Comparison tools',
      'Priority support',
      'Export to PDF/Excel'
    ],
    analysisLimit: 50
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Unlimited property analyses',
      'AI-powered insights',
      'Portfolio management',
      'Team collaboration',
      'API access',
      'Dedicated support',
      'Custom integrations'
    ],
    analysisLimit: -1 // Unlimited
  }
];

export function useSubscription() {
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [usage, setUsage] = useState({ used: 0, limit: 5 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan || 'free');
        setUsage(data.usage || { used: 0, limit: 5 });
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = () => {
    if (currentPlan === 'enterprise') return true;
    return usage.used < usage.limit;
  };

  const getRemainingAnalyses = () => {
    if (currentPlan === 'enterprise') return 'Unlimited';
    return Math.max(0, usage.limit - usage.used);
  };

  return {
    currentPlan,
    usage,
    loading,
    canAnalyze,
    getRemainingAnalyses
  };
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
}

export function SubscriptionModal({ isOpen, onClose, currentPlan = 'free' }: SubscriptionModalProps) {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlan);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    if (selectedPlan === currentPlan) {
      onClose();
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Integrate with payment provider (Stripe)
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan })
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Plan Upgraded!',
          message: `You've been upgraded to the ${selectedPlan} plan.`,
          duration: 5000
        });
        onClose();
        window.location.reload(); // Refresh to update limits
      } else {
        throw new Error('Upgrade failed');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Upgrade Failed',
        message: 'Unable to process your upgrade. Please try again.',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">Choose Your Plan</h2>
            <p className="text-muted mt-1">Unlock more analyses and advanced features</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const isSelected = plan.id === selectedPlan;
            
            return (
              <div
                key={plan.id}
                onClick={() => !isCurrentPlan && setSelectedPlan(plan.id)}
                className={`
                  relative rounded-xl border-2 p-6 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                  }
                  ${isCurrentPlan ? 'opacity-75 cursor-default' : ''}
                `}
              >
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-primary text-secondary text-xs font-medium rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}
                
                {plan.id === 'pro' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-accent text-secondary text-xs font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold text-primary mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-primary">${plan.price}</span>
                  <span className="text-muted">/{plan.interval}</span>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-primary mb-1">
                    {plan.analysisLimit === -1 ? 'Unlimited' : plan.analysisLimit} analyses/month
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: plan.analysisLimit === -1 ? '100%' : `${(plan.analysisLimit / 100) * 100}%` }}
                    />
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border">
          <div className="text-sm text-muted">
            {selectedPlan === currentPlan 
              ? 'This is your current plan'
              : `Upgrade to ${SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name} plan`
            }
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-primary border border-primary/30 rounded-lg hover:bg-primary/5"
            >
              Cancel
            </button>
            <button
              onClick={handleUpgrade}
              disabled={selectedPlan === currentPlan || isProcessing}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all
                ${selectedPlan === currentPlan || isProcessing
                  ? 'bg-muted text-muted cursor-not-allowed'
                  : 'bg-primary text-secondary hover:bg-primary/90'
                }
              `}
            >
              {isProcessing ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UsageLimitBanner() {
  const { usage, currentPlan } = useSubscription();
  const { addNotification } = useNotifications();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const percentageUsed = (usage.used / usage.limit) * 100;
  const isNearLimit = percentageUsed >= 80;
  const hasReachedLimit = usage.used >= usage.limit;

  if (currentPlan === 'enterprise' || percentageUsed < 80) {
    return null;
  }

  return (
    <>
      <div className={`
        p-4 rounded-lg border mb-6
        ${hasReachedLimit 
          ? 'bg-red-50 border-red-200' 
          : 'bg-yellow-50 border-yellow-200'
        }
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 ${hasReachedLimit ? 'text-red-500' : 'text-yellow-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className={`font-medium ${hasReachedLimit ? 'text-red-900' : 'text-yellow-900'}`}>
                {hasReachedLimit 
                  ? 'Analysis Limit Reached' 
                  : `${usage.limit - usage.used} Analyses Remaining`
                }
              </h4>
              <p className={`text-sm ${hasReachedLimit ? 'text-red-700' : 'text-yellow-700'}`}>
                You've used {usage.used} of {usage.limit} analyses this month.
                {hasReachedLimit ? ' Upgrade to continue analyzing properties.' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${hasReachedLimit 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }
            `}
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan}
      />
    </>
  );
}