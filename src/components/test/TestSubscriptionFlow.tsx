'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

interface TestStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
}

export default function TestSubscriptionFlow() {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: 'check-auth',
      name: 'Check Authentication',
      description: 'Verify user is authenticated',
      status: 'pending'
    },
    {
      id: 'create-subscription',
      name: 'Create Test Subscription',
      description: 'Simulate subscription.created webhook',
      status: 'pending'
    },
    {
      id: 'verify-database',
      name: 'Verify Database Update',
      description: 'Check subscription record in Supabase',
      status: 'pending'
    },
    {
      id: 'check-usage',
      name: 'Check Usage Limits',
      description: 'Verify usage tracking is initialized',
      status: 'pending'
    },
    {
      id: 'update-subscription',
      name: 'Update Subscription',
      description: 'Test subscription tier upgrade',
      status: 'pending'
    },
    {
      id: 'simulate-payment',
      name: 'Simulate Payment',
      description: 'Test payment.succeeded webhook',
      status: 'pending'
    },
    {
      id: 'verify-billing',
      name: 'Verify Billing History',
      description: 'Check billing record in database',
      status: 'pending'
    }
  ]);

  const updateStep = (stepId: string, updates: Partial<TestStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const runTest = async () => {
    setIsRunning(true);
    const supabase = createClient();

    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', result: undefined, error: undefined })));

    try {
      // Step 1: Check Authentication
      updateStep('check-auth', { status: 'running' });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        updateStep('check-auth', { 
          status: 'error', 
          error: 'User not authenticated. Please log in first.' 
        });
        setIsRunning(false);
        return;
      }
      
      updateStep('check-auth', { 
        status: 'success', 
        result: { userId: user.id, email: user.email } 
      });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Create Test Subscription
      updateStep('create-subscription', { status: 'running' });
      const createResponse = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription.created',
          userId: user.id,
          tier: 'starter'
        })
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        updateStep('create-subscription', { 
          status: 'error', 
          error: error.error || 'Failed to create subscription' 
        });
        setIsRunning(false);
        return;
      }

      const createResult = await createResponse.json();
      updateStep('create-subscription', { 
        status: 'success', 
        result: createResult 
      });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Verify Database Update
      updateStep('verify-database', { status: 'running' });
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError || !subscription) {
        updateStep('verify-database', { 
          status: 'error', 
          error: 'Subscription not found in database' 
        });
        setIsRunning(false);
        return;
      }

      updateStep('verify-database', { 
        status: 'success', 
        result: { 
          tier: subscription.tier, 
          status: subscription.status,
          id: subscription.id 
        } 
      });
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Check Usage Limits
      updateStep('check-usage', { status: 'running' });
      const { data: usage, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (usageError || !usage) {
        updateStep('check-usage', { 
          status: 'error', 
          error: 'Usage tracking not initialized' 
        });
      } else {
        updateStep('check-usage', { 
          status: 'success', 
          result: { 
            analysisCount: usage.analysis_count,
            periodStart: usage.period_start,
            periodEnd: usage.period_end
          } 
        });
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 5: Update Subscription
      updateStep('update-subscription', { status: 'running' });
      const updateResponse = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription.updated',
          userId: user.id,
          tier: 'pro'
        })
      });

      if (!updateResponse.ok) {
        updateStep('update-subscription', { 
          status: 'error', 
          error: 'Failed to update subscription' 
        });
      } else {
        const updateResult = await updateResponse.json();
        updateStep('update-subscription', { 
          status: 'success', 
          result: updateResult 
        });
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 6: Simulate Payment
      updateStep('simulate-payment', { status: 'running' });
      const paymentResponse = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment.succeeded',
          userId: user.id,
          amount: 2900 // $29 for pro tier
        })
      });

      if (!paymentResponse.ok) {
        updateStep('simulate-payment', { 
          status: 'error', 
          error: 'Failed to simulate payment' 
        });
      } else {
        const paymentResult = await paymentResponse.json();
        updateStep('simulate-payment', { 
          status: 'success', 
          result: paymentResult 
        });
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 7: Verify Billing History
      updateStep('verify-billing', { status: 'running' });
      const { data: billing, error: billingError } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (billingError || !billing) {
        updateStep('verify-billing', { 
          status: 'error', 
          error: 'Billing record not found' 
        });
      } else {
        updateStep('verify-billing', { 
          status: 'success', 
          result: { 
            amount: billing.amount_paid / 100,
            status: billing.status,
            currency: billing.currency
          } 
        });
      }

    } catch (error) {
      console.error('Test flow error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Test Subscription Flow</h2>
        <button
          onClick={runTest}
          disabled={isRunning}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" />
              Run Test Flow
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              {getStepIcon(step.status)}
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-16 mt-2 ${
                  step.status === 'success' ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className={`font-medium ${
                step.status === 'error' ? 'text-red-600' : 
                step.status === 'success' ? 'text-green-600' : 
                'text-primary'
              }`}>
                {step.name}
              </h3>
              <p className="text-sm text-muted">{step.description}</p>
              
              {step.result && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                  <pre className="text-green-700 dark:text-green-400">
                    {JSON.stringify(step.result, null, 2)}
                  </pre>
                </div>
              )}
              
              {step.error && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-sm text-red-600 dark:text-red-400">{step.error}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isRunning && steps.every(s => s.status === 'success') && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-green-700 dark:text-green-400 font-medium">
            ✅ All tests passed successfully! Webhook integration is working correctly.
          </p>
        </div>
      )}
    </div>
  );
}