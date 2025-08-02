'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { WizardData } from '@/app/analysis/new/page';

interface Step4GenerateProps {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const analysisSteps = [
  { id: 1, label: 'Validating property data', icon: '🏠', duration: 2000 },
  { id: 2, label: 'Analyzing market conditions', icon: '📊', duration: 3000 },
  { id: 3, label: 'Calculating financial metrics', icon: '💰', duration: 2500 },
  { id: 4, label: 'Generating AI insights', icon: '🤖', duration: 4000 },
  { id: 5, label: 'Finalizing report', icon: '📋', duration: 1500 }
];

export default function Step4Generate({ 
  data, 
  updateData, 
  onNext, 
  onBack 
}: Step4GenerateProps) {
  const _router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [_analysisId, setAnalysisId] = useState<string | null>(null);

  const generateAnalysis = useCallback(async () => {
    return fetch('/api/analysis/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: data.address,
        strategy: data.strategy,
        purchasePrice: data.financial.purchasePrice,
        downPayment: (data.financial.purchasePrice * data.financial.downPaymentPercent) / 100,
        loanTerms: {
          interestRate: data.financial.interestRate,
          loanTerm: data.financial.loanTerm,
          loanType: data.financial.loanType || 'conventional',
          points: data.financial.points
        },
        rehabCosts: data.financial.renovationCosts || 0,
        arv: data.financial.arv, // After Repair Value for flip strategy
        monthlyRent: data.financial.monthlyRent, // User-specified monthly rent
        strategyDetails: data.strategyDetails,
        propertyData: data.propertyData // Include the property data
      })
    });
  }, [data]);

  const startAnalysis = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    // Simulate progress through steps
    for (let i = 0; i < analysisSteps.length; i++) {
      setCurrentStep(i);
      setProgress((i / analysisSteps.length) * 100);
      
      // If this is the AI generation step, make the actual API call
      if (i === 3) {
        try {
          const response = await generateAnalysis();
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || errorData.message || 'Failed to generate analysis');
          }
          const result = await response.json();
          setAnalysisId(result.id);
          updateData({ 
            analysis: result.analysis,
            analysisId: result.id 
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to generate analysis');
          setIsGenerating(false);
          return;
        }
      }
      
      // Wait for the step duration
      await new Promise(resolve => setTimeout(resolve, analysisSteps[i].duration));
    }

    setProgress(100);
    setIsGenerating(false);
    
    // Auto-proceed to results after a short delay
    setTimeout(() => {
      onNext();
    }, 1000);
  }, [updateData, onNext, generateAnalysis]);

  useEffect(() => {
    if (!isGenerating) {
      startAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    setError(null);
    setCurrentStep(0);
    setProgress(0);
    startAnalysis();
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-primary mb-2">Analysis Failed</h3>
        <p className="text-muted mb-6 max-w-md mx-auto">{error}</p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 text-primary border border-primary/30 rounded-lg hover:bg-primary/5"
          >
            Go Back
          </button>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-primary text-secondary rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Generating Your Analysis
        </h2>
        <p className="text-muted">
          Our AI is analyzing your property investment opportunity
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="bg-muted rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted text-center mt-2">{Math.round(progress)}% Complete</p>
      </div>

      {/* Analysis Steps */}
      <div className="space-y-4 max-w-md mx-auto">
        {analysisSteps.map((step, index) => (
          <div 
            key={step.id}
            className={`
              flex items-center gap-4 p-4 rounded-lg transition-all duration-500
              ${index === currentStep 
                ? 'bg-primary/10 border border-primary/30 scale-105' 
                : index < currentStep
                ? 'bg-muted/20 opacity-70'
                : 'opacity-30'
              }
            `}
          >
            <div className={`
              text-2xl transition-all duration-500
              ${index === currentStep ? 'animate-pulse' : ''}
            `}>
              {step.icon}
            </div>
            <div className="flex-1">
              <p className={`
                font-medium transition-colors duration-500
                ${index <= currentStep ? 'text-primary' : 'text-muted'}
              `}>
                {step.label}
              </p>
              {index === currentStep && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i}
                        className="w-1 h-1 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted">Processing</span>
                </div>
              )}
            </div>
            {index < currentStep && (
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Fun Facts */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-sm text-muted mb-2">Did you know?</p>
          <p className="text-primary font-medium">
            Our AI analyzes over 50 data points to provide you with the most accurate investment insights
          </p>
        </div>
      </div>

      {/* Cancel Button */}
      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="text-sm text-muted hover:text-primary"
        >
          Cancel Analysis
        </button>
      </div>
    </div>
  );
}