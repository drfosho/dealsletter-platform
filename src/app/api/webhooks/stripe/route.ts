import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Disable body parsing, we need the raw body for webhook signature verification
export const runtime = 'nodejs';

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
  console.log('[Webhook] Received webhook request');
  
  try {
    const body = await getRawBody(request);
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('[Webhook] No signature found in request headers');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Webhook] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`[Webhook] Verified event: ${event.type}`);
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err);
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
      console.log(`[Webhook] Event already processed: ${event.id}`);
      return NextResponse.json({ received: true });
    }

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
        console.log('[Webhook] Processing customer.subscription.created');
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
              
              await handleSubscriptionCreated(supabase, subscription, authUser.id);
            } else {
              console.error('[Webhook] Could not find user for subscription:', subscription.id);
            }
          }
        } else {
          await handleSubscriptionCreated(supabase, subscription, userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        console.log('[Webhook] Processing customer.subscription.updated');
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabaseUserId;

        if (userId) {
          const priceId = subscription.items.data[0].price.id;
          const tierName = subscription.metadata.tierName || determineTierFromPriceId(priceId);
          
          // Update subscription details
          await supabase
            .from('subscriptions')
            .update({
              stripe_price_id: priceId,
              status: subscription.status as any,
              tier: tierName.toLowerCase() as any,
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              metadata: subscription.metadata,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);
          
          console.log(`[Webhook] Updated subscription ${subscription.id} for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        console.log('[Webhook] Processing customer.subscription.deleted');
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabaseUserId;

        if (userId) {
          // Update subscription status to canceled
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);
          
          console.log(`[Webhook] Canceled subscription ${subscription.id} for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        console.log('[Webhook] Processing invoice.payment_succeeded');
        const invoice = event.data.object as Stripe.Invoice;
        
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
                subscription_id: subscription.id,
                period_start: periodStart.toISOString(),
                period_end: periodEnd.toISOString(),
                analysis_count: 0
              }, {
                onConflict: 'user_id,period_start'
              });
            
            console.log(`[Webhook] Recorded payment for user ${userId}, invoice ${invoice.id}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        console.log('[Webhook] Processing invoice.payment_failed');
        const invoice = event.data.object as Stripe.Invoice;
        
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
                status: 'past_due',
                updated_at: new Date().toISOString()
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
                status: 'failed',
                created_at: new Date().toISOString()
              });
            
            console.log(`[Webhook] Recorded failed payment for user ${userId}, invoice ${invoice.id}`);
          }
        }
        break;
      }

      case 'checkout.session.completed': {
        console.log('[Webhook] Processing checkout.session.completed');
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as Stripe.Subscription;

          // Get or create customer
          const customerId = session.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          
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
            await handleSubscriptionCreated(supabase, subscription, userId);
            console.log(`[Webhook] Created subscription from checkout for user ${userId}`);
          }
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        console.log('[Webhook] Processing customer.subscription.trial_will_end');
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabaseUserId;

        if (userId) {
          // You can send an email notification here
          console.log(`[Webhook] Trial ending soon for user ${userId}`);
          
          // Optionally update metadata to track notification sent
          await supabase
            .from('subscriptions')
            .update({
              metadata: { 
                ...subscription.metadata, 
                trial_ending_notification_sent: true,
                trial_ending_notification_date: new Date().toISOString()
              },
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabase
      .from('webhook_events')
      .update({
        processed: true,
        processed_at: new Date().toISOString()
      })
      .eq('stripe_event_id', event.id);

    console.log(`[Webhook] Successfully processed event: ${event.id}`);
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    
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

// Helper function to handle subscription creation
async function handleSubscriptionCreated(
  supabase: any,
  subscription: Stripe.Subscription,
  userId: string
) {
  const priceId = subscription.items.data[0].price.id;
  const tierName = subscription.metadata.tierName || determineTierFromPriceId(priceId);
  
  // Create or update subscription record
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: subscription.status as any,
      tier: tierName.toLowerCase() as any,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      metadata: subscription.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  // Initialize usage tracking for the new period
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

// Helper function to determine tier from price ID
function determineTierFromPriceId(priceId: string): string {
  const priceTiers: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || '']: 'starter',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || '']: 'starter',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '']: 'pro',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || '']: 'pro',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || '']: 'premium',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || '']: 'premium',
  };
  
  // Remove empty keys
  Object.keys(priceTiers).forEach(key => {
    if (!key) delete priceTiers[key];
  });
  
  return priceTiers[priceId] || 'starter';
}