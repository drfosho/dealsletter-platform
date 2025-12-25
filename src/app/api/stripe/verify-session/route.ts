import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

// Force Node.js runtime
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400 }
    )
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    console.log('[VerifySession] Session:', {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email
    })

    // Get tier from subscription metadata
    let tier = 'Pro'
    if (session.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        tier = subscription.metadata?.tier || 'Pro'
      } catch {
        // Ignore subscription fetch errors
      }
    }

    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email || session.customer_details?.email,
      tier: tier
    })
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('[VerifySession] Error:', err.message)

    return NextResponse.json(
      { error: 'Failed to verify session', status: 'error' },
      { status: 500 }
    )
  }
}
