'use client';

import { useState, useEffect } from 'react';
import type { WizardData } from '@/app/analysis/new/page';

interface Step2StrategyProps {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  setCanProceed: (can: boolean) => void;
}

const strategies = [
  {
    id: 'flip',
    title: 'Fix & Flip',
    icon: '🔨',
    description: 'Buy, renovate, and sell quickly for profit',
    timeline: '6-12 months',
    riskLevel: 'High',
    returnPotential: 'High',
    keyPoints: [
      'Quick turnaround for capital',
      'Requires renovation expertise',
      'Market timing critical',
      'Higher tax implications'
    ],
    color: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/50'
  },
  {
    id: 'brrrr',
    title: 'BRRRR Strategy',
    icon: '♻️',
    description: 'Buy, Rehab, Rent, Refinance, Repeat',
    timeline: '12-18 months',
    riskLevel: 'Medium-High',
    returnPotential: 'Very High',
    keyPoints: [
      'Recycle capital for growth',
      'Build rental portfolio',
      'Requires good credit',
      'Complex execution'
    ],
    color: 'from-purple-500/20 to-blue-500/20',
    borderColor: 'border-purple-500/50'
  },
  {
    id: 'rental',
    title: 'Buy & Hold',
    icon: '🏘️',
    description: 'Long-term rental income and appreciation',
    timeline: '5+ years',
    riskLevel: 'Low-Medium',
    returnPotential: 'Steady',
    keyPoints: [
      'Passive income stream',
      'Tax advantages',
      'Property appreciation',
      'Tenant management'
    ],
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/50'
  },
  {
    id: 'house-hack',
    title: 'House Hack',
    icon: '🏡',
    description: 'Live in one unit, rent out others',
    timeline: '1+ years',
    riskLevel: 'Low',
    returnPotential: 'Medium',
    keyPoints: [
      'Reduce living expenses',
      'FHA loan eligible (3.5% down)',
      'Learn landlording',
      'Build equity while living free'
    ],
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/50'
  }
];

export default function Step2Strategy({ 
  data, 
  updateData, 
  onNext, 
  onBack,
  setCanProceed 
}: Step2StrategyProps) {
  const [selectedStrategy, setSelectedStrategy] = useState(data.strategy || '');
  const [strategyDetails, setStrategyDetails] = useState(data.strategyDetails || {});

  useEffect(() => {
    setCanProceed(!!selectedStrategy);
  }, [selectedStrategy, setCanProceed]);

  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);

    // CRITICAL FIX: Reset strategyDetails when switching strategies
    // This prevents stale values from persisting (e.g., rental timeline of "20" years
    // being used for flip timeline which should be in months)
    const previousStrategy = selectedStrategy;

    if (previousStrategy && previousStrategy !== strategyId) {
      console.log('[Step2Strategy] Strategy changed from', previousStrategy, 'to', strategyId, '- resetting details');

      // Set appropriate defaults for the new strategy
      let newDetails: Record<string, string> = {};

      switch (strategyId) {
        case 'flip':
          newDetails = { timeline: '6', renovationLevel: 'moderate' };
          break;
        case 'brrrr':
          newDetails = { timeline: '12', renovationLevel: 'moderate', initialFinancing: 'hardMoney', exitStrategy: '75' };
          break;
        case 'rental':
          newDetails = { timeline: '10', exitStrategy: 'self' };
          break;
        case 'commercial':
          newDetails = { timeline: '1' };
          break;
        default:
          newDetails = {};
      }

      setStrategyDetails(newDetails);
      updateData({ strategy: strategyId, strategyDetails: newDetails });
    } else {
      updateData({ strategy: strategyId });
    }
  };

  const handleDetailsChange = (field: string, value: string) => {
    const newDetails = { ...strategyDetails, [field]: value };
    setStrategyDetails(newDetails);
    updateData({ strategyDetails: newDetails });
  };

  const handleContinue = () => {
    if (selectedStrategy) {
      updateData({ strategy: selectedStrategy, strategyDetails });
      onNext();
    }
  };

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Select Your Investment Strategy
        </h2>
        <p className="text-muted">
          Choose the strategy that aligns with your investment goals and risk tolerance
        </p>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {strategies.map((strategy) => (
          <button
            key={strategy.id}
            onClick={() => handleStrategySelect(strategy.id)}
            className={`
              relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300
              ${selectedStrategy === strategy.id 
                ? `${strategy.borderColor} border-2 shadow-lg transform scale-[1.02]` 
                : 'border border-border hover:border-primary/30 hover:shadow-md'
              }
            `}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${strategy.color} opacity-50`} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{strategy.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-primary">{strategy.title}</h3>
                    <p className="text-sm text-muted">{strategy.description}</p>
                  </div>
                </div>
                {selectedStrategy === strategy.id && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-muted">Timeline</p>
                  <p className="font-semibold text-primary">{strategy.timeline}</p>
                </div>
                <div>
                  <p className="text-muted">Risk</p>
                  <p className="font-semibold text-primary">{strategy.riskLevel}</p>
                </div>
                <div>
                  <p className="text-muted">Returns</p>
                  <p className="font-semibold text-primary">{strategy.returnPotential}</p>
                </div>
              </div>

              <ul className="space-y-1">
                {strategy.keyPoints.map((point, index) => (
                  <li key={index} className="text-sm text-muted flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>

      {/* Strategy-Specific Options */}
      {selectedStrategy && (
        <div className="bg-muted/10 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-primary mb-4">
            {selectedStrategyData?.title} Details
          </h3>
          
          {selectedStrategy === 'flip' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Target Timeline
                </label>
                <select 
                  value={strategyDetails.timeline || '6'}
                  onChange={(e) => handleDetailsChange('timeline', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="9">9 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Renovation Level
                </label>
                <select 
                  value={strategyDetails.renovationLevel || 'moderate'}
                  onChange={(e) => handleDetailsChange('renovationLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="cosmetic">Cosmetic ($15-25/sqft)</option>
                  <option value="moderate">Moderate ($25-50/sqft)</option>
                  <option value="extensive">Extensive ($50-100/sqft)</option>
                  <option value="gut">Gut Rehab ($100+/sqft)</option>
                </select>
              </div>
            </div>
          )}

          {selectedStrategy === 'brrrr' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Renovation Level
                  </label>
                  <select 
                    value={strategyDetails.renovationLevel || 'moderate'}
                    onChange={(e) => handleDetailsChange('renovationLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="cosmetic">Cosmetic ($15-25/sqft)</option>
                    <option value="moderate">Moderate ($25-50/sqft)</option>
                    <option value="extensive">Extensive ($50-100/sqft)</option>
                    <option value="gut">Gut Rehab ($100+/sqft)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Refinance Timeline
                  </label>
                  <select 
                    value={strategyDetails.timeline || '12'}
                    onChange={(e) => handleDetailsChange('timeline', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="6">6 months (seasoning)</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Initial Financing
                  </label>
                  <select 
                    value={strategyDetails.initialFinancing || 'hardMoney'}
                    onChange={(e) => handleDetailsChange('initialFinancing', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="hardMoney">Hard Money (Default)</option>
                    <option value="conventional">Conventional Loan</option>
                    <option value="cash">Cash Purchase</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    Refinance LTV
                  </label>
                  <select 
                    value={strategyDetails.exitStrategy || '75'}
                    onChange={(e) => handleDetailsChange('exitStrategy', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="70">70% of ARV</option>
                    <option value="75">75% of ARV (Default)</option>
                    <option value="80">80% of ARV</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {selectedStrategy === 'rental' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Investment Horizon
                </label>
                <select 
                  value={strategyDetails.timeline || '10'}
                  onChange={(e) => handleDetailsChange('timeline', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="5">5 years</option>
                  <option value="10">10 years</option>
                  <option value="20">20+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Property Management
                </label>
                <select 
                  value={strategyDetails.exitStrategy || 'self'}
                  onChange={(e) => handleDetailsChange('exitStrategy', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="self">Self-manage</option>
                  <option value="property-manager">Property Manager (8-10%)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
        >
          ← Back to Property
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedStrategy}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all
            ${selectedStrategy
              ? 'bg-primary text-secondary hover:bg-primary/90 transform hover:scale-105'
              : 'bg-muted text-muted cursor-not-allowed'
            }
          `}
        >
          Continue to Financials →
        </button>
      </div>
    </div>
  );
}