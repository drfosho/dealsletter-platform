'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Zap, TrendingUp, FileText, Calculator } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  message?: string;
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  feature: _feature = 'this feature',
  message = 'Upgrade to Pro to unlock powerful analysis tools'
}: UpgradeModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    router.push('/pricing');
  };

  const features = [
    {
      icon: <Calculator className="w-5 h-5" />,
      title: 'Property Analysis Calculator',
      description: 'Advanced ROI, cash flow, and cap rate calculations'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Market Analytics',
      description: 'Deep market insights and trend analysis'
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Export Reports',
      description: 'Download detailed PDF reports'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: '50 Monthly Analyses',
      description: 'Just $0.58 per analysis'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-border/60 rounded-2xl max-w-lg w-full mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-accent/20 to-accent/5 p-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full mb-4">
              <Zap className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Unlock Pro Features
            </h2>
            <p className="text-muted">
              {message}
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="p-6 space-y-4">
          {features.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="px-6 pb-6">
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-3xl font-bold text-primary">$29</span>
                <span className="text-muted ml-1">/month</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-accent font-semibold uppercase tracking-wide">
                  50 Analyses/Month
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel anytime • No hidden fees</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Start Free Trial'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 text-muted hover:text-primary transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}