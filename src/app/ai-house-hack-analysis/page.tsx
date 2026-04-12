import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI House Hack Analysis — Model Live-In Rental Income Scenarios',
  description: 'Analyze house hack deals instantly. Compare live-in vs full rental income, model ADU scenarios, and see your true monthly cost after tenant income. Free to start.',
  keywords: [
    'AI house hack analysis',
    'house hack calculator',
    'house hacking analyzer',
    'house hack ROI calculator',
    'live-in rental income calculator',
  ],
  alternates: {
    canonical: 'https://dealsletter.io/ai-house-hack-analysis',
  },
  openGraph: {
    title: 'AI House Hack Analysis | Dealsletter',
    description: 'Model house hack scenarios and rental income in 30 seconds.',
    url: 'https://dealsletter.io/ai-house-hack-analysis',
    type: 'website',
  },
}

export default function HouseHackPage() {
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
          AI House Hack Analysis: Let Tenants Pay Your Mortgage
        </h1>
        <p style={{
          fontSize: 18,
          color: '#9994b8',
          lineHeight: 1.7,
          marginBottom: 32,
          maxWidth: 600,
          margin: '0 auto 32px',
        }}>
          Model any house hack scenario — duplex, triplex, ADU,
          or room rental — and see your true monthly housing cost
          after tenant income. Live rent data included.
        </p>
        <Link href="/v2/analyze?strategy=househack" style={{
          display: 'inline-block',
          background: '#6366F1',
          color: '#fff',
          padding: '14px 32px',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 16,
          textDecoration: 'none',
        }}>
          Analyze a house hack free →
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
            Why House Hacking Is the Best First Investment
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
          }}>
            House hacking lets you access owner-occupied financing —
            FHA at 3.5 percent down or conventional at 5 percent —
            on a property that generates rental income. You live in
            one unit, rent out the others, and use that income to
            cover your mortgage. In strong rental markets, many house
            hackers live for free or even cash flow positive from
            day one. Beyond the immediate savings, you're building
            equity, learning property management firsthand, and
            positioning yourself for your next investment purchase
            once you've built reserves and experience.
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
            What the House Hack Analysis Models
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
          }}>
            Dealsletter pulls live rental comps for your target
            address and models your net monthly housing cost after
            rental income from non-owner units. You can compare
            your house hack cost against renting a comparable
            unit in the same market, see your monthly and annual
            savings, and project your equity position over 5
            and 10 years. For multifamily properties you can
            model individual unit rents and vacancy scenarios
            to see how the numbers change if one unit sits
            empty for a month or two.
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
            Moving Out: House Hack to Buy and Hold
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
            marginBottom: 16,
          }}>
            The natural progression of a house hack is moving out
            after one year and converting the property to a full
            buy and hold rental. At that point you have an
            owner-occupied loan rate on an investment property,
            a tenant base you already know, and equity from
            your down payment plus any appreciation. Run the
            buy and hold analysis on the same address to see
            what your cash flow looks like once you vacate
            your unit and rent it out.
          </p>
          <Link href="/ai-buy-and-hold-calculator" style={{
            color: '#6366F1',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            Model the full rental →
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
