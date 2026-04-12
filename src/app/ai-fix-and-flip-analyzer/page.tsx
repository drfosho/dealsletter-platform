import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Fix and Flip Analyzer — ARV, Rehab, and Profit in 30 Seconds',
  description: 'Analyze fix and flip deals instantly. Get ARV from live comps, model rehab budgets, holding costs, and net profit. Know if a flip pencils before you make an offer.',
  keywords: [
    'AI fix and flip analyzer',
    'fix and flip calculator',
    'ARV calculator',
    'house flip profit calculator',
    'fix and flip deal analyzer',
  ],
  alternates: {
    canonical: 'https://dealsletter.io/ai-fix-and-flip-analyzer',
  },
  openGraph: {
    title: 'AI Fix and Flip Analyzer | Dealsletter',
    description: 'Analyze fix and flip deals with live ARV in 30 seconds.',
    url: 'https://dealsletter.io/ai-fix-and-flip-analyzer',
    type: 'website',
  },
}

export default function FixAndFlipPage() {
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
          AI Fix and Flip Analyzer: Know If a Flip Pencils Before You Offer
        </h1>
        <p style={{
          fontSize: 18,
          color: '#9994b8',
          lineHeight: 1.7,
          marginBottom: 32,
          maxWidth: 600,
          margin: '0 auto 32px',
        }}>
          Get ARV from live comparable sales, model your full rehab
          and holding costs, and see your net profit margin — all
          before you spend a dollar.
        </p>
        <Link href="/v2/analyze?strategy=flip" style={{
          display: 'inline-block',
          background: '#6366F1',
          color: '#fff',
          padding: '14px 32px',
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 16,
          textDecoration: 'none',
        }}>
          Analyze a flip free →
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
            Why ARV Is Everything in a Flip
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
          }}>
            Your profit on a fix and flip is determined before you close —
            not after the rehab. The after-repair value sets the ceiling on
            what you can pay, which means an overestimated ARV will compress
            your margin even if you execute the rehab perfectly. Most
            investors rely on agent opinions or Zillow estimates that don't
            account for distressed sale discounts or recent market
            movement. Dealsletter pulls actual comparable sales within your
            target radius, filters out outliers, and gives you a low, mid,
            and high ARV range so you can underwrite conservatively and
            know your worst-case exit.
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
            What the Fix and Flip Analysis Covers
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
          }}>
            Enter the address, purchase price, rehab budget, and your
            expected holding period. Dealsletter calculates your
            all-in cost, models financing with hard money or private
            money loan terms, adds monthly carrying costs for the full
            hold, and deducts purchase and sell-side closing costs.
            The output is your projected net profit, profit margin as
            a percentage of ARV, annualized return, and a clear
            pass or flag signal based on whether the deal meets
            standard investor thresholds.
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
            Fix and Flip vs BRRRR: When to Flip and When to Hold
          </h2>
          <p style={{
            fontSize: 16,
            color: '#9994b8',
            lineHeight: 1.8,
            marginBottom: 16,
          }}>
            The decision between flipping and holding comes down to
            your capital position and market conditions. In high
            appreciation markets, holding after rehab can generate
            more wealth than a quick flip profit. In flat markets
            with strong rental demand, a BRRRR lets you recycle your
            capital while keeping the asset. Run both analyses on
            the same property to see which strategy produces the
            better risk-adjusted return for your situation.
          </p>
          <Link href="/ai-brrrr-calculator" style={{
            color: '#6366F1',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            Compare with BRRRR →
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
