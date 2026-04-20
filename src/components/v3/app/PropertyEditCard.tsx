'use client'

import type { ReactNode } from 'react'

export type Strategy = 'BRRRR' | 'Fix & Flip' | 'Buy & Hold' | 'House Hack'

export type ArvConfidence = 'Low' | 'Mid' | 'High'
export type LoanType = 'FHA' | 'Conventional'
export type LoanTerm = 15 | 20 | 30

export type EditableProperty = {
  // Universal
  beds: string
  baths: string
  sqft: string
  yearBuilt: string
  listPrice: string
  estimatedValue: string
  estimatedRent: string
  // BRRRR / Flip
  arv: string
  rehabCost: string
  arvConfidence: ArvConfidence
  // Buy & Hold
  downPaymentPercent: string
  interestRate: string
  loanTerm: LoanTerm
  // House Hack
  loanType: LoanType
  units: string
}

export function inferUnitCount(propertyType: string | undefined): number {
  const pt = (propertyType || '').toLowerCase()
  if (pt.includes('duplex')) return 2
  if (pt.includes('triplex')) return 3
  if (
    pt.includes('fourplex') ||
    pt.includes('quadplex') ||
    pt.includes('4-plex') ||
    pt.includes('4 plex')
  )
    return 4
  return 1
}

export function makeInitialEditable(
  strategy: Strategy,
  source: {
    beds?: number
    baths?: number
    sqft?: number
    yearBuilt?: number
    propertyType?: string
    listPrice?: number | null
    estimatedValue?: number
    estimatedRent?: number
  }
): EditableProperty {
  const avm = source.estimatedValue || source.listPrice || 0
  const arvDefault = avm ? Math.round(avm * 1.15) : 0
  const units = inferUnitCount(source.propertyType)
  const defaultDp =
    strategy === 'House Hack' ? '3.5' : strategy === 'Buy & Hold' ? '20' : '20'
  const defaultLoanType: LoanType = strategy === 'House Hack' ? 'FHA' : 'Conventional'
  return {
    beds: source.beds != null ? String(source.beds) : '',
    baths: source.baths != null ? String(source.baths) : '',
    sqft: source.sqft != null ? String(source.sqft) : '',
    yearBuilt: source.yearBuilt != null ? String(source.yearBuilt) : '',
    listPrice: source.listPrice ? String(source.listPrice) : avm ? String(avm) : '',
    estimatedValue: avm ? String(avm) : '',
    estimatedRent: source.estimatedRent != null ? String(source.estimatedRent) : '',
    arv: arvDefault ? String(arvDefault) : '',
    rehabCost: '40000',
    arvConfidence: 'Mid',
    downPaymentPercent: defaultDp,
    interestRate: '7.5',
    loanTerm: 30,
    loanType: defaultLoanType,
    units: String(units),
  }
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  letterSpacing: '0.12em',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--elevated)',
  border: '1px solid var(--hairline)',
  borderRadius: 6,
  padding: '8px 12px',
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 140ms ease',
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: 'numeric' | 'decimal' | 'text'
}) {
  return (
    <input
      type="text"
      inputMode={inputMode || 'text'}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={inputStyle}
      onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
    />
  )
}

function ChipRow<T extends string | number>({
  options,
  value,
  onChange,
  formatLabel,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  formatLabel?: (v: T) => string
}) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = opt === value
        return (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              background: active ? 'var(--indigo-dim)' : 'var(--surface)',
              color: active ? 'var(--indigo-hover)' : 'var(--text-secondary)',
              border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
              borderRadius: 999,
              padding: '5px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 140ms ease',
            }}
          >
            {formatLabel ? formatLabel(opt) : String(opt)}
          </button>
        )
      })}
    </div>
  )
}

type Props = {
  strategy: Strategy
  value: EditableProperty
  onChange: (patch: Partial<EditableProperty>) => void
  onRunAnalysis: () => void
  submitting?: boolean
}

export default function PropertyEditCard({
  strategy,
  value,
  onChange,
  onRunAnalysis,
  submitting,
}: Props) {
  const showBrrrFlip = strategy === 'BRRRR' || strategy === 'Fix & Flip'
  const showBuyHold = strategy === 'Buy & Hold'
  const showHouseHack = strategy === 'House Hack'

  return (
    <section
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 12,
        padding: 22,
        marginTop: 16,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.14em',
          color: 'var(--indigo-hover)',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        PROPERTY DATA — VERIFY BEFORE ANALYSIS
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <Field label="List price">
          <TextInput
            value={value.listPrice}
            onChange={v => onChange({ listPrice: v })}
            placeholder="0"
            inputMode="numeric"
          />
        </Field>
        <Field label="AVM / Estimated value">
          <TextInput
            value={value.estimatedValue}
            onChange={v => onChange({ estimatedValue: v })}
            placeholder="0"
            inputMode="numeric"
          />
        </Field>
        <Field label="Estimated rent / mo">
          <TextInput
            value={value.estimatedRent}
            onChange={v => onChange({ estimatedRent: v })}
            placeholder="0"
            inputMode="numeric"
          />
        </Field>
        <Field label="Year built">
          <TextInput
            value={value.yearBuilt}
            onChange={v => onChange({ yearBuilt: v })}
            placeholder=""
            inputMode="numeric"
          />
        </Field>
        <Field label="Beds">
          <TextInput
            value={value.beds}
            onChange={v => onChange({ beds: v })}
            inputMode="numeric"
          />
        </Field>
        <Field label="Baths">
          <TextInput
            value={value.baths}
            onChange={v => onChange({ baths: v })}
            inputMode="decimal"
          />
        </Field>
        <Field label="Sqft">
          <TextInput
            value={value.sqft}
            onChange={v => onChange({ sqft: v })}
            inputMode="numeric"
          />
        </Field>
      </div>

      {showBrrrFlip && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 18,
            borderTop: '1px solid var(--hairline)',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          <Field label="After repair value (ARV)">
            <TextInput
              value={value.arv}
              onChange={v => onChange({ arv: v })}
              inputMode="numeric"
            />
          </Field>
          <Field label="Rehab cost">
            <TextInput
              value={value.rehabCost}
              onChange={v => onChange({ rehabCost: v })}
              inputMode="numeric"
            />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="ARV confidence">
              <ChipRow
                options={['Low', 'Mid', 'High'] as const}
                value={value.arvConfidence}
                onChange={v => onChange({ arvConfidence: v })}
              />
            </Field>
          </div>
        </div>
      )}

      {showBuyHold && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 18,
            borderTop: '1px solid var(--hairline)',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          <Field label="Down payment %">
            <TextInput
              value={value.downPaymentPercent}
              onChange={v => onChange({ downPaymentPercent: v })}
              inputMode="decimal"
            />
          </Field>
          <Field label="Interest rate %">
            <TextInput
              value={value.interestRate}
              onChange={v => onChange({ interestRate: v })}
              inputMode="decimal"
            />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Loan term">
              <ChipRow
                options={[30, 20, 15] as const}
                value={value.loanTerm}
                onChange={v => onChange({ loanTerm: v })}
                formatLabel={v => `${v}yr`}
              />
            </Field>
          </div>
        </div>
      )}

      {showHouseHack && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 18,
            borderTop: '1px solid var(--hairline)',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          <Field label="Down payment %">
            <TextInput
              value={value.downPaymentPercent}
              onChange={v => onChange({ downPaymentPercent: v })}
              inputMode="decimal"
            />
          </Field>
          <Field label="Number of units">
            <TextInput
              value={value.units}
              onChange={v => onChange({ units: v })}
              inputMode="numeric"
            />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Loan type">
              <ChipRow
                options={['FHA', 'Conventional'] as const}
                value={value.loanType}
                onChange={v => onChange({ loanType: v })}
              />
            </Field>
          </div>
        </div>
      )}

      <button
        type="button"
        className="app-btn"
        onClick={onRunAnalysis}
        disabled={submitting}
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: '12px 16px',
          fontSize: 14,
          marginTop: 22,
        }}
      >
        {submitting ? 'Running…' : 'Looks good — Run Analysis →'}
      </button>
    </section>
  )
}
