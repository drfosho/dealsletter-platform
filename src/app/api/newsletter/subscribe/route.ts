import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const AUDIENCE_ID = '88867a45-ed26-4522-9147-d1008ee57566'

const TOPICS = {
  newsletter: '787f17f1-b87f-464a-adf0-9b82834df927',
  updates: 'cf52bc26-7ff7-4141-b0e5-5621aad4b4c0',
  promotions: '4e1d7902-1d79-4d02-a431-ec38462a6ab9',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      firstName,
      subscribeNewsletter = true,
      subscribeUpdates = false,
      subscribePromotions = false,
    } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      )
    }

    // Build topic subscriptions
    const topics: Record<string, boolean> = {}
    if (subscribeNewsletter) {
      topics[TOPICS.newsletter] = true
    }
    if (subscribeUpdates) {
      topics[TOPICS.updates] = true
    }
    if (subscribePromotions) {
      topics[TOPICS.promotions] = true
    }

    // Add or update contact in Resend
    const { data, error } = await resend.contacts.create({
      email,
      firstName: firstName || '',
      audienceId: AUDIENCE_ID,
      unsubscribed: false,
    })

    if (error) {
      console.error('Resend contact error:', error)
      return NextResponse.json(
        { error: 'Subscription failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscribed to the Deal Desk newsletter',
    })
  } catch (err) {
    console.error('Newsletter subscribe error:', err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
