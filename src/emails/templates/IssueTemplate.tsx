import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Link,
  Button,
  Hr,
  Preview,
  Img,
} from '@react-email/components'
import { DealBreakdownIssue, DealProperty, IssueSponsor } from '@/data/deal-breakdown-issues'

interface IssueTemplateProps {
  issue: DealBreakdownIssue
}

const colors = {
  background: '#ffffff',
  cardBg: '#f8f7ff',
  cardBorder: '#e8e5ff',
  primary: '#6366F1',
  primaryLight: '#ede9ff',
  text: '#1a1830',
  textMuted: '#6b6690',
  textLight: '#9994b8',
  green: '#1D9E75',
  amber: '#EF9F27',
  red: '#e05252',
  border: '#e8e5ff',
}

function getScoreColor(score: number) {
  if (score >= 7) return colors.green
  if (score >= 5) return colors.amber
  return colors.red
}

function getScoreIcon(score: number) {
  if (score >= 7) return '✅'
  if (score >= 5) return '⚠️'
  return '❌'
}

function PropertyCard({ prop }: { prop: DealProperty }) {
  return (
    <Section style={{
      background: colors.cardBg,
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: 12,
      padding: '24px',
      marginBottom: 16,
    }}>
      {/* Tag */}
      <Text style={{
        display: 'inline-block',
        background: colors.primaryLight,
        color: colors.primary,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '1px',
        textTransform: 'uppercase' as const,
        padding: '3px 10px',
        borderRadius: 4,
        margin: '0 0 12px 0',
      }}>
        {prop.tag}
      </Text>

      {/* Address as link if url exists */}
      <Text style={{
        fontSize: 17,
        fontWeight: 700,
        color: colors.text,
        margin: '0 0 2px 0',
      }}>
        {prop.listingUrl ? (
          <Link
            href={prop.listingUrl}
            style={{
              color: colors.text,
              textDecoration: 'none',
            }}
          >
            {prop.address} ↗
          </Link>
        ) : prop.address}
      </Text>
      <Text style={{
        fontSize: 13,
        color: colors.textMuted,
        margin: '0 0 20px 0',
      }}>
        {prop.city}
      </Text>

      {/* Metrics grid — 3 across */}
      <Row style={{ marginBottom: 8 }}>
        <Column style={{ width: '33%' }}>
          <Text style={{
            fontSize: 10,
            color: colors.textLight,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            margin: '0 0 2px 0',
          }}>
            {prop.strategy === 'flip' ? 'ROI on Cash' : 'Cap Rate'}
          </Text>
          <Text style={{
            fontSize: 20,
            fontWeight: 700,
            color: colors.text,
            margin: '0 0 12px 0',
          }}>
            {prop.strategy === 'flip' ? `${prop.coc}%` : `${prop.capRate}%`}
          </Text>
        </Column>
        <Column style={{ width: '33%' }}>
          <Text style={{
            fontSize: 10,
            color: colors.textLight,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            margin: '0 0 2px 0',
          }}>
            {prop.strategy === 'flip' ? 'Net Profit' : 'Day 1 CoC'}
          </Text>
          <Text style={{
            fontSize: 20,
            fontWeight: 700,
            color: colors.text,
            margin: '0 0 12px 0',
          }}>
            {prop.strategy === 'flip'
              ? `$${(prop.annualCashFlow / 1000).toFixed(0)}K`
              : `${prop.coc}%`}
          </Text>
        </Column>
        <Column style={{ width: '33%' }}>
          <Text style={{
            fontSize: 10,
            color: colors.textLight,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            margin: '0 0 2px 0',
          }}>
            {prop.strategy === 'flip' ? 'Cash In' : 'Units'}
          </Text>
          <Text style={{
            fontSize: 20,
            fontWeight: 700,
            color: colors.text,
            margin: '0 0 12px 0',
          }}>
            {prop.strategy === 'flip'
              ? `$${(prop.cashRequired / 1000).toFixed(0)}K`
              : prop.units}
          </Text>
        </Column>
      </Row>

      {/* Second metrics row */}
      <Row style={{ marginBottom: 20 }}>
        <Column style={{ width: '33%' }}>
          <Text style={{
            fontSize: 10,
            color: colors.textLight,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            margin: '0 0 2px 0',
          }}>
            {prop.strategy === 'flip' ? 'List Price' : 'Cash Required'}
          </Text>
          <Text style={{
            fontSize: 15,
            fontWeight: 600,
            color: colors.textMuted,
            margin: 0,
          }}>
            {prop.strategy === 'flip'
              ? `$${(prop.price / 1000).toFixed(0)}K`
              : `$${(prop.cashRequired / 1000).toFixed(0)}K`}
          </Text>
        </Column>
        <Column style={{ width: '33%' }}>
          <Text style={{
            fontSize: 10,
            color: colors.textLight,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            margin: '0 0 2px 0',
          }}>
            {prop.strategy === 'flip' ? 'Total Price' : 'Annual CF'}
          </Text>
          <Text style={{
            fontSize: 15,
            fontWeight: 600,
            color: colors.textMuted,
            margin: 0,
          }}>
            {prop.strategy === 'flip'
              ? `$${(prop.price / 1000).toFixed(0)}K`
              : `$${(prop.annualCashFlow / 1000).toFixed(0)}K`}
          </Text>
        </Column>
        <Column style={{ width: '33%' }}>
          <Text style={{
            fontSize: 10,
            color: colors.textLight,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            margin: '0 0 2px 0',
          }}>
            Score
          </Text>
          <Text style={{
            fontSize: 15,
            fontWeight: 700,
            color: getScoreColor(prop.scoreValue),
            margin: 0,
          }}>
            {prop.score} {getScoreIcon(prop.scoreValue)}
          </Text>
        </Column>
      </Row>

      <Hr style={{
        border: 'none',
        borderTop: `1px solid ${colors.border}`,
        margin: '0 0 16px 0',
      }} />

      {/* Verdict */}
      <Text style={{
        fontSize: 13,
        color: colors.textMuted,
        fontStyle: 'italic',
        margin: '0 0 16px 0',
        lineHeight: 1.5,
      }}>
        {prop.verdict}
      </Text>

      {/* Opportunity */}
      {prop.opportunity && (
        <>
          <Text style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase' as const,
            color: colors.green,
            margin: '0 0 6px 0',
          }}>
            ✓ Opportunity
          </Text>
          <Text style={{
            fontSize: 13,
            color: colors.textMuted,
            lineHeight: 1.6,
            margin: '0 0 14px 0',
          }}>
            {prop.opportunity}
          </Text>
        </>
      )}

      {/* Risk */}
      {prop.risk && (
        <>
          <Text style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase' as const,
            color: '#e05252',
            margin: '0 0 6px 0',
          }}>
            ⚠ Risk
          </Text>
          <Text style={{
            fontSize: 13,
            color: colors.textMuted,
            lineHeight: 1.6,
            margin: '0 0 14px 0',
          }}>
            {prop.risk}
          </Text>
        </>
      )}

      {/* Full verdict */}
      {prop.fullVerdict && (
        <Text style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.text,
          lineHeight: 1.6,
          margin: '0 0 16px 0',
          padding: '10px 14px',
          background: colors.primaryLight,
          borderRadius: 6,
          borderLeft: `3px solid ${colors.primary}`,
        }}>
          Verdict: {prop.fullVerdict}
        </Text>
      )}

      {/* Property button */}
      {prop.listingUrl && (
        <Button
          href={prop.listingUrl}
          style={{
            background: colors.primary,
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 600,
            padding: '10px 20px',
            borderRadius: 6,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          View Property →
        </Button>
      )}
    </Section>
  )
}

function SponsorBlock({ sponsor }: { sponsor: IssueSponsor }) {
  return (
    <Section style={{
      background: '#fffdf5',
      border: '1px solid #f0e6c0',
      borderRadius: 12,
      padding: '24px',
      marginBottom: 16,
    }}>
      {/* Sponsor label */}
      <Text style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '1.5px',
        textTransform: 'uppercase' as const,
        color: '#b8860b',
        margin: '0 0 16px 0',
      }}>
        {sponsor.tag || 'SPONSORED'}
      </Text>

      {/* Logo if provided */}
      {sponsor.logo && (
        <Img
          src={sponsor.logo}
          alt={sponsor.name}
          width={520}
          style={{
            display: 'block',
            width: '100%',
            maxWidth: 520,
            height: 'auto',
            marginBottom: 16,
            borderRadius: 8,
          }}
        />
      )}

      {/* Headline */}
      <Text style={{
        fontSize: 16,
        fontWeight: 700,
        color: '#1a1830',
        margin: '0 0 8px 0',
        lineHeight: 1.4,
      }}>
        {sponsor.headline}
      </Text>

      {/* Body */}
      <Text style={{
        fontSize: 14,
        color: '#6b6690',
        lineHeight: 1.7,
        margin: '0 0 20px 0',
      }}>
        {sponsor.body}
      </Text>

      {/* CTA */}
      <Button
        href={sponsor.ctaUrl}
        style={{
          background: '#1a1830',
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 600,
          padding: '12px 24px',
          borderRadius: 8,
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        {sponsor.cta}
      </Button>
    </Section>
  )
}

export default function IssueTemplate({ issue }: IssueTemplateProps) {
  const issueUrl = `https://dealsletter.io/v2/deal-breakdown/${issue.slug}`

  return (
    <Html lang="en">
      <Head />
      <Preview>{issue.previewText}</Preview>
      <Body style={{
        background: '#f4f4f8',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        margin: 0,
        padding: '40px 0',
      }}>
        <Container style={{
          maxWidth: 600,
          margin: '0 auto',
        }}>

          {/* Header */}
          <Section style={{
            background: '#1a1830',
            borderRadius: '12px 12px 0 0',
            padding: '28px 32px',
          }}>
            <Row>
              <Column>
                <Img
                  src="https://xsiflgnnowyvkhxjwmuu.supabase.co/storage/v1/object/public/email-assets/wordmark-transparent.png"
                  alt="Dealsletter"
                  width={160}
                  height={32}
                  style={{
                    display: 'block',
                    marginBottom: 4,
                  }}
                />
                <Text style={{
                  fontSize: 12,
                  color: '#9994b8',
                  margin: '4px 0 0 0',
                }}>
                  AI-Powered Deal Analysis
                </Text>
              </Column>
              <Column style={{ textAlign: 'right' as const }}>
                <Text style={{
                  fontSize: 12,
                  color: '#6366F1',
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: '1px',
                  textTransform: 'uppercase' as const,
                }}>
                  Issue #{issue.issueNumber}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: '#6b6690',
                  margin: '2px 0 0 0',
                }}>
                  {issue.date}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Issue title card */}
          <Section style={{
            background: colors.primary,
            padding: '28px 32px',
          }}>
            <Heading style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 8px 0',
              lineHeight: 1.3,
              letterSpacing: '-0.4px',
            }}>
              {issue.title}
            </Heading>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.75)',
              margin: 0,
              lineHeight: 1.6,
            }}>
              {issue.previewText}
            </Text>
          </Section>

          {/* Main content */}
          <Section style={{
            background: colors.background,
            padding: '32px 32px 8px',
          }}>
            <Heading style={{
              fontSize: 13,
              fontWeight: 700,
              color: colors.textLight,
              letterSpacing: '1.5px',
              textTransform: 'uppercase' as const,
              margin: '0 0 20px 0',
            }}>
              This Week&apos;s Deals
            </Heading>

            {/* Property cards */}
            {issue.properties.map((prop, i) => (
              <PropertyCard key={i} prop={prop} />
            ))}
          </Section>

          {/* Sponsor block */}
          {issue.sponsor && (
            <Section style={{
              background: colors.background,
              padding: '0 32px 8px',
            }}>
              <SponsorBlock sponsor={issue.sponsor} />
            </Section>
          )}

          {/* Read full breakdown CTA */}
          <Section style={{
            background: colors.background,
            padding: '8px 32px 32px',
            textAlign: 'center' as const,
          }}>
            <Hr style={{
              border: 'none',
              borderTop: `1px solid ${colors.border}`,
              margin: '0 0 28px 0',
            }} />
            <Text style={{
              fontSize: 15,
              color: colors.textMuted,
              margin: '0 0 16px 0',
              lineHeight: 1.6,
            }}>
              Full underwriting, verdicts, and analysis for all {issue.properties.length} properties is on the site.
            </Text>
            <Button
              href={issueUrl}
              style={{
                background: colors.primary,
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 600,
                padding: '14px 32px',
                borderRadius: 8,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Read Full Breakdown →
            </Button>
          </Section>

          {/* Analyze CTA */}
          <Section style={{
            background: colors.primaryLight,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 12,
            padding: '24px 32px',
            textAlign: 'center' as const,
            marginBottom: 0,
          }}>
            <Text style={{
              fontSize: 15,
              color: colors.textMuted,
              margin: '0 0 16px 0',
              lineHeight: 1.6,
            }}>
              Analyze your own deals — BRRRR, Fix &amp; Flip, Buy &amp; Hold, House Hack. 3 free analyses/month.
            </Text>
            <Button
              href="https://dealsletter.io"
              style={{
                background: colors.primary,
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 600,
                padding: '14px 32px',
                borderRadius: 8,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Go to Dealsletter →
            </Button>
          </Section>

          {/* Footer */}
          <Section style={{
            background: '#1a1830',
            borderRadius: '0 0 12px 12px',
            padding: '24px 32px',
          }}>
            <Row>
              <Column>
                <Text style={{
                  fontSize: 12,
                  color: '#6b6690',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  © 2026 Dealsletter · Built by investors, for investors.
                  <br />
                  Not financial advice. Always do your own due diligence.
                </Text>
              </Column>
              <Column style={{ textAlign: 'right' as const }}>
                <Link
                  href="https://x.com/Dealsletter"
                  style={{
                    color: '#6b6690',
                    fontSize: 12,
                    textDecoration: 'none',
                    marginRight: 12,
                  }}
                >
                  Follow @Dealsletter on X
                </Link>
                <Link
                  href="https://dealsletter.io/v2/pricing"
                  style={{
                    color: '#6b6690',
                    fontSize: 12,
                    textDecoration: 'none',
                    marginRight: 12,
                  }}
                >
                  Upgrade
                </Link>
                <Link
                  href="{{{RESEND_UNSUBSCRIBE_URL}}}"
                  style={{
                    color: '#6b6690',
                    fontSize: 12,
                    textDecoration: 'none',
                  }}
                >
                  Unsubscribe
                </Link>
              </Column>
            </Row>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
