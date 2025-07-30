'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
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
  };
  financial: {
    purchasePrice: number;
    downPaymentPercent: number;
    interestRate: number;
    loanTerm: number;
    closingCosts?: number;
    renovationCosts?: number;
    holdingCosts?: number;
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
    setWizardData(prev => ({ ...prev, ...data }));
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
    <>
      <Navigation variant="dashboard" />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <WizardContainer
              currentStep={currentStep}
              totalSteps={5}
              onStepClick={(step) => step < currentStep && setCurrentStep(step)}
            >
              {renderStep()}
            </WizardContainer>
          </div>
        </main>
      </div>
    </>
  );
}