'use client';

import { useState } from 'react';

type FeedbackReason = 'too_expensive' | 'not_using_enough' | 'missing_feature' | 'taking_a_break';

const FEEDBACK_OPTIONS: { value: FeedbackReason; label: string }[] = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_using_enough', label: 'Not using it enough' },
  { value: 'missing_feature', label: 'Missing a feature I need' },
  { value: 'taking_a_break', label: 'Just taking a break' },
];

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCanceled: (accessUntilDate: string) => void;
  tier: string;
  accessEndDate: string | null; // ISO date string
}

export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  onCanceled,
  tier,
  accessEndDate,
}: CancelSubscriptionModalProps) {
  const [step, setStep] = useState<'confirm' | 'feedback'>('confirm');
  const [canceling, setCanceling] = useState(false);
  const [selectedReason, setSelectedReason] = useState<FeedbackReason | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [confirmedEndDate, setConfirmedEndDate] = useState<string | null>(null);

  const isPro = tier === 'pro';
  const planName = isPro ? 'Pro' : 'Pro Plus';
  const formattedDate = accessEndDate
    ? new Date(accessEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'the end of your billing period';

  const lossItems = isPro
    ? [
        'Dropping from 50 to 10 analyses per month',
        'Analysis history & comparison tools',
        'PDF & Excel exports',
      ]
    : [
        'Dropping from 200 to 10 analyses per month',
        'Advanced analytics & custom reporting',
        'Priority support & early access',
      ];

  const handleCancel = async () => {
    setCanceling(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel');
      }

      const data = await response.json();
      // Use cancel_at or current_period_end — both are now ISO strings from the API
      const dateStr = data.cancel_at || data.current_period_end;
      const endDate = dateStr
        ? new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : formattedDate;

      setConfirmedEndDate(endDate);
      setStep('feedback');
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert('Failed to cancel subscription. Please try again or contact support.');
    } finally {
      setCanceling(false);
    }
  };

  const finishFlow = () => {
    const date = confirmedEndDate || formattedDate;
    setStep('confirm');
    setSelectedReason(null);
    setConfirmedEndDate(null);
    onCanceled(date);
  };

  const handleSubmitFeedback = async () => {
    setSubmittingFeedback(true);
    try {
      if (selectedReason) {
        await fetch('/api/subscription/cancel-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: selectedReason, planName }),
        });
      }
    } catch {
      // Non-fatal — don't block the flow
    } finally {
      setSubmittingFeedback(false);
      finishFlow();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step === 'confirm' ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#141418] border border-[#2a2a3a] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {step === 'confirm' && (
          <div className="p-8">
            {/* Header */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Cancel your subscription?
            </h2>
            <p className="text-[#9ca3af] text-center text-sm mb-8">
              Your <span className="text-[#a78bfa] font-medium">{planName}</span> plan &middot; Access until {formattedDate}
            </p>

            {/* What you'll lose */}
            <div className="bg-[#0f0f14] border border-[#2a2a3a] rounded-xl p-5 mb-8">
              <p className="text-[#9ca3af] text-sm font-medium mb-3">
                What you&apos;ll lose on the free plan:
              </p>
              <ul className="space-y-3">
                {lossItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-[#d1d5db] text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Buttons */}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-colors mb-3"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              Keep My Plan
            </button>

            <button
              onClick={handleCancel}
              disabled={canceling}
              className="w-full py-3 rounded-xl font-medium text-[#9ca3af] border border-[#2a2a3a] hover:border-[#4a4a5a] hover:text-white transition-colors disabled:opacity-50"
            >
              {canceling ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Canceling...
                </span>
              ) : (
                'Cancel Subscription'
              )}
            </button>

            <p className="text-[#6b7280] text-xs text-center mt-4">
              Your access continues until {formattedDate}. You won&apos;t be charged again.
            </p>
          </div>
        )}

        {step === 'feedback' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              Sorry to see you go
            </h2>
            <p className="text-[#9ca3af] text-center text-sm mb-8">
              What made you cancel today?
            </p>

            {/* Feedback chips */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {FEEDBACK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedReason(option.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                    selectedReason === option.value
                      ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-[#a78bfa]'
                      : 'bg-[#0f0f14] border-[#2a2a3a] text-[#d1d5db] hover:border-[#4a4a5a]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmitFeedback}
              disabled={submittingFeedback}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 mb-3"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
            >
              {submittingFeedback ? 'Submitting...' : 'Submit'}
            </button>

            <button
              onClick={() => finishFlow()}
              className="w-full py-2 text-[#6b7280] text-sm hover:text-[#9ca3af] transition-colors"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
