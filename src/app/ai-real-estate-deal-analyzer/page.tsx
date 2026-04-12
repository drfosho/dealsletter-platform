import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Real Estate Deal Analyzer — BRRRR, Fix & Flip, Buy & Hold, House Hack',
  description: 'Analyze any investment property in 30 seconds. Get cash flow, cap rate, ROI, and AI-powered insights for BRRRR, Fix & Flip, Buy & Hold, and House Hack strategies. Free to start.',
  keywords: [
    'AI real estate deal analyzer',
    'real estate investment analysis',
    'property deal analyzer',
    'AI property analysis tool',
    'real estate ROI calculator',
  ],
  alternates: {
    canonical: 'https://dealsletter.io/ai-real-estate-deal-analyzer',
  },
  openGraph: {
    title: 'AI Real Estate Deal Analyzer | Dealsletter',
    description: 'Analyze any investment property in 30 seconds with AI.',
    url: 'https://dealsletter.io/ai-real-estate-deal-analyzer',
    type: 'website',
  },
}

export default function HubPage() {
  return (
    <main style={{
      background: '#0d0d14',
      minHeight: '100vh',
      color: '#f0eeff',
      fontFamily: 'inherit',
    }}>
      {/* Hero */}
      <section style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 800,
          letterSpacing: '-1px',
          lineHeight: 1.15,
          marginBottom: 20,
          color: '#f0eeff',
        }}>
          AI Real Estate Deal Analyzer for BRRRR, Fix &amp; Flip, Buy &amp; Hold, and House Hack
        </h1>
        <p style={{
          fontSize: 18,
          color: '#9994b8',
          lineHeight: 1.7,
          marginBottom: 32,
          maxWidth: 600,
          margin: '0 auto 32px',
        }}>
          Enter any property address and get a full investment analysis
          powered by Claude, GPT-4o, and Grok 3 — in under 30 seconds.
          No spreadsheet needed.
        </p>
        <Link href="/v2/analyze" style={{
          display: 'inline-block',
          background: '#6366F1',
          color: '#fff',
          padding: '14px 32px',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 16,
          textDecoration: 'none',
        }}>
          Analyze a deal free →
        </Link>
      </section>

      {/* Strategy sections */}
      <section style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '0 24px 80px',
      }}>

        {/* BRRRR */}
        <div style={{
          borderTop: '0.5px solid rgba(127,119,221,0.2)',
          paddingTop: 48,
          marginBottom: 48,
        }}>
          <h2 style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#f0eeff',
            marginBottom: 16,
          }}>
            AI BRRRR Calculator for Any Address
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
            marginBottom: 16,
          }}>
            The BRRRR method — Buy, Rehab, Rent, Refinance, Repeat — is one
            of the most powerful wealth-building strategies in real estate.
            But modeling it correctly requires accurate ARV estimates, refi
            waterfall projections, and cash-on-cash return calculations that
            most spreadsheets get wrong. Dealsletter pulls live comparable
            sales data, estimates your after-repair value, and models the
            full equity capture cycle automatically. You get a clear picture
            of whether you can pull out your initial capital — and how much
            cash flow remains after the refi.
          </p>
          <Link href="/ai-brrrr-calculator" style={{
            color: '#6366F1',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            Run a BRRRR analysis →
          </Link>
        </div>

        {/* Fix & Flip */}
        <div style={{
          borderTop: '0.5px solid rgba(127,119,221,0.2)',
          paddingTop: 48,
          marginBottom: 48,
        }}>
          <h2 style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#f0eeff',
            marginBottom: 16,
          }}>
            AI Fix and Flip Analyzer With Live ARV and Rehab Modeling
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
            marginBottom: 16,
          }}>
            Flipping houses is a numbers game. Your profit margin is locked
            in the moment you make the offer — which means your ARV estimate
            and rehab budget need to be right before you close. Our AI fix
            and flip analyzer pulls comparable sales from your target market,
            calculates a defensible ARV range, and models your net profit
            after purchase costs, rehab, holding costs, and sell-side closing
            fees. You can stress test different rehab budgets and holding
            periods to see exactly how sensitive your margin is to timeline
            slippage.
          </p>
          <Link href="/ai-fix-and-flip-analyzer" style={{
            color: '#6366F1',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            Analyze a flip →
          </Link>
        </div>

        {/* Buy & Hold */}
        <div style={{
          borderTop: '0.5px solid rgba(127,119,221,0.2)',
          paddingTop: 48,
          marginBottom: 48,
        }}>
          <h2 style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#f0eeff',
            marginBottom: 16,
          }}>
            Buy and Hold Rental Analysis: Cash Flow, Cap Rate, and ROI
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
            marginBottom: 16,
          }}>
            Long-term rental properties build wealth slowly and steadily —
            but only if the numbers work from day one. Our AI buy and hold
            calculator pulls live rent estimates from your market, models
            your monthly cash flow after PITI and vacancy, calculates cap
            rate against current market comps, and projects your 5, 10,
            and 30-year returns including appreciation. Whether you are
            evaluating a single family rental, a small multifamily, or a
            value-add property, you get the same analysis a seasoned investor
            would run — in seconds.
          </p>
          <Link href="/ai-buy-and-hold-calculator" style={{
            color: '#6366F1',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            Run a rental analysis →
          </Link>
        </div>

        {/* House Hack */}
        <div style={{
          borderTop: '0.5px solid rgba(127,119,221,0.2)',
          paddingTop: 48,
          marginBottom: 48,
        }}>
          <h2 style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#f0eeff',
            marginBottom: 16,
          }}>
            House Hack Analysis: Live-In and Let Tenants Pay Your Mortgage
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
            marginBottom: 16,
          }}>
            House hacking is the fastest way for new investors to enter the
            market with minimal risk. By occupying one unit of a duplex,
            triplex, or fourplex — or renting out rooms in a single family
            home — you can offset your mortgage with rental income, build
            equity, and qualify for owner-occupied financing with as little
            as 3.5 percent down. Our house hack analyzer models your net
            monthly cost after rental income, compares it against renting
            elsewhere, and shows you the full path to your first investment
            property.
          </p>
          <Link href="/ai-house-hack-analysis" style={{
            color: '#6366F1',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            Analyze a house hack →
          </Link>
        </div>

        {/* Bottom CTA */}
        <div style={{
          borderTop: '0.5px solid rgba(127,119,221,0.2)',
          paddingTop: 48,
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            marginBottom: 24,
          }}>
            3 free analyses — no credit card needed
          </p>
          <Link href="/v2/analyze" style={{
            display: 'inline-block',
            background: '#6366F1',
            color: '#fff',
            padding: '14px 32px',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: 'none',
          }}>
            Start analyzing deals free →
          </Link>
        </div>
      </section>
    </main>
  )
}
