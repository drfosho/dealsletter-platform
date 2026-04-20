'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'

const SUBJECT_OPTIONS = [
  'General question',
  'Product support',
  'Billing issue',
  'Bug report',
  'Partnership or press',
  'Privacy or data request',
  'Other',
]

function EnvelopeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.1em',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--elevated)',
  border: '1px solid var(--hairline)',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 13,
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  transition: 'border-color 140ms ease',
  marginBottom: 16,
}

function ContactCard({
  icon,
  title,
  description,
  email,
}: {
  icon: React.ReactNode
  title: string
  description: string
  email: string
}) {
  return (
    <a
      href={`mailto:${email}`}
      style={{
        display: 'block',
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 14,
        padding: '22px 24px',
        marginBottom: 12,
        textDecoration: 'none',
        transition: 'border-color 200ms ease',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
    >
      <div style={{ marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 6 }}>
        {description}
      </div>
      <div style={{ fontSize: 13, color: 'var(--indigo-hover)', fontWeight: 500, marginTop: 10 }}>
        {email}
      </div>
    </a>
  )
}

export default function V3ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    if (!name || !email || !message) {
      setSubmitError('Name, email, and message are required.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setSubmitError(data?.error || 'Failed to send message. Try again.')
        return
      }
      setSuccess(true)
    } catch {
      setSubmitError('Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setSubject(SUBJECT_OPTIONS[0])
    setMessage('')
    setSuccess(false)
    setSubmitError('')
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '72px 40px 120px' }}>
      <div style={{ marginBottom: 48 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.14em',
            color: 'var(--indigo-hover)',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          — CONTACT
        </span>
        <h1
          style={{
            fontSize: 54,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text)',
            margin: '14px 0 16px',
            lineHeight: 1.05,
          }}
        >
          Get in touch.
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 440, lineHeight: 1.6, margin: 0 }}>
          We&apos;re a small team and we read every message. Expect a reply within 1-2 business days.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'start',
        }}
      >
        <div>
          <ContactCard
            icon={<EnvelopeIcon />}
            title="General inquiries"
            description="Questions about the product, partnerships, press, or anything else."
            email="main@dealsletter.io"
          />
          <ContactCard
            icon={<TargetIcon />}
            title="Product support"
            description="Having trouble with your account, analysis, or billing? We'll get it sorted."
            email="support@dealsletter.io"
          />
          <ContactCard
            icon={<ShieldIcon />}
            title="Privacy & data"
            description="Data deletion requests, privacy questions, or GDPR inquiries."
            email="privacy@dealsletter.io"
          />
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--indigo-dim)',
              border: '1px solid var(--hairline)',
              borderRadius: 10,
              marginTop: 4,
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Built and maintained by a solo founder. Every email goes directly to Kevin.
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '0.04em' }}>
              — Kevin Godbey, Founder
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 16,
            padding: 28,
          }}
        >
          {success ? (
            <div style={{ textAlign: 'center', padding: '28px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CheckCircle />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 14 }}>
                Message sent!
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
                Thanks for reaching out. We&apos;ll get back to you within 1-2 business days.
              </div>
              <button
                type="button"
                className="app-btn-ghost"
                onClick={resetForm}
                style={{ marginTop: 22, padding: '9px 16px', fontSize: 13 }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 22 }}>
                Send a message
              </div>

              {submitError && (
                <div
                  style={{
                    fontSize: 12.5,
                    color: '#F87171',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.22)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    marginBottom: 16,
                  }}
                >
                  {submitError}
                </div>
              )}

              <form onSubmit={onSubmit}>
                <label style={labelStyle} htmlFor="v3-contact-name">Name</label>
                <input
                  id="v3-contact-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
                />

                <label style={labelStyle} htmlFor="v3-contact-email">Email</label>
                <input
                  id="v3-contact-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
                />

                <label style={labelStyle} htmlFor="v3-contact-subject">What&apos;s this about?</label>
                <select
                  id="v3-contact-subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
                >
                  {SUBJECT_OPTIONS.map(opt => (
                    <option key={opt} value={opt} style={{ background: 'var(--elevated)', color: 'var(--text)' }}>
                      {opt}
                    </option>
                  ))}
                </select>

                <label style={labelStyle} htmlFor="v3-contact-message">Message</label>
                <textarea
                  id="v3-contact-message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={5}
                  style={{
                    ...inputStyle,
                    minHeight: 120,
                    resize: 'vertical',
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.5,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
                />

                <button
                  type="submit"
                  className="app-btn"
                  disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 14 }}
                >
                  {submitting ? 'Sending…' : 'Send message →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <section
        style={{
          marginTop: 64,
          background: 'var(--indigo-dim)',
          border: '1px solid var(--hairline)',
          borderRadius: 14,
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            Looking for quick answers?
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Check our FAQ — most common questions are answered there.
          </div>
        </div>
        <Link href="/faq" className="app-btn-ghost" style={{ padding: '9px 16px', fontSize: 13 }}>
          Browse FAQ →
        </Link>
      </section>
    </div>
  )
}
