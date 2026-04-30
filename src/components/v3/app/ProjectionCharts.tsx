'use client'

import { useState } from 'react'

function fmtAxis(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n)}`
}

type ChartPoint = { x: number; y: number }

function ChartFrame({
  children,
  height = 200,
  minY = 0,
  maxY = 100,
}: {
  children: (d: { w: number; h: number; pad: number }) => React.ReactNode
  height?: number
  minY?: number
  maxY?: number
}) {
  const w = 800
  const h = height
  const pad = 52
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        maxHeight: height * 1.5,
      }}
    >
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--hairline)" strokeWidth="1" />
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="var(--hairline)" strokeWidth="1" />

      {[0.25, 0.5, 0.75].map(f => {
        const val = minY + f * (maxY - minY)
        return (
          <text
            key={f}
            x={pad - 4}
            y={h - pad - f * (h - 2 * pad) + 4}
            textAnchor="end"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="var(--text-muted)"
          >
            {fmtAxis(val)}
          </text>
        )
      })}

      {children({ w, h, pad })}
    </svg>
  )
}

function Legend({
  items,
}: {
  items: { color: string; label: string; dashed?: boolean }[]
}) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
      {items.map(it => (
        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 20,
              height: 0,
              borderTop: `2px ${it.dashed ? 'dashed' : 'solid'} ${it.color}`,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
            }}
          >
            {it.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function CardTopAccent() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, var(--indigo), transparent)',
        borderRadius: '12px 12px 0 0',
      }}
    />
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
  const [hoverX, setHoverX] = useState<number | null>(null)
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
        position: 'relative',
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 12,
        padding: 18,
      }}
    >
      <CardTopAccent />
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

      <Legend
        items={[
          { color: 'var(--green)', label: 'Net sale' },
          { color: 'var(--indigo-hover)', label: 'Total in' },
          { color: profit >= 0 ? 'var(--green)' : 'var(--red)', label: 'Profit gap', dashed: true },
        ]}
      />

      <div
        style={{ position: 'relative' }}
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          const svgX = ((e.clientX - rect.left) / rect.width) * 800
          setHoverX(svgX)
        }}
        onMouseLeave={() => setHoverX(null)}
      >
      <ChartFrame height={220} minY={minY} maxY={maxY}>
        {({ w, h, pad }) => {
          const scaleX = (x: number) => pad + (x / months) * (w - 2 * pad)
          const scaleY = (y: number) =>
            h - pad - ((y - minY) / (maxY - minY || 1)) * (h - 2 * pad)
          const costPath = costs
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
            .join(' ')
          const baselineY = scaleY(minY)
          const costFillPath = `${costPath} L ${scaleX(months).toFixed(1)} ${baselineY.toFixed(1)} L ${scaleX(0).toFixed(1)} ${baselineY.toFixed(1)} Z`

          let crosshair: React.ReactNode = null
          if (hoverX !== null) {
            const clampedX = Math.max(pad, Math.min(w - pad, hoverX))
            const monthIdx = Math.max(
              0,
              Math.min(months, Math.round(((clampedX - pad) / (w - 2 * pad)) * months))
            )
            const costAtMonth = costs[monthIdx]?.y ?? 0
            const tipW = 130
            const tipH = 56
            const tipX = clampedX > w / 2 ? clampedX - tipW - 8 : clampedX + 8
            const tipY = pad + 8
            crosshair = (
              <>
                <line
                  x1={clampedX}
                  y1={pad}
                  x2={clampedX}
                  y2={h - pad}
                  stroke="var(--text-muted)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                <circle cx={clampedX} cy={scaleY(costAtMonth)} r="3.5" fill="var(--indigo-hover)" />
                <circle cx={clampedX} cy={scaleY(netSale)} r="3.5" fill="var(--green)" />
                <g transform={`translate(${tipX}, ${tipY})`}>
                  <rect
                    width={tipW}
                    height={tipH}
                    rx="6"
                    fill="var(--elevated)"
                    stroke="var(--border-strong)"
                    strokeWidth="1"
                  />
                  <text x="10" y="16" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-muted)">
                    MONTH {monthIdx}
                  </text>
                  <text x="10" y="32" fontFamily="var(--font-mono)" fontSize="11" fontWeight="600" fill="var(--indigo-hover)">
                    Total in {fmtAxis(costAtMonth)}
                  </text>
                  <text x="10" y="48" fontFamily="var(--font-mono)" fontSize="11" fontWeight="600" fill="var(--green)">
                    Net sale {fmtAxis(netSale)}
                  </text>
                </g>
              </>
            )
          }

          return (
            <>
              <defs>
                <linearGradient id="flip-cost-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--indigo)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--indigo)" stopOpacity="0" />
                </linearGradient>
              </defs>

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

              <path d={costFillPath} fill="url(#flip-cost-fill)" />

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

              <line
                x1={scaleX(months)}
                y1={scaleY(netSale)}
                x2={scaleX(months)}
                y2={scaleY(lastCost)}
                stroke={profit >= 0 ? 'var(--green)' : 'var(--red)'}
                strokeWidth="1"
                strokeDasharray="3 2"
                opacity="0.5"
              />

              <circle cx={scaleX(0)} cy={scaleY(costs[0].y)} r="3" fill="var(--indigo-hover)" />
              <circle cx={scaleX(months)} cy={scaleY(lastCost)} r="3" fill="var(--indigo-hover)" />
              <circle cx={scaleX(0)} cy={scaleY(netSale)} r="3" fill="var(--green)" />
              <circle cx={scaleX(months)} cy={scaleY(netSale)} r="3" fill="var(--green)" />

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
              {crosshair}
            </>
          )
        }}
      </ChartFrame>
      </div>
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
  const [hoverX, setHoverX] = useState<number | null>(null)
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

  let crossoverYear: number | null = null
  for (let y = 1; y <= years; y++) {
    if (equityPoints[y].y >= cfPoints[y].y && equityPoints[y - 1].y < cfPoints[y - 1].y) {
      crossoverYear = y
      break
    }
  }

  const allY = [...cfPoints.map(p => p.y), ...equityPoints.map(p => p.y), 0]
  const minY = Math.min(0, ...allY)
  const maxY = Math.max(...allY, 1)

  const legendItems: { color: string; label: string; dashed?: boolean }[] = [
    { color: 'var(--indigo-hover)', label: 'Equity' },
    { color: 'var(--green)', label: 'Cumulative CF' },
  ]
  if (crossoverYear !== null) {
    legendItems.push({ color: 'var(--amber)', label: 'Crossover', dashed: true })
  }

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: 12,
        padding: 18,
      }}
    >
      <CardTopAccent />
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

      <Legend items={legendItems} />

      <div
        style={{ position: 'relative' }}
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          const svgX = ((e.clientX - rect.left) / rect.width) * 800
          setHoverX(svgX)
        }}
        onMouseLeave={() => setHoverX(null)}
      >
      <ChartFrame height={240} minY={minY} maxY={maxY}>
        {({ w, h, pad }) => {
          const scaleX = (x: number) => pad + (x / years) * (w - 2 * pad)
          const scaleY = (y: number) =>
            h - pad - ((y - minY) / (maxY - minY || 1)) * (h - 2 * pad)
          const baselineY = scaleY(minY)

          const cfPath = cfPoints
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
            .join(' ')
          const eqPath = equityPoints
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
            .join(' ')

          const cfFill = `${cfPath} L ${scaleX(years).toFixed(1)} ${baselineY.toFixed(1)} L ${scaleX(0).toFixed(1)} ${baselineY.toFixed(1)} Z`
          const eqFill = `${eqPath} L ${scaleX(years).toFixed(1)} ${baselineY.toFixed(1)} L ${scaleX(0).toFixed(1)} ${baselineY.toFixed(1)} Z`

          let crosshair: React.ReactNode = null
          if (hoverX !== null) {
            const clampedX = Math.max(pad, Math.min(w - pad, hoverX))
            const yearIdx = Math.max(
              0,
              Math.min(years, Math.round(((clampedX - pad) / (w - 2 * pad)) * years))
            )
            const eqAtYear = equityPoints[yearIdx]?.y ?? 0
            const cfAtYear = cfPoints[yearIdx]?.y ?? 0
            const tipW = 140
            const tipH = 56
            const tipX = clampedX > w / 2 ? clampedX - tipW - 8 : clampedX + 8
            const tipY = pad + 8
            crosshair = (
              <>
                <line
                  x1={clampedX}
                  y1={pad}
                  x2={clampedX}
                  y2={h - pad}
                  stroke="var(--text-muted)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                <circle cx={clampedX} cy={scaleY(eqAtYear)} r="3.5" fill="var(--indigo-hover)" />
                <circle cx={clampedX} cy={scaleY(cfAtYear)} r="3.5" fill="var(--green)" />
                <g transform={`translate(${tipX}, ${tipY})`}>
                  <rect
                    width={tipW}
                    height={tipH}
                    rx="6"
                    fill="var(--elevated)"
                    stroke="var(--border-strong)"
                    strokeWidth="1"
                  />
                  <text x="10" y="16" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-muted)">
                    YEAR {yearIdx}
                  </text>
                  <text x="10" y="32" fontFamily="var(--font-mono)" fontSize="11" fontWeight="600" fill="var(--indigo-hover)">
                    Equity {fmtAxis(eqAtYear)}
                  </text>
                  <text x="10" y="48" fontFamily="var(--font-mono)" fontSize="11" fontWeight="600" fill="var(--green)">
                    Cum. CF {fmtAxis(cfAtYear)}
                  </text>
                </g>
              </>
            )
          }

          return (
            <>
              <defs>
                <linearGradient id="hold-equity-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--indigo)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="var(--indigo)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="hold-cf-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--green)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
                </linearGradient>
              </defs>

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

              <path d={cfFill} fill="url(#hold-cf-fill)" />
              <path d={eqFill} fill="url(#hold-equity-fill)" />

              {crossoverYear !== null && (
                <>
                  <line
                    x1={scaleX(crossoverYear)}
                    y1={pad}
                    x2={scaleX(crossoverYear)}
                    y2={h - pad}
                    stroke="var(--amber)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.6"
                  />
                  <text
                    x={scaleX(crossoverYear)}
                    y={pad - 4}
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                    fill="var(--amber)"
                  >
                    Y{crossoverYear} crossover
                  </text>
                </>
              )}

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
              {crosshair}
            </>
          )
        }}
      </ChartFrame>
      </div>
    </div>
  )
}
