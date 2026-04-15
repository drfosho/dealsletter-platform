import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { Resend } from 'resend'
import { render } from '@react-email/render'
import { createElement } from 'react'

const resend = new Resend(process.env.RESEND_API_KEY_NEWSLETTER)

const AUDIENCE_ID = '88867a45-ed26-4522-9147-d1008ee57566'

const EMAIL_CONTENT = {
  subject: 'Big updates from Dealsletter',
  previewText:
    'The newsletter isn\'t going anywhere — plus V2 just launched.',
  greeting: 'Hey,',
  sections: [
    {
      type: 'text' as const,
      content: 'Kevin here, founder of Dealsletter. Just wanted to shoot you a quick email with some updates straight from me.',
    },
    {
      type: 'text' as const,
      content: 'First things first: the newsletter isn\'t going anywhere. It\'s our bread and butter. What Dealsletter was founded on. We\'re not touching that.',
    },
    {
      type: 'stats' as const,
      stats: [
        { value: '2,200+', label: 'Subscribers' },
        { value: '150+', label: 'Issues' },
        { value: 'Above avg', label: 'Open Rate' },
      ],
    },
    {
      type: 'text' as const,
      content: 'What is changing is where it lives. Past issues now live at the Deal Desk on Dealsletter.io — your new home for every deal breakdown we\'ve ever published.',
    },
    {
      type: 'text' as const,
      content: 'The newsletter itself is getting tighter too. Shorter, straight to the point, links to the properties. If you want the full breakdown on a deal, head to the Deal Desk and it\'s all there waiting for you.',
    },
    {
      type: 'text' as const,
      content: 'No action needed on your end. All subscribers carry over automatically. And if you ever want out, no hard feelings. Just hit the unsubscribe link at the bottom.',
    },
    {
      type: 'divider' as const,
      label: 'The big news',
    },
    {
      type: 'highlight' as const,
      label: 'Now live',
      content: 'Dealsletter V2 just launched — the biggest thing we\'ve built yet. I\'ve been using it myself to underwrite real estate deals and honestly I\'m blown away by how far this thing has come. If you\'ve been on the fence about trying it, now is the time.',
    },
    {
      type: 'text' as const,
      content: 'Free to try. Just go to Dealsletter.io, drop in a property address, and see what it does. Free trials available on both paid tiers if you want to go deeper.',
    },
    {
      type: 'divider' as const,
      label: 'What\'s next',
    },
    {
      type: 'text' as const,
      content: 'Big updates are already in the works. I\'ll be sending out a full roadmap email in the coming weeks so you know exactly where we\'re headed.',
    },
    {
      type: 'text' as const,
      content: 'As always, I\'m not here to spam you. Only showing up when there\'s something worth saying. Thanks for being part of this.',
    },
  ],
  ctaText: 'Try Dealsletter free →',
  ctaUrl: 'https://dealsletter.io',
  signoff: 'Kevin',
}

async function sendFounderEmail() {
  const { default: FounderTemplate } = await import(
    '../src/emails/templates/FounderTemplate'
  )

  const html = await render(
    createElement(FounderTemplate, EMAIL_CONTENT)
  )

  const { data, error } = await resend.broadcasts.create({
    audienceId: AUDIENCE_ID,
    from: 'Dealsletter <main@dealsletter.io>',
    replyTo: 'kevin@dealsletter.io',
    subject: EMAIL_CONTENT.subject,
    html,
  })

  if (error) {
    console.error('Send failed:', error)
    process.exit(1)
  }

  console.log(`✅ Broadcast created: ${data?.id}`)
  console.log('Review at: https://resend.com/broadcasts')
}

sendFounderEmail()
