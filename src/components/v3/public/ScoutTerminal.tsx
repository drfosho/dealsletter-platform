type Line = {
  time: string
  text: string
  tone: 'muted' | 'secondary' | 'green' | 'indigo'
}

const LINES: Line[] = [
  { time: '04:12:08', text: 'Scanning MLS feed · 12 metros', tone: 'muted' },
  { time: '04:14:32', text: '› 2,847 new listings ingested', tone: 'secondary' },
  { time: '04:16:51', text: '› 184 pass price filter (<$600K)', tone: 'secondary' },
  { time: '04:19:02', text: '› 52 pass cap rate filter (≥7%)', tone: 'secondary' },
  { time: '04:21:44', text: '› 12 pass CoC filter (≥9%)', tone: 'secondary' },
  { time: '04:24:19', text: '● 3 pass all filters — notifying user', tone: 'green' },
  { time: '04:24:20', text: '› Deal 1: 2847 Magnolia, Memphis · STRONG BUY', tone: 'indigo' },
  { time: '04:24:20', text: '› Deal 2: 1290 N Prospect, Indianapolis · BUY', tone: 'indigo' },
  { time: '04:24:20', text: '› Deal 3: 45 Harborside, Jacksonville · BUY', tone: 'indigo' },
]

const TONE_COLOR: Record<Line['tone'], string> = {
  muted: 'var(--text-muted)',
  secondary: 'var(--text-secondary)',
  green: 'var(--green)',
  indigo: 'var(--indigo-hover)',
}

export default function ScoutTerminal({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--hairline)',
        borderRadius: 10,
        padding: 18,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderBottom: '1px solid var(--hairline)',
          paddingBottom: 10,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--blue)',
            boxShadow: '0 0 8px rgba(59,130,246,0.6)',
            animation: 'v3-pulse 1.8s ease-in-out infinite',
          }}
        />
        <span style={{ color: 'var(--text-secondary)' }}>scout.watch —</span>
        <span style={{ color: 'var(--text)' }}>live</span>
      </div>
      <div>
        {LINES.map((line, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 5, lineHeight: 1.5 }}>
            <span style={{ color: 'var(--text-muted)', minWidth: 64 }}>{line.time}</span>
            <span style={{ color: TONE_COLOR[line.tone] }}>{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
