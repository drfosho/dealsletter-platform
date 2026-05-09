import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Dealsletter <noreply@dealsletter.io>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dealsletter.io';

// ─── Shared email layout ─────────────────────────────────────────────
// Dark background (#0a0a0a), purple accent (#7c3aed), white body text
function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <a href="${APP_URL}" style="text-decoration:none;">
            <img src="${APP_URL}/logos/websiteMainLogo.png" alt="Dealsletter" height="40" style="height:40px;width:auto;" />
          </a>
        </td></tr>
        <!-- Card -->
        <tr><td style="background-color:#141418;border:1px solid #2a2a3a;border-radius:16px;padding:40px 32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding-top:32px;text-align:center;">
          <p style="color:#6b7280;font-size:13px;line-height:20px;margin:0;">
            <a href="${APP_URL}/v2/account" style="color:#6b7280;text-decoration:underline;">Manage Subscription</a>
            &nbsp;&bull;&nbsp;
            <a href="mailto:support@dealsletter.io" style="color:#6b7280;text-decoration:underline;">Contact Support</a>
            &nbsp;&bull;&nbsp;
            <a href="${APP_URL}" style="color:#6b7280;text-decoration:underline;">dealsletter.io</a>
          </p>
          <p style="color:#4b5563;font-size:12px;margin:16px 0 0;">
            &copy; ${new Date().getFullYear()} Dealsletter &bull; Real estate investment analysis
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// CTA button component
function ctaButton(text: string, href: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0 8px;">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#ffffff;font-weight:600;font-size:16px;padding:14px 32px;border-radius:10px;text-decoration:none;">
      ${text}
    </a>
  </td></tr></table>`;
}

// Info card component
function infoCard(label: string, lines: string[]): string {
  const linesHtml = lines.map(l =>
    `<p style="color:#9ca3af;font-size:14px;margin:0 0 4px;">${l}</p>`
  ).join('');
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f14;border:1px solid #2a2a3a;border-radius:12px;margin-bottom:24px;">
    <tr><td style="padding:20px 24px;">
      <p style="color:#a78bfa;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">${label}</p>
      ${linesHtml}
    </td></tr>
  </table>`;
}

// Helper to safely send via Resend
async function send(to: string, subject: string, html: string): Promise<boolean> {
  if (!resend) {
    console.warn('[Email] Resend not configured — RESEND_API_KEY missing. Skipping email.');
    return false;
  }
  try {
    const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) {
      console.error(`[Email] Send failed (${subject}):`, error);
      return false;
    }
    console.log(`[Email] Sent "${subject}" to ${to}`);
    return true;
  } catch (err) {
    console.error(`[Email] Error (${subject}):`, err);
    return false;
  }
}


// ─── 1. Welcome email (free signup) ──────────────────────────────────

export async function sendWelcomeEmail(data: { email: string; name?: string; subscribedNewsletter?: boolean }): Promise<boolean> {
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,';

  const content = `
    <p style="font-size:16px;color:#9994b8;line-height:1.7;margin:0 0 24px;">
      ${greeting}
    </p>

    <p style="font-size:16px;color:#9994b8;line-height:1.7;margin:0 0 24px;">
      Your Dealsletter account is live. Enter any property address and get a full investment analysis &mdash; cash flow, cap rate, ROI, risk flags, and AI narrative &mdash; in under 30 seconds.
    </p>

    <p style="font-size:16px;color:#9994b8;line-height:1.7;margin:0 0 32px;">
      No spreadsheet. No guesswork. Just the numbers.
    </p>

    ${infoCard('YOUR FREE PLAN', [
      '3 analyses per month &mdash; resets on the 1st',
      'All 4 strategies: BRRRR, Fix &amp; Flip, Buy &amp; Hold, House Hack',
      'Live market data &amp; rent comps via RentCast',
      'Key financial metrics: cash flow, cap rate, ROI',
      'No credit card required &mdash; ever',
    ])}

    ${data.subscribedNewsletter ? `
      <div style="margin:0 0 32px;padding:20px 24px;background:rgba(29,158,117,0.06);border:0.5px solid rgba(29,158,117,0.2);border-radius:12px;">
        <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#1D9E75;text-transform:uppercase;margin:0 0 10px;">
          &#10003; Deal Desk Newsletter
        </p>
        <p style="font-size:14px;color:#9994b8;line-height:1.7;margin:0;">
          You're subscribed to the weekly Deal Desk &mdash; real properties, real numbers, honest verdicts. Every issue breaks down 3-4 deals with full underwriting and AI-powered analysis.
          <br/><br/>
          <a href="https://dealsletter.io/v2/deal-breakdown" style="color:#1D9E75;font-weight:600;text-decoration:none;">
            View past issues \u2192
          </a>
        </p>
      </div>
    ` : ''}

    ${ctaButton('Analyze Your First Deal \u2192', 'https://dealsletter.io/v2/analyze')}

    <div style="margin:40px 0;padding:24px;background:rgba(99,102,241,0.06);border:0.5px solid rgba(99,102,241,0.2);border-radius:12px;">
      <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#6366F1;text-transform:uppercase;margin:0 0 16px;">
        WANT MORE?
      </p>

      <p style="font-size:15px;color:#9994b8;line-height:1.7;margin:0 0 16px;">
        <strong style="color:#f0eeff;">Pro &mdash; $29/month</strong><br/>
        Unlimited analyses. Auto-routes Claude Sonnet for BRRRR and Buy &amp; Hold, GPT-4.1 for Fix &amp; Flip and House Hack. Full AI narrative, saved history, PDF export. 7-day free trial.
      </p>

      <p style="font-size:15px;color:#9994b8;line-height:1.7;margin:0 0 20px;">
        <strong style="color:#f0eeff;">Pro Max &mdash; $79/month</strong><br/>
        Runs Claude Opus, GPT-4o, and Grok 3 simultaneously on every deal. Three independent perspectives &mdash; The Skeptic, The Sponsor, The Quant &mdash; side by side. For investors who need to be certain before they move. 7-day free trial.
      </p>

      <a href="https://dealsletter.io/v2/pricing" style="display:inline-block;color:#6366F1;font-size:14px;font-weight:600;text-decoration:none;">
        Compare all plans \u2192
      </a>
    </div>

    <p style="font-size:14px;color:#4e4a6a;line-height:1.7;margin:32px 0 0;">
      Built by a real estate investor, for real estate investors. If you have questions or feedback reply to this email directly &mdash; I read every one.
      <br/><br/>
      &mdash; Kevin, Dealsletter
    </p>
  `;

  const html = emailLayout(content);

  return send(data.email, 'Welcome to Dealsletter \u2014 analyze your first deal free \ud83c\udfe0', html);
}


// ─── 2. Subscription confirmation (Pro / Pro Plus) ───────────────────

interface PlanEmailData {
  email: string;
  name?: string;
  tier: string;
  billingDate?: string;
}

export async function sendSubscriptionEmail(data: PlanEmailData): Promise<boolean> {
  const isPro = data.tier === 'pro';
  const planName = isPro ? 'Pro' : 'Pro Plus';
  const analysisLimit = isPro ? 50 : 200;
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,';

  const cardLines = [
    `<strong style="color:#e5e7eb;font-size:18px;">${planName}</strong>`,
    `<strong style="color:#e5e7eb;">${analysisLimit}</strong> property analyses per month`,
  ];
  if (data.billingDate) {
    cardLines.push(`Next billing date: <strong style="color:#e5e7eb;">${data.billingDate}</strong>`);
  }

  const html = emailLayout(`
    <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;text-align:center;">Welcome to ${planName}! 🎉</h1>
    <p style="color:#9ca3af;font-size:15px;text-align:center;margin:0 0 32px;">Your subscription is now active</p>

    <p style="color:#d1d5db;font-size:15px;line-height:24px;margin:0 0 24px;">${greeting}</p>
    <p style="color:#d1d5db;font-size:15px;line-height:24px;margin:0 0 24px;">
      Thank you for subscribing to Dealsletter <strong style="color:#a78bfa;">${planName}</strong>.
      You now have access to powerful property analysis tools to make smarter investment decisions.
    </p>

    ${infoCard('Your Plan', cardLines)}

    <p style="color:#d1d5db;font-size:15px;line-height:24px;margin:0 0 8px;">What you can do now:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr><td style="padding:6px 0;color:#d1d5db;font-size:14px;">&#10003; Analyze up to ${analysisLimit} properties per month</td></tr>
      <tr><td style="padding:6px 0;color:#d1d5db;font-size:14px;">&#10003; AI-powered investment insights</td></tr>
      <tr><td style="padding:6px 0;color:#d1d5db;font-size:14px;">&#10003; Export reports as PDF &amp; Excel</td></tr>
      <tr><td style="padding:6px 0;color:#d1d5db;font-size:14px;">&#10003; Analysis history &amp; comparison tools</td></tr>
      ${!isPro ? '<tr><td style="padding:6px 0;color:#d1d5db;font-size:14px;">&#10003; Advanced analytics &amp; custom reporting</td></tr>' : ''}
    </table>

    ${ctaButton('Start Analyzing Properties', `${APP_URL}/analysis`)}
  `);

  return send(data.email, `Welcome to Dealsletter ${planName}! 🎉`, html);
}


// ─── 3. Usage warning (80% of monthly limit) ────────────────────────

interface UsageWarningData {
  email: string;
  name?: string;
  used: number;
  limit: number;
  tier: string;
}

export async function sendUsageWarningEmail(data: UsageWarningData): Promise<boolean> {
  const remaining = Math.max(0, data.limit - data.used);
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,';
  const isFree = data.tier === 'free' || data.tier === 'basic' || data.tier === 'starter';
  const percent = data.limit > 0 ? Math.round((data.used / data.limit) * 100) : 100;

  const upgradeLine = isFree
    ? `<p style="color:#d1d5db;font-size:15px;line-height:24px;margin:24px 0 0;">
        Upgrade to <strong style="color:#a78bfa;">Pro</strong> for 50 analyses/month and never hit a limit again.
      </p>
      ${ctaButton('Upgrade to Pro', `${APP_URL}/pricing`)}`
    : ctaButton('View Your Usage', `${APP_URL}/analysis/history`);

  const html = emailLayout(`
    <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;text-align:center;">Usage Alert ⚠️</h1>
    <p style="color:#9ca3af;font-size:15px;text-align:center;margin:0 0 32px;">You've used ${percent}% of your monthly analyses</p>

    <p style="color:#d1d5db;font-size:15px;line-height:24px;margin:0 0 24px;">${greeting}</p>

    ${infoCard('Monthly Usage', [
      `Used: <strong style="color:#e5e7eb;">${data.used}</strong> of <strong style="color:#e5e7eb;">${data.limit}</strong> analyses`,
      `Remaining: <strong style="color:#fbbf24;">${remaining}</strong> analyses`,
      'Usage resets on the 1st of next month',
    ])}

    <!-- Progress bar -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="background-color:#1f1f2e;border-radius:8px;height:12px;padding:0;">
        <div style="background:linear-gradient(90deg,#7c3aed,${percent >= 90 ? '#ef4444' : '#f59e0b'});width:${Math.min(percent, 100)}%;height:12px;border-radius:8px;"></div>
      </td></tr>
    </table>

    ${upgradeLine}
  `);

  return send(data.email, `You've used ${percent}% of your monthly analyses`, html);
}


// ─── 4. Subscription cancellation confirmation ──────────────────────

interface CancellationData {
  email: string;
  name?: string;
  planName: string;
  accessUntil: string; // formatted date string
}

export async function sendCancellationEmail(data: CancellationData): Promise<boolean> {
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,';

  const html = emailLayout(`
    <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;text-align:center;">Subscription Canceled</h1>
    <p style="color:#9ca3af;font-size:15px;text-align:center;margin:0 0 32px;">We're sorry to see you go</p>

    <p style="color:#d1d5db;font-size:15px;line-height:24px;margin:0 0 24px;">${greeting}</p>
    <p style="color:#d1d5db;font-size:15px;line-height:24px;margin:0 0 24px;">
      Your <strong style="color:#a78bfa;">${data.planName}</strong> subscription has been canceled.
      You'll continue to have full ${data.planName} access until the end of your billing period.
    </p>

    ${infoCard('What Happens Next', [
      `<strong style="color:#e5e7eb;">${data.planName} access</strong> continues until <strong style="color:#e5e7eb;">${data.accessUntil}</strong>`,
      'After that, your account reverts to the Free plan (10 analyses/month)',
      'All your saved analyses remain accessible',
    ])}

    <p style="color:#d1d5db;font-size:15px;line-height:24px;margin:0 0 0;">
      Changed your mind? You can resume your subscription anytime before ${data.accessUntil}.
    </p>

    ${ctaButton('Resume Subscription', `${APP_URL}/account/subscription`)}

    <p style="color:#6b7280;font-size:13px;text-align:center;margin:16px 0 0;">
      Questions? Reach us at <a href="mailto:support@dealsletter.io" style="color:#a78bfa;text-decoration:underline;">support@dealsletter.io</a>
    </p>
  `);

  return send(data.email, 'Your Dealsletter subscription has been canceled', html);
}
