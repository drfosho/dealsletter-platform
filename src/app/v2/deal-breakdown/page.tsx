'use client'

import Link from 'next/link'
import NavBar from '@/components/v2/NavBar'
import Footer from '@/components/v2/Footer'
import {
  getLatestIssue,
} from '@/data/deal-breakdown-issues'

export default function DealBreakdownPage() {
  const latest = getLatestIssue()

  return (
    <div style={{
      background: '#0d0d14',
      minHeight: '100vh',
      color: '#f0eeff',
      fontFamily: 'inherit',
    }}>
      <NavBar />

      <main style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '60px 24px 80px',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(99,102,241,0.1)',
            border: '0.5px solid rgba(99,102,241,0.25)',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '1.5px',
            color: '#6366F1',
            textTransform: 'uppercase' as const,
            marginBottom: 16,
          }}>
            Deal Breakdown
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 800,
            letterSpacing: '-0.8px',
            color: '#f0eeff',
            marginBottom: 12,
            lineHeight: 1.2,
          }}>
            Real deals. Real numbers. No fluff.
          </h1>
          <p style={{
            fontSize: 16,
            color: '#6b6690',
            lineHeight: 1.7,
            maxWidth: 560,
          }}>
            Every issue breaks down 3-4 real investment properties —
            multifamily, fix &amp; flip, BRRRR, STR — with full
            underwriting, honest verdicts, and the numbers that
            actually matter.
          </p>
        </div>

        {/* Latest issue featured */}
        {latest && (
          <div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1.5px',
              color: '#4e4a6a',
              textTransform: 'uppercase' as const,
              marginBottom: 20,
            }}>
              Latest Issue
            </div>

            <Link
              href={`/v2/deal-breakdown/${latest.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: '#13121d',
                border: '0.5px solid rgba(127,119,221,0.2)',
                borderRadius: 16,
                padding: '32px',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.4)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(127,119,221,0.2)'
              }}
              >
                {/* Issue label */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#6366F1',
                  }}>
                    Issue #{latest.issueNumber}
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: '#4e4a6a',
                  }}>
                    {latest.date}
                  </span>
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#f0eeff',
                  letterSpacing: '-0.4px',
                  marginBottom: 12,
                  lineHeight: 1.3,
                }}>
                  {latest.title}
                </h2>

                <p style={{
                  fontSize: 15,
                  color: '#6b6690',
                  lineHeight: 1.6,
                  marginBottom: 28,
                }}>
                  {latest.previewText}
                </p>

                {/* Property cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 12,
                  marginBottom: 24,
                }}>
                  {latest.properties.map((prop, i) => (
                    <div key={i} style={{
                      background: 'rgba(13,13,20,0.6)',
                      border: '0.5px solid rgba(127,119,221,0.15)',
                      borderRadius: 10,
                      padding: '16px',
                    }}>
                      <div style={{
                        display: 'inline-block',
                        background: `${prop.tagColor}15`,
                        border: `0.5px solid ${prop.tagColor}40`,
                        borderRadius: 4,
                        padding: '2px 8px',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.8px',
                        color: prop.tagColor,
                        marginBottom: 10,
                      }}>
                        {prop.tag}
                      </div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#f0eeff',
                        marginBottom: 4,
                      }}>
                        {prop.address}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: '#4e4a6a',
                        marginBottom: 12,
                      }}>
                        {prop.city}
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 6,
                      }}>
                        {[
                          { label: 'Cap Rate', value: `${prop.capRate}%` },
                          { label: 'CoC', value: `${prop.coc}%` },
                          { label: 'Units', value: prop.units },
                          { label: 'Score', value: prop.score },
                        ].map((m, j) => (
                          <div key={j}>
                            <div style={{
                              fontSize: 10,
                              color: '#4e4a6a',
                              marginBottom: 2,
                            }}>
                              {m.label}
                            </div>
                            <div style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: '#9994b8',
                            }}>
                              {m.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  fontSize: 14,
                  color: '#6366F1',
                  fontWeight: 600,
                }}>
                  Read full breakdown →
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Past issues placeholder */}
        <div style={{
          marginTop: 48,
          paddingTop: 48,
          borderTop: '0.5px solid rgba(127,119,221,0.1)',
        }}>
          <p style={{
            fontSize: 14,
            color: '#4e4a6a',
            textAlign: 'center',
          }}>
            Past issues coming soon — 150 issues of deal analysis in the archive.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
