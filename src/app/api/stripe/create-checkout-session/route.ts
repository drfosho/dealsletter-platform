import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { priceId, tierName, email } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Get the current user (if logged in)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Allow both authenticated and unauthenticated users
    // For unauthenticated users, we'll use the email they provide

    let customerId = null
    let customerEmail = user?.email || email

    // If user is logged in, check for existing Stripe customer
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single()

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id
      } else {
        // Create a new Stripe customer
        const customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            supabaseUserId: user.id,
          },
        })
        customerId = customer.id

        // Save the customer ID to the user's profile
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)
      }
    }

    // Create checkout session configuration
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true&tier=${tierName}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
        metadata: {
          tierName: tierName,
        },
      },
    }

    // Add customer or email to session
    if (customerId) {
      sessionConfig.customer = customerId
      if (user) {
        sessionConfig.subscription_data.metadata.supabaseUserId = user.id
      }
    } else {
      // For unauthenticated users, collect email during checkout
      sessionConfig.customer_email = customerEmail
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}