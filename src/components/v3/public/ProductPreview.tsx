import SignalBadge from './SignalBadge'

const MINI_NAV = [
  { label: 'Scout', active: true },
  { label: 'Analyze', active: false },
  { label: 'Pipeline', active: false },
  { label: 'Markets', active: false },
  { label: 'Desk', active: false },
]

function MiniDeal({
  address,
  meta,
  signal,
  cap,
  coc,
  cf,
}: {
  address: string
  meta: string
  signal: 'STRONG BUY' | 'BUY'
  cap: string
  coc: string
  cf: string
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 8,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {address}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            {meta}
          </div>
        </div>
        <SignalBadge signal={signal} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        <Metric label="CAP" value={cap} />
        <Metric label="COC" value={coc} />
        <Metric label="CF/MO" value={cf} />
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text)',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function MiniMetro({
  name,
  cap,
  yoy,
  color,
}: {
  name: string
  cap: string
  yoy: string
  color: string
}) {
  const positive = !yoy.startsWith('-')
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 6,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name}
        </span>
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }}
        />
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>
        {cap}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: positive ? '#34D399' : '#F87171',
        }}
      >
        {positive ? '↑' : '↓'} {yoy}
      </div>
    </div>
  )
}

export default function ProductPreview() {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow:
          '0 40px 80px -20px rgba(99,102,241,0.25), 0 0 0 1px rgba(99,102,241,0.15)',
        transform: 'perspective(1600px) rotateY(-4deg) rotateX(2deg)',
        transformOrigin: 'left center',
      }}
    >
      {/* Fake browser topbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderBottom: '1px solid var(--hairline)',
          background: 'var(--bg)',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#444' }} />
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          dealsletter.io/scout
        </span>
      </div>

      {/* Inner layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', minHeight: 380 }}>
        {/* Mini sidebar */}
        <div
          style={{
            background: 'var(--bg)',
            borderRight: '1px solid var(--hairline)',
            padding: '14px 10px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.14em',
              color: 'var(--text-muted)',
              marginBottom: 10,
              paddingLeft: 6,
            }}
          >
            NAV
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {MINI_NAV.map(item => (
              <div
                key={item.label}
                style={{
                  position: 'relative',
                  padding: '6px 10px',
                  borderRadius: 5,
                  fontSize: 11,
                  color: item.active ? 'var(--text)' : 'var(--text-secondary)',
                  background: item.active ? 'var(--elevated)' : 'transparent',
                  fontWeight: item.active ? 500 : 400,
                }}
              >
                {item.active && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      bottom: 4,
                      width: 2,
                      background: 'var(--indigo)',
                      borderRadius: 2,
                    }}
                  />
                )}
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ background: 'var(--bg)', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-secondary)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--blue)',
                boxShadow: '0 0 6px rgba(59,130,246,0.6)',
                animation: 'v3-pulse 1.8s ease-in-out infinite',
              }}
            />
            Scout · 3 new matches · 04:12 PT
          </div>

          <MiniDeal
            address="2847 Magnolia Ave"
            meta="Memphis TN · BRRRR"
            signal="STRONG BUY"
            cap="11.8%"
            coc="14.2%"
            cf="$842"
          />
          <MiniDeal
            address="1290 N Prospect Rd"
            meta="Indianapolis IN · Buy & Hold"
            signal="BUY"
            cap="9.4%"
            coc="10.8%"
            cf="$612"
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            <MiniMetro name="Memphis" cap="11.8%" yoy="4.3%" color="#34D399" />
            <MiniMetro name="Indianapolis" cap="9.4%" yoy="2.1%" color="#60A5FA" />
            <MiniMetro name="Tampa" cap="8.7%" yoy="5.8%" color="#6EE7B7" />
            <MiniMetro name="Charlotte" cap="7.9%" yoy="1.8%" color="#60A5FA" />
          </div>
        </div>
      </div>
    </div>
  )
}
