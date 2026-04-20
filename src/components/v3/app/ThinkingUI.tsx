'use client'

import { type ReactNode, useEffect, useState } from 'react'

export type ThinkingStep = {
  step: string
  detail: string
  timestamp: number
}

const ROTATING_MESSAGES = [
  'Gathering property data...',
  'Running financial calculations...',
  'AI is synthesizing your analysis...',
]

function StepIcon({ step }: { step: string }) {
  const s = step.toLowerCase()
  let color = 'var(--indigo-hover)'
  if (s.includes('rent') || s.includes('cash') || s.includes('flow')) color = 'var(--green)'
  else if (s.includes('rehab') || s.includes('arv')) color = 'var(--amber)'
  else if (s.includes('risk')) color = 'var(--red)'

  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: 'var(--indigo-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  )
}

function Ring() {
  return (
    <div
      style={{
        position: 'relative',
        width: 52,
        height: 52,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid var(--hairline)',
          borderTopColor: 'var(--indigo)',
          animation: 'v3-analyze-spin 1s linear infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'var(--indigo)',
          boxShadow: '0 0 14px rgba(99,102,241,0.6)',
          animation: 'v3-pulse 1.4s ease-in-out infinite',
        }}
      />
    </div>
  )
}

function BlinkingCursor() {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 6,
        height: 12,
        background: 'var(--indigo-hover)',
        marginLeft: 6,
        animation: 'v3-analyze-blink 1s steps(1) infinite',
        verticalAlign: 'middle',
      }}
    />
  )
}

export default function ThinkingUI({
  address,
  steps,
  extra,
}: {
  address: string
  steps: ThinkingStep[]
  extra?: ReactNode
}) {
  const [msgIdx, setMsgIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setMsgIdx(i => (i + 1) % ROTATING_MESSAGES.length), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 12,
        padding: 26,
        marginTop: 16,
      }}
    >
      <style>{`
        @keyframes v3-analyze-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes v3-analyze-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes v3-analyze-step-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Ring />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            Analyzing property…
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-muted)',
              marginTop: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {address || 'Working…'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--indigo-hover)',
              marginTop: 8,
            }}
          >
            {ROTATING_MESSAGES[msgIdx]}
          </div>
        </div>
      </div>

      {(steps.length > 0 || extra) && (
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--hairline)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1
            return (
              <div
                key={`${s.timestamp}-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  animation: 'v3-analyze-step-in 260ms ease',
                }}
              >
                <StepIcon step={s.step} />
                <div style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {s.detail || s.step}
                  {isLast && <BlinkingCursor />}
                </div>
              </div>
            )
          })}
          {extra}
        </div>
      )}
    </section>
  )
}
