'use client'

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMapsAPI } from '@/lib/google-maps-loader'

type Prediction = {
  placeId: string
  description: string
}

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
  disabled?: boolean
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSubmit,
  placeholder = 'Enter property address...',
  disabled,
}: Props) {
  const [ready, setReady] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [open, setOpen] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number>(-1)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serviceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokenRef = useRef<any>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    loadGoogleMapsAPI()
      .then(() => {
        if (cancelled) return
        const g = (window as unknown as {
          google?: {
            maps?: {
              places?: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                AutocompleteService?: any
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                AutocompleteSessionToken?: any
              }
            }
          }
        }).google
        const places = g?.maps?.places
        if (places?.AutocompleteService && places.AutocompleteSessionToken) {
          serviceRef.current = new places.AutocompleteService()
          tokenRef.current = new places.AutocompleteSessionToken()
          setReady(true)
        }
      })
      .catch(() => {
        // Silent fallback — plain input keeps working.
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const fetchPredictions = (input: string) => {
    if (!ready || !serviceRef.current || input.length < 3) {
      setPredictions([])
      setOpen(false)
      return
    }
    serviceRef.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'us' },
        types: ['address'],
        sessionToken: tokenRef.current,
      },
      (results: Array<{ place_id: string; description: string }> | null) => {
        if (!results || results.length === 0) {
          setPredictions([])
          setOpen(false)
          return
        }
        setPredictions(
          results.slice(0, 5).map(r => ({ placeId: r.place_id, description: r.description }))
        )
        setOpen(true)
        setHoveredIdx(-1)
      }
    )
  }

  const handleChange = (v: string) => {
    onChange(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchPredictions(v), 180)
  }

  const selectPrediction = (p: Prediction) => {
    onChange(p.description)
    setOpen(false)
    setPredictions([])
    // New session after a selection — per Places API billing best practice.
    const g = (window as unknown as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      google?: { maps?: { places?: { AutocompleteSessionToken?: any } } }
    }).google
    const TokenCtor = g?.maps?.places?.AutocompleteSessionToken
    if (TokenCtor) tokenRef.current = new TokenCtor()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || predictions.length === 0) {
      if (e.key === 'Enter' && onSubmit) {
        e.preventDefault()
        onSubmit()
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHoveredIdx(i => (i + 1) % predictions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHoveredIdx(i => (i <= 0 ? predictions.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (hoveredIdx >= 0) {
        selectPrediction(predictions[hoveredIdx])
      } else if (onSubmit) {
        onSubmit()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <input
        type="text"
        value={value}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => {
          if (predictions.length > 0) setOpen(true)
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        style={{
          width: '100%',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text)',
          padding: '8px 0',
        }}
      />
      {open && predictions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: 'var(--elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            listStyle: 'none',
            padding: 4,
            margin: 0,
            zIndex: 50,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          }}
        >
          {predictions.map((p, i) => {
            const hovered = i === hoveredIdx
            return (
              <li key={p.placeId}>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onClick={() => selectPrediction(p)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--text)',
                    background: hovered ? 'var(--indigo-dim)' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 14px',
                    cursor: 'pointer',
                  }}
                >
                  {p.description}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
