'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import NavBar from '@/components/v2/NavBar'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Countdown then redirect to dashboard
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/v2/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div style={{
      background: '#0d0d14',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <NavBar />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px'
      }}>
        <div style={{
          background: '#13121d',
          border: '0.5px solid rgba(127,119,221,0.25)',
          borderRadius: 20,
          padding: '48px 40px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Success checkmark */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(29,158,117,0.12)',
            border: '1.5px solid rgba(29,158,117,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="28" height="28"
              viewBox="0 0 24 24" fill="none"
              stroke="#1D9E75" strokeWidth="2.5"
              strokeLinecap="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#f0eeff',
            letterSpacing: '-0.6px',
            marginBottom: 10
          }}>
            You're all set!
          </h1>

          <p style={{
            fontSize: 15,
            color: '#6b6690',
            lineHeight: 1.6,
            marginBottom: 32
          }}>
            Your subscription is active.
            Welcome to Dealsletter — let's
            analyze some deals.
          </p>

          {/* Countdown */}
          <div style={{
            background: 'rgba(83,74,183,0.08)',
            border: '0.5px solid rgba(127,119,221,0.2)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            fontSize: 14,
            color: '#9994b8'
          }}>
            Redirecting to dashboard
            in {countdown} second{countdown !== 1 ? 's' : ''}...
          </div>

          {/* Manual redirect button */}
          <button
            onClick={() => router.push('/v2/dashboard')}
            style={{
              width: '100%',
              background: '#534AB7',
              color: '#f0eeff',
              border: 'none',
              borderRadius: 12,
              padding: '14px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Go to dashboard →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
