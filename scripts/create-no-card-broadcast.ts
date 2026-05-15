import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.error('RESEND_API_KEY is required')
  process.exit(1)
}

const resend = new Resend(apiKey)

const AUDIENCE_ID = '88867a45-ed26-4522-9147-d1008ee57566'
const BROADCAST_NAME = 'No Card Trial Announcement'
const FROM = 'Kevin <main@dealsletter.io>'
const REPLY_TO = 'kevin@dealsletter.io'
const SUBJECT = 'no credit card needed anymore'

const html = `
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
  <div style="display:none; max-height:0; overflow:hidden; font-size:0; line-height:0; color:transparent;">
    7 days free, no card needed, cancel anytime.
  </div>

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
              <p style="
                font-size: 16px;
                color: #f0eeff;
                line-height: 1.7;
                margin: 0 0 16px;
              ">
                hey,
              </p>

              <p style="
                font-size: 15px;
                color: #6b6690;
                line-height: 1.7;
                margin: 0 0 16px;
              ">
                quick update from me directly.
              </p>

              <p style="
                font-size: 15px;
                color: #6b6690;
                line-height: 1.7;
                margin: 0 0 16px;
              ">
                just removed the credit card requirement from the Pro and Pro Max free trials.
              </p>

              <p style="
                font-size: 15px;
                color: #f0eeff;
                font-weight: 600;
                line-height: 1.7;
                margin: 0 0 16px;
              ">
                7 days free, no card needed, cancel anytime.
              </p>

              <p style="
                font-size: 15px;
                color: #6b6690;
                line-height: 1.7;
                margin: 0 0 28px;
              ">
                if you've been on the fence about trying the full version, that was probably the reason.
              </p>

              <div style="margin: 0 0 28px;">
                <a href="https://dealsletter.io" style="
                  display: inline-block;
                  background: #534AB7;
                  color: #f0eeff;
                  text-decoration: none;
                  padding: 13px 28px;
                  border-radius: 10px;
                  font-size: 15px;
                  font-weight: 600;
                  letter-spacing: -0.2px;
                ">
                  Try it free &rarr;
                </a>
              </div>

              <div style="
                height: 1px;
                background: rgba(127,119,221,0.15);
                margin: 28px 0;
              "></div>

              <p style="
                font-size: 14px;
                color: #e8e6f0;
                line-height: 1.7;
                margin: 0;
              ">
                - Kevin<br/>
                <span style="font-size: 13px; color: #6b6690;">Founder, Dealsletter</span>
              </p>
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

async function createBroadcast() {
  const { data, error } = await resend.broadcasts.create({
    audienceId: AUDIENCE_ID,
    name: BROADCAST_NAME,
    from: FROM,
    replyTo: REPLY_TO,
    subject: SUBJECT,
    html,
  })

  if (error) {
    console.error('Broadcast create failed:', error)
    process.exit(1)
  }

  console.log(`Broadcast draft created: ${data?.id}`)
  console.log('Review and send manually at: https://resend.com/broadcasts')
}

createBroadcast()
