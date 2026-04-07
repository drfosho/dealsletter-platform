'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/v2/NavBar'

export default function SuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [tierConfirmed, setTierConfirmed] = useState(false)
  const [tierName, setTierName] = useState<string | null>(null)

  // Poll for tier update
  useEffect(() => {
    let attempts = 0
    const maxAttempts = 10

    const pollTier = async () => {
      try {
        const res = await fetch('/api/analysis/usage')
        if (res.ok) {
          const data = await res.json()
          const tier = data.subscription_tier
          const status = data.subscription_status

          if (status === 'active' && tier !== 'free' && tier != null) {
            const displayName =
              tier === 'pro_plus' || tier === 'pro-plus' || tier === 'premium'
                ? 'Pro Max'
                : 'Pro'
            setTierName(displayName)
            setTierConfirmed(true)
            return true
          }
        }
      } catch {}
      return false
    }

    const poll = async () => {
      const confirmed = await pollTier()
      if (!confirmed) {
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000)
        } else {
          // Give up polling, proceed anyway
          setTierConfirmed(true)
        }
      }
    }

    poll()
  }, [])

  // Countdown redirect
  useEffect(() => {
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
          {/* Success icon */}
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

          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#f0eeff',
            letterSpacing: '-0.6px',
            marginBottom: 8
          }}>
            You&apos;re all set!
          </h1>

          {/* Tier confirmation */}
          {tierConfirmed && tierName && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(29,158,117,0.1)',
              border: '0.5px solid rgba(29,158,117,0.3)',
              borderRadius: 20,
              padding: '4px 14px',
              fontSize: 13,
              color: '#1D9E75',
              marginBottom: 16
            }}>
              &#10003; {tierName} plan activated
            </div>
          )}

          {!tierConfirmed && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(83,74,183,0.1)',
              border: '0.5px solid rgba(127,119,221,0.2)',
              borderRadius: 20,
              padding: '4px 14px',
              fontSize: 13,
              color: '#9994b8',
              marginBottom: 16
            }}>
              Activating your plan...
            </div>
          )}

          <p style={{
            fontSize: 15,
            color: '#6b6690',
            lineHeight: 1.6,
            marginBottom: 32
          }}>
            Welcome to Dealsletter. Let&apos;s analyze some deals.
          </p>

          {/* Countdown */}
          <div style={{
            background: 'rgba(83,74,183,0.08)',
            border: '0.5px solid rgba(127,119,221,0.2)',
            borderRadius: 12,
            padding: '14px 20px',
            marginBottom: 20,
            fontSize: 14,
            color: '#9994b8'
          }}>
            Redirecting to dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
          </div>

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
            Go to dashboard &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}
