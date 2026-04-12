import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Buy and Hold Calculator — Cash Flow, Cap Rate & ROI Analysis',
  description: 'Analyze long-term rental properties instantly. Get cash flow, cap rate, cash-on-cash return, and 30-year projections powered by live rent data. Free to start.',
  keywords: [
    'AI buy and hold calculator',
    'rental property cash flow calculator',
    'cap rate calculator',
    'buy and hold real estate analysis',
    'rental property ROI calculator',
  ],
  alternates: {
    canonical: 'https://dealsletter.io/ai-buy-and-hold-calculator',
  },
  openGraph: {
    title: 'AI Buy and Hold Calculator | Dealsletter',
    description: 'Analyze rental property cash flow and ROI in 30 seconds.',
    url: 'https://dealsletter.io/ai-buy-and-hold-calculator',
    type: 'website',
  },
}

export default function BuyAndHoldPage() {
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
          AI Buy and Hold Calculator: Cash Flow, Cap Rate, and ROI in Seconds
        </h1>
        <p style={{
          fontSize: 18,
          color: '#9994b8',
          lineHeight: 1.7,
          marginBottom: 32,
          maxWidth: 600,
          margin: '0 auto 32px',
        }}>
          Know if a rental property actually cash flows before you make
          an offer. Live rent estimates, expense modeling, and long-term
          return projections — no spreadsheet required.
        </p>
        <Link href="/v2/analyze?strategy=buyhold" style={{
          display: 'inline-block',
          background: '#6366F1',
          color: '#fff',
          padding: '14px 32px',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 16,
          textDecoration: 'none',
        }}>
          Analyze a rental free →
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
            The Key Numbers Every Rental Investor Needs
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
          }}>
            A rental property analysis comes down to four core metrics:
            monthly cash flow after all expenses, cap rate relative to
            market, cash-on-cash return on your down payment, and
            long-term equity build through appreciation and principal
            paydown. Most investors focus only on cash flow and miss
            the full picture. A property with thin monthly cash flow
            in a high-appreciation market can outperform a high cash
            flow property in a stagnant one over a 10-year hold.
            Dealsletter models all four simultaneously using live rent
            data from your target address so you can compare deals
            on equal footing.
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
            What the Buy and Hold Analysis Includes
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
          }}>
            Enter the address and purchase price and Dealsletter does
            the rest. We pull live rent estimates and comparable
            rentals from your market, model your mortgage payment
            at your loan terms, estimate property taxes from
            historical records, and apply standard vacancy and
            maintenance reserves. The output includes monthly
            and annual cash flow, gross and net cap rate,
            cash-on-cash return, and a 5, 10, and 30-year
            projection showing your total return including
            equity accumulation.
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
            Buy and Hold vs House Hack: Starting Your Rental Portfolio
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
            marginBottom: 16,
          }}>
            For investors buying their first rental property, house
            hacking a small multifamily often beats a straight
            buy and hold — you get owner-occupied financing rates
            with as little as 3.5 percent down, and rental income
            from other units offsets your mortgage immediately.
            Once you have equity and experience, traditional buy
            and hold with conventional financing becomes the
            scalable path. Run both to see which makes sense
            for your market and capital position.
          </p>
          <Link href="/ai-house-hack-analysis" style={{
            color: '#6366F1',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            Compare with House Hack →
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
