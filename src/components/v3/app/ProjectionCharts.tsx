'use client'

function fmtAxis(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n)}`
}

type ChartPoint = { x: number; y: number }

function computePath(points: ChartPoint[], w: number, h: number, pad: number): string {
  if (points.length === 0) return ''
  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const minY = Math.min(0, ...ys)
  const maxY = Math.max(...ys, 1)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs, minX + 1)
  const scaleX = (x: number) => pad + ((x - minX) / (maxX - minX)) * (w - 2 * pad)
  const scaleY = (y: number) => h - pad - ((y - minY) / (maxY - minY)) * (h - 2 * pad)
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
    .join(' ')
}

function ChartFrame({
  children,
  height = 200,
}: {
  children: (d: { w: number; h: number; pad: number }) => React.ReactNode
  height?: number
}) {
  const w = 800
  const h = height
  const pad = 36
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--hairline)" strokeWidth="1" />
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="var(--hairline)" strokeWidth="1" />
      {children({ w, h, pad })}
    </svg>
  )
}

/* ---------------------- Fix & Flip P&L chart ---------------------- */

export function FlipChart({
  purchasePrice,
  rehabCost,
  closingCostsPercent,
  sellClosingCostsPercent,
  interestRate,
  downPaymentPercent,
  holdingMonths,
  arv,
}: {
  purchasePrice: number
  rehabCost: number
  closingCostsPercent: number
  sellClosingCostsPercent: number
  interestRate: number
  downPaymentPercent: number
  holdingMonths: number
  arv: number
}) {
  const months = Math.max(1, Math.round(holdingMonths))
  const loanBalance = purchasePrice * (1 - downPaymentPercent / 100)
  const monthlyInterest = (loanBalance * (interestRate / 100)) / 12
  const closing = purchasePrice * (closingCostsPercent / 100)
  const rehabPerMonth = rehabCost / Math.max(1, Math.min(months, 4))
  const rehabCap = rehabCost
  const sellClosing = arv * (sellClosingCostsPercent / 100)

  const costs: ChartPoint[] = []
  let cumulativeRehab = 0
  let cumulativeInterest = 0
  const downPayment = purchasePrice * (downPaymentPercent / 100)

  for (let m = 0; m <= months; m++) {
    if (m > 0) {
      cumulativeRehab = Math.min(rehabCap, cumulativeRehab + rehabPerMonth)
      cumulativeInterest += monthlyInterest
    }
    const totalIn = downPayment + closing + cumulativeRehab + cumulativeInterest
    costs.push({ x: m, y: totalIn })
  }

  const netSale = arv - sellClosing
  const sale: ChartPoint[] = costs.map(p => ({ x: p.x, y: netSale }))

  const lastCost = costs[costs.length - 1]?.y || 0
  const allY = [...costs.map(p => p.y), ...sale.map(p => p.y), 0, netSale]
  const minY = Math.min(0, ...allY)
  const maxY = Math.max(...allY, 1)

  const profit = netSale - lastCost
  const profitColor = profit >= 0 ? '#34D399' : '#F87171'

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 12,
        padding: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 12,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'var(--indigo-hover)',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Flip economics · {months}-month hold
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Cumulative costs vs net sale proceeds
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            NET PROFIT
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 22,
              fontWeight: 600,
              color: profitColor,
              letterSpacing: '-0.02em',
            }}
          >
            {fmtAxis(profit)}
          </div>
        </div>
      </div>

      <ChartFrame height={200}>
        {({ w, h, pad }) => {
          const scaleX = (x: number) => pad + (x / months) * (w - 2 * pad)
          const scaleY = (y: number) =>
            h - pad - ((y - minY) / (maxY - minY || 1)) * (h - 2 * pad)
          const costPath = costs
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
            .join(' ')

          return (
            <>
              {[0.25, 0.5, 0.75].map(f => (
                <line
                  key={f}
                  x1={pad}
                  x2={w - pad}
                  y1={h - pad - f * (h - 2 * pad)}
                  y2={h - pad - f * (h - 2 * pad)}
                  stroke="var(--hairline)"
                  strokeDasharray="2 4"
                />
              ))}

              <line
                x1={scaleX(0)}
                x2={scaleX(months)}
                y1={scaleY(netSale)}
                y2={scaleY(netSale)}
                stroke="var(--green)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <text
                x={w - pad}
                y={scaleY(netSale) - 6}
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontSize="10"
                fill="var(--green)"
              >
                Net sale {fmtAxis(netSale)}
              </text>

              <path d={costPath} stroke="var(--indigo-hover)" strokeWidth="2" fill="none" />
              <text
                x={scaleX(months)}
                y={scaleY(lastCost) - 6}
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontSize="10"
                fill="var(--indigo-hover)"
              >
                Total in {fmtAxis(lastCost)}
              </text>

              <text
                x={pad}
                y={h - 8}
                fontFamily="var(--font-mono)"
                fontSize="10"
                fill="var(--text-muted)"
              >
                Month 0
              </text>
              <text
                x={w - pad}
                y={h - 8}
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontSize="10"
                fill="var(--text-muted)"
              >
                Month {months}
              </text>
            </>
          )
        }}
      </ChartFrame>
    </div>
  )
}

/* ---------------------- 30-year hold chart ---------------------- */

export function HoldChart({
  purchasePrice,
  downPaymentPercent,
  interestRate,
  loanTermYears,
  monthlyCashFlow,
  appreciationRate = 3,
}: {
  purchasePrice: number
  downPaymentPercent: number
  interestRate: number
  loanTermYears: number
  monthlyCashFlow: number
  appreciationRate?: number
}) {
  if (purchasePrice <= 0) return null
  const loanBalance0 = purchasePrice * (1 - downPaymentPercent / 100)
  const n = Math.max(1, loanTermYears) * 12
  const r = interestRate / 100 / 12
  const monthlyPayment =
    r > 0
      ? (loanBalance0 * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1)
      : loanBalance0 / n

  const years = 30
  const cfPoints: ChartPoint[] = []
  const equityPoints: ChartPoint[] = []
  let balance = loanBalance0

  for (let y = 0; y <= years; y++) {
    const cumulativeCF = monthlyCashFlow * 12 * y
    cfPoints.push({ x: y, y: cumulativeCF })

    if (y > 0) {
      for (let m = 0; m < 12 && balance > 0; m++) {
        const interest = balance * r
        const principal = Math.min(balance, monthlyPayment - interest)
        balance = Math.max(0, balance - principal)
      }
    }
    const propertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, y)
    const equity = propertyValue - balance
    equityPoints.push({ x: y, y: equity })
  }

  const finalCf = cfPoints[cfPoints.length - 1].y
  const finalEquity = equityPoints[equityPoints.length - 1].y

  const allY = [...cfPoints.map(p => p.y), ...equityPoints.map(p => p.y), 0]
  const minY = Math.min(0, ...allY)
  const maxY = Math.max(...allY, 1)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 12,
        padding: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 12,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'var(--indigo-hover)',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            30-year projection
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            Cumulative cash flow vs property equity (3% annual appreciation)
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              30-YR CF
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--green)',
                marginTop: 2,
              }}
            >
              {fmtAxis(finalCf)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              30-YR EQUITY
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--indigo-hover)',
                marginTop: 2,
              }}
            >
              {fmtAxis(finalEquity)}
            </div>
          </div>
        </div>
      </div>

      <ChartFrame height={220}>
        {({ w, h, pad }) => {
          const scaleX = (x: number) => pad + (x / years) * (w - 2 * pad)
          const scaleY = (y: number) =>
            h - pad - ((y - minY) / (maxY - minY || 1)) * (h - 2 * pad)

          const cfPath = cfPoints
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
            .join(' ')
          const eqPath = equityPoints
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
            .join(' ')

          return (
            <>
              {[0.25, 0.5, 0.75].map(f => (
                <line
                  key={f}
                  x1={pad}
                  x2={w - pad}
                  y1={h - pad - f * (h - 2 * pad)}
                  y2={h - pad - f * (h - 2 * pad)}
                  stroke="var(--hairline)"
                  strokeDasharray="2 4"
                />
              ))}

              <path d={eqPath} stroke="var(--indigo-hover)" strokeWidth="2" fill="none" />
              <path d={cfPath} stroke="var(--green)" strokeWidth="2" fill="none" />

              {[5, 10, 15, 20, 25, 30].map(y => (
                <text
                  key={y}
                  x={scaleX(y)}
                  y={h - 8}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize="10"
                  fill="var(--text-muted)"
                >
                  {`Y${y}`}
                </text>
              ))}
            </>
          )
        }}
      </ChartFrame>
    </div>
  )
}
