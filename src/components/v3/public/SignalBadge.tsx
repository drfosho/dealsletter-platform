import type { Signal } from '@/data/v3-metros'

const STYLES: Record<Signal, { bg: string; color: string }> = {
  'STRONG BUY': { bg: 'rgba(16,185,129,0.12)', color: '#34D399' },
  HOT: { bg: 'rgba(16,185,129,0.08)', color: '#6EE7B7' },
  BUY: { bg: 'rgba(59,130,246,0.12)', color: '#60A5FA' },
  WATCH: { bg: 'rgba(245,158,11,0.12)', color: '#FBBF24' },
  CAUTION: { bg: 'rgba(239,68,68,0.12)', color: '#F87171' },
}

export default function SignalBadge({ signal }: { signal: Signal }) {
  const s = STYLES[signal]
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
      }}
    >
      {signal}
    </span>
  )
}
