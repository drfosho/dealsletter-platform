import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI BRRRR Calculator — Analyze BRRRR Deals in 30 Seconds',
  description: 'Run any BRRRR deal through AI. Get ARV, refi waterfall, equity capture, and cash flow analysis instantly. Live market data included. Free to start.',
  keywords: [
    'AI BRRRR calculator',
    'BRRRR deal analyzer',
    'BRRRR analysis tool',
    'BRRRR real estate calculator',
    'buy rehab rent refinance repeat',
  ],
  alternates: {
    canonical: 'https://dealsletter.io/ai-brrrr-calculator',
  },
  openGraph: {
    title: 'AI BRRRR Calculator | Dealsletter',
    description: 'Analyze BRRRR deals with AI in 30 seconds.',
    url: 'https://dealsletter.io/ai-brrrr-calculator',
    type: 'website',
  },
}

export default function BRRRRPage() {
  return (
    <main style={{
      background: '#0d0d14',
      minHeight: '100vh',
      color: '#f0eeff',
      fontFamily: 'inherit',
    }}>
      <section style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 800,
          letterSpacing: '-1px',
          lineHeight: 1.15,
          marginBottom: 20,
          color: '#f0eeff',
        }}>
          AI BRRRR Calculator: Analyze Any BRRRR Deal in 30 Seconds
        </h1>
        <p style={{
          fontSize: 18,
          color: '#9994b8',
          lineHeight: 1.7,
          marginBottom: 32,
          maxWidth: 600,
          margin: '0 auto 32px',
        }}>
          Stop rebuilding the same BRRRR spreadsheet for every deal.
          Enter an address and get full equity capture, refi waterfall,
          and cash flow projections powered by live market data.
        </p>
        <Link href="/v2/analyze?strategy=brrrr" style={{
          display: 'inline-block',
          background: '#6366F1',
          color: '#fff',
          padding: '14px 32px',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 16,
          textDecoration: 'none',
        }}>
          Run a BRRRR analysis free →
        </Link>
      </section>

      <section style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '0 24px 80px',
      }}>

        <div style={{
          borderTop: '0.5px solid rgba(127,119,221,0.2)',
          paddingTop: 48,
          marginBottom: 48,
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#f0eeff',
            marginBottom: 16,
          }}>
            What Makes a Good BRRRR Deal?
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
          }}>
            A successful BRRRR deal comes down to one critical number:
            how much of your initial capital can you pull out at the refi
            stage? The goal is to recover 75 to 100 percent of your
            all-in costs — purchase price plus rehab — through a
            cash-out refinance based on the after-repair value. This
            requires buying at a significant discount to ARV, keeping
            rehab costs controlled, and finding a market where rents
            support the new mortgage payment after the refi. Markets
            with strong rental demand and distressed inventory — the
            Midwest and Southeast in particular — tend to produce the
            cleanest BRRRR numbers. Our AI pulls live comps from your
            target address to give you an accurate ARV range before
            you make an offer.
          </p>
        </div>

        <div style={{
          borderTop: '0.5px solid rgba(127,119,221,0.2)',
          paddingTop: 48,
          marginBottom: 48,
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#f0eeff',
            marginBottom: 16,
          }}>
            How Dealsletter Models the BRRRR Refi Waterfall
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
          }}>
            Most BRRRR calculators treat the refi as a simple percentage
            of ARV. Dealsletter goes deeper. We model your acquisition
            costs, total rehab budget, holding period carrying costs,
            and the resulting refi proceeds at 70 and 75 percent LTV.
            You see exactly how much capital is left in the deal after
            refinancing, what your new monthly payment looks like, and
            whether the property cash flows at market rents. The output
            includes a full equity capture summary so you know immediately
            whether this is a deal worth pursuing or one to pass on.
          </p>
        </div>

        <div style={{
          borderTop: '0.5px solid rgba(127,119,221,0.2)',
          paddingTop: 48,
          marginBottom: 48,
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#f0eeff',
            marginBottom: 16,
          }}>
            BRRRR vs Buy and Hold: Which Strategy Wins?
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
            marginBottom: 16,
          }}>
            BRRRR and traditional buy and hold both produce long-term
            rental income, but BRRRR offers the potential to recycle
            your capital into the next deal rather than leaving it
            locked in equity. The tradeoff is execution risk — rehab
            overruns and ARV misses can turn a great BRRRR into a
            mediocre buy and hold. Run both strategies on the same
            address to see which pencils out better for your market
            and risk tolerance.
          </p>
          <Link href="/ai-buy-and-hold-calculator" style={{
            color: '#6366F1',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            Compare with Buy &amp; Hold →
          </Link>
        </div>

        <div style={{
          borderTop: '0.5px solid rgba(127,119,221,0.2)',
          paddingTop: 48,
          textAlign: 'center',
        }}>
          <Link href="/ai-real-estate-deal-analyzer" style={{
            color: '#6b6690',
            fontSize: 14,
            textDecoration: 'none',
          }}>
            ← See all investment strategies
          </Link>
        </div>
      </section>
    </main>
  )
}
