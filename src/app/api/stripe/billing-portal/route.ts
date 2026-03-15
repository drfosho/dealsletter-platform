import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime to ensure env vars are accessible
export const runtime = 'nodejs'

export async function POST(_request: NextRequest) {
  console.log('[BillingPortal] Creating billing portal session...')

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[BillingPortal] Auth error:', authError?.message)
      return NextResponse.json(
        { error: 'You must be logged in to access billing' },
        { status: 401 }
      )
    }

    console.log('[BillingPortal] User ID:', user.id)

    // Check user_profiles first (primary source — updated by Stripe webhook)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let stripeCustomerId = profile?.stripe_customer_id

    // Fallback to subscriptions table
    if (!stripeCustomerId) {
      console.log('[BillingPortal] No customer ID in user_profiles, checking subscriptions...')
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'past_due', 'canceled'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      stripeCustomerId = subscription?.stripe_customer_id
    }

    console.log('[BillingPortal] Stripe customer ID:', stripeCustomerId || 'NOT FOUND')

    if (!stripeCustomerId) {
      console.log('[BillingPortal] No billing account found for user')
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe to a plan first.' },
        { status: 400 }
      )
    }

    // Create a billing portal session
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/subscription`
    console.log('[BillingPortal] Return URL:', returnUrl)

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    })

    console.log('[BillingPortal] Portal session created:', session.id)
    console.log('[BillingPortal] Portal URL:', session.url)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[BillingPortal] Error creating billing portal session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to access billing portal: ' + errorMessage },
      { status: 500 }
    )
  }
}