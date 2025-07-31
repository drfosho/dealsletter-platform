'use client';

import React from 'react';

interface WizardContainerProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  children: React.ReactNode;
}

export default function WizardContainer({ 
  currentStep, 
  totalSteps, 
  onStepClick,
  children 
}: WizardContainerProps) {
  const steps = [
    { number: 1, title: 'Property Search', icon: '🏠' },
    { number: 2, title: 'Strategy', icon: '📊' },
    { number: 3, title: 'Financials', icon: '💰' },
    { number: 4, title: 'Generate', icon: '🤖' },
    { number: 5, title: 'Results', icon: '📈' }
  ];

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -translate-y-1/2 z-0" />
          <div 
            className="absolute left-0 top-1/2 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
          
          {/* Step Indicators */}
          {steps.map((step) => (
            <button
              key={step.number}
              onClick={() => onStepClick?.(step.number)}
              disabled={!onStepClick || step.number > currentStep}
              className={`
                relative flex flex-col items-center gap-2 bg-background z-10
                ${step.number <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
                transition-all duration-300 transform
                ${step.number === currentStep 
                  ? 'bg-primary text-secondary scale-110 shadow-lg' 
                  : step.number < currentStep
                  ? 'bg-primary/80 text-secondary'
                  : 'bg-muted text-muted'
                }
              `}>
                {step.number < currentStep ? '✓' : step.icon}
              </div>
              <span className={`
                text-xs font-medium hidden sm:block
                ${step.number <= currentStep ? 'text-primary' : 'text-muted'}
              `}>
                {step.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-card rounded-xl border border-border/60 shadow-sm">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}