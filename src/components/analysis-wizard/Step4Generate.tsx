'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { WizardData } from '@/app/analysis/new/page';

interface Step4GenerateProps {
  data: WizardData;
  updateData: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ProgressStep {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'complete';
}

const INITIAL_STEPS: ProgressStep[] = [
  { id: 1, label: 'Fetching property details', status: 'pending' },
  { id: 2, label: 'Pulling market data', status: 'pending' },
  { id: 3, label: 'Running AI analysis', status: 'pending' },
  { id: 4, label: 'Preparing your results', status: 'pending' },
];

export default function Step4Generate({
  data,
  updateData,
  onNext,
  onBack
}: Step4GenerateProps) {
  const _router = useRouter();
  const [steps, setSteps] = useState<ProgressStep[]>(INITIAL_STEPS);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [_analysisId, setAnalysisId] = useState<string | null>(null);
  const hasStarted = useRef(false);
  const streamTextRef = useRef('');
  const textContainerRef = useRef<HTMLDivElement>(null);

  const updateStep = useCallback((stepId: number, status: 'pending' | 'active' | 'complete') => {
    setSteps(prev => prev.map(s => {
      if (s.id === stepId) return { ...s, status };
      // If this step is complete, mark all previous as complete too
      if (status === 'complete' && s.id < stepId) return { ...s, status: 'complete' };
      return s;
    }));
  }, []);

  const startAnalysis = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setStreamedText('');
    streamTextRef.current = '';
    const t_start = performance.now();

    try {
      const response = await fetch('/api/analysis/generate', {
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
          arv: data.financial.arv,
          monthlyRent: data.financial.monthlyRent,
          renovationLevel: data.strategyDetails?.renovationLevel,
          strategyDetails: data.strategyDetails,
          propertyData: data.propertyData,
          units: data.financial.units || 1,
          rentPerUnit: data.financial.rentPerUnit
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || 'Failed to generate analysis');
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete event in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6); // Remove 'data: ' prefix

          try {
            const event = JSON.parse(jsonStr);

            switch (event.type) {
              case 'progress':
                updateStep(event.step, event.status);
                break;

              case 'stream':
                streamTextRef.current += event.text;
                setStreamedText(streamTextRef.current);
                // Auto-scroll
                if (textContainerRef.current) {
                  textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
                }
                break;

              case 'complete': {
                const t_end = performance.now();
                console.log(`[Step4] Total analysis time: ${((t_end - t_start) / 1000).toFixed(1)}s`);
                setAnalysisId(event.result.id);
                updateData({
                  analysis: event.result.analysis,
                  analysisId: event.result.id
                });
                setIsGenerating(false);
                // Auto-proceed to results
                setTimeout(() => onNext(), 800);
                return;
              }

              case 'error':
                throw new Error(event.message || 'Analysis generation failed');
            }
          } catch (parseErr) {
            // Skip malformed events but rethrow actual errors
            if (parseErr instanceof Error && parseErr.message !== 'Analysis generation failed' &&
                !parseErr.message.includes('Failed')) {
              console.warn('[Step4] Skipping malformed SSE event');
            } else {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
      setIsGenerating(false);
    }
  }, [data, updateData, onNext, updateStep]);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    setError(null);
    setSteps(INITIAL_STEPS);
    setStreamedText('');
    streamTextRef.current = '';
    hasStarted.current = false;
    startAnalysis();
  };

  // Calculate progress percentage from completed steps
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const activeStep = steps.find(s => s.status === 'active');
  const progress = activeStep
    ? ((completedCount + 0.5) / steps.length) * 100
    : (completedCount / steps.length) * 100;

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted text-center mt-2">{Math.round(progress)}% Complete</p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-3 max-w-md mx-auto mb-8">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`
              flex items-center gap-4 p-4 rounded-lg transition-all duration-300
              ${step.status === 'active'
                ? 'bg-primary/10 border border-primary/30'
                : step.status === 'complete'
                ? 'bg-primary/5 border border-transparent'
                : 'opacity-40 border border-transparent'
              }
            `}
          >
            {/* Step indicator */}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              {step.status === 'complete' ? (
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : step.status === 'active' ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-muted/40" />
              )}
            </div>

            {/* Step label */}
            <div className="flex-1">
              <p className={`
                font-medium text-sm
                ${step.status === 'complete' ? 'text-green-400'
                  : step.status === 'active' ? 'text-primary'
                  : 'text-muted'}
              `}>
                {step.label}
              </p>
              {step.status === 'active' && (
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
          </div>
        ))}
      </div>

      {/* Streaming Analysis Text */}
      {streamedText && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-sm font-medium text-primary">AI Analysis Streaming</p>
          </div>
          <div
            ref={textContainerRef}
            className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-h-64 overflow-y-auto text-sm text-muted leading-relaxed whitespace-pre-wrap font-mono"
          >
            {streamedText}
            {isGenerating && (
              <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5" />
            )}
          </div>
        </div>
      )}

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
