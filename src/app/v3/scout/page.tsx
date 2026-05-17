'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SignalBadge from '@/components/v3/public/SignalBadge'
import type { Signal } from '@/lib/v3-analysis-parser'

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const TARGET_METROS = [
  'Kansas City, MO', 'Memphis, TN', 'Tampa, FL', 'Indianapolis, IN',
  'Cleveland, OH', 'Detroit, MI', 'Columbus, OH', 'Birmingham, AL',
  'Little Rock, AR', 'Oklahoma City, OK', 'San Antonio, TX', 'Houston, TX',
  'Dallas, TX', 'Phoenix, AZ', 'Las Vegas, NV', 'Atlanta, GA',
  'Charlotte, NC', 'Raleigh, NC', 'Jacksonville, FL', 'Orlando, FL',
  'Pittsburgh, PA', 'Baltimore, MD', 'St. Louis, MO', 'Cincinnati, OH',
]

const STRATEGIES = ['BRRRR', 'Fix & Flip', 'Buy & Hold', 'House Hack'] as const
const PROPERTY_TYPES = ['SFR', 'Duplex', 'Triplex', 'Fourplex', 'Multi-Family'] as const

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type ScoutConfig = {
  enabled: boolean
  strategy: string
  target_metros: string[]
  max_purchase_price: string
  min_deal_score: string
  min_cap_rate: string
  min_coc: string
  max_rehab_budget: string
  min_arv_margin: string
  property_types: string[]
  max_days_on_market: string
  min_beds: string
  zip_codes: string
}

type ScoutResult = {
  id: string
  address: string
  city: string
  state: string
  metro: string
  strategy: string
  deal_score: number
  cap_rate: number | null
  coc: number | null
  purchase_price: number
  arv: number | null
  rehab_estimate: number | null
  monthly_cash_flow: number | null
  days_on_market: number
  property_type: string
  beds: number
  baths: number
  sqft: number
  signal: string
  ai_summary: string
  is_read: boolean
  is_saved: boolean
  run_date: string
}

/* ------------------------------------------------------------------ */
/*  Mock data (used until backend is live)                              */
/* ------------------------------------------------------------------ */

const MOCK_RESULTS: ScoutResult[] = [
  {
    id: '1', address: '2847 Magnolia Ave', city: 'Memphis', state: 'TN', metro: 'Memphis, TN',
    strategy: 'BRRRR', deal_score: 8.2, cap_rate: 11.4, coc: 14.2, purchase_price: 89000,
    arv: 145000, rehab_estimate: 28000, monthly_cash_flow: 620, days_on_market: 12,
    property_type: 'SFR', beds: 3, baths: 1, sqft: 1240, signal: 'STRONG BUY',
    ai_summary: 'Strong BRRRR candidate. Purchase price leaves $28K equity capture after rehab. DSCR of 1.42 comfortably services debt. Comparable rentals at $1,100-1,200/mo confirm rent estimate.',
    is_read: false, is_saved: false, run_date: new Date().toISOString(),
  },
  {
    id: '2', address: '1290 N Prospect Rd', city: 'Indianapolis', state: 'IN', metro: 'Indianapolis, IN',
    strategy: 'Buy & Hold', deal_score: 7.8, cap_rate: 9.6, coc: 11.8, purchase_price: 142000,
    arv: null, rehab_estimate: null, monthly_cash_flow: 410, days_on_market: 7,
    property_type: 'SFR', beds: 4, baths: 2, sqft: 1680, signal: 'BUY',
    ai_summary: 'Solid long-term hold. Cap rate exceeds market average by 2.1%. Property tax is low for the area at $1,840/yr. Rent estimate conservative — actual market rent likely $50-100 higher.',
    is_read: false, is_saved: true, run_date: new Date().toISOString(),
  },
  {
    id: '3', address: '3104 Clearwater Blvd', city: 'Tampa', state: 'FL', metro: 'Tampa, FL',
    strategy: 'BRRRR', deal_score: 7.4, cap_rate: 10.2, coc: 12.1, purchase_price: 198000,
    arv: 295000, rehab_estimate: 45000, monthly_cash_flow: 380, days_on_market: 19,
    property_type: 'Duplex', beds: 4, baths: 2, sqft: 1900, signal: 'BUY',
    ai_summary: 'Duplex with strong unit economics. Unit A rented at $1,050/mo, Unit B vacant — rent upside on stabilization. Rehab focused on Unit B cosmetics ($12K) and deferred maintenance.',
    is_read: true, is_saved: false, run_date: new Date(Date.now() - 86400000).toISOString(),
  },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmtMoney(n: number | null | undefined): string {
  if (n == null) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}K`
  return `$${Math.round(n)}`
}

function fmtPct(n: number | null | undefined): string {
  if (n == null) return '—'
  return `${n.toFixed(1)}%`
}

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const defaultConfig: ScoutConfig = {
  enabled: true,
  strategy: 'BRRRR',
  target_metros: ['Kansas City, MO', 'Memphis, TN', 'Indianapolis, IN'],
  max_purchase_price: '300000',
  min_deal_score: '7.0',
  min_cap_rate: '8.0',
  min_coc: '10.0',
  max_rehab_budget: '60000',
  min_arv_margin: '20',
  property_types: ['SFR'],
  max_days_on_market: '30',
  min_beds: '2',
  zip_codes: '',
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function V3ScoutPage() {
  const router = useRouter()
  const [config, setConfig] = useState<ScoutConfig>(defaultConfig)
  const [results, setResults] = useState<ScoutResult[]>(MOCK_RESULTS)
  const [selectedResult, setSelectedResult] = useState<ScoutResult | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [activeTab, setActiveTab] = useState<'feed' | 'config'>('feed')
  const [, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setLoading(false)
        return
      }

      // Load scout config
      const { data: configData } = await supabase
        .from('scout_configs')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (configData) {
        setConfig({
          enabled: configData.enabled,
          strategy: configData.strategy || 'BRRRR',
          target_metros: configData.target_metros || [],
          max_purchase_price: String(configData.max_purchase_price || '300000'),
          min_deal_score: String(configData.min_deal_score || '7.0'),
          min_cap_rate: String(configData.min_cap_rate || '8.0'),
          min_coc: String(configData.min_coc || '10.0'),
          max_rehab_budget: String(configData.max_rehab_budget || '60000'),
          min_arv_margin: String(configData.min_arv_margin || '20'),
          property_types: configData.property_types || ['SFR'],
          max_days_on_market: String(configData.max_days_on_market || '30'),
          min_beds: String(configData.min_beds || '2'),
          zip_codes: (configData.zip_codes || []).join(', '),
        })
      }

      // Load scout results
      const { data: resultsData } = await supabase
        .from('scout_results')
        .select('*')
        .eq('user_id', session.user.id)
        .order('run_date', { ascending: false })
        .limit(50)

      if (resultsData && resultsData.length > 0) {
        setResults(resultsData as ScoutResult[])
      }

      setLoading(false)
    }
    loadData()
  }, [])

  const unreadCount = results.filter(r => !r.is_read).length

  const updateConfig = (patch: Partial<ScoutConfig>) =>
    setConfig(prev => ({ ...prev, ...patch }))

  const toggleMetro = (metro: string) => {
    setConfig(prev => ({
      ...prev,
      target_metros: prev.target_metros.includes(metro)
        ? prev.target_metros.filter(m => m !== metro)
        : [...prev.target_metros, metro],
    }))
  }

  const togglePropertyType = (pt: string) => {
    setConfig(prev => ({
      ...prev,
      property_types: prev.property_types.includes(pt)
        ? prev.property_types.filter(t => t !== pt)
        : [...prev.property_types, pt],
    }))
  }

  const markRead = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, is_read: true } : r))
  }

  const toggleSaved = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, is_saved: !r.is_saved } : r))
  }

  const handleSaveConfig = async () => {
    setSaveState('saving')
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        console.error('[Scout] No session found')
        setSaveState('idle')
        return
      }

      console.log('[Scout] Saving config for user:', session.user.id)

      const upsertData = {
        user_id: session.user.id,
        enabled: config.enabled,
        strategy: config.strategy,
        target_metros: config.target_metros,
        max_purchase_price: parseInt(config.max_purchase_price) || null,
        min_deal_score: parseFloat(config.min_deal_score) || 7.0,
        min_cap_rate: parseFloat(config.min_cap_rate) || null,
        min_coc: parseFloat(config.min_coc) || null,
        max_rehab_budget: parseInt(config.max_rehab_budget) || null,
        min_arv_margin: parseFloat(config.min_arv_margin) || null,
        property_types: config.property_types,
        max_days_on_market: parseInt(config.max_days_on_market) || 30,
        min_beds: parseInt(config.min_beds) || 2,
        zip_codes: config.zip_codes
          ? config.zip_codes.split(',').map((z: string) => z.trim()).filter(Boolean)
          : [],
        updated_at: new Date().toISOString(),
      }

      console.log('[Scout] Upsert data:', JSON.stringify(upsertData))

      const { data, error } = await supabase
        .from('scout_configs')
        .upsert(upsertData, { onConflict: 'user_id' })
        .select()

      if (error) {
        console.error('[Scout] Save error:', error.code, error.message, error.details)
        alert(`Save failed: ${error.message}`)
        setSaveState('idle')
        return
      }

      console.log('[Scout] Save successful:', data)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    } catch (err) {
      console.error('[Scout] Unexpected error:', err)
      setSaveState('idle')
    }
  }

  const handleAnalyzeDeal = (result: ScoutResult) => {
    router.push(`/v3/analyze?address=${encodeURIComponent(result.address + ', ' + result.city + ', ' + result.state)}`)
  }

  /* ---- input style ---- */
  const inp: React.CSSProperties = {
    width: '100%', background: 'var(--elevated)', border: '1px solid var(--border)',
    borderRadius: 6, padding: '8px 10px', fontFamily: 'var(--font-mono)',
    fontSize: 12, color: 'var(--text)', outline: 'none',
  }

  const lbl: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em',
    color: 'var(--text-muted)', textTransform: 'uppercase' as const,
    display: 'block', marginBottom: 5, fontWeight: 600,
  }

  return (
    <div style={{ padding: '24px 28px 80px', maxWidth: 1440, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--indigo-hover)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
            Deal Scout
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Your autonomous deal finder
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Scout status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface)', border: '1px solid var(--hairline)',
            borderRadius: 999, padding: '7px 14px',
            fontFamily: 'var(--font-mono)', fontSize: 11,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: config.enabled ? '#34D399' : 'var(--text-muted)',
              boxShadow: config.enabled ? '0 0 0 4px rgba(52,211,153,0.2)' : 'none',
              animation: config.enabled ? 'v3-pulse 1.8s ease-in-out infinite' : 'none',
            }} />
            <span style={{ color: config.enabled ? '#34D399' : 'var(--text-muted)' }}>
              {config.enabled ? 'Scout active' : 'Scout paused'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateConfig({ enabled: !config.enabled })}
            className="app-btn-ghost"
            style={{ padding: '7px 14px', fontSize: 12 }}
          >
            {config.enabled ? 'Pause' : 'Resume'}
          </button>
          <button
            type="button"
            className="app-btn"
            style={{ padding: '7px 14px', fontSize: 12 }}
            onClick={async () => {
              const res = await fetch('/api/v3/scout/trigger', {
                method: 'POST',
                credentials: 'include',
              })
              if (res.ok) {
                alert('Scout run triggered. Check back in a few minutes for results.')
              }
            }}
          >
            Run Scout now
          </button>
        </div>
      </div>

      {/* Agent status bar */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--hairline)',
        borderRadius: 10, padding: '14px 18px', marginBottom: 22,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16,
      }}>
        {[
          { label: 'NEXT RUN', value: '04:00 AM PT' },
          { label: 'LAST RUN', value: 'Today 04:00 AM' },
          { label: 'DEALS FOUND', value: `${results.length} total` },
          { label: 'UNREAD', value: String(unreadCount), color: unreadCount > 0 ? 'var(--indigo-hover)' : 'var(--text)' },
          { label: 'METROS ACTIVE', value: String(config.target_metros.length) },
          { label: 'STRATEGY', value: config.strategy },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: s.color || 'var(--text)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tab toggle */}
      <div style={{
        display: 'inline-flex', padding: 2,
        background: 'var(--elevated)', border: '1px solid var(--hairline)',
        borderRadius: 10, marginBottom: 22,
      }}>
        {([
          { key: 'feed', label: unreadCount > 0 ? `Deal Feed  ${unreadCount}` : 'Deal Feed' },
          { key: 'config', label: 'Configure Scout' },
        ] as const).map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            style={{
              background: activeTab === t.key ? 'var(--indigo)' : 'transparent',
              color: activeTab === t.key ? '#fff' : 'var(--text-secondary)',
              border: 'none', borderRadius: 8, padding: '8px 18px',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 500,
              transition: 'all 140ms ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* FEED TAB */}
      {activeTab === 'feed' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedResult ? '1fr 400px' : '1fr', gap: 16 }}>
          {/* Deal list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.length === 0 ? (
              <div style={{
                background: 'var(--surface)', border: '1px dashed var(--hairline)',
                borderRadius: 12, padding: '48px 24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>
                  No deals found yet
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
                  Scout runs nightly at 4 AM PT. Configure your filters and check back tomorrow.
                </div>
                <button type="button" className="app-btn-ghost"
                  style={{ padding: '8px 16px', fontSize: 12 }}
                  onClick={() => setActiveTab('config')}>
                  Configure filters →
                </button>
              </div>
            ) : results.map(result => (
              <div
                key={result.id}
                onClick={() => { setSelectedResult(result); markRead(result.id) }}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${selectedResult?.id === result.id ? 'var(--border-strong)' : 'var(--hairline)'}`,
                  borderLeft: `3px solid ${!result.is_read ? 'var(--indigo)' : 'transparent'}`,
                  borderRadius: 10, padding: '16px 18px', cursor: 'pointer',
                  transition: 'border-color 140ms ease',
                  opacity: result.is_read ? 0.8 : 1,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = selectedResult?.id === result.id ? 'var(--border-strong)' : 'var(--hairline)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      {!result.is_read && (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--indigo)', flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{result.address}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {result.city}, {result.state} · {result.property_type} · {result.beds}bd/{result.baths}ba · {result.sqft.toLocaleString()}sf
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <SignalBadge signal={result.signal as Signal} />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); toggleSaved(result.id) }}
                      style={{
                        background: result.is_saved ? 'var(--indigo-dim)' : 'transparent',
                        border: `1px solid ${result.is_saved ? 'var(--border-strong)' : 'var(--border)'}`,
                        borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: 10,
                        color: result.is_saved ? 'var(--indigo-hover)' : 'var(--text-muted)',
                      }}
                    >
                      {result.is_saved ? '★ Saved' : '☆ Save'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                  {[
                    { label: 'PRICE', value: fmtMoney(result.purchase_price) },
                    { label: 'SCORE', value: `${result.deal_score}/10`, color: result.deal_score >= 7 ? '#34D399' : result.deal_score >= 5 ? 'var(--amber)' : '#F87171' },
                    { label: 'CAP', value: fmtPct(result.cap_rate), color: 'var(--indigo-hover)' },
                    { label: 'COC', value: fmtPct(result.coc), color: 'var(--indigo-hover)' },
                    { label: 'DOM', value: `${result.days_on_market}d` },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>
                        {m.label}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: m.color || 'var(--text)' }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selectedResult && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--hairline)',
              borderRadius: 12, padding: 20, position: 'sticky', top: 80,
              alignSelf: 'flex-start', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <SignalBadge signal={selectedResult.signal as Signal} />
                <button type="button" onClick={() => setSelectedResult(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>
                  ×
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>
                  {selectedResult.address}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                  {selectedResult.city}, {selectedResult.state} · {selectedResult.metro}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Found {fmtRelative(selectedResult.run_date)} · {selectedResult.days_on_market}d on market
                </div>
              </div>

              {/* Score */}
              <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--elevated)', borderRadius: 8 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Deal Score</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em',
                  color: selectedResult.deal_score >= 7 ? '#34D399' : selectedResult.deal_score >= 5 ? 'var(--amber)' : '#F87171' }}>
                  {selectedResult.deal_score}<span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>/10</span>
                </div>
              </div>

              {/* Key metrics grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'PURCHASE PRICE', value: fmtMoney(selectedResult.purchase_price) },
                  { label: 'ARV', value: fmtMoney(selectedResult.arv) },
                  { label: 'REHAB EST.', value: fmtMoney(selectedResult.rehab_estimate) },
                  { label: 'MONTHLY CF', value: fmtMoney(selectedResult.monthly_cash_flow) },
                  { label: 'CAP RATE', value: fmtPct(selectedResult.cap_rate) },
                  { label: 'CASH-ON-CASH', value: fmtPct(selectedResult.coc) },
                ].map(m => (
                  <div key={m.label} style={{ background: 'var(--elevated)', borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* AI Summary */}
              {selectedResult.ai_summary && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--indigo-hover)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, fontWeight: 600 }}>
                    Scout Analysis
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    {selectedResult.ai_summary}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button type="button" className="app-btn"
                  style={{ width: '100%', padding: '11px 16px', fontSize: 13 }}
                  onClick={() => handleAnalyzeDeal(selectedResult)}>
                  Run full analysis →
                </button>
                <button type="button"
                  onClick={() => toggleSaved(selectedResult.id)}
                  className="app-btn-ghost"
                  style={{ width: '100%', padding: '10px 16px', fontSize: 13 }}>
                  {selectedResult.is_saved ? '★ Remove from saved' : '☆ Save to pipeline'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONFIG TAB */}
      {activeTab === 'config' && (
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Scout toggle */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 10, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>Scout enabled</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Scout runs nightly at 4 AM PT and emails matching deals by 6 AM.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfig({ enabled: !config.enabled })}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: config.enabled ? 'var(--indigo)' : 'var(--elevated)',
                    position: 'relative', transition: 'background 140ms ease', flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: config.enabled ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    transition: 'left 140ms ease',
                  }} />
                </button>
              </div>
            </div>

            {/* Strategy */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 10, padding: 18 }}>
              <label style={lbl}>Investment Strategy</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STRATEGIES.map(s => (
                  <button key={s} type="button"
                    onClick={() => updateConfig({ strategy: s })}
                    style={{
                      background: config.strategy === s ? 'var(--indigo-dim)' : 'var(--elevated)',
                      color: config.strategy === s ? 'var(--indigo-hover)' : 'var(--text-secondary)',
                      border: `1px solid ${config.strategy === s ? 'var(--border-strong)' : 'var(--border)'}`,
                      borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                      fontFamily: 'var(--font-mono)', fontSize: 12, transition: 'all 140ms ease',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Target metros */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 10, padding: 18 }}>
              <label style={lbl}>Target Markets ({config.target_metros.length} selected)</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 180, overflowY: 'auto' }}>
                {TARGET_METROS.map(m => {
                  const active = config.target_metros.includes(m)
                  return (
                    <button key={m} type="button" onClick={() => toggleMetro(m)}
                      style={{
                        background: active ? 'var(--indigo-dim)' : 'var(--elevated)',
                        color: active ? 'var(--indigo-hover)' : 'var(--text-secondary)',
                        border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
                        borderRadius: 999, padding: '4px 10px', cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: 11, transition: 'all 140ms ease',
                      }}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Financial filters */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 10, padding: 18 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--indigo-hover)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>
                Financial Filters
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Max Purchase Price', key: 'max_purchase_price', placeholder: '300000' },
                  { label: 'Min Deal Score (0-10)', key: 'min_deal_score', placeholder: '7.0' },
                  { label: 'Min Cap Rate %', key: 'min_cap_rate', placeholder: '8.0' },
                  { label: 'Min Cash-on-Cash %', key: 'min_coc', placeholder: '10.0' },
                  { label: 'Max Rehab Budget', key: 'max_rehab_budget', placeholder: '60000' },
                  { label: 'Min ARV Margin %', key: 'min_arv_margin', placeholder: '20' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={lbl}>{f.label}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={(config as any)[f.key]}
                      onChange={e => updateConfig({ [f.key]: e.target.value } as any)}
                      placeholder={f.placeholder}
                      style={inp}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Property filters */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 10, padding: 18 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--indigo-hover)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 14 }}>
                Property Filters
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Property Types</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PROPERTY_TYPES.map(pt => {
                    const active = config.property_types.includes(pt)
                    return (
                      <button key={pt} type="button" onClick={() => togglePropertyType(pt)}
                        style={{
                          background: active ? 'var(--indigo-dim)' : 'var(--elevated)',
                          color: active ? 'var(--indigo-hover)' : 'var(--text-secondary)',
                          border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
                          borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                          fontFamily: 'var(--font-mono)', fontSize: 11, transition: 'all 140ms ease',
                        }}
                      >
                        {pt}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Min Beds', key: 'min_beds', placeholder: '2' },
                  { label: 'Max Days on Market', key: 'max_days_on_market', placeholder: '30' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={lbl}>{f.label}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={(config as any)[f.key]}
                      onChange={e => updateConfig({ [f.key]: e.target.value } as any)}
                      placeholder={f.placeholder}
                      style={inp}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    />
                  </div>
                ))}
                <div>
                  <label style={lbl}>Zip Codes (optional)</label>
                  <input
                    type="text"
                    value={config.zip_codes}
                    onChange={e => updateConfig({ zip_codes: e.target.value })}
                    placeholder="64101, 38103..."
                    style={inp}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>
            </div>

            {/* Save */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="app-btn"
                style={{ padding: '11px 24px', fontSize: 14,
                  background: saveState === 'saved' ? '#34D399' : undefined }}
                onClick={handleSaveConfig}
                disabled={saveState === 'saving'}
              >
                {saveState === 'saved' ? '✓ Saved' : saveState === 'saving' ? 'Saving…' : 'Save filters →'}
              </button>
              <button
                type="button"
                className="app-btn-ghost"
                style={{ padding: '11px 16px', fontSize: 14 }}
                onClick={() => setConfig(defaultConfig)}
              >
                Reset to defaults
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
