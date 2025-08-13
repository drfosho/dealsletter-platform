import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Disable body parsing, we need the raw body for webhook signature verification
export const runtime = 'nodejs'

async function getRawBody(request: NextRequest): Promise<Buffer> {
  const chunks = []
  const reader = request.body?.getReader()
  
  if (!reader) {
    throw new Error('No body reader available')
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return Buffer.from(result)
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  
  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  try {
    const rawBody = await getRawBody(request)
    
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    const supabase = await createClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Get the subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        ) as Stripe.Subscription

        // Get the price ID from the subscription
        const priceId = subscription.items.data[0].price.id
        const userId = subscription.metadata.supabaseUserId || session.metadata?.supabaseUserId

        if (userId) {
          // Update user's subscription in the database
          await supabase
            .from('profiles')
            .update({
              subscription_tier: subscription.metadata.tierName || 'starter',
              subscription_status: 'active',
              stripe_subscription_id: subscription.id,
              stripe_price_id: priceId,
              subscription_current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.supabaseUserId

        if (userId) {
          const priceId = subscription.items.data[0].price.id
          
          // Update subscription details
          await supabase
            .from('profiles')
            .update({
              subscription_tier: subscription.metadata.tierName || 'starter',
              subscription_status: subscription.status,
              stripe_price_id: priceId,
              subscription_current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.supabaseUserId

        if (userId) {
          // Downgrade to free tier
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
              stripe_subscription_id: null,
              stripe_price_id: null,
              subscription_current_period_end: null,
            })
            .eq('id', userId)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Reset monthly analysis count on successful payment
        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          ) as Stripe.Subscription
          const userId = subscription.metadata.supabaseUserId

          if (userId) {
            // Reset the monthly analysis count
            await supabase
              .from('usage_tracking')
              .update({
                analysis_count: 0,
                period_start: new Date().toISOString(),
              })
              .eq('user_id', userId)
              .eq('period', new Date().toISOString().slice(0, 7)) // YYYY-MM format
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
          ) as Stripe.Subscription
          const userId = subscription.metadata.supabaseUserId

          if (userId) {
            // Update subscription status to past_due
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'past_due',
              })
              .eq('id', userId)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}