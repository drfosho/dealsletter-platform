import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Test endpoint for simulating Stripe webhook events
 * WARNING: This should only be used in development/testing
 */

interface TestWebhookEvent {
  type: 'subscription.created' | 'subscription.updated' | 'payment.succeeded' | 'payment.failed';
  userId?: string;
  subscriptionId?: string;
  tier?: 'free' | 'starter' | 'pro' | 'premium';
  amount?: number;
}

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Test endpoint disabled in production' }, { status: 403 });
  }

  try {
    const body: TestWebhookEvent = await request.json();
    const supabase = await createClient();
    
    console.log('[Test Webhook] Received test event:', body);

    // Get current user if not specified
    let userId = body.userId;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'No user ID provided or found' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const response: any = { success: true, event: body.type, timestamp };

    switch (body.type) {
      case 'subscription.created': {
        console.log(`[Test Webhook] Creating subscription for user ${userId}`);
        
        // Create test subscription
        // First check if metadata column exists
        const subscriptionData: any = {
          user_id: userId,
          stripe_customer_id: `test_cus_${Date.now()}`,
          stripe_subscription_id: body.subscriptionId || `test_sub_${Date.now()}`,
          stripe_price_id: `test_price_${body.tier || 'starter'}`,
          status: 'active',
          tier: body.tier || 'starter',
          current_period_start: timestamp,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          cancel_at_period_end: false,
          created_at: timestamp,
          updated_at: timestamp
        };

        // Try with metadata first, fallback to without if it fails
        let { data: subscription, error } = await supabase
          .from('subscriptions')
          .upsert({
            ...subscriptionData,
            metadata: { test: true, created_via: 'test_webhook' }
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        // If metadata column doesn't exist, try without it
        if (error && error.message.includes('metadata')) {
          console.log('[Test Webhook] Metadata column not found, creating without it');
          const result = await supabase
            .from('subscriptions')
            .upsert(subscriptionData, {
              onConflict: 'user_id'
            })
            .select()
            .single();
          
          subscription = result.data;
          error = result.error;
        }

        if (error) {
          console.error('[Test Webhook] Error creating subscription:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Initialize usage tracking
        const periodStart = new Date();
        const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        await supabase
          .from('usage_tracking')
          .upsert({
            user_id: userId,
            subscription_id: subscription.id,
            period_start: periodStart.toISOString(),
            period_end: periodEnd.toISOString(),
            analysis_count: 0
          }, {
            onConflict: 'user_id,period_start'
          });

        response.subscription = subscription;
        console.log('[Test Webhook] Subscription created:', subscription);
        break;
      }

      case 'subscription.updated': {
        console.log(`[Test Webhook] Updating subscription for user ${userId}`);
        
        // Update existing subscription
        const updateData: any = {
          tier: body.tier || 'pro',
          status: 'active',
          updated_at: timestamp
        };

        // Try with metadata first, fallback to without if it fails
        let { data: subscription, error } = await supabase
          .from('subscriptions')
          .update({
            ...updateData,
            metadata: { test: true, updated_via: 'test_webhook' }
          })
          .eq('user_id', userId)
          .select()
          .single();

        // If metadata column doesn't exist, try without it
        if (error && error.message.includes('metadata')) {
          console.log('[Test Webhook] Metadata column not found, updating without it');
          const result = await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('user_id', userId)
            .select()
            .single();
          
          subscription = result.data;
          error = result.error;
        }

        if (error) {
          console.error('[Test Webhook] Error updating subscription:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        response.subscription = subscription;
        console.log('[Test Webhook] Subscription updated:', subscription);
        break;
      }

      case 'payment.succeeded': {
        console.log(`[Test Webhook] Recording successful payment for user ${userId}`);
        
        // Record payment
        const { data: payment, error } = await supabase
          .from('billing_history')
          .insert({
            user_id: userId,
            stripe_invoice_id: `test_inv_${Date.now()}`,
            stripe_payment_intent_id: `test_pi_${Date.now()}`,
            amount_paid: body.amount || 2900, // Default $29
            currency: 'usd',
            status: 'paid',
            invoice_pdf: null,
            paid_at: timestamp
          })
          .select()
          .single();

        if (error) {
          console.error('[Test Webhook] Error recording payment:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        response.payment = payment;
        console.log('[Test Webhook] Payment recorded:', payment);
        break;
      }

      case 'payment.failed': {
        console.log(`[Test Webhook] Recording failed payment for user ${userId}`);
        
        // Update subscription to past_due
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: timestamp
          })
          .eq('user_id', userId);

        // Record failed payment
        const { data: payment, error } = await supabase
          .from('billing_history')
          .insert({
            user_id: userId,
            stripe_invoice_id: `test_inv_${Date.now()}`,
            stripe_payment_intent_id: `test_pi_${Date.now()}`,
            amount_paid: 0,
            currency: 'usd',
            status: 'failed',
            created_at: timestamp
          })
          .select()
          .single();

        if (error) {
          console.error('[Test Webhook] Error recording failed payment:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        response.payment = payment;
        console.log('[Test Webhook] Failed payment recorded:', payment);
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    // Record test event in webhook_events table
    await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: `test_evt_${Date.now()}`,
        type: `test.${body.type}`,
        data: body,
        processed: true,
        processed_at: timestamp,
        created_at: timestamp
      });

    console.log('[Test Webhook] Test event processed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('[Test Webhook] Error processing test event:', error);
    return NextResponse.json(
      { error: 'Failed to process test event', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET endpoint to check test webhook status
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Test endpoint disabled in production' }, { status: 403 });
  }

  const supabase = await createClient();
  
  // Get recent webhook events
  const { data: events, error } = await supabase
    .from('webhook_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    status: 'Test webhook endpoint active',
    environment: process.env.NODE_ENV,
    recentEvents: events,
    testEndpoints: [
      { method: 'POST', path: '/api/test-webhook', description: 'Simulate webhook events' },
      { method: 'GET', path: '/api/test-webhook', description: 'Check webhook status' }
    ]
  });
}