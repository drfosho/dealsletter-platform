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

    // Send newsletter welcome email
    try {
      await resend.emails.send({
        from: 'Dealsletter <main@dealsletter.io>',
        to: email,
        replyTo: 'kevin@dealsletter.io',
        subject: 'Welcome to the Deal Desk \ud83c\udfe0',
        html: `<!DOCTYPE html>
<html>
<body style="background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px 0;">
  <div style="max-width:560px;margin:0 auto;">
    <!-- Header -->
    <div style="background:#1a1830;border-radius:12px 12px 0 0;padding:24px 32px;">
      <img src="https://xsiflgnnowyvkhxjwmuu.supabase.co/storage/v1/object/public/email-assets/wordmark-transparent.png" alt="Dealsletter" width="140" style="display:block;" />
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:36px 32px 32px;">
      <p style="font-size:16px;color:#1a1830;font-weight:600;margin:0 0 24px;">
        You're in.
      </p>

      <p style="font-size:15px;color:#4a4869;line-height:1.8;margin:0 0 18px;">
        Welcome to the Dealsletter Deal Desk. Every week we break down 3-4 real investment properties &mdash; multifamily, fix &amp; flip, BRRRR, STR &mdash; with full underwriting, honest verdicts, and the numbers that actually matter.
      </p>

      <p style="font-size:15px;color:#4a4869;line-height:1.8;margin:0 0 32px;">
        No hype. No fluff. Just deals worth your time.
      </p>

      <!-- What to expect card -->
      <div style="background:#f8f7ff;border:1px solid #e8e5ff;border-radius:10px;padding:20px 24px;margin:0 0 28px;">
        <p style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6366F1;margin:0 0 14px;">
          What to expect
        </p>
        <p style="font-size:13px;color:#6b6690;line-height:1.7;margin:0 0 8px;">
          &#10003; Weekly deal breakdowns &mdash; real properties, real numbers
        </p>
        <p style="font-size:13px;color:#6b6690;line-height:1.7;margin:0 0 8px;">
          &#10003; BRRRR, Fix &amp; Flip, Buy &amp; Hold, STR strategies
        </p>
        <p style="font-size:13px;color:#6b6690;line-height:1.7;margin:0 0 8px;">
          &#10003; Honest verdicts &mdash; buy, pass, or conditional
        </p>
        <p style="font-size:13px;color:#6b6690;line-height:1.7;margin:0;">
          &#10003; Full archive at the Deal Desk on Dealsletter.io
        </p>
      </div>

      <!-- CTA -->
      <a href="https://dealsletter.io/v2/deal-breakdown" style="display:inline-block;background:#6366F1;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;margin:0 0 32px;">
        Browse Past Issues &rarr;
      </a>

      <!-- Analyze CTA -->
      <div style="background:#f0eeff;border:1px solid #d4d0ff;border-radius:10px;padding:20px 24px;margin:0 0 32px;">
        <p style="font-size:14px;font-weight:700;color:#1a1830;margin:0 0 8px;">
          Want to analyze your own deals?
        </p>
        <p style="font-size:13px;color:#6b6690;line-height:1.7;margin:0 0 14px;">
          Dealsletter analyzes any property in 30 seconds. 3 free analyses/month, no card needed.
        </p>
        <a href="https://dealsletter.io/v2/analyze" style="color:#6366F1;font-size:13px;font-weight:600;text-decoration:none;">
          Try it free &rarr;
        </a>
      </div>

      <p style="font-size:14px;color:#4a4869;line-height:1.7;margin:0;">
        &mdash; Kevin, Dealsletter
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#1a1830;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
      <p style="font-size:12px;color:#6b6690;margin:0 0 12px;">
        &copy; 2026 Dealsletter &middot; Not financial advice.
      </p>
      <a href="https://x.com/Dealsletter" style="color:#9994b8;font-size:12px;text-decoration:none;margin:0 8px;">
        Follow on X
      </a>
      <span style="color:#3a3758;font-size:12px;">&middot;</span>
      <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#9994b8;font-size:12px;text-decoration:none;margin:0 8px;">
        Unsubscribe
      </a>
    </div>
  </div>
</body>
</html>`,
      })
    } catch (emailErr) {
      // Non-blocking — don't fail the subscribe if email fails
      console.error('Newsletter welcome email error:', emailErr)
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
