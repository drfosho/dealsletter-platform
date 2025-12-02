'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ProRouteGuard from '@/components/ProRouteGuard';
import WizardContainer from '@/components/analysis-wizard/WizardContainer';
import Step1PropertySearch from '@/components/analysis-wizard/Step1PropertySearch';
import Step2Strategy from '@/components/analysis-wizard/Step2Strategy';
import Step3Financial from '@/components/analysis-wizard/Step3Financial';
import Step4Generate from '@/components/analysis-wizard/Step4Generate';
import Step5Results from '@/components/analysis-wizard/Step5Results';

export interface WizardData {
  address: string;
  propertyData?: Record<string, unknown>;
  strategy: string;
  strategyDetails?: {
    timeline?: string;
    exitStrategy?: string;
    renovationLevel?: string;
    initialFinancing?: string;
    [key: string]: string | undefined;
  };
  financial: {
    purchasePrice: number;
    downPaymentPercent: number;
    interestRate: number;
    loanTerm: number;
    closingCosts?: number;
    renovationCosts?: number;
    holdingCosts?: number;
    loanType?: 'conventional' | 'hardMoney';
    points?: number;
    arv?: number; // After Repair Value for flip strategy
    monthlyRent?: number; // Monthly rent for rental strategies
    rentPerUnit?: number; // Rent per unit for multi-family properties
    units?: number; // Number of units for multi-family properties
  };
  analysis?: Record<string, unknown>;
  analysisId?: string;
}

export default function NewAnalysisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    address: '',
    strategy: '',
    financial: {
      purchasePrice: 0,
      downPaymentPercent: 20,
      interestRate: 7.0,
      loanTerm: 30,
    }
  });
  const [_canProceed, setCanProceed] = useState(false);

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('analysis-wizard-draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setWizardData(parsedDraft);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Save draft to localStorage
  useEffect(() => {
    if (wizardData.address || wizardData.strategy) {
      localStorage.setItem('analysis-wizard-draft', JSON.stringify(wizardData));
    }
  }, [wizardData]);

  const updateWizardData = (data: Partial<WizardData>) => {
    setWizardData(prev => {
      // Deep merge for financial object
      if (data.financial) {
        return {
          ...prev,
          ...data,
          financial: {
            ...prev.financial,
            ...data.financial
          }
        };
      }
      return { ...prev, ...data };
    });
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Clear draft
    localStorage.removeItem('analysis-wizard-draft');
    // Navigate to analysis history or dashboard
    router.push('/analysis');
  };

  const handleReset = () => {
    // Clear all wizard data
    localStorage.removeItem('analysis-wizard-draft');
    setWizardData({
      address: '',
      strategy: '',
      financial: {
        purchasePrice: 0,
        downPaymentPercent: 20,
        interestRate: 7.0,
        loanTerm: 30,
      }
    });
    setCurrentStep(1);
    setCanProceed(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PropertySearch
            data={wizardData}
            updateData={updateWizardData}
            onNext={handleNext}
            setCanProceed={setCanProceed}
          />
        );
      case 2:
        return (
          <Step2Strategy
            data={wizardData}
            updateData={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
            setCanProceed={setCanProceed}
          />
        );
      case 3:
        return (
          <Step3Financial
            data={wizardData}
            updateData={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
            setCanProceed={setCanProceed}
          />
        );
      case 4:
        return (
          <Step4Generate
            data={wizardData}
            updateData={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <Step5Results
            data={wizardData}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ProRouteGuard feature="Property Analysis Calculator">
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-primary">Property Analysis</h1>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-muted hover:text-primary border border-border rounded-lg hover:border-primary/50 transition-colors"
            >
              {currentStep === 1 ? 'Clear Data' : 'Start Over'}
            </button>
          </div>
          <WizardContainer
            currentStep={currentStep}
            totalSteps={5}
            onStepClick={(step) => step < currentStep && setCurrentStep(step)}
          >
            {renderStep()}
          </WizardContainer>
        </main>
      </div>
    </ProRouteGuard>
  );
}