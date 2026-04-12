'use client'

import { useState, useEffect } from 'react'
import SearchBar from '@/components/v2/SearchBar'

export default function Hero({
  isLoggedIn
}: {
  isLoggedIn?: boolean
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () =>
      setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () =>
      window.removeEventListener('resize', check)
  }, [])

  if (isMobile) {
    return (
      <section style={{
        backgroundColor: '#0d0d14',
        width: '100%',
        overflowX: 'hidden',
        padding: '40px 20px 44px',
        position: 'relative'
      }}>
        {/* Dot grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(127,119,221,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }}/>

        {/* Subtle glow */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '280px',
          height: '200px',
          background: 'radial-gradient(ellipse, rgba(83,74,183,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}/>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            borderRadius: 20,
            border: '0.5px solid rgba(127,119,221,0.35)',
            backgroundColor: 'rgba(127,119,221,0.1)',
            color: '#9994b8',
            padding: '5px 14px',
            fontSize: 12,
            marginBottom: 24,
            letterSpacing: '0.2px'
          }}>
            <span style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#7F77DD',
              flexShrink: 0
            }}/>
            Multi-model AI — now in beta
          </div>

          {/* Accent line */}
          <div style={{
            width: 32,
            height: 2,
            background: '#534AB7',
            borderRadius: 2,
            marginBottom: 16
          }}/>

          {/* Headline */}
          <div style={{ marginBottom: 18 }}>
            <h1 style={{
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-1.2px',
              color: '#f0eeff',
              margin: 0
            }}>
              Analyze any
            </h1>
            <h1 style={{
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-1.2px',
              color: '#7F77DD',
              margin: '2px 0'
            }}>
              real estate deal.
            </h1>
            <h2 style={{
              fontSize: 24,
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: '-0.5px',
              color: '#7F77DD',
              margin: '8px 0 0'
            }}>
              With every leading AI model.
            </h2>
          </div>

          {/* Subheading */}
          <p style={{
            fontSize: 15,
            color: '#9994b8',
            lineHeight: 1.7,
            marginBottom: 32,
            maxWidth: 340
          }}>
            Stop copy-pasting into ChatGPT.
            Enter any address and get cap rate,
            cash flow & ROI in 30 seconds.
          </p>

          {/* Search bar */}
          <div style={{ marginBottom: 16 }}>
            <SearchBar userTier={null} />
          </div>

          {/* Hint */}
          <p style={{
            fontSize: 13,
            color: '#4e4a6a',
            marginBottom: 32,
            lineHeight: 1.5
          }}>
            {isLoggedIn ? (
              'Enter any property address to analyze'
            ) : (
              <>
                <span style={{ color: '#534AB7', fontWeight: 500 }}>
                  3 free analyses
                </span>
                {' '}— no card needed
              </>
            )}
          </p>

          {/* Divider */}
          <div style={{
            height: '0.5px',
            background: 'rgba(127,119,221,0.08)',
            marginBottom: 20
          }}/>

          {/* Proof strip — pill badges */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 4
          }}>
            {[
              '10K+ properties analyzed',
              'BRRRR · Flip · Buy & Hold · Hack',
              'Under 30 second results'
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(83,74,183,0.08)',
                border: '0.5px solid rgba(127,119,221,0.2)',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 11,
                color: '#6b6690',
                letterSpacing: '0.1px'
              }}>
                {item}
              </div>
            ))}
          </div>

        </div>
      </section>
    )
  }

  // Desktop layout — unchanged from original
  return (
    <section
      className="hero-section relative overflow-hidden"
      style={{
        backgroundColor: '#0d0d14',
        width: '100%',
        maxWidth: '100vw'
      }}
    >
      <style>{`
        @keyframes v2-pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
        .hero-section { min-height: auto; }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(127,119,221,0.14) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div
        className="hero-glow pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '700px',
          height: '500px',
          background:
            'radial-gradient(ellipse at center, rgba(127,119,221,0.18) 0%, transparent 70%)',
        }}
      />

      <div className="hero-content relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pb-20 pt-28 text-center">
        <div
          className="hero-badge mb-10 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm"
          style={{
            borderColor: 'rgba(127,119,221,0.3)',
            backgroundColor: 'rgba(127,119,221,0.08)',
            color: '#c4bfef',
          }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              backgroundColor: '#7F77DD',
              animation: 'v2-pulse-dot 2s ease-in-out infinite',
            }}
          />
          Multi-model AI property analysis — now in beta
        </div>

        <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          <span className="text-white">Analyze any</span>
          <br />
          <span style={{ color: '#7F77DD' }}>real estate deal.</span>
          <br />
          <span
            className="text-3xl font-semibold sm:text-4xl lg:text-5xl"
            style={{ color: '#9994b8' }}
          >
            With every leading AI model.
          </span>
        </h1>

        <p
          className="mx-auto mt-7 max-w-xl text-lg leading-relaxed"
          style={{ color: '#9994b8' }}
        >
          Stop copy-pasting property addresses into ChatGPT.
          Enter any address. Get cap rate, cash flow & ROI in 30 seconds.
        </p>

        <div className="mt-10 w-full">
          <SearchBar userTier={null} />
        </div>

        <p className="mt-4" style={{ color: '#6b6888', fontSize: 14 }}>
          {isLoggedIn ? (
            'Enter any property address to run your analysis'
          ) : (
            <>
              <span style={{ color: '#7F77DD' }}>3 free analyses</span>
              {' '}— no card needed
            </>
          )}
        </p>

        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          style={{ color: '#7a7693', fontSize: 14 }}
        >
          <span>10,000+ properties analyzed</span>
          <span style={{ color: '#7F77DD' }}>·</span>
          <span>BRRRR · Fix & Flip · Buy & Hold · House Hack</span>
          <span style={{ color: '#7F77DD' }}>·</span>
          <span>Results in under 30 seconds</span>
        </div>
      </div>
    </section>
  )
}
