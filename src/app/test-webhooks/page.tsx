'use client';

import { useState, useEffect } from 'react';
import TestSubscriptionFlow from '@/components/test/TestSubscriptionFlow';
import { createClient } from '@/lib/supabase/client';
import { validateDatabaseSync } from '@/lib/webhook-validation';
import { CheckCircle, AlertCircle, Info, RefreshCw } from 'lucide-react';

export default function TestWebhooksPage() {
  const [user, setUser] = useState<any>(null);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const runValidation = async () => {
    if (!user) return;
    
    setIsValidating(true);
    try {
      const result = await validateDatabaseSync(user.id);
      setValidationResults(result);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Authentication Required</h3>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                Please log in to test webhook functionality. The tests need an authenticated user to create and validate subscriptions.
              </p>
              <a href="/auth/login" className="inline-block mt-3 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors">
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Webhook Testing & Validation</h1>
        
        {/* User Info */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Authenticated as</p>
                <p className="text-sm text-muted">{user.email}</p>
              </div>
            </div>
            <div className="text-xs text-muted">
              User ID: {user.id.slice(0, 8)}...
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Testing Instructions</h3>
              <ol className="list-decimal list-inside text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>Click "Run Test Flow" to simulate the complete subscription lifecycle</li>
                <li>The test will create a test subscription and verify all webhook events</li>
                <li>Check the validation results to ensure database sync is working</li>
                <li>Visit <a href="/webhooks" className="underline">Webhook Events</a> page to see all events</li>
                <li>For production, use Stripe CLI to forward real webhooks</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Test Subscription Flow */}
        <div className="mb-6">
          <TestSubscriptionFlow />
        </div>

        {/* Database Validation */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Database Validation</h2>
            <button
              onClick={runValidation}
              disabled={isValidating}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
              Validate
            </button>
          </div>

          {validationResults && (
            <div className="space-y-4">
              {/* Status */}
              <div className={`p-3 rounded-lg ${
                validationResults.isValid 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {validationResults.isValid ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900 dark:text-green-100">Validation Passed</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-900 dark:text-red-100">Validation Failed</span>
                    </>
                  )}
                </div>
              </div>

              {/* Errors */}
              {validationResults.errors.length > 0 && (
                <div>
                  <h3 className="font-medium text-red-600 mb-2">Errors</h3>
                  <ul className="space-y-1">
                    {validationResults.errors.map((error: string, i: number) => (
                      <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                        <span className="text-red-400">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {validationResults.warnings.length > 0 && (
                <div>
                  <h3 className="font-medium text-amber-600 mb-2">Warnings</h3>
                  <ul className="space-y-1">
                    {validationResults.warnings.map((warning: string, i: number) => (
                      <li key={i} className="text-sm text-amber-600 flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metadata */}
              {Object.keys(validationResults.metadata).length > 0 && (
                <div>
                  <h3 className="font-medium text-muted mb-2">Validation Details</h3>
                  <pre className="text-xs bg-muted/10 p-3 rounded overflow-auto">
                    {JSON.stringify(validationResults.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stripe CLI Instructions */}
        <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Testing with Stripe CLI</h3>
          <p className="text-sm text-muted mb-3">
            For testing with real Stripe events in development, use the Stripe CLI:
          </p>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
            <div># Install Stripe CLI (if not already installed)</div>
            <div>brew install stripe/stripe-cli/stripe</div>
            <div className="mt-2"># Login to Stripe</div>
            <div>stripe login</div>
            <div className="mt-2"># Forward webhooks to your local server</div>
            <div>stripe listen --forward-to localhost:3000/api/stripe/webhook</div>
            <div className="mt-2"># In another terminal, trigger test events</div>
            <div>stripe trigger payment_intent.succeeded</div>
          </div>
        </div>
      </div>
    </div>
  );
}