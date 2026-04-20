import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const TO_EMAIL = 'main@dealsletter.io'
const FROM_EMAIL = 'Dealsletter <main@dealsletter.io>'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('Contact: RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Contact service not configured' },
        { status: 503 }
      )
    }
    const resend = new Resend(apiKey)

    const body = await request.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body?.message === 'string' ? body.message.trim() : ''

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      )
    }

    const subjectLine = `[Dealsletter Contact] ${subject || 'General Inquiry'}`
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject || 'General Inquiry'}`,
      '',
      'Message:',
      message,
    ].join('\n')

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: subjectLine,
      text,
    })

    if (error) {
      console.error('Contact: Resend send error:', error)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact: unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
