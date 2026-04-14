'use client'

import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import NavBar from '@/components/v2/NavBar'
import Footer from '@/components/v2/Footer'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getIssueBySlug } from '@/data/deal-breakdown-issues'

export default function IssueDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const issue = getIssueBySlug(slug)

  if (!issue) {
    notFound()
    return null
  }

  return (
    <div style={{
      background: '#0d0d14',
      minHeight: '100vh',
      color: '#f0eeff',
      fontFamily: 'inherit',
    }}>
      <NavBar />

      <main style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '60px 24px 80px',
      }}>
        {/* Back link */}
        <Link
          href="/v2/deal-breakdown"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
            color: '#4e4a6a',
            textDecoration: 'none',
            marginBottom: 32,
          }}
        >
          ← Deal Breakdown
        </Link>

        {/* Issue header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}>
            <span style={{
              background: 'rgba(99,102,241,0.1)',
              border: '0.5px solid rgba(99,102,241,0.25)',
              borderRadius: 20,
              padding: '4px 14px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1.5px',
              color: '#6366F1',
              textTransform: 'uppercase' as const,
            }}>
              Issue #{issue.issueNumber}
            </span>
            <span style={{
              fontSize: 13,
              color: '#4e4a6a',
            }}>
              {issue.date}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 800,
            letterSpacing: '-0.6px',
            color: '#f0eeff',
            lineHeight: 1.2,
            marginBottom: 16,
          }}>
            {issue.title}
          </h1>

          <p style={{
            fontSize: 16,
            color: '#6b6690',
            lineHeight: 1.7,
          }}>
            {issue.previewText}
          </p>
        </div>

        {/* Property summary cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 48,
        }}>
          {issue.properties.map((prop, i) => (
            <div key={i} style={{
              background: '#13121d',
              border: '0.5px solid rgba(127,119,221,0.2)',
              borderRadius: 12,
              padding: '20px',
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
                textTransform: 'uppercase' as const,
                marginBottom: 12,
              }}>
                {prop.tag}
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#f0eeff',
                marginBottom: 2,
              }}>
                {prop.address}
              </div>
              <div style={{
                fontSize: 12,
                color: '#4e4a6a',
                marginBottom: 14,
              }}>
                {prop.city}
              </div>
              <div style={{
                fontSize: 13,
                color: '#6b6690',
                marginBottom: 8,
              }}>
                {prop.units} units · {prop.capRate}% cap · {prop.coc}% CoC
              </div>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: prop.scoreValue >= 7
                  ? '#1D9E75'
                  : prop.scoreValue >= 5
                  ? '#EF9F27'
                  : '#f09595',
              }}>
                {prop.score} — {
                  prop.scoreValue >= 7
                    ? '✅'
                    : prop.scoreValue >= 5
                    ? '⚠️'
                    : '❌'
                }
              </div>

              {prop.opportunity && (
                <div style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '0.5px solid rgba(127,119,221,0.1)',
                }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase' as const,
                    color: '#1D9E75',
                    marginBottom: 4,
                  }}>
                    ✓ Opportunity
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: '#6b6690',
                    lineHeight: 1.6,
                  }}>
                    {prop.opportunity}
                  </div>
                </div>
              )}

              {prop.risk && (
                <div style={{ marginTop: 10 }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase' as const,
                    color: '#f09595',
                    marginBottom: 4,
                  }}>
                    ⚠ Risk
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: '#6b6690',
                    lineHeight: 1.6,
                  }}>
                    {prop.risk}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sponsor block */}
        {issue.sponsor && (
          <div style={{
            background: '#fffdf5',
            border: '1px solid #f0e6c0',
            borderRadius: 12,
            padding: '24px',
            marginBottom: 40,
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase' as const,
              color: '#b8860b',
              marginBottom: 14,
            }}>
              {issue.sponsor.tag || 'SPONSORED'}
            </div>

            {issue.sponsor.logo && (
              <img
                src={issue.sponsor.logo}
                alt={issue.sponsor.name}
                style={{
                  maxHeight: 40,
                  maxWidth: 140,
                  marginBottom: 14,
                  display: 'block',
                }}
              />
            )}

            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#f0eeff',
              marginBottom: 8,
              lineHeight: 1.4,
            }}>
              {issue.sponsor.headline}
            </div>

            <div style={{
              fontSize: 14,
              color: '#9994b8',
              lineHeight: 1.7,
              marginBottom: 20,
            }}>
              {issue.sponsor.body}
            </div>

            <a
              href={issue.sponsor.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#f0eeff',
                color: '#1a1830',
                fontSize: 13,
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              {issue.sponsor.cta}
            </a>
          </div>
        )}

        {/* Full content */}
        <div style={{
          fontSize: 16,
          lineHeight: 1.8,
          color: '#9994b8',
        }}
        className="deal-breakdown-content"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({children}) => (
                <h2 style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#f0eeff',
                  letterSpacing: '-0.4px',
                  marginTop: 48,
                  marginBottom: 16,
                  paddingTop: 48,
                  borderTop: '0.5px solid rgba(127,119,221,0.15)',
                }}>
                  {children}
                </h2>
              ),
              h3: ({children}) => (
                <h3 style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: '#f0eeff',
                  marginTop: 28,
                  marginBottom: 12,
                }}>
                  {children}
                </h3>
              ),
              p: ({children}) => (
                <p style={{
                  fontSize: 16,
                  color: '#9994b8',
                  lineHeight: 1.8,
                  marginBottom: 16,
                }}>
                  {children}
                </p>
              ),
              strong: ({children}) => (
                <strong style={{
                  color: '#f0eeff',
                  fontWeight: 700,
                }}>
                  {children}
                </strong>
              ),
              hr: () => (
                <hr style={{
                  border: 'none',
                  borderTop: '0.5px solid rgba(127,119,221,0.15)',
                  margin: '32px 0',
                }} />
              ),
              table: ({children}) => (
                <div style={{
                  overflowX: 'auto',
                  marginBottom: 24,
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 14,
                  }}>
                    {children}
                  </table>
                </div>
              ),
              thead: ({children}) => (
                <thead>
                  {children}
                </thead>
              ),
              tbody: ({children}) => (
                <tbody>
                  {children}
                </tbody>
              ),
              tr: ({children}) => (
                <tr style={{
                  borderBottom: '0.5px solid rgba(127,119,221,0.1)',
                }}>
                  {children}
                </tr>
              ),
              th: ({children}) => (
                <th style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '1px',
                  color: '#6366F1',
                  textTransform: 'uppercase',
                  borderBottom: '0.5px solid rgba(99,102,241,0.2)',
                  whiteSpace: 'nowrap',
                }}>
                  {children}
                </th>
              ),
              td: ({children}) => (
                <td style={{
                  padding: '10px 16px',
                  color: '#9994b8',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}>
                  {children}
                </td>
              ),
              li: ({children}) => (
                <li style={{
                  color: '#9994b8',
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 6,
                }}>
                  {children}
                </li>
              ),
              ul: ({children}) => (
                <ul style={{
                  paddingLeft: 20,
                  marginBottom: 16,
                }}>
                  {children}
                </ul>
              ),
              blockquote: ({children}) => (
                <blockquote style={{
                  borderLeft: '3px solid #6366F1',
                  paddingLeft: 16,
                  margin: '16px 0',
                  color: '#6b6690',
                  fontStyle: 'italic',
                }}>
                  {children}
                </blockquote>
              ),
            }}
          >
            {issue.content}
          </ReactMarkdown>
        </div>

        {/* Bottom CTA */}
        <div style={{
          marginTop: 64,
          padding: 32,
          background: 'rgba(99,102,241,0.06)',
          border: '0.5px solid rgba(99,102,241,0.2)',
          borderRadius: 16,
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#f0eeff',
            marginBottom: 8,
          }}>
            Run your own analysis
          </p>
          <p style={{
            fontSize: 15,
            color: '#6b6690',
            marginBottom: 24,
            lineHeight: 1.6,
          }}>
            Model any of these deals yourself — or analyze your own
            properties with live market data.
            <br />
            3 free analyses/month, no card needed.
          </p>
          <Link
            href="/v2/analyze"
            style={{
              display: 'inline-block',
              background: '#6366F1',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            Analyze a deal free →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
