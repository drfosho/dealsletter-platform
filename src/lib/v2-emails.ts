import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = 'Dealsletter <noreply@dealsletter.io>'

// Base email wrapper — dark theme matching V2 design
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dealsletter</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #0d0d14;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
">
  <table width="100%" cellpadding="0" cellspacing="0" style="
    background-color: #0d0d14;
    padding: 40px 20px;
  ">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="
          max-width: 560px;
          width: 100%;
        ">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 32px;">
              <div style="margin-bottom: 24px;">
                <img
                  src="https://dealsletter.io/logos/wordmark-transparent.png"
                  alt="Dealsletter"
                  style="height: 36px; width: auto;"
                />
              </div>
            </td>
          </tr>

          <!-- Content card -->
          <tr>
            <td style="
              background: #13121d;
              border: 1px solid rgba(127,119,221,0.2);
              border-radius: 16px;
              padding: 40px 40px;
            ">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding-top: 32px;
              text-align: center;
            ">
              <p style="
                font-size: 12px;
                color: #3a3758;
                line-height: 1.6;
                margin: 0;
              ">
                Dealsletter &middot; AI-powered real estate investment analysis<br/>
                <a href="https://dealsletter.io/v2/privacy" style="color: #534AB7;">Privacy Policy</a>
                &middot;
                <a href="https://dealsletter.io/v2/terms" style="color: #534AB7;">Terms of Service</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// Button component
const emailButton = (text: string, url: string, color = '#534AB7') => `
<a href="${url}" style="
  display: inline-block;
  background: ${color};
  color: #f0eeff;
  text-decoration: none;
  padding: 13px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.2px;
">
  ${text}
</a>
`

// Divider
const divider = `
<div style="
  height: 1px;
  background: rgba(127,119,221,0.15);
  margin: 28px 0;
"></div>
`

// --- EMAIL 1: Confirm email address ---

export const getConfirmEmailTemplate = (
  confirmUrl: string,
  firstName?: string
) => ({
  subject: 'Confirm your Dealsletter account',
  html: emailWrapper(`
    <h1 style="
      font-size: 24px;
      font-weight: 700;
      color: #f0eeff;
      letter-spacing: -0.5px;
      margin: 0 0 8px;
    ">
      Confirm your email address
    </h1>

    <p style="
      font-size: 15px;
      color: #6b6690;
      line-height: 1.7;
      margin: 0 0 28px;
    ">
      ${firstName ? `Hey ${firstName}, ` : ''}click the button below to verify your email and activate your Dealsletter account.
    </p>

    <div style="margin-bottom: 28px;">
      ${emailButton('Confirm email address &rarr;', confirmUrl)}
    </div>

    ${divider}

    <p style="
      font-size: 13px;
      color: #3a3758;
      line-height: 1.6;
      margin: 0;
    ">
      If you didn't create a Dealsletter account, you can safely ignore this email. This link expires in 24 hours.
    </p>
  `)
})

// --- EMAIL 2: Welcome email ---

export const getWelcomeEmailTemplate = (firstName?: string) => ({
  subject: 'Welcome to Dealsletter',
  html: emailWrapper(`
    <h1 style="
      font-size: 24px;
      font-weight: 700;
      color: #f0eeff;
      letter-spacing: -0.5px;
      margin: 0 0 8px;
    ">
      Welcome to Dealsletter
    </h1>

    <p style="
      font-size: 15px;
      color: #6b6690;
      line-height: 1.7;
      margin: 0 0 24px;
    ">
      ${firstName ? `Hey ${firstName} &mdash; ` : ''}your account is confirmed and you're ready to start analyzing deals.
    </p>

    <div style="
      background: rgba(83,74,183,0.08);
      border: 1px solid rgba(127,119,221,0.2);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 28px;
    ">
      <p style="
        font-size: 14px;
        font-weight: 600;
        color: #e8e6f0;
        margin: 0 0 12px;
      ">
        What you get on the free plan:
      </p>
      ${[
        'Unlimited property analyses',
        'All 4 investment strategies',
        'Key financial metrics &mdash; cap rate, cash flow, ROI',
        'Risk flags on every deal',
      ].map(item => `
        <div style="
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        ">
          <span style="color: #1D9E75; font-size: 14px;">&#10003;</span>
          <span style="font-size: 14px; color: #6b6690;">${item}</span>
        </div>
      `).join('')}
    </div>

    <div style="margin-bottom: 28px;">
      ${emailButton('Analyze your first deal &rarr;', 'https://dealsletter.io/v2/dashboard')}
    </div>

    ${divider}

    <p style="
      font-size: 13px;
      color: #3a3758;
      line-height: 1.6;
      margin: 0;
    ">
      Questions? Reply to this email or reach us at
      <a href="mailto:support@dealsletter.io" style="color: #534AB7;">support@dealsletter.io</a>
    </p>
  `)
})

// --- EMAIL 3: Pro welcome ---

export const getProWelcomeTemplate = (
  firstName?: string,
  billingPeriod = 'monthly'
) => ({
  subject: 'Welcome to Dealsletter Pro',
  html: emailWrapper(`
    <div style="
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(83,74,183,0.15);
      border: 1px solid rgba(127,119,221,0.3);
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 12px;
      color: #9994b8;
      margin-bottom: 20px;
    ">
      &#10003; Pro plan activated
    </div>

    <h1 style="
      font-size: 24px;
      font-weight: 700;
      color: #f0eeff;
      letter-spacing: -0.5px;
      margin: 0 0 8px;
    ">
      Welcome to Dealsletter Pro
    </h1>

    <p style="
      font-size: 15px;
      color: #6b6690;
      line-height: 1.7;
      margin: 0 0 24px;
    ">
      ${firstName ? `Hey ${firstName} &mdash; ` : ''}your Pro subscription is active. You now have access to the Balanced AI model with full analysis results on every deal.
    </p>

    <div style="
      background: rgba(83,74,183,0.08);
      border: 1px solid rgba(127,119,221,0.2);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 28px;
    ">
      <p style="
        font-size: 14px;
        font-weight: 600;
        color: #e8e6f0;
        margin: 0 0 12px;
      ">
        What's unlocked on Pro:
      </p>
      ${[
        'Full AI analysis &mdash; no blur',
        'Balanced model &mdash; Claude Sonnet &amp; GPT-4.1 auto-routed by strategy',
        'PDF &amp; Excel export',
        'Saved analysis history',
        'Unlimited analyses',
      ].map(item => `
        <div style="
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 8px;
        ">
          <span style="color: #1D9E75; font-size: 14px; margin-top: 1px;">&#10003;</span>
          <span style="font-size: 14px; color: #6b6690; line-height: 1.5;">${item}</span>
        </div>
      `).join('')}
    </div>

    <div style="margin-bottom: 28px;">
      ${emailButton('Start analyzing deals &rarr;', 'https://dealsletter.io/v2/dashboard')}
    </div>

    ${divider}

    <p style="
      font-size: 13px;
      color: #3a3758;
      line-height: 1.6;
      margin: 0;
    ">
      Billed ${billingPeriod}. Manage your subscription anytime at
      <a href="https://dealsletter.io/v2/account" style="color: #534AB7;">dealsletter.io/v2/account</a>
    </p>
  `)
})

// --- EMAIL 4: Pro Max welcome ---

export const getProMaxWelcomeTemplate = (
  firstName?: string,
  billingPeriod = 'monthly'
) => ({
  subject: 'Welcome to Dealsletter Pro Max',
  html: emailWrapper(`
    <div style="
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(239,159,39,0.12);
      border: 1px solid rgba(239,159,39,0.3);
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 12px;
      color: #EF9F27;
      margin-bottom: 20px;
    ">
      &#10003; Pro Max activated
    </div>

    <h1 style="
      font-size: 24px;
      font-weight: 700;
      color: #f0eeff;
      letter-spacing: -0.5px;
      margin: 0 0 8px;
    ">
      Welcome to Dealsletter Pro Max
    </h1>

    <p style="
      font-size: 15px;
      color: #6b6690;
      line-height: 1.7;
      margin: 0 0 24px;
    ">
      ${firstName ? `Hey ${firstName} &mdash; ` : ''}you now have access to the most powerful real estate analysis available. Three AI models run simultaneously on every deal.
    </p>

    <div style="
      background: rgba(239,159,39,0.06);
      border: 1px solid rgba(239,159,39,0.2);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 28px;
    ">
      <p style="
        font-size: 14px;
        font-weight: 600;
        color: #e8e6f0;
        margin: 0 0 12px;
      ">
        Your Max IQ model lineup:
      </p>
      ${[
        ['Claude Opus 4.6', 'Risk Analyst &mdash; conservative downside case'],
        ['GPT-4o', 'Deal Sponsor &mdash; investment thesis &amp; upside case'],
        ['Grok 3', 'Quant Model &mdash; verifies math &amp; runs sensitivity analysis'],
      ].map(([model, role]) => `
        <div style="margin-bottom: 12px;">
          <div style="
            font-size: 13px;
            font-weight: 600;
            color: #9994b8;
            margin-bottom: 2px;
          ">${model}</div>
          <div style="
            font-size: 13px;
            color: #4e4a6a;
          ">${role}</div>
        </div>
      `).join('')}
    </div>

    <div style="margin-bottom: 28px;">
      ${emailButton('Run your first Max IQ analysis &rarr;', 'https://dealsletter.io/v2/dashboard', '#EF9F27')}
    </div>

    ${divider}

    <p style="
      font-size: 13px;
      color: #3a3758;
      line-height: 1.6;
      margin: 0;
    ">
      Billed ${billingPeriod}. Manage your subscription at
      <a href="https://dealsletter.io/v2/account" style="color: #534AB7;">dealsletter.io/v2/account</a>
    </p>
  `)
})

// --- EMAIL 5: Cancellation ---

export const getCancellationEmailTemplate = (
  firstName?: string,
  periodEnd?: string
) => ({
  subject: 'Your Dealsletter subscription has been cancelled',
  html: emailWrapper(`
    <h1 style="
      font-size: 24px;
      font-weight: 700;
      color: #f0eeff;
      letter-spacing: -0.5px;
      margin: 0 0 8px;
    ">
      Subscription cancelled
    </h1>

    <p style="
      font-size: 15px;
      color: #6b6690;
      line-height: 1.7;
      margin: 0 0 24px;
    ">
      ${firstName ? `Hey ${firstName} &mdash; ` : ''}your subscription has been cancelled.${periodEnd ? ` You'll have full access until ${periodEnd}.` : ''} After that you'll move to the free plan.
    </p>

    <div style="
      background: rgba(83,74,183,0.06);
      border: 1px solid rgba(127,119,221,0.15);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 28px;
    ">
      <p style="
        font-size: 14px;
        color: #6b6690;
        line-height: 1.6;
        margin: 0;
      ">
        Your analysis history and account data are saved. You can resubscribe anytime and pick up right where you left off.
      </p>
    </div>

    <div style="margin-bottom: 28px;">
      ${emailButton('Resubscribe &rarr;', 'https://dealsletter.io/v2/pricing')}
    </div>

    ${divider}

    <p style="
      font-size: 13px;
      color: #3a3758;
      line-height: 1.6;
      margin: 0;
    ">
      Changed your mind? You can resubscribe at any time at
      <a href="https://dealsletter.io/v2/pricing" style="color: #534AB7;">dealsletter.io/v2/pricing</a>.<br/><br/>
      If you have any questions reach us at
      <a href="mailto:support@dealsletter.io" style="color: #534AB7;">support@dealsletter.io</a>
    </p>
  `)
})

// --- Send functions ---

async function send(
  to: string,
  subject: string,
  html: string,
  options?: { from?: string; replyTo?: string }
): Promise<boolean> {
  if (!resend) {
    console.warn('[V2 Email] Resend not configured — RESEND_API_KEY missing. Skipping email.')
    return false
  }
  try {
    const { error } = await resend.emails.send({
      from: options?.from ?? FROM_EMAIL,
      to,
      subject,
      html,
      ...(options?.replyTo ? { replyTo: options.replyTo } : {}),
    })
    if (error) {
      console.error(`[V2 Email] Send failed (${subject}):`, error)
      return false
    }
    console.log(`[V2 Email] Sent "${subject}" to ${to}`)
    return true
  } catch (err) {
    console.error(`[V2 Email] Error (${subject}):`, err)
    return false
  }
}

export async function sendV2WelcomeEmail(
  email: string,
  firstName?: string
) {
  const template = getWelcomeEmailTemplate(firstName)
  return send(email, template.subject, template.html)
}

export async function sendProWelcomeEmail(
  email: string,
  firstName?: string,
  billingPeriod?: string
) {
  const template = getProWelcomeTemplate(firstName, billingPeriod)
  return send(email, template.subject, template.html)
}

export async function sendProMaxWelcomeEmail(
  email: string,
  firstName?: string,
  billingPeriod?: string
) {
  const template = getProMaxWelcomeTemplate(firstName, billingPeriod)
  return send(email, template.subject, template.html)
}

export async function sendV2CancellationEmail(
  email: string,
  firstName?: string,
  periodEnd?: string
) {
  const template = getCancellationEmailTemplate(firstName, periodEnd)
  return send(email, template.subject, template.html)
}

// --- EMAIL 5b: Cancellation complete (subscription has ended) ---

export const getCancellationCompleteEmailTemplate = (firstName?: string) => ({
  subject: 'Your Dealsletter subscription has ended',
  html: emailWrapper(`
    <h1 style="
      font-size: 24px;
      font-weight: 700;
      color: #f0eeff;
      letter-spacing: -0.5px;
      margin: 0 0 8px;
    ">
      Subscription ended
    </h1>

    <p style="
      font-size: 15px;
      color: #6b6690;
      line-height: 1.7;
      margin: 0 0 24px;
    ">
      ${firstName ? `Hey ${firstName} &mdash; ` : ''}your Dealsletter subscription has ended and your account has moved to the free plan.
    </p>

    <div style="
      background: rgba(83,74,183,0.06);
      border: 1px solid rgba(127,119,221,0.15);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 28px;
    ">
      <p style="
        font-size: 14px;
        color: #6b6690;
        line-height: 1.6;
        margin: 0;
      ">
        Your analysis history and account data are saved. You can resubscribe anytime and pick up right where you left off.
      </p>
    </div>

    <div style="margin-bottom: 28px;">
      ${emailButton('Resubscribe &rarr;', 'https://dealsletter.io/v2/pricing')}
    </div>

    ${divider}

    <p style="
      font-size: 13px;
      color: #3a3758;
      line-height: 1.6;
      margin: 0;
    ">
      Questions? Reach us at
      <a href="mailto:support@dealsletter.io" style="color: #534AB7;">support@dealsletter.io</a>
    </p>
  `)
})

export async function sendV2CancellationCompleteEmail(
  email: string,
  firstName?: string
) {
  const template = getCancellationCompleteEmailTemplate(firstName)
  return send(email, template.subject, template.html)
}

// --- EMAIL 6: Re-engagement ---

const REENGAGEMENT_IMG_BASE =
  'https://xsiflgnnowyvkhxjwmuu.supabase.co/storage/v1/object/public/email-assets'

const REENGAGEMENT_IMG_HERO = `${REENGAGEMENT_IMG_BASE}/email-img-1-hero.png`
const REENGAGEMENT_IMG_ANALYSIS = `${REENGAGEMENT_IMG_BASE}/email-img-2-analysis.png`
const REENGAGEMENT_IMG_MAXIQ = `${REENGAGEMENT_IMG_BASE}/email-img-3-maxiq.png`

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const getReengagementEmailTemplate = (firstName?: string) => {
  const name = firstName ? escapeHtml(firstName) : 'there'
  return {
    subject: "you haven't run one yet",
    html: emailWrapper(`
      <div style="display:none; max-height:0; overflow:hidden; font-size:0; line-height:0; color:transparent;">
        takes 30 seconds. drop in any address and see what comes back.
      </div>

      <p style="
        font-size: 16px;
        color: #f0eeff;
        line-height: 1.7;
        margin: 0 0 16px;
      ">
        Hey ${name},
      </p>

      <p style="
        font-size: 15px;
        color: #6b6690;
        line-height: 1.7;
        margin: 0 0 8px;
      ">
        noticed you signed up for Dealsletter but haven't run an analysis yet.
      </p>

      <p style="
        font-size: 15px;
        color: #6b6690;
        line-height: 1.7;
        margin: 0 0 24px;
      ">
        wanted to make sure you didn't get lost.
      </p>

      <div style="margin: 0 0 28px;">
        <img
          src="${REENGAGEMENT_IMG_HERO}"
          alt=""
          style="display:block; width:100%; max-width:600px; height:auto; border-radius:12px;"
        />
      </div>

      <p style="
        font-size: 15px;
        color: #6b6690;
        line-height: 1.7;
        margin: 0 0 24px;
      ">
        it's pretty simple. drop any property address into the analyzer, pick your strategy: BRRRR, Fix and Flip, Buy and Hold, or House Hack, and you'll get a full breakdown in under 30 seconds.
      </p>

      <div style="margin: 0 0 28px;">
        <img
          src="${REENGAGEMENT_IMG_ANALYSIS}"
          alt=""
          style="display:block; width:100%; max-width:600px; height:auto; border-radius:12px;"
        />
      </div>

      <p style="
        font-size: 15px;
        color: #6b6690;
        line-height: 1.7;
        margin: 0 0 16px;
      ">
        cap rate, cash flow, ROI, risk flags, the whole thing.
      </p>

      <p style="
        font-size: 15px;
        color: #6b6690;
        line-height: 1.7;
        margin: 0 0 16px;
      ">
        you've got 3 free analyses on your account right now. no card needed.
      </p>

      <p style="
        font-size: 15px;
        color: #6b6690;
        line-height: 1.7;
        margin: 0 0 24px;
      ">
        if you've got a deal you're looking at, run it. if not, grab any active listing off Zillow and see what comes back. takes 30 seconds and you'll get a feel for what the platform actually does.
      </p>

      <div style="margin: 0 0 28px;">
        <img
          src="${REENGAGEMENT_IMG_MAXIQ}"
          alt=""
          style="display:block; width:100%; max-width:600px; height:auto; border-radius:12px;"
        />
      </div>

      <div style="margin: 0 0 28px;">
        <a href="https://dealsletter.io/v2/analyze" style="
          font-size: 16px;
          font-weight: 600;
          color: #9994b8;
          text-decoration: none;
        ">
          &rarr; Run your first analysis at dealsletter.io
        </a>
      </div>

      ${divider}

      <p style="
        font-size: 14px;
        color: #6b6690;
        line-height: 1.7;
        margin: 0 0 16px;
      ">
        any questions just hit reply. i read everything.
      </p>

      <p style="
        font-size: 14px;
        color: #e8e6f0;
        line-height: 1.7;
        margin: 0;
      ">
        - Kevin<br/>
        <span style="font-size: 13px; color: #6b6690;">Founder, Dealsletter</span>
      </p>
    `),
  }
}

export async function sendReengagementEmail(
  email: string,
  firstName?: string
) {
  const template = getReengagementEmailTemplate(firstName)
  return send(email, template.subject, template.html, {
    from: 'Dealsletter <main@dealsletter.io>',
    replyTo: 'kevin@dealsletter.io',
  })
}

// -------------------------------------------------------------------
// MANUAL STEP: Update Supabase email templates
// -------------------------------------------------------------------
//
// Go to Supabase dashboard → Authentication → Email Templates
//
// Update the "Confirm signup" template:
//
// Subject: Confirm your Dealsletter account
//
// Body (HTML):
//
// <!DOCTYPE html>
// <html>
// <body style="
//   background: #0d0d14;
//   font-family: -apple-system, sans-serif;
//   margin: 0;
//   padding: 40px 20px;
// ">
//   <div style="
//     max-width: 480px;
//     margin: 0 auto;
//     background: #13121d;
//     border: 1px solid rgba(127,119,221,0.2);
//     border-radius: 16px;
//     padding: 40px;
//   ">
//     <div style="
//       font-size: 20px;
//       font-weight: 600;
//       color: #f0eeff;
//       margin-bottom: 20px;
//     ">
//       Dealsletter
//     </div>
//
//     <h1 style="
//       font-size: 22px;
//       font-weight: 700;
//       color: #f0eeff;
//       margin: 0 0 12px;
//     ">
//       Confirm your email
//     </h1>
//
//     <p style="
//       font-size: 15px;
//       color: #6b6690;
//       line-height: 1.7;
//       margin: 0 0 28px;
//     ">
//       Click the button below to verify your email address
//       and activate your Dealsletter account.
//     </p>
//
//     <a href="{{ .ConfirmationURL }}"
//       style="
//         display: inline-block;
//         background: #534AB7;
//         color: #f0eeff;
//         text-decoration: none;
//         padding: 13px 28px;
//         border-radius: 10px;
//         font-size: 15px;
//         font-weight: 600;
//         margin-bottom: 28px;
//       ">
//       Confirm email address &rarr;
//     </a>
//
//     <p style="
//       font-size: 13px;
//       color: #3a3758;
//       line-height: 1.6;
//       margin: 0;
//     ">
//       If you didn't create a Dealsletter account,
//       ignore this email. This link expires in 24 hours.
//     </p>
//   </div>
// </body>
// </html>
