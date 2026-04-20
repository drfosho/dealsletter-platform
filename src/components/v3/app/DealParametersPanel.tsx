'use client'

import { type ReactNode } from 'react'

export type DealStrategy = 'BRRRR' | 'Fix & Flip' | 'Buy & Hold' | 'House Hack'

export type DealParams = {
  loanType: string
  downPaymentPercent: string
  interestRate: string
  loanTerm: string
  points: string
  holdingMonths: string
  closingCosts: string
  sellClosingCosts: string
  propertyTax: string
  insurance: string
}

export const DEFAULT_DEAL_PARAMS: DealParams = {
  loanType: 'Conventional',
  downPaymentPercent: '20',
  interestRate: '7.5',
  loanTerm: '30',
  points: '0',
  holdingMonths: '6',
  closingCosts: '3',
  sellClosingCosts: '6',
  propertyTax: '',
  insurance: '',
}

export function dealDefaultsFor(strategy: DealStrategy): DealParams {
  if (strategy === 'Fix & Flip') {
    return {
      ...DEFAULT_DEAL_PARAMS,
      loanType: 'Hard Money',
      downPaymentPercent: '10',
      interestRate: '12',
      loanTerm: '12',
      points: '2',
      holdingMonths: '6',
      closingCosts: '3',
    }
  }
  if (strategy === 'BRRRR') {
    return {
      ...DEFAULT_DEAL_PARAMS,
      loanType: 'Hard Money → DSCR Refi',
      downPaymentPercent: '10',
      interestRate: '12',
      loanTerm: '12',
      points: '2',
      holdingMonths: '6',
      closingCosts: '3',
    }
  }
  if (strategy === 'House Hack') {
    return {
      ...DEFAULT_DEAL_PARAMS,
      loanType: 'FHA',
      downPaymentPercent: '3.5',
      interestRate: '7.25',
      loanTerm: '30',
      points: '0',
      closingCosts: '3.5',
    }
  }
  return {
    ...DEFAULT_DEAL_PARAMS,
    loanType: 'Conventional',
    downPaymentPercent: '25',
    interestRate: '7.5',
    loanTerm: '30',
    points: '0',
    closingCosts: '3',
  }
}

const LOAN_TYPES: Record<DealStrategy, readonly string[]> = {
  'Fix & Flip': ['Hard Money', 'Private Money', 'Cash'],
  BRRRR: ['Hard Money → DSCR Refi', 'Private Money → DSCR Refi', 'Cash → DSCR Refi'],
  'Buy & Hold': ['Conventional', 'DSCR Loan', 'Portfolio Loan', 'Cash'],
  'House Hack': ['FHA', 'Conventional', 'VA Loan'],
}

export function apiLoanTypeFor(loanType: string): string {
  if (loanType.includes('Hard Money')) return 'hardMoney'
  if (loanType.includes('Private Money')) return 'privateMoney'
  if (/^Cash$/.test(loanType)) return 'cash'
  if (loanType.includes('Cash →')) return 'cash'
  if (loanType.includes('FHA')) return 'fha'
  if (loanType.includes('VA')) return 'va'
  if (loanType.includes('DSCR')) return 'dscr'
  return 'conventional'
}

export function isCashLoan(loanType: string): boolean {
  return /^Cash$/.test(loanType)
}

/* --------------------------- shared styles --------------------------- */

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.08em',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--elevated)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 14,
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 140ms ease',
}

function Field({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <div style={{ marginTop: 6 }}>{hint}</div>}
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    />
  )
}

function LoanTypePills({
  options,
  value,
  onChange,
}: {
  options: readonly string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              background: active ? 'var(--indigo-dim)' : 'var(--elevated)',
              color: active ? 'var(--indigo-hover)' : 'var(--text-secondary)',
              border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
              borderRadius: 999,
              padding: '7px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 140ms ease',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.12em',
        color: 'var(--indigo-hover)',
        textTransform: 'uppercase',
        fontWeight: 600,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  )
}

function Hint({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: color || 'var(--text-muted)',
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  )
}

function QuickButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'var(--elevated)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        padding: '4px 10px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 140ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-strong)'
        e.currentTarget.style.color = 'var(--text)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      {label}
    </button>
  )
}

function fmtMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n).toLocaleString()}`
}

function fmtMoneyFull(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `$${Math.round(n).toLocaleString('en-US')}`
}

function toNum(s: string | null | undefined): number | undefined {
  if (s == null) return undefined
  const n = parseFloat(String(s).replace(/[^0-9.\-]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

/* ----------------------------- panel ----------------------------- */

type Props = {
  strategy: DealStrategy
  value: DealParams
  onChange: (patch: Partial<DealParams>) => void
  purchasePrice: number
  arv: number
  rehab: number
  rentcastPropertyTax?: number | null
}

export default function DealParametersPanel({
  strategy,
  value,
  onChange,
  purchasePrice,
  arv,
  rehab,
  rentcastPropertyTax,
}: Props) {
  const options = LOAN_TYPES[strategy]
  const cash = isCashLoan(value.loanType)
  const hasRefi = value.loanType.includes('→')
  const hideLoanMath = cash
  const hideLoanTerm = cash || hasRefi
  const showRehabRow = strategy === 'Fix & Flip' || strategy === 'BRRRR'
  const showRentalRow =
    strategy === 'Buy & Hold' || strategy === 'BRRRR' || strategy === 'House Hack'
  const showSellClosing = strategy === 'Fix & Flip' || strategy === 'BRRRR'

  const maxOffer = arv > 0 && rehab >= 0 ? arv * 0.85 - rehab : 0
  const refiProceeds = arv > 0 ? arv * 0.75 : 0
  const closingDollar = purchasePrice * (toNum(value.closingCosts) ?? 0) / 100
  const sellClosingDollar = arv * (toNum(value.sellClosingCosts) ?? 0) / 100

  const taxEstimate = purchasePrice * 0.012
  const insuranceEstimate = purchasePrice * 0.0035
  const insuranceConservative = purchasePrice * 0.005

  const applyPreset = (patch: Partial<DealParams>) => onChange(patch)

  const onLoanTypeChange = (lt: string) => {
    if (/^Cash$/.test(lt)) {
      applyPreset({
        loanType: lt,
        downPaymentPercent: '100',
        points: '0',
        interestRate: '0',
      })
    } else {
      applyPreset({ loanType: lt })
    }
  }

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 12,
        padding: 22,
        marginTop: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      <div>
        <SectionLabel>DEAL PARAMETERS — {strategy.toUpperCase()}</SectionLabel>
        <div style={{ marginBottom: 8, marginTop: -6 }}>
          <span style={{ ...labelStyle, marginBottom: 10 }}>Loan type</span>
          <LoanTypePills options={options} value={value.loanType} onChange={onLoanTypeChange} />
        </div>
      </div>

      {/* Row 1 — loan math */}
      {!hideLoanMath && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: hideLoanTerm
              ? 'repeat(2, 1fr)'
              : 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          <Field label="Down payment %">
            <NumberInput
              value={value.downPaymentPercent}
              onChange={v => onChange({ downPaymentPercent: v })}
            />
          </Field>
          <Field label="Interest rate %">
            <NumberInput
              value={value.interestRate}
              onChange={v => onChange({ interestRate: v })}
            />
          </Field>
          {!hideLoanTerm && (
            <Field label={hasRefi ? 'Initial term (mo)' : 'Loan term (yr)'}>
              <NumberInput value={value.loanTerm} onChange={v => onChange({ loanTerm: v })} />
            </Field>
          )}
        </div>
      )}

      {/* Row 2 — rehab strategies */}
      {showRehabRow && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: cash ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          <Field label="Holding period (months)">
            <NumberInput
              value={value.holdingMonths}
              onChange={v => onChange({ holdingMonths: v })}
            />
          </Field>
          {!cash && (
            <Field label="Loan points">
              <NumberInput value={value.points} onChange={v => onChange({ points: v })} />
            </Field>
          )}
          <Field
            label={strategy === 'Fix & Flip' ? 'Max allowable offer' : 'Refi proceeds @ 75% ARV'}
            hint={
              strategy === 'Fix & Flip' ? (
                <Hint color={purchasePrice > 0 && purchasePrice > maxOffer ? '#F87171' : '#34D399'}>
                  {maxOffer > 0
                    ? `Ceiling: ${fmtMoneyFull(maxOffer)}${
                        purchasePrice > 0
                          ? purchasePrice > maxOffer
                            ? ' · over ceiling'
                            : ' · within ceiling'
                          : ''
                      }`
                    : 'Set ARV to calculate'}
                </Hint>
              ) : (
                <Hint color="var(--indigo-hover)">
                  {refiProceeds > 0
                    ? `Est. ${fmtMoneyFull(refiProceeds)} back on refi`
                    : 'Set ARV to calculate'}
                </Hint>
              )
            }
          >
            <div
              style={{
                ...inputStyle,
                color: 'var(--text-muted)',
                background: 'var(--bg)',
                pointerEvents: 'none',
              }}
            >
              {strategy === 'Fix & Flip' ? fmtMoney(maxOffer) : fmtMoney(refiProceeds)}
            </div>
          </Field>
        </div>
      )}

      {/* Row 3 — rental-side costs */}
      {showRentalRow && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <Field
            label="Property tax / yr"
            hint={
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {rentcastPropertyTax && rentcastPropertyTax > 0 && (
                  <QuickButton
                    label={`Use RentCast: ${fmtMoneyFull(rentcastPropertyTax)}/yr`}
                    onClick={() => onChange({ propertyTax: String(Math.round(rentcastPropertyTax)) })}
                  />
                )}
                {purchasePrice > 0 && (
                  <QuickButton
                    label={`Estimate 1.2%: ${fmtMoneyFull(taxEstimate)}/yr`}
                    onClick={() => onChange({ propertyTax: String(Math.round(taxEstimate)) })}
                  />
                )}
              </div>
            }
          >
            <NumberInput
              value={value.propertyTax}
              onChange={v => onChange({ propertyTax: v })}
              placeholder="0"
            />
          </Field>
          <Field
            label="Insurance / yr"
            hint={
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {purchasePrice > 0 && (
                  <>
                    <QuickButton
                      label={`Estimate 0.35%: ${fmtMoneyFull(insuranceEstimate)}/yr`}
                      onClick={() => onChange({ insurance: String(Math.round(insuranceEstimate)) })}
                    />
                    <QuickButton
                      label={`Conservative 0.5%: ${fmtMoneyFull(insuranceConservative)}/yr`}
                      onClick={() =>
                        onChange({ insurance: String(Math.round(insuranceConservative)) })
                      }
                    />
                  </>
                )}
              </div>
            }
          >
            <NumberInput
              value={value.insurance}
              onChange={v => onChange({ insurance: v })}
              placeholder="0"
            />
          </Field>
        </div>
      )}

      {/* Closing costs */}
      {!cash && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: showSellClosing ? 'repeat(2, 1fr)' : '1fr',
            gap: 12,
          }}
        >
          <Field
            label="Closing costs %"
            hint={<Hint>{closingDollar > 0 ? `≈ ${fmtMoneyFull(closingDollar)}` : ' '}</Hint>}
          >
            <NumberInput
              value={value.closingCosts}
              onChange={v => onChange({ closingCosts: v })}
            />
          </Field>
          {showSellClosing && (
            <Field
              label="Sell closing costs %"
              hint={
                <Hint>{sellClosingDollar > 0 ? `≈ ${fmtMoneyFull(sellClosingDollar)} at sale` : ' '}</Hint>
              }
            >
              <NumberInput
                value={value.sellClosingCosts}
                onChange={v => onChange({ sellClosingCosts: v })}
              />
            </Field>
          )}
        </div>
      )}
    </section>
  )
}
