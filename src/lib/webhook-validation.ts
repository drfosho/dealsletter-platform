/**
 * Webhook validation utilities for testing and monitoring
 */

import { createClient } from '@/lib/supabase/client';

export interface WebhookValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: Record<string, any>;
}

/**
 * Validate webhook event data structure
 */
export function validateWebhookEvent(event: any): WebhookValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const metadata: Record<string, any> = {};

  // Check required fields
  if (!event.id) {
    errors.push('Event ID is missing');
  }

  if (!event.type) {
    errors.push('Event type is missing');
  }

  if (!event.data || typeof event.data !== 'object') {
    errors.push('Event data is missing or invalid');
  }

  // Validate event type format
  if (event.type && !event.type.match(/^[a-z]+\.[a-z_]+$/)) {
    warnings.push(`Event type format may be invalid: ${event.type}`);
  }

  // Check for test events
  if (event.id && event.id.startsWith('test_')) {
    metadata.isTestEvent = true;
    warnings.push('This is a test event');
  }

  // Validate subscription events
  if (event.type && event.type.includes('subscription')) {
    const subscription = event.data?.object;
    
    if (!subscription?.id) {
      errors.push('Subscription ID is missing');
    }
    
    if (!subscription?.customer) {
      errors.push('Customer ID is missing');
    }
    
    if (!subscription?.items?.data?.[0]?.price?.id) {
      warnings.push('Price ID is missing from subscription items');
    }
    
    if (!subscription?.metadata?.supabaseUserId) {
      warnings.push('Supabase user ID not found in metadata');
    }

    metadata.subscriptionId = subscription?.id;
    metadata.customerId = subscription?.customer;
    metadata.priceId = subscription?.items?.data?.[0]?.price?.id;
  }

  // Validate payment events
  if (event.type && event.type.includes('payment')) {
    const invoice = event.data?.object;
    
    if (!invoice?.id) {
      errors.push('Invoice ID is missing');
    }
    
    if (invoice?.amount_paid === undefined) {
      errors.push('Payment amount is missing');
    }
    
    if (!invoice?.currency) {
      warnings.push('Currency is missing');
    }

    metadata.invoiceId = invoice?.id;
    metadata.amount = invoice?.amount_paid;
    metadata.currency = invoice?.currency;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata
  };
}

/**
 * Validate database sync after webhook processing
 */
export async function validateDatabaseSync(
  userId: string,
  expectedTier?: string
): Promise<WebhookValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const metadata: Record<string, any> = {};

  try {
    const supabase = createClient();

    // Check subscription record
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      errors.push('Subscription record not found in database');
    } else {
      metadata.subscription = {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        stripeSubscriptionId: subscription.stripe_subscription_id
      };

      if (expectedTier && subscription.tier !== expectedTier) {
        errors.push(`Tier mismatch: expected ${expectedTier}, got ${subscription.tier}`);
      }

      if (!subscription.stripe_subscription_id) {
        warnings.push('Stripe subscription ID is missing');
      }

      if (!subscription.stripe_customer_id) {
        warnings.push('Stripe customer ID is missing');
      }
    }

    // Check usage tracking
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (usageError || !usage) {
      warnings.push('Usage tracking record not found');
    } else {
      metadata.usage = {
        analysisCount: usage.analysis_count,
        periodStart: usage.period_start,
        periodEnd: usage.period_end
      };

      // Validate period dates
      const periodStart = new Date(usage.period_start);
      const periodEnd = new Date(usage.period_end);
      const now = new Date();

      if (periodStart > now) {
        errors.push('Usage period start date is in the future');
      }

      if (periodEnd < now) {
        warnings.push('Usage period has already ended');
      }
    }

    // Check usage limits
    const { data: limits, error: limitsError } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('tier', subscription?.tier || 'free')
      .single();

    if (limitsError || !limits) {
      warnings.push('Usage limits not configured for tier');
    } else {
      metadata.limits = {
        analysisLimit: limits.analysis_limit,
        features: limits.features
      };
    }

  } catch (error) {
    errors.push(`Database validation error: ${(error as Error).message}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata
  };
}

/**
 * Validate webhook signature (for production)
 */
export function validateWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require('crypto');
    
    // Extract timestamp and signatures
    const elements = signature.split(',');
    const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1];
    const signatures = elements
      .filter(e => e.startsWith('v1='))
      .map(e => e.split('=')[1]);

    if (!timestamp || signatures.length === 0) {
      return false;
    }

    // Prepare signed payload
    const signedPayload = `${timestamp}.${payload}`;
    
    // Compute expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Check if any signature matches
    return signatures.some(sig => {
      return crypto.timingSafeEqual(
        Buffer.from(sig),
        Buffer.from(expectedSignature)
      );
    });
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

/**
 * Test webhook endpoint connectivity
 */
export async function testWebhookEndpoint(
  url: string,
  testPayload?: any
): Promise<WebhookValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const metadata: Record<string, any> = {};

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload || {
        type: 'test.ping',
        data: { timestamp: new Date().toISOString() }
      })
    });

    metadata.statusCode = response.status;
    metadata.statusText = response.statusText;

    if (response.status === 200) {
      metadata.success = true;
      const result = await response.json();
      metadata.response = result;
    } else if (response.status === 400) {
      warnings.push('Bad request - check payload format');
    } else if (response.status === 401 || response.status === 403) {
      errors.push('Authentication failed - check webhook secret');
    } else if (response.status === 500) {
      errors.push('Server error - check webhook handler');
    } else {
      warnings.push(`Unexpected status code: ${response.status}`);
    }

  } catch (error) {
    errors.push(`Connection failed: ${(error as Error).message}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata
  };
}

/**
 * Validate webhook event processing completeness
 */
export async function validateEventProcessing(
  eventId: string
): Promise<WebhookValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const metadata: Record<string, any> = {};

  try {
    const supabase = createClient();

    // Check webhook_events table
    const { data: event, error } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('stripe_event_id', eventId)
      .single();

    if (error || !event) {
      errors.push('Event not found in webhook_events table');
    } else {
      metadata.event = {
        id: event.id,
        type: event.type,
        processed: event.processed,
        processedAt: event.processed_at,
        error: event.error
      };

      if (!event.processed) {
        warnings.push('Event has not been processed');
      }

      if (event.error) {
        errors.push(`Event processing error: ${event.error}`);
      }

      // Calculate processing time if processed
      if (event.processed_at && event.created_at) {
        const processingTime = new Date(event.processed_at).getTime() - 
                              new Date(event.created_at).getTime();
        metadata.processingTimeMs = processingTime;
        
        if (processingTime > 5000) {
          warnings.push(`Slow processing time: ${processingTime}ms`);
        }
      }
    }

  } catch (error) {
    errors.push(`Validation error: ${(error as Error).message}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata
  };
}