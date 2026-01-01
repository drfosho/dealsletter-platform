import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Disable body parsing, we need the raw body for webhook signature verification
export const runtime = 'nodejs';

// Map Stripe tier names to our database tier names
function mapTierName(stripeTier: string): string {
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
  return tierMap[upperTier] || 'free';  // Default to free if not found
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

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('[Webhook] ✓ Signature verified');
      console.log('[Webhook] Event Type:', event.type);
      console.log('[Webhook] Event ID:', event.id);
    } catch (err) {
      console.error('[Webhook] ❌ Signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check for duplicate events (idempotency)
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      console.log('[Webhook] ⚠️ Event already processed:', event.id);
      console.log('[Webhook] Skipping duplicate processing');
      console.log('[Webhook] ========================================');
      return NextResponse.json({ received: true });
    }
    console.log('[Webhook] ✓ New event, processing...');

    // Record the event
    await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: event.id,
        type: event.type,
        data: event.data,
        processed: false
      });

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
              
              await supabase
                .from('subscriptions')
                .upsert({
                  user_id: authUser.id,
                  stripe_customer_id: subscription.customer as string,
                  stripe_subscription_id: subscription.id,
                  stripe_price_id: priceId,
                  status: subscription.status as any,
                  tier: tierName as any,
                  current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
                  current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                  cancel_at_period_end: subscription.cancel_at_period_end,
                  trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
                  trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                  metadata: subscription.metadata
                }, {
                  onConflict: 'user_id'
                });

              // Initialize usage tracking
              const periodStart = new Date((subscription as any).current_period_start * 1000);
              const periodEnd = new Date((subscription as any).current_period_end * 1000);
              
              await supabase
                .from('usage_tracking')
                .upsert({
                  user_id: authUser.id,
                  subscription_id: subscription.id,
                  period_start: periodStart.toISOString(),
                  period_end: periodEnd.toISOString(),
                  analysis_count: 0
                }, {
                  onConflict: 'user_id,period_start'
                });
            }
          }
        } else {
          // Create subscription record with existing user ID
          const priceId = subscription.items.data[0].price.id;
          const stripeTierName = subscription.metadata.tierName || 'STARTER';
              const tierName = mapTierName(stripeTierName);
          
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_price_id: priceId,
              status: subscription.status as any,
              tier: tierName as any,
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              metadata: subscription.metadata
            }, {
              onConflict: 'user_id'
            });

          // Initialize usage tracking
          const periodStart = new Date((subscription as any).current_period_start * 1000);
          const periodEnd = new Date((subscription as any).current_period_end * 1000);
          
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

          console.log('[Webhook] Customer ID:', customerId);
          console.log('[Webhook] Customer email:', customer.email);

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
            console.log('[Webhook] User ID found:', userId);

            // Get the price ID and tier (handle both old and new metadata keys)
            const priceId = subscription.items.data[0].price.id;
            const stripeTierName = subscription.metadata.tierName || subscription.metadata.tier || session.metadata?.tierName || 'PRO';
            const tierName = mapTierName(stripeTierName);

            console.log('[Webhook] Tier name:', stripeTierName, '→', tierName);

            // Create or update subscription record
            const { error: subError } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                stripe_price_id: priceId,
                status: subscription.status as any,
                tier: tierName as any,
                current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
                current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
                trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                metadata: subscription.metadata
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
            const periodStart = new Date((subscription as any).current_period_start * 1000);
            const periodEnd = new Date((subscription as any).current_period_end * 1000);

            await supabase
              .from('usage_tracking')
              .upsert({
                user_id: userId,
                period_start: periodStart.toISOString(),
                period_end: periodEnd.toISOString(),
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
          const stripeTierName = subscription.metadata.tierName || 'STARTER';
              const tierName = mapTierName(stripeTierName);
          
          // Update subscription details
          await supabase
            .from('subscriptions')
            .update({
              stripe_price_id: priceId,
              status: subscription.status as any,
              tier: tierName as any,
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              metadata: subscription.metadata
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
            const periodStart = new Date((subscription as any).current_period_start * 1000);
            const periodEnd = new Date((subscription as any).current_period_end * 1000);
            
            await supabase
              .from('usage_tracking')
              .upsert({
                user_id: userId,
                period_start: periodStart.toISOString(),
                period_end: periodEnd.toISOString(),
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
          console.log(`Trial ending soon for user ${userId}`);
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
      const supabase = await createClient();
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