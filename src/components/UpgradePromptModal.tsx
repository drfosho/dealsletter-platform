'use client';

import Link from 'next/link';

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionTier: string;
  message?: string;
}

export default function UpgradePromptModal({ 
  isOpen, 
  onClose, 
  subscriptionTier,
  message 
}: UpgradePromptModalProps) {
  if (!isOpen) return null;

  const getUpgradeContent = () => {
    if (subscriptionTier === 'basic') {
      return {
        title: 'Unlock Property Analysis',
        description: 'Your Basic plan doesn\'t include property analysis. Upgrade to start analyzing deals and finding profitable investments.',
        features: [
          '15 property analyses per month with Pro',
          'Unlimited analyses with Premium',
          'Advanced ROI calculations',
          'Deal comparison tools',
          'Priority support'
        ],
        primaryCTA: 'Upgrade to Pro',
        secondaryCTA: 'View All Plans'
      };
    } else {
      return {
        title: 'Monthly Limit Reached',
        description: 'You\'ve used all 15 analyses for this month. Upgrade to Premium for unlimited access.',
        features: [
          'Unlimited property analyses',
          'No monthly restrictions',
          'Bulk analysis tools',
          'Export analysis reports',
          'Priority support'
        ],
        primaryCTA: 'Upgrade to Premium',
        secondaryCTA: 'View All Plans'
      };
    }
  };

  const content = getUpgradeContent();

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-background w-full max-w-md rounded-xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-border/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-primary">{content.title}</h2>
              <p className="text-sm text-muted mt-1">{message || content.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Features */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-medium text-primary mb-2">What you'll get:</h3>
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-muted">{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing Preview */}
          <div className="bg-accent/5 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">Starting at</span>
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">SAVE 20%</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary">
                {subscriptionTier === 'basic' ? '$29' : '$49'}
              </span>
              <span className="text-muted">/month</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link 
              href="/pricing"
              className="w-full px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90 transition-colors font-medium text-center block"
            >
              {content.primaryCTA}
            </Link>
            <Link 
              href="/pricing"
              className="w-full px-6 py-3 bg-muted/10 text-primary rounded-lg hover:bg-muted/20 transition-colors font-medium text-center block"
            >
              {content.secondaryCTA}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}