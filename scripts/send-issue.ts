import 'dotenv/config'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createElement } from 'react'
import {
  dealBreakdownIssues,
} from '../src/data/deal-breakdown-issues'

const resend = new Resend(process.env.RESEND_API_KEY)

const AUDIENCE_ID =
  process.env.RESEND_AUDIENCE_ID ||
  '88867a45-ed26-4522-9147-d1008ee57566'

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  'kevin@dealsletter.io'

async function sendIssue(slugOrNumber: string) {
  // Find issue by number or slug
  const issue = dealBreakdownIssues.find(
    i =>
      i.slug === slugOrNumber ||
      i.issueNumber.toString() === slugOrNumber
  )

  if (!issue) {
    console.error(`Issue not found: ${slugOrNumber}`)
    console.log(
      'Available issues:',
      dealBreakdownIssues.map(i => `${i.issueNumber}: ${i.slug}`)
    )
    process.exit(1)
  }

  console.log(`Preparing Issue #${issue.issueNumber}: ${issue.title}`)

  // Dynamically import template
  const { default: IssueTemplate } = await import(
    '../src/emails/templates/IssueTemplate'
  )

  // Render to HTML
  const html = await render(
    createElement(IssueTemplate, { issue })
  )

  console.log('HTML rendered successfully')
  console.log(`Sending to audience: ${AUDIENCE_ID}`)

  // Send via Resend Broadcasts
  const { data, error } = await resend.broadcasts.create({
    audienceId: AUDIENCE_ID,
    from: FROM_EMAIL,
    subject: `[PRO] #${issue.issueNumber}: ${issue.title}`,
    html,
  })

  if (error) {
    console.error('Send failed:', error)
    process.exit(1)
  }

  console.log(`✅ Broadcast created: ${data?.id}`)
  console.log(`Issue #${issue.issueNumber} scheduled.`)
  console.log(
    `Go to Resend Broadcasts to review and send: https://resend.com/broadcasts`
  )
}

// Get issue identifier from CLI args
const identifier = process.argv[2]
if (!identifier) {
  console.error(
    'Usage: npx ts-node scripts/send-issue.ts <issue-number-or-slug>'
  )
  console.error('Example: npx ts-node scripts/send-issue.ts 150')
  process.exit(1)
}

sendIssue(identifier)
