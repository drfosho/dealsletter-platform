import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

// Disable body parsing, we need the raw body for webhook signature verification
export const runtime = 'nodejs';

// Map Stripe tier names to our database tier names
function mapTierName(stripeTier: string): string {
  console.log('[Webhook] mapTierName - Input:', stripeTier);

  const tierMap: Record<string, string> = {
    'STARTER': 'starter',
    'PRO': 'pro',  // Map PRO to pro
    'PROFESSIONAL': 'professional',
    'PRO_PLUS': 'pro-plus',  // New Pro Plus tier
    'PRO-PLUS': 'pro-plus',
    'PROPLUS': 'pro-plus',
    'PREMIUM': 'premium',
    'FREE': 'free'
  };

  const upperTier = stripeTier.toUpperCase().replace('-', '_');
  const result = tierMap[upperTier] || 'free';  // Default to free if not found
  console.log('[Webhook] mapTierName - Normalized:', upperTier, '→', result);
  return result;
}

// CRITICAL: Safely convert Stripe Unix timestamp (seconds) to ISO string
// Stripe timestamps are in SECONDS, JavaScript Date expects MILLISECONDS
function stripeTimestampToISO(timestamp: number | null | undefined): string | null {
  if (timestamp === null || timestamp === undefined) {
    console.log('[Webhook] stripeTimestampToISO - No timestamp provided, returning null');
    return null;
  }

  // Ensure it's a valid number
  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    console.error('[Webhook] stripeTimestampToISO - Invalid timestamp value:', timestamp, 'type:', typeof timestamp);
    return null;
  }

  // Convert seconds to milliseconds
  const milliseconds = timestamp * 1000;
  const date = new Date(milliseconds);

  // Validate the resulting date
  if (isNaN(date.getTime())) {
    console.error('[Webhook] stripeTimestampToISO - Invalid date from timestamp:', timestamp);
    return null;
  }

  const isoString = date.toISOString();
  console.log('[Webhook] stripeTimestampToISO - Converted:', timestamp, '→', isoString);
  return isoString;
}

// Helper to safely get period dates from subscription (handles different Stripe API versions)
function getSubscriptionPeriodDates(subscription: Stripe.Subscription): { periodStart: Date; periodEnd: Date; periodStartISO: string; periodEndISO: string } {
  console.log('[Webhook] getSubscriptionPeriodDates - Extracting period dates');

  // Try subscription level first (older API versions)
  let periodStartTs = (subscription as any).current_period_start;
  let periodEndTs = (subscription as any).current_period_end;

  console.log('[Webhook] Subscription level timestamps:', { periodStartTs, periodEndTs });

  // Try subscription item level (newer API versions like 2025-05-28.basil)
  if (!periodStartTs && subscription.items?.data?.[0]) {
    const item = subscription.items.data[0] as any;
    periodStartTs = item.current_period_start;
    periodEndTs = item.current_period_end;
    console.log('[Webhook] Item level timestamps:', { periodStartTs, periodEndTs });
  }

  // Fallback to trial dates if available
  if (!periodStartTs && subscription.trial_start) {
    periodStartTs = subscription.trial_start;
    console.log('[Webhook] Using trial_start for period start:', periodStartTs);
  }
  if (!periodEndTs && subscription.trial_end) {
    periodEndTs = subscription.trial_end;
    console.log('[Webhook] Using trial_end for period end:', periodEndTs);
  }

  // Final fallback to now + 30 days
  if (!periodStartTs || typeof periodStartTs !== 'number') {
    periodStartTs = Math.floor(Date.now() / 1000);
    console.log('[Webhook] Warning: Using current time for period start:', periodStartTs);
  }
  if (!periodEndTs || typeof periodEndTs !== 'number') {
    periodEndTs = periodStartTs + (30 * 24 * 60 * 60); // 30 days
    console.log('[Webhook] Warning: Using 30 days from start for period end:', periodEndTs);
  }

  // Convert to Date objects (timestamps are in seconds, need milliseconds)
  const periodStart = new Date(periodStartTs * 1000);
  const periodEnd = new Date(periodEndTs * 1000);

  // Validate dates
  if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
    console.error('[Webhook] CRITICAL: Invalid dates generated!', { periodStartTs, periodEndTs });
    // Return safe defaults
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return {
      periodStart: now,
      periodEnd: thirtyDaysLater,
      periodStartISO: now.toISOString(),
      periodEndISO: thirtyDaysLater.toISOString()
    };
  }

  return {
    periodStart,
    periodEnd,
    periodStartISO: periodStart.toISOString(),
    periodEndISO: periodEnd.toISOString()
  };
}

async function getRawBody(request: NextRequest): Promise<Buffer> {
  const chunks = [];
  const reader = request.body?.getReader();
  
  if (!reader) {
    throw new Error('No body reader available');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return Buffer.from(result);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[Webhook] ========================================');
  console.log('[Webhook] Incoming webhook request received');
  console.log('[Webhook] Time:', new Date().toISOString());
  
  try {
    const body = await getRawBody(request);
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('[Webhook] ❌ No signature found in request');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }
    console.log('[Webhook] ✓ Signature found');

    // Support both production and local (Stripe CLI) webhook secrets
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const webhookSecretLocal = process.env.STRIPE_WEBHOOK_SECRET_LOCAL;

    if (!webhookSecret && !webhookSecretLocal) {
      console.error('[Webhook] ❌ No webhook secret configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event: Stripe.Event;
    let verificationError: Error | null = null;

    // Try production secret first
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log('[Webhook] ✓ Signature verified with production secret');
      } catch (err) {
        verificationError = err as Error;
        console.log('[Webhook] Production secret failed, trying local...');
      }
    }

    // If production failed, try local/CLI secret
    if (!event! && webhookSecretLocal) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecretLocal);
        console.log('[Webhook] ✓ Signature verified with local/CLI secret');
        verificationError = null;
      } catch (err) {
        verificationError = err as Error;
      }
    }

    if (!event! || verificationError) {
      console.error('[Webhook] ❌ Signature verification failed:', verificationError?.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('[Webhook] Event Type:', event.type);
    console.log('[Webhook] Event ID:', event.id);

    const supabase = createAdminClient();

    // SEC-003: Atomic duplicate detection using upsert with conflict handling
    // This prevents TOCTOU race conditions where concurrent requests could both pass a SELECT check
    const { data: insertResult, error: insertError } = await supabase
      .from('webhook_events')
      .upsert({
        stripe_event_id: event.id,
        type: event.type,
        data: event.data,
        processed: false
      }, {
        onConflict: 'stripe_event_id',
        ignoreDuplicates: true  // Don't update if exists, just skip
      })
      .select('id, created_at')
      .single();

    // Check if this was a duplicate by seeing if we got a result
    // If ignoreDuplicates is true and there was a conflict, no row is returned
    if (insertError && insertError.code !== 'PGRST116') {
      // PGRST116 = "JSON object requested, multiple (or no) rows returned"
      // This is expected when ignoreDuplicates skips the insert
      console.error('[Webhook] ❌ Error recording event:', insertError);
    }

    // If no result returned, it means the event already existed (duplicate)
    if (!insertResult) {
      console.log('[Webhook] ⚠️ Event already processed (atomic check):', event.id);
      console.log('[Webhook] Skipping duplicate processing');
      console.log('[Webhook] ========================================');
      return NextResponse.json({ received: true });
    }
    console.log('[Webhook] ✓ New event recorded, processing...');

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created': {
        console.log('[Webhook] 📋 Processing customer.subscription.created');
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get user ID from metadata
        const userId = subscription.metadata.supabaseUserId;
        
        if (!userId) {
          // Try to find user by customer email
          const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
          
          if (customer.email) {
            const { data: authUser } = await supabase
              .from('auth.users')
              .select('id')
              .eq('email', customer.email)
              .single();
            
            if (authUser) {
              // Update subscription with user ID
              await stripe.subscriptions.update(subscription.id, {
                metadata: { ...subscription.metadata, supabaseUserId: authUser.id }
              });
              
              // Create subscription record
              const priceId = subscription.items.data[0].price.id;
              const stripeTierName = subscription.metadata.tierName || 'STARTER';
              const tierName = mapTierName(stripeTierName);
              
              const { periodStartISO, periodEndISO } = getSubscriptionPeriodDates(subscription);

              await supabase
                .from('subscriptions')
                .upsert({
                  user_id: authUser.id,
                  stripe_customer_id: subscription.customer as string,
                  stripe_subscription_id: subscription.id,
                  stripe_price_id: priceId,
                  status: subscription.status as string,
                  tier: tierName,
                  current_period_start: periodStartISO,
                  current_period_end: periodEndISO,
                  cancel_at_period_end: subscription.cancel_at_period_end,
                  trial_start: stripeTimestampToISO(subscription.trial_start),
                  trial_end: stripeTimestampToISO(subscription.trial_end)
                }, {
                  onConflict: 'user_id'
                });

              // Initialize usage tracking
              await supabase
                .from('usage_tracking')
                .upsert({
                  user_id: authUser.id,
                  subscription_id: subscription.id,
                  period_start: periodStartISO,
                  period_end: periodEndISO,
                  analysis_count: 0
                }, {
                  onConflict: 'user_id,period_start'
                });
            }
          }
        } else {
          // Create subscription record with existing user ID
          // SEC-009: Don't log user IDs
          console.log('[Webhook] subscription.created - User ID found: [REDACTED]');

          const priceId = subscription.items.data[0].price.id;
          const stripeTierName = subscription.metadata.tierName || subscription.metadata.tier || 'PRO';
          const tierName = mapTierName(stripeTierName);

          console.log('[Webhook] subscription.created - Tier:', stripeTierName, '→', tierName);
          console.log('[Webhook] subscription.created - Price ID:', priceId);
          console.log('[Webhook] subscription.created - Subscription ID:', subscription.id);

          const { periodStartISO, periodEndISO } = getSubscriptionPeriodDates(subscription);
          console.log('[Webhook] subscription.created - Period:', periodStartISO, 'to', periodEndISO);

          const { error: subError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_price_id: priceId,
              status: subscription.status as string,
              tier: tierName,
              current_period_start: periodStartISO,
              current_period_end: periodEndISO,
              cancel_at_period_end: subscription.cancel_at_period_end,
              trial_start: stripeTimestampToISO(subscription.trial_start),
              trial_end: stripeTimestampToISO(subscription.trial_end)
            }, {
              onConflict: 'user_id'
            });

          if (subError) {
            console.error('[Webhook] subscription.created - ❌ DB Error:', subError);
          } else {
            console.log('[Webhook] subscription.created - ✅ Subscription record created');
          }

          // Update profiles table with stripe_customer_id
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ stripe_customer_id: subscription.customer as string })
            .eq('id', userId);

          if (profileError) {
            console.log('[Webhook] subscription.created - Profile update warning:', profileError.message);
          } else {
            console.log('[Webhook] subscription.created - ✅ Profile updated with customer ID');
          }

          // Initialize usage tracking
          const { error: usageError } = await supabase
            .from('usage_tracking')
            .upsert({
              user_id: userId,
              subscription_id: subscription.id,
              period_start: periodStartISO,
              period_end: periodEndISO,
              analysis_count: 0
            }, {
              onConflict: 'user_id,period_start'
            });

          if (usageError) {
            console.error('[Webhook] subscription.created - ❌ Usage tracking error:', usageError);
          } else {
            console.log('[Webhook] subscription.created - ✅ Usage tracking initialized');
          }
        }
        break;
      }

      case 'checkout.session.completed': {
        console.log('[Webhook] 🎉 Processing checkout.session.completed');
        const session = event.data.object as Stripe.Checkout.Session;

        console.log('[Webhook] Session ID:', session.id);
        console.log('[Webhook] Session metadata:', session.metadata);
        console.log('[Webhook] Mode:', session.mode);

        if (session.mode === 'subscription') {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as Stripe.Subscription;

          console.log('[Webhook] Subscription ID:', subscription.id);
          console.log('[Webhook] Subscription metadata:', subscription.metadata);
          console.log('[Webhook] Subscription status:', subscription.status);

          // Get or create customer
          const customerId = session.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

          // SEC-009: Don't log customer PII - only log that we have valid data
          console.log('[Webhook] Customer found:', !!customerId);
          console.log('[Webhook] Customer has email:', !!customer.email);

          // Get user ID from metadata or email
          let userId = subscription.metadata.supabaseUserId || session.metadata?.supabaseUserId;
          
          if (!userId && customer.email) {
            // Try to find user by email
            const { data: authUser } = await supabase
              .from('auth.users')
              .select('id')
              .eq('email', customer.email)
              .single();
            
            userId = authUser?.id;
          }

          if (userId) {
            // SEC-009: Log only that user was found, not the actual ID
            console.log('[Webhook] User ID found: [REDACTED]');

            // Get the price ID and tier (handle both old and new metadata keys)
            const priceId = subscription.items.data[0].price.id;
            const stripeTierName = subscription.metadata.tierName || subscription.metadata.tier || session.metadata?.tierName || 'PRO';
            const tierName = mapTierName(stripeTierName);

            console.log('[Webhook] Tier name:', stripeTierName, '→', tierName);

            // Get period dates safely
            const { periodStartISO, periodEndISO } = getSubscriptionPeriodDates(subscription);
            console.log('[Webhook] Period:', periodStartISO, 'to', periodEndISO);

            // Create or update subscription record
            const { error: subError } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                stripe_price_id: priceId,
                status: subscription.status as string,
                tier: tierName,
                current_period_start: periodStartISO,
                current_period_end: periodEndISO,
                cancel_at_period_end: subscription.cancel_at_period_end,
                trial_start: stripeTimestampToISO(subscription.trial_start),
                trial_end: stripeTimestampToISO(subscription.trial_end)
              }, {
                onConflict: 'user_id'
              });

            if (subError) {
              console.error('[Webhook] ❌ Subscription upsert error:', subError);
            } else {
              console.log('[Webhook] ✅ Subscription record created/updated');
            }

            // Also update profiles table with stripe_customer_id for billing portal access
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ stripe_customer_id: customerId })
              .eq('id', userId);

            if (profileError) {
              console.log('[Webhook] Profile update warning:', profileError.message);
            } else {
              console.log('[Webhook] ✅ Profile updated with customer ID');
            }

            // Initialize usage tracking for the new period
            await supabase
              .from('usage_tracking')
              .upsert({
                user_id: userId,
                period_start: periodStartISO,
                period_end: periodEndISO,
                analysis_count: 0
              }, {
                onConflict: 'user_id,period_start'
              });

            console.log('[Webhook] ✅ Usage tracking initialized');
          } else {
            console.error('[Webhook] ❌ No user ID found - cannot update database');
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        console.log('[Webhook] 📝 Processing customer.subscription.updated');
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabaseUserId;
        console.log('[Webhook] Subscription ID:', subscription.id);
        console.log('[Webhook] User ID:', userId || 'Not found');

        if (userId) {
          const priceId = subscription.items.data[0].price.id;
          const stripeTierName = subscription.metadata.tierName || subscription.metadata.tier || 'PRO';
          const tierName = mapTierName(stripeTierName);
          const { periodStartISO, periodEndISO } = getSubscriptionPeriodDates(subscription);

          // Update subscription details
          await supabase
            .from('subscriptions')
            .update({
              stripe_price_id: priceId,
              status: subscription.status as string,
              tier: tierName,
              current_period_start: periodStartISO,
              current_period_end: periodEndISO,
              cancel_at_period_end: subscription.cancel_at_period_end,
              cancel_at: stripeTimestampToISO(subscription.cancel_at),
              canceled_at: stripeTimestampToISO(subscription.canceled_at),
              trial_start: stripeTimestampToISO(subscription.trial_start),
              trial_end: stripeTimestampToISO(subscription.trial_end)
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        console.log('[Webhook] 🗑️ Processing customer.subscription.deleted');
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabaseUserId;
        console.log('[Webhook] Subscription ID:', subscription.id);
        console.log('[Webhook] User ID:', userId || 'Not found');

        if (userId) {
          // Update subscription status to canceled
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        console.log('[Webhook] 💰 Processing invoice.payment_succeeded');
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[Webhook] Invoice ID:', invoice.id);
        console.log('[Webhook] Amount:', invoice.amount_paid / 100, invoice.currency?.toUpperCase());
        
        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          ) as Stripe.Subscription;
          const userId = subscription.metadata.supabaseUserId;

          if (userId) {
            // Record payment in billing history
            await supabase
              .from('billing_history')
              .insert({
                user_id: userId,
                stripe_invoice_id: invoice.id,
                stripe_payment_intent_id: (invoice as any).payment_intent as string,
                amount_paid: invoice.amount_paid,
                currency: invoice.currency,
                status: 'paid',
                invoice_pdf: (invoice as any).invoice_pdf,
                paid_at: new Date().toISOString()
              });

            // Reset usage for new billing period if needed
            const { periodStartISO, periodEndISO } = getSubscriptionPeriodDates(subscription);

            await supabase
              .from('usage_tracking')
              .upsert({
                user_id: userId,
                period_start: periodStartISO,
                period_end: periodEndISO,
                analysis_count: 0
              }, {
                onConflict: 'user_id,period_start'
              });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        console.log('[Webhook] ❌ Processing invoice.payment_failed');
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[Webhook] Invoice ID:', invoice.id);
        console.log('[Webhook] Amount attempted:', invoice.amount_due / 100, invoice.currency?.toUpperCase());
        
        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          ) as Stripe.Subscription;
          const userId = subscription.metadata.supabaseUserId;

          if (userId) {
            // Update subscription status to past_due
            await supabase
              .from('subscriptions')
              .update({
                status: 'past_due'
              })
              .eq('stripe_subscription_id', subscription.id);

            // Record failed payment
            await supabase
              .from('billing_history')
              .insert({
                user_id: userId,
                stripe_invoice_id: invoice.id,
                stripe_payment_intent_id: (invoice as any).payment_intent as string,
                amount_paid: 0,
                currency: invoice.currency,
                status: 'failed'
              });
          }
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabaseUserId;

        if (userId) {
          // You can send an email notification here
          // SEC-009: Don't log user IDs
          console.log('[Webhook] Trial ending soon for user [REDACTED]');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabase
      .from('webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('stripe_event_id', event.id);

    const processingTime = Date.now() - startTime;
    console.log('[Webhook] ✅ Event processed successfully');
    console.log('[Webhook] Processing time:', processingTime, 'ms');
    console.log('[Webhook] ========================================');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] ❌ CRITICAL ERROR:', error);
    console.error('[Webhook] Stack trace:', (error as Error).stack);
    console.log('[Webhook] ========================================');
    
    // Record error in webhook_events if we have the event ID
    if ((error as any).event?.id) {
      const supabase = createAdminClient();
      await supabase
        .from('webhook_events')
        .update({
          error: (error as Error).message,
          processed: false
        })
        .eq('stripe_event_id', (error as any).event.id);
    }
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}